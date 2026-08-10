'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Zap, ChevronRight, Check } from 'lucide-react';
import Swal from 'sweetalert2';

interface PackageData {
  id: number;
  name: string;
  price: number;
  description: string | null;
  speed_mbps: number | null;
}

export default function PortalPackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const custStr = localStorage.getItem('portal_customer');
    if (!custStr) {
      router.push('/portal');
      return;
    }
    setCustomer(JSON.parse(custStr));

    fetch('/api/portal/packages')
      .then(res => res.json())
      .then(json => {
        setPackages(json.packages || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleUpgrade = (pkg: PackageData) => {
    Swal.fire({
      title: 'Minta Upgrade Paket?',
      html: `Anda akan meminta perubahan paket ke <b>${pkg.name}</b> seharga <b>Rp ${pkg.price.toLocaleString('id-ID')}</b>.<br><br><span style="color:#9ca3af; font-size:14px;">Tim kami akan menghubungi Anda untuk konfirmasi tagihan prabayar/prorata.</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Minta Upgrade',
      cancelButtonText: 'Batal',
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#475569'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Memproses...', allowOutsideClick: false, background: '#0f172a', color: '#fff', didOpen: () => Swal.showLoading() });
        try {
          const res = await fetch('/api/portal/request-upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              customer_id: customer.id,
              package_id: pkg.id
            })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
          
          Swal.fire({
            title: 'Berhasil!',
            text: data.message,
            icon: 'success',
            background: '#0f172a',
            color: '#fff'
          });
        } catch (err: any) {
          Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', background: '#0f172a', color: '#fff' });
        }
      }
    });
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Navbar */}
      <div className="flex items-center justify-between bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/portal/dashboard')} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Katalog Paket</h1>
            <p className="text-xs text-gray-400">Pilih kecepatan yang sesuai kebutuhan Anda</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-900/50 rounded-3xl border border-white/5 animate-pulse" />)}
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center text-gray-500">
          Belum ada paket yang tersedia.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
              {/* Background gradient effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/10 group-hover:to-indigo-600/10 transition-colors duration-500" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                    <Package size={24} />
                  </div>
                  {pkg.speed_mbps && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-bold border border-emerald-500/20">
                      <Zap size={14} className="fill-emerald-400" /> {pkg.speed_mbps} Mbps
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">{pkg.name}</h2>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-gray-500 font-medium">/bulan</span>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 flex-1">
                  {pkg.description || 'Nikmati koneksi internet cepat dan stabil untuk kebutuhan harian Anda tanpa batasan kuota (FUP).'}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-emerald-400" /> Unlimited Tanpa FUP
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-emerald-400" /> Teknisi 24 Jam
                  </div>
                </div>

                <button 
                  onClick={() => handleUpgrade(pkg)}
                  className="w-full py-3.5 bg-white/5 hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-900/20 mt-auto"
                >
                  Minta Upgrade <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
