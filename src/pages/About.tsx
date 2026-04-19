import styles from './About.module.css';

export default function About() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <img src="/rac_icon.png" alt="" aria-hidden="true" className={styles.titleIcon} />
          <h1 className={styles.title}>Sobre Nós</h1>
        </div>
        <p className={styles.lead}>
          GuaxiShelf é o sistema de acervo digital da Biblioteca Universitária,
          desenvolvido como projeto Capstone da disciplina de Web Development.
        </p>
      </header>

      <section className={styles.section}>
        <h2>O Projeto</h2>
        <p>
          O GuaxiShelf nasceu da necessidade de modernizar o gerenciamento do acervo
          físico e digital da biblioteca, tornando a experiência de pesquisa, empréstimo
          e organização de leituras mais simples e acessível para toda a comunidade acadêmica.
        </p>
        <p>
          A plataforma integra o catálogo do Google Books para oferecer dados ricos sobre
          cada obra, como capa em alta resolução, sinopses, informações editoriais e avaliações,
          ao mesmo tempo em que gerencia empréstimos locais.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Tecnologias Utilizadas</h2>
        <ul className={styles.techList}>
          {TECH_STACK.map(({ name, description }) => (
            <li key={name} className={styles.techItem}>
              <span className={styles.techName}>{name}</span>
              <span className={styles.techDesc}>{description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Funcionalidades</h2>
        <ul className={styles.featureList}>
          <li>Pesquisa em tempo real com debounce no catálogo do Google Books</li>
          <li>Autenticação segura via Google OAuth 2.0</li>
          <li>Gerenciamento de empréstimos com controle de limite (3 livros ativos)</li>
          <li>Lista de desejos para salvar títulos de interesse</li>
          <li>Galeria filtrável por tipo, categoria e ordenação</li>
          <li>Interface acessível com suporte a leitores de tela (ARIA)</li>
          <li>Tema claro e escuro automático via prefers-color-scheme</li>
          <li>Persistência de dados no LocalStorage</li>
        </ul>
      </section>
    </main>
  );
}

const TECH_STACK = [
  { name: 'React 19', description: 'Biblioteca de UI com Concurrent Features e React Compiler' },
  { name: 'TypeScript 5', description: 'Tipagem estática e segurança de tipos em todo o projeto' },
  { name: 'Vite 8', description: 'Build tool ultra-rápida com HMR nativo' },
  { name: 'React Router v7', description: 'Roteamento client-side com loaders e proteção de rotas' },
  { name: '@react-oauth/google', description: 'Integração com Google OAuth 2.0 para autenticação' },
  { name: 'Google Books API', description: 'Fonte de dados para busca e detalhes do acervo' },
  { name: 'DOMPurify', description: 'Sanitização de HTML para prevenir ataques XSS' },
  { name: 'Axios', description: 'Cliente HTTP com interceptors para chamadas à API' },
  { name: 'CSS Modules', description: 'Estilos com escopo local e zero colisões de classe' },
];
