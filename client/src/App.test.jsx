import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders the auth page when no token is present', async () => {
    // Mock health check to prevent network errors
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      })
    );

    render(<App />);
    // After boot, should show auth page
    await waitFor(() => {
      expect(screen.getByText(/Pawfect FurEver/i)).toBeInTheDocument();
    });
  });

  it('shows login form by default', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })
    );

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    });
  });

  it('can switch to register tab', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })
    );

    render(<App />);
    await waitFor(() => {
      const registerTab = screen.getByText(/Create Account/i);
      fireEvent.click(registerTab);
      expect(screen.getByPlaceholderText(/Jane Smith/i)).toBeInTheDocument();
    });
  });
});
