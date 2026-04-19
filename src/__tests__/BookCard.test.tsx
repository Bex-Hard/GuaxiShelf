/**
 * BookCard — unit tests
 *
 * The BookCard component renders a clickable card that links to the book
 * details page. The "Pegar Emprestado" action lives in BookDetails.tsx and
 * is exercised via the LibraryContext tests (borrowBook). Here we focus on
 * the card's rendering contract.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BookCard } from '../components/BookCard';
import type { Volume } from '../types';

// ── Fixture ────────────────────────────────────────────────────────────────────

const baseBook: Volume = {
  id: 'vol-001',
  kind: 'books#volume',
  etag: 'etag-1',
  selfLink: 'https://www.googleapis.com/books/v1/volumes/vol-001',
  volumeInfo: {
    title: 'Clean Code',
    authors: ['Robert C. Martin', 'Tim Ottinger'],
    imageLinks: {
      smallThumbnail: 'http://books.google.com/small.jpg',
      thumbnail: 'http://books.google.com/thumb.jpg',
    },
  },
};

// ── Helper ─────────────────────────────────────────────────────────────────────

function renderCard(book: Volume = baseBook) {
  return render(
    <MemoryRouter>
      <BookCard book={book} />
    </MemoryRouter>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('BookCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering — title and author', () => {
    it('renders the book title', () => {
      renderCard();
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
    });

    it('renders all authors joined by comma', () => {
      renderCard();
      expect(
        screen.getByText('Robert C. Martin, Tim Ottinger'),
      ).toBeInTheDocument();
    });

    it('renders "Autor desconhecido" when authors is undefined', () => {
      const book: Volume = {
        ...baseBook,
        volumeInfo: { ...baseBook.volumeInfo, authors: undefined },
      };
      renderCard(book);
      expect(screen.getByText(/autor desconhecido/i)).toBeInTheDocument();
    });
  });

  describe('cover image', () => {
    it('renders the thumbnail via https', () => {
      renderCard();
      const img = screen.getByRole('img');
      // The component upgrades http → https
      expect(img).toHaveAttribute('src', expect.stringContaining('https://'));
      expect(img).toHaveAttribute('alt', expect.stringMatching(/capa do livro clean code/i));
    });

    it('renders the "Sem capa" fallback when imageLinks is absent', () => {
      const book: Volume = {
        ...baseBook,
        volumeInfo: { ...baseBook.volumeInfo, imageLinks: undefined },
      };
      renderCard(book);
      expect(screen.getByText(/sem capa/i)).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('wraps the card in a link to /livros/:id', () => {
      renderCard();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/livros/vol-001');
    });

    it('sets an accessible aria-label on the link', () => {
      renderCard();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'aria-label',
        expect.stringMatching(/clean code/i),
      );
    });
  });
});
