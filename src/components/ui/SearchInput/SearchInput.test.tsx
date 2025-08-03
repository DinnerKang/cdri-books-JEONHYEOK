import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SearchInput from './SearchInput';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SearchInput', () => {
  const mockOnSearch = vi.fn();

  const defaultProps = {
    placeholder: '검색어를 입력하세요',
    onSearch: mockOnSearch,
  };

  beforeEach(() => {
    // 각 테스트 전에 localStorage와 mock 함수들을 초기화
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 각 테스트 후에 localStorage 정리
    localStorageMock.clear();
  });

  it('1. 사용자가 검색어를 입력하고 Enter를 누르면 onSearch가 호출된다', async () => {
    const searchText = '테스트 검색어';

    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox');

    // 검색어 입력 후 Enter 키를 눌러서 onSearch 이벤트 발생
    await userEvent.type(input, `${searchText}{enter}`);

    expect(mockOnSearch).toHaveBeenCalledWith(searchText);
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('2. 입력창에 값이 있을 때 Enter 키만 눌러도 onSearch가 발생한다', async () => {
    const searchText = '엔터 테스트';

    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox');

    // 먼저 검색어 입력
    await userEvent.type(input, searchText);

    // Enter 키 이벤트 발생
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSearch).toHaveBeenCalledWith(searchText);
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('3. 검색한 최근 검색어가 보인다', async () => {
    const searchText = '최근 검색어 테스트';

    // 먼저 검색어를 localStorage에 저장
    localStorageMock.setItem('recentSearches', JSON.stringify([searchText]));

    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox');

    // 입력창에 포커스를 주면 최근 검색어가 보여야 함
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText(searchText)).toBeInTheDocument();
    });
  });

  it('4. 8개 이상 있을 때 onSearch할 경우 오래된 것이 삭제되고 새로운것이 저장된다', async () => {
    // 8개의 검색어를 미리 저장
    const searchList = [
      '검색어1',
      '검색어2',
      '검색어3',
      '검색어4',
      '검색어5',
      '검색어6',
      '검색어7',
      '검색어8',
    ];
    localStorageMock.setItem('recentSearches', JSON.stringify(searchList));

    const newSearchText = '새로운 검색어';

    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox');

    // 새로운 검색어 입력 후 Enter 키를 눌러서 새로운 검색어 추가
    await userEvent.type(input, newSearchText);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // localStorage에서 저장된 검색어 확인
    const savedSearches = JSON.parse(
      localStorageMock.getItem('recentSearches') || '[]'
    );

    expect(savedSearches).toHaveLength(8);
    expect(savedSearches[0]).toBe(newSearchText); // 새로운 검색어가 첫 번째
    expect(savedSearches).not.toContain('검색어8'); // 가장 오래된 검색어가 삭제됨
    expect(savedSearches).toContain('검색어1'); // 두 번째로 오래된 검색어는 여전히 존재
  });

  it('5. 검색어 삭제 버튼을 누르면 해당 검색어가 삭제된다', async () => {
    const searchTexts = ['삭제될 검색어', '유지될 검색어1', '유지될 검색어2'];
    localStorageMock.setItem('recentSearches', JSON.stringify(searchTexts));

    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox');

    // 입력창에 포커스를 주어 최근 검색어 목록 표시
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText('삭제될 검색어')).toBeInTheDocument();
    });

    // 삭제 버튼 찾기 및 클릭
    const deleteButtons = screen.getAllByRole('button', {
      name: '검색어 삭제',
    });
    await userEvent.click(deleteButtons[0]); // 첫 번째 검색어의 삭제 버튼 클릭

    // localStorage에서 해당 검색어가 삭제되었는지 확인
    const savedSearches = JSON.parse(
      localStorageMock.getItem('recentSearches') || '[]'
    );

    expect(savedSearches).toHaveLength(2);
    expect(savedSearches).not.toContain('삭제될 검색어');
    expect(savedSearches).toContain('유지될 검색어1');
    expect(savedSearches).toContain('유지될 검색어2');

    // UI에서도 해당 검색어가 사라졌는지 확인
    await waitFor(() => {
      expect(screen.queryByText('삭제될 검색어')).not.toBeInTheDocument();
    });
  });

  it('최근 검색어 클릭 시 입력창에 설정되고 onSearch가 호출된다', async () => {
    const searchText = '클릭 테스트';
    localStorageMock.setItem('recentSearches', JSON.stringify([searchText]));

    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox');

    // 입력창에 포커스를 주어 최근 검색어 목록 표시
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText(searchText)).toBeInTheDocument();
    });

    // 최근 검색어 클릭
    const recentSearchItem = screen.getByText(searchText);
    await userEvent.click(recentSearchItem);

    // 입력창에 값이 설정되었는지 확인
    expect(input).toHaveValue(searchText);

    // onSearch가 호출되었는지 확인
    expect(mockOnSearch).toHaveBeenCalledWith(searchText);
  });
});
