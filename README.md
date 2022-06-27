[![Data Vis CI](https://github.com/finnge/vis-covid19-flights/actions/workflows/ci.yaml/badge.svg)](https://github.com/finnge/vis-covid19-flights/actions/workflows/ci.yaml)
# Data Visualisation: COVID-19 cases + Flight data

Project in the module

**Visualisation (VI)** \
Media Informatics Master \
Summer term 2022

TH Köln, \
Campus Gummersbach \
Germany

## Documentation

tbd.

### Development

To start developing clone the repository (including submodules `git clone --recurse-submodules`) and run `npm install`. There are several scripts available to run:

- Data scripts
  - **`npm run data:flights`**: Run a data conversion and aggregation for the flight data (can take a while)
- Linting
  - **`npm run lint:js`**: Check JavaScript for Linting errors
  - **`npm run lint:js:fix`**: Check and Fix JavaScript for Linting errors
  - **`npm run lint:css`**: Check CSS for Linting errors
  - **`npm run lint:css:fix`**: Check and Fix CSS for Linting errors
  - **`npm run lint`**: Check linting for CSS and JavaScript
- Build
  - **`npm run copy`**: Copy all static files to `dist`
  - **`npm run clean`**: Cleans the `dist` folder
  - **`npm run build:js`**: Builds the JavaScript into the `dist` folder
  - **`npm run build:css`**: Builds the CSS into the `dist` folder
  - **`npm run build-dirty`**: Run all build scripts without cleaning
  - **`npm run build`**: Run all build scripts with cleaning
- Watch
  - **`npm run watch:js`**: Watches JavaScript Files for changes and runs build script
  - **`npm run watch:css`**: Watches CSS Files for changes and runs build script
  - **`npm run watch:views`**: Watches View Files for changes and runs copy script
  - **`npm run watch:data`**: Watches Data Files for changes and runs copy script
  - **`npm run watch`**: Runs all watch files
- Server
  - **`npm run server-start`**: Runs a server locally with browser-sync
  - **`npm run server`**: Runs a server locally with browser-sync with watch mode

For most tasks a `npm run server` is fine.

## Team

- [Lining Bao](https://github.com/Libao1)
- [Finn Nils Gedrath](https://github.com/finnge)
- [Leonard Pelzer](https://github.com/leo-3108)

