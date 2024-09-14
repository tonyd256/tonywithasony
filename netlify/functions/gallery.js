const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const _ = require('lodash');
require('dotenv').config();

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY
  },
  endpoint: {
    url: "https://s3.us-west-1.wasabisys.com"
  },
  region: "us-west-1"
});

async function handler(req, context) {
  try {
    const slug = req.queryStringParameters.slug;
    if (!slug)
      return { statusCode: 404 };

    const { Contents } = await client.send(new ListObjectsV2Command({
      Bucket: "website-galleries",
      Prefix: "Galleries Mid QT/"
    }));

    const vals = _.map(Contents, "Key");
    var albums = {};

    vals.forEach( function (path) {
      if (path.includes("tmp")) return;

      var splits = path.split("/");
      if (splits[splits.length - 1] === '')
        splits = splits.slice(0, -1);

      if (_.kebabCase(splits[1]) !== slug) return;

      switch (splits.length) {
        case 2:
          albums[_.kebabCase(splits[1])] = { name: splits[1], images: [], albums: {} };
          break;
        case 3:
          if (splits[2].endsWith(".jpg")) {
            albums[_.kebabCase(splits[1])].images.push(newImage(splits[2], path));
          } else {
            albums[_.kebabCase(splits[1])].albums[splits[2]] = { name: splits[2], images: [], albums: {} };
          }
          break;
        case 4:
          if (splits[3].endsWith(".jpg")) {
            albums[_.kebabCase(splits[1])].albums[splits[2]].images.push(newImage(splits[3], path));
          } else {
            albums[_.kebabCase(splits[1])].albums[splits[2]].albums[splits[3]] = { name: splits[3] };
          }
          break;
        default:
          break;
      }
    });

    return { body: JSON.stringify(albums[slug]), statusCode: 200 };
  } catch (e) {
    console.error(e);
    return { body: JSON.stringify({ error: "unknown error" }), statusCode: 500 };
  }
}

function newImage(name, path) {
  return {
    name: name,
    url:  new URL("tony/"+path, process.env.IMAGEKIT_URL_ENDPOINT).href,
    mime: "image/jpeg"
  };
}

exports.handler = handler;
