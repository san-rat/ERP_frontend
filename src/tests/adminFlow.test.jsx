import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminRouteGuard from '../components/auth/AdminRouteGuard';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import { adminApi } from '../api/adminClient';
import AdminUserModal from '../components/admin/AdminUserModal';
import ResetPasswordModal from '../components/admin/ResetPasswordModal';

vi.mock('../api/adminClient', () => ({
  adminApi: {
    getOverview: vi.fn(),
    getUsers: vi.fn(),
    createManager: vi.fn(),
    createEmployee: vi.fn(),
    updateUser: vi.fn(),
    updateUserStatus: vi.fn(),
    resetUserPassword: vi.fn(),
  }
}));

const mockContextProps = (role) => ({
  user: { id: 1, email: 'test@example.com', role, username: "tester" },
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
});

describe('Admin Flow E2E Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unauthorized user blocked from admin area & route protection test', async () => {
    // Render the Guard with an Employee
    const authProps = mockContextProps('Employee');
    render(
      <AuthContext.Provider value={authProps}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<AdminRouteGuard />}>
              <Route index element={<div data-testid="admin-content">Admin Area</div>} />
            </Route>
            <Route path="/" element={<div data-testid="dashboard">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Expect to not see the admin content, and to see standard redirect to dashboard
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
  });

  it('admin page load test & dashboard overview data render test', async () => {
    adminApi.getOverview.mockResolvedValue({ totalUsers: 15, admins: 2 });
    
    render(<AdminDashboardPage />);

    expect(await screen.findByText('Platform Overview')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('create manager & create employee tests (via modal)', async () => {
    const onSubmit = vi.fn();
    render(<AdminUserModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} submitting={false} />);
    
    // Switch to manager dropdown
    const roleSelect = screen.getByDisplayValue('Employee (Base Access)');
    fireEvent.change(roleSelect, { target: { value: 'Manager' } });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('System login handle'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Email routing identity'), { target: { value: 'testuser@example.com' } });

    fireEvent.click(screen.getByText('Create User'));
    expect(onSubmit).toHaveBeenCalledWith({ username: 'testuser', email: 'testuser@example.com', role: 'Manager' });
  });

  it('edit user test requires prepopulation', () => {
    const onSubmit = vi.fn();
    const userToEdit = { id: 5, username: 'johndoe', email: 'john@example.com', role: 'Manager' };
    
    render(<AdminUserModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} submitting={false} user={userToEdit} />);
    
    expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Manager (Elevated Access)')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSubmit).toHaveBeenCalledWith({ username: 'johndoe', email: 'john@example.com', role: 'Manager', id: 5 });
  });

  it('reset password flow test validates confirmation parameter', () => {
    const onConfirm = vi.fn();
    const mockUser = { username: 'criticaluser', email: 'critical@critical.com' };

    render(
      <ResetPasswordModal 
        isOpen={true} 
        onClose={vi.fn()} 
        user={mockUser} 
        onConfirm={onConfirm}
        isSubmitting={false}
      />
    );

    const input = screen.getByPlaceholderText('Confirmation required...');
    const confirmBtn = screen.getByText('Confirm Reset');
    
    expect(confirmBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'wrongtext' } });
    expect(confirmBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'criticaluser' } });
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('deactivate/reactivate mock dispatch triggers appropriately on AdminUsersPage', async () => {
    // Mock the getUsers to return a populated user
    adminApi.getUsers.mockResolvedValue([
      { id: 10, username: 'tester', role: 'Employee', isActive: true, status: 'Active' }
    ]);
    
    // We confirm window.confirm logic locally by mocking window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AdminUsersPage />);

    // Wait for the mock user to render
    await waitFor(() => {
      expect(screen.getByText('tester')).toBeInTheDocument();
    });

    const actionButton = screen.getByTitle('Deactivate');
    expect(actionButton).not.toBeDisabled();
    
    fireEvent.click(actionButton);
    
    await waitFor(() => {
      expect(adminApi.updateUserStatus).toHaveBeenCalledWith(10, false);
    });
  });
});
