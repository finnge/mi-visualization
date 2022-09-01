/* eslint-env browser */

import * as d3 from 'd3';

import { generateChordChart, generateTimelineChart } from './charts';
import './helper';

(async () => {
  // load data and select components
  const flightCountriesJson = await d3.json('data/flights_countries.json');
  const elSlider = document.querySelector('[data-js-slider]');
  const weekIndicator = document.querySelector('[data-js-week-indicator]');

  const listOfWeeks = Object.keys(flightCountriesJson.yearMonth);

  const totalNumberOfWeeks = listOfWeeks.length;
  elSlider.max = totalNumberOfWeeks;

  const startWeekParts = listOfWeeks[0].split('-');

  const startDate = Date.fromISOWeek(
    parseInt(startWeekParts[1], 10),
    parseInt(startWeekParts[0], 10),
  );

  /**
   * Chord Chart
   */
  const elGraphWrapper = d3.select('[data-js-graph]');

  function renderChordChart() {
    elGraphWrapper.node().replaceChildren();

    const numberOfWeeks = elSlider.value - 1;
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 7 * numberOfWeeks);

    const {
      width,
      height,
    } = elGraphWrapper.node().getBoundingClientRect();

    generateChordChart(
      elGraphWrapper,
      flightCountriesJson.yearMonth,
      flightCountriesJson.countries,
      currentDate.getFullYear(),
      currentDate.getISOWeek(),
      width,
      height,
    );

    weekIndicator.innerHTML = `${currentDate.getFullYear()} - KW ${currentDate.getISOWeek()}`;
  }

  // Generate Visualization when website is loaded
  renderChordChart();
  elSlider.addEventListener('input', renderChordChart);
  window.addEventListener('resize', renderChordChart);

  /**
   * Timeline Chart
   */
  const elTimelineWrapper = d3.select('[data-js-timeline]');

  function renderTimelineChart() {
    elTimelineWrapper.node().replaceChildren();

    const {
      width,
      height,
    } = elTimelineWrapper.node().getBoundingClientRect();

    generateTimelineChart(
      elTimelineWrapper,
      elSlider,
      flightCountriesJson.totalNumOfFlights,
      width,
      height,
    );
  }

  renderTimelineChart();
  window.addEventListener('resize', renderTimelineChart);
})();
