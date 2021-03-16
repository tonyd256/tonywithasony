import DefaultLayout from '../layouts/Default';
import ImageKitImage from '../includes/ImageKitImage';
import { getAlbums, getImagesByAlbum } from '../api';

export default function Home(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <section className="lg:mx-6 mx-4 mt-2 flex-1">
        <div className="custom-flexbin">
          {props.images.map(image => (
            <a href="#" key={image.name}>
              <ImageKitImage src={image.url} />
            </a>
          ))}
        </div>
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
