'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Users, Receipt, AlertTriangle, Settings2, Globe, Eye, Link2, Loader2, CheckCircle2 } from 'lucide-react';

export default function ClientPortalPage() {
  const [config, setConfig] = useState({
    can_view_billing: true,
    can_view_history: true,
    can_report_issue: true,
    can_download_invoice: false,
    can_change_password: true,
  });
  const [stats, setStats] = useState({ total_accounts: 0, login_today: 0, check_billing: 0, report_issue: 0 });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [confRes, statsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/client-portal/config'),
        fetch('http://127.0.0.1:8000/api/client-portal/stats')
      ]);
      if (confRes.ok) setConfig(await confRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await fetch('http://127.0.0.1:8000/api/client-portal/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(config)
      });
    } finally { setSaving(false); }
  };

  const options = [
    { key: 'can_view_billing', label: 'Pelanggan Bisa Cek Tagihan' },
    { key: 'can_view_history', label: 'Pelanggan Bisa Lihat History Pembayaran' },
    { key: 'can_report_issue', label: 'Pelanggan Bisa Lapor Gangguan' },
    { key: 'can_download_invoice', label: 'Pelanggan Bisa Download Invoice' },
    { key: 'can_change_password', label: 'Pelanggan Bisa Ubah Password' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/20">
              <UserCircle className="text-blue-400" size={24} />
            </div>
            Portal Pelanggan
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Halaman self-service untuk pelanggan cek tagihan dan lapor gangguan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Akun', value: stats.total_accounts, color: 'text-white', icon: Users, bg: 'bg-blue-600/20' },
          { label: 'Login Hari Ini', value: stats.login_today, color: 'text-emerald-400', icon: Eye, bg: 'bg-emerald-600/20' },
          { label: 'Cek Tagihan', value: stats.check_billing, color: 'text-blue-400', icon: Receipt, bg: 'bg-blue-600/20' },
          { label: 'Lapor Gangguan', value: stats.report_issue, color: 'text-red-400', icon: AlertTriangle, bg: 'bg-red-600/20' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p><p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p></div>
              <div className={`p-3 ${s.bg} rounded-xl`}><s.icon className={s.color} size={22} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Settings2 size={18} className="text-gray-400" /> Pengaturan Portal</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">URL Portal</label>
            <input type="text" readOnly value="http://127.0.0.1:3000/portal" className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none" />
          </div>
          {options.map((opt) => (
            <label key={opt.key} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
              <input type="checkbox" 
                checked={(config as any)[opt.key]}
                onChange={e => setConfig({ ...config, [opt.key]: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
              <span className="text-sm text-white">{opt.label}</span>
            </label>
          ))}
          <button onClick={handleSaveConfig} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 flex justify-center items-center gap-2 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Simpan Pengaturan
          </button>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Eye size={18} className="text-gray-400" /> Preview</h2>
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-white/10 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600/30 rounded-full mx-auto flex items-center justify-center"><UserCircle size={32} className="text-blue-400" /></div>
            <h3 className="text-white font-bold text-lg">RT/RW Net Portal</h3>
            <p className="text-gray-400 text-sm">Login dengan ID Pelanggan</p>
            <div className="space-y-2 max-w-xs mx-auto">
              <input type="text" readOnly value="ID-CUST-001" className="w-full bg-white/10 border border-white/20 text-white rounded-xl p-3 text-sm text-center" />
              <input type="password" readOnly value="pass" className="w-full bg-white/10 border border-white/20 text-white rounded-xl p-3 text-sm text-center" />
              <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl">Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
