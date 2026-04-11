import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────
const BookDetails = lazy(() => import('./pages/BookDetails'));
const AllBooks    = lazy(() => import('./pages/AllBooks'));
const MyLoans     = lazy(() => import('./pages/MyLoans'));
const Wishlist    = lazy(() => import('./pages/Wishlist'));
const About       = lazy(() => import('./pages/About'));

// ── Page-level suspense fallback ───────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 24px',
        color: 'var(--text)',
        fontSize: 15,
      }}
      aria-busy="true"
      aria-label="Carregando página…"
    >
      Carregando…
    </div>
  );
}

// ── Nav bar ────────────────────────────────────────────────────────────────────
function NavBar() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    ({
      color: isActive ? 'var(--accent)' : 'var(--text)',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 500,
      transition: 'color 0.15s',
    }) as React.CSSProperties;

  return (
    <nav
      aria-label="Navegação principal"
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <NavLink to="/" end style={linkStyle}>
        GuaxiShelf
      </NavLink>
      <NavLink to="/todos-os-livros" style={linkStyle}>
        Acervo
      </NavLink>
      <NavLink to="/sobre" style={linkStyle}>
        Sobre
      </NavLink>

      <ProtectedRoute>
        <NavLink to="/meus-emprestimos" style={linkStyle}>
          Meus Empréstimos
        </NavLink>
      </ProtectedRoute>

      <ProtectedRoute>
        <NavLink to="/lista-de-desejos" style={linkStyle}>
          Lista de Desejos
        </NavLink>
      </ProtectedRoute>

      {/* ── Auth area ── */}
      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated ? (
          <>
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name}
                width={30}
                height={30}
                style={{ borderRadius: '50%', display: 'block' }}
                referrerPolicy="no-referrer"
              />
            )}
            <span style={{ fontSize: 13, color: 'var(--text-h)' }}>{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              aria-label="Sair da conta"
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 13,
                cursor: 'pointer',
                color: 'var(--text)',
                transition: 'border-color 0.15s, color 0.15s',
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <GoogleLogin
            onSuccess={login}
            onError={() => console.error('Login falhou')}
            size="medium"
          />
        )}
      </span>
    </nav>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <BrowserRouter>
          <NavBar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                  element={<Home />} />
              <Route path="/livros/:id"         element={<BookDetails />} />
              <Route path="/todos-os-livros"    element={<AllBooks />} />
              <Route path="/sobre"              element={<About />} />
              <Route
                path="/meus-emprestimos"
                element={
                  <ProtectedRoute redirect>
                    <MyLoans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lista-de-desejos"
                element={
                  <ProtectedRoute redirect>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              {/* Catch-all → Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
