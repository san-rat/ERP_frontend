import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../RegisterPage';

// Mock the API so no real network call is made
vi.mock('../../api/client', () => ({
  authApi: { register: vi.fn() },
}));

import { authApi } from '../../api/client';

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helper: fill every required field so only the field under test is blank ───
const fillForm = (overrides = {}) => {
  const defaults = {
    firstName:       'Nimal',
    lastName:        'Perera',
    email:           'nimal@company.com',
    role:            'Employee',
    password:        'Secure1!',
    confirmPassword: 'Secure1!',
  };
  const values = { ...defaults, ...overrides };

  fireEvent.change(screen.getByLabelText(/First name/i),       { target: { value: values.firstName       } });
  fireEvent.change(screen.getByLabelText(/Last name/i),        { target: { value: values.lastName        } });
  fireEvent.change(screen.getByLabelText(/Email address/i),    { target: { value: values.email           } });
  fireEvent.select
    ? null
    : fireEvent.change(screen.getByLabelText(/Role/i),         { target: { value: values.role            } });
  fireEvent.change(screen.getByLabelText(/^Password/i),        { target: { value: values.password        } });
  fireEvent.change(screen.getByLabelText(/Confirm password/i), { target: { value: values.confirmPassword } });
};

// ── describe.each: password strength meter ────────────────────────────────────
// The strength score (0–4) is the count of criteria met:
//   +1 length ≥ 8  |  +1 uppercase  |  +1 digit  |  +1 special char
// The UI renders the label only when password is non-empty.

describe.each([
  { password: 'abcdefgh',   expectedStrength: 1, expectedLabel: 'Weak'   },
  { password: 'Abcdefgh',   expectedStrength: 2, expectedLabel: 'Fair'   },
  { password: 'Abcdefg1',   expectedStrength: 3, expectedLabel: 'Good'   },
  { password: 'Abcdefg1!',  expectedStrength: 4, expectedLabel: 'Strong' },
])('password "$password" has strength $expectedStrength', ({ password, expectedLabel }) => {
  it(`shows the "${ expectedLabel }" strength label`, () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: password } });
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});

// ── it.each: required field validation messages ───────────────────────────────

describe('required field validation', () => {
  it.each([
    { field: 'firstName',       emptyValue: '',  errorText: 'First name is required.'      },
    { field: 'lastName',        emptyValue: '',  errorText: 'Last name is required.'       },
    { field: 'email',           emptyValue: '',  errorText: 'Email is required.'           },
    { field: 'password',        emptyValue: '',  errorText: 'Password is required.'        },
    { field: 'confirmPassword', emptyValue: '',  errorText: 'Please confirm your password.' },
  ])(
    'shows "$errorText" when $field is empty',
    async ({ field, emptyValue, errorText }) => {
      render(<RegisterPage />);
      fillForm({ [field]: emptyValue });
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
      await waitFor(() => {
        expect(screen.getByText(errorText)).toBeInTheDocument();
      });
    }
  );
});

// ── it.each: password rule validation messages ────────────────────────────────

describe('password rule validation', () => {
  it.each([
    { password: 'short1A',   errorText: 'Minimum 8 characters.'                 },
    { password: 'alllower1', errorText: 'Include at least one uppercase letter.' },
    { password: 'NoDigitsA', errorText: 'Include at least one number.'           },
  ])(
    'shows "$errorText" for password "$password"',
    async ({ password, errorText }) => {
      render(<RegisterPage />);
      fillForm({ password, confirmPassword: password });
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
      await waitFor(() => {
        expect(screen.getByText(errorText)).toBeInTheDocument();
      });
    }
  );
});

// ── it.each: email format validation ─────────────────────────────────────────

describe('email format validation', () => {
  it.each([
    { email: 'notanemail'    },
    { email: 'missing@tld'  },
    { email: '@nodomain.com' },
  ])(
    'shows "Enter a valid email." for "$email"',
    async ({ email }) => {
      render(<RegisterPage />);
      fillForm({ email });
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
      await waitFor(() => {
        expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();
      });
    }
  );
});

// ── describe.each: password mismatch ─────────────────────────────────────────

describe('password confirmation mismatch', () => {
  it.each([
    { password: 'Secure1!', confirmPassword: 'Secure2!' },
    { password: 'Secure1!', confirmPassword: 'secure1!' },
    { password: 'Secure1!', confirmPassword: 'Secure1'  },
  ])(
    'shows mismatch error when confirm="$confirmPassword"',
    async ({ password, confirmPassword }) => {
      render(<RegisterPage />);
      fillForm({ password, confirmPassword });
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });
    }
  );
});

// ── Success screen ────────────────────────────────────────────────────────────

describe('successful registration', () => {
  it('shows the Account Created screen after a successful API call', async () => {
    authApi.register.mockResolvedValue({ token: 'abc' });
    render(<RegisterPage />);
    fillForm({});
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'Employee' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByText('Account Created!')).toBeInTheDocument();
  });
});

// ── API error ────────────────────────────────────────────────────────────────

describe('API error handling', () => {
  it('displays the error message when registration fails', async () => {
    authApi.register.mockRejectedValue(new Error('Email already in use'));
    render(<RegisterPage />);
    fillForm({});
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'Employee' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });
});
