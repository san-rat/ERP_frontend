import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ManagerRouteGuard from '../ManagerRouteGuard';
import * as AuthContextModule from '../../../context/AuthContext';

describe('ManagerRouteGuard', () => {
  it('redirects to login when no user is present', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/manager']}>
        <Routes>
          <Route element={<ManagerRouteGuard />}>
            <Route path="/manager" element={<div>Manager Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Manager Content')).not.toBeInTheDocument();
  });

  it('redirects to login when user role is Employee', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Employee' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/manager']}>
        <Routes>
          <Route element={<ManagerRouteGuard />}>
            <Route path="/manager" element={<div>Manager Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders outlet for Manager role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Manager' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/manager']}>
        <Routes>
          <Route element={<ManagerRouteGuard />}>
            <Route path="/manager" element={<div>Manager Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Manager Content')).toBeInTheDocument();
  });

  it('renders outlet for Admin role (admins can access manager routes)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Admin' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/manager']}>
        <Routes>
          <Route element={<ManagerRouteGuard />}>
            <Route path="/manager" element={<div>Manager Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Manager Content')).toBeInTheDocument();
  });

  it('renders null while auth state is loading', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: null, loading: true });

    const { container } = render(
      <MemoryRouter initialEntries={['/manager']}>
        <Routes>
          <Route element={<ManagerRouteGuard />}>
            <Route path="/manager" element={<div>Manager Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
