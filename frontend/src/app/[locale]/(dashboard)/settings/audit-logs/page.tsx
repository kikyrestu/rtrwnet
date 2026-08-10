'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ClipboardList, Search, Filter, Loader2, User, Globe, Clock, ShieldAlert } from 'lucide-react';

interface AuditLog {
  id: number;
  user?: { name: string; email: string };
  action: string;
  module: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (moduleFilter !== 'all') params.module = moduleFilter;
      
      const res = await api.get('/audit-logs', params);
      setLogs(res.data || []);
    } catch (err) {
      // err logged
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timeout);
  }, [search, moduleFilter]);

  const getActionColor = (action: string) => {
    const map: Record<string, string> = {
      created: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      updated: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      deleted: 'bg-red-500/15 text-red-400 border-red-500/20',
      login: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    };
    return map[action] || 'bg-gray-500/15 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10">
            <ClipboardList className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Log System</h1>
            <p className="text-sm text-gray-400">Perekaman seluruh aktivitas user dan sistem</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text" placeholder="Cari aktivitas..."
            className="w-full bg-slate-900/50 border border-white/10 text-white rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select
            className="bg-slate-900/50 border border-white/10 text-white rounded-2xl py-2.5 pl-10 pr-8 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none backdrop-blur-md cursor-pointer"
            value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="all">Semua Modul</option>
            <option value="Customer">Pelanggan</option>
            <option value="Invoice">Tagihan</option>
            <option value="Network">Jaringan</option>
            <option value="Backup">Backup</option>
            <option value="Auth">Autentikasi</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex justify-center text-gray-500"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Tidak ada catatan aktivitas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Waktu</th>
                  <th className="px-6 py-4 font-semibold">User / Aktor</th>
                  <th className="px-6 py-4 font-semibold">Modul</th>
                  <th className="px-6 py-4 font-semibold">Aksi</th>
                  <th className="px-6 py-4 font-semibold">Deskripsi Detail</th>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(log.created_at).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        {log.user ? (
                          <><div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400"><User size={14} /></div> {log.user.name}</>
                        ) : (
                          <><div className="p-1.5 bg-red-500/20 rounded-lg text-red-400"><ShieldAlert size={14} /></div> SYSTEM</>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-indigo-300">{log.module || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.description}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs flex items-center gap-1.5">
                      <Globe size={12} /> {log.ip_address || '-'}
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
