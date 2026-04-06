import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeOrdersPage from '../EmployeeOrdersPage';
import { ordersClient } from '../../../api/ordersClient';

vi.mock('../../../api/ordersClient');

describe('EmployeeOrdersPage - Interaction Limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables cancel logic locally and requires a reason', async () => {
    ordersClient.getAll.mockResolvedValue([
      { id: 1, externalOrderId: 'ORD-TEST', status: 'PENDING', totalAmount: 100 }
    ]);

    render(
      <MemoryRouter>
        <EmployeeOrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('ORD-TEST'));
    
    // Open order details drawer
    fireEvent.click(screen.getByText('ORD-TEST'));

    // Try to click cancel
    const cancelBtn = screen.getByText('Cancel Order...');
    fireEvent.click(cancelBtn);

    // Modal appears
    const confirmCancelBtn = screen.getByText('Confirm Cancel');
    expect(confirmCancelBtn).toBeDisabled(); // reason required

    const textarea = screen.getByPlaceholderText(/e.g. Out of stock/i);
    fireEvent.change(textarea, { target: { value: 'Customer request' } });

    expect(confirmCancelBtn).not.toBeDisabled();
  });

  it('hides invalid transitions for shipped items', async () => {
    ordersClient.getAll.mockResolvedValue([
      { id: 1, externalOrderId: 'ORD-SHIPPED', status: 'SHIPPED', totalAmount: 100 }
    ]);

    render(
      <MemoryRouter>
        <EmployeeOrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('ORD-SHIPPED'));
    fireEvent.click(screen.getByText('ORD-SHIPPED'));

    // Should only see Mark Delivered
    expect(screen.getByText('Mark Delivered')).toBeInTheDocument();
    expect(screen.queryByText('Cancel Order...')).not.toBeInTheDocument();
    expect(screen.queryByText('Start Processing')).not.toBeInTheDocument();
  });
});
