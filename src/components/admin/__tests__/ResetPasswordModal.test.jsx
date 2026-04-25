import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordModal from '../ResetPasswordModal';

const noop = vi.fn();

// ── describe.each: confirmation-view identity text ────────────────────────────
// The modal derives the required confirmation string from user.username,
// falling back to the email prefix, then the literal "confirm".

describe.each([
  { label: 'full username',        user: { username: 'alice',    email: 'alice@x.com'  }, expectedText: 'alice'   },
  { label: 'email prefix fallback', user: { username: undefined,  email: 'bob@corp.io'  }, expectedText: 'bob'     },
  { label: 'empty username',        user: { username: '',         email: 'carol@x.com'  }, expectedText: 'carol'   },
  { label: '"confirm" fallback',    user: { username: undefined,  email: undefined      }, expectedText: 'confirm' },
])('confirmation prompt for $label', ({ user, expectedText }) => {
  it('shows the expected confirmation token in the label', () => {
    render(
      <ResetPasswordModal isOpen user={user} onClose={noop} onConfirm={noop} />
    );
    // The label renders the token twice (once in <strong> and once as placeholder label text)
    const labels = screen.getAllByText(expectedText);
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('keeps Confirm Reset disabled until the token is typed exactly', async () => {
    render(
      <ResetPasswordModal isOpen user={user} onClose={noop} onConfirm={noop} />
    );
    const confirmBtn = screen.getByRole('button', { name: 'Confirm Reset' });
    expect(confirmBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Confirmation required...'), {
      target: { value: expectedText },
    });
    await waitFor(() => expect(confirmBtn).not.toBeDisabled());
  });

  it('re-disables Confirm Reset when input does not match exactly', async () => {
    render(
      <ResetPasswordModal isOpen user={user} onClose={noop} onConfirm={noop} />
    );
    const input = screen.getByPlaceholderText('Confirmation required...');
    const confirmBtn = screen.getByRole('button', { name: 'Confirm Reset' });

    fireEvent.change(input, { target: { value: expectedText + '!' } });
    await waitFor(() => expect(confirmBtn).toBeDisabled());
  });
});

// ── describe.each: two distinct modal views ───────────────────────────────────
// The component renders a completely different view when generatedPassword is set.

describe.each([
  {
    viewLabel:         'confirmation view (no generated password)',
    generatedPassword: undefined,
    expectedHeading:   'Reset User Password',
    expectsInput:      true,
  },
  {
    viewLabel:         'success view (password generated)',
    generatedPassword: 'Temp@1234',
    expectedHeading:   'Password Reset Complete',
    expectsInput:      false,
  },
])('$viewLabel', ({ generatedPassword, expectedHeading, expectsInput }) => {
  const user = { username: 'dave', email: 'dave@x.com' };

  it('renders the correct heading', () => {
    render(
      <ResetPasswordModal
        isOpen
        user={user}
        onClose={noop}
        onConfirm={noop}
        generatedPassword={generatedPassword}
      />
    );
    expect(screen.getByText(expectedHeading)).toBeInTheDocument();
  });

  it(`${expectsInput ? 'shows' : 'hides'} the confirmation input`, () => {
    render(
      <ResetPasswordModal
        isOpen
        user={user}
        onClose={noop}
        onConfirm={noop}
        generatedPassword={generatedPassword}
      />
    );
    const input = screen.queryByPlaceholderText('Confirmation required...');
    if (expectsInput) {
      expect(input).toBeInTheDocument();
    } else {
      expect(input).not.toBeInTheDocument();
    }
  });
});

// ── it.each: generated password is displayed in the success view ──────────────

describe('success view — generated password display', () => {
  it.each([
    { password: 'Temp@1234' },
    { password: 'Xk9!mQpR'  },
    { password: 'Reset#2025' },
  ])('displays the generated password "$password" in the success panel', ({ password }) => {
    render(
      <ResetPasswordModal
        isOpen
        user={{ username: 'u', email: 'u@x.com' }}
        onClose={noop}
        onConfirm={noop}
        generatedPassword={password}
      />
    );
    expect(screen.getByText(password)).toBeInTheDocument();
  });
});

// ── Visibility control ────────────────────────────────────────────────────────

describe('visibility control', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ResetPasswordModal isOpen={false} user={{ username: 'u', email: 'u@x.com' }} onClose={noop} onConfirm={noop} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(
      <ResetPasswordModal isOpen user={{ username: 'u', email: 'u@x.com' }} onClose={onClose} onConfirm={noop} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ── onConfirm callback ────────────────────────────────────────────────────────

describe('onConfirm callback', () => {
  it('fires onConfirm when the token matches and Confirm Reset is clicked', () => {
    const onConfirm = vi.fn();
    const user = { username: 'eve', email: 'eve@x.com' };
    render(
      <ResetPasswordModal isOpen user={user} onClose={noop} onConfirm={onConfirm} />
    );
    fireEvent.change(screen.getByPlaceholderText('Confirmation required...'), {
      target: { value: 'eve' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reset' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

// ── isSubmitting state ────────────────────────────────────────────────────────

describe.each([
  { isSubmitting: true,  expectDisabled: true  },
  { isSubmitting: false, expectDisabled: false },
])('Confirm Reset button when isSubmitting=$isSubmitting', ({ isSubmitting, expectDisabled }) => {
  it('reflects the disabled state correctly', () => {
    const user = { username: 'frank', email: 'frank@x.com' };
    const { container } = render(
      <ResetPasswordModal isOpen user={user} onClose={noop} onConfirm={noop} isSubmitting={isSubmitting} />
    );
    // Type the correct token so the only remaining gate is isSubmitting
    if (!isSubmitting) {
      fireEvent.change(screen.getByPlaceholderText('Confirmation required...'), {
        target: { value: 'frank' },
      });
    }
    const confirmBtn = container.querySelector('button.bg-danger');
    if (expectDisabled) {
      expect(confirmBtn).toBeDisabled();
    } else {
      expect(confirmBtn).not.toBeDisabled();
    }
  });
});
