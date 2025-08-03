import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useSearchBooks } from '../useSearchBooks';
import * as searchService from '@/services/search';
import type { Book } from '@/services/search';

// fetchSearch API mock
vi.mock('@/services/search', () => ({
  fetchSearch: vi.fn(),
}));

const mockFetchSearch = vi.mocked(searchService.fetchSearch);

// 테스트용 책 데이터
const mockBooks: Book[] = [
  {
    title: '테스트 책 1',
    authors: ['작가1'],
    publisher: '출판사1',
    thumbnail: 'https://example.com/book1.jpg',
    url: 'https://example.com/book1',
    isbn: '1234567890',
    datetime: '2023-01-01T00:00:00Z',
    contents: '테스트 내용 1',
    price: 10000,
    sale_price: 9000,
    status: 'normal',
  },
  {
    title: '테스트 책 2',
    authors: ['작가2'],
    publisher: '출판사2',
    thumbnail: 'https://example.com/book2.jpg',
    url: 'https://example.com/book2',
    isbn: '0987654321',
    datetime: '2023-01-02T00:00:00Z',
    contents: '테스트 내용 2',
    price: 15000,
    sale_price: 13500,
    status: 'normal',
  },
];

// QueryClient wrapper 생성
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSearchBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('검색어가 있을 때 API를 호출하고 데이터를 반환한다', async () => {
    // API 응답 mock
    mockFetchSearch.mockResolvedValue({
      documents: mockBooks,
      meta: {
        total_count: 2,
        is_end: true,
      },
    });

    const { result } = renderHook(
      () => useSearchBooks({ text: '테스트', target: '' }),
      { wrapper: createWrapper() }
    );

    // 초기 상태 확인 (로딩 중에는 데이터가 없음)
    expect(result.current.isLoading).toBe(true);
    expect(result.current.bookList).toEqual([]);
    expect(result.current.hasData).toBe(false);

    // API 호출 완료까지 대기
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // API 호출 확인
    expect(mockFetchSearch).toHaveBeenCalledWith({
      text: '테스트',
      page: 1,
      target: '',
    });

    // 결과 확인 (로딩 완료 후 데이터가 있음)
    expect(result.current.bookList).toEqual(mockBooks);
    expect(result.current.totalCount).toBe(2);
    expect(result.current.hasData).toBe(true);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('target 파라미터가 올바르게 전달된다', async () => {
    mockFetchSearch.mockResolvedValue({
      documents: [mockBooks[0]],
      meta: {
        total_count: 1,
        is_end: true,
      },
    });

    const { result } = renderHook(
      () => useSearchBooks({ text: '테스트', target: 'title' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // API가 올바른 target으로 호출되었는지 확인
    expect(mockFetchSearch).toHaveBeenCalledWith({
      text: '테스트',
      page: 1,
      target: 'title',
    });

    expect(result.current.bookList).toEqual([mockBooks[0]]);
    expect(result.current.totalCount).toBe(1);
  });

  it('빈 검색어일 때는 API를 호출하지 않는다', () => {
    const { result } = renderHook(
      () => useSearchBooks({ text: '', target: '' }),
      { wrapper: createWrapper() }
    );

    expect(mockFetchSearch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.bookList).toEqual([]);
    expect(result.current.hasData).toBe(false);
  });

  it('검색 결과가 없을 때 빈 배열을 반환한다', async () => {
    mockFetchSearch.mockResolvedValue({
      documents: [],
      meta: {
        total_count: 0,
        is_end: true,
      },
    });

    const { result } = renderHook(
      () => useSearchBooks({ text: '존재하지않는책', target: '' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookList).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.hasData).toBe(false);
  });

  it('다음 페이지가 있을 때 hasNextPage가 true이다', async () => {
    mockFetchSearch.mockResolvedValue({
      documents: [mockBooks[0]],
      meta: {
        total_count: 10,
        is_end: false,
      },
    });

    const { result } = renderHook(
      () => useSearchBooks({ text: '테스트', target: '' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(true);
  });
});
