/* eslint-env browser */

import * as d3 from 'd3';

import getCssVar from './helper';

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

  const yearweek = `${year}-${week}`;
  const matrix = jsonData.yearMonth[yearweek];

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
  const jsonData = await d3.json('data/flights_countries.json');
  const weekslider = document.querySelector('[data-js="weekslider"');

  // Generate Visualization by calculating week+year and generating Chord-Diagramm
  async function GenerateVisualization() {
    let week = weekslider.value;
    let year = 2019;

    if (weekslider.value > 52) {
      week -= 52;
      year = 2020;
    }
    if (weekslider.value > 105) {
      week -= 53;
      year = 2021;
    }
    if (weekslider.value > 157) {
      week -= 52;
      year = 2022;
    }

    // add 0 to 1-9
    if (week < 10) {
      week = `0${week}`;
    }

    generateChord(jsonData, year, week);

    weekindicator.innerHTML = week;
    yearindicator.innerHTML = year;
  }

  // Generate Visualization when website is loaded
  GenerateVisualization();

  // Generate Visualization when slider is used
  weekslider.addEventListener('input', () => {
    GenerateVisualization();
  });
})();
