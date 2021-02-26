import matter from 'gray-matter';
import marked from 'marked';
import ImageKit from 'imagekit';
import _ from 'lodash';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function getAlbums() {
  try {
    const res = await imagekit.listFiles({
      includeFolder: true,
      path: 'lightroom'
    });

    const albums = _.filter(res, { type: 'folder' });
    const stream = _.remove(albums, { name: 'stream' });

    return [...albums, ...stream];
  } catch (e) {
    console.error(e);
  }
}

export async function getImagesByAlbum(slug) {
  try {
    const res = await imagekit.listFiles({
      path: 'lightroom/'+slug
    });
    return res;
  } catch (e) {
    console.error(e);
  }
}
