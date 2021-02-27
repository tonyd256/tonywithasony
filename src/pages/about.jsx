import DefaultLayout from '../layouts/Default';
import Brands from '../includes/Brands';
import Contact from '../includes/Contact';
import { getAlbums } from '../api';

export default function About(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <section className="sm:mt-8 mt-4 mx-8 text-gray-800">
        <div className="flex content-center justify-center md:flex-row flex-col">
          <div className="md:w-1/3 w-full relative">
            <img className="block w-full"
                src="https://ik.imagekit.io/tony/i-tbjrTN4-X3_HyxkpvMFKV.jpg?tr=w-300"
                srcSet="https://ik.imagekit.io/tony/i-tbjrTN4-X3_HyxkpvMFKV.jpg?tr=w-600 2x"
                alt="Funny Profile Photo" />
            <img className="block hover:opacity-0 w-full absolute top-0 left-0"
                src="https://ik.imagekit.io/tony/i-7X3zWwQ-X3_ryyTDzYKN.jpg?tr=w-300"
                srcSet="https://ik.imagekit.io/tony/i-7X3zWwQ-X3_ryyTDzYKN.jpg?tr=w-600 2x"
                alt="Profile Photo" />
          </div>
          <div className="md:ml-6 md:w-2/3 w-full xl:text-3xl sm:text-2xl text-xl md:text-left text-justify font-normal antialiased tracking-wide xl:leading-10">
            <p className="md:mt-2 mt-8">
              A photographer and videographer with a deep need for adventure, Tony is
              passionate about connecting with humans and dogs, especially dogs.
              When not holding his Sony, Tony enjoys gardening, baking sourdough
              bread, very long runs on the trails, eating a plant-based diet,
              learning new skills, and personal growth. He's also way too into free
              fitness and you can find him working out with the&nbsp;
              <a className="underline hover:text-gray-500" href="//november-project.com/san-francisco-ca" target="_blank" rel="noreferrer noopener">November Project</a>
              &nbsp;early in the mornings.
            </p>
            <p className="mt-4">
              Tony is also a documentary filmmaker and videographer. He loves
              telling people's stories through video. He enjoys learning about
              other people's passions and their journey. He's worked with many
              athletes, artists, and brands to produce short stories of adventure,
              discovery, and passion.
            </p>
            <p className="mt-4">
              Want to get in touch? Fill out the form below to contact Tony, he'd love
              to hear from you!
            </p>
          </div>
        </div>

        <Brands />
        <Contact />
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
