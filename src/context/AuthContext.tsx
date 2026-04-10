import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { googleLogout, type CredentialResponse } from '@react-oauth/google';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { UserProfile } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  /** Recebe a resposta do GoogleLogin e persiste o perfil do usuário. */
  login: (credentialResponse: CredentialResponse) => void;
  logout: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Decodifica o payload de um JWT sem biblioteca externa. */
function decodeJwtPayload(token: string): Record<string, string> {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
  return JSON.parse(jsonPayload) as Record<string, string>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<UserProfile | null>('guaxishelf:user', null);

  const login = useCallback(
    (credentialResponse: CredentialResponse) => {
      if (!credentialResponse.credential) return;
      const payload = decodeJwtPayload(credentialResponse.credential);
      setUser({
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      });
    },
    [setUser],
  );

  const logout = useCallback(() => {
    googleLogout();
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook de acesso ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
