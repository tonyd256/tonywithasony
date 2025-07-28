const { Client } = require("@notionhq/client")
const _ = require('lodash');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function handler(req, context) {
  try {
    const links = await notion.databases.query({ database_id: "22a93d9bb58c80568a98f99f122a4a04" });

    const data = _.map(links.results, function (link) {
      const p = link.properties;
      return {
        title: p.Title.title[0].plain_text,
        url: p.Url.url,
        type: p.Type.select.name.toLowerCase()
      };
    });
    return { body: JSON.stringify(data), headers: { "Content-Type": "application/json" }, statusCode: 200 };
  } catch (e) {
    console.error(e);
    return { body: JSON.stringify({ error: "Failed to get links" }), headers: { "Content-Type": "application/json" }, statusCode: 500 };
  }
}

exports.handler = handler;
