import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './DetailSearch.module.scss';
import Close from '@/assets/icons/close_gray.svg';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { SearchTarget } from '@/services/search';

interface DetailSearchProps {
  closeDetail: () => void;
  onDetailSearch: (searchText: string, searchTarget: SearchTarget) => void;
}

const options = [
  { value: 'title', label: '제목' },
  { value: 'person', label: '저자' },
  { value: 'publisher', label: '출판사' },
];

const DetailSearch = ({ closeDetail, onDetailSearch }: DetailSearchProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<SearchTarget>('title');

  const handleDetailSearch = () => {
    onDetailSearch(searchValue, searchType);
    closeDetail();
  };

  return (
    <div className={styles.detail_container}>
      <div className={styles.detail_close}>
        <img src={Close} alt="검색 상세 닫기" onClick={closeDetail} />
      </div>
      <div className={styles.detail_search}>
        <Select
          className={styles.select}
          options={options}
          value={searchType}
          onChange={value => setSearchType(value as SearchTarget)}
        />
        <Input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="검색어를 입력"
        />
      </div>
      <div>
        <Button
          variant="primary"
          className={styles.button_search}
          onClick={handleDetailSearch}
        >
          검색하기
        </Button>
      </div>
    </div>
  );
};

export default DetailSearch;
