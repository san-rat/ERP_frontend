import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

// Parameterized testing: verifies every status maps to the correct CSS classes and display text
describe('StatusBadge — parameterized status mapping', () => {
  const statusCases = [
    ['completed',  'bg-emerald-100 text-emerald-800 border-emerald-200'],
    ['success',    'bg-emerald-100 text-emerald-800 border-emerald-200'],
    ['active',     'bg-emerald-100 text-emerald-800 border-emerald-200'],
    ['pending',    'bg-amber-100 text-amber-800 border-amber-200'],
    ['warning',    'bg-amber-100 text-amber-800 border-amber-200'],
    ['error',      'bg-rose-100 text-rose-800 border-rose-200'],
    ['cancelled',  'bg-rose-100 text-rose-800 border-rose-200'],
    ['info',       'bg-blue-100 text-blue-800 border-blue-200'],
    ['processing', 'bg-blue-100 text-blue-800 border-blue-200'],
    ['shipped',    'bg-indigo-100 text-indigo-800 border-indigo-200'],
    ['inactive',   'bg-gray-100 text-gray-800 border-gray-200'],
  ];

  it.each(statusCases)(
    'status "%s" renders with class "%s"',
    (status, expectedClasses) => {
      const { container } = render(<StatusBadge status={status} />);
      const span = container.firstChild;

      expectedClasses.split(' ').forEach((cls) => {
        expect(span.className).toContain(cls);
      });
    }
  );

  it.each(statusCases)(
    'status "%s" displays the status text when no label is provided',
    (status) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    }
  );
});

describe('StatusBadge — label override behaviour', () => {
  const labelOverrideCases = [
    ['PENDING',    'Awaiting Approval'],
    ['SHIPPED',    'On Its Way'],
    ['CANCELLED',  'Rejected by Warehouse'],
    ['COMPLETED',  'Done'],
  ];

  it.each(labelOverrideCases)(
    'status "%s" displays custom label "%s" instead of raw status',
    (status, label) => {
      render(<StatusBadge status={status} label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.queryByText(status)).not.toBeInTheDocument();
    }
  );
});

describe('StatusBadge — unknown status fallback', () => {
  it.each([
    ['UNKNOWN_XYZ'],
    ['gibberish'],
    [''],
  ])(
    'status "%s" falls back to the info colour scheme',
    (status) => {
      const { container } = render(<StatusBadge status={status} />);
      const span = container.firstChild;
      expect(span.className).toContain('bg-blue-100');
      expect(span.className).toContain('text-blue-800');
    }
  );
});
