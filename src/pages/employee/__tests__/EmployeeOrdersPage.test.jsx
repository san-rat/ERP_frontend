import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeOrdersPage from '../EmployeeOrdersPage';
import { ordersClient } from '../../../api/ordersClient';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MOCK
// ordersClient makes real HTTP calls. We replace it entirely with vi.fn() stubs
// so tests are fast, offline, and return exactly what we tell them to.
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../../../api/ordersClient');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const makeOrder = (overrides = {}) => ({
  id: 1,
  externalOrderId: 'ORD-001',
  customerId: 'CUST-A',
  status: 'PENDING',
  totalAmount: 150.00,
  createdAt: new Date('2024-01-15').toISOString(),
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <EmployeeOrdersPage />
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('EmployeeOrdersPage', () => {
  // FIXTURE: reset mocks and set a safe default before each test
  beforeEach(() => {
    vi.clearAllMocks();
    ordersClient.getAll.mockResolvedValue([makeOrder()]);
    ordersClient.updateStatus.mockResolvedValue({});
  });

  // FIXTURE: restore any spies (e.g. window.alert) after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Page Chrome ─────────────────────────────────────────────────────────────

  it('renders the Order Management heading', async () => {
    renderPage();
    expect(screen.getByText('Order Management')).toBeInTheDocument();
  });

  it('renders the search input', async () => {
    renderPage();
    expect(
      screen.getByPlaceholderText(/Search by Order ID or Customer ID/i)
    ).toBeInTheDocument();
  });

  it('renders the status filter dropdown', async () => {
    renderPage();
    expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument();
  });

  it('renders the Refresh button', async () => {
    renderPage();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  // ── Data Fetching ───────────────────────────────────────────────────────────

  it('calls ordersClient.getAll on mount', async () => {
    renderPage();
    await waitFor(() => expect(ordersClient.getAll).toHaveBeenCalledTimes(1));
  });

  it('displays order IDs returned by the API', async () => {
    ordersClient.getAll.mockResolvedValue([
      makeOrder({ externalOrderId: 'ORD-TEST-1' }),
      makeOrder({ id: 2, externalOrderId: 'ORD-TEST-2' }),
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ORD-TEST-1')).toBeInTheDocument();
      expect(screen.getByText('ORD-TEST-2')).toBeInTheDocument();
    });
  });

  it('shows an error message when getAll fails', async () => {
    ordersClient.getAll.mockRejectedValue(new Error('Network failure'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Network failure')).toBeInTheDocument();
    });
  });

  it('calls getAll again when the Refresh button is clicked', async () => {
    renderPage();
    await waitFor(() => expect(ordersClient.getAll).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => expect(ordersClient.getAll).toHaveBeenCalledTimes(2));
  });

  // ── Interaction Limits (existing tests — kept and expanded) ─────────────────

  it('disables Confirm Cancel until a reason is typed', async () => {
    ordersClient.getAll.mockResolvedValue([
      makeOrder({ externalOrderId: 'ORD-TEST', status: 'PENDING' }),
    ]);

    renderPage();
    await waitFor(() => screen.getByText('ORD-TEST'));
    fireEvent.click(screen.getByText('ORD-TEST'));

    fireEvent.click(screen.getByText('Cancel Order...'));

    const confirmBtn = screen.getByText('Confirm Cancel');
    expect(confirmBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/e.g. Out of stock/i), {
      target: { value: 'Customer request' },
    });
    expect(confirmBtn).not.toBeDisabled();
  });

  it('hides invalid transitions for shipped items', async () => {
    ordersClient.getAll.mockResolvedValue([
      makeOrder({ externalOrderId: 'ORD-SHIPPED', status: 'SHIPPED' }),
    ]);

    renderPage();
    await waitFor(() => screen.getByText('ORD-SHIPPED'));
    fireEvent.click(screen.getByText('ORD-SHIPPED'));

    expect(screen.getByText('Mark Delivered')).toBeInTheDocument();
    expect(screen.queryByText('Cancel Order...')).not.toBeInTheDocument();
    expect(screen.queryByText('Start Processing')).not.toBeInTheDocument();
  });

  // ── Order Detail Drawer ─────────────────────────────────────────────────────

  it('opens the Order Details drawer when a row is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('ORD-001'));

    expect(screen.getByText('Order Details')).toBeInTheDocument();
  });

  it('closes the drawer when the X button is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('ORD-001'));

    expect(screen.getByText('Order Details')).toBeInTheDocument();

    // The close button contains an X icon — find button near 'Order Details'
    const closeBtn = screen.getByText('Order Details')
      .closest('div')
      .querySelector('button');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Order Details')).not.toBeInTheDocument();
  });

  it('shows "No further actions" for a terminal DELIVERED order', async () => {
    ordersClient.getAll.mockResolvedValue([
      makeOrder({ externalOrderId: 'ORD-DEL', status: 'DELIVERED' }),
    ]);

    renderPage();
    await waitFor(() => screen.getByText('ORD-DEL'));
    fireEvent.click(screen.getByText('ORD-DEL'));

    expect(
      screen.getByText('No further actions available for this order.')
    ).toBeInTheDocument();
  });

  it('shows cancellation reason for a CANCELLED order that has one', async () => {
    ordersClient.getAll.mockResolvedValue([
      makeOrder({
        externalOrderId: 'ORD-CXL',
        status: 'CANCELLED',
        cancellationReason: 'Out of stock',
      }),
    ]);

    renderPage();
    await waitFor(() => screen.getByText('ORD-CXL'));
    fireEvent.click(screen.getByText('ORD-CXL'));

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByText(/Cancellation Reason/i)).toBeInTheDocument();
  });

  // ── Status Transitions ──────────────────────────────────────────────────────

  it('shows "Start Processing" action for a PENDING order', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('ORD-001'));

    expect(screen.getByText('Start Processing')).toBeInTheDocument();
  });

  it('calls updateStatus with PROCESSING when Start Processing is clicked', async () => {
    ordersClient.updateStatus.mockResolvedValue({ id: 1, status: 'PROCESSING' });

    renderPage();
    await waitFor(() => screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('ORD-001'));

    fireEvent.click(screen.getByText('Start Processing'));

    await waitFor(() => {
      expect(ordersClient.updateStatus).toHaveBeenCalledWith(
        1,
        { status: 'PROCESSING' }
      );
    });
  });

  it('calls updateStatus with DELIVERED when Mark Delivered is clicked', async () => {
    ordersClient.getAll.mockResolvedValue([
      makeOrder({ externalOrderId: 'ORD-S', status: 'SHIPPED' }),
    ]);
    ordersClient.updateStatus.mockResolvedValue({ id: 1, status: 'DELIVERED' });

    renderPage();
    await waitFor(() => screen.getByText('ORD-S'));
    fireEvent.click(screen.getByText('ORD-S'));
    fireEvent.click(screen.getByText('Mark Delivered'));

    await waitFor(() => {
      expect(ordersClient.updateStatus).toHaveBeenCalledWith(
        1,
        { status: 'DELIVERED' }
      );
    });
  });

  it('calls updateStatus with CANCELLED and reason on Confirm Cancel', async () => {
    ordersClient.updateStatus.mockResolvedValue({ id: 1, status: 'CANCELLED' });

    renderPage();
    await waitFor(() => screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('Cancel Order...'));

    fireEvent.change(screen.getByPlaceholderText(/e.g. Out of stock/i), {
      target: { value: 'Duplicate order' },
    });
    fireEvent.click(screen.getByText('Confirm Cancel'));

    await waitFor(() => {
      expect(ordersClient.updateStatus).toHaveBeenCalledWith(1, {
        status: 'CANCELLED',
        cancellationReason: 'Duplicate order',
      });
    });
  });

  it('shows an alert when updateStatus fails', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    ordersClient.updateStatus.mockRejectedValue(new Error('Update failed'));

    renderPage();
    await waitFor(() => screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('Start Processing'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Update failed')
      );
    });
  });

  // ── Cancellation Modal ──────────────────────────────────────────────────────

  it('"Go Back" on the cancel modal closes it without calling updateStatus', async () => {
    renderPage();
    await waitFor(() => screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('ORD-001'));
    fireEvent.click(screen.getByText('Cancel Order...'));

    expect(screen.getByText('Cancel Order')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Go Back'));

    expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
    expect(ordersClient.updateStatus).not.toHaveBeenCalled();
  });

  // ── PROCESSING order actions ────────────────────────────────────────────────

  it('shows "Mark Shipped" and "Cancel Order" for a PROCESSING order', async () => {
    ordersClient.getAll.mockResolvedValue([
      makeOrder({ externalOrderId: 'ORD-P', status: 'PROCESSING' }),
    ]);

    renderPage();
    await waitFor(() => screen.getByText('ORD-P'));
    fireEvent.click(screen.getByText('ORD-P'));

    expect(screen.getByText('Mark Shipped')).toBeInTheDocument();
    expect(screen.getByText('Cancel Order...')).toBeInTheDocument();
  });
});
