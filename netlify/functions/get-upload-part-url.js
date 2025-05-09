const { S3Client, UploadPartCommand } = require("@aws-sdk/client-s3");
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
    const rawNetlifyContext = context.clientContext.custom.netlify;
    const netlifyContext = Buffer.from(rawNetlifyContext, 'base64').toString('utf-8');
    const { identity, user } = JSON.parse(netlifyContext);

    if (!identity || !user)
      return { statusCode: 404 };

    const { key, uploadId, partNumber } = req.queryStringParameters;

    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: Number(partNumber),
    };

    const cmd = new UploadPartCommand(params);
    const url = await getSignedUrl(s3Client, cmd, { expiresIn: 60*5 });
    return { body: JSON.stringify({ url }), headers: { "Content-Type": "application/json" }, statusCode: 200 };
  } catch (err) {
    console.error('Error generating upload part pre-signed URL:', err);
    return { body: JSON.stringify({ error: "Failed to generate upload part pre-signed URL" }), headers: { "Content-Type": "application/json" }, statusCode: 500 };
  }
}

exports.handler = handler;
