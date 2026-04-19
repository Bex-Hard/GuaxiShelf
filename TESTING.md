# GuaxiShelf — Testing Guide

Complete unit and integration test suite for the university library React/TypeScript application.

## 📊 Test Coverage

- **4 test suites** — 64 tests, 100% passing
- **Components tested**: BookCard, SearchBar, LibraryContext (state)
- **Hooks tested**: useBooks (API integration)
- **Coverage**: Rendering, user interaction, state management, API mocking, error handling

## 🚀 Quick Start

```bash
# Run all tests once
npm test

# Watch mode — re-run on file changes
npm run test:watch

# Generate coverage report (HTML)
npm run test:coverage
```

---

## 📋 Test Suites

### 1. **BookCard.test.tsx** — 7 tests

Tests the book card component rendering and navigation.

```bash
npx jest --config jest.config.cjs BookCard
```

**Tests cover:**

- Title and author rendering
- Handling multiple authors (`"Author 1, Author 2"`)
- Fallback text when authors missing (`"Autor desconhecido"`)
- Cover image with `http:` → `https:` upgrade
- "Sem capa" fallback when `imageLinks` absent
- Link to `/livros/:id` with accessible `aria-label`

**Example assertion:**

```typescript
it('renders the book title', () => {
  renderCard();
  expect(screen.getByText('Clean Code')).toBeInTheDocument();
});
```

---

### 2. **SearchBar.test.tsx** — 11 tests

Tests the controlled search input component.

```bash
npx jest --config jest.config.cjs SearchBar
```

**Tests cover:**

- Input rendering with current `value`
- Custom and default placeholder text
- Clear button visibility (shown only when `value` is non-empty)
- `onChange` called on every keystroke with `e.target.value`
- Stateful parent accumulates value between keystrokes
- Clear via click, `Enter`, and `Space` keys
- Accessible `role="search"` and `aria-label`

**Example interaction:**

```typescript
it('calls onChange with e.target.value on each keystroke', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<SearchBar value="" onChange={onChange} />);

  const input = screen.getByRole('searchbox');
  await user.type(input, 'js');

  expect(onChange).toHaveBeenNthCalledWith(1, 'j');
  expect(onChange).toHaveBeenNthCalledWith(2, 's');
});
```

---

### 3. **LibraryContext.test.tsx** — 21 tests

Tests global state management for loans and wishlist.

```bash
npx jest --config jest.config.cjs LibraryContext
```

**Tests cover:**

#### Borrowing Logic

- `borrowBook()` adds to `user_loans` with `status: 'active'` and `dueDate` (+14 days)
- Duplicate prevention: same book cannot be borrowed twice
- **3-book limit**: returns `{ success: false, reason }` when limit reached
- Returns `{ success: true }` on success
- Allows borrowing after returning a book (freeing a slot)

```typescript
it('enforces a maximum of 3 active loans', () => {
  const { result } = useLibraryHook();
  act(() => {
    result.current.borrowBook(bookA);
    result.current.borrowBook(bookB);
    result.current.borrowBook(bookC); // OK
  });
  let outcome: ReturnType<typeof result.current.borrowBook>;
  act(() => { outcome = result.current.borrowBook(bookD); }); // Reject
  expect(outcome!.success).toBe(false);
});
```

#### Returns

- `returnBook()` marks as `'returned'` and removes from `active_loans`
- Sets `returnedAt` to ISO date
- Only affects the matching loan

#### Wishlist

- `addToWishlist()` stores title, authors, imageLinks
- Prevents duplicate entries
- `removeFromWishlist()` removes by `volumeId`
- `isInWishlist()` check works correctly

---

### 4. **useBooks.test.tsx** — 15 tests

Tests the custom hook for Google Books API integration.

```bash
npx jest --config jest.config.cjs useBooks
```

**Mocking strategy:**

```typescript
// Real source code is NEVER parsed — jest.mock() intercepts at import time
jest.mock('../services/booksApi', () => ({
  searchBooks: jest.fn(),
}));

// useDebounce is replaced with identity fn — no 400ms wait needed
jest.mock('../hooks/useDebounce', () => ({
  useDebounce: <T>(value: T) => value,
}));
```

**Tests cover:**

- **Empty query**: no API call; `defaultQuery` as fallback
- **Loading states**: `loading=true` while in-flight, `false` after response
- **Success**: books array, `totalItems`, `hasMore` flag
- **Error handling**: error message or fallback in pt-BR
- **Error recovery**: error clears when subsequent query succeeds
- **Pagination**: `loadMore()` increments `startIndex`, appends to list

**Example mock & assertion:**

