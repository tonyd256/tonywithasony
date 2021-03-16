import ImageKit from 'imagekit';
import _ from 'lodash';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function getAlbums() {
  try {
    const albums = await require('../albums.json');
    return albums;
  } catch (e) {
    console.error(e);
  }
}

export async function getImagesByAlbum(slug) {
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

export async function getImageMeta(image) {
  try {
    const res = await imagekit.getFileMetadata(image.fileId);
    return { ...image, metadata: res };
  } catch (e) {
    console.error(e);
  }
}
