'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, Loader2, Settings2, CheckCircle2, XCircle,
  Clock, DollarSign, QrCode, Landmark, Wallet
} from 'lucide-react';

export default function PaymentGatewayPage() {
  const [config, setConfig] = useState({
    provider: 'tripay',
    api_key: '',
    private_key: '',
    merchant_code: '',
    sandbox_mode: true,
    channels: {
      qris: true,
      bca_va: true,
      bni_va: true,
      bri_va: true,
      mandiri_va: false,
      gopay: true,
      ovo: false,
      shopeepay: true,
    },
  });

  const channelList = [
    { key: 'qris', label: 'QRIS', icon: QrCode, color: 'text-violet-400' },
    { key: 'bca_va', label: 'BCA Virtual Account', icon: Landmark, color: 'text-blue-400' },
    { key: 'bni_va', label: 'BNI Virtual Account', icon: Landmark, color: 'text-orange-400' },
    { key: 'bri_va', label: 'BRI Virtual Account', icon: Landmark, color: 'text-blue-300' },
    { key: 'mandiri_va', label: 'Mandiri Virtual Account', icon: Landmark, color: 'text-yellow-400' },
    { key: 'gopay', label: 'GoPay', icon: Wallet, color: 'text-emerald-400' },
    { key: 'ovo', label: 'OVO', icon: Wallet, color: 'text-purple-400' },
    { key: 'shopeepay', label: 'ShopeePay', icon: Wallet, color: 'text-orange-400' },
  ];

  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total_month: 0, total_amount: 0, success: 0, pending: 0 });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [confRes, transRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/payment-gateway/config'),
        fetch('http://127.0.0.1:8000/api/payment-gateway/transactions')
      ]);
      if (confRes.ok) setConfig(await confRes.json());
      if (transRes.ok) {
        const data = await transRes.json();
        setRecentPayments(data.transactions);
        setStats(data.stats);
      }
    } catch (e) {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await fetch('http://127.0.0.1:8000/api/payment-gateway/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(config)
      });
      // Optionally show toast
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 rounded-xl border border-emerald-500/20">
              <CreditCard className="text-emerald-400" size={24} />
            </div>
            Payment Gateway
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Integrasi pembayaran online QRIS, VA, dan e-wallet</p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${config.sandbox_mode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
          {config.sandbox_mode ? '⚡ Sandbox Mode' : '✅ Production'}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Transaksi Bulan Ini', value: stats.total_month, color: 'text-white', icon: CreditCard, iconBg: 'bg-blue-600/20' },
          { label: 'Total Pembayaran', value: `Rp ${stats.total_amount.toLocaleString('id-ID')}`, color: 'text-emerald-400', icon: DollarSign, iconBg: 'bg-emerald-600/20' },
          { label: 'Berhasil', value: stats.success, color: 'text-emerald-400', icon: CheckCircle2, iconBg: 'bg-emerald-600/20' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400', icon: Clock, iconBg: 'bg-amber-600/20' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-bold ${s.color} mt-1`}>{s.value}</p>
              </div>
              <div className={`p-3 ${s.iconBg} rounded-xl`}><s.icon className={s.color} size={22} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Config */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Settings2 size={18} className="text-gray-400" /> Konfigurasi API</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Provider</label>
            <select value={config.provider} onChange={e => setConfig({ ...config, provider: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="tripay">Tripay</option>
              <option value="midtrans">Midtrans</option>
              <option value="xendit">Xendit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key</label>
            <input type="password" value={config.api_key} onChange={e => setConfig({ ...config, api_key: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Masukkan API Key" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Private Key</label>
            <input type="password" value={config.private_key} onChange={e => setConfig({ ...config, private_key: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Masukkan Private Key" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Merchant Code</label>
            <input type="text" value={config.merchant_code} onChange={e => setConfig({ ...config, merchant_code: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="T12345" />
          </div>
          <label className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl cursor-pointer">
            <input type="checkbox" checked={config.sandbox_mode}
              onChange={e => setConfig({ ...config, sandbox_mode: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Sandbox Mode</p>
              <p className="text-[10px] text-amber-400/70">Aktifkan untuk testing. Matikan untuk produksi.</p>
            </div>
          </label>
          <button onClick={handleSaveConfig} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 flex justify-center items-center gap-2 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Simpan Konfigurasi
          </button>
        </div>

        {/* Payment Channels */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Wallet size={18} className="text-gray-400" /> Channel Pembayaran</h2>
          <div className="space-y-2">
            {channelList.map(ch => (
              <label key={ch.key} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-all">
                <div className="flex items-center gap-3">
                  <ch.icon size={18} className={ch.color} />
                  <span className="text-sm text-white">{ch.label}</span>
                </div>
                <input type="checkbox"
                  checked={(config.channels as any)[ch.key]}
                  onChange={e => setConfig({ ...config, channels: { ...config.channels, [ch.key]: e.target.checked } })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Clock size={18} className="text-gray-400" /> Transaksi Terbaru</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada transaksi bulan ini.</div>
          ) : recentPayments.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
              <div className={`p-2 rounded-xl border ${p.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                {p.status === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Clock size={18} className="text-amber-400" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{p.customer}</p>
                <p className="text-xs text-gray-500">{p.channel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white font-bold">Rp {p.amount.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">{p.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
