import DefaultLayout from '../layouts/Default';
import { getAlbums } from '../api';

export default function Thanks(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <section className="sm:mt-8 mt-4 mx-8 mb-10 text-gray-800 flex-1">
        <h1 className="text-center text-6xl">Thanks for reaching out!</h1>
        <h3 className="text-center text-2xl mt-10">I'll get back to you shortly.</h3>
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
