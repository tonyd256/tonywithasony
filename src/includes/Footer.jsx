import Link from 'next/link';
import Instagram from '../assets/Instagram';
import Youtube from '../assets/Youtube';

const Footer = () => {
  return (
    <footer className="mt-4 sm:mx-6 mx-2">
      <hr />
      <div className="flex justify-between my-4">
        <div className="flex text-sm text-gray-500 content-center inline-block">
          <div className="italic text-xs contents">
            &copy; Anthony DiPasquale.
          </div>
          &nbsp;-&nbsp;
          <Link href="/sitemap">
            <a className="hover:text-black text-xs contents">Sitemap</a>
          </Link>
        </div>
        <nav className="flex">
          <a href="https://instagram.com/tonywithasony" target="_blank" rel="noopener noreferrer" className="mr-4">
            <Instagram className="h-6 fill-current text-gray-500 hover:text-black" />
          </a>
          <a href="https://www.youtube.com/channel/UCK3p2i4UGHt1zWFGRh8qmUw" target="_blank" rel="noopener noreferrer">
            <Youtube className="h-6 fill-current text-gray-500 hover:text-black" />
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
