import DefaultLayout from '../../layouts/Default';
import { getAlbums, getAllPosts, getPostBySlug, markdownToHtml } from '../../api';

export default function Posts(props) {
  return (
    <DefaultLayout albums={props.albums}>
      <article className="lg:mx-6 mx-4 mt-2 flex-1">
        <div dangerouslySetInnerHTML={{ __html: props.content }}></div>
      </article>
    </DefaultLayout>
  )
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug']);

  const paths = posts.map(post => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps(context) {
  const albums = await getAlbums();
  const post = getPostBySlug(context.params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ]);

  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      albums,
      ...post,
      content,
      slug: context.params.slug
    }
  };
}
