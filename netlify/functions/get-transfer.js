const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
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
    const vals = await Promise.all(_.map(_.map(Contents, "Key"), async function (key) {
      const cmd = new GetObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: key, ResponseContentDisposition: `attachment; filename="${key.split('/').pop()}"` });
      const url = await getSignedUrl(s3Client, cmd, { expiresIn: 60*60 });

      if (key.endsWith('.zip')) {
        return { name: key, url, mime: 'application/zip' };
      } else {
        return { name: key, url, image_url: new URL("tony/"+key, process.env.IMAGEKIT_URL_ENDPOINT).href, mime: "image/jpeg" };
      }
    }));
    return { body: JSON.stringify(vals), headers: { "Content-Type": "application/json" }, statusCode: 200 };
  } catch (err) {
    console.error('Error getting images:', err);
    return { body: JSON.stringify({ error: "Failed to get images" }), headers: { "Content-Type": "application/json" }, statusCode: 500 };
  }
}

function newImage(name) {
}

exports.handler = handler;
