import axios from 'axios';
import type { BookSearchParams, BooksApiResponse, Volume } from '../types';

const api = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1',
  params: { key: import.meta.env.VITE_API_KEY },
});

export async function searchBooks(params: BookSearchParams): Promise<BooksApiResponse> {
  const { query, category, orderBy = 'relevance', startIndex = 0, maxResults = 20 } = params;

  const q = category ? `${query}+subject:${encodeURIComponent(category)}` : query;

  const { data } = await api.get<BooksApiResponse>('/volumes', {
    params: { q, orderBy, startIndex, maxResults },
  });

  return data;
}

export async function getBookById(id: string): Promise<Volume> {
  const { data } = await api.get<Volume>(`/volumes/${id}`);
  return data;
}
