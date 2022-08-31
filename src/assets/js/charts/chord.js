import * as d3 from 'd3'; // TODO: shorten
import { getCssVar } from '../helper';

export default async function generateChord(jsonData, year, week) {
  const graphWrapper = d3.select('[data-js-graph]');
  const elGraphWrapper = graphWrapper.node();

  // delete existing diagram
  elGraphWrapper.innerHTML = '';

  const SETTING = {
    size: 750,
    outerBorder: 25,
  };

  if (elGraphWrapper.innerHTML === '') {
    // SVG Area
    const svg = graphWrapper.append('svg')
      .attr('width', SETTING.size)
      .attr('height', SETTING.size)
      .append('g')
      .attr('transform', `translate(${SETTING.size / 2},${SETTING.size / 2})`);

    const yearWeek = `${year}-${week}`;
    const matrix = jsonData.yearMonth[yearWeek];

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

    const listOfAllLinks = elGraphWrapper.querySelectorAll('path[data-group-source]');
    const listOfAllGroups = elGraphWrapper.querySelectorAll('path[data-group]');

    listOfAllGroups.forEach((group) => {
      group.addEventListener('mouseenter', (e) => {
        const { target } = e;
        const { group: groupId } = target.dataset;

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

      group.addEventListener('mouseleave', () => {
        listOfAllLinks.forEach((el) => {
          if (el.dataset.passive !== undefined) {
            // eslint-disable-next-line no-param-reassign
            delete el.dataset.passive;
          }
        });
      });
    });
  } else {
    const yearWeek = `${year}-${week}`;
    const matrix = jsonData.yearMonth[yearWeek];

    const svg = d3.select('[data-js-graph] > svg');

    const res = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)(matrix);

    const arcs = svg.select('g[data-type="arcs"]')
      .selectAll('path')
      .datum(res)
      .data((d) => d.groups);

    console.log(arcs);

    arcs
      .enter()
      .append('path')
      .style('fill', () => getCssVar('--c-prim-interactive'))
      .style('stroke', 'black')
      .attr('d', d3.arc()
        .innerRadius((SETTING.size / 2) - SETTING.outerBorder)
        .outerRadius(SETTING.size / 2));

    arcs.exit()
      .remove();

    console.log(arcs);

    // svg
    //   .datum(res)
    //   .selectAll('g[data-type="arcs"]')
    //   .data((d) => d.groups)
    //   .enter()
    //   .selectAll('path')
    //   .enter()
    //   .append('path')
    //   .style('fill', () => getCssVar('--c-prim-interactive'))
    //   .style('stroke', 'black')
    //   .attr('d', d3.arc()
    //     .innerRadius((SETTING.size / 2) - SETTING.outerBorder)
    //     .outerRadius(SETTING.size / 2));

    // Update data
  }
}
