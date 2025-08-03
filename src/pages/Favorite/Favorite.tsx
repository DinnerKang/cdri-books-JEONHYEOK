import Layout from '@/components/layout/Layout';

import type { Book } from '@/services/search';
import { BookItem } from '@/components/ui/Book';
import styles from './Favorite.module.scss';
import { useFavoriteBooks } from './hooks';
import EmptyImg from '@/assets/icons/icon_book.svg';

const FavoritePage = () => {
  const { displayedBooks, totalCount, removeFavorite, lastItemRef } =
    useFavoriteBooks();

  return (
    <Layout>
      <div className={styles.favorite_container}>
        <h2 className={styles.favorite_title}>내가 찜한 책</h2>
        <h5 className={styles.favorite_count}>
          찜한 책 &nbsp;&nbsp;총 <span>{totalCount}</span>건
        </h5>
        <article>
          {totalCount === 0 && (
            <div className={styles.favorite_empty}>
              <img src={EmptyImg} alt="찜 없음" />
              <p>찜한 책이 없습니다.</p>
            </div>
          )}
          {totalCount > 0 && (
            <ul className={styles.favorite_list}>
              {displayedBooks.map((book: Book, index: number) => (
                <li
                  key={`${book.isbn}_${book.title}_${index}`}
                  className={styles.favorite_item}
                  ref={index === displayedBooks.length - 1 ? lastItemRef : null}
                >
                  <BookItem
                    {...book}
                    removeFavorite={() => removeFavorite(book.isbn)}
                    isFavorite
                  />
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </Layout>
  );
};

export default FavoritePage;
