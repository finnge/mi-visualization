/* eslint-env browser */

import * as d3 from 'd3';

import { generateChordChart, generateTimelineChart } from './charts';
import './helper';

(async () => {
  // load data and select components
  const flightCountriesJson = await d3.json('data/flights_countries.json');
  const covidCountriesJson = await d3.json('data/covid19.json');
  const covidEventsJson = await d3.json('data/events.json');
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
    // HotFix: Skip to Friday of week so we get always the correct year
    currentDate.setDate(currentDate.getDate() + 7 * numberOfWeeks + 5);

    const {
      width,
      height,
    } = elGraphWrapper.node().getBoundingClientRect();

    generateChordChart(
      elGraphWrapper,
      flightCountriesJson.yearMonth,
      flightCountriesJson.countries,
      covidCountriesJson.yearWeek,
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
      covidEventsJson,
      width,
      height,
    );
  }

  renderTimelineChart();
  window.addEventListener('resize', renderTimelineChart);

  // Navigation

  const slides = document.querySelectorAll('[data-js-slide]');
  const buttonForward = document.querySelector('[data-js-intro-action="forward"]');
  const buttonBack = document.querySelector('[data-js-intro-action="back"]');
  const buttonSkip = document.querySelector('[data-js-intro-action="skip"]');
  const buttonDone = document.querySelector('[data-js-intro-action="done"]');
  let currentSlide = 0;

  slides[currentSlide].dataset.jsSlideActive = '';

  const body = document.querySelector('body');

  function switchSlide(nextSlide) {
    if (nextSlide >= slides.length || nextSlide < 0) {
      return;
    }

    // switch slider
    delete slides[currentSlide].dataset.jsSlideActive;
    slides[nextSlide].dataset.jsSlideActive = '';

    // switch elements
    const listCurrentElements = document.querySelectorAll(`[data-js-intro-slide-el-${currentSlide}]`);
    const listNextElements = document.querySelectorAll(`[data-js-intro-slide-el-${nextSlide}]`);

    listCurrentElements.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      delete el.dataset.jsSlideElActive;
    });

    listNextElements.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.dataset.jsSlideElActive = '';
    });

    // switch elements with passive value
    const listCurrentPassiveElements = document.querySelectorAll(`[data-js-intro-slide-el-${currentSlide}-passive]`);
    const listNextPassiveElements = document.querySelectorAll(`[data-js-intro-slide-el-${nextSlide}-passive]`);

    listCurrentPassiveElements.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      delete el.dataset.jsSlideElActivePassive;
    });

    listNextPassiveElements.forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.dataset.jsSlideElActivePassive = '';
    });

    currentSlide = nextSlide;

    // save to body
    body.dataset.jsCurrentSlide = currentSlide;

    // Forward Button
    if (currentSlide === slides.length - 2) {
      buttonForward.setAttribute('disabled', '');
    } else {
      buttonForward.removeAttribute('disabled');
    }

    // Backwards Button
    if (currentSlide === 0) {
      buttonBack.setAttribute('disabled', '');
    } else {
      buttonBack.removeAttribute('disabled');
    }

    // Last Slide
    if (currentSlide === slides.length - 1) {
      buttonForward.dataset.hidden = '';
      buttonBack.dataset.hidden = '';
      buttonSkip.dataset.hidden = '';
      buttonDone.dataset.hidden = '';
    } else {
      delete buttonForward.dataset.hidden;
      delete buttonBack.dataset.hidden;
      delete buttonSkip.dataset.hidden;
    }

    // Skip Button
    if (currentSlide === slides.length - 2) {
      buttonSkip.setAttribute('disabled', '');
    } else {
      buttonSkip.removeAttribute('disabled');
    }

    // Done Button
    if (currentSlide === slides.length - 2) {
      delete buttonDone.dataset.hidden;
      buttonSkip.dataset.hidden = '';
    } else if (currentSlide !== slides.length - 1) {
      buttonDone.dataset.hidden = '';
      delete buttonSkip.dataset.hidden;
    }
  }

  buttonForward.addEventListener('click', () => {
    switchSlide(currentSlide + 1);
  });

  buttonBack.addEventListener('click', () => {
    switchSlide(currentSlide - 1);
  });

  buttonSkip.addEventListener('click', () => {
    switchSlide(slides.length - 2);
  });

  buttonDone.addEventListener('click', () => {
    switchSlide(slides.length - 1);
  });
})();
