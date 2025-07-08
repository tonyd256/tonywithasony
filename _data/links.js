const { Client } = require("@notionhq/client")
const _ = require('lodash');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function getBasecampLinks() {
  try {
    const links = await notion.databases.query({ database_id: "22a93d9bb58c80568a98f99f122a4a04" });

    const data = _.map(links.results, function (link) {
      const p = link.properties;
      return {
        title: p.Title.title[0].plain_text,
        url: p.Url.url,
        type: p.Type.select.name.toLowercase()
      };
    });
    return data;
  } catch (e) {
    console.error(e);
  }
}

module.exports = async function() {
  return await getBasecampLinks();
}
