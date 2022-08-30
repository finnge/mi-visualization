const path = require('path');
const fs = require('fs');
const csv = require('async-csv');

const FILEPATH = {
  inputRegions: path.resolve(__dirname, 'aggregated/flights_regions.csv'),
  inputCountries: path.resolve(__dirname, 'aggregated/flights_countries.csv'),
  outputData: path.resolve(__dirname, 'output/flights_countries.json'),
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

  // get YearWeek
  const headers = Object.keys(countries[0]);
  const listOfYearWeeks = headers.slice(2);

  // // empty country
  // listOfCountries.push('--');
  // countries.push((() => {
  //   const obj = {
  //     origin: '--',
  //     destination: '--',
  //   };

  //   const sums = {};

  //   listOfYearWeeks.forEach((weekYear) => {
  //     sums[weekYear] = 0;

  //     countries.forEach((data) => {
  //       sums[weekYear] += parseInt(data[weekYear], 10);
  //     });
  //   });

  //   const maxValue = Math.max(...Object.values(sums));

  //   listOfYearWeeks.forEach((weekYear) => {
  //     obj[weekYear] = maxValue - sums[weekYear];
  //   });

  //   return obj;
  // })());

  // Output
  const output = {
    yearMonth: {},
    countries: listOfCountries,
  };

  // insert values
  listOfYearWeeks.forEach((weekYear) => {
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

      matrix[originIndex][destinationIndex] = parseInt(country[weekYear], 10);
    });

    output.yearMonth[weekYear] = matrix;
  });

  fs.promises.writeFile(FILEPATH.outputData, JSON.stringify(output, null, true));
})();
