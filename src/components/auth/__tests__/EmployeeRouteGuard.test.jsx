import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EmployeeRouteGuard from '../EmployeeRouteGuard';
import * as AuthContextModule from '../../../context/AuthContext';

describe('EmployeeRouteGuard', () => {
  it('redirects to login when no user is present', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/employee']}>
        <Routes>
          <Route element={<EmployeeRouteGuard />}>
            <Route path="/employee" element={<div>Employee Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Employee Content')).not.toBeInTheDocument();
  });

  it('redirects to login when user role is not employee', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Admin' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/employee']}>
        <Routes>
          <Route element={<EmployeeRouteGuard />}>
            <Route path="/employee" element={<div>Employee Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders outlet when user role is employee', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ user: { role: 'Employee' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/employee']}>
        <Routes>
          <Route element={<EmployeeRouteGuard />}>
            <Route path="/employee" element={<div>Employee Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Employee Content')).toBeInTheDocument();
  });
});
