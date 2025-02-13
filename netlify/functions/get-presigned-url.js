const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
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
    const folderName = req.queryStringParameters.folderName;
    const fileName = req.queryStringParameters.fileName;
    const fileType = req.queryStringParameters.fileType;

    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: `${folderName}/${fileName}`,
      ContentType: fileType,
    };

    const cmd = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Client, cmd, { expiresIn: 60*5 });
    return { body: JSON.stringify({ url }), headers: { "Content-Type": "application/json" }, statusCode: 200 };
  } catch (err) {
    console.error('Error generating pre-signed URL:', err);
    return { body: JSON.stringify({ error: "Failed to generate pre-signed URL" }), headers: { "Content-Type": "application/json" }, statusCode: 500 };
  }
}

exports.handler = handler;
