const path = require('path');
const fs = require('fs').promises;
const csv = require('async-csv');
const glob = require('glob-promise');

const FILEPATH = {
  airports: path.resolve(__dirname, '_supplementary-data/airports.csv'),
  flights: path.resolve(__dirname, 'raw/flightlist_*.csv'),
};

(async () => {
  const airportsRaw = await fs.readFile(FILEPATH.airports, 'utf8');
  const airports = await csv.parse(airportsRaw, {
    comment: '#',
    columns: true,
    objname: 'ident',
  });

  const flightFiles = await glob(FILEPATH.flights);

  // flightFiles.forEach(async (flightFile) => {
  //   console.log(flightFile);
  //   const flightsRaw = await fs.readFile(flightFile, 'utf8');
  //   const flights = await csv.parse(airportsRaw, {
  //     comment: '#',
  //     to: 4,
  //   });

  //   console.log(flights);
  //   break;
  // });

  const statistic = {};

  const flightsRaw = await fs.readFile(flightFiles[0], 'utf8');
  const flights = await csv.parse(flightsRaw, {
    comment: '#',
    columns: true,
  });

  console.log('done parsing', flightFiles[0]);

  flights.forEach((flight) => {
    console.log(flight.origin, flight.destination);

    if (airports[flight.origin]?.continent !== 'EU' && airports[flight.destination]?.continent !== 'EU') {
      return;
    }

    if (flight.day in statistic) {
      statistic[flight.day] += 1;
    } else {
      statistic[flight.day] = 1;
    }
  });

  console.log(statistic);
})();
