/* eslint-env browser */

import * as d3 from 'd3';

import getCssVar from './helper';

const graphWrapper = d3.select('[ data-js-graph]');

const SETTING = {
  size: 440,
  outerBorder: 10,
};

// SVG Area
const svg = graphWrapper.append('svg')
  .attr('width', SETTING.size)
  .attr('height', SETTING.size)
  .append('g')
  .attr('transform', `translate(${SETTING.size / 2},${SETTING.size / 2})`);

// create a matrix
const matrix = [
  [0, 5871, 8916, 2868],
  [1951, 0, 2060, 6171],
  [8010, 16145, 0, 8045],
  [1013, 990, 940, 0],
];

// 4 groups, so create a vector of 4 colors
const colors = ['#440154ff', '#31668dff', '#37b578ff', '#fde725ff'];

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
  .style('fill', (d, i) => colors[i])
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
  .style('fill', (d) => (colors[d.source.index])) // colors depend on the source group. Change to target otherwise.
  .style('stroke', 'black');
