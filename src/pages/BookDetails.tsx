import { useParams } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <main>
      <h1>Detalhes do Livro</h1>
      <p>ID: {id}</p>
    </main>
  );
};

export default BookDetails;
