/* eslint import/no-extraneous-dependencies: 'off'  */

const postcssImport = require('postcss-import');
const postcssMinify = require('postcss-minify');
const autoprefixer = require('autoprefixer');

module.exports = (ctx) => ({
  map: ctx.options.map,
  plugins: [
    postcssImport(),
    autoprefixer(),
    postcssMinify(),
  ],
});
