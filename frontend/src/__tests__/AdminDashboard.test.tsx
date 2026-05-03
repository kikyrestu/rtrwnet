import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/app/(dashboard)/dashboard/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock SweetAlert2
jest.mock('@/lib/swal', () => ({
  __esModule: true,
  default: { fire: jest.fn().mockResolvedValue({ isConfirmed: false }), showLoading: jest.fn() },
}));

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: () => <div data-testid="area-chart">AreaChart</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

// Mock the api module — data is defined INSIDE the factory to avoid hoisting issues
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({
      total_customers: 150,
      monthly_revenue: 15000000,
      total_tunggakan: 2500000,
      paket_terlaris: '10 Mbps',
      revenue_chart: [
        { name: 'Jan', amount: 10000000 },
        { name: 'Feb', amount: 12000000 },
      ],
      notifications: [
        { type: 'alert', msg: 'Router Offline', time: '5 menit lalu' },
      ],
      recent_transactions: [
        { id: 1, name: 'Budi Santoso', package: '10 Mbps', status: 'Paid', date: '01 Mei 2026', amount: 'Rp 150.000' },
        { id: 2, name: 'Siti Rahmah', package: '20 Mbps', status: 'Unpaid', date: '01 Mei 2026', amount: 'Rp 250.000' },
      ],
    }),
    post: jest.fn().mockResolvedValue({}),
  },
  formatRupiah: (amount: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(amount),
}));

describe('AdminDashboard UI', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders key metrics (Revenue, Total Customers, Tunggakan)', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Rp 15.000.000')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Rp 2.500.000')).toBeInTheDocument();
      // '10 Mbps' appears in stat card AND transaction table
      expect(screen.getAllByText('10 Mbps').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders recent transactions table', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Siti Rahmah')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('Unpaid')).toBeInTheDocument();
    });
  });

  it('renders chart container without crashing', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});
