/**
 * useBooks — unit tests
 *
 * The hook talks to booksApi.searchBooks. The real file is NEVER loaded here:
 * the explicit factory passed to jest.mock() intercepts the import before Node
 * can parse booksApi.ts (which uses import.meta.env — a Vite-only feature).
 *
 * useDebounce is also replaced with a pass-through so tests do not need fake
 * timers to wait 400 ms for the debounce window.
 *
 * NOTE on jest.mock() placement:
 *   Even though the comment says "hoisted", jest.mock() calls are only hoisted
 *   at *runtime* by babel-jest — TypeScript's static parser still requires all
 *   `import` declarations to appear before any executable statements. The mocks
 *   are therefore written after the imports; babel-jest moves them above imports
 *   automatically when the test runs.
 *
 * Alternative approach (MSW):
 *   import { setupServer } from 'msw/node';
 *   import { http, HttpResponse } from 'msw';
 *   const server = setupServer(
 *     http.get('https://www.googleapis.com/books/v1/volumes', () =>
 *       HttpResponse.json({ totalItems: 2, items: [book1, book2] }),
 *     ),
 *   );
 *   beforeAll(() => server.listen());
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */

// ── Imports (must be first — babel-jest hoists jest.mock() at runtime) ─────────

import { act, renderHook, waitFor } from '@testing-library/react';
import { searchBooks } from '../services/booksApi';
import { useBooks } from '../hooks/useBooks';
import type { BooksApiResponse } from '../types';

// ── Mocks ─────────────────────────────────────────────────────────────────────
// babel-jest hoists these above the imports at runtime, so the real module files
// are never evaluated (avoiding import.meta.env issues in booksApi.ts).

jest.mock('../services/booksApi', () => ({
  searchBooks: jest.fn(),
  getBookById: jest.fn(),
}));

jest.mock('../hooks/useDebounce', () => ({
  // Replace debounce with an identity fn so queries fire immediately in tests
  useDebounce: <T,>(value: T) => value,
}));

const mockSearchBooks = jest.mocked(searchBooks);

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeApiResponse(count: number, total?: number): BooksApiResponse {
  return {
    kind: 'books#volumes',
    totalItems: total ?? count,
    items: Array.from({ length: count }, (_, i) => ({
      id: `vol-${i}`,
      kind: 'books#volume',
      etag: `etag-${i}`,
      selfLink: '',
      volumeInfo: {
        title: `Book ${i}`,
        authors: [`Author ${i}`],
      },
    })),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useBooks hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Empty query ──────────────────────────────────────────────────────────────

  describe('when query is empty', () => {
    it('does not call searchBooks', () => {
      renderHook(() => useBooks({ query: '' }));
      expect(mockSearchBooks).not.toHaveBeenCalled();
    });

    it('returns empty books array and loading=false', () => {
      const { result } = renderHook(() => useBooks({ query: '' }));
      expect(result.current.books).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('uses defaultQuery when query is empty', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(3, 3));

      const { result } = renderHook(() =>
        useBooks({ query: '', defaultQuery: 'literatura' }),
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockSearchBooks).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'literatura' }),
      );
      expect(result.current.books).toHaveLength(3);
    });
  });

  // ── Loading state ────────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('sets loading=true while the request is in-flight', () => {
      mockSearchBooks.mockReturnValue(new Promise(() => {})); // never resolves

      const { result } = renderHook(() => useBooks({ query: 'react' }));

      expect(result.current.loading).toBe(true);
    });

    it('sets loading=false after a successful response', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(2, 2));

      const { result } = renderHook(() => useBooks({ query: 'react' }));

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('sets loading=false after a failed response', async () => {
      mockSearchBooks.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBooks({ query: 'react' }));

      await waitFor(() => expect(result.current.loading).toBe(false));
    });
  });

  // ── Successful response ──────────────────────────────────────────────────────

  describe('successful API response', () => {
    it('returns the books array from the response', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(5, 42));

      const { result } = renderHook(() => useBooks({ query: 'typescript' }));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.books).toHaveLength(5);
    });

    it('sets totalItems correctly', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(5, 123));

      const { result } = renderHook(() => useBooks({ query: 'javascript' }));

      await waitFor(() => expect(result.current.totalItems).toBe(123));
    });

    it('sets hasMore=true when books.length < totalItems', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(20, 200));

      const { result } = renderHook(() => useBooks({ query: 'js' }));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.hasMore).toBe(true);
    });

    it('sets hasMore=false when all items are loaded', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(3, 3));

      const { result } = renderHook(() => useBooks({ query: 'short list' }));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.hasMore).toBe(false);
    });

    it('handles an empty items array gracefully', async () => {
      mockSearchBooks.mockResolvedValueOnce({ kind: 'books#volumes', totalItems: 0 });

      const { result } = renderHook(() => useBooks({ query: 'xyzzy' }));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.books).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('passes the category filter to searchBooks', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(2, 2));

      const { result } = renderHook(() =>
        useBooks({ query: 'code', category: 'technology' }),
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockSearchBooks).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'technology' }),
      );
    });

    it('passes printType to searchBooks', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(2, 2));

      const { result } = renderHook(() =>
        useBooks({ query: 'science', printType: 'magazines' }),
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockSearchBooks).toHaveBeenCalledWith(
        expect.objectContaining({ printType: 'magazines' }),
      );
    });
  });

  // ── Error handling ───────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('sets the error message when searchBooks rejects', async () => {
      mockSearchBooks.mockRejectedValueOnce(new Error('Request failed'));

      const { result } = renderHook(() => useBooks({ query: 'fail' }));

      await waitFor(() => expect(result.current.error).toBe('Request failed'));
    });

    it('uses a fallback message for non-Error rejections', async () => {
      mockSearchBooks.mockRejectedValueOnce('unexpected string error');

      const { result } = renderHook(() => useBooks({ query: 'fail' }));

      await waitFor(() =>
        expect(result.current.error).toMatch(/erro ao buscar/i),
      );
    });

    it('clears the error when a subsequent query succeeds', async () => {
      mockSearchBooks
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(makeApiResponse(2, 2));

      const { result, rerender } = renderHook(
        ({ query }: { query: string }) => useBooks({ query }),
        { initialProps: { query: 'bad' } },
      );

      await waitFor(() => expect(result.current.error).toBeTruthy());

      rerender({ query: 'good' });

      // Wait for BOTH conditions: error cleared AND books populated.
      // At the moment setError(null) fires, the await searchBooks() hasn't
      // resolved yet — books arrive on the next tick.
      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.books).toHaveLength(2);
      });
    });
  });

  // ── loadMore ─────────────────────────────────────────────────────────────────

  describe('loadMore', () => {
    it('appends books to the existing list on loadMore', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(20, 40));

      const { result } = renderHook(() => useBooks({ query: 'design' }));
      await waitFor(() => expect(result.current.books).toHaveLength(20));

      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(20, 40));
      act(() => { result.current.loadMore(); });

      await waitFor(() => expect(result.current.books).toHaveLength(40));
    });

    it('calls searchBooks with an incremented startIndex', async () => {
      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(20, 40));

      const { result } = renderHook(() => useBooks({ query: 'arch' }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      mockSearchBooks.mockResolvedValueOnce(makeApiResponse(10, 40));
      act(() => { result.current.loadMore(); });

      await waitFor(() => expect(mockSearchBooks).toHaveBeenCalledTimes(2));
      expect(mockSearchBooks).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ startIndex: 20 }),
      );
    });
  });
});
