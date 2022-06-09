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
  output: path.resolve(__dirname, 'aggregated/data.csv'),
};

(async () => {
  // Airport Data
  const airportsRaw = await fs.promises.readFile(FILEPATH.airports, 'utf8');
  const airports = await csvAsync.parse(airportsRaw, {
    comment: '#',
    columns: true,
    objname: 'ident',
  });

  // Statistic
  const statistic = [];
  let counterAll = 0;
  let counterWrite = 0;

  const b1 = new cliProgress.SingleBar({
    format: `CSV Converter |${colors.cyan('{bar}')}| {percentage}% || {value}/{total} Files || Read Lines: {counterAll} || Included Items: {counterWrite}`,
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

    const index = statistic.findIndex((entry) => {
      if (
        entry.year === year
        && entry.month === month
        && entry.origin === flight.origin
        && entry.destination === flight.destination
      ) {
        return true;
      }
      return false;
    });

    if (index !== -1) {
      statistic[index].numberOfFlights += 1;
    } else {
      statistic.push({
        year,
        month,
        origin: flight.origin,
        destination: flight.destination,
        numberOfFlights: 1,
      });
    }

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
  // const numberOfFiles = 2;
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
    // Write
    const writeStream = fs.createWriteStream(FILEPATH.output);
    const csvData = csvStream.stringify(statistic, {
      header: true,
      columns: {
        year: 'year',
        month: 'month',
        origin: 'origin',
        destination: 'destination',
        numberOfFlights: 'number_of_flights',
      },
    });

    csvData.pipe(writeStream);
  });
})();
