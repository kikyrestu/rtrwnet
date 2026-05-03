import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portal Pelanggan - PAKAAM RT/RW Net',
  description: 'Sistem self-service pelanggan internet',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen relative`}>
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[20%] rounded-full bg-cyan-600/10 blur-[100px]" />
        </div>
        
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
