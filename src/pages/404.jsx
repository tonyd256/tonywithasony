import DefaultLayout from '../layouts/Default';
import { getAlbums } from '../api';

export default function NotFound(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <section className="flex-1 mt-8">
        <h1 className="text-4xl text-center">Page Not Found</h1>
      </section>
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
