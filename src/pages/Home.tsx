import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useFeaturedBooks } from '../hooks/useFeaturedBooks';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { BookCardSkeleton } from '../components/BookCardSkeleton';
import { LoanCard } from '../components/LoanCard';
import styles from './Home.module.css';

const SKELETON_COUNT = 9;

// ── Nav links ──────────────────────────────────────────────────────────────────

function HomeNav() {
  return (
    <nav className={styles.nav} aria-label="Seções da biblioteca">
      <Link to="/sobre" className={styles.navLink}>Sobre Nós</Link>
      <Link to="/todos-os-livros" className={styles.navLink}>Todos os Livros</Link>
      <Link to="/lista-de-desejos" className={styles.navLink}>Lista de Desejos</Link>
    </nav>
  );
}

// ── Meus Livros section ────────────────────────────────────────────────────────

function MyBooksSection() {
  const { user_loans } = useLibrary();
  const activeLoans = user_loans.filter(l => l.status === 'active');

  return (
    <section className={styles.myBooks} aria-labelledby="meus-livros-heading">
      <div className={styles.sectionHeader}>
        <h2 id="meus-livros-heading" className={styles.sectionTitle}>Meus Livros</h2>
        <Link to="/meus-emprestimos" className={styles.sectionLink}>
          Ver todos ({activeLoans.length})
        </Link>
      </div>

      {activeLoans.length === 0 ? (
        <p className={styles.sectionEmpty}>
          Nenhum empréstimo ativo. <Link to="/todos-os-livros">Explorar acervo</Link>
        </p>
      ) : (
        <ul
          className={styles.loanGrid}
          aria-label="Seus empréstimos ativos"
        >
          {activeLoans.slice(0, 6).map(loan => (
            <li key={loan.id}>
              <LoanCard loan={loan} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Destaques section ──────────────────────────────────────────────────────────

function FeaturedSection() {
  const { books, loading, error } = useFeaturedBooks();

  return (
    <section className={styles.featured} aria-labelledby="destaques-heading">
      <div className={styles.sectionHeader}>
        <h2 id="destaques-heading" className={styles.sectionTitle}>Destaques</h2>
        <Link to="/todos-os-livros" className={styles.sectionLink}>Ver todos</Link>
      </div>

      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}

      <div
        className={styles.grid}
        aria-label={loading ? 'Carregando destaques' : 'Livros em destaque'}
        aria-busy={loading}
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <BookCardSkeleton key={i} />)
          : books.map(book => <BookCard key={book.id} book={book} />)
        }
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Home() {
  const [query, setQuery] = useState('');
  const { isAuthenticated } = useAuth();

  const {
    books,
    loading,
    loadingMore,
    error,
    totalItems,
    hasMore,
    loadMore,
  } = useBooks({ query });

  const isSearching = query.trim() !== '';
  const showSkeletons = isSearching && loading;
  const showEmpty = isSearching && !loading && !error && books.length === 0;

  return (
    <main className={styles.page}>
      {/* ── Hero header ── */}
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <img src="/rac_icon.png" alt="" aria-hidden="true" className={styles.titleIcon} />
          <h1 className={styles.title}>GuaxiShelf</h1>
        </div>
        <p className={styles.subtitle}>Explore o acervo da biblioteca universitária</p>
        <SearchBar value={query} onChange={setQuery} />
        <HomeNav />
      </header>

      {/* ── Search results (active query) ── */}
      {isSearching && (
        <>
          {!loading && !error && books.length > 0 && (
            <div
              className={styles.resultsBar}
              aria-live="polite"
              aria-atomic="true"
            >
              {totalItems.toLocaleString('pt-BR')} resultado{totalItems !== 1 ? 's' : ''} para{' '}
              <strong>"{query}"</strong>
            </div>
          )}

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <section
            className={styles.grid}
            aria-label={showSkeletons ? 'Carregando livros' : 'Resultados da busca'}
            aria-busy={showSkeletons}
          >
            {showSkeletons &&
              Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}

            {!showSkeletons && books.map(book => <BookCard key={book.id} book={book} />)}

            {showEmpty && (
              <p className={styles.empty}>
                Nenhum livro encontrado para <strong>"{query}"</strong>.
              </p>
            )}
          </section>

          {hasMore && !loading && (
            <div className={styles.loadMoreWrapper}>
              <button
                type="button"
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={loadingMore}
                aria-label={loadingMore ? 'Carregando mais livros…' : 'Carregar mais livros'}
              >
                {loadingMore ? 'Carregando…' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Default view (no active query) ── */}
      {!isSearching && (
        <>
          {isAuthenticated && <MyBooksSection />}
          <FeaturedSection />
        </>
      )}
    </main>
  );
}
