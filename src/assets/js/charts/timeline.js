import * as d3 from 'd3'; // TODO: shorten
import '../helper';

/**
 * Generates d3 chord.
 * @param {string} selector DOM Selector of element the d3 diagram should generate into.
 * @param {Object} totalNumOfFlights List of flights per week.
 *    {string: int} ISO Week with format "yyyy-ww": Number of flights
 * @param {int} width Width of svg element
 * @param {int} height Width of svg element
 */
export default function generateTimeline(selector, totalNumOfFlights, width = 1200, height = 100) {
  const d3Timeline = d3.select(selector);

  // set the dimensions and margins of the graph
  const margin = {
    top: 10, right: 30, bottom: 30, left: 50,
  };
  const contentWidth = width - margin.left - margin.right;
  const contentHeight = height - margin.top - margin.bottom;

  // form the data
  const data = Object.entries(totalNumOfFlights).map((entry) => {
    const parts = entry[0].split('-');
    const date = Date.fromISOWeek(parseInt(parts[1], 10), parseInt(parts[0], 10));

    return {
      date,
      value: entry[1],
    };
  });

  // append the svg object to the body of the page
  const svg = d3Timeline
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Add X axis --> it is a date format
  const x = d3.scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, contentWidth]);
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => +d.value)])
    .range([contentHeight, 0]);
  svg.append('g')
    .call(d3.axisLeft(y));

  // Add the area
  svg.append('path')
    .datum(data)
    .attr('fill', '#cce5df')
    .attr('stroke', '#69b3a2')
    .attr('stroke-width', 1.5)
    .attr('d', d3.area()
      .x((d) => x(d.date))
      .y0(y(0))
      .y1((d) => y(d.value)));
}
