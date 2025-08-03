import type { SearchTarget } from './types';

export const fetchSearch = async ({
  text,
  page,
  target,
}: {
  text: string;
  page: number;
  target: SearchTarget;
}) => {
  const response = await fetch(
    `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(text)}&page=${page}&target=${target}`,
    {
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  return data;
};
