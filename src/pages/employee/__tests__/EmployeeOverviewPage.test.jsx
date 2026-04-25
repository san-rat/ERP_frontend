import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeOverviewPage from '../EmployeeOverviewPage';
import { ordersClient } from '../../../api/ordersClient';
import { productsClient } from '../../../api/productsClient';

vi.mock('../../../api/ordersClient');
vi.mock('../../../api/productsClient');

describe('EmployeeOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays orders and low stock content', async () => {
    ordersClient.getAll.mockResolvedValue([
      { id: 1, externalOrderId: 'ORD1', status: 'PENDING', totalAmount: 100 },
      { id: 2, externalOrderId: 'ORD2', status: 'SHIPPED', totalAmount: 200 }
    ]);
    
    productsClient.getStock.mockResolvedValue([
      { id: 1, sku: 'SKU1', productName: 'Prod1', isLowStock: true, quantityAvailable: 2, lowStockThreshold: 10 },
      { id: 2, sku: 'SKU2', productName: 'Prod2', isLowStock: false, quantityAvailable: 20, lowStockThreshold: 5 }
    ]);

    render(
      <MemoryRouter>
        <EmployeeOverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    
    await waitFor(() => {
      // Check KPI values
      expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // PENDING count
      expect(screen.getByText('ORD1')).toBeInTheDocument(); // recent orders table
      expect(screen.getByText('SKU1')).toBeInTheDocument(); // low stock table
    });
  });

  it('shows empty state when API calls fail', async () => {
    ordersClient.getAll.mockRejectedValue(new Error('Network Error'));
    productsClient.getStock.mockRejectedValue(new Error('Network Error'));

    render(
      <MemoryRouter>
        <EmployeeOverviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('No recent orders found.')).toBeInTheDocument();
    });
  });
});
