const ImageKit = require('imagekit');
const _ = require('lodash');
const albums = require('./albums.json');
require('dotenv').config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function getImagesByAlbum(slug) {
  try {
    const res = await imagekit.listFiles({
      path: 'lightroom/'+slug
    });

    const fullRes = await Promise.all(res.map(image => getImageMeta(image)));
    return _.reverse(_.sortBy(fullRes, o => o.metadata.exif.exif['CreateDate']));
  } catch (e) {
    console.error(e);
  }
}

async function getImageMeta(image) {
  try {
    const res = await imagekit.getFileMetadata(image.fileId);
    return { ...image, metadata: res };
  } catch (e) {
    console.error("Error getting Metadata for image: "+image.url);
    console.error(e);
    return { ...image, metadata: { exif: { exif: { CreateDate: '' } } } };
  }
}

module.exports = async function() {
  var albumsWithImages = {};

  for (var i = 0; i < albums.length; i++) {
    const res = await getImagesByAlbum(albums[i]);
    albumsWithImages[albums[i]] = res;
  }

  return albumsWithImages;
}
