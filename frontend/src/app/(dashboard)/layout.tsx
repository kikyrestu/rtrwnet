'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) {
        router.replace('/login');
        return;
      }
      
      const user = JSON.parse(stored);
      const role = user.role || 'admin';
      
      // Client-side Role Guard
      const adminOnlyPaths = ['/settings', '/whatsapp', '/auto-suspend', '/payment-gateway', '/client-portal'];
      if (adminOnlyPaths.some(p => pathname.startsWith(p)) && role !== 'admin') {
        router.replace('/dashboard');
        return;
      }
      
      if (pathname.startsWith('/network') && !['admin', 'technician'].includes(role)) {
        router.replace('/dashboard');
        return;
      }
      
      if (pathname.startsWith('/inventory') && !['admin', 'technician'].includes(role)) {
        router.replace('/dashboard');
        return;
      }
      
      if (pathname.startsWith('/billing') && !['admin', 'collector'].includes(role)) {
        router.replace('/dashboard');
        return;
      }

      if (pathname.startsWith('/customers') && !['admin', 'technician', 'sales'].includes(role)) {
        router.replace('/dashboard');
        return;
      }

      setAuthed(true);
    } catch (e) {
      router.replace('/login');
    }
  }, [router, pathname]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}