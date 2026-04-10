import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Loan, WishlistItem, ReadingStatus, Volume } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LibraryContextValue {
  /**
   * Array global de IDs de livros atualmente ocupados (qualquer empréstimo
   * ativo). Persistido no localStorage — usado para exibir disponibilidade.
   */
  active_loans: string[];

  /**
   * Empréstimos do usuário atual com informações completas
   * (ID, título, autor, data de devolução).
   */
  user_loans: Loan[];

  wishlist: WishlistItem[];

  /** Registra um empréstimo ativo (prazo: 14 dias). Limite: 3 livros. */
  borrowBook: (book: Volume) => { success: boolean; reason?: string };
  /** Marca o empréstimo como devolvido e remove o ID de active_loans. */
  returnBook: (volumeId: string) => void;
  /** Atualiza o status de leitura de um empréstimo ativo. */
  updateStatus: (volumeId: string, status: ReadingStatus) => void;

  /** Adiciona um livro à lista de desejos (sem duplicatas). */
  addToWishlist: (book: Volume) => void;
  /** Remove um livro da lista de desejos. */
  removeFromWishlist: (volumeId: string) => void;

  /** Helpers de consulta rápida. */
  getActiveLoan: (volumeId: string) => Loan | undefined;
  isInWishlist: (volumeId: string) => boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────

const LibraryContext = createContext<LibraryContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

const LOAN_DAYS = 14;
const MAX_ACTIVE_LOANS = 3;

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [active_loans, setActiveLoans] = useLocalStorage<string[]>(
    'guaxishelf:active_loans',
    [],
  );
  const [user_loans, setUserLoans] = useLocalStorage<Loan[]>(
    'guaxishelf:loans',
    [],
  );
  const [wishlist, setWishlist] = useLocalStorage<WishlistItem[]>(
    'guaxishelf:wishlist',
    [],
  );

  // ── Loans ──────────────────────────────────────────────────────────────────

  const borrowBook = useCallback(
    (book: Volume): { success: boolean; reason?: string } => {
      const currentActive = user_loans.filter(l => l.status === 'active');

      if (currentActive.length >= MAX_ACTIVE_LOANS) {
        return {
          success: false,
          reason: `Limite de ${MAX_ACTIVE_LOANS} empréstimos ativos atingido.`,
        };
      }

      const alreadyActive = currentActive.some(l => l.volumeId === book.id);
      if (alreadyActive) {
        return { success: false, reason: 'Livro já está emprestado.' };
      }

      const now = new Date();
      const newLoan: Loan = {
        id: `${book.id}-${now.getTime()}`,
        volumeId: book.id,
        volumeInfo: {
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          imageLinks: book.volumeInfo.imageLinks,
        },
        borrowedAt: now.toISOString(),
        dueDate: addDays(now, LOAN_DAYS),
        status: 'active',
      };

      setUserLoans(prev => [newLoan, ...prev]);
      setActiveLoans(prev =>
        prev.includes(book.id) ? prev : [book.id, ...prev],
      );

      return { success: true };
    },
    [user_loans, setUserLoans, setActiveLoans],
  );

  const returnBook = useCallback(
    (volumeId: string) => {
      setUserLoans(prev =>
        prev.map(loan =>
          loan.volumeId === volumeId && loan.status === 'active'
            ? { ...loan, status: 'returned', returnedAt: new Date().toISOString() }
            : loan,
        ),
      );
      setActiveLoans(prev => prev.filter(id => id !== volumeId));
    },
    [setUserLoans, setActiveLoans],
  );

  const updateStatus = useCallback(
    (volumeId: string, status: ReadingStatus) => {
      setUserLoans(prev =>
        prev.map(loan =>
          loan.volumeId === volumeId && loan.status === 'active'
            ? { ...loan, readingStatus: status }
            : loan,
        ),
      );
    },
    [setUserLoans],
  );

  // ── Wishlist ───────────────────────────────────────────────────────────────

  const addToWishlist = useCallback(
    (book: Volume) => {
      const already = wishlist.some(w => w.volumeId === book.id);
      if (already) return;

      const item: WishlistItem = {
        volumeId: book.id,
        volumeInfo: {
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          imageLinks: book.volumeInfo.imageLinks,
        },
        addedAt: new Date().toISOString(),
      };

      setWishlist(prev => [item, ...prev]);
    },
    [wishlist, setWishlist],
  );

  const removeFromWishlist = useCallback(
    (volumeId: string) => {
      setWishlist(prev => prev.filter(w => w.volumeId !== volumeId));
    },
    [setWishlist],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getActiveLoan = useCallback(
    (volumeId: string) =>
      user_loans.find(l => l.volumeId === volumeId && l.status === 'active'),
    [user_loans],
  );

  const isInWishlist = useCallback(
    (volumeId: string) => wishlist.some(w => w.volumeId === volumeId),
    [wishlist],
  );

  // ── Value ──────────────────────────────────────────────────────────────────

  return (
    <LibraryContext.Provider
      value={{
        active_loans,
        user_loans,
        wishlist,
        borrowBook,
        returnBook,
        updateStatus,
        addToWishlist,
        removeFromWishlist,
        getActiveLoan,
        isInWishlist,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

// ── Hook de acesso ─────────────────────────────────────────────────────────────

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
}
