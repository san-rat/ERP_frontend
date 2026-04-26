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

  it('handles unmount before fetch completes gracefully', () => {
    let resolveOrders;
    ordersClient.getAll.mockImplementation(() => new Promise(resolve => { resolveOrders = resolve; }));
    productsClient.getStock.mockResolvedValue([]);

    const { unmount } = render(
      <MemoryRouter>
        <EmployeeOverviewPage />
      </MemoryRouter>
    );

    unmount(); // Unmount component before promise resolves
    resolveOrders([]); // Resolving should not throw or update state on unmounted component
  });

  it('navigates to orders page with search query when a recent order is clicked', async () => {
    ordersClient.getAll.mockResolvedValue([
      { id: 1, externalOrderId: 'ORD-123', status: 'PENDING', totalAmount: 100 }
    ]);
    productsClient.getStock.mockResolvedValue([]);

    const { MemoryRouter, Routes, Route, useLocation } = require('react-router-dom');
    const LocationDisplay = () => {
      const location = useLocation();
      return <div data-testid="location-display">{location.pathname}{location.search}</div>;
    };

    render(
      <MemoryRouter initialEntries={['/employee']}>
        <Routes>
          <Route path="/employee" element={<EmployeeOverviewPage />} />
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ORD-123')).toBeInTheDocument();
    });

    const { fireEvent } = require('@testing-library/react');
    
    // The row text is ORD-123, clicking it triggers onRowClick
    fireEvent.click(screen.getByText('ORD-123'));
    
    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/employee/orders?q=ORD-123');
    });
  });
});

