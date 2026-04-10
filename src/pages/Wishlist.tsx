import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import styles from './Wishlist.module.css';

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist } = useLibrary();

  if (!isAuthenticated) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Lista de Desejos</h1>
        <p className={styles.empty}>Faça login para ver sua lista de desejos.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Lista de Desejos</h1>
      <p className={styles.count}>
        {wishlist.length} {wishlist.length === 1 ? 'livro salvo' : 'livros salvos'}
      </p>

      {wishlist.length === 0 ? (
        <p className={styles.empty}>
          Nenhum livro na lista de desejos.{' '}
          <Link to="/todos-os-livros">Explorar o acervo</Link>
        </p>
      ) : (
        <ul className={styles.list}>
          {wishlist.map(item => {
            const { volumeId, volumeInfo, addedAt } = item;
            const { title, authors, imageLinks } = volumeInfo;
            const cover = imageLinks?.thumbnail?.replace('http:', 'https:');
            const authorLabel = authors?.join(', ') ?? 'Autor desconhecido';
            const addedDate = new Date(addedAt).toLocaleDateString('pt-BR');

            return (
              <li key={volumeId} className={styles.item}>
                <Link
                  to={`/livros/${volumeId}`}
                  className={styles.itemLink}
                  aria-label={`Ver detalhes de "${title}"`}
                >
                  {cover ? (
                    <img src={cover} alt={`Capa de ${title}`} className={styles.cover} loading="lazy" />
                  ) : (
                    <div className={styles.coverFallback} aria-hidden="true">Sem capa</div>
                  )}
                  <div className={styles.body}>
                    <p className={styles.itemTitle}>{title}</p>
                    <p className={styles.itemAuthor}>{authorLabel}</p>
                    <p className={styles.itemDate}>Salvo em {addedDate}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeFromWishlist(volumeId)}
                  aria-label={`Remover "${title}" da lista de desejos`}
                >
                  Remover
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
