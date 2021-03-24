const sass = require("sass");
const fs = require("fs");
const postcss = require('postcss');
const format = require('date-fns/format');
const site = require('./_data/site.json');

module.exports = config => {
  config.addPassthroughCopy({ "public": "/" });
  config.on('afterBuild', renderSass);

  if (!process.env.NETLIFY) {
    config.addWatchTarget("./_sass");
  }

  config.addFilter('dateForSitemap', function (date) {
    return format(date, 'yyyy-MM-dd');
  });

  config.addFilter('absolute_url', function (value) {
    const url = process.env.ELEVENTY_ENV === 'production' ? site.url : 'http://localhost:8080';
    return new URL(value, url).href;
  });

  return {
    dir: {
      layouts: "_layouts"
    }
  };
};

function renderSass() {
  sass.render({file: "_sass/main.scss"}, function (err, result) {
    if (err) return console.error(err);

    postcss([require('tailwindcss'), require('autoprefixer')]).process(result.css.toString(), { from: '_sass/main.css', to: 'css/main.css' })
      .then( function (result) {
        fs.writeFile("_site/css/main.css", result.css, function () { return true; });
        if (result.map) {
          fs.writeFile("_site/css/main.css.map", result.map.toString(), function () { return true; });
        }
      });
  })
}
