import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRouteGuard from '../AdminRouteGuard';
import * as AuthContextModule from '../../../context/AuthContext';

describe('AdminRouteGuard', () => {
  // FIXTURE: runs before every single test — wipes all mock call records
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // FIXTURE: runs after every single test — restores spied functions to their real implementation
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to login when no user is present', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects to home when user role is Employee', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Employee' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects to home when user role is Manager', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Manager' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders outlet for modern "Admin" role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Admin' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders outlet for legacy "ADMIN" role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'ADMIN' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('shows loading indicator while auth state is resolving', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
