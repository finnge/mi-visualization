import * as d3 from 'd3';

const graphWrapper = d3.select('[ data-js-graph]');

const margin = {
  top: 10, right: 40, bottom: 30, left: 30,
};
const width = 450 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const graphSvg = graphWrapper
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  // translate this svg element to leave some margin.
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// X scale and Axis
const x = d3.scaleLinear()
  .domain([0, 100]) // This is the min and the max of the data: 0 to 100 if percentages
  .range([0, width]); // This is the corresponding value I want in Pixel
graphSvg
  .append('g')
  .attr('transform', `translate(0,${height})`)
  .call(d3.axisBottom(x));

// X scale and Axis
const y = d3.scaleLinear()
  .domain([0, 100]) // This is the min and the max of the data: 0 to 100 if percentages
  .range([height, 0]); // This is the corresponding value I want in Pixel
graphSvg
  .append('g')
  .call(d3.axisLeft(y));
