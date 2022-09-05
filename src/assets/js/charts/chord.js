import * as d3 from 'd3'; // TODO: shorten
import { getCssVar } from '../helper';

/**
 * Generates Settings Object for Chord Diagram
 * @param {int} width Width of SVG Element
 * @param {int} height Height of SVG Element
 * @returns object
 */
const getSettings = (width, height) => {
  const margin = {
    top: 200, right: 200, bottom: 200, left: 200,
  };
  const contentWidth = width - margin.left - margin.right;
  const contentHeight = height - margin.top - margin.bottom;
  const outerRadius = Math.min(contentWidth, contentHeight) / 2;
  const innerRadius = outerRadius - 25;
  const ringPadding = 50;

  return {
    margin,
    contentWidth,
    contentHeight,
    outerRadius,
    innerRadius,
    ringPadding,
  };
};

const updateChord = (
  baseSelection,
  flightMatrix,
  listOfCountries,
  covidIncidence,
  settings,
) => {
  const res = d3.chord()
    .padAngle(0.1)
    .sortSubgroups(d3.descending)
    .sortGroups(d3.ascending)(flightMatrix);

  const color = (index) => d3.scaleSequential().domain([1, res.groups.length])
    .interpolator(d3.interpolateTurbo)(index);

  const outerGroups = baseSelection.select('g[data-type="arcs"]')
    .selectAll('g')
    .data(res.groups, (d) => d);

  outerGroups.enter()
    .append('g')
    .merge(outerGroups)
    .attr('data-country', (d) => listOfCountries[d.index]);

  outerGroups
    .append('path')
    .attr('data-country', (d) => listOfCountries[d.index])
    .attr('data-value', (d) => d.value)
    .attr('data-group', (d) => d.index)
    .style('fill', (d) => color(d.index))
    .attr('d', d3.arc()
      .innerRadius(settings.innerRadius)
      .outerRadius(settings.outerRadius));

  // add text label
  outerGroups
    .append('text')
    .each((d) => {
      const d2 = d;
      d2.angle = (d.startAngle + d.endAngle) / 2;
      return d2;
    })
    .attr('dy', '.35em')
    .attr('fill', getCssVar('c-fg-1'))
    .attr('text-anchor', (d) => (d.angle > Math.PI ? 'end' : null))
    .attr('transform', (d) => `rotate(${(d.angle * 180) / Math.PI - 90})`
      + `translate(${settings.outerRadius + 10})${d.angle > Math.PI ? 'rotate(180)' : ''}`)
    .text((d, i) => listOfCountries[i]);

  outerGroups.exit().remove();

  // Gradient colors
  const grads = baseSelection.select('defs')
    .selectAll('linearGradient')
    .data(res);

  grads.enter()
    .append('linearGradient')
    .merge(grads)
    .attr('id', (d) => `gradient-${d.source.index}-to-${d.target.index}`)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', (d) => settings.innerRadius * Math.cos((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2))
    .attr('y1', (d) => settings.innerRadius * Math.sin((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2))
    .attr('x2', (d) => settings.innerRadius * Math.cos((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2))
    .attr('y2', (d) => settings.innerRadius * Math.sin((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2));

  // set the starting color (at 0%)
  grads.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', (d) => color(d.target.index));

  // set the ending color (at 100%)
  grads.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', (d) => color(d.source.index));

  grads.exit().remove();

  // Add the links between groups
  const linkPaths = baseSelection.select('g[data-type="links"]')
    .selectAll('path')
    .data(res, (d) => d);

  linkPaths.enter()
    .append('path')
    .merge(linkPaths)
    .attr('data-group-source', (d) => d.source.index)
    .attr('data-group-target', (d) => d.target.index)
    .attr('d', d3.ribbon()
      .radius(settings.innerRadius))
    .style('fill', (d) => {
      if (d.source.index === d.target.index) {
        return color(d.source.index);
      }
      return `url(#gradient-${d.source.index}-to-${d.target.index})`;
    });

  linkPaths.exit().remove();
};

/**
 * Generates d3 chord.
 * @param {d3.Selection} baseSelection DOM Selector of element the d3 diagram should generate into.
 * @param {object} listOfMatrix
 * @param {array} listOfCountries
 * @param {int} defaultYear Current year Number
 * @param {int} defaultWeek Current Week Number
 * @param {int} width Outer Width of diagram
 * @param {int} height Outer Height of diagram
 */
export default async function generateChord(
  baseSelection,
  listOfMatrix,
  listOfCountries,
  listOfCovidIncidence,
  defaultYear,
  defaultWeek,
  width = 750,
  height = 750,
) {
  const elGraphWrapper = baseSelection.node();

  // delete existing diagram
  elGraphWrapper.replaceChildren();

  const settings = getSettings(width, height);

  // SVG Area
  const svg = baseSelection.append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  // Create needed Elements
  svg.append('defs');
  svg.append('g').attr('data-type', 'arcs');
  svg.append('g').attr('data-type', 'links');

  function reactToWeekChange(event) {
    const {
      week,
      year,
    } = event.detail;
    const yearWeek = `${year}-${week < 10 ? `0${week}` : week}`;
    const matrix = listOfMatrix[yearWeek];
    const covid19 = new Array(listOfCountries.length);

    covid19.fill(0); // default covid data

    // Get current Covid Data
    Object.entries(listOfCovidIncidence[yearWeek] ?? {}).forEach((entry) => {
      const [countryCode, value] = entry;

      const index = listOfCountries.findIndex((v) => v === countryCode);

      covid19[index] = value.incidence;
    });

    updateChord(
      svg,
      matrix,
      listOfCountries,
      covid19,
      settings,
    );
  }

  // reactToWeekChange({
  //   detail: {
  //     week: defaultWeek,
  //     year: defaultYear,
  //   },
  // });

  window.addEventListener('changeWeekData', reactToWeekChange);

  // Covid Data
  // X scale

  // const medianCovid19MaxValue = d3.quantile(
  //   Object.values(listOfCovidIncidence),
  //   0.25,
  //   (weekYearDatum) => d3.max(
  //     Object.values(weekYearDatum),
  //     (datum) => datum.incidence,
  //   ),
  // );

  // const y = d3.scaleRadial()
  //   .range([
  //     settings.outerRadius + settings.ringPadding,
  //     settings.outerRadius + Math.min(settings.margin.left, settings.margin.right),
  //   ])
  //   .domain([
  //     0,
  //     d3.max([...covid19, medianCovid19MaxValue]),
  //   ])
  //   .nice();

  // outerGroups
  //   .append('path')
  //   .attr('fill', getCssVar('c-prim'))
  //   .attr('d', d3.arc() // imagine your doing a part of a donut plot
  //     .innerRadius(settings.outerRadius + settings.ringPadding)
  //     .outerRadius((d) => y(covid19[d.index] ?? 0))
  //     .startAngle((d) => d3.mean([d.startAngle, d.endAngle]) - 0.02)
  //     .endAngle((d) => d3.mean([d.startAngle, d.endAngle]) + 0.02));

  // const yAxis = svg.append('g')
  //   .attr('text-anchor', 'middle');

  // const yTick = yAxis
  //   .selectAll('g')
  //   .data(y.ticks(5))
  //   .enter().append('g');

  // yTick.append('circle')
  //   .attr('fill', 'none')
  //   .attr('stroke', getCssVar('c-fg-1'))
  //   .style('opacity', 0.3)
  //   .attr('r', y);

  // // ticks top
  // yTick.append('text')
  //   .attr('y', (d) => -y(d))
  //   .attr('dy', '0.35em')
  //   .attr('fill', 'none')
  //   .attr('stroke', getCssVar('c-bg-1'))
  //   .attr('stroke-width', 5)
  //   .style('font-size', getCssVar('xs'))
  //   .text(y.tickFormat(5, 's'));

  // yTick.append('text')
  //   .attr('fill', getCssVar('c-fg-1'))
  //   .attr('y', (d) => -y(d))
  //   .attr('dy', '0.35em')
  //   .style('font-size', getCssVar('xs'))
  //   .text(y.tickFormat(5, 's'));

  // // ticks bottom
  // yTick.append('text')
  //   .attr('y', (d) => y(d))
  //   .attr('dy', '0.35em')
  //   .attr('fill', 'none')
  //   .attr('stroke', getCssVar('c-bg-1'))
  //   .attr('stroke-width', 5)
  //   .style('font-size', getCssVar('xs'))
  //   .text(y.tickFormat(5, 's'));

  // yTick.append('text')
  //   .attr('fill', getCssVar('c-fg-1'))
  //   .attr('y', (d) => y(d))
  //   .attr('dy', '0.35em')
  //   .style('font-size', getCssVar('xs'))
  //   .text(y.tickFormat(5, 's'));

  // // Tooltip
  // const tooltip = baseSelection.append('div')
  //   .style('position', 'absolute')
  //   .style('visibility', 'hidden')
  //   .style('z-index', 1)
  //   .text('Value');

  // // Interactivity
  // const listOfAllLinks = elGraphWrapper.querySelectorAll('path[data-group-source]');
  // const listOfAllGroups = elGraphWrapper.querySelectorAll('path[data-group]');

  // listOfAllGroups.forEach((group) => {
  //   group.addEventListener('mouseenter', (e) => {
  //     const { target } = e;
  //     const { group: groupId, country } = target.dataset;

  //     // tooltip
  //     tooltip
  //       .style('visibility', 'visible')
  //       .text(country);

  //     // highlight active paths
  //     const listOfGroupSource = elGraphWrapper.querySelectorAll(`path[data-group-source="${groupId}"]`);
  //     const listOfGroupTarget = elGraphWrapper.querySelectorAll(`path[data-group-target="${groupId}"]`);
  //     const listOfLinks = Array.from(listOfGroupSource).concat(Array.from(listOfGroupTarget));

  //     listOfAllLinks.forEach((el) => {
  //       // eslint-disable-next-line no-param-reassign
  //       el.dataset.passive = true;
  //     });

  //     listOfLinks.forEach((el) => {
  //       if (el.dataset.passive !== undefined) {
  //         // eslint-disable-next-line no-param-reassign
  //         delete el.dataset.passive;
  //       }
  //     });
  //   });

  //   group.addEventListener('mousemove', (e) => {
  //     // tooltip
  //     tooltip
  //       .style('top', `${e.pageY + 20}px`)
  //       .style('left', `${e.pageX + 20}px`);
  //   });

  //   group.addEventListener('mouseleave', () => {
  //     // tooltip
  //     tooltip.style('visibility', 'hidden');

  //     // highlight active paths
  //     listOfAllLinks.forEach((el) => {
  //       if (el.dataset.passive !== undefined) {
  //         // eslint-disable-next-line no-param-reassign
  //         delete el.dataset.passive;
  //       }
  //     });
  //   });
  // });
}
