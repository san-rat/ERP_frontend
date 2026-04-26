import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCK
// AuthContext calls useNavigate() to redirect the user after login/logout.
// useNavigate only works inside a real React Router — which we don't have here.
// So we replace the ENTIRE react-router-dom module with a controlled fake.
// vi.mock is HOISTED to the top by Vitest, so it runs before any import.
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// TEST CONSUMER COMPONENT
// We can't test AuthProvider in isolation — it needs children that consume the
// context. This minimal component reads from useAuth() and exposes buttons to
// trigger login() and logout(), making the context's behavior observable.
// ─────────────────────────────────────────────────────────────────────────────
const TestConsumer = () => {
  const { user, login, logout, loading } = useAuth();

  return (
    <div>
      {/* Shows who is logged in — 'no-user' when null */}
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>

      {/* Shows whether auth is still resolving */}
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>

      {/* Buttons to trigger login with different roles */}
      <button onClick={() => login({ token: 'test-token', role: 'Admin' })}>
        Login Admin
      </button>
      <button onClick={() => login({ token: 'test-token', role: 'Employee' })}>
        Login Employee
      </button>
      <button onClick={() => login({ token: 'test-token', role: 'Manager' })}>
        Login Manager
      </button>
      <button onClick={() => login({ token: 'test-token', role: 'Unknown' })}>
        Login Unknown
      </button>

      {/* Button to trigger logout */}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HELPER
// Wraps AuthProvider + TestConsumer in one reusable function.
// @testing-library/react automatically wraps render() in act(), so all
// useEffect hooks (including session rehydration) settle before returning.
// ─────────────────────────────────────────────────────────────────────────────
const renderProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthContext — AuthProvider', () => {
  // mockNavigate is a spy we create fresh before each test.
  // It replaces the real navigate() function so we can check what path was called.
  let mockNavigate;

  // FIXTURE: runs before every test
  // 1. Create a fresh spy function for navigate
  // 2. Tell useNavigate (the mocked hook) to return that spy
  // 3. Wipe sessionStorage — prevents storage from one test leaking into the next
  beforeEach(() => {
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    sessionStorage.clear();
  });

  // FIXTURE: runs after every test
  // Resets all mock call histories so tests don't accumulate state
  afterEach(() => {
    vi.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP 1: Session Rehydration
  // AuthProvider reads sessionStorage in useEffect on first mount.
  // These tests verify the 4 possible states of storage at page load.
  // ───────────────────────────────────────────────────────────────────────────
  describe('session rehydration on mount', () => {
    it('restores user from sessionStorage when both token and user exist', () => {
      // ARRANGE: pre-populate storage as if the user was already logged in
      const storedUser = { id: 1, username: 'alice', role: 'Admin', token: 'abc' };
      sessionStorage.setItem('erp_token', 'abc');
      sessionStorage.setItem('erp_user', JSON.stringify(storedUser));

      // ACT: render — useEffect runs and restores the user
      renderProvider();

      // ASSERT: the context user matches what was in storage
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(storedUser));
    });

    it('shows no user when sessionStorage is completely empty', () => {
      // No setup needed — beforeEach already cleared sessionStorage

      renderProvider();

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('clears orphan token when erp_user is missing', () => {
      // ARRANGE: only token exists — this is an inconsistent state
      // (e.g. a partial logout or corrupted session)
      sessionStorage.setItem('erp_token', 'orphan-token');

      renderProvider();

      // ASSERT: the orphan token must be wiped
      expect(sessionStorage.getItem('erp_token')).toBeNull();
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('clears both keys when erp_user contains invalid JSON', () => {
      // ARRANGE: storage has corrupted user data
      sessionStorage.setItem('erp_token', 'tok');
      sessionStorage.setItem('erp_user', '{ this is : NOT valid JSON }');

      renderProvider();

      // ASSERT: the catch block fires and wipes both keys
      expect(sessionStorage.getItem('erp_token')).toBeNull();
      expect(sessionStorage.getItem('erp_user')).toBeNull();
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('sets loading to false after rehydration is complete', () => {
      // loading starts as true and becomes false after useEffect finishes
      renderProvider();

      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP 2: login()
  // These tests verify that calling login() saves data to sessionStorage
  // and navigates to the correct route based on user role.
  // ───────────────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('saves the token to sessionStorage', () => {
      renderProvider();

      // ACT: click the Login Admin button — calls login({ token, role: 'Admin' })
      fireEvent.click(screen.getByText('Login Admin'));

      // ASSERT: token was saved
      expect(sessionStorage.getItem('erp_token')).toBe('test-token');
    });

    it('saves the full user object to sessionStorage as JSON', () => {
      renderProvider();

      fireEvent.click(screen.getByText('Login Admin'));

      const saved = JSON.parse(sessionStorage.getItem('erp_user'));
      expect(saved.role).toBe('Admin');
      expect(saved.token).toBe('test-token');
    });

    it('navigates to /admin for Admin role', () => {
      renderProvider();

      fireEvent.click(screen.getByText('Login Admin'));

      // ASSERT: navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    it('navigates to /employee/overview for Employee role', () => {
      renderProvider();

      fireEvent.click(screen.getByText('Login Employee'));

      expect(mockNavigate).toHaveBeenCalledWith('/employee/overview');
    });

    it('navigates to /manager/analytics for Manager role', () => {
      renderProvider();

      fireEvent.click(screen.getByText('Login Manager'));

      expect(mockNavigate).toHaveBeenCalledWith('/manager/analytics');
    });

    it('navigates to / for an unrecognised role', () => {
      // Edge case: if the backend sends a role we don't know, go to home
      renderProvider();

      fireEvent.click(screen.getByText('Login Unknown'));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUP 3: logout()
  // These tests verify that logout() clears ALL related session keys
  // and navigates the user back to /login.
  // ───────────────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    // Inner fixture: seed storage with a full logged-in session before each logout test
    beforeEach(() => {
      sessionStorage.setItem('erp_token', 'valid-token');
      sessionStorage.setItem('erp_user', JSON.stringify({ role: 'Admin' }));
      sessionStorage.setItem('erp_churn_predictions', 'some-cached-data');
      sessionStorage.setItem('erp_total_customers', '500');
      sessionStorage.setItem('erp_all_forecasts', 'forecast-data');
    });

    it('removes erp_token from sessionStorage', () => {
      renderProvider();

      fireEvent.click(screen.getByText('Logout'));

      expect(sessionStorage.getItem('erp_token')).toBeNull();
    });

    it('removes erp_user from sessionStorage', () => {
      renderProvider();

      fireEvent.click(screen.getByText('Logout'));

      expect(sessionStorage.getItem('erp_user')).toBeNull();
    });

    it('clears all auxiliary cache keys from sessionStorage', () => {
      // The logout function also wipes cached ML/analytics data
      renderProvider();

      fireEvent.click(screen.getByText('Logout'));

      expect(sessionStorage.getItem('erp_churn_predictions')).toBeNull();
      expect(sessionStorage.getItem('erp_total_customers')).toBeNull();
      expect(sessionStorage.getItem('erp_all_forecasts')).toBeNull();
    });

    it('navigates to /login after logout', () => {
      renderProvider();

      fireEvent.click(screen.getByText('Logout'));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
