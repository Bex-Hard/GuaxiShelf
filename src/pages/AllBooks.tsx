import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { BookCardSkeleton } from '../components/BookCardSkeleton';
import type { OrderBy, PrintType } from '../types';
import styles from './AllBooks.module.css';

const SKELETON_COUNT = 12;

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'fiction', label: 'Ficção' },
  { value: 'science', label: 'Ciências' },
  { value: 'history', label: 'História' },
  { value: 'philosophy', label: 'Filosofia' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'art', label: 'Arte' },
  { value: 'biography', label: 'Biografia' },
  { value: 'economics', label: 'Economia' },
];

export default function AllBooks() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [orderBy, setOrderBy] = useState<OrderBy>('relevance');
  const [printType, setPrintType] = useState<PrintType>('all');

  const { books, loading, loadingMore, error, totalItems, hasMore, loadMore } = useBooks({
    query,
    category,
    orderBy,
    printType,
    defaultQuery: 'literatura',
  });

  const showSkeletons = loading;
  const showEmpty = !loading && !error && books.length === 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Todos os Livros</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Pesquisar no acervo…" />
      </header>

      {/* ── Filters ── */}
      <div className={styles.filters} role="group" aria-label="Filtros de busca">
        <div className={styles.filterGroup}>
          <label htmlFor="filter-print" className={styles.filterLabel}>Tipo</label>
          <select
            id="filter-print"
            className={styles.select}
            value={printType}
            onChange={e => setPrintType(e.target.value as PrintType)}
          >
            <option value="all">Todos</option>
            <option value="books">Livros</option>
            <option value="magazines">Revistas</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-order" className={styles.filterLabel}>Ordenar por</label>
          <select
            id="filter-order"
            className={styles.select}
            value={orderBy}
            onChange={e => setOrderBy(e.target.value as OrderBy)}
          >
            <option value="relevance">Relevância</option>
            <option value="newest">Mais recentes</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-category" className={styles.filterLabel}>Categoria</label>
          <select
            id="filter-category"
            className={styles.select}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && !error && books.length > 0 && (
        <div className={styles.resultsBar} aria-live="polite" aria-atomic="true">
          {totalItems.toLocaleString('pt-BR')} resultado{totalItems !== 1 ? 's' : ''}
          {query.trim() && <> para <strong>"{query}"</strong></>}
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}

      {/* ── Grid ── */}
      <section
        className={styles.grid}
        aria-label={showSkeletons ? 'Carregando livros' : 'Galeria de livros'}
        aria-busy={showSkeletons}
      >
        {showSkeletons &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => <BookCardSkeleton key={i} />)}

        {!showSkeletons && books.map(book => <BookCard key={book.id} book={book} />)}

        {showEmpty && (
          <p className={styles.empty}>
            Nenhum resultado encontrado.{' '}
            {query && (
              <button type="button" className={styles.clearBtn} onClick={() => setQuery('')}>
                Limpar busca
              </button>
            )}
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
    </main>
  );
}
