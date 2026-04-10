import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { LoanCard } from '../components/LoanCard';
import styles from './MyLoans.module.css';

export default function MyLoans() {
  const { user_loans, returnBook } = useLibrary();

  const activeLoans = user_loans.filter(l => l.status === 'active');
  const pastLoans = user_loans.filter(l => l.status !== 'active');

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Meus Empréstimos</h1>

      {/* ── Active loans ── */}
      <section aria-labelledby="ativos-heading">
        <div className={styles.sectionHeader}>
          <h2 id="ativos-heading" className={styles.sectionTitle}>
            Ativos
            <span className={styles.badge}>{activeLoans.length} / 3</span>
          </h2>
        </div>

        {activeLoans.length === 0 ? (
          <p className={styles.empty}>
            Nenhum empréstimo ativo.{' '}
            <Link to="/todos-os-livros">Explorar acervo</Link>
          </p>
        ) : (
          <ul className={styles.list}>
            {activeLoans.map(loan => (
              <li key={loan.id} className={styles.loanRow}>
                <LoanCard loan={loan} />
                <button
                  type="button"
                  className={styles.returnBtn}
                  onClick={() => returnBook(loan.volumeId)}
                  aria-label={`Devolver "${loan.volumeInfo.title}"`}
                >
                  Devolver
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Past loans ── */}
      {pastLoans.length > 0 && (
        <section aria-labelledby="historico-heading" className={styles.history}>
          <div className={styles.sectionHeader}>
            <h2 id="historico-heading" className={styles.sectionTitle}>Histórico</h2>
          </div>
          <ul className={styles.list}>
            {pastLoans.map(loan => {
              const returned = loan.returnedAt
                ? new Date(loan.returnedAt).toLocaleDateString('pt-BR')
                : '—';
              return (
                <li key={loan.id} className={styles.historyRow}>
                  <LoanCard loan={loan} />
                  <span className={styles.returnedDate}>
                    Devolvido em <strong>{returned}</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
