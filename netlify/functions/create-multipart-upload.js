const { S3Client, CreateMultipartUploadCommand } = require("@aws-sdk/client-s3");
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

    const json = JSON.parse(req.body);
    const folderName = json.folderName;
    const fileName = json.fileName;
    const fileType = json.fileType;

    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: `${folderName}/${fileName}`,
      ContentType: fileType,
    };

    const cmd = new CreateMultipartUploadCommand(params);
    const result = await s3Client.send(cmd);

    return {
      body: JSON.stringify({
        uploadId: result.UploadId,
        key: result.Key
      }),
      headers: { "Content-Type": "application/json" },
      statusCode: 200
    };
  } catch (err) {
    console.error('Error creating multipart upload:', err);
    return { body: JSON.stringify({ error: "Failed creating multipart upload" }), headers: { "Content-Type": "application/json" }, statusCode: 500 };
  }
}

exports.handler = handler;
