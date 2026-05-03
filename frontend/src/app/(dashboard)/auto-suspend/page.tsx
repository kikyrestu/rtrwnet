'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldOff, Loader2, Users, Clock, CheckCircle2, XCircle,
  AlertTriangle, Settings2, RefreshCcw, Zap, Power
} from 'lucide-react';

interface SuspendLog {
  id: number;
  customer_name: string;
  action: string;
  reason: string;
  created_at: string;
}

export default function AutoSuspendPage() {
  const [config, setConfig] = useState({
    grace_period_days: 7,
    auto_unsuspend: true,
    notify_before_days: 3,
    notify_via_whatsapp: false,
  });
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<SuspendLog[]>([]);

  const [stats, setStats] = useState({ total_isolated: 0, unsuspend_today: 0, will_isolate: 0 });

  const fetchData = useCallback(async () => {
    try {
      const [confRes, logsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/auto-suspend/config'),
        fetch('http://127.0.0.1:8000/api/auto-suspend/logs')
      ]);
      if (confRes.ok) setConfig(await confRes.json());
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (e) {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await fetch('http://127.0.0.1:8000/api/auto-suspend/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(config)
      });
      // Optionally show toast
    } finally { setSaving(false); }
  };

  const handleRun = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/auto-suspend/run', { method: 'POST' });
      fetchData();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-xl border border-red-500/20">
              <ShieldOff className="text-red-400" size={24} />
            </div>
            Auto Isolir & Buka Blokir
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Otomatis mengisolir pelanggan yang telat bayar melalui Mikrotik API</p>
        </div>
        <button onClick={handleRun} className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-red-600/20">
          <Zap size={16} /> Jalankan Sekarang
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Terisolir', value: stats.total_isolated, color: 'text-red-400', icon: ShieldOff, iconBg: 'bg-red-600/20' },
          { label: 'Auto Unsuspend Hari Ini', value: stats.unsuspend_today, color: 'text-emerald-400', icon: CheckCircle2, iconBg: 'bg-emerald-600/20' },
          { label: 'Akan Diisolir (3 Hari)', value: stats.will_isolate, color: 'text-amber-400', icon: AlertTriangle, iconBg: 'bg-amber-600/20' },
          { label: 'Grace Period', value: `${config.grace_period_days} hari`, color: 'text-blue-400', icon: Clock, iconBg: 'bg-blue-600/20' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
              </div>
              <div className={`p-3 ${s.iconBg} rounded-xl`}><s.icon className={s.color} size={22} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Settings2 size={18} className="text-gray-400" /> Konfigurasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Grace Period (Hari)</label>
            <input type="number" min="1" value={config.grace_period_days}
              onChange={e => setConfig({ ...config, grace_period_days: parseInt(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
            <p className="text-[10px] text-gray-600 mt-1">Berapa hari setelah jatuh tempo baru diisolir</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notify Sebelum Isolir (Hari)</label>
            <input type="number" min="1" value={config.notify_before_days}
              onChange={e => setConfig({ ...config, notify_before_days: parseInt(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
            <input type="checkbox" checked={config.auto_unsuspend}
              onChange={e => setConfig({ ...config, auto_unsuspend: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
            <div>
              <p className="text-sm text-white font-medium">Auto Unsuspend</p>
              <p className="text-[10px] text-gray-500">Otomatis buka blokir setelah pembayaran masuk</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
            <input type="checkbox" checked={config.notify_via_whatsapp}
              onChange={e => setConfig({ ...config, notify_via_whatsapp: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
            <div>
              <p className="text-sm text-white font-medium">Notifikasi via WhatsApp</p>
              <p className="text-[10px] text-gray-500">Kirim peringatan sebelum isolir via WA</p>
            </div>
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={handleSaveConfig} disabled={saving} className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Simpan Konfigurasi
          </button>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Clock size={18} className="text-gray-400" /> Riwayat Isolir / Unsuspend</h2>
        </div>
        <div className="divide-y divide-white/5">
          {logs.map(log => (
            <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
              <div className={`p-2 rounded-xl border ${log.action === 'suspend' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                {log.action === 'suspend' ? <ShieldOff size={18} className="text-red-400" /> : <Power size={18} className="text-emerald-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{log.customer_name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${log.action === 'suspend' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {log.action === 'suspend' ? 'Isolir' : 'Buka Blokir'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{log.reason}</p>
              </div>
              <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
