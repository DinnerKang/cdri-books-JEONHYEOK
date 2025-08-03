import { useState, useEffect, useRef, useCallback } from 'react';
import type { Book } from '@/services/search';

/**
 * 찜한 책 목록을 관리하는 커스텀 훅
 *
 * 주요 기능:
 * - localStorage에서 찜한 책 목록 로드
 * - 무한 스크롤을 통한 페이지네이션 (PAGE_SIZE 개씩 로드)
 * - IntersectionObserver를 이용한 자동 로딩
 * - 찜 제거 기능
 */

export interface UseFavoriteBooksReturn {
  displayedBooks: Book[]; // 현재 화면에 표시할 책 목록
  totalCount: number; // 전체 찜한 책 개수
  removeFavorite: (isbn: string) => void; // 찜 제거 함수
  lastItemRef: (node: HTMLLIElement | null) => void; // 마지막 아이템에 연결할 ref 콜백
}

const PAGE_SIZE = 10;
export const useFavoriteBooks = (): UseFavoriteBooksReturn => {
  const [allFavoriteBooks, setAllFavoriteBooks] = useState<Book[]>([]); // localStorage에서 가져온 모든 찜한 책들
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]); // 현재 화면에 표시되는 책들 (페이지네이션된 결과)
  const [isIntersecting, setIsIntersecting] = useState(false); // 마지막 아이템이 뷰포트에 보이는지 여부
  const observerRef = useRef<IntersectionObserver | null>(null); // IntersectionObserver 인스턴스 참조

  // 초기 데이터 로드
  useEffect(() => {
    // localStorage에서 찜한 책 목록을 가져와서 첫 페이지(10개)만 표시
    const favoriteBooks = localStorage.getItem('favoriteBooks');
    const bookList = favoriteBooks ? JSON.parse(favoriteBooks) : [];
    setAllFavoriteBooks(bookList);
    setDisplayedBooks(bookList.slice(0, PAGE_SIZE)); // 첫 10개만 표시
  }, []);

  // 무한 스크롤을 위한 마지막 아이템 추적
  const lastItemRef = useCallback((node: HTMLLIElement | null) => {
    // 기존 observer가 있다면 연결 해제
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 새로운 마지막 아이템이 있을 때만 observer 설정
    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          // 마지막 아이템이 보이거나 안보이는 상태를 업데이트
          setIsIntersecting(entry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: '200px',
        }
      );
      observerRef.current.observe(node);
    }
  }, []);

  useEffect(() => {
    // 컴포넌트가 언마운트될 때 observer 정리하여 메모리 누수 방지
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 다음 페이지 로드 로직
  const loadNextPage = useCallback(() => {
    // 더 이상 로드할 책이 없으면 중단
    if (allFavoriteBooks.length === displayedBooks.length) {
      return;
    }

    // 현재 표시된 책 개수를 기준으로 다음 페이지 시작 인덱스 계산
    // 예: 현재 5개 표시 중 → 인덱스 5부터 15까지 가져오기
    const nextPageStartIndex = displayedBooks.length;
    const nextPageBooks = allFavoriteBooks.slice(
      nextPageStartIndex,
      nextPageStartIndex + PAGE_SIZE
    );

    // 가져올 책이 있으면 기존 목록에 추가
    if (nextPageBooks.length > 0) {
      setDisplayedBooks(prev => [...prev, ...nextPageBooks]);
    }
  }, [allFavoriteBooks, displayedBooks.length]);

  useEffect(() => {
    // 마지막 아이템이 화면에 보이면 다음 페이지 로드
    if (isIntersecting) {
      loadNextPage();
      setIsIntersecting(false); // 중복 로딩 방지를 위해 플래그 리셋
    }
  }, [isIntersecting, loadNextPage]);

  /**
   * 특정 책을 찜 목록에서 제거
   * - allFavoriteBooks와 displayedBooks 모두에서 제거
   * - localStorage도 업데이트
   */
  const removeFavorite = useCallback(
    (isbn: string) => {
      const updatedList = allFavoriteBooks.filter(
        (book: Book) => book.isbn !== isbn
      );
      setAllFavoriteBooks(updatedList); // 전체 목록에서 제거
      setDisplayedBooks(prev =>
        prev.filter((book: Book) => book.isbn !== isbn)
      ); // 표시 목록에서도 제거
      localStorage.setItem('favoriteBooks', JSON.stringify(updatedList)); // localStorage 동기화
    },
    [allFavoriteBooks]
  );

  return {
    displayedBooks,
    totalCount: allFavoriteBooks.length,
    removeFavorite,
    lastItemRef,
  };
};
