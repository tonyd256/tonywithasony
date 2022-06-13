const format = require('date-fns/format');
const site = require('./_data/site.json');
const ampPlugin = require('@ampproject/eleventy-plugin-amp');

module.exports = config => {
  config.addPlugin(ampPlugin, {
    ampCache: false,
    imageBasePath: `${__dirname}/public`,
    imageOptimization: true,
    validation: false,
  });
  config.addPassthroughCopy({ "public": "/" });

  config.addFilter('dateForSitemap', function (date) {
    return format(date, 'yyyy-MM-dd');
  });

  config.addFilter('absolute_url', function (value) {
    const url = process.env.ELEVENTY_ENV === 'production' ? site.url : 'http://localhost:8080';
    return new URL(value, url).href;
  });

  let markdownIt = require("markdown-it");
  config.setLibrary("md", markdownIt("commonmark")
    .use(require("markdown-it-attrs")));

  return {
    dir: {
      layouts: "_layouts"
    }
  };
};
