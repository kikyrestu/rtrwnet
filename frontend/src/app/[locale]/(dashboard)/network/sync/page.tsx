'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api } from '@/lib/api';
import { RefreshCcw, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

interface RouterData { id: number; name: string; host: string; }

export default function SyncPage() {
  const [routers, setRouters] = useState<RouterData[]>([]);
  const [selectedRouter, setSelectedRouter] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<{ type: 'info' | 'success' | 'error'; msg: string; time: string }[]>([]);

  useEffect(() => {
    api.get('/routers').then(setRouters).catch(console.error);
  }, []);

  const addLog = (type: 'info' | 'success' | 'error', msg: string) => {
    setLogs(prev => [...prev, { type, msg, time: new Date().toLocaleTimeString('id-ID') }]);
  };

  const handleSync = async () => {
    if (!selectedRouter) { Swal.fire({text: 'Pilih router terlebih dahulu!',   icon: 'info'}); return; }
    setSyncing(true);
    setLogs([]);
    const router = routers.find(r => r.id === Number(selectedRouter));
    addLog('info', `Memulai sinkronisasi ke ${router?.name} (${router?.host})...`);
    addLog('info', 'Menghubungkan ke RouterOS API...');

    try {
      const res = await api.post('/sync', { router_id: Number(selectedRouter) });
      addLog('success', res.message);
      addLog('success', `${res.packages} profil PPPoE disinkronkan.`);
      addLog('success', `${res.customers} secret PPPoE disinkronkan.`);
      addLog('info', 'Sinkronisasi selesai!');
    } catch (err: any) {
      addLog('error', `Gagal: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-orange-500/10"><RefreshCcw className="text-orange-400" size={24} /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">Sinkronisasi Mikrotik</h1>
          <p className="text-sm text-gray-400">Tarik data PPPoE Secrets & Profiles dari Router</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Router Target</label>
          <select value={selectedRouter} onChange={e => setSelectedRouter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none max-w-md">
            <option value="">-- Pilih Router --</option>
            {routers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.host})</option>)}
          </select>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || !selectedRouter}
          className="bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/30 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl flex items-center space-x-3 font-bold text-lg shadow-lg shadow-orange-600/20 transition-all active:scale-95"
        >
          <RefreshCcw size={22} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Menyinkronkan...' : 'Mulai Sinkronisasi'}</span>
        </button>
      </div>

      {/* Console */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Terminal size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-400">Console Output</span>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto font-mono text-sm space-y-1.5">
          {logs.length === 0 ? (
            <p className="text-gray-600 italic">Menunggu proses sinkronisasi...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gray-600 text-xs mt-0.5 shrink-0">[{log.time}]</span>
                {log.type === 'success' && <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />}
                {log.type === 'error' && <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />}
                {log.type === 'info' && <span className="text-blue-400 mt-0.5 shrink-0">›</span>}
                <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-red-400' : 'text-slate-300'}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
          {syncing && <div className="h-4 w-2 bg-blue-400 animate-pulse rounded" />}
        </div>
      </div>
    </div>
  );
}
