/* eslint-env browser */

import * as d3 from 'd3';

import { generateChordChart, generateTimelineChart } from './charts';
import './helper';

(async () => {
  // load data and select components
  const flightCountriesJson = await d3.json('data/flights_countries.json');
  const slider = document.querySelector('[data-js-slider]');
  const weekIndicator = document.querySelector('[data-js-week-indicator]');

  // Generate Visualization by calculating week+year and generating Chord-Diagramm
  async function generateVisualization() {
    let week = slider.value;
    let year = 2019;

    if (slider.value > 52) {
      week -= 52;
      year = 2020;
    }
    if (slider.value > 105) {
      week -= 53;
      year = 2021;
    }
    if (slider.value > 157) {
      week -= 52;
      year = 2022;
    }

    // add 0 to 1-9
    if (week < 10) {
      week = `0${week}`;
    }

    generateChordChart(flightCountriesJson, year, week);

    weekIndicator.innerHTML = `${year} - KW ${week}`;
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
