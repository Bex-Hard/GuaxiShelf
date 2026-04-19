import axios from 'axios';
import type { BookSearchParams, BooksApiResponse, Volume } from '../types';

const api = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1',
  params: { key: import.meta.env.VITE_API_KEY },
});

// Translate HTTP error codes into user-readable Portuguese messages
function toReadableError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 503 || status === 429) {
      throw new Error(
        'A cota diária da API do Google Books foi atingida. Tente novamente amanhã.',
      );
    }
    if (status === 403) {
      throw new Error('Acesso à API negado. Verifique as restrições da chave de API.');
    }
    if (status === 400) {
      throw new Error('Parâmetros de busca inválidos.');
    }
  }
  throw err instanceof Error ? err : new Error('Erro inesperado ao acessar a API.');
}

// Lightweight in-memory cache: avoids duplicate requests on re-mounts /
// React StrictMode double-invocations. Entries expire after 5 minutes.
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { data: BooksApiResponse; ts: number }>();

export async function searchBooks(params: BookSearchParams): Promise<BooksApiResponse> {
  const {
    query,
    category,
    orderBy = 'relevance',
    printType = 'all',
    startIndex = 0,
    maxResults = 20,
  } = params;

  const q = category ? `${query}+subject:${encodeURIComponent(category)}` : query;
  const cacheKey = JSON.stringify({ q, orderBy, printType, startIndex, maxResults });

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const { data } = await api.get<BooksApiResponse>('/volumes', {
      params: { q, orderBy, printType, startIndex, maxResults },
    });
    cache.set(cacheKey, { data, ts: Date.now() });
    return data;
  } catch (err) {
    toReadableError(err);
  }
}

export async function getBookById(id: string): Promise<Volume> {
  try {
    const { data } = await api.get<Volume>(`/volumes/${id}`);
    return data;
  } catch (err) {
    toReadableError(err);
  }
}
