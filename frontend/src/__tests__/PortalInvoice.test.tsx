import { render, screen, waitFor } from '@testing-library/react';
import PortalDashboard from '@/app/portal/dashboard/page';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock localStorage and fetch
const mockData = {
  customer: {
    id: 'CUST-001',
    name: 'Test Customer',
    package: 'Test Package'
  },
  current_invoice: {
    id: 123,
    amount: 150000,
    billing_period: 'Mei 2026',
    status: 'unpaid'
  },
  history: [
    {
      id: 122,
      amount: 150000,
      billing_period: 'April 2026',
      paid_at: '2026-04-10T10:00:00Z',
      status: 'paid'
    }
  ]
};

window.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData),
  })
) as jest.Mock;

describe('PortalDashboard Invoices', () => {
  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ id: 'CUST-001' }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders billing card and payment history correctly', async () => {
    render(<PortalDashboard />);

    // Wait for the UI to load data
    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
    });
    
    // Check Current Invoice (Unpaid) and History (Paid) amount
    const amounts = screen.getAllByText('Rp 150.000');
    expect(amounts.length).toBe(2);
    expect(screen.getByText('Belum Dibayar')).toBeInTheDocument();
    
    // Check that Bayar Sekarang button exists
    expect(screen.getByRole('button', { name: /Bayar Sekarang/i })).toBeInTheDocument();

    // Check History (Paid)
    expect(screen.getByText('Pembayaran Tagihan April 2026')).toBeInTheDocument();
    expect(screen.getByText('Berhasil')).toBeInTheDocument();
  });
});
