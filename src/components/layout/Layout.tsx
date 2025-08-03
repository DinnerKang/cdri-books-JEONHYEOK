import { type ReactNode } from 'react';
import Header from './Header';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Header />
      <main className={styles.layout_main}>{children}</main>
    </div>
  );
};

export default Layout;
