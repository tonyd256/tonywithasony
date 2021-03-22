import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import ImageKit from 'imagekit';
import _ from 'lodash';
import remark from 'remark';
import html from 'remark-html'

const postsDirectory = join(process.cwd(), '_posts');

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

export function getPostSlugs() {
  console.log(postsDirectory);
  return fs.readdirSync(postsDirectory);
}

export function getAllPosts(fields = []) {
  console.log(postsDirectory);
  const slugs = getPostSlugs();
  console.log(slugs);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getPostBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, realSlug+'.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug;
    }
    if (field === 'content') {
      items[field] = content;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  })

  return items;
}

export async function markdownToHtml(markdown) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
