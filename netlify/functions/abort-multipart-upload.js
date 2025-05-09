const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
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

    const { key, uploadId } = req.queryStringParameters;

    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    };

    const cmd = new AbortMultipartUploadCommand(params);
    await s3Client.send(cmd);
    return { body: '', statusCode: 204 };
  } catch (err) {
    console.error('Error aborting multipart upload:', err);
    return { body: JSON.stringify({ error: "Failed to abort multipart upload" }), headers: { "Content-Type": "application/json" }, statusCode: 500 };
  }
}

exports.handler = handler;
