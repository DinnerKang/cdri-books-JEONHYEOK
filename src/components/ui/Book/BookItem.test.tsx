import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import BookItem from './BookItem';
import type { Book } from '@/services/search';

// SVG imports mock
vi.mock('@/assets/icons/arrow_down.svg', () => ({ default: 'arrow_down.svg' }));
vi.mock('@/assets/icons/like_fill.svg', () => ({ default: 'like_fill.svg' }));
vi.mock('@/assets/icons/like_line.svg', () => ({ default: 'like_line.svg' }));

// window.open mock
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
});

// localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockBook: Book = {
  title: '테스트 책',
  authors: ['테스트 저자1', '테스트 저자2'],
  publisher: '테스트 출판사',
  thumbnail: 'https://example.com/thumbnail.jpg',
  url: 'https://example.com/book',
  isbn: '1234567890123',
  datetime: '2023-01-01T00:00:00.000+09:00',
  contents: '이것은 테스트용 책 소개입니다.',
  price: 15000,
  sale_price: 12000,
  status: 'normal',
};

describe('BookItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('props가 잘 들어왔을 때 렌더링이 잘 된다', () => {
    render(<BookItem {...mockBook} isFavorite={false} />);

    // 책 제목이 표시되는지 확인
    expect(screen.getByText('테스트 책')).toBeInTheDocument();

    // 저자가 표시되는지 확인 (배열을 문자열로 변환해서 표시)
    expect(screen.getByText('테스트 저자1, 테스트 저자2')).toBeInTheDocument();

    // 할인가가 표시되는지 확인
    expect(screen.getByText('12,000원')).toBeInTheDocument();

    // 구매하기 버튼이 있는지 확인
    expect(screen.getByText('구매하기')).toBeInTheDocument();

    // 상세보기 버튼이 있는지 확인
    expect(screen.getByText(/상세보기/)).toBeInTheDocument();
  });

  it('상세보기 버튼 클릭했을 때 상세보기 컴포넌트가 잘 보인다', async () => {
    const user = userEvent.setup();
    render(<BookItem {...mockBook} isFavorite={false} />);

    // 상세보기 버튼 클릭
    const detailButton = screen.getByRole('button', { name: /상세보기/ });
    await user.click(detailButton);

    // 상세보기에서만 나타나는 "책소개" 텍스트가 보이는지 확인
    expect(screen.getByText('책소개')).toBeInTheDocument();

    // 책 내용이 표시되는지 확인
    expect(
      screen.getByText('이것은 테스트용 책 소개입니다.')
    ).toBeInTheDocument();

    // 원가와 할인가가 모두 표시되는지 확인
    expect(screen.getByText(/원가/)).toBeInTheDocument();
    expect(screen.getByText(/할인가/)).toBeInTheDocument();
  });

  it('찜하기 기능이 잘 작동한다 - 찜하지 않은 상태에서 찜하기', async () => {
    const user = userEvent.setup();
    render(<BookItem {...mockBook} isFavorite={false} />);

    // 찜하지 않은 상태 아이콘이 보이는지 확인
    expect(screen.getByAltText('찜하지 않은 상태')).toBeInTheDocument();

    // 찜하기 버튼 클릭
    const likeButton = screen.getByAltText('찜하지 않은 상태').closest('div');
    await user.click(likeButton!);

    // localStorage에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'favoriteBooks',
      expect.stringContaining(mockBook.isbn)
    );

    // 찜 상태 아이콘으로 변경되었는지 확인
    expect(screen.getByAltText('찜 상태')).toBeInTheDocument();
  });

  it('찜하기 기능이 잘 작동한다 - 찜한 상태에서 찜 해제하기', async () => {
    const user = userEvent.setup();
    const existingFavorites = [mockBook];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingFavorites));

    const removeFavorite = vi.fn();
    render(
      <BookItem
        {...mockBook}
        isFavorite={true}
        removeFavorite={removeFavorite}
      />
    );

    // 찜 상태 아이콘이 보이는지 확인
    expect(screen.getByAltText('찜 상태')).toBeInTheDocument();

    // 찜 해제 버튼 클릭
    const likeButton = screen.getByAltText('찜 상태').closest('div');
    await user.click(likeButton!);

    // removeFavorite 콜백이 호출되었는지 확인
    expect(removeFavorite).toHaveBeenCalledTimes(1);

    // localStorage에서 제거되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'favoriteBooks',
      '[]'
    );

    // 찜하지 않은 상태 아이콘으로 변경되었는지 확인
    expect(screen.getByAltText('찜하지 않은 상태')).toBeInTheDocument();
  });

  it('구매하기 버튼 클릭시 새 창이 열린다', async () => {
    const user = userEvent.setup();
    render(<BookItem {...mockBook} isFavorite={false} />);

    const buyButton = screen.getByText('구매하기');
    await user.click(buyButton);

    expect(window.open).toHaveBeenCalledWith(mockBook.url, '_blank');
  });

  it('sale_price가 0보다 작을 때 원가가 표시된다', () => {
    const bookWithNoDiscount = { ...mockBook, sale_price: -1 };
    render(<BookItem {...bookWithNoDiscount} isFavorite={false} />);

    expect(screen.getByText('15,000원')).toBeInTheDocument();
  });
});
