import { Link } from 'react-router-dom';
import type { Loan } from '../types';
import styles from './LoanCard.module.css';

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  const { volumeId, volumeInfo, dueDate } = loan;
  const { title, authors, imageLinks } = volumeInfo;
  const authorLabel = authors?.join(', ') ?? 'Autor desconhecido';
  const coverUrl = imageLinks?.thumbnail?.replace('http:', 'https:');
  const due = new Date(dueDate).toLocaleDateString('pt-BR');
  const isOverdue = new Date(dueDate) < new Date();

  return (
    <Link
      to={`/livros/${volumeId}`}
      className={styles.card}
      aria-label={`Ver detalhes de "${title}" — devolução em ${due}`}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={`Capa de ${title}`}
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
        <p className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
          {isOverdue ? 'Atrasado — ' : 'Devolução: '}
          <strong>{due}</strong>
        </p>
      </div>
    </Link>
  );
}
