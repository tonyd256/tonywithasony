const format = require('date-fns/format');
const site = require('./_data/site.json');

module.exports = config => {
  config.addPassthroughCopy({ "public": "/" });
  config.addPassthroughCopy({ "_js": "/js" });
  config.addPassthroughCopy({ "admin/config.yml": "admin/config.yml" });

  config.addFilter('dateForSitemap', function (date) {
    return format(date, 'yyyy-MM-dd');
  });

  config.addFilter('absolute_url', function (value) {
    const url = process.env.ELEVENTY_ENV === 'production' ? site.url : 'http://localhost:8080';
    return new URL(value, url).href;
  });

  config.addFilter("keys", obj => Object.keys(obj));
  config.addFilter("log", obj => console.log(obj));

  let markdownIt = require("markdown-it");
  config.setLibrary("md", markdownIt({
    html: true
  })
    .use(require("markdown-it-attrs"))
    .use(require('markdown-it-container'), 'dual'));

  return {
    dir: {
      layouts: "_layouts"
    }
  };
};
