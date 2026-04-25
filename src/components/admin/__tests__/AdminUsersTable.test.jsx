import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminUsersTable from '../AdminUsersTable';

const noop = vi.fn();

// ── describe.each: one describe block per role type ──────────────────────────
// Verifies role badge text and action button availability for every role.

describe.each([
  { role: 'Admin',    isAdmin: true  },
  { role: 'Manager',  isAdmin: false },
  { role: 'Employee', isAdmin: false },
])('user with role "$role"', ({ role, isAdmin }) => {
  const user = { id: 1, username: 'testuser', email: 'test@example.com', role, isActive: true };

  it('renders the role badge with the correct label', () => {
    render(<AdminUsersTable users={[user]} onEdit={noop} onToggleStatus={noop} onResetPassword={noop} />);
    expect(screen.getByText(role)).toBeInTheDocument();
  });

  it(`disables all action buttons when isAdmin=${isAdmin}`, () => {
    render(<AdminUsersTable users={[user]} onEdit={noop} onToggleStatus={noop} onResetPassword={noop} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      if (isAdmin) {
        expect(btn).toBeDisabled();
      } else {
        expect(btn).not.toBeDisabled();
      }
    });
  });
});

// ── describe.each: active vs inactive status rendering ───────────────────────

describe.each([
  { label: 'active user (isActive: true)',     isActive: true,  status: undefined,  expectedBadge: 'Active'   },
  { label: 'inactive user (isActive: false)',  isActive: false, status: undefined,  expectedBadge: 'Inactive' },
  { label: 'inactive user (status: Inactive)', isActive: true,  status: 'Inactive', expectedBadge: 'Inactive' },
])('$label', ({ isActive, status, expectedBadge }) => {
  const user = { id: 2, username: 'u2', email: 'u2@example.com', role: 'Employee', isActive, status };

  it(`renders the "${ expectedBadge }" status badge`, () => {
    render(<AdminUsersTable users={[user]} onEdit={noop} onToggleStatus={noop} onResetPassword={noop} />);
    expect(screen.getByText(expectedBadge)).toBeInTheDocument();
  });

  it('renders the correct toggle button title', () => {
    render(<AdminUsersTable users={[user]} onEdit={noop} onToggleStatus={noop} onResetPassword={noop} />);
    const expectedTitle = expectedBadge === 'Active' ? 'Deactivate' : 'Activate';
    expect(screen.getByTitle(expectedTitle)).toBeInTheDocument();
  });
});

// ── it.each: username display fallback logic ─────────────────────────────────

describe('username display', () => {
  it.each([
    { username: 'johndoe',  email: 'john@example.com', expectedDisplay: 'johndoe'  },
    { username: undefined,  email: 'jane@example.com', expectedDisplay: 'jane'     },
    { username: '',         email: 'bob@corp.io',      expectedDisplay: 'bob'      },
  ])(
    'displays "$expectedDisplay" for username="$username" email="$email"',
    ({ username, email, expectedDisplay }) => {
      const user = { id: 3, username, email, role: 'Employee', isActive: true };
      render(<AdminUsersTable users={[user]} onEdit={noop} onToggleStatus={noop} onResetPassword={noop} />);
      expect(screen.getByText(expectedDisplay)).toBeInTheDocument();
    }
  );
});

// ── it.each: callback fires with the correct user object ─────────────────────

describe('action callbacks', () => {
  const users = [
    { id: 10, username: 'alice', email: 'alice@x.com', role: 'Manager',  isActive: true  },
    { id: 11, username: 'bob',   email: 'bob@x.com',   role: 'Employee', isActive: false },
  ];

  it.each(users)('onEdit fires with user "$username" when Edit Role is clicked', (user) => {
    const onEdit = vi.fn();
    render(<AdminUsersTable users={[user]} onEdit={onEdit} onToggleStatus={noop} onResetPassword={noop} />);
    fireEvent.click(screen.getByTitle('Edit Role'));
    expect(onEdit).toHaveBeenCalledWith(user);
  });

  it.each(users)('onResetPassword fires with user "$username" when Reset Password is clicked', (user) => {
    const onResetPassword = vi.fn();
    render(<AdminUsersTable users={[user]} onEdit={noop} onToggleStatus={noop} onResetPassword={onResetPassword} />);
    fireEvent.click(screen.getByTitle('Reset Password'));
    expect(onResetPassword).toHaveBeenCalledWith(user);
  });
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('empty state', () => {
  it('shows a no-users message when the users array is empty', () => {
    render(<AdminUsersTable users={[]} onEdit={noop} onToggleStatus={noop} onResetPassword={noop} />);
    expect(screen.getByText('No users found. Try adjusting your filters.')).toBeInTheDocument();
  });
});
