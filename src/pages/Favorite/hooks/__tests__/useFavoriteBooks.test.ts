import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFavoriteBooks } from '../useFavoriteBooks';
import type { Book } from '@/services/search';

// localStorage 모킹
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// 테스트용 책 데이터
const mockFavoriteBooks: Book[] = [
  {
    title: '즐겨찾기 책 1',
    authors: ['작가1'],
    publisher: '출판사1',
    thumbnail: 'https://example.com/book1.jpg',
    url: 'https://example.com/book1',
    isbn: '1111111111',
    datetime: '2023-01-01T00:00:00Z',
    contents: '내용 1',
    price: 10000,
    sale_price: 9000,
    status: 'normal',
  },
  {
    title: '즐겨찾기 책 2',
    authors: ['작가2'],
    publisher: '출판사2',
    thumbnail: 'https://example.com/book2.jpg',
    url: 'https://example.com/book2',
    isbn: '2222222222',
    datetime: '2023-01-02T00:00:00Z',
    contents: '내용 2',
    price: 15000,
    sale_price: 13500,
    status: 'normal',
  },
];

describe('useFavoriteBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('localStorage에서 즐겨찾기 책들을 잘 불러온다', () => {
    // localStorage에 데이터 모킹
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockFavoriteBooks));

    const { result } = renderHook(() => useFavoriteBooks());

    expect(result.current.displayedBooks).toEqual(mockFavoriteBooks);
    expect(result.current.totalCount).toBe(2);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('favoriteBooks');
  });

  it('localStorage가 비어있을 때 빈 배열을 반환한다', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useFavoriteBooks());

    expect(result.current.displayedBooks).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('removeFavorite가 잘 동작한다', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockFavoriteBooks));

    const { result } = renderHook(() => useFavoriteBooks());

    // 첫 번째 책 제거
    act(() => {
      result.current.removeFavorite('1111111111');
    });

    // 제거된 책이 displayedBooks에서 사라졌는지 확인
    expect(result.current.displayedBooks).toEqual([mockFavoriteBooks[1]]);
    expect(result.current.totalCount).toBe(1);

    // localStorage에 업데이트된 데이터가 저장되었는지 확인
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'favoriteBooks',
      JSON.stringify([mockFavoriteBooks[1]])
    );
  });
});
