import { useEffect, useState } from 'react'

interface Livro {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
  };
}

function App() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [erro, setErro] = useState<null | string>(null)

  useEffect(() => {
    // Pegando a chave do seu .env
    const apiKey = import.meta.env.VITE_API_KEY
    const query = 'javascript' // Termo de busca para o teste
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        setLivros(data.items || [])
      })
      .catch((err) => {
        setErro(err.message)
        console.error("Erro ao buscar livros:", err)
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Teste Google Books API</h1>
      
      {erro && <p style={{ color: 'red' }}>Erro: {erro}</p>}
      
      {!erro && livros.length === 0 && <p>Carregando...</p>}

      <ul>
        {livros.map((livro) => (
          <li key={livro.id}>
            <strong>{livro.volumeInfo.title}</strong> - {livro.volumeInfo.authors?.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App