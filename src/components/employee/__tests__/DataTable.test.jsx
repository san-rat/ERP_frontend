import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import DataTable from '../DataTable';

const columns = [
  { title: 'SKU',  key: 'sku' },
  { title: 'Name', key: 'name' },
  { title: 'Qty',  key: 'qty' },
];

const rows = [
  { sku: 'SKU-001', name: 'Widget Alpha', qty: 80 },
  { sku: 'SKU-002', name: 'Gadget Beta',  qty: 3  },
  { sku: 'SKU-003', name: 'Tool Gamma',   qty: 50 },
];

// ── describe.each: run the same suite of assertions for every column header ──
// Each describe block receives one column definition and verifies it renders
// correctly regardless of which column is being tested.

describe.each(columns)('column "$title"', ({ title, key }) => {
  it('renders the column header in the table head', () => {
    render(<DataTable columns={columns} data={[]} loading={false} />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('renders the correct cell value from each data row', () => {
    render(<DataTable columns={columns} data={rows} loading={false} />);
    rows.forEach(row => {
      expect(screen.getByText(String(row[key]))).toBeInTheDocument();
    });
  });
});

// ── describe.each: test every data-state the table can be in ─────────────────

describe.each([
  {
    label:    'loading state',
    loading:  true,
    data:     [],
    expected: 'pulse skeletons are rendered instead of real rows',
  },
  {
    label:    'empty state',
    loading:  false,
    data:     [],
    expected: 'empty-state message is shown',
  },
  {
    label:    'populated state',
    loading:  false,
    data:     rows,
    expected: 'all data rows are rendered',
  },
])('$label', ({ loading, data }) => {
  it('renders column headers regardless of data state', () => {
    render(<DataTable columns={columns} data={data} loading={loading} />);
    columns.forEach(col => {
      expect(screen.getByText(col.title)).toBeInTheDocument();
    });
  });

  it('does not show data row content while loading', () => {
    if (!loading) return; // only relevant in loading state
    render(<DataTable columns={columns} data={data} loading={loading} />);
    rows.forEach(row => {
      expect(screen.queryByText(row.name)).not.toBeInTheDocument();
    });
  });

  it('shows the empty message when data is empty and not loading', () => {
    if (loading || data.length > 0) return;
    render(
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No records found."
      />
    );
    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });

  it('renders a row for every data item when populated', () => {
    if (loading || data.length === 0) return;
    render(<DataTable columns={columns} data={data} loading={loading} />);
    data.forEach(row => {
      expect(screen.getByText(row.name)).toBeInTheDocument();
    });
  });
});

// ── Template literal it.each: custom cell renderers ──────────────────────────
// Verifies that col.render() overrides are applied correctly for each column.

describe('custom cell renderers', () => {
  it.each`
    colTitle   | renderFn                              | rowData                           | expected
    ${'Badge'} | ${r => <span>{r.status}</span>}       | ${{ status: 'ACTIVE' }}           | ${'ACTIVE'}
    ${'Price'} | ${r => <span>${r.price.toFixed(2)}</span>} | ${{ price: 9.9 }}            | ${'$9.90'}
    ${'Label'} | ${r => <strong>{r.label}</strong>}    | ${{ label: 'Urgent' }}            | ${'Urgent'}
  `('renders $colTitle via render() correctly', ({ colTitle, renderFn, rowData, expected }) => {
    const col = { title: colTitle, key: 'x', render: renderFn };
    render(<DataTable columns={[col]} data={[rowData]} loading={false} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});

// ── Row click callback ────────────────────────────────────────────────────────

describe('row click behaviour', () => {
  it.each(rows)('clicking row "$name" calls onRowClick with the correct row object', row => {
    const handler = vi.fn();
    render(
      <DataTable columns={columns} data={rows} loading={false} onRowClick={handler} />
    );
    fireEvent.click(screen.getByText(row.name));
    expect(handler).toHaveBeenCalledWith(row);
  });
});
