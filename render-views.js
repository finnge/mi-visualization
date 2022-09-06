const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('node:fs/promises');

const configs = {
  pathIn: '/views',
  pathOut: '/dist',
  templates: [
    'index.njk',
  ],
};

configs.templates.forEach(async (template) => {
  const realFile = `${configs.pathOut}/${template}`;
  const realPathOut = path.dirname(realFile);

  const templatePath = path.resolve(__dirname, configs.pathIn, template);

  try {
    // render
    const templateContent = nunjucks.compile(await fs.readFile(templatePath));
    const fileData = templateContent.render();

    // make sure folder exists
    await fs.mkdir(realPathOut, { recursive: true });

    await fs.appendFile(realFile, fileData);

    console.log(`Compiled ${realFile}`);
  } catch (e) {
    console.error(`Error while compiling ${realFile}`, e);
  }
});
