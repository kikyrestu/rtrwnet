'use client';

import { useEffect, useState } from 'react';
import { api, formatRupiah } from '@/lib/api';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface ReportData {
  total_paid: number;
  total_unpaid: number;
  revenue_chart: { name: string; amount: number }[];
  paid_invoices: { id: number; customer_name: string; amount: number; paid_at: string; billing_period: string }[];
  current_month: string;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-slate-900/50 rounded-3xl border border-white/5" />
        <div className="h-80 bg-slate-900/50 rounded-3xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/10">
          <BarChart3 className="text-purple-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Keuangan</h1>
          <p className="text-sm text-gray-400">Periode: {data.current_month}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10"><TrendingUp className="text-emerald-400" size={22} /></div>
            <span className="text-gray-400 font-medium">Total Pemasukan Bulan Ini</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{formatRupiah(data.total_paid)}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-red-500/10"><AlertCircle className="text-red-400" size={22} /></div>
            <span className="text-gray-400 font-medium">Total Tunggakan Bulan Ini</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{formatRupiah(data.total_unpaid)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
        <h3 className="font-bold text-lg text-white mb-6">Revenue 6 Bulan Terakhir</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenue_chart}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#8b5cf6' }}
                formatter={(val: any) => formatRupiah(Number(val))}
              />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Paid Invoices Table */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-lg text-white">Transaksi Terbayar Bulan Ini</h3>
        </div>
        {data.paid_invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada transaksi terbayar bulan ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Periode</th>
                  <th className="px-6 py-4 font-semibold">Nominal</th>
                  <th className="px-6 py-4 font-semibold">Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.paid_invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{inv.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{inv.billing_period}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">{formatRupiah(inv.amount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{inv.paid_at}</td>
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
