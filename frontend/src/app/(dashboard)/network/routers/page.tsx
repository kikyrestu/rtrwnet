'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api } from '@/lib/api';
import { Router as RouterIcon, Plus, Edit, Trash2, X, Save, Wifi } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapInput = dynamic(() => import('@/components/ui/MapInput'), { ssr: false });

interface RouterData {
  id: number;
  name: string;
  host: string;
  api_username: string;
  api_password: string;
  api_port: number;
  region_id: number | null;
  latitude: string | null;
  longitude: string | null;
  region?: { id: number; name: string };
}

interface Region { id: number; name: string; }

const emptyForm = { name: '', host: '', api_username: 'admin', api_password: '', api_port: '8728', region_id: '', latitude: '', longitude: '' };

export default function RoutersPage() {
  const [routers, setRouters] = useState<RouterData[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [r, reg] = await Promise.all([api.get('/routers'), api.get('/regions')]);
      setRouters(r); setRegions(reg);
    } catch (err) { // err logged
}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (r: RouterData) => {
    setForm({
      name: r.name, host: r.host,
      api_username: r.api_username, api_password: r.api_password,
      api_port: String(r.api_port), region_id: r.region_id ? String(r.region_id) : '',
      latitude: r.latitude || '', longitude: r.longitude || ''
    });
    setEditId(r.id); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, api_port: Number(form.api_port), region_id: form.region_id ? Number(form.region_id) : null };
      if (editId) { await api.put(`/routers/${editId}`, payload); }
      else { await api.post('/routers', payload); }
      setShowModal(false); fetchData();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus router ini?')) return;
    try { await api.delete(`/routers/${id}`); setRouters(prev => prev.filter(r => r.id !== id)); }
    catch (err) { // err logged
}
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10"><RouterIcon className="text-cyan-400" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Router Mikrotik</h1>
            <p className="text-sm text-gray-400">{routers.length} router terdaftar</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} /><span>Tambah Router</span>
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Memuat data router...</div>
        ) : routers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada router.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama</th>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                  <th className="px-6 py-4 font-semibold">API Port</th>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  <th className="px-6 py-4 font-semibold">Wilayah</th>
                  <th className="px-6 py-4 font-semibold">Koordinat</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {routers.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/10"><Wifi className="text-cyan-400" size={16} /></div>
                        <span className="font-medium text-slate-200">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{r.host}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{r.api_port}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{r.api_username}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{r.region?.name || '-'}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {r.latitude && r.longitude ? `${Number(r.latitude).toFixed(4)}, ${Number(r.longitude).toFixed(4)}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-1 ">
                        <button onClick={() => openEdit(r)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-all"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editId ? 'Edit Router' : 'Tambah Router Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama Router</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Mikrotik Pusat" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">IP Address</label>
                  <input type="text" value={form.host} onChange={e => setForm({...form, host: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono" placeholder="192.168.56.2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">API Port</label>
                  <input type="number" value={form.api_port} onChange={e => setForm({...form, api_port: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username API</label>
                  <input type="text" value={form.api_username} onChange={e => setForm({...form, api_username: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Password API</label>
                  <input type="password" value={form.api_password} onChange={e => setForm({...form, api_password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Wilayah</label>
                <select value={form.region_id} onChange={e => setForm({...form, region_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                  <option value="">-- Pilih Wilayah --</option>
                  {regions.map(rg => <option key={rg.id} value={rg.id}>{rg.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Lokasi Router di Peta</label>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <MapInput 
                    lat={Number(form.latitude) || -6.200000} 
                    lng={Number(form.longitude) || 106.816666} 
                    onChange={(lat, lng) => setForm({...form, latitude: String(lat), longitude: String(lng)})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Latitude</label>
                  <input type="text" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm" placeholder="-8.123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Longitude</label>
                  <input type="text" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm" placeholder="114.123" />
                </div>
              </div>

            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-medium transition-all">Batal</button>
              <button onClick={handleSave} disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all">
                <Save size={18} /><span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
