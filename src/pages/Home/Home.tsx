import { useState } from 'react';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Layout from '@/components/layout/Layout';
import EmptyImg from '@/assets/icons/icon_book.svg';
import styles from './Home.module.scss';
import { Button } from '@/components/ui/Button';
import { BookItem } from '@/components/ui/Book';
import { useSearchBooks } from './hooks';
import type { Book, SearchTarget } from '@/services/search';
import DetailSearch from './components/DetailSearch';

const Home = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [searchParams, setSearchParams] = useState({
    text: '',
    target: '' as SearchTarget,
  });

  const {
    bookList,
    isLoading,
    isFetchingNextPage,
    error,
    lastItemRef,
    totalCount,
    hasData,
  } = useSearchBooks(searchParams);

  const search = (text: string, target?: SearchTarget) => {
    setSearchParams({ text, target: target || '' });
  };

  const favoriteBooks = localStorage.getItem('favoriteBooks');
  const favoriteBookList: Book[] = favoriteBooks
    ? JSON.parse(favoriteBooks)
    : [];

  return (
    <Layout>
      <div className={styles.home_container}>
        <article className={styles.search}>
          <h2 className={styles.search_title}>도서 검색</h2>
          <div className={styles.search_input}>
            <SearchInput placeholder="검색어를 입력하세요" onSearch={search} />
            <div className={styles.search_detail_container}>
              <Button
                className={styles.search_detail}
                variant="outline"
                onClick={() => setShowDetail(true)}
              >
                상세검색
              </Button>
              <div className={styles.search_detail_modal}>
                {showDetail && (
                  <DetailSearch
                    closeDetail={() => setShowDetail(false)}
                    onDetailSearch={(text, target) => search(text, target)}
                  />
                )}
              </div>
            </div>
          </div>
        </article>

        <article className={styles.result}>
          <h5 className={styles.result_title}>
            도서 검색 결과 &nbsp;&nbsp;총 <span>{totalCount}</span>건
            {isLoading && ' (검색 중...)'}
            {isFetchingNextPage && ' (추가 로딩 중...)'}
          </h5>

          {error && (
            <div className={styles.result_error}>
              <p>검색 중 오류가 발생했습니다. 다시 시도해주세요.</p>
            </div>
          )}

          {!hasData && !isLoading && (
            <div className={styles.result_empty}>
              <img src={EmptyImg} alt="검색 결과 없음" />
              <p>검색된 결과가 없습니다.</p>
            </div>
          )}

          {hasData && (
            <ul className={styles.result_list}>
              {bookList.map((book, index) => (
                <li
                  key={`${book.isbn}_${book.title}_${index}`}
                  className={styles.result_item}
                  ref={index === bookList.length - 1 ? lastItemRef : null}
                >
                  <BookItem
                    {...book}
                    isFavorite={favoriteBookList.some(
                      favBook => favBook.isbn === book.isbn
                    )}
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

export default Home;
