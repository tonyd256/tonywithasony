const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.B2_REGION,
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

    const key = slug + '.zip';
    const cmd = new GetObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: slug + '/' + key, ResponseContentDisposition: `attachment; filename="${key.split('/').pop()}"` });
    const url = await getSignedUrl(s3Client, cmd, { expiresIn: 60*60 });
    const file = { name: key, url, mime: 'application/zip' };
    return { body: JSON.stringify(file), headers: { "Content-Type": "application/json" }, statusCode: 200 };
  } catch (err) {
    console.error('Error getting transfer zip:', err);
    return { body: JSON.stringify({ error: "Failed to get transfer zip" }), headers: { "Content-Type": "application/json" }, statusCode: 500 };
  }
}

exports.handler = handler;
