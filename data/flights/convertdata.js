const path = require('path');
const fs = require('fs');
const MultiStream = require('multistream');
const csvStream = require('csv');
const csvAsync = require('async-csv');
const glob = require('glob-promise');

const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

function timeConvert(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

/* eslint-disable no-extend-native */
// Get ISO week number for given date
// @see https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
Date.prototype.getYearWeekNumber = function getYearWeekNumber() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return `${d.getUTCFullYear()}-${weekNo < 10 ? `0${weekNo}` : weekNo}`;
};
/* eslint-enable no-extend-native */

const FILEPATH = {
  airports: path.resolve(__dirname, '_supplementary-data/airports.csv'),
  flights: path.resolve(__dirname, 'raw/flightlist_*.csv'),
  outputRegions: path.resolve(__dirname, 'aggregated/flights_regions.csv'),
  outputCountries: path.resolve(__dirname, 'aggregated/flights_countries.csv'),
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
  const calWeeks = new Set();
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
    // if (
    //  airports[flight.origin]?.continent !== 'EU'
    //  || airports[flight.destination]?.continent !== 'EU'
    //  ) {
    //   return;
    // }

    let origin = `_${airports[flight.origin].continent}`;
    let destination = `_${airports[flight.destination].continent}`;

    const dateOfFlight = new Date(flight.day);

    const yearCalWeek = dateOfFlight.getYearWeekNumber();

    // Region
    if (airports[flight.origin].continent === 'EU') {
      origin = `${airports[flight.origin].iso_region}`;
    }
    if (airports[flight.destination].continent === 'EU') {
      destination = `${airports[flight.destination].iso_region}`;
    }
    const flightPathRegion = `${origin}--${destination}`;

    if (!statsRegions[flightPathRegion]) {
      statsRegions[flightPathRegion] = {
        origin,
        destination,
        [yearCalWeek]: 1,
      };
    } else if (!statsRegions[flightPathRegion][yearCalWeek]) {
      statsRegions[flightPathRegion][yearCalWeek] = 1;
    } else {
      statsRegions[flightPathRegion][yearCalWeek] += 1;
    }

    // Country
    if (airports[flight.origin].continent === 'EU') {
      origin = `${airports[flight.origin].iso_country}`;
    }
    if (airports[flight.destination].continent === 'EU') {
      destination = `${airports[flight.destination].iso_country}`;
    }
    const flightPathCountry = `${origin}--${destination}`;

    if (!statsCountries[flightPathCountry]) {
      statsCountries[flightPathCountry] = {
        origin,
        destination,
        [yearCalWeek]: 1,
      };
    } else if (!statsCountries[flightPathCountry][yearCalWeek]) {
      statsCountries[flightPathCountry][yearCalWeek] = 1;
    } else {
      statsCountries[flightPathCountry][yearCalWeek] += 1;
    }

    calWeeks.add(yearCalWeek);

    counterWrite += 1;
  });

  parser.on('error', (err) => {
    console.error(err.message);
  });

  // Files
  const flightFiles = await glob(FILEPATH.flights);

  // reduce file number for testing
  // const numberOfFiles = 2;
  // for (let i = flightFiles.length; i > numberOfFiles; i -= 1) {
  //   flightFiles.pop();
  // }

  b1.start(flightFiles.length, -1, {
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
    b1.increment();
    b1.stop();

    const columns = {
      origin: 'origin',
      destination: 'destination',
    };

    const sortedCalWeeks = Array.from(calWeeks).sort();

    sortedCalWeeks.forEach((month) => {
      columns[month] = month;
    });

    [
      [statsRegions, FILEPATH.outputRegions],
      [statsCountries, FILEPATH.outputCountries],
    ].forEach((stats) => {
      // nulllify all empty values
      const values = Object.values(stats[0]).map((datum) => {
        const datumWithZeros = {};
        sortedCalWeeks.forEach((month) => {
          if (!datum[month]) {
            datumWithZeros[month] = 0;
          }
        });

        return { ...datum, ...datumWithZeros };
      });

      // sort rows
      values.sort((a, b) => a.origin.localeCompare(b.origin));

      // Write
      const writeStream = fs.createWriteStream(stats[1]);
      const csvData = csvStream.stringify(values, {
        header: true,
        columns,
      });

      csvData.pipe(writeStream).on('finish', () => {
        console.log(`Done [${timeConvert((Date.now() - startTime) / 1000)}s]`);
      });
    });
  });
})();
