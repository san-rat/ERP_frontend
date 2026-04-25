import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

// Template literal it.each — the table-tag syntax.
// Each row defines a distinct prop combination; $variable names are used
// directly in the test name string for self-documenting output.

describe('PageHeader — template literal parameterized rendering', () => {
  it.each`
    title                  | subtitle                          | expectsSubtitle
    ${'Dashboard'}         | ${'Welcome back'}                 | ${true}
    ${'Inventory Monitor'} | ${'Real-time stock levels'}       | ${true}
    ${'Product Catalog'}   | ${'Manage your products'}         | ${true}
    ${'Orders'}            | ${undefined}                      | ${false}
    ${'Analytics'}         | ${''}                             | ${false}
  `(
    'renders title "$title" and subtitle visibility=$expectsSubtitle',
    ({ title, subtitle, expectsSubtitle }) => {
      const { container } = render(<PageHeader title={title} subtitle={subtitle} />);

      expect(screen.getByText(title)).toBeInTheDocument();

      const subtitleEl = container.querySelector('p.text-gray-500');
      if (expectsSubtitle) {
        expect(subtitleEl).not.toBeNull();
        expect(subtitleEl.textContent).toBe(subtitle);
      } else {
        expect(subtitleEl).toBeNull();
      }
    }
  );

  it.each`
    title          | childLabel          | expectsChild
    ${'Overview'}  | ${'Add Product'}    | ${true}
    ${'Reports'}   | ${'Export'}         | ${true}
    ${'Settings'}  | ${null}             | ${false}
  `(
    'renders children="$childLabel" when expectsChild=$expectsChild',
    ({ title, childLabel, expectsChild }) => {
      render(
        <PageHeader title={title}>
          {childLabel && <button>{childLabel}</button>}
        </PageHeader>
      );

      expect(screen.getByText(title)).toBeInTheDocument();

      if (expectsChild) {
        expect(screen.getByRole('button', { name: childLabel })).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      }
    }
  );
});

// describe.each: verify heading level and text for different page contexts
describe.each([
  { page: 'Employee Overview', title: 'Overview',         subtitle: 'Your activity at a glance' },
  { page: 'Inventory Page',    title: 'Inventory Monitor', subtitle: 'Real-time stock levels'    },
  { page: 'Orders Page',       title: 'Orders',            subtitle: 'Manage customer orders'    },
])('PageHeader on $page', ({ title, subtitle }) => {
  it('renders an h1 with the correct title text', () => {
    render(<PageHeader title={title} subtitle={subtitle} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(title);
  });

  it('renders the subtitle as a paragraph', () => {
    render(<PageHeader title={title} subtitle={subtitle} />);
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });
});
