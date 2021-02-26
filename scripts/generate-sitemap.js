const fs = require('fs');
const globby = require('globby');
const _ = require('lodash');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

(async () => {
  const pages = await globby([
    'src/pages/**/*.{tsx,ts,mdx}',
    '!src/pages/**/[*',
    '!src/pages/_*',
    '!src/pages/api'
  ]);
  const albums = await getAlbums();
  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map( page => {
        const path = page
          .replace('src/pages', '')
          .replace(/(.tsx|.ts|.mdx)/, '');

        const route = path === '/index' ? '' : path;

        return `
          <url>
            <loc>${`https://tonywithasony.com${route}`}</loc>
          </url>`;
      }).join('')}
      ${albums.map( (album, index) => {
        if (index === 0) return '';
        return `
          <url>
            <loc>${`https://tonywithasony.com/albums/${album.name}`}</loc>
          </url>`;
      }).join('')}
    </urlset>
  `;

  fs.writeFileSync('public/sitemap.xml', sitemap);
})();

async function getAlbums() {
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
