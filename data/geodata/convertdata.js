import { centroid, distance } from '@turf/turf';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import csv from 'async-csv';

const FILE = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILE);

const FILEPATH = {
  countryCodes: path.resolve(DIRNAME, 'raw/country-codes.csv'),
};

// GeoJSON
import countries from './raw/countries.geojson' assert {type: 'json'};


(async () => {
  // Country Codes
  const countryCodesRaw = await fs.promises.readFile(FILEPATH.countryCodes, 'utf8');
  const countryCodes = await csv.parse(countryCodesRaw, {
    comment: '#',
    columns: true,
    objname: 'alpha-3',
  });


  // Center of Polygon
  const midPoints = {};
  countries.features.forEach(feature => {
    midPoints[feature.properties.ISO_A3] = centroid(feature.geometry);
  });

  // Filter to just Europe Countries
  Object.entries(midPoints).forEach(([key, value]) => {
    if(countryCodes[key]?.region !== 'Europe') {
      delete midPoints[key];
      return;
    }
  });

  const distances = {};
  Object.entries(midPoints).forEach(([key, value]) => {
    distances[key] = new Map();

    Object.entries(midPoints).forEach(([_key, _value]) => {
      if (key === _key) {
        return;
      }
      distances[key][_key] = distance(value.geometry.coordinates, _value.geometry.coordinates, {
        units: 'kilometers',
      })
    });
  });

  console.log(distances);


})();
