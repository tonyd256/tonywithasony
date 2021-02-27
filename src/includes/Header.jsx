import Link from 'next/link';
import { useRouter } from 'next/router';
import Title from '../assets/Title';

const Header = props => {
  const router = useRouter();
  const page = router.pathname;

  return (
    <header className="lg:px-8 px-6 flex flex-wrap lg:justify-start justify-between items-center lg:py-4 py-4">
      <div className="lg:mr-6">
        <a href="/">
          <Title className="sm:h-6 h-5" />
        </a>
      </div>
      <label htmlFor="menu-toggle" className="pointer-cursor lg:hidden block">Menu</label>
      <input className="hidden" id="menu-toggle" type="checkbox" />

      <div className="lg:max-h-full max-h-0 overflow-y-hidden lg:flex lg:items-center lg:w-auto w-full transition-all duration-500" id="menu">
        <nav>
          <ul className="lg:flex items-center justify-between lg:text-left text-right text-lg font-normal uppercase text-gray-400 pt-4 lg:pt-0 tracking-wider">
            {props.albums.map(album => {
              const active = page === '/albums/'+album.name || (page === "/" && props.albums[0].name === album.name);
              return (
                <li key={album.name}>
                  <Link href={props.albums[0].name === album.name ? "/" : "/albums/"+album.name}>
                    <a className={`lg:px-8 lg:pt-5 py-3 px-0 block hover:text-black${active ? ' text-black' : ''}`}>{album.name}</a>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/about">
                <a className={`lg:px-8 lg:pt-5 py-3 px-0 block hover:text-black${page === '/about' ? ' text-black' : ''}`}>about</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
