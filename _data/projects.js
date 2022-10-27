const { AssetCache } = require("@11ty/eleventy-fetch");
const ImageKit = require('imagekit');
const _ = require('lodash');
require('dotenv').config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function getImagesByAlbum() {
  try {
    let assets = new AssetCache("imagekit_images");

    if (assets.isCacheValid("1d")) {
      return assets.getCachedValue();
    }
    const folders = await imagekit.listFiles({
      type: 'folder',
      path: 'lightroom'
    });

    const albums = await Promise.all(folders.map(async (album) => ({ [album.name]: await imagekit.listFiles({ path: 'lightroom/'+album.name }) })));

    const data = _.merge(...albums);
    await assets.save(data, "json");
    return data;
  } catch (e) {
    console.error(e);
  }
}

module.exports = async function() {
  return await getImagesByAlbum();
}
