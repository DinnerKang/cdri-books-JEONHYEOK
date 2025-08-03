import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.scss';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.header_container}>
        <Link to="/">
          <h1 className={styles.header_title}>CERTICOS BOOKS</h1>
        </Link>
        <nav className={styles.header_nav}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${styles.header_nav_link} ${isActive ? styles.active : ''}`
            }
          >
            도서 검색
          </NavLink>
          <NavLink
            to="/favorite"
            className={({ isActive }) =>
              `${styles.header_nav_link} ${isActive ? styles.active : ''}`
            }
          >
            내가 찜한 책
          </NavLink>
        </nav>
        <div />
      </div>
    </header>
  );
};

export default Header;
