import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsersPage from '../AdminUsersPage';
import { adminApi } from '../../../api/adminClient';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCKS
// AdminUsersPage calls adminApi (real HTTP) and toast (browser notification).
// We replace both with controlled fakes so tests are fast, offline, and stable.
// ─────────────────────────────────────────────────────────────────────────────

// Mock all adminApi methods
vi.mock('../../../api/adminClient', () => ({
  adminApi: {
    getUsers:          vi.fn(),
    createManager:     vi.fn(),
    createEmployee:    vi.fn(),
    updateUser:        vi.fn(),
    updateUserStatus:  vi.fn(),
    resetUserPassword: vi.fn(),
  },
}));

// Mock toast so we can assert success/error notifications
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// ─────────────────────────────────────────────────────────────────────────────
// CHILD COMPONENT STUBS
// AdminUsersTable, AdminUserModal, and ResetPasswordModal are complex.
// We already test them individually. Here we replace them with lightweight
// stubs that expose just enough surface area to trigger the page's handlers.
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../../../components/admin/AdminUsersTable', () => ({
  default: ({ users, onEdit, onToggleStatus, onResetPassword }) => (
    <div data-testid="users-table">
      {users.map((u) => (
        <div key={u.id || u.username} data-testid={`row-${u.username}`}>
          <span>{u.username}</span>
          <button onClick={() => onEdit(u)}>edit-{u.username}</button>
          <button onClick={() => onToggleStatus(u)}>toggle-{u.username}</button>
          <button onClick={() => onResetPassword(u)}>reset-{u.username}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../../../components/admin/AdminUserModal', () => ({
  default: ({ isOpen, onClose, onSubmit, user }) =>
    isOpen ? (
      <div data-testid="user-modal">
        <button onClick={() => onSubmit({ role: 'Employee', username: 'newEmp' })}>
          Submit Employee
        </button>
        <button onClick={() => onSubmit({ role: 'Manager', username: 'newMgr' })}>
          Submit Manager
        </button>
        {/* Only shown in edit mode — user prop is truthy */}
        {user && (
          <button onClick={() => onSubmit({ role: 'Manager' })}>Submit Edit</button>
        )}
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

vi.mock('../../../components/admin/ResetPasswordModal', () => ({
  default: ({ isOpen, onClose, onConfirm, generatedPassword }) =>
    isOpen ? (
      <div data-testid="reset-modal">
        <button onClick={onConfirm}>Confirm Reset</button>
        <button onClick={onClose}>Close Reset</button>
        {generatedPassword && (
          <span data-testid="generated-password">{generatedPassword}</span>
        )}
      </div>
    ) : null,
}));

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Factory for a fake user object — use overrides to customise per test
const makeUser = (overrides = {}) => ({
  id: 1,
  username: 'alice',
  email: 'alice@test.com',
  role: 'Employee',
  isActive: true,
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('AdminUsersPage', () => {
  // FIXTURE: reset all mocks and set a safe default API response before each test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser()]);
  });

  // FIXTURE: restore any spies (window.confirm etc.) after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Render & Initial Load ───────────────────────────────────────────────────

  it('renders the Staff Management heading', async () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('Staff Management')).toBeInTheDocument();
  });

  it('renders the Add New User button', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('Add New User')).toBeInTheDocument();
  });

  it('calls adminApi.getUsers on mount', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(1));
  });

  it('displays users returned by the API', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue([
      makeUser({ username: 'alice' }),
      makeUser({ id: 2, username: 'bob' }),
    ]);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });

  it('handles a paged API response with an items array and totalPages', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue({
      items: [makeUser({ username: 'charlie' })],
      totalPages: 5,
    });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('charlie')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });
  });

  it('shows a toast error when getUsers fails', async () => {
    vi.mocked(adminApi.getUsers).mockRejectedValue(new Error('Network error'));

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Network error')
      );
    });
  });

  // ── Filters & Search ────────────────────────────────────────────────────────

  it('renders the search input', () => {
    render(<AdminUsersPage />);
    expect(
      screen.getByPlaceholderText('Search by name or email...')
    ).toBeInTheDocument();
  });

  it('renders the role filter with correct options', () => {
    render(<AdminUsersPage />);
    expect(screen.getByDisplayValue('All Roles')).toBeInTheDocument();
  });

  it('renders the status filter with correct options', () => {
    render(<AdminUsersPage />);
    expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument();
  });

  it('re-fetches users when search input changes', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText('Search by name or email...'), {
      target: { value: 'bob' },
    });

    await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(2));
  });

  it('re-fetches users when role filter changes', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByDisplayValue('All Roles'), {
      target: { value: 'Manager' },
    });

    await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(2));
  });

  it('re-fetches users when status filter changes', async () => {
    render(<AdminUsersPage />);
    await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: 'ACTIVE' },
    });

    await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(2));
  });

  // ── Pagination ──────────────────────────────────────────────────────────────

  it('shows Page 1 of 1 on initial load', async () => {
    render(<AdminUsersPage />);
    await waitFor(() =>
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    );
  });

  it('Previous button is disabled on page 1', async () => {
    render(<AdminUsersPage />);
    await waitFor(() =>
      expect(screen.getByText('Previous')).toBeDisabled()
    );
  });

  it('Next button is disabled when totalPages is 1', async () => {
    render(<AdminUsersPage />);
    await waitFor(() =>
      expect(screen.getByText('Next')).toBeDisabled()
    );
  });

  // ── User Modal — Open & Close ────────────────────────────────────────────────

  it('opens the user modal when Add New User is clicked', async () => {
    render(<AdminUsersPage />);
    fireEvent.click(screen.getByText('Add New User'));
    expect(screen.getByTestId('user-modal')).toBeInTheDocument();
  });

  it('opens the user modal in edit mode when the edit button is clicked', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser({ username: 'alice' })]);

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('edit-alice'));
    fireEvent.click(screen.getByText('edit-alice'));

    // Submit Edit button is only rendered in edit mode (when user prop is truthy)
    expect(screen.getByText('Submit Edit')).toBeInTheDocument();
  });

  // ── handleCreateOrUpdateUser ────────────────────────────────────────────────

  it('calls createEmployee and shows success toast for new Employee', async () => {
    vi.mocked(adminApi.createEmployee).mockResolvedValue({});

    render(<AdminUsersPage />);
    fireEvent.click(screen.getByText('Add New User'));
    fireEvent.click(screen.getByText('Submit Employee'));

    await waitFor(() => {
      expect(adminApi.createEmployee).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('User created successfully');
    });
  });

  it('calls createManager and shows success toast for new Manager', async () => {
    vi.mocked(adminApi.createManager).mockResolvedValue({});

    render(<AdminUsersPage />);
    fireEvent.click(screen.getByText('Add New User'));
    fireEvent.click(screen.getByText('Submit Manager'));

    await waitFor(() => {
      expect(adminApi.createManager).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('User created successfully');
    });
  });

  it('calls updateUser and shows success toast when editing a user', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser({ id: 5, username: 'alice' })]);
    vi.mocked(adminApi.updateUser).mockResolvedValue({});

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('edit-alice'));
    fireEvent.click(screen.getByText('edit-alice'));
    fireEvent.click(screen.getByText('Submit Edit'));

    await waitFor(() => {
      expect(adminApi.updateUser).toHaveBeenCalledWith(5, expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('User updated successfully');
    });
  });

  it('shows error toast when user creation fails', async () => {
    vi.mocked(adminApi.createEmployee).mockRejectedValue(new Error('Create failed'));

    render(<AdminUsersPage />);
    fireEvent.click(screen.getByText('Add New User'));
    fireEvent.click(screen.getByText('Submit Employee'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Create failed');
    });
  });

  // ── handleToggleStatus ──────────────────────────────────────────────────────

  it('calls updateUserStatus when window.confirm returns true', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(adminApi.getUsers).mockResolvedValue([
      makeUser({ id: 1, username: 'alice', isActive: true }),
    ]);
    vi.mocked(adminApi.updateUserStatus).mockResolvedValue({});

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('toggle-alice'));
    fireEvent.click(screen.getByText('toggle-alice'));

    await waitFor(() => {
      // Active user → deactivate → called with false
      expect(adminApi.updateUserStatus).toHaveBeenCalledWith(1, false);
    });
  });

  it('does NOT call updateUserStatus when window.confirm returns false', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser({ username: 'alice' })]);

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('toggle-alice'));
    fireEvent.click(screen.getByText('toggle-alice'));

    expect(adminApi.updateUserStatus).not.toHaveBeenCalled();
  });

  // ── handleOpenResetModal & handleConfirmReset ───────────────────────────────

  it('opens the reset modal when reset button is clicked', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser({ username: 'alice' })]);

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('reset-alice'));
    fireEvent.click(screen.getByText('reset-alice'));

    expect(screen.getByTestId('reset-modal')).toBeInTheDocument();
  });

  it('calls resetUserPassword and shows success toast on confirm', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser({ id: 3, username: 'alice' })]);
    vi.mocked(adminApi.resetUserPassword).mockResolvedValue({ password: 'TempPass!' });

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('reset-alice'));
    fireEvent.click(screen.getByText('reset-alice'));
    fireEvent.click(screen.getByText('Confirm Reset'));

    await waitFor(() => {
      expect(adminApi.resetUserPassword).toHaveBeenCalledWith(3);
      expect(toast.success).toHaveBeenCalledWith('Password reset. Inform the user.');
    });
  });

  it('displays the generated password after a successful reset', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser({ username: 'alice' })]);
    vi.mocked(adminApi.resetUserPassword).mockResolvedValue({ password: 'TempPass!' });

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('reset-alice'));
    fireEvent.click(screen.getByText('reset-alice'));
    fireEvent.click(screen.getByText('Confirm Reset'));

    await waitFor(() => {
      expect(screen.getByTestId('generated-password')).toHaveTextContent('TempPass!');
    });
  });

  it('shows error toast when resetUserPassword fails', async () => {
    vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser({ username: 'alice' })]);
    vi.mocked(adminApi.resetUserPassword).mockRejectedValue(new Error('Reset failed'));

    render(<AdminUsersPage />);
    await waitFor(() => screen.getByText('reset-alice'));
    fireEvent.click(screen.getByText('reset-alice'));
    fireEvent.click(screen.getByText('Confirm Reset'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Reset failed')
      );
    });
  });
});
