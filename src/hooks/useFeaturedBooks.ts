import { useState, useEffect } from 'react';
import { searchBooks } from '../services/booksApi';
import type { Volume } from '../types';

interface UseFeaturedBooksReturn {
  books: Volume[];
  loading: boolean;
  error: string | null;
}

/**
 * Busca automaticamente 10 livros em destaque na montagem do componente.
 * Usado na seção "Destaques" da Home.
 */
export function useFeaturedBooks(): UseFeaturedBooksReturn {
  const [books, setBooks] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        const result = await searchBooks({
          query: 'literatura clássica',
          orderBy: 'relevance',
          maxResults: 10,
        });
        if (!cancelled) setBooks(result.items ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Erro ao carregar destaques.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { books, loading, error };
}