```typescript
mockSearchBooks.mockResolvedValueOnce(makeApiResponse(5, 123));
const { result } = renderHook(() => useBooks({ query: 'typescript' }));

await waitFor(() => expect(result.current.loading).toBe(false));
expect(result.current.books).toHaveLength(5);
expect(result.current.totalItems).toBe(123);
```

---

## 🛠️ Test Infrastructure

### Configuration Files

| File | Purpose |
|------|---------|
| `jest.config.cjs` | Jest config: jsdom, babel-jest transforms, CSS/asset stubs |
| `babel.config.cjs` | Transpiles TS/JSX to CJS for Node (only in `NODE_ENV=test`) |
| `src/__tests__/polyfills.cjs` | `TextEncoder`/`TextDecoder` for jsdom + react-router-dom v7 |
| `src/__tests__/setup.ts` | Loads `@testing-library/jest-dom` matchers; clears localStorage |
| `src/__tests__/__mocks__/fileMock.cjs` | Stub for image/SVG imports |

### TypeScript Configuration

`tsconfig.app.json` includes Jest globals:

```json
"types": ["@jest/globals", "@testing-library/jest-dom"]
```

This provides autocomplete for `describe`, `it`, `expect`, `jest`, and custom matchers like `toBeInTheDocument()`.

---

## 🧪 Best Practices Used

### 1. **Cleanup** (`afterEach`)

Jest automatically clears mocks and RTL cleans up DOM. localStorage is cleared by the global `beforeEach` in `setup.ts`.

```typescript
afterEach(() => {
  jest.clearAllMocks();
  // localStorage cleared by global beforeEach in setup.ts
});
```

### 2. **`act()` Wrapping**

State updates are wrapped in `act()` so React flushes updates before assertions:

```typescript
act(() => {
  result.current.borrowBook(bookA);
  result.current.borrowBook(bookA); // Separate calls so hook re-renders between them
});
```

### 3. **`waitFor()` for Async**

Wait for state to settle (not just for loading flag):

```typescript
await waitFor(() => {
  expect(result.current.error).toBeNull();
  expect(result.current.books).toHaveLength(2); // Both conditions
});
```

### 4. **Mocking Strategies**

**Jest module mocking** (preferred for unit tests):

```typescript
jest.mock('../services/booksApi', () => ({
  searchBooks: jest.fn(),
}));
```

**spyOn** (for method calls):

```typescript
const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
// … test code …
expect(spy).toHaveBeenCalledWith('error message');
spy.mockRestore();
```

---

## 📝 Writing New Tests

### Template

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does something', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText(/expected text/)).toBeInTheDocument();
  });
});
```

### Key APIs

- **`render()`** — Mount component in jsdom
- **`screen.getByRole()`** — Find by accessibility role (preferred)
- **`screen.getByText()`** — Find by visible text
- **`screen.getByPlaceholderText()`** — Find input by placeholder
- **`waitFor()`** — Poll callback until true or timeout
- **`userEvent.setup()`** — Simulate realistic user input
- **`jest.fn()`** — Create spy function
- **`jest.mock()`** — Replace module at import time

---

## ✅ CI/CD Integration

Add to your `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## 📚 Framework APIs

### React Testing Library

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Jest

```typescript
jest.fn()              // Mock function
jest.spyOn()           // Spy on existing function
jest.mock()            // Mock entire module
jest.clearAllMocks()   // Clear all mock calls
```

### Custom Matchers (@testing-library/jest-dom)

```typescript
expect(element).toBeInTheDocument();
expect(input).toHaveValue('text');
expect(button).toHaveAttribute('aria-label');
expect(element).toHaveClass('active');
expect(element).toBeDisabled();
expect(element).toBeVisible();
```

---

## 🐛 Troubleshooting

### "TextEncoder is not defined"

✅ **Fixed by** `src/__tests__/polyfills.cjs` — loaded via `setupFiles`

### Tests timeout

Increase Jest timeout for slow tests:

```typescript
jest.setTimeout(10000); // 10 seconds
```

### Mock not working

Ensure `jest.mock()` is **hoisted** before any imports of the module:

```typescript
jest.mock('../services/api'); // TOP of file, before imports
import { useBooks } from '../hooks/useBooks';
```

### CSS class assertions fail

`identity-obj-proxy` returns class name as string:

```typescript
// Given: className={styles.card}
// identity-obj-proxy makes styles.card === 'card'
expect(element).toHaveClass('card'); // ✅ Works
```

---

## 📖 Resources

- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [userEvent API](https://testing-library.com/user-event)
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)

---

**Last Updated**: 2026-04-10
**Test Count**: 64
**Passing**: 100%
