const path = require('path');
const fs = require('fs');
const MultiStream = require('multistream');
const csvStream = require('csv');
const csvAsync = require('async-csv');
const glob = require('glob-promise');

const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

const FILEPATH = {
  airports: path.resolve(__dirname, '_supplementary-data/airports.csv'),
  flights: path.resolve(__dirname, 'raw/flightlist_*.csv'),
  outputRegions: path.resolve(__dirname, 'aggregated/data_regions.csv'),
  outputCountries: path.resolve(__dirname, 'aggregated/data_countries.csv'),
};

(async () => {
  // Track Time
  const startTime = Date.now();

  // Airport Data
  const airportsRaw = await fs.promises.readFile(FILEPATH.airports, 'utf8');
  const airports = await csvAsync.parse(airportsRaw, {
    comment: '#',
    columns: true,
    objname: 'ident',
  });

  // Statistic
  const statsRegions = {};
  const statsCountries = {};
  const months = new Set();
  let counterAll = 0;
  let counterWrite = 0;

  const b1 = new cliProgress.SingleBar({
    format: `CSV Converter |${colors.cyan('{bar}')}| {percentage}% || {value}/{total} Files || Lines: {counterAll} || Included: {counterWrite} || Speed: {speed} tI/s`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  // Parsing
  const parser = csvStream.parse({
    comment: '#',
    columns: true,
  });

  parser.on('data', (flight) => {
    b1.update({
      counterAll,
      counterWrite,
      speed: Math.round((counterAll / 1000) / ((Date.now() - startTime) / 1000)),
    });

    counterAll += 1;

    // Stayed at same airport
    if (flight.origin === flight.destination) {
      return;
    }

    // Was small airport
    if (airports[flight.origin]?.type !== 'large_airport' || airports[flight.destination]?.type !== 'large_airport') {
      return;
    }

    // Has been outside of EU (one)
    if (airports[flight.origin]?.continent !== 'EU' || airports[flight.destination]?.continent !== 'EU') {
      return;
    }

    const dateOfFlight = new Date(flight.day);

    const year = dateOfFlight.getFullYear();
    const month = dateOfFlight.getMonth() + 1; // Jan = 0
    const yearMonth = `${year}-${month}`;

    // Region
    const flightPathRegion = `${airports[flight.origin].iso_region}-${airports[flight.destination].iso_region}`;

    if (!statsRegions[flightPathRegion]) {
      statsRegions[flightPathRegion] = {
        origin: airports[flight.origin].iso_region,
        destination: airports[flight.destination].iso_region,
        [yearMonth]: 1,
      };
    } else if (!statsRegions[flightPathRegion][yearMonth]) {
      statsRegions[flightPathRegion][yearMonth] = 1;
    } else {
      statsRegions[flightPathRegion][yearMonth] += 1;
    }

    // Country
    const flightPathCountry = `${airports[flight.origin].iso_country}-${airports[flight.destination].iso_country}`;

    if (!statsCountries[flightPathCountry]) {
      statsCountries[flightPathCountry] = {
        origin: airports[flight.origin].iso_country,
        destination: airports[flight.destination].iso_country,
        [yearMonth]: 1,
      };
    } else if (!statsCountries[flightPathCountry][yearMonth]) {
      statsCountries[flightPathCountry][yearMonth] = 1;
    } else {
      statsCountries[flightPathCountry][yearMonth] += 1;
    }

    months.add(yearMonth);

    counterWrite += 1;
  });

  parser.on('error', (err) => {
    console.error(err.message);
  });

  parser.on('end', () => {
    b1.stop();
  });

  // Files
  const flightFiles = await glob(FILEPATH.flights);

  // reduce file number for testing
  // const numberOfFiles = 3;
  // for (let i = flightFiles.length; i > numberOfFiles; i -= 1) {
  //   flightFiles.pop();
  // }

  b1.start(flightFiles.length, 0, {
    counterAll,
    counterWrite,
  });

  const flightFileStreams = flightFiles.map((file) => function startStream() {
    b1.increment({
      counterAll,
      counterWrite,
    });
    return fs.createReadStream(file);
  });

  new MultiStream(flightFileStreams).pipe(parser).on('end', () => {
    const columns = {
      origin: 'origin',
      destination: 'destination',
    };

    const sortedMonths = Array.from(months).sort();

    sortedMonths.forEach((month) => {
      columns[month] = month;
    });

    [
      [statsRegions, FILEPATH.outputRegions],
      [statsCountries, FILEPATH.outputCountries],
    ].forEach((stats) => {
      // nulllify all empty values
      const values = Object.values(stats[0]).map((datum) => {
        const datumWithZeros = {};
        sortedMonths.forEach((month) => {
          if (!datum[month]) {
            datumWithZeros[month] = 0;
          }
        });

        return { ...datum, ...datumWithZeros };
      });

      // Write
      const writeStream = fs.createWriteStream(stats[1]);
      const csvData = csvStream.stringify(values, {
        header: true,
        columns,
      });

      csvData.pipe(writeStream);
    });
  });
})();
