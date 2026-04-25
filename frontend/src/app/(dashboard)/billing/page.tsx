'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api, formatRupiah } from '@/lib/api';
import { Receipt, Search, Filter, CheckCircle2, Clock, Zap, AlertCircle } from 'lucide-react';

interface Invoice {
  id: number;
  customer_id: number;
  amount: number;
  billing_period: string;
  due_date: string;
  status: string;
  paid_at: string | null;
  customer?: {
    name: string;
    phone: string;
    package?: { name: string };
    region?: { name: string };
  };
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generating, setGenerating] = useState(false);

  const fetchInvoices = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await api.get('/invoices', params);
      setInvoices(data);
    } catch (err) { // err logged
}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [search, statusFilter]);

  const handleGenerate = async () => {
    if (!confirm('Generate tagihan bulan ini untuk semua pelanggan aktif?')) return;
    setGenerating(true);
    try {
      const res = await api.post('/invoices/generate');
      Swal.fire({text: res.message,   icon: 'info'});
      fetchInvoices();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setGenerating(false); }
  };

  const handlePay = async (id: number) => {
    if (!confirm('Konfirmasi pembayaran tagihan ini?')) return;
    try {
      const res = await api.post(`/invoices/${id}/pay`);
      Swal.fire({text: res.message,   icon: 'info'});
      fetchInvoices();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
  };

  const totalUnpaid = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10">
            <Receipt className="text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tagihan & Pembayaran</h1>
            <p className="text-sm text-gray-400">{invoices.length} tagihan</p>
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-amber-600/20 transition-all active:scale-95"
        >
          <Zap size={18} />
          <span>{generating ? 'Generating...' : 'Generate Tagihan Bulan Ini'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10"><CheckCircle2 className="text-emerald-400" size={20} /></div>
            <span className="text-sm text-gray-400">Total Terbayar</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalPaid)}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-red-500/10"><AlertCircle className="text-red-400" size={20} /></div>
            <span className="text-sm text-gray-400">Total Tunggakan</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatRupiah(totalUnpaid)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Cari nama pelanggan..."
            className="w-full bg-slate-900/50 border border-white/10 text-white rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select
            className="bg-slate-900/50 border border-white/10 text-white rounded-2xl py-2.5 pl-10 pr-8 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none backdrop-blur-md cursor-pointer"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="paid">Lunas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Memuat tagihan...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Tidak ada data tagihan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Periode</th>
                  <th className="px-6 py-4 font-semibold">Jatuh Tempo</th>
                  <th className="px-6 py-4 font-semibold">Nominal</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-xs">
                          {inv.customer?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{inv.customer?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{inv.customer?.package?.name || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{inv.billing_period}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{formatRupiah(inv.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit border ${
                        inv.status === 'paid' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      }`}>
                        {inv.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {inv.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'unpaid' && (
                        <button
                          onClick={() => handlePay(inv.id)}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border border-emerald-500/20"
                        >
                          Bayar
                        </button>
                      )}
                      {inv.status === 'paid' && inv.paid_at && (
                        <span className="text-xs text-gray-500">{new Date(inv.paid_at).toLocaleDateString('id-ID')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
