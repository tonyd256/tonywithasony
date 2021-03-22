import DefaultLayout from '../layouts/Default';
import Gallery from '../includes/Gallery';
import { getAlbums, getImagesByAlbum } from '../api';

export default function Home(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <section className="lg:mx-6 mx-4 mt-2 flex-1">
        <Gallery images={props.images} />
      </section>
    </DefaultLayout>
  )
}

export async function getStaticProps() {
  const albums = await getAlbums();
  const images = await getImagesByAlbum(albums[0].name);

  return {
    props: {
      albums,
      images,
    }
  };
}
