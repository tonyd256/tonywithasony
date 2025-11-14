const { Client } = require("@notionhq/client")
const _ = require('lodash');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function getBasecampLinks() {
  try {
    const database = await notion.databases.retrieve({ database_id: "22a93d9bb58c80568a98f99f122a4a04" });

    if (database.data_sources.length === 0)
      throw new Error("No data sources available.");

    const links = await notion.dataSources.query({ data_source_id: database.data_sources[0].id });

    const data = _.map(_.orderBy(links.results, 'created_time', 'desc'), function (link) {
      const p = link.properties;
      return {
        title: p.Title.title[0].plain_text,
        url: p.Url.url,
        type: p.Type.select.name.toLowerCase()
      };
    });
    const allLinks = [{ title: 'Portfolio Website', url: '/', type: 'link' }, ...data];

    return allLinks;
  } catch (e) {
    console.error(e);
  }
}

module.exports = async function() {
  return await getBasecampLinks();
}
