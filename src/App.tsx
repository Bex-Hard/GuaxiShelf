import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import MyLoans from './pages/MyLoans';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '12px 20px', borderBottom: '1px solid #ccc', display: 'flex', gap: '16px' }}>
        <Link to="/">Home</Link>
        <Link to="/meus-emprestimos">Meus Empréstimos</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/livros/:id" element={<BookDetails />} />
        <Route path="/meus-emprestimos" element={<MyLoans />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
