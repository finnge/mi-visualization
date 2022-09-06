import * as d3 from 'd3'; // TODO: shorten
import { changeOnPrefersColorSchemeAndOnce, getCssVar } from '../helper';

/**
 * Generates d3 timeline.
 * @param {d3.Selection} baseSelection DOM Selector of element the d3 diagram should generate into.
 * @param {Element} elSlider DOM Selector of slider Element.
 * @param {Object} listOfTimeData List of flights per week.
 *    {string: int} ISO Week with format "yyyy-ww": Number of flights
 * @param {int} width Width of svg element
 * @param {int} height Width of svg element
 */
export default function generateTimeline(
  baseSelection,
  elSlider,
  listOfTimeData,
  width = 400,
  height = 100,
) {
  // set the dimensions and margins of the graph
  const margin = {
    // top: 10, right: 10, bottom: 20, left: 50,
    top: 10, right: 10, bottom: 20, left: 10,
  };
  const contentWidth = width - margin.left - margin.right;
  const contentHeight = height - margin.top - margin.bottom;

  // form the data
  const data = Object.entries(listOfTimeData).map((entry) => {
    const parts = entry[0].split('-');
    const date = Date.fromISOWeek(parseInt(parts[1], 10), parseInt(parts[0], 10));

    return {
      date,
      value: entry[1],
    };
  });

  // append the svg object to the body of the page
  const svg = baseSelection
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'black')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Add X axis --> it is a date format
  const x = d3.scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, contentWidth]);
  svg.append('g')
    .attr('transform', `translate(0,${contentHeight})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain(d3.extent(data, (d) => d.value))
    .range([contentHeight, 0])
    .nice();
  // svg.append('g')
  //   .call(d3.axisLeft(y));

  // Add the path
  svg.append('path')
    .datum(data)
    .attr('stroke', getCssVar('c-prim'))
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('d', d3.line()
      .x((d) => x(d.date))
      .y((d) => y(d.value)));

  // Marker + Bisector
  const bisect = d3.bisector((d) => d.date);
  const marker = svg.append('circle')
    .attr('r', 4)
    .attr('cx', -100)
    .attr('fill', 'none');

  changeOnPrefersColorSchemeAndOnce(() => {
    marker.attr('stroke', getCssVar('c-fg-2'));
  });

  const startIndex = Math.round(data.length / 2);
  let currentLookup = new Date(data[startIndex].date);
  elSlider.setAttribute('value', startIndex);

  const bar = svg
    .append('line')
    .attr('y2', contentHeight)
    .attr('x1', x(currentLookup))
    .attr('x2', x(currentLookup));

  changeOnPrefersColorSchemeAndOnce(() => {
    bar.attr('style', `stroke:${getCssVar('c-fg-2')}; stroke-width:0.5; stroke-dasharray: 5 3;`);
  });

  function update(date) {
    const i = bisect.right(data, date);

    if (i >= data.length || i < 0) {
      return;
    }
    marker.attr('cx', x(data[i].date)).attr('cy', y(data[i].value));

    currentLookup = new Date(date);
    bar.attr('x1', x(currentLookup)).attr('x2', x(currentLookup));

    // update slider
    elSlider.setAttribute('value', i);
    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    elSlider.dispatchEvent(inputEvent);
  }

  baseSelection.on('pointermove click', (event) => {
    const m = d3.pointer(event, this);
    update(x.invert(m[0]));
  });

  // Intro animation
  svg.attr('data-js-intro-slide-el-7', '');

  // init visability
  const initSlideValue = document.querySelector('body').dataset.jsCurrentSlide;

  const listInitSildeElements = document.querySelectorAll(`[data-js-intro-slide-el-${initSlideValue}]`);
  const listInitSlidePassiveElements = document.querySelectorAll(`[data-js-intro-slide-el-${initSlideValue}-passive]`);

  listInitSildeElements.forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.dataset.jsSlideElActive = '';
  });

  listInitSlidePassiveElements.forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.dataset.jsSlideElActivePassive = '';
  });
}
