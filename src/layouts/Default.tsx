import Head from 'next/head';
import Header from '@includes/Header';
import Footer from '@includes/Footer';
import SEO from '@includes/SEO';
import site from '@config';

const DefaultLayout = props => {
  return (
    <main className="min-h-screen flex flex-col">
      <Head>
        <title>{props.title || site.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="icon" type="image/png" href="/images/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/images/favicon-96x96.png" sizes="96x96" />
        <SEO {...props} />
      </Head>
      <Header albums={props.albums || []} page={props.page || ""} />
      {props.children}
      <Footer />
    </main>
  );
};

export default DefaultLayout;
