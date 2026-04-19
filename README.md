<div align="center">
  <img src="public/rac_icon.png" alt="GuaxiShelf logo" width="80" />
  <h1>GuaxiShelf</h1>
  <p>Sistema de acervo digital da Biblioteca Universitária</p>

  ![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
  ![React Router](https://img.shields.io/badge/React_Router-v7-ca4245?logo=reactrouter&logoColor=white)
  ![Jest](https://img.shields.io/badge/Jest-30-c21325?logo=jest&logoColor=white)
  ![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)
</div>

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Primeiros Passos](#primeiros-passos)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Executando Localmente](#executando-localmente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Arquitetura](#arquitetura)
  - [Gerenciamento de Estado](#gerenciamento-de-estado)
  - [Roteamento e Proteção de Rotas](#roteamento-e-proteção-de-rotas)
  - [Camada de API](#camada-de-api)
- [Testes](#testes)
- [Deploy](#deploy)
- [Limitações Conhecidas](#limitações-conhecidas)

---

## Sobre o Projeto

**GuaxiShelf** é uma SPA (Single Page Application) desenvolvida como projeto Capstone da disciplina de Web Development. O sistema digitaliza o gerenciamento do acervo de uma biblioteca universitária, integrando o catálogo do **Google Books API** para oferecer dados ricos sobre cada obra enquanto gerencia empréstimos e listas de desejos localmente.

O projeto conta com React moderno com TypeScript, autenticação OAuth, gerenciamento de estado global sem bibliotecas externas, acessibilidade (WCAG) e cobertura de testes unitários.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Pesquisa em tempo real** | Busca com debounce de 400 ms integrada ao Google Books API |
| **Acervo paginado** | Galeria com carregamento incremental (`loadMore`) e filtros por tipo, categoria e ordenação |
| **Detalhes da obra** | Capa em alta resolução, sinopse sanitizada com DOMPurify, editora, data de publicação e categorias |
| **Autenticação Google** | Login via Google OAuth 2.0, sem cadastro de senha |
| **Gerenciamento de empréstimos** | Até 3 empréstimos ativos simultâneos, prazo de 14 dias, fluxo de devolução |
| **Lista de desejos** | Salvar títulos de interesse para consulta posterior |
| **Persistência local** | Todos os dados do usuário são mantidos no `localStorage` entre sessões |
| **Acessibilidade** | Regiões ARIA, `sr-only` labels, `role="alert"`, `aria-live`, navegação por teclado |
| **Tema automático** | Claro/escuro via `prefers-color-scheme` |
| **Code splitting** | Páginas carregadas sob demanda com `React.lazy` + `Suspense` |

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| UI | React | 19 |
| Linguagem | TypeScript | ~5.9 |
| Build | Vite | 8 |
| Roteamento | React Router DOM | 7 |
| Autenticação | @react-oauth/google | 0.13 |
| HTTP | Axios | 1.14 |
| Sanitização HTML | DOMPurify | 3.3 |
| Estilização | CSS Modules | — |
| Testes unitários | Jest + React Testing Library | 30 / 16 |
| Simulação de eventos | @testing-library/user-event | 14 |
| Transpilação (testes) | Babel (preset-env + react + typescript) | 7 |
| Linting | ESLint + typescript-eslint | 9 / 8 |

---

## Estrutura do Projeto

```
guaxishelf/
├── public/
│   ├── rac_icon.png          # Ícone da marca
│   └── favicon.svg
├── src/
│   ├── __tests__/            # Suite de testes
│   │   ├── BookCard.test.tsx
│   │   ├── LibraryContext.test.tsx
│   │   ├── SearchBar.test.tsx
│   │   ├── useBooks.test.tsx
│   │   ├── setup.ts          # jest-dom + limpa localStorage antes de cada teste
│   │   └── polyfills.cjs     # TextEncoder/TextDecoder para jsdom
│   ├── components/
│   │   ├── BookCard.tsx       # Card clicável de livro
│   │   ├── BookCardSkeleton.tsx
│   │   ├── LoanCard.tsx       # Card compacto de empréstimo ativo
│   │   ├── LoginModal.tsx     # Modal de autenticação
│   │   ├── ProtectedRoute.tsx # Guard de rotas autenticadas
│   │   └── SearchBar.tsx      # Input de busca controlado e acessível
│   ├── context/
│   │   ├── AuthContext.tsx    # Sessão do usuário + Google OAuth
│   │   └── LibraryContext.tsx # Estado global: empréstimos + wishlist
│   ├── hooks/
│   │   ├── useBooks.ts        # Busca paginada com debounce e race-condition guard
│   │   ├── useDebounce.ts
│   │   ├── useFeaturedBooks.ts
│   │   └── useLocalStorage.ts
│   ├── pages/
│   │   ├── Home.tsx           # Hero + busca + Destaques + Meus Livros
│   │   ├── AllBooks.tsx       # Galeria com filtros
│   │   ├── BookDetails.tsx    # Detalhes + ações de empréstimo/wishlist
│   │   ├── MyLoans.tsx        # Empréstimos ativos + histórico
│   │   ├── Wishlist.tsx       # Lista de desejos
│   │   └── About.tsx          # Sobre o projeto
│   ├── services/
│   │   └── booksApi.ts        # Axios + cache em memória (TTL de 5 min)
│   ├── types/
│   │   └── index.ts           # Tipos globais (Volume, Loan, WishlistItem…)
│   ├── App.tsx                # NavBar + BrowserRouter + definição de rotas
│   ├── main.tsx               # Ponto de entrada + GoogleOAuthProvider
│   └── index.css              # Design tokens (variáveis CSS globais)
├── babel.config.cjs           # Configuração Babel exclusiva para NODE_ENV=test
├── jest.config.cjs
├── tsconfig.app.json
└── vite.config.ts
```

---

## Primeiros Passos

### Pré-requisitos

- **Node.js** ≥ 20
- **npm** ≥ 10
- Uma chave de API do **Google Books** ([obter aqui](https://developers.google.com/books/docs/v1/using#APIKey))
- Um **Client ID do Google OAuth 2.0** ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))

### Instalação

```bash
git clone https://github.com/seu-usuario/guaxishelf.git
cd guaxishelf
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_KEY=sua_chave_google_books_api
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
```

> **Origens autorizadas**: No Google Cloud Console, em **Credenciais → OAuth 2.0 → Origens JavaScript autorizadas**, adicione:
> - `http://localhost:5173` para desenvolvimento local
> - A URL de produção (ex: `https://guaxishelf.vercel.app`) para o ambiente hospedado

### Executando Localmente

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Desenvolvimento | `npm run dev` | Inicia o servidor Vite com HMR |
| Build | `npm run build` | Verificação TypeScript + build de produção |
| Preview | `npm run preview` | Serve o build de produção localmente |
| Lint | `npm run lint` | ESLint em todo o projeto |
| Testes | `npm test` | Executa a suite completa com Jest |
| Testes (watch) | `npm run test:watch` | Modo interativo para desenvolvimento |
| Cobertura | `npm run test:coverage` | Gera relatório de cobertura de código |

---

## Arquitetura

### Gerenciamento de Estado

O projeto não utiliza Redux ou Zustand. O estado global é gerenciado exclusivamente por dois React Contexts:

**`AuthContext`** — sessão do usuário.
- Persiste `UserProfile` no `localStorage` via `useLocalStorage`
- Decodifica o JWT do Google manualmente (sem dependências externas) para extrair `sub`, `name`, `email` e `picture`
- Expõe `login`, `logout`, `user` e `isAuthenticated`

**`LibraryContext`** — empréstimos e wishlist.
- `active_loans: string[]` — IDs dos livros atualmente emprestados (exibe disponibilidade nos cards)
- `user_loans: Loan[]` — registros completos dos empréstimos do usuário
- `wishlist: WishlistItem[]` — títulos salvos
- `borrowBook` aplica o limite de 3 empréstimos ativos e retorna `{ success: boolean; reason?: string }`
- Todos os arrays são persistidos separadamente no `localStorage`

```
AuthProvider
  └── LibraryProvider
        └── BrowserRouter
              └── NavBar + Suspense + Routes
```

### Roteamento e Proteção de Rotas

O componente `ProtectedRoute` opera em dois modos:

```tsx
// Modo redirect — redireciona para / se o usuário não estiver autenticado
<ProtectedRoute redirect>
  <MyLoans />
</ProtectedRoute>

// Modo fallback — oculta o conteúdo silenciosamente (ex: links no NavBar)
<ProtectedRoute>
  <NavLink to="/meus-emprestimos">Meus Empréstimos</NavLink>
</ProtectedRoute>
```

| Rota | Acesso | Página |
|---|---|---|
| `/` | Público | Home |
| `/todos-os-livros` | Público | AllBooks |
| `/livros/:id` | Público | BookDetails |
| `/sobre` | Público | About |
| `/meus-emprestimos` | Autenticado (redirect) | MyLoans |
| `/lista-de-desejos` | Autenticado (redirect) | Wishlist |

### Camada de API

`src/services/booksApi.ts` encapsula o cliente Axios com duas melhorias importantes:

**Cache em memória (TTL 5 min)**
Respostas são armazenadas com chave baseada nos parâmetros da query. Re-montagens de componentes (incluindo o double-invoke do React StrictMode) e navegação de ida e volta não disparam novas requisições para a mesma busca.

**Mensagens de erro legíveis em português**

| Status HTTP | Mensagem exibida |
|---|---|
| `503` / `429` | Cota diária da API esgotada |
| `403` | Acesso negado — verificar restrições da chave |
| `400` | Parâmetros de busca inválidos |

O hook `useBooks` complementa a camada de serviço com um `searchKeyRef` que descarta respostas de requisições obsoletas, evitando que uma busca lenta sobrescreva o estado de uma busca mais recente (race condition guard).

---

## Testes

O projeto utiliza **Jest 30** + **React Testing Library** com ambiente **jsdom**. O Babel transpila arquivos TypeScript/TSX apenas quando `NODE_ENV=test`, sem interferir com o pipeline do Vite.

### Executando os Testes

```bash
# Suite completa
npm test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Com relatório de cobertura
npm run test:coverage
```

### Cobertura da Suite

| Arquivo de Teste | O que é testado | Testes |
|---|---|---|
| `BookCard.test.tsx` | Renderização, imagem de capa, link para detalhes | 7 |
| `SearchBar.test.tsx` | Input controlado, callbacks `onChange`, botão limpar, acessibilidade | 11 |
| `LibraryContext.test.tsx` | `borrowBook`, `returnBook`, limite de 3, wishlist, `getActiveLoan` | 21 |
| `useBooks.test.tsx` | Query vazia, `defaultQuery`, loading states, paginação, `loadMore`, error handling | 25 |
| **Total** | | **≈ 64** |

### Decisões de Configuração

- **`babel.config.cjs` com bloco `env.test`** — a configuração de transpilação só é ativada quando `NODE_ENV=test`, garantindo que o Vite use seu próprio pipeline em tempo de build.
- **Factories explícitas no `jest.mock()`** para `booksApi` e `useDebounce` — impedem que o parser do Jest avalie `import.meta.env` (sintaxe exclusiva do Vite).
- **`polyfills.cjs`** — injeta `TextEncoder`/`TextDecoder` no escopo global do jsdom, necessário para react-router-dom v7.

---

## Deploy

O projeto está configurado para deploy contínuo na **Vercel**.

1. Importe o repositório no painel da Vercel.
2. Configure as variáveis de ambiente:
   - `VITE_API_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
3. Adicione a URL de produção nas **Origens JavaScript autorizadas** do Client ID do OAuth no Google Cloud Console.
4. O deploy ocorre automaticamente a cada push na branch principal.

---

## Limitações Conhecidas

### Cota da API do Google Books

A API gratuita do Google Books permite **1.000 requisições por dia** por chave. Ao atingir esse limite, todas as buscas retornam `503 Service Unavailable`. Para verificar o consumo:

**Google Cloud Console → APIs e Serviços → Google Books API → Cotas**

A cota é redefinida às 00h00 UTC. Para projetos com maior volume de acesso, habilitar o faturamento no Google Cloud aumenta o limite disponível.

### Persistência local

Empréstimos e wishlist são armazenados no `localStorage` do navegador do usuário. Limpar dados de navegação apaga o histórico. Uma integração com backend e banco de dados não foi implementada.
