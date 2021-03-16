import DefaultLayout from '../layouts/Default';
import { getAlbums } from '../api';

export default function Films(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <section className="lg:mx-6 mx-4 mt-2 flex-1">
        <div className="flex flex-col content-center films">
          <h2 className="mb-6 mt-8 sm:text-2xl text-xl">Full Production Videos</h2>
          <iframe src="https://www.youtube.com/embed/hKWBKSyYCPA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          <iframe className="mt-9" src="https://www.youtube.com/embed/C7voGqh2Npg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

          <h2 className="mb-6 mt-12 sm:text-2xl text-xl">Videography collaboration with Adidas</h2>
          <iframe src="https://www.youtube.com/embed/lvs2lOcdJMw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </section>
    </DefaultLayout>
  )
}

export async function getStaticProps(context) {
  const albums = await getAlbums();

  return {
    props: {
      albums,
    }
  };
}
