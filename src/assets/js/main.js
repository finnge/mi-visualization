/* eslint-env browser */

import * as d3 from 'd3';

import getCssVar from './helper';

/* eslint-disable no-extend-native */
/**
 * Calculates ISO week number of given date
 * @see https://stackoverflow.com/a/6117889
 * @author RobG <https://stackoverflow.com/users/257182/robg>
 * @returns String in Format YYYY-WW
 */
Date.prototype.getYearWeekNumber = function getYearWeekNumber() {
/* eslint-enable no-extend-native */

  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return `${d.getUTCFullYear()}-${weekNo < 10 ? `0${weekNo}` : weekNo}`;
};

/**
 * Constructor Function to generate the start date object
 * of an ISO Week (Monday) through ISO Week Number
 * @see https://stackoverflow.com/a/16591175
 * @author Elle <https://stackoverflow.com/users/1837457/elle>
 * @param {int} w Number of ISO Week
 * @param {int} y Number of Year
 * @returns Date Object of beginning of week (Monday)
 */
Date.getDateOfISOWeek = function getDateOfISOWeek(w, y) {
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
};

async function generateChord(jsonData, year, week) {
  // delete existing diagram
  document.getElementById('chorddiagram').innerHTML = '';

  const graphWrapper = d3.select('[ data-js-graph]');

  const SETTING = {
    size: 750,
    outerBorder: 10,
  };

  // SVG Area
  const svg = graphWrapper.append('svg')
    .attr('width', SETTING.size)
    .attr('height', SETTING.size)
    .append('g')
    .attr('transform', `translate(${SETTING.size / 2},${SETTING.size / 2})`);

  const yearWeek = `${year}-${week}`;
  const matrix = jsonData.yearMonth[yearWeek];

  // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
  const res = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)(matrix);

  // add the groups on the outer part of the circle
  svg
    .datum(res)
    .append('g')
    .selectAll('g')
    .data((d) => d.groups)
    .enter()
    .append('g')
    .append('path')
    .style('fill', () => getCssVar('--c-prim-interactive'))
    .style('stroke', 'black')
    .attr('d', d3.arc()
      .innerRadius((SETTING.size / 2) - SETTING.outerBorder)
      .outerRadius(SETTING.size / 2));

  // Add the links between groups
  svg
    .datum(res)
    .append('g')
    .selectAll('path')
    .data((d) => d)
    .enter()
    .append('path')
    .attr('d', d3.ribbon()
      .radius((SETTING.size / 2) - SETTING.outerBorder))
    .style('fill', () => getCssVar('--c-prim-interactive')) // colors depend on the source group. Change to target otherwise.
    .style('stroke', 'black');
}

(async () => {
  // load data and select components
  const flightCountriesJson = await d3.json('data/flights_countries.json');
  const slider = document.querySelector('[data-js-slider]');
  const weekIndicator = document.querySelector('[data-js-week-indicator]');

  // Generate Visualization by calculating week+year and generating Chord-Diagramm
  async function generateVisualization() {
    let week = slider.value;
    let year = 2019;

    if (slider.value > 52) {
      week -= 52;
      year = 2020;
    }
    if (slider.value > 105) {
      week -= 53;
      year = 2021;
    }
    if (slider.value > 157) {
      week -= 52;
      year = 2022;
    }

    // add 0 to 1-9
    if (week < 10) {
      week = `0${week}`;
    }

    generateChord(flightCountriesJson, year, week);

    weekIndicator.innerHTML = `${year} - KW ${week}`;
  }

  // Generate Visualization when website is loaded
  generateVisualization();

  // Generate Visualization when slider is used
  slider.addEventListener('input', () => {
    generateVisualization();
  });

  // set the dimensions and margins of the graph
  const margin = {
    top: 10, right: 30, bottom: 30, left: 50,
  };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const sumData = Object.entries(flightCountriesJson.totalNumOfFlights).map((entry) => ({
    date: entry[0],
    value: entry[1],
  }));

  // append the svg object to the body of the page
  const svg = d3.select('[data-js-timeline]')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Add X axis --> it is a date format
  const x = d3.scaleTime()
    .domain(d3.extent(sumData, (d) => d.date))
    .range([0, width]);
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(sumData, (d) => +d.value)])
    .range([height, 0]);
  svg.append('g')
    .call(d3.axisLeft(y));

  // Add the area
  svg.append('path')
    .datum(sumData)
    .attr('fill', '#cce5df')
    .attr('stroke', '#69b3a2')
    .attr('stroke-width', 1.5)
    .attr('d', d3.area()
      .x((d) => x(d.date))
      .y0(y(0))
      .y1((d) => y(d.value)));
})();
