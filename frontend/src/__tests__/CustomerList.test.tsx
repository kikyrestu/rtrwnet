import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomersPage from '../app/(dashboard)/customers/page';
import { api } from '@/lib/api';

// Mock the dependencies
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('next/dynamic', () => () => {
    return function MockDynamicComponent() {
        return <div data-testid="mock-map">Mock Map</div>;
    };
});

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    delete: jest.fn()
  },
  formatRupiah: (val: number) => `Rp ${val}`
}));

describe('CustomersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCustomers = [
    {
      id: 1,
      name: 'Budi Santoso',
      phone: '08123456789',
      status: 'active',
      mikrotik_username: 'budi123',
      package: { name: 'Premium', price: 200000 },
      router: { name: 'Router Core' }
    }
  ];

  it('renders loading state initially', async () => {
    (api.get as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<CustomersPage />);
    expect(screen.getByRole('status') || screen.getByText(/Memuat|Loading/i)).toBeInTheDocument();
  });

  it('fetches and displays customers', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockCustomers });
    
    render(<CustomersPage />);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    expect(screen.getByText('budi123')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Rp 200000')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockCustomers });
    
    render(<CustomersPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/customers?status=all&search=');
    });
  });
});
