import { useState, useEffect, useRef } from 'react';
import cn from 'classnames';
import { Button } from '@/components/ui/Button';
import SearchIcon from '@/assets/icons/search.svg';
import CloseIcon from '@/assets/icons/close.svg';
import styles from './SearchInput.module.scss';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  placeholder: string;
  onSearch: (searchText: string) => void;
}

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_SEARCH_HISTORY = 8;

const SearchInput = ({
  className,
  placeholder,
  onSearch,
  ...props
}: SearchInputProps) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 최근 검색어를 localStorage에 저장
  const saveRecentSearches = (searchList: string[]) => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searchList));
    setSearchHistory(searchList);
  };

  // 최근 검색어 업데이트
  const updateHistory = (searchTerm: string) => {
    const newSearchList = [
      searchTerm,
      ...searchHistory.filter(history => history !== searchTerm),
    ].slice(0, MAX_SEARCH_HISTORY);

    saveRecentSearches(newSearchList);
  };

  const handleSearch = (searchTerm: string) => {
    onSearch(searchTerm);
    setShowHistory(false);
    updateHistory(searchTerm);
  };

  // localStorage에서 최근 검색어 불러오기
  useEffect(() => {
    const savedList = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (savedList) {
      try {
        setSearchHistory(JSON.parse(savedList));
      } catch (error) {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        console.error(error);
      }
    }
  }, []);

  // 검색어 추가
  const addRecentSearch = (searchText: string) => {
    const text = searchText.trim();
    if (!text) return;

    updateHistory(text);
  };

  // 검색어 삭제
  const removeRecentSearch = (index: number) => {
    const newSearchList = searchHistory.filter((_, idx) => idx !== index);
    saveRecentSearches(newSearchList);
  };

  // 최근 검색어 클릭 시 입력창에 설정
  const handleRecentSearchClick = (searchText: string) => {
    inputRef.current!.value = searchText;
    handleSearch(searchText);
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = inputRef.current?.value.trim();
      if (searchTerm) {
        addRecentSearch(searchTerm);
        handleSearch(searchTerm);
      }
    }
  };

  // 포커스 처리
  const handleFocus = () => {
    setShowHistory(true);
  };

  // 컴포넌트 전체에서 포커스가 벗어날 때만 검색 기록 닫기
  const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // relatedTarget이 컨테이너 내부에 있는지 확인
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setShowHistory(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(styles.inputWrapper, className, {
        [styles.active]: showHistory,
      })}
      onBlur={handleContainerBlur}
      tabIndex={-1}
    >
      <img src={SearchIcon} alt="검색 아이콘" />
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...props}
      />

      {showHistory && searchHistory.length > 0 && (
        <ul className={styles.searchHistory}>
          {searchHistory.map((searchText, index) => (
            <li
              key={searchText + index}
              className={styles.searchHistoryItem}
              onClick={() => handleRecentSearchClick(searchText)}
            >
              <span className={styles.searchHistoryItemText}>{searchText}</span>
              <Button
                className={styles.deleteButton}
                variant="outline"
                onClick={e => {
                  e.stopPropagation();
                  removeRecentSearch(index);
                }}
                type="button"
                aria-label="검색어 삭제"
              >
                <img src={CloseIcon} alt="검색어 삭제" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchInput;
