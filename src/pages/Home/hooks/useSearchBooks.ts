import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import {
  fetchSearch,
  type SearchResponse,
  type SearchTarget,
} from '@/services/search';
import type { Book } from '@/services/search';

/**
 * 책 검색 및 무한 스크롤을 관리하는 커스텀 훅
 *
 * 주요 기능:
 * - Kakao API를 통한 책 검색 (제목, 저자, 출판사별 검색 지원)
 * - React Query의 useInfiniteQuery를 이용한 페이지네이션
 * - IntersectionObserver를 이용한 무한 스크롤 자동 로딩
 */

interface UseSearchBooksProps {
  text: string; // 검색할 텍스트
  target: SearchTarget; // 검색 대상 (제목, 저자, 출판사 등)
}

interface UseSearchBooksReturn {
  bookList: Book[]; // 모든 페이지의 책 목록 (평탄화된 결과)
  isLoading: boolean; // 초기 로딩 상태
  isFetchingNextPage: boolean; // 다음 페이지 로딩 상태
  hasNextPage: boolean; // 다음 페이지가 있는지 여부
  error: Error | null; // 에러 상태
  fetchNextPage: () => void; // 다음 페이지 로드 함수
  lastItemRef: (node: HTMLElement | null) => void; // 무한스크롤용 ref
  totalCount: number; // 전체 검색 결과 개수
  hasData: boolean; // 검색 결과가 있는지 여부
}

export const useSearchBooks = ({
  text,
  target,
}: UseSearchBooksProps): UseSearchBooksReturn => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // React Query의 useInfiniteQuery를 사용한 무한 스크롤 검색
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
  } = useInfiniteQuery<
    SearchResponse,
    Error,
    InfiniteData<SearchResponse>,
    string[],
    number
  >({
    queryKey: ['books', text, target],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchSearch({ text, page: pageParam, target }),
    getNextPageParam: (lastPage, allPages) => {
      // API 응답에서 is_end가 true면 더 이상 페이지가 없음
      if (lastPage.meta?.is_end) {
        return undefined;
      }
      return allPages.length + 1;
    },
    enabled: Boolean(text.trim()),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 모든 페이지의 documents를 하나의 배열로 평탄화
  const bookList = data?.pages.flatMap(page => page.documents || []) || [];

  // 무한스크롤을 위한 IntersectionObserver
  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading || isFetchingNextPage) return;

      // 기존 observer가 있다면 연결 해제
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // 새로운 마지막 아이템이 있을 때만 observer 설정
      if (node) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            // 마지막 아이템이 화면에 보이면 다음 페이지 자동 로드
            if (entry.isIntersecting) {
              fetchNextPage();
            }
          },
          {
            threshold: 0.1,
            rootMargin: '200px',
          }
        );
        observerRef.current.observe(node);
      }
    },
    [isLoading, isFetchingNextPage, fetchNextPage]
  );

  return {
    bookList,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    lastItemRef,
    totalCount: data?.pages[0]?.meta?.total_count || 0,
    hasData: bookList.length > 0,
  };
};
