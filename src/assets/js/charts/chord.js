import * as d3 from 'd3'; // TODO: shorten
import { getCssVar } from '../helper';

/**
 * Generates d3 chord.
 * @param {object} listOfMatrix
 * @param {array} listOfCountries
 * @param {int} year Current year Number
 * @param {int} week Current Week Number
 * @param {int} width Outer Width of diagram
 * @param {int} height Outer Height of diagram
 */
export default async function generateChord(
  listOfMatrix,
  listOfCountries,
  year,
  week,
  width = 750,
  height = 750,
) {
  const graphWrapper = d3.select('[data-js-graph]');
  const elGraphWrapper = graphWrapper.node();

  // delete existing diagram
  elGraphWrapper.innerHTML = '';

  // set the dimensions and margins of the graph
  const margin = {
    top: 50, right: 50, bottom: 50, left: 50,
  };
  const contentWidth = width - margin.left - margin.right;
  const contentHeight = height - margin.top - margin.bottom;
  const outerRadius = Math.min(contentWidth, contentHeight) / 2;
  const innerRadius = outerRadius - 25;

  // SVG Area
  const svg = graphWrapper.append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const yearWeek = `${year}-${week < 10 ? `0${week}` : week}`;
  const matrix = listOfMatrix[yearWeek];

  // give this matrix to d3.chord(): it will calculates all
  // the info we need to draw arc and ribbon
  const res = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)
    .sortGroups(d3.ascending)(matrix);

  // add the groups on the outer part of the circle
  const outerGroups = svg
    .datum(res)
    .append('g')
    .attr('data-type', 'arcs')
    .selectAll('g')
    .data((d) => d.groups)
    .enter()
    .append('g')
    .attr('data-country', (d) => listOfCountries[d.index]);

  outerGroups
    .append('path')
    .attr('data-country', (d) => listOfCountries[d.index])
    .attr('data-value', (d) => d.value)
    .attr('data-group', (d) => d.index)
    .style('fill', () => getCssVar('c-prim-interactive'))
    .attr('d', d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius));

  // add text label
  outerGroups
    .append('text')
    .each((d) => {
      const d2 = d;
      d2.angle = (d.startAngle + d.endAngle) / 2;
      return d2;
    })
    .attr('dy', '.35em')
    .attr('class', 'titles')
    .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
    .attr('transform', (d) => `rotate(${(d.angle * 180) / Math.PI - 90})`
        + `translate(${outerRadius + 10})${
          d.angle > Math.PI ? 'rotate(180)' : ''}`)
    .text((d, i) => listOfCountries[i]);

  // Add the links between groups
  svg
    .datum(res)
    .append('g')
    .attr('data-type', 'links')
    .selectAll('path')
    .data((d) => d)
    .enter()
    .append('path')
    .attr('data-group-source', (d) => d.source.index)
    .attr('data-group-target', (d) => d.target.index)
    .attr('d', d3.ribbon()
      .radius(innerRadius))
    .style('fill', () => getCssVar('c-prim-interactive')); // colors depend on the source group. Change to target otherwise.

  // Tooltip
  const tooltip = graphWrapper.append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('z-index', 1)
    .text('Value');

  // Interactivity
  const listOfAllLinks = elGraphWrapper.querySelectorAll('path[data-group-source]');
  const listOfAllGroups = elGraphWrapper.querySelectorAll('path[data-group]');

  listOfAllGroups.forEach((group) => {
    group.addEventListener('mouseenter', (e) => {
      const { target } = e;
      const { group: groupId, country } = target.dataset;

      // tooltip
      tooltip
        .style('visibility', 'visible')
        .text(country);

      // highlight active paths
      const listOfGroupSource = elGraphWrapper.querySelectorAll(`path[data-group-source="${groupId}"]`);
      const listOfGroupTarget = elGraphWrapper.querySelectorAll(`path[data-group-target="${groupId}"]`);
      const listOfLinks = Array.from(listOfGroupSource).concat(Array.from(listOfGroupTarget));

      listOfAllLinks.forEach((el) => {
        // eslint-disable-next-line no-param-reassign
        el.dataset.passive = true;
      });

      listOfLinks.forEach((el) => {
        if (el.dataset.passive !== undefined) {
          // eslint-disable-next-line no-param-reassign
          delete el.dataset.passive;
        }
      });
    });

    group.addEventListener('mousemove', (e) => {
      // tooltip
      tooltip
        .style('top', `${e.pageY + 20}px`)
        .style('left', `${e.pageX + 20}px`);
    });

    group.addEventListener('mouseleave', () => {
      // tooltip
      tooltip.style('visibility', 'hidden');

      // highlight active paths
      listOfAllLinks.forEach((el) => {
        if (el.dataset.passive !== undefined) {
          // eslint-disable-next-line no-param-reassign
          delete el.dataset.passive;
        }
      });
    });
  });
}
