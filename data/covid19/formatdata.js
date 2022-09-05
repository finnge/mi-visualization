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
  inputCovid19Swiss: path.resolve(__dirname, 'raw/data-swiss.csv'),
  outputData: path.resolve(__dirname, 'output/covid19.json'),
};

(async () => {
  const dataRaw = await fs.promises.readFile(FILEPATH.inputCovid19, 'utf8');
  const dataRawSwiss = await fs.promises.readFile(FILEPATH.inputCovid19Swiss, 'utf8');
  let data = await csv.parse(dataRaw, {
    comment: '#',
    columns: true,
  });
  const dataSwiss = await csv.parse(dataRawSwiss, {
    comment: '#',
    columns: true,
  });

  data = data.concat(dataSwiss);

  // Has been outside of EU+EWR+CH (both)
  const countriesToInclude = [
    'BE', 'BG', 'DK', 'DE', 'EE', 'FI', 'FR', 'EL', 'IE', 'IT',
    'HR', 'LV', 'LT', 'LU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO',
    'SE', 'SK', 'SI', 'ES', 'CZ', 'HU', 'CY', 'LI', 'IS', 'NO',
    'CH',
  ];

  // filter data
  const filteredData = data.filter((el) => countriesToInclude.includes(el.geoId));

  // calc incidence
  const filteredDataWithIncidence = filteredData.map((el) => {
    const newEl = el;

    const dataOfLast7Days = filteredData.filter((pastEl) => {
      if (pastEl.geoId !== el.geoI) {
        return false;
      }

      const pastDate = new Date(`${pastEl.year}-${pastEl.month}-${pastEl.day}`);
      const date = new Date(`${el.year}-${el.month}-${el.day}`);

      const diffTime = Math.abs(date - pastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        return true;
      }

      return false;
    });

    let casesOfLast7Days = el.cases;

    dataOfLast7Days.forEach((pastEl) => {
      casesOfLast7Days += parseInt(pastEl.cases, 10);
    });

    newEl.incidence = (casesOfLast7Days / el.popData2020) * 100000;

    return newEl;
  });

  // format data
  const formattedData = {};
  const popData2020 = {};

  filteredDataWithIncidence.forEach((el) => {
    const date = new Date(`${el.year}-${el.month}-${el.day}`);
    const yearWeek = date.getYearWeekNumber();

    // Die Bezeichnung EL (Griechenland) wird durch die ISO Abkürzung GR ersetzt

    if (popData2020[(el.geoId === 'EL') ? 'GR' : el.geoId] === undefined) {
      popData2020[(el.geoId === 'EL') ? 'GR' : el.geoId] = el.popData2020;
    }

    if (formattedData[yearWeek] === undefined) {
      formattedData[yearWeek] = {};
    }

    if (formattedData[yearWeek][(el.geoId === 'EL') ? 'GR' : el.geoId] === undefined) {
      formattedData[yearWeek][(el.geoId === 'EL') ? 'GR' : el.geoId] = {
        cases: 0,
        deaths: 0,
        incidence: [],
      };
    }

    formattedData[yearWeek][(el.geoId === 'EL') ? 'GR' : el.geoId].cases += parseInt(el.cases, 10);
    formattedData[yearWeek][(el.geoId === 'EL') ? 'GR' : el.geoId].deaths += parseInt(el.deaths, 10);
    formattedData[yearWeek][(el.geoId === 'EL') ? 'GR' : el.geoId].incidence.push(el.incidence);
  });

  // 7 day incidence average for week
  Object.keys(formattedData).forEach((key) => {
    const el = formattedData[key];

    Object.keys(el).forEach((countryKey) => {
      const num = formattedData[key][countryKey].incidence.length;

      let addedIncidence = 0;

      formattedData[key][countryKey].incidence.forEach((incidence) => {
        addedIncidence += incidence;
      });

      formattedData[key][countryKey].incidence = Math.round((addedIncidence / num) * 100) / 100;
    });
  });

  // Output
  const output = {
    yearWeek: formattedData,
    countries: popData2020,
  };

  fs.promises.writeFile(FILEPATH.outputData, JSON.stringify(output, null, 2));
})();
