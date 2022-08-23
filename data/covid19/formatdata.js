const path = require('path');
const fs = require('fs');
const csv = require('async-csv');

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
  inputCovid19: path.resolve(__dirname, 'raw/data.csv'),
  outputData: path.resolve(__dirname, 'covid19.json'),
};

(async () => {
  const dataRaw = await fs.promises.readFile(FILEPATH.inputCovid19, 'utf8');
  const data = await csv.parse(dataRaw, {
    comment: '#',
    columns: true,
  });

  // Has been outside of EU+EWR+CH (both)
  const countriesToInclude = [
    'BE', 'BG', 'DK', 'DE', 'EE', 'FI', 'FR', 'GR', 'IE', 'IT',
    'HR', 'LV', 'LT', 'LU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO',
    'SA', 'SK', 'SI', 'ES', 'CZ', 'HU', 'CY', 'LI', 'IS', 'NO',
    'CH',
  ];

  // filter data
  const filteredData = data.filter((el) => countriesToInclude.includes(el.geoId));

  const formattedData = {};
  const popData2020 = {};

  filteredData.forEach((el) => {
    const date = new Date(`${el.year}-${el.month}-${el.day}`);
    const yearWeek = date.getYearWeekNumber();

    if (popData2020[el.geoId] === undefined) {
      popData2020[el.geoId] = el.popData2020;
    }

    if (formattedData[yearWeek] === undefined) {
      formattedData[yearWeek] = {};
    }

    if (formattedData[yearWeek][el.geoId] === undefined) {
      formattedData[yearWeek][el.geoId] = {
        cases: 0,
        deaths: 0,
      };
    }

    formattedData[yearWeek][el.geoId].cases += parseInt(el.cases, 10);
    formattedData[yearWeek][el.geoId].deaths += parseInt(el.deaths, 10);
  });

  // filteredData.sort();

  // Output
  const output = {
    yearMonth: formattedData,
    countries: popData2020,
  };

  fs.promises.writeFile(FILEPATH.outputData, JSON.stringify(output, null, 2));
})();
