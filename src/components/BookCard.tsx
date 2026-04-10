import { Link } from 'react-router-dom';
import type { Volume } from '../types';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Volume;
}

export function BookCard({ book }: BookCardProps) {
  const { title, authors, imageLinks } = book.volumeInfo;
  const authorLabel = authors?.join(', ') ?? 'Autor desconhecido';
  const coverUrl = imageLinks?.thumbnail?.replace('http:', 'https:');

  return (
    <Link
      to={`/livros/${book.id}`}
      className={styles.card}
      aria-label={`Ver detalhes de "${title}" por ${authorLabel}`}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={`Capa do livro ${title}`}
          className={styles.cover}
          loading="lazy"
        />
      ) : (
        <div className={styles.coverFallback} aria-hidden="true">
          Sem capa
        </div>
      )}

      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.author}>{authorLabel}</p>
      </div>
    </Link>
  );
}
