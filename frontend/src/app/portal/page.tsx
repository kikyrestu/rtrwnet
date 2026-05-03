'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Lock, Loader2, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PortalLoginPage() {
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ customer_id: customerId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      // Simpan session (dummy)
      localStorage.setItem('portal_token', data.token);
      localStorage.setItem('portal_customer', JSON.stringify(data.customer));

      router.push('/portal/dashboard');
    } catch (err: any) {
      Swal.fire({ title: 'Gagal Login', text: err.message, icon: 'error', background: '#0f172a', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-blue-500/20">
            <UserCircle size={40} className="text-blue-400" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Portal Pelanggan</h1>
            <p className="text-gray-400 text-sm">Masuk untuk mengelola tagihan dan jaringan Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">ID Pelanggan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                  placeholder="Contoh: CUST-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>Masuk <ArrowRight size={18} /></>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-500">PAKAAM RT-RW Net &copy; 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
