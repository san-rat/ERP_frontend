import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ManagerLayout from '../ManagerLayout.jsx';
import * as AuthContext from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// ManagerLayout calls useAuth() for user info and logout.
// We mock the entire AuthContext module so we control what useAuth returns
// per test using vi.mocked(AuthContext.useAuth).mockReturnValue(...)
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// NotificationPanel makes its own API calls — stub it out completely
vi.mock('../../components/common/NotificationPanel', () => ({
  default: () => <div data-testid="notification-panel">Notifications</div>,
}));

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HELPER
// Wraps ManagerLayout in a MemoryRouter with a child route so <Outlet /> works
// ─────────────────────────────────────────────────────────────────────────────
const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/manager/analytics']}>
      <Routes>
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="analytics" element={<div>Analytics Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('ManagerLayout', () => {
  let mockLogout;

  // FIXTURE: fresh logout spy and default user before every test
  beforeEach(() => {
    mockLogout = vi.fn();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { email: 'manager@example.com' },
      logout: mockLogout,
    });
  });

  // FIXTURE: restore spies after every test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Navigation Links ────────────────────────────────────────────────────────

  it('renders the Product Insights nav link', () => {
    renderLayout();
    expect(
      screen.getByRole('link', { name: /Product Insights/i })
    ).toBeInTheDocument();
  });

  it('renders the Customer Insights nav link', () => {
    renderLayout();
    expect(
      screen.getByRole('link', { name: /Customer Insights/i })
    ).toBeInTheDocument();
  });

  it('does not render removed nav links (Order History, Product Analytics)', () => {
    renderLayout();
    expect(
      screen.queryByRole('link', { name: /Order History/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Product Analytics/i })
    ).not.toBeInTheDocument();
  });

  // ── User Chip (email + avatar + role label) ─────────────────────────────────

  it('displays the user email in the user chip', () => {
    renderLayout();
    expect(screen.getByText('manager@example.com')).toBeInTheDocument();
  });

  it('shows the first letter of the email as the avatar', () => {
    // 'manager@example.com'[0].toUpperCase() === 'M'
    renderLayout();
    const avatar = document.querySelector('.hp-user-avatar');
    expect(avatar?.textContent?.trim()).toBe('M');
  });

  it('shows fallback email text when user has no email', () => {
    // user?.email is null → falls back to 'manager@company.com'
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { email: null },
      logout: mockLogout,
    });

    renderLayout();
    expect(screen.getByText('manager@company.com')).toBeInTheDocument();
  });

  it('shows "M" avatar fallback when user email is null', () => {
    // user?.email?.[0]?.toUpperCase() is undefined → falls back to "M"
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { email: null },
      logout: mockLogout,
    });

    renderLayout();
    const avatar = document.querySelector('.hp-user-avatar');
    expect(avatar?.textContent?.trim()).toBe('M');
  });

  it('renders the "Manager" role label in the user chip', () => {
    renderLayout();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  // ── Brand ───────────────────────────────────────────────────────────────────

  it('renders the InsightERP brand name', () => {
    renderLayout();
    // Appears in both the sidebar and the topbar
    const brandNames = screen.getAllByText('InsightERP');
    expect(brandNames.length).toBeGreaterThanOrEqual(1);
  });

  // ── Outlet (child route rendering) ─────────────────────────────────────────

  it('renders child route content through the Outlet', () => {
    renderLayout();
    expect(screen.getByText('Analytics Content')).toBeInTheDocument();
  });

  it('renders the NotificationPanel stub', () => {
    renderLayout();
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
  });

  // ── Sidebar open/close (hamburger menu) ────────────────────────────────────

  it('sidebar does not have the open class by default', () => {
    renderLayout();
    const sidebar = document.querySelector('.hp-sidebar');
    expect(sidebar?.className).not.toContain('hp-sidebar--open');
  });

  it('overlay is not visible by default', () => {
    renderLayout();
    expect(document.querySelector('.hp-overlay')).not.toBeInTheDocument();
  });

  it('clicking the hamburger button adds the open class to sidebar', () => {
    renderLayout();
    const hamburger = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(hamburger);
    const sidebar = document.querySelector('.hp-sidebar');
    expect(sidebar?.className).toContain('hp-sidebar--open');
  });

  it('clicking the hamburger button shows the overlay', () => {
    renderLayout();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(document.querySelector('.hp-overlay')).toBeInTheDocument();
  });

  it('clicking the overlay closes the sidebar', () => {
    renderLayout();
    // Open first
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(document.querySelector('.hp-overlay')).toBeInTheDocument();

    // Click overlay to close
    fireEvent.click(document.querySelector('.hp-overlay'));
    expect(document.querySelector('.hp-overlay')).not.toBeInTheDocument();
  });

  it('clicking a navigation link closes the sidebar', () => {
    renderLayout();
    
    // Open sidebar
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    const sidebar = document.querySelector('.hp-sidebar');
    expect(sidebar?.className).toContain('hp-sidebar--open');

    // Click NavLink
    const navLink = screen.getByRole('link', { name: /Product Insights/i });
    fireEvent.click(navLink);

    // Sidebar should close
    expect(sidebar?.className).not.toContain('hp-sidebar--open');
  });

  // ── Logout ──────────────────────────────────────────────────────────────────

  it('calls the logout function when the logout button is clicked', () => {
    renderLayout();
    // The logout button contains "Log out" text (from the span)
    const logoutButton = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
