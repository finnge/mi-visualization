const assert = require('node:assert').strict;
const path = require('path');
const fs = require('fs');
const csvAsync = require('async-csv');

const FILEPATH = {
  flightRegionsCsv: path.resolve(__dirname, 'aggregated/flights_regions.csv'),
  flightCountriesCsv: path.resolve(__dirname, 'aggregated/flights_countries.csv'),
  flightCountriesJson: path.resolve(__dirname, 'aggregated/flights_countries.csv'),
};

(async () => {
  try {
    // Flight Countries Data
    const flightCountriesCsvRaw = await fs.promises.readFile(FILEPATH.flightCountriesCsv, 'utf8');
    const flightCountriesCsv = await csvAsync.parse(flightCountriesCsvRaw, {
      comment: '#',
      columns: true,
    });

    assert.deepEqual([[[1, 2, 3]], 4, 5], [[[1, 2, '3']], 4, 5]);

    console.log('success');
  } catch (e) {
    console.error(e);
  }
})();
