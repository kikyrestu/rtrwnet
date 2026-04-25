'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, formatRupiah } from '@/lib/api';
import { Users, Search, Plus, Trash2, Eye, Filter, Map } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CustomerMap = dynamic(() => import('@/components/ui/CustomerMap'), { ssr: false });

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  status: string;
  mikrotik_username: string;
  package?: { name: string; price: number };
  router?: { name: string };
  dp?: { name: string };
  region?: { name: string };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeSessions, setActiveSessions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await api.get('/customers', params);
      setCustomers(data);
    } catch (err) {
      // err logged
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const res = await api.get('/monitor/customers/active');
      if (res && res.active_usernames) {
        setActiveSessions(res.active_usernames);
      }
    } catch(err) { // err logged
}
  }, []);

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchActiveSessions]);

  useEffect(() => {
    const timeout = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timeout);
  }, [fetchCustomers]);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus pelanggan ini?')) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) { // err logged
}
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      isolated: 'bg-red-500/15 text-red-400 border-red-500/20',
      inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    };
    return map[status] || map.inactive;
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { active: 'Aktif', isolated: 'Isolir', inactive: 'Nonaktif' };
    return map[status] || status;
  };

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <Users className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Daftar Pelanggan</h1>
            <p className="text-sm text-gray-400">{customers.length} pelanggan terdaftar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-2xl flex items-center space-x-2 font-medium border border-white/10 transition-all">
            {viewMode === 'list' ? <Map size={18} /> : <Users size={18} />}
            <span>{viewMode === 'list' ? 'Lihat Peta' : 'Lihat Tabel'}</span>
          </button>
          
          <Link href="/customers/create"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            <Plus size={18} />
            <span>Tambah Pelanggan</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text" placeholder="Cari nama, HP, atau username..."
            className="w-full bg-slate-900/50 border border-white/10 text-white rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select
            className="bg-slate-900/50 border border-white/10 text-white rounded-2xl py-2.5 pl-10 pr-8 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none backdrop-blur-md cursor-pointer"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="isolated">Isolir</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Memuat data pelanggan...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Tidak ada data pelanggan.</div>
        ) : viewMode === 'map' ? (
          <CustomerMap customers={customers} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">No. HP</th>
                  <th className="px-6 py-4 font-semibold">Paket</th>
                  <th className="px-6 py-4 font-semibold">Router</th>
                  <th className="px-6 py-4 font-semibold">ODP</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{c.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-[11px] text-gray-500 font-mono tracking-wide">{c.mikrotik_username}</p>
                            {activeSessions[c.mikrotik_username] ? (
                              <span className="flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-all">
                                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                ONLINE - {activeSessions[c.mikrotik_username].uptime}
                              </span>
                            ) : (
                              <span className="flex items-center text-[10px] text-slate-500 font-semibold bg-slate-800/50 px-2 py-0.5 rounded-md border border-white/5 transition-all">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-1.5"></span>
                                OFFLINE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{c.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{c.package?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{c.router?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{c.dp?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge(c.status)}`}>
                        {statusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-1">
                        <Link href={`/customers/${c.id}`} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-all">
                          <Eye size={16} />
                        </Link>
                        <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
