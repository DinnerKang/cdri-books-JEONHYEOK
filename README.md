# CDRI - 카카오 도서 검색 애플리케이션

## 프로젝트 개요

React + TypeScript + Vite로 구축된 카카오 도서 검색 애플리케이션입니다. 도서 검색, 상세 정보 확인, 찜 목록 관리 기능을 제공합니다.

### 주요 기능

- 카카오 도서 검색 API를 통한 실시간 도서 검색
- 제목, 저자, 출판사별 상세 검색
- 무한 스크롤을 통한 추가 결과 로드
- 찜 목록 추가/제거 및 관리

## 실행 방법 및 환경 설정

### 사전 요구사항

- 카카오 REST API 키

### 설치 및 실행

1. **의존성 설치**

```bash
yarn install
```

2. **환경 변수 설정**
   프로젝트 루트에 `.env` 파일 생성:

```bash
VITE_KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

3. **개발 서버 실행**

```bash
yarn dev
```

4. **빌드**

```bash
yarn build
```

5. **테스트 실행**

```bash
yarn test
```

## 폴더 구조

```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
│   ├── layout/       # 공통 레이아웃
│   └── ui/           # 공통 UI
├── pages/            # 페이지 컴포넌트
│   ├── Home/         # 검색 페이지
│   └── Favorite/     # 찜 목록 페이지
├── services/         # API 서비스
└── styles/           # 전역 스타일
```

## 주요 코드 설명

### 기능별 컴포넌트 분리

**검색 기능**

- `SearchInput`: 검색어 입력 및 최근 검색어 관리
- `DetailSearch`: 상세 검색 필터 (제목/저자/출판사)
- `useSearchBooks`: 검색 API 호출 및 상태 관리

**무한 스크롤**

- `useScrollBooks`: IntersectionObserver를 활용한 자동 페이지 로딩
- React Query의 `useInfiniteQuery`로 페이지네이션 처리

**찜 목록 관리**

- `useFavoriteBooks`: localStorage 기반 찜 목록 상태 관리
- 삭제 시 자동 다음 페이지 로딩 로직 포함

**UI 컴포넌트**

- `BookItem`: 도서 정보 표시 및 찜하기 기능
- `Button`, `Input`, `Select`: 재사용 가능한 기본 컴포넌트

## 라이브러리 선택 이유

### React Query

- **API 비용 감소**: 중복 요청 방지 및 캐싱으로 불필요한 API 호출 최소화
- **무한 스크롤 최적화**: `useInfiniteQuery`를 통한 효율적인 페이지네이션

## 강조하고 싶은 기능

### 1. 찜목록 삭제 후 다음 페이지 자동 로딩

찜목록에서 항목을 삭제할 때, IntersectionObserver를 활용해 마지막 아이템이 화면에 보이면 자동으로 다음 페이지를 로드합니다.

```typescript
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
```

**핵심 로직**

- 삭제로 인해 아이템 수가 줄어들면 마지막 아이템이 화면에 노출
- IntersectionObserver가 이를 감지하여 자동으로 `loadNextPage` 호출
- 사용자는 별도 액션 없이 자연스러운 무한 스크롤 경험

### 2. 유닛 테스트

주요 로직과 컴포넌트에 대한 철저한 테스트를 구현했습니다.

**커스텀 훅 테스트**

- `useFavoriteBooks`: 찜목록 관리 로직, localStorage 연동
- `useScrollBooks`: 무한 스크롤 및 API 상태 관리

**공통 컴포넌트 테스트**

- `SearchInput`: 최근 검색어 8개 제한, 검색 기능
- `BookItem`: 찜하기/해제, 상세보기 토글
- `Button`, `Select`: 기본 상호작용 테스트
