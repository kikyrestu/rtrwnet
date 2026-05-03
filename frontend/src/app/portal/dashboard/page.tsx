'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, UserCircle, Wifi, Receipt, AlertCircle, 
  CheckCircle2, Clock, CreditCard, ChevronRight, Key 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function PortalDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const custStr = localStorage.getItem('portal_customer');
    if (!custStr) {
      router.push('/portal');
      return;
    }

    const customer = JSON.parse(custStr);
    
    fetch(`http://127.0.0.1:8000/api/portal/dashboard?customer_id=${customer.id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_customer');
    router.push('/portal');
  };

  const handlePay = () => {
    Swal.fire({
      title: 'Bayar Tagihan',
      text: 'Fitur integrasi QRIS Tripay / Midtrans akan diproses di sini.',
      icon: 'info',
      background: '#0f172a',
      color: '#fff'
    });
  };

  const handleAcsWifi = async () => {
    const customer = JSON.parse(localStorage.getItem('portal_customer') || '{}');
    // Extract raw ID from format 'CUST-001'
    const rawId = parseInt(customer.id.replace('CUST-', ''), 10);

    const { value: formValues } = await Swal.fire({
      title: 'Ganti WiFi & Password',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nama WiFi (SSID)">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Password Baru" type="password">',
      focusConfirm: false,
      showCancelButton: true,
      background: '#0f172a',
      color: '#fff',
      preConfirm: () => {
        const ssid = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const pass = (document.getElementById('swal-input2') as HTMLInputElement).value;
        if (!ssid || pass.length < 8) {
          Swal.showValidationMessage('SSID wajib diisi dan Password minimal 8 karakter');
          return false;
        }
        return { ssid, password: pass };
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'Memproses Provisioning...', allowOutsideClick: false, background: '#0f172a', color: '#fff', didOpen: () => Swal.showLoading() });
        
        const res = await fetch(`http://127.0.0.1:8000/api/acs/device/${rawId}/wifi`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(formValues)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengubah WiFi');

        Swal.fire({ title: 'Berhasil', text: data.message, icon: 'success', background: '#0f172a', color: '#fff' });
      } catch (err: any) {
        Swal.fire({ text: err.message || 'Gagal mengubah WiFi', icon: 'error', background: '#0f172a', color: '#fff' });
      }
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Memuat dasbor Anda...</p>
        </div>
      </div>
    );
  }

  const { customer, current_invoice, history } = data;

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Navbar */}
      <div className="flex items-center justify-between bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-bold">{customer.name}</h2>
            <p className="text-xs text-gray-400">{customer.id}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <h3 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
            <Wifi size={16} /> Status Internet
          </h3>
          
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-3xl font-bold text-white mb-1">Aktif</p>
              <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Terhubung ke jaringan
              </p>
            </div>
            <button onClick={handleAcsWifi} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold border border-indigo-500/30 transition-all">
              <Key size={16} /> Ganti WiFi
            </button>
          </div>
          
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-xs text-gray-400 mb-1">Paket Berlangganan</p>
            <p className="text-white font-medium">{customer.package}</p>
          </div>
        </div>

        {/* Billing Card */}
        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-blue-500/20 p-6 rounded-3xl">
          <h3 className="text-blue-300 text-sm font-medium mb-4 flex items-center gap-2">
            <Receipt size={16} /> Tagihan Bulan Ini
          </h3>

          {current_invoice ? (
            <>
              <div className="mb-6">
                <p className="text-4xl font-bold text-white mb-2">
                  Rp {current_invoice.amount.toLocaleString('id-ID')}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/20 font-medium">Belum Dibayar</span>
                  <span className="text-gray-400">Jatuh tempo: 10 {current_invoice.billing_period.split(' ')[0]}</span>
                </div>
              </div>
              <button onClick={handlePay} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                <CreditCard size={18} /> Bayar Sekarang
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-32 space-y-3">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-white font-medium">Tidak Ada Tagihan Aktif</p>
                <p className="text-sm text-gray-400">Semua tagihan Anda sudah lunas.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Riwayat Pembayaran Terakhir
          </h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
            Lihat Semua <ChevronRight size={16} />
          </button>
        </div>
        
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada riwayat pembayaran.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map((inv: any) => (
              <div key={inv.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm md:text-base">Pembayaran Tagihan {inv.billing_period}</p>
                    <p className="text-xs text-gray-500">INV-{inv.id.toString().padStart(6, '0')} &bull; {new Date(inv.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm md:text-base">Rp {inv.amount.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Berhasil</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
