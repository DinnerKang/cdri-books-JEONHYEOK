export interface Book {
  title: string;
  authors: string[];
  publisher: string;
  thumbnail: string;
  url: string;
  isbn: string;
  datetime: string;
  contents: string;
  price: number;
  sale_price: number;
  status: string;
  translators?: string[];
}

export interface SearchResponse {
  documents: Book[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export type SearchTarget = 'title' | 'person' | 'publisher' | '';
