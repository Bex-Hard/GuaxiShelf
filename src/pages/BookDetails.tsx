import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getBookById } from '../services/booksApi';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { LoginModal } from '../components/LoginModal';
import type { Volume } from '../types';
import styles from './BookDetails.module.css';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className={styles.skHero} aria-hidden="true">
      <div className={styles.skCover} />
      <div className={styles.skMeta}>
        <div className={styles.skTitle} />
        <div className={styles.skText} />
        <div className={styles.skShort} />
        <div className={styles.skText} style={{ width: '70%' }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <div className={styles.skBtn} />
          <div className={styles.skBtn} />
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { active_loans, getActiveLoan, borrowBook, returnBook, addToWishlist, isInWishlist } =
    useLibrary();

  const [book, setBook] = useState<Volume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // ── Fetch book ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    getBookById(id)
      .then(data => { if (!cancelled) setBook(data); })
      .catch(err => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Erro ao carregar livro.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  // ── Derived state ───────────────────────────────────────────────────────────

  const activeLoan = id ? getActiveLoan(id) : undefined;
  const isOccupied = id ? active_loans.includes(id) : false;
  const inWishlist = id ? isInWishlist(id) : false;

  // ── Action handlers ─────────────────────────────────────────────────────────

  function requireAuth(action: () => void) {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    action();
  }

  function handleBorrow() {
    if (!book) return;
    requireAuth(() => {
      const result = borrowBook(book);
      setActionMsg(result.success ? 'Empréstimo registrado! Boa leitura.' : (result.reason ?? 'Erro ao registrar empréstimo.'));
    });
  }

  function handleReturn() {
    if (!id) return;
    returnBook(id);
    setActionMsg('Livro devolvido com sucesso.');
  }

  function handleWishlist() {
    if (!book) return;
    requireAuth(() => {
      if (inWishlist) return;
      addToWishlist(book);
      setActionMsg('Adicionado à lista de desejos!');
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const { title, authors, categories, publisher, publishedDate, description, imageLinks } =
    book?.volumeInfo ?? {};

  const authorLabel = authors?.join(', ') ?? 'Autor desconhecido';
  const coverUrl =
    (imageLinks?.thumbnail ?? imageLinks?.smallThumbnail)
      ?.replace('http:', 'https:')
      .replace('zoom=1', 'zoom=2');

  const safeDescription = description
    ? DOMPurify.sanitize(description)
    : null;

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back} aria-label="Voltar para a Home">
        <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar
      </Link>

      {loading && <DetailSkeleton />}

      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}

      {!loading && !error && book && (
        <>
          <div className={styles.hero}>
            {/* Cover */}
            <div className={styles.coverWrapper}>
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={`Capa de ${title}`}
                  className={styles.cover}
                />
              ) : (
                <div className={styles.coverFallback} aria-hidden="true">Sem capa</div>
              )}
            </div>

            {/* Metadata */}
            <div className={styles.meta}>
              <h1 className={styles.title}>{title ?? 'Título desconhecido'}</h1>
              <p className={styles.authors}>{authorLabel}</p>

              {/* Category tags */}
              {categories && categories.length > 0 && (
                <div className={styles.tags} aria-label="Categorias">
                  {categories.map(cat => (
                    <span key={cat} className={styles.tag}>{cat}</span>
                  ))}
                </div>
              )}

              {/* Publisher / date */}
              <div className={styles.infoRow}>
                {publisher && (
                  <span><strong>Editora:</strong> {publisher}</span>
                )}
                {publishedDate && (
                  <span><strong>Publicação:</strong> {publishedDate}</span>
                )}
              </div>

              {/* Action feedback message */}
              {actionMsg && (
                <p
                  role="status"
                  aria-live="polite"
                  style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12 }}
                >
                  {actionMsg}
                </p>
              )}

              {/* Action buttons */}
              <div className={styles.actions}>
                {activeLoan ? (
                  // User already has this book — offer Return
                  <>
                    <span className={styles.badge} aria-label="Livro em sua posse">
                      <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Em sua posse
                    </span>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={handleReturn}
                      aria-label={`Devolver "${title}"`}
                    >
                      Devolver
                    </button>
                  </>
                ) : isOccupied ? (
                  // Occupied by someone → offer Wishlist
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleWishlist}
                    disabled={inWishlist}
                    aria-label={
                      inWishlist
                        ? 'Livro já está na lista de desejos'
                        : `Adicionar "${title}" à lista de desejos`
                    }
                  >
                    {inWishlist ? 'Na lista de desejos' : 'Adicionar à Lista de Desejos'}
                  </button>
                ) : (
                  // Available → offer Borrow + Wishlist
                  <>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={handleBorrow}
                      aria-label={`Pegar "${title}" emprestado`}
                    >
                      Pegar Emprestado
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={handleWishlist}
                      disabled={inWishlist}
                      aria-label={
                        inWishlist
                          ? 'Livro já está na lista de desejos'
                          : `Adicionar "${title}" à lista de desejos`
                      }
                    >
                      {inWishlist ? 'Na lista de desejos' : 'Lista de Desejos'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {safeDescription && (
            <section className={styles.descSection} aria-label="Descrição do livro">
              <h2>Descrição</h2>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: safeDescription }}
              />
            </section>
          )}
        </>
      )}

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </main>
  );
}

