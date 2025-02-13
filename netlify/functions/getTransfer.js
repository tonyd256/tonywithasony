const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const _ = require('lodash');
require('dotenv').config();

const s3Client = new S3Client({
  region: "us-west-004",
  endpoint: "https://"+process.env.B2_BUCKET_ID,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  }
});

async function handler(req, context) {
  try {
    const slug = req.queryStringParameters.slug;
    if (!slug)
      return { statusCode: 404 };

    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Prefix: slug,
    };

    const cmd = new ListObjectsV2Command(params);
    const { Contents } = await s3Client.send(cmd);
    const vals = _.map(_.map(Contents, "Key"), newImage);
    return { body: JSON.stringify(vals), statusCode: 200 };
  } catch (err) {
    console.error('Error getting images:', err);
    return { body: JSON.stringify({ error: "Failed to get images" }), statusCode: 500 };
  }
}

function newImage(name) {
  return {
    name: name,
    url:  new URL("tony/"+name, process.env.IMAGEKIT_URL_ENDPOINT).href,
    mime: "image/jpeg"
  };
}

exports.handler = handler;
