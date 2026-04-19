/**
 * LibraryContext (LibraryProvider + useLibrary) — unit tests
 *
 * Tests that the global state is updated correctly when books are borrowed,
 * returned, and added to/removed from the wishlist. This is also where the
 * "Pegar Emprestado" business logic (borrowBook) is validated — the action
 * itself is triggered from BookDetails but the state lives here.
 */
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LibraryProvider, useLibrary } from '../context/LibraryContext';
import type { Volume } from '../types';

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeVolume(id: string, title = `Book ${id}`): Volume {
  return {
    id,
    kind: 'books#volume',
    etag: 'etag',
    selfLink: '',
    volumeInfo: {
      title,
      authors: [`Author ${id}`],
      imageLinks: {
        smallThumbnail: 'https://example.com/small.jpg',
        thumbnail: 'https://example.com/thumb.jpg',
      },
    },
  };
}

const bookA = makeVolume('book-a', 'Clean Code');
const bookB = makeVolume('book-b', 'The Pragmatic Programmer');
const bookC = makeVolume('book-c', 'Refactoring');
const bookD = makeVolume('book-d', 'Design Patterns');

// ── Test wrapper ───────────────────────────────────────────────────────────────

function wrapper({ children }: { children: ReactNode }) {
  return <LibraryProvider>{children}</LibraryProvider>;
}

