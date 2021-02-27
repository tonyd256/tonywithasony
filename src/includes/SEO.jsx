import site from '../config';

const SEO = props => {
  const url = new URL(props.url || "", site.url);

  return (
    <>
      <meta name="description" content={props.description || site.description} />
      <meta name="robots" content="index follow" />
      <link rel="canonical" href={url.href} />

      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={props.title || site.title} />
      <meta property="og:url" content={url.href} />
      <meta property="og:image" content={props.image || site.image} />
      <meta property="og:site_name" content={site.title} />
      <meta property="article:publisher" content={site.facebook} />
      <meta property="article:author" content={site.facebook} />
      <meta property="og:description" content={props.description} />

      <meta name="twitter:card" content="summary_large_image"/>
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:card" content="summary" />

      <script async src={`https://www.googletagmanager.com/gtag/js?id=${site.google_analytics}`}></script>
      <script dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${site.google_analytics}');
      ` }} />
    </>
  );
};

export default SEO;
