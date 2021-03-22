import DefaultLayout from '../../layouts/Default';
import Gallery from '../../includes/Gallery';
import { getAlbums, getImagesByAlbum } from '../../api';

export default function Albums(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <section className="lg:mx-6 mx-4 mt-2 flex-1">
        <Gallery images={props.images} />
      </section>
    </DefaultLayout>
  )
}

export async function getStaticPaths() {
  const [ first, ...albums ] = await getAlbums();
  const paths = albums.map(album => ({
    params: { slug: album.name }
  }));
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps(context) {
  const albums = await getAlbums();
  const images = await getImagesByAlbum(context.params.slug);

  return {
    props: {
      albums,
      images,
      slug: context.params.slug
    }
  };
}
