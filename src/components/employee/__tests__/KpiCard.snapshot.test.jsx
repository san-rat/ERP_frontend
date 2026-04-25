import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Package } from 'lucide-react';
import KpiCard from '../KpiCard';

describe('KpiCard — snapshot tests', () => {
  it('renders a basic card with title and value', () => {
    const { container } = render(
      <KpiCard title="Total Orders" value="142" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders an alert state card', () => {
    const { container } = render(
      <KpiCard title="Low Stock Items" value="7" isAlert={true} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a card with an icon', () => {
    const { container } = render(
      <KpiCard title="Products" value="58" icon={Package} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a card with an upward trend', () => {
    const { container } = render(
      <KpiCard title="Revenue" value="$12,400" trend="up" trendValue="+8.3%" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a card with a downward trend', () => {
    const { container } = render(
      <KpiCard title="Returns" value="23" trend="down" trendValue="-4.1%" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a fully loaded card (all props)', () => {
    const { container } = render(
      <KpiCard
        title="Pending Shipments"
        value="19"
        icon={Package}
        trend="up"
        trendValue="+2"
        isAlert={false}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
