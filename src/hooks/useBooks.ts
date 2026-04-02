import { useState, useEffect, useCallback, useRef } from 'react';
import { searchBooks } from '../services/booksApi';
import { useDebounce } from './useDebounce';
import type { Volume, OrderBy } from '../types';

const PAGE_SIZE = 20;

interface UseBooksOptions {
  query: string;
  category?: string;
  orderBy?: OrderBy;
}

interface UseBooksReturn {
  books: Volume[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  totalItems: number;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

export function useBooks({ query, category, orderBy = 'relevance' }: UseBooksOptions): UseBooksReturn {
  const [books, setBooks] = useState<Volume[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 400);

  // Ref tracks the active search key so stale responses are ignored
  const searchKeyRef = useRef<string>('');

  const fetchPage = useCallback(
    async (index: number, isLoadMore: boolean) => {
      const trimmed = debouncedQuery.trim();
      if (!trimmed) {
        setBooks([]);
        setTotalItems(0);
        return;
      }

      const key = `${trimmed}|${category}|${orderBy}|${index}`;
      searchKeyRef.current = key;

      isLoadMore ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const result = await searchBooks({
          query: trimmed,
          category,
          orderBy,
          startIndex: index,
          maxResults: PAGE_SIZE,
        });

        // Discard if a newer search started while this one was in-flight
        if (searchKeyRef.current !== key) return;

        setTotalItems(result.totalItems);
        setBooks(prev => (isLoadMore ? [...prev, ...(result.items ?? [])] : (result.items ?? [])));
      } catch (err) {
        if (searchKeyRef.current !== key) return;
        setError(err instanceof Error ? err.message : 'Erro ao buscar livros.');
      } finally {
        if (searchKeyRef.current === key) {
          isLoadMore ? setLoadingMore(false) : setLoading(false);
        }
      }
    },
    [debouncedQuery, category, orderBy],
  );

  // New query/filter → reset and fetch from page 0
  useEffect(() => {
    setStartIndex(0);
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    const next = startIndex + PAGE_SIZE;
    setStartIndex(next);
    fetchPage(next, true);
  }, [startIndex, fetchPage]);

  const reset = useCallback(() => {
    setBooks([]);
    setTotalItems(0);
    setStartIndex(0);
    setError(null);
  }, []);

  const hasMore = books.length < totalItems;

  return { books, loading, loadingMore, error, totalItems, hasMore, loadMore, reset };
}
