const { AssetCache } = require("@11ty/eleventy-fetch");
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require("@aws-sdk/client-s3");
const _ = require('lodash');
require('dotenv').config();

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY
  },
  endpoint: {
    url: "https://s3.us-west-1.wasabisys.com"
  },
  region: "us-west-1"
});

async function getImagesByAlbum() {
  try {
    let assets = new AssetCache("imagekit_galleries");

    if (assets.isCacheValid("1d")) {
      return assets.getCachedValue();
    }

    const { Contents } = await client.send(new ListObjectsV2Command({
      Bucket: "website-galleries",
      Prefix: "Galleries Mid QT/"
    }));

    const vals = _.map(Contents, "Key");
    var albums = {};

    vals.forEach( function (path) {
      if (path.includes("tmp")) return;

      var splits = path.split("/");
      if (splits[splits.length - 1] === '')
        splits = splits.slice(0, -1);

      switch (splits.length) {
        case 2:
          albums[_.kebabCase(splits[1])] = { name: splits[1], images: [], albums: {} };
          break;
        case 3:
          if (splits[2].endsWith(".jpg")) {
            albums[_.kebabCase(splits[1])].images.push(newImage(splits[2], path));
          } else {
            albums[_.kebabCase(splits[1])].albums[splits[2]] = { name: splits[2], images: [], albums: {} };
          }
          break;
        case 4:
          if (splits[3].endsWith(".jpg")) {
            albums[_.kebabCase(splits[1])].albums[splits[2]].images.push(newImage(splits[3], path));
          } else {
            albums[_.kebabCase(splits[1])].albums[splits[2]].albums[splits[3]] = { name: splits[3] };
          }
          break;
        default:
          break;
      }
    });
    // console.dir(albums, { depth: null});

    await assets.save(albums, "json");
    return albums;
    // return {};
  } catch (e) {
    console.error(e);
  }
}

function newImage(name, path) {
  return {
    name: name,
    url:  new URL("tony/"+path, process.env.IMAGEKIT_URL_ENDPOINT).href,
    mime: "image/jpeg"
  };
}

module.exports = async function() {
  return await getImagesByAlbum();
}
