const path = require('path');
const fs = require('fs');
const csv = require('async-csv');
const { FILE } = require('dns');

const FILEPATH = {
  inputRegions: path.resolve(__dirname, 'aggregated/flights_regions.csv'),
  inputCountries: path.resolve(__dirname, 'aggregated/flights_countries.csv'),
  outputData: path.resolve(__dirname, 'aggregated/flights_countries.json'),
};

(async () => {
  const countriesRaw = await fs.promises.readFile(FILEPATH.inputCountries, 'utf8');
  const countries = await csv.parse(countriesRaw, {
    comment: '#',
    columns: true,
  });

  // get countries
  const listOfCountries = [];
  countries.forEach((country) => {
    if (!listOfCountries.includes(country.origin)) {
      listOfCountries.push(country.origin);
    }

    if (!listOfCountries.includes(country.destination)) {
      listOfCountries.push(country.destination);
    }
  });
  listOfCountries.sort();

  // insert values
  const matrix = new Array(listOfCountries.length);
  countries.forEach((country) => {
    const originIndex = listOfCountries.indexOf(country.origin);
    const destinationIndex = listOfCountries.indexOf(country.destination);

    if (matrix[originIndex] === undefined) {
      matrix[originIndex] = new Array(listOfCountries.length).fill(0);
    }

    // if from or continent to continent do 0
    if (country.origin.startsWith('_') || country.destination.startsWith('_')) {
      return;
    }

    matrix[originIndex][destinationIndex] = parseInt(country['2019-03'], 10);
  });

  // Stringify
  const output = {
    yearMonth: {
      '2019-03': matrix,
    },
    countries: listOfCountries,
  };

  fs.promises.writeFile(FILEPATH.outputData, JSON.stringify(output, null));
})();
