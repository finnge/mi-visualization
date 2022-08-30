/*!
 * Rollup config
 * @see https://github.com/cferdinandi/build-tool-boilerplate
 */

// Plugins
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json';

// Configs
const configs = {
  files: ['main.js', 'components/index.js'],
  formats: ['iife', 'es'],
  default: 'iife',
  pathIn: 'src/assets/js',
  pathOut: 'dist/assets/js',
  minify: true,
  sourceMap: false,
};

// Banner
const banner = `/*! ${configs.name ? configs.name : pkg.name} v${pkg.version} | (c) ${new Date().getFullYear()} ${pkg.author} | ${pkg.license} License | ${pkg.repository.url} */`;

/**
 * Create single output
 * @param  {String}  filename The filename
 * @param  {Boolean} minify   Should we minify
 * @return {Object}           One output object
 */
const createOutput = (filename, minify) => configs.formats.map((format) => {
  const output = {
    file: `${configs.pathOut}/${filename}${format === configs.default ? '' : `.${format}`}${minify ? '.min' : ''}.js`,
    format,
    banner,
  };
  if (format === 'iife') {
    output.name = configs.name ? configs.name : pkg.name;
  }
  if (minify) {
    output.plugins = [terser()];
  }

  output.sourcemap = configs.sourceMap;

  return output;
});

/**
 * Create output formats
 * @param  {String} filename The filename
 * @return {Array}           The outputs array
 */
const createOutputs = (filename) => {
  // Create base outputs
  const outputs = createOutput(filename);

  // If not minifying, return outputs
  if (!configs.minify) return outputs;

  // Otherwise, create second set of outputs
  const outputsMin = createOutput(filename, true);

  // Merge and return the two arrays
  return outputs.concat(outputsMin);
};

/**
 * Create export object
 * @return {Array} The export object
 */
const createExport = () => configs.files.map((file) => {
  const filename = file.replace('.js', '');
  return {
    input: `${configs.pathIn}/${file}`,
    output: createOutputs(filename),
    plugins: [nodeResolve()],
  };
});

export default createExport();
