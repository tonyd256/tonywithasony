const { EleventyServerless } = require("@11ty/eleventy");

async function handler(event) {
  let elev = new EleventyServerless("dynamic", {
    path: new URL(event.rawUrl).pathname,
    query: event.multiValueQueryStringParameters || event.queryStringParameters,
    functionsDir: "./netlify/functions/",
    copy: [".cache/", "_layouts"],
    singleTemplateScope: false,
    config: function (config) {
      console.log("here");
      config.addFilter('absolute_url', function (value) {
        const url = process.env.ELEVENTY_ENV === 'production' ? site.url : 'http://localhost:8080';
        return new URL(value, url).href;
      });

      config.addFilter("keys", obj => Object.keys(obj));
      config.addFilter("log", obj => console.log(obj));

      return {
        dir: {
          layouts: "_layouts"
        }
      };
    }
  });

  try {
    console.log("try this");
    let [page] = await elev.getOutput();

    // If you want some of the data cascade available in `page.data`, use `eleventyConfig.dataFilterSelectors`.
    // Read more: https://www.11ty.dev/docs/config/#data-filter-selectors

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
      body: page.content,
    };
  } catch (error) {
    // Only console log for matching serverless paths
    // (otherwise you’ll see a bunch of BrowserSync 404s for non-dynamic URLs during --serve)
    if (elev.isServerlessUrl(event.path)) {
      console.log("Serverless Error:", error);
    }

    return {
      statusCode: error.httpStatusCode || 500,
      body: JSON.stringify(
        {
          error: error.message,
        },
        null,
        2
      ),
    };
  }
}

// Choose one:
// * Runs on each request: AWS Lambda, Netlify Function
// * Runs on first request only: Netlify On-demand Builder
//    1. Don’t forget to `npm install @netlify/functions`
//    2. Also use `redirects: "netlify-toml-builders"` in your config file’s serverless bundler options:
//       https://www.11ty.dev/docs/plugins/serverless/#bundler-options

exports.handler = handler;

//const { builder } = require("@netlify/functions");
//exports.handler = builder(handler);
