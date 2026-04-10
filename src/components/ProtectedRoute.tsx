import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Conteúdo exibido quando o usuário não está autenticado.
   * - Se omitido: renderiza null (oculta a seção silenciosamente).
   * - Se `redirect` for true: redireciona para "/" em vez de renderizar o fallback.
   */
  fallback?: ReactNode;
  /**
   * Quando true, redireciona para "/" em vez de renderizar o fallback.
   * Use para proteger rotas inteiras.
   */
  redirect?: boolean;
}

/**
 * Oculta seções e impede ações para usuários deslogados.
 *
 * Uso como guarda de rota:
 *   <ProtectedRoute redirect><MyLoans /></ProtectedRoute>
 *
 * Uso inline para ocultar seção:
 *   <ProtectedRoute fallback={<p>Faça login para ver isso.</p>}>
 *     <ActionButton />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  fallback = null,
  redirect = false,
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    if (redirect) return <Navigate to="/" replace />;
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
