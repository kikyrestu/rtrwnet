import { render, screen, fireEvent } from '@testing-library/react';
import PortalLogin from '@/app/portal/page';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('PortalLogin', () => {
  it('renders login form correctly', () => {
    render(<PortalLogin />);
    
    // Pastikan elemen penting muncul
    expect(screen.getByPlaceholderText('Contoh: CUST-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk/i })).toBeInTheDocument();
  });

  it('shows error if ID Pelanggan or Password is empty', () => {
    render(<PortalLogin />);
    const loginButton = screen.getByRole('button', { name: /Masuk/i });

    // Coba klik tombol login tanpa mengisi
    fireEvent.click(loginButton);
    
    const idInput = screen.getByPlaceholderText('Contoh: CUST-001') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;

    fireEvent.change(idInput, { target: { value: 'CUST-001' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });

    expect(idInput.value).toBe('CUST-001');
    expect(passwordInput.value).toBe('pass');
  });
});
