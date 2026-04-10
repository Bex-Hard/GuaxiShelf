import { useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  onClose: () => void;
}

/**
 * Overlay modal exibido quando um usuário deslogado tenta executar uma ação
 * que requer autenticação (emprestar, adicionar à lista de desejos).
 */
export function LoginModal({ onClose }: LoginModalProps) {
  const { login } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fechar com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Foco no modal ao abrir
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function handleSuccess(credentialResponse: Parameters<typeof login>[0]) {
    login(credentialResponse);
    onClose();
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Faça login para continuar"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className={styles.box}
        tabIndex={-1}
      >
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Fechar modal de login"
          type="button"
        >
          {/* ✕ */}
          <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <svg
          className={styles.bookIcon}
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>

        <h2 className={styles.title}>Faça login para continuar</h2>
        <p className={styles.subtitle}>
          Você precisa estar logado para realizar esta ação.
        </p>

        <div className={styles.loginWrapper}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error('Login falhou')}
            theme="outline"
            size="large"
            locale="pt-BR"
          />
        </div>
      </div>
    </div>
  );
}
