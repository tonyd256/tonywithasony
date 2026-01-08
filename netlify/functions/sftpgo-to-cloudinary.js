const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { v2: cloudinary } = require("cloudinary");

function header(headers, name) {
  if (!headers) return undefined;
  const k = Object.keys(headers).find((x) => x.toLowerCase() === name.toLowerCase());
  return k ? headers[k] : undefined;
}

function basenameNoExt(key) {
  const file = key.split("/").pop() || key;
  return file.replace(/\.(jpe?g|png|webp|tif?f)$/i, "");
}

exports.handler = async (event) => {
  try {
    // 1) Verify webhook secret
    const secret = header(event.headers, "x-sftpgo-secret");
    if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
      return { statusCode: 401, body: "unauthorized" };
    }

    const payload = JSON.parse(event.body || "{}");

    const bucket = payload.bucket || process.env.B2_BUCKET;
    let key = payload.key || payload.fs_path || payload.virtual_path;
    if (!bucket || !key) return { statusCode: 400, body: "missing bucket/key" };

    key = String(key).replace(/^\/+/, "");
    const lc = key.toLowerCase();
    if (!lc.match(/\.(jpg|jpeg|png|webp|tif|tiff)$/)) {
      return { statusCode: 200, body: "ignored (not image)" };
    }

    // 2) B2 S3-compatible client
    const accessKeyId =
      process.env.B2_KEY_ID || process.env.B2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey =
      process.env.B2_APP_KEY ||
      process.env.B2_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      return { statusCode: 500, body: "missing b2 credentials" };
    }
    if (!process.env.B2_S3_ENDPOINT || !process.env.B2_REGION) {
      return { statusCode: 500, body: "missing b2 endpoint/region" };
    }

    const s3 = new S3Client({
      region: process.env.B2_REGION, // e.g. us-west-004
      endpoint: process.env.B2_S3_ENDPOINT, // https://s3.us-west-004.backblazeb2.com
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    // 3) Get object stream from B2
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bodyStream = obj.Body; // Readable stream

    // 4) Upload stream to Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const publicId = basenameNoExt(key);

    const uploadResult = await new Promise((resolve, reject) => {
      const up = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: process.env.CLOUDINARY_FOLDER || "sftpgo-ingest",
          public_id: publicId,
          overwrite: false,
          tags: ["sftpgo", "b2", payload.username || "unknown"],

          // Optional: generate crops automatically once stable
          eager: [
            { width: 1080, height: 1920, crop: "fill", gravity: "auto" },
            { width: 1080, height: 1350, crop: "fill", gravity: "auto" },
            { width: 1080, height: 1080, crop: "fill", gravity: "auto" },
          ],
          eager_async: true,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );

      bodyStream.on("error", reject);
      bodyStream.pipe(up);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        bucket,
        key,
        cloudinary_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      }),
    };
  } catch (err) {
    console.error("sftpgo-to-cloudinary error:", err);
    return { statusCode: 500, body: "error" };
  }
};
