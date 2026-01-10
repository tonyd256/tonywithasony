const { v2: cloudinary } = require("cloudinary");

exports.handler = async (event) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const folder = event.queryStringParameters?.folder || "sftpgo-ingest";

    // List resources in a folder (Admin API)
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: folder + "/",   // returns assets under folder
      max_results: 500,
      tags: true,
      // next_cursor: ... (add paging later)
    });

    // Return only what the browser needs
    const items = (res.resources || []).map(r => ({
      public_id: r.public_id,
      created_at: r.created_at,
      bytes: r.bytes,
      format: r.format,
      width: r.width,
      height: r.height,
      secure_url: r.secure_url,
      tags: r.tags,
    })).filter(i => i.bytes > 0);

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        // public page ok
        "cache-control": "public, max-age=30",
      },
      body: JSON.stringify({ folder, items, next_cursor: res.next_cursor || null }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "error" };
  }
};
