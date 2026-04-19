/**
 * SearchBar — unit tests
 *
 * Verifies that the controlled input fires onChange with the correct value on
 * every keystroke and that the clear button resets the value to an empty string.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../components/SearchBar';

// ── Helper ─────────────────────────────────────────────────────────────────────

function renderSearchBar(value = '', onChange = jest.fn()) {
  return {
    onChange,
    ...render(<SearchBar value={value} onChange={onChange} />),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('SearchBar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the search input', () => {
      renderSearchBar();
      expect(
        screen.getByRole('searchbox', { hidden: false }),
      ).toBeInTheDocument();
    });

    it('displays the current value in the input', () => {
      renderSearchBar('react');
      expect(screen.getByRole('searchbox')).toHaveValue('react');
    });

    it('renders the default placeholder text', () => {
      renderSearchBar();
      expect(screen.getByPlaceholderText(/pesquisar livros/i)).toBeInTheDocument();
    });

    it('renders a custom placeholder when provided', () => {
      render(<SearchBar value="" onChange={jest.fn()} placeholder="Buscar no acervo" />);
      expect(screen.getByPlaceholderText('Buscar no acervo')).toBeInTheDocument();
    });

    it('hides the clear button when value is empty', () => {
      renderSearchBar('');
      expect(
        screen.queryByRole('button', { name: /limpar/i }),
      ).not.toBeInTheDocument();
    });

    it('shows the clear button when value is non-empty', () => {
      renderSearchBar('algo');
      expect(
        screen.getByRole('button', { name: /limpar/i }),
      ).toBeInTheDocument();
    });
  });

  describe('typing interaction', () => {
    it('calls onChange on every keystroke', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<SearchBar value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'abc');

      // Called once per character
      expect(onChange).toHaveBeenCalledTimes(3);
    });

    it('calls onChange with e.target.value on each keystroke', async () => {
      // SearchBar is a controlled component. With value="" and no state update in
      // the parent, the DOM is reset to "" after every render, so each call
      // receives just the character typed (not the accumulated string).
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<SearchBar value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'js');

      expect(onChange).toHaveBeenNthCalledWith(1, 'j');
      expect(onChange).toHaveBeenNthCalledWith(2, 's');
    });

    it('calls onChange with the accumulated value when parent updates value', async () => {
      // Use a stateful wrapper so the controlled value updates between keystrokes.
      const user = userEvent.setup();
      const onChange = jest.fn();

      function StatefulWrapper() {
        const [val, setVal] = React.useState('');
        return (
          <SearchBar
            value={val}
            onChange={v => { setVal(v); onChange(v); }}
          />
        );
      }

      render(<StatefulWrapper />);
      const input = screen.getByRole('searchbox');
      await user.type(input, 'ab');

      expect(onChange).toHaveBeenNthCalledWith(1, 'a');
      expect(onChange).toHaveBeenNthCalledWith(2, 'ab');
    });
  });

  describe('clear button', () => {
    it('calls onChange with an empty string when clear is clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<SearchBar value="typescript" onChange={onChange} />);

      const clearBtn = screen.getByRole('button', { name: /limpar/i });
      await user.click(clearBtn);

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('calls onChange with empty string when Enter is pressed on the clear button', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<SearchBar value="hello" onChange={onChange} />);

      const clearBtn = screen.getByRole('button', { name: /limpar/i });
      clearBtn.focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('calls onChange with empty string when Space is pressed on the clear button', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<SearchBar value="hello" onChange={onChange} />);

      const clearBtn = screen.getByRole('button', { name: /limpar/i });
      clearBtn.focus();
      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('accessibility', () => {
    it('wraps the input in a role="search" region', () => {
      renderSearchBar();
      expect(screen.getByRole('search')).toBeInTheDocument();
    });

    it('has a visually-hidden label associated with the input', () => {
      renderSearchBar();
      // The label is sr-only but still accessible to screen readers
      expect(screen.getByLabelText(/pesquisar livros/i)).toBeInTheDocument();
    });
  });
});
