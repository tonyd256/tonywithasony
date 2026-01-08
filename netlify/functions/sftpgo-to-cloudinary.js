const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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
    // 0) Verify webhook secret (set this header in SFTPGo action)
    console.log("headers keys:", Object.keys(event.headers || {}));
    console.log("x-sftpgo-secret:", header(event.headers, "x-sftpgo-secret"));
    const secret = header(event.headers, "x-sftpgo-secret");
    if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
      return { statusCode: 401, body: "unauthorized" };
    }

    const payload = JSON.parse(event.body || "{}");

    // 1) Determine bucket + key.
    // Best is to POST them explicitly from SFTPGo. Fallback to fs_path/virtual_path.
    const bucket = payload.bucket || process.env.B2_BUCKET;
    let key = payload.key || payload.fs_path || payload.virtual_path;

    if (!bucket || !key) return { statusCode: 400, body: "missing bucket or key" };

    // Normalize
    key = String(key).replace(/^\/+/, "");

    // Optional: only process images
    const lc = key.toLowerCase();
    if (!lc.match(/\.(jpg|jpeg|png|webp|tif|tiff)$/)) {
      return { statusCode: 200, body: "ignored (not image)" };
    }

    // 2) Create a B2 S3-compatible client
    // B2 endpoint format: https://s3.<region>.backblazeb2.com :contentReference[oaicite:3]{index=3}
    const s3 = new S3Client({
      region: process.env.B2_REGION, // e.g. "us-west-004"
      endpoint: process.env.B2_ENDPOINT, // e.g. "https://s3.us-west-004.backblazeb2.com"
      credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY,
      },
      forcePathStyle: true, // helps with some S3-compatible providers
    });

    // 3) Presign a GET URL Cloudinary can fetch (private bucket OK)
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 60 * 10 } // 10 minutes
    );

    // 4) Upload to Cloudinary via "fetch" (Cloudinary pulls from the signed URL)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const publicId = basenameNoExt(key);

    const result = await cloudinary.uploader.upload(signedUrl, {
      type: "fetch",
      resource_type: "image",
      folder: process.env.CLOUDINARY_FOLDER || "sftpgo-ingest",
      public_id: publicId,
      tags: ["sftpgo", "b2", payload.username || "unknown"],
      // Optional: prevent duplicates thrashing
      overwrite: false,

      // OPTIONAL: generate crops automatically (Cloudinary will do AI-ish framing via gravity:auto)
      eager: [
        { width: 1080, height: 1920, crop: "fill", gravity: "auto" }, // 9x16
        { width: 1080, height: 1350, crop: "fill", gravity: "auto" }, // 4x5
        { width: 1080, height: 1080, crop: "fill", gravity: "auto" }, // 1x1
      ],
      eager_async: true,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        bucket,
        key,
        cloudinary_url: result.secure_url,
        public_id: result.public_id,
      }),
    };
  } catch (err) {
    console.error("sftpgo-to-cloudinary error:", err);
    return { statusCode: 500, body: "error" };
  }
};
