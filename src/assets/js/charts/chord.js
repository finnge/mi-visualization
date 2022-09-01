import * as d3 from 'd3'; // TODO: shorten
import { getCssVar } from '../helper';

/**
 * Generates d3 chord.
 * @param {object} listOfMatrix
 * @param {array} listOfCountries
 * @param {int} year Current year Number
 * @param {int} week Current Week Number
 */
export default async function generateChord(listOfMatrix, listOfCountries, year, week) {
  const graphWrapper = d3.select('[data-js-graph]');
  const elGraphWrapper = graphWrapper.node();

  // delete existing diagram
  elGraphWrapper.innerHTML = '';

  const SETTING = {
    size: 750,
    outerBorder: 25,
  };

  // SVG Area
  const svg = graphWrapper.append('svg')
    .attr('width', SETTING.size)
    .attr('height', SETTING.size)
    .append('g')
    .attr('transform', `translate(${SETTING.size / 2},${SETTING.size / 2})`);

  const yearWeek = `${year}-${week < 10 ? `0${week}` : week}`;
  console.log(yearWeek);
  const matrix = listOfMatrix[yearWeek];

  // give this matrix to d3.chord(): it will calculates all
  // the info we need to draw arc and ribbon
  const res = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)(matrix);

  // add the groups on the outer part of the circle
  svg
    .datum(res)
    .append('g')
    .attr('data-type', 'arcs')
    .selectAll('g')
    .data((d) => d.groups)
    .enter()
    .append('path')
    .attr('data-country', (d) => listOfCountries[d.index])
    .attr('data-value', (d) => d.value)
    .attr('data-group', (d) => d.index)
    .style('fill', () => getCssVar('c-prim-interactive'))
  // .style('stroke', 'black')
    .attr('d', d3.arc()
      .innerRadius((SETTING.size / 2) - SETTING.outerBorder)
      .outerRadius(SETTING.size / 2));

  // Add the links between groups
  svg
    .datum(res)
    .append('g')
    .attr('data-type', 'links')
    .selectAll('g[data-type="arcs"] path')
    .data((d) => d)
    .enter()
    .append('path')
    .attr('data-group-source', (d) => d.source.index)
    .attr('data-group-target', (d) => d.target.index)
    .attr('d', d3.ribbon()
      .radius((SETTING.size / 2) - SETTING.outerBorder))
    .style('fill', () => getCssVar('c-prim-interactive')); // colors depend on the source group. Change to target otherwise.
  // .style('stroke', 'black');

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