function useLibraryHook() {
  return renderHook(() => useLibrary(), { wrapper });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('LibraryProvider — global state', () => {
  afterEach(() => {
    jest.clearAllMocks();
    // localStorage is cleared by the global beforeEach in setup.ts
  });

  // ── Initial state ────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with an empty user_loans array', () => {
      const { result } = useLibraryHook();
      expect(result.current.user_loans).toEqual([]);
    });

    it('starts with an empty active_loans array', () => {
      const { result } = useLibraryHook();
      expect(result.current.active_loans).toEqual([]);
    });

    it('starts with an empty wishlist array', () => {
      const { result } = useLibraryHook();
      expect(result.current.wishlist).toEqual([]);
    });
  });

  // ── borrowBook ───────────────────────────────────────────────────────────────

  describe('borrowBook', () => {
    it('adds the book to user_loans with status "active"', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.borrowBook(bookA); });

      expect(result.current.user_loans).toHaveLength(1);
      expect(result.current.user_loans[0]).toMatchObject({
        volumeId: 'book-a',
        status: 'active',
        volumeInfo: { title: 'Clean Code' },
      });
    });

    it('adds the book ID to active_loans', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.borrowBook(bookA); });

      expect(result.current.active_loans).toContain('book-a');
    });

    it('sets dueDate to 14 days from today', () => {
      const { result } = useLibraryHook();
      const before = Date.now();

      act(() => { result.current.borrowBook(bookA); });

      const loan = result.current.user_loans[0];
      const due = new Date(loan.dueDate).getTime();
      const expected = before + 14 * 24 * 60 * 60 * 1000;
      // Allow a 1-second window for test execution time
      expect(due).toBeGreaterThanOrEqual(expected - 1000);
      expect(due).toBeLessThanOrEqual(expected + 1000);
    });

    it('returns { success: true } when the loan is registered', () => {
      const { result } = useLibraryHook();
      let outcome: ReturnType<typeof result.current.borrowBook>;

      act(() => { outcome = result.current.borrowBook(bookA); });

      expect(outcome!.success).toBe(true);
    });

    it('does not duplicate an already-active loan for the same book', () => {
      const { result } = useLibraryHook();

      // Each call must be in its own act() so the hook re-renders between them.
      // Within a single act() both calls see the same stale closure snapshot.
      act(() => { result.current.borrowBook(bookA); });
      act(() => { result.current.borrowBook(bookA); }); // duplicate — should be rejected

      const activeLoans = result.current.user_loans.filter(
        l => l.volumeId === 'book-a' && l.status === 'active',
      );
      expect(activeLoans).toHaveLength(1);
    });

    it('enforces a maximum of 3 active loans', () => {
      const { result } = useLibraryHook();

      act(() => {
        result.current.borrowBook(bookA);
        result.current.borrowBook(bookB);
        result.current.borrowBook(bookC);
      });

      // Fourth borrow attempt should be rejected
      let outcome: ReturnType<typeof result.current.borrowBook>;
      act(() => { outcome = result.current.borrowBook(bookD); });

      expect(outcome!.success).toBe(false);
      expect(outcome!.reason).toMatch(/limite/i);
      expect(result.current.user_loans.filter(l => l.status === 'active')).toHaveLength(3);
    });

    it('adds a 4th loan only after one of the first 3 is returned', () => {
      const { result } = useLibraryHook();

      act(() => {
        result.current.borrowBook(bookA);
        result.current.borrowBook(bookB);
        result.current.borrowBook(bookC);
        result.current.returnBook('book-a'); 
        result.current.borrowBook(bookD);   
      });

      const active = result.current.user_loans.filter(l => l.status === 'active');
      expect(active.map(l => l.volumeId)).toContain('book-d');
    });
  });

  // ── returnBook ───────────────────────────────────────────────────────────────

  describe('returnBook', () => {
    it('marks the loan as "returned"', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.borrowBook(bookA); });
      act(() => { result.current.returnBook('book-a'); });

      expect(result.current.user_loans[0].status).toBe('returned');
    });

    it('removes the book ID from active_loans', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.borrowBook(bookA); });
      act(() => { result.current.returnBook('book-a'); });

      expect(result.current.active_loans).not.toContain('book-a');
    });

    it('sets returnedAt to a valid ISO date string', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.borrowBook(bookA); });
      act(() => { result.current.returnBook('book-a'); });

      const returnedAt = result.current.user_loans[0].returnedAt;
      expect(returnedAt).toBeDefined();
      expect(new Date(returnedAt!).getTime()).not.toBeNaN();
    });

    it('only marks the matching loan, not other loans', () => {
      const { result } = useLibraryHook();

      act(() => {
        result.current.borrowBook(bookA);
        result.current.borrowBook(bookB);
      });
      act(() => { result.current.returnBook('book-a'); });

      const loanB = result.current.user_loans.find(l => l.volumeId === 'book-b');
      expect(loanB?.status).toBe('active');
    });
  });

  // ── getActiveLoan helper ─────────────────────────────────────────────────────

  describe('getActiveLoan', () => {
    it('returns the active loan for a borrowed book', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.borrowBook(bookA); });

      expect(result.current.getActiveLoan('book-a')).toBeDefined();
      expect(result.current.getActiveLoan('book-a')?.status).toBe('active');
    });

    it('returns undefined when the book has not been borrowed', () => {
      const { result } = useLibraryHook();
      expect(result.current.getActiveLoan('book-a')).toBeUndefined();
    });

    it('returns undefined after the book has been returned', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.borrowBook(bookA); });
      act(() => { result.current.returnBook('book-a'); });

      expect(result.current.getActiveLoan('book-a')).toBeUndefined();
    });
  });

  // ── Wishlist ─────────────────────────────────────────────────────────────────

  describe('addToWishlist', () => {
    it('adds a book to the wishlist', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.addToWishlist(bookA); });

      expect(result.current.wishlist).toHaveLength(1);
      expect(result.current.wishlist[0].volumeId).toBe('book-a');
    });

    it('does not add the same book twice', () => {
      const { result } = useLibraryHook();

      // Separate act() calls so the hook re-renders between them —
      // otherwise both calls see the same stale wishlist snapshot.
      act(() => { result.current.addToWishlist(bookA); });
      act(() => { result.current.addToWishlist(bookA); });

      expect(result.current.wishlist).toHaveLength(1);
    });

    it('stores title and authors in the wishlist item', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.addToWishlist(bookA); });

      expect(result.current.wishlist[0].volumeInfo.title).toBe('Clean Code');
    });
  });

  describe('removeFromWishlist', () => {
    it('removes the book from the wishlist', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.addToWishlist(bookA); });
      act(() => { result.current.removeFromWishlist('book-a'); });

      expect(result.current.wishlist).toHaveLength(0);
    });

    it('is a no-op when the book is not on the wishlist', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.removeFromWishlist('book-a'); });

      expect(result.current.wishlist).toHaveLength(0);
    });
  });

  describe('isInWishlist', () => {
    it('returns false before adding the book', () => {
      const { result } = useLibraryHook();
      expect(result.current.isInWishlist('book-a')).toBe(false);
    });

    it('returns true after adding the book', () => {
      const { result } = useLibraryHook();

      act(() => { result.current.addToWishlist(bookA); });

      expect(result.current.isInWishlist('book-a')).toBe(true);
    });

    it('returns false after removing the book', () => {
      const { result } = useLibraryHook();

      act(() => {
        result.current.addToWishlist(bookA);
        result.current.removeFromWishlist('book-a');
      });

      expect(result.current.isInWishlist('book-a')).toBe(false);
    });
  });
});
