'use client';

import { useState, useEffect } from 'react';
import { Bell, Wifi, WifiOff, Activity, Settings2, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function NmsAlertPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [devRes, alertRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/nms/devices'),
        fetch('http://127.0.0.1:8000/api/nms/alerts')
      ]);
      if (devRes.ok) setDevices(await devRes.json());
      if (alertRes.ok) setAlerts(await alertRes.json());
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statusColor: Record<string, string> = {
    online: 'text-emerald-400',
    offline: 'text-red-400',
    warning: 'text-amber-400',
  };
  const statusBg: Record<string, string> = {
    online: 'bg-emerald-500/20 border-emerald-500/30',
    offline: 'bg-red-500/20 border-red-500/30',
    warning: 'bg-amber-500/20 border-amber-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-amber-600/20 rounded-xl border border-amber-500/20">
              <Bell className="text-amber-400" size={24} />
            </div>
            Network Monitoring & Alert
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Pantau perangkat jaringan real-time dan terima alert saat device down</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Device', value: devices.length, color: 'text-white', icon: Wifi, bg: 'bg-blue-600/20' },
          { label: 'Online', value: devices.filter(d=>d.status==='online').length, color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-600/20' },
          { label: 'Warning', value: devices.filter(d=>d.status==='warning').length, color: 'text-amber-400', icon: AlertTriangle, bg: 'bg-amber-600/20' },
          { label: 'Offline', value: devices.filter(d=>d.status==='offline').length, color: 'text-red-400', icon: WifiOff, bg: 'bg-red-600/20' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p><p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p></div>
              <div className={`p-3 ${s.bg} rounded-xl`}><s.icon className={s.color} size={22} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" /> Alert Aktif</h2>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin text-amber-400" size={24} /></div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada alert aktif. Jaringan aman! 🎉</div>
          ) : alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
              <div className={`p-2 rounded-xl border ${a.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                {a.severity === 'critical' ? <WifiOff size={18} className="text-red-400" /> : <AlertTriangle size={18} className="text-amber-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{a.device}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${a.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.severity}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{a.message}</p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Device List */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Activity size={18} className="text-gray-400" /> Daftar Perangkat</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left p-4">Device</th><th className="text-left p-4">IP</th>
              <th className="text-center p-4">Status</th><th className="text-center p-4">Latency</th><th className="text-center p-4">Uptime</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin text-blue-400 mx-auto" size={24} /></td></tr>
              ) : devices.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada perangkat jaringan yang dimonitor.</td></tr>
              ) : devices.map((d, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 text-white font-medium">{d.name}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{d.ip}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${statusBg[d.status]} ${statusColor[d.status]}`}>{d.status}</span>
                  </td>
                  <td className={`p-4 text-center ${statusColor[d.status]}`}>{d.latency}</td>
                  <td className="p-4 text-center text-gray-400">{d.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
