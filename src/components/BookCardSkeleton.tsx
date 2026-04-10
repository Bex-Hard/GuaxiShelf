import styles from './BookCardSkeleton.module.css';

export function BookCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.cover} />
      <div className={styles.body}>
        <div className={styles.title} />
        <div className={styles.titleShort} />
        <div className={styles.author} />
      </div>
    </div>
  );
}
