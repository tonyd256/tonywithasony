import Link from 'next/link';
import DefaultLayout from '../layouts/Default';
import { getAlbums } from '../api';

export default function Sitemap(props) {
  return (
    <DefaultLayout albums={props.albums} page="sitemap">
      <div className="mx-8">
        <h1 className="text-4xl mb-6">SiteMap</h1>
        <h2 className="text-2xl mb-3">Albums</h2>
        <ul className="inline-block">
          {props.albums.map((album, i) => (
            <Link href={i === 0 ? "/" : `/albums/${album.name}`} key={i}>
              <li className="cursor-pointer">
                <a>{album.name.charAt(0).toUpperCase() + album.name.slice(1).replace('_', ' ')}</a>
              </li>
            </Link>
          ))}
        </ul>
        <h2 className="text-2xl my-3">Pages</h2>
        <ul className="inline-block">
          <Link href="/about">
            <li className="cursor-pointer">
              <a>About</a>
            </li>
          </Link>
        </ul>
      </div>
    </DefaultLayout>
  );
}

export async function getStaticProps() {
  const albums = await getAlbums();

  return {
    props: {
      albums,
    }
  };
}
