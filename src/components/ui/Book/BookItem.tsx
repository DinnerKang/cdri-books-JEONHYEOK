import type { Book } from '@/services/search';
import { useState, memo } from 'react';
import cn from 'classnames';

import styles from './BookItem.module.scss';
import { Button } from '../Button';
import ArrowDown from '@/assets/icons/arrow_down.svg';
import LikeFill from '@/assets/icons/like_fill.svg';
import LikeEmpty from '@/assets/icons/like_line.svg';

interface BookItemProps extends Book {
  isFavorite: boolean;
  removeFavorite?: () => void; // 부모에 알려줘야할 때 사용
}

const BookItem = memo((props: BookItemProps) => {
  const [showDetail, setShowDetail] = useState(false);
  const {
    thumbnail,
    title,
    authors,
    sale_price,
    url,
    isbn,
    isFavorite,
    price,
  } = props;
  const [isLike, setIsLike] = useState(isFavorite);

  const handleLike = () => {
    const favoriteBooks = localStorage.getItem('favoriteBooks');
    const favorites: Book[] = favoriteBooks ? JSON.parse(favoriteBooks) : [];

    // 찜 삭제
    if (isLike) {
      if (props.removeFavorite) {
        props.removeFavorite();
      }
      const updatedFavorites = favorites.filter(
        (book: Book) => book.isbn !== isbn
      );
      localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));
      setIsLike(false);
    } else {
      const updatedFavorites = [...favorites, props];
      localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));
      setIsLike(true);
    }
  };
  if (showDetail) {
    return (
      <DetailBook
        {...props}
        closeDetail={() => setShowDetail(false)}
        isLike={isLike}
        handleLike={handleLike}
      />
    );
  }

  return (
    <div className={styles.book}>
      <div className={styles.book_thumbnail}>
        <img src={thumbnail} alt={`${title} 책 이미지`} />
        <div className={styles.book_like} onClick={() => handleLike()}>
          {isLike ? (
            <img src={LikeFill} alt="찜 상태" />
          ) : (
            <img src={LikeEmpty} alt="찜하지 않은 상태" />
          )}
        </div>
      </div>
      <div className={styles.book_info}>
        <div>{title}</div>
        <div>{authors.join(', ')}</div>
      </div>
      <div className={styles.book_price}>
        {sale_price < 0
          ? `${price.toLocaleString()}원`
          : `${sale_price.toLocaleString()}원`}
      </div>
      <div className={styles.book_button}>
        <Button onClick={() => window.open(url, '_blank')}>구매하기</Button>
        <Button variant="secondary" onClick={() => setShowDetail(!showDetail)}>
          상세보기 <img src={ArrowDown} alt="arrow_down" />
        </Button>
      </div>
    </div>
  );
});

interface DetailBookProps extends Book {
  closeDetail: () => void;
  handleLike: () => void;
  isLike: boolean;
}

const DetailBook = ({
  thumbnail,
  title,
  authors,
  contents,
  sale_price,
  url,
  price,
  isLike,
  closeDetail,
  handleLike,
}: DetailBookProps) => {
  return (
    <div className={styles.detail_book}>
      <div className={styles.detail_left}>
        <img src={thumbnail} alt={`${title} 책 이미지`} />
        <div className={styles.book_like} onClick={() => handleLike()}>
          {isLike ? (
            <img src={LikeFill} alt="찜 상태" />
          ) : (
            <img src={LikeEmpty} alt="찜하지 않은 상태" />
          )}
        </div>
      </div>
      <div className={styles.detail_center}>
        <div className={styles.detail_header}>
          <div className={styles.detail_info}>
            <div className={styles.detail_title}>{title}</div>
            <div className={styles.detail_author}>{authors.join(', ')}</div>
          </div>
        </div>

        <div className={styles.detail_content}>
          <div className={styles.content_title}>책소개</div>
          <div className={styles.content_text}>{contents}</div>
        </div>
      </div>

      <div className={styles.detail_right}>
        <Button
          variant="secondary"
          className={styles.button_close}
          onClick={closeDetail}
        >
          상세보기 <img src={ArrowDown} alt="arrow_down" />
        </Button>
        <div className={styles.price_info}>
          <div
            className={cn(
              sale_price >= 0 ? styles.original_price : styles.sale_price
            )}
          >
            원가 <span>{price.toLocaleString()}원</span>
          </div>
          {sale_price >= 0 && (
            <div className={styles.sale_price}>
              할인가 <span>{sale_price.toLocaleString()}원</span>
            </div>
          )}
        </div>
        <Button
          className={styles.button_buy}
          onClick={() => window.open(url, '_blank')}
        >
          구매하기
        </Button>
      </div>
    </div>
  );
};

export default BookItem;
