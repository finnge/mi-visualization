/* eslint-env browser */

import * as d3 from 'd3';

import { generateChordChart, generateTimelineChart } from './charts';
import './helper';

(async () => {
  // load data and select components
  const flightCountriesJson = await d3.json('data/flights_countries.json');
  const slider = document.querySelector('[data-js-slider]');
  const weekIndicator = document.querySelector('[data-js-week-indicator]');

  const listOfWeeks = Object.keys(flightCountriesJson.yearMonth);

  const totalNumberOfWeeks = listOfWeeks.length;
  slider.max = totalNumberOfWeeks;

  const startWeekParts = listOfWeeks[0].split('-');

  const startDate = Date.fromISOWeek(
    parseInt(startWeekParts[1], 10),
    parseInt(startWeekParts[0], 10),
  );

  // Generate Visualization by calculating week+year and generating Chord-Diagramm
  function generateVisualization() {
    const numberOfWeeks = slider.value - 1;

    const currentDate = new Date(startDate);

    currentDate.setDate(currentDate.getDate() + 7 * numberOfWeeks);

    console.log(currentDate, startDate.getYear(), startDate);

    generateChordChart(
      flightCountriesJson.yearMonth,
      flightCountriesJson.countries,
      currentDate.getFullYear(),
      currentDate.getISOWeek(),
    );

    weekIndicator.innerHTML = `${currentDate.getFullYear()} - KW ${currentDate.getISOWeek()}`;
  }

  // Generate Visualization when website is loaded
  generateVisualization();

  // Generate Visualization when slider is used
  slider.addEventListener('input', () => {
    generateVisualization();
  });

  const elTimelineWrapper = d3.select('[data-js-timeline]');

  function renderTimelineChart() {
    elTimelineWrapper.node().replaceChildren();

    const {
      width,
      height,
    } = elTimelineWrapper.node().getBoundingClientRect();

    generateTimelineChart(
      elTimelineWrapper,
      flightCountriesJson.totalNumOfFlights,
      width,
      height,
    );
  }
  renderTimelineChart();
  window.addEventListener('resize', renderTimelineChart);
})();
