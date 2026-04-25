import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminUserModal from '../AdminUserModal';

const noop = vi.fn();

// ── describe.each: modal title changes based on create vs edit mode ────────────

describe.each([
  {
    label:         'create mode (no user prop)',
    user:          null,
    expectedTitle: 'Add New Staff',
    expectedBtn:   'Create User',
  },
  {
    label:         'edit mode — Manager user',
    user:          { id: 1, username: 'alice', email: 'alice@x.com', role: 'Manager' },
    expectedTitle: 'Edit User Properties',
    expectedBtn:   'Save Changes',
  },
  {
    label:         'edit mode — Employee user',
    user:          { id: 2, username: 'bob', email: 'bob@x.com', role: 'Employee' },
    expectedTitle: 'Edit User Properties',
    expectedBtn:   'Save Changes',
  },
])('$label', ({ user, expectedTitle, expectedBtn }) => {
  it('renders the correct modal heading', () => {
    render(<AdminUserModal isOpen user={user} onClose={noop} onSubmit={noop} />);
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it('renders the correct submit button label', () => {
    render(<AdminUserModal isOpen user={user} onClose={noop} onSubmit={noop} />);
    expect(screen.getByRole('button', { name: expectedBtn })).toBeInTheDocument();
  });

  it('pre-fills the email field with the user value (or empty in create mode)', () => {
    render(<AdminUserModal isOpen user={user} onClose={noop} onSubmit={noop} />);
    const emailInput = screen.getByPlaceholderText('Email routing identity');
    expect(emailInput.value).toBe(user ? user.email : '');
  });

  it('disables the username field in edit mode, enables it in create mode', () => {
    render(<AdminUserModal isOpen user={user} onClose={noop} onSubmit={noop} />);
    const usernameInput = screen.getByPlaceholderText('System login handle');
    if (user) {
      expect(usernameInput).toBeDisabled();
    } else {
      expect(usernameInput).not.toBeDisabled();
    }
  });
});

// ── it.each: role <select> always contains exactly these two options ───────────

describe('role select options', () => {
  it.each([
    { optionText: 'Employee (Base Access)',    value: 'Employee' },
    { optionText: 'Manager (Elevated Access)', value: 'Manager'  },
  ])('renders the "$optionText" option', ({ optionText }) => {
    render(<AdminUserModal isOpen user={null} onClose={noop} onSubmit={noop} />);
    expect(screen.getByRole('option', { name: optionText })).toBeInTheDocument();
  });
});

// ── it.each: pre-selected role matches the user.role prop ─────────────────────

describe('role pre-selection', () => {
  it.each([
    { role: 'Employee' },
    { role: 'Manager'  },
  ])('pre-selects "$role" when user.role is "$role"', ({ role }) => {
    const user = { id: 9, username: 'u', email: 'u@x.com', role };
    render(<AdminUserModal isOpen user={user} onClose={noop} onSubmit={noop} />);
    expect(screen.getByRole('combobox').value).toBe(role);
  });
});

// ── describe.each: username fallback when user.username is missing ─────────────
// In edit mode without a username, the modal falls back to the email prefix.

describe.each([
  { username: 'johndoe', email: 'john@example.com', expectedUsername: 'johndoe' },
  { username: undefined,  email: 'jane@example.com', expectedUsername: 'jane'    },
  { username: '',         email: 'bob@corp.io',      expectedUsername: 'bob'     },
])('username field pre-fill for username="$username"', ({ username, email, expectedUsername }) => {
  it('pre-fills the username input with the expected value', () => {
    const user = { id: 3, username, email, role: 'Employee' };
    render(<AdminUserModal isOpen user={user} onClose={noop} onSubmit={noop} />);
    const input = screen.getByPlaceholderText('System login handle');
    expect(input.value).toBe(expectedUsername);
  });
});

// ── onSubmit payload shape ─────────────────────────────────────────────────────

describe('onSubmit payload', () => {
  it('includes id when submitting in edit mode', () => {
    const user = { id: 7, username: 'carol', email: 'carol@x.com', role: 'Manager' };
    const onSubmit = vi.fn();
    render(<AdminUserModal isOpen user={user} onClose={noop} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, username: 'carol', email: 'carol@x.com', role: 'Manager' })
    );
  });

  it('omits id when submitting in create mode', () => {
    const onSubmit = vi.fn();
    render(<AdminUserModal isOpen user={null} onClose={noop} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('System login handle'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Email routing identity'), { target: { value: 'new@x.com' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create User' }).closest('form'));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).not.toHaveProperty('id');
    expect(payload).toMatchObject({ username: 'newuser', email: 'new@x.com', role: 'Employee' });
  });
});

// ── isOpen gate ────────────────────────────────────────────────────────────────

describe('visibility control', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AdminUserModal isOpen={false} user={null} onClose={noop} onSubmit={noop} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when the Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<AdminUserModal isOpen user={null} onClose={onClose} onSubmit={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ── submitting state ───────────────────────────────────────────────────────────

describe.each([
  { submitting: true,  expectDisabled: true  },
  { submitting: false, expectDisabled: false },
])('submit button when submitting=$submitting', ({ submitting, expectDisabled }) => {
  it('reflects the disabled state correctly', () => {
    const { container } = render(
      <AdminUserModal isOpen user={null} onClose={noop} onSubmit={noop} submitting={submitting} />
    );
    const submitBtn = container.querySelector('button[type="submit"]');
    if (expectDisabled) {
      expect(submitBtn).toBeDisabled();
    } else {
      expect(submitBtn).not.toBeDisabled();
    }
  });
});
