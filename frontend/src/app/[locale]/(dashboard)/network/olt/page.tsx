'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api } from '@/lib/api';
import { Radio, Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface OltData {
  id: number;
  name: string;
  region_id: number | null;
  router_id: number | null;
  brand: string | null;
  ip_address: string | null;
  host_username: string | null;
  host_password: string | null;
  total_pon_ports: number | null;
  latitude: string | null;
  longitude: string | null;
  region?: { name: string };
  router?: { name: string };
  distribution_points_count?: number;
}

const emptyForm = { 
  name: '', 
  region_id: '', 
  router_id: '', 
  brand: '', 
  ip_address: '', 
  host_username: '', 
  host_password: '', 
  total_pon_ports: '8', 
  latitude: '', 
  longitude: '' 
};

export default function OltPage() {
  const [olts, setOlts] = useState<OltData[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [routers, setRouters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [o, reg, rtr] = await Promise.all([api.get('/olts'), api.get('/regions'), api.get('/routers')]);
      setOlts(o); setRegions(reg); setRouters(rtr);
    } catch (err) { // err logged
}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (o: OltData) => {
    setForm({ 
      name: o.name, 
      region_id: o.region_id ? String(o.region_id) : '', 
      router_id: o.router_id ? String(o.router_id) : '', 
      brand: o.brand || '', 
      ip_address: o.ip_address || '', 
      host_username: o.host_username || '', 
      host_password: o.host_password || '', 
      total_pon_ports: o.total_pon_ports ? String(o.total_pon_ports) : '8', 
      latitude: o.latitude || '', 
      longitude: o.longitude || '' 
    });
    setEditId(o.id); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return Swal.fire({text: "Nama OLT Wajib diisi!",   icon: 'info'});
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        region_id: form.region_id || null, 
        router_id: form.router_id || null,
        total_pon_ports: form.total_pon_ports || null
      };
      if (editId) await api.put(`/olts/${editId}`, payload);
      else await api.post('/olts', payload);
      setShowModal(false); fetchData();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus OLT ini?')) return;
    try { await api.delete(`/olts/${id}`); setOlts(prev => prev.filter(o => o.id !== id)); }
    catch (err) { // err logged
}
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10"><Radio className="text-indigo-400" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">OLT Induk</h1>
            <p className="text-sm text-gray-400">{olts.length} OLT terdaftar</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} /><span>Tambah OLT</span>
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Memuat data OLT...</div>
        ) : olts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada OLT.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama OLT</th>
                  <th className="px-6 py-4 font-semibold">Wilayah</th>
                  <th className="px-6 py-4 font-semibold">Router</th>
                  <th className="px-6 py-4 font-semibold">Jumlah ODP</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {olts.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10"><Radio className="text-indigo-400" size={16} /></div>
                        <span className="font-medium text-slate-200">{o.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{o.region?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{o.router?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">{o.distribution_points_count ?? 0} ODP</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-1 ">
                        <button onClick={() => openEdit(o)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(o.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <form className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editId ? 'Edit OLT' : 'Tambah OLT Baru'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama OLT <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="OLT Pusat Banyuwangi" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Brand/Merk</label>
                <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="ZTE / Huawei" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Total PON Port</label>
                <input type="number" value={form.total_pon_ports} onChange={e => setForm({...form, total_pon_ports: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" min="1" placeholder="8" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Wilayah / Regional</label>
                <select value={form.region_id} onChange={e => setForm({...form, region_id: e.target.value})} required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                  <option value="">-- Pilih Wilayah --</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Router / Mikrotik Induk</label>
                <select value={form.router_id} onChange={e => setForm({...form, router_id: e.target.value})} required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                  <option value="">-- Pilih Router --</option>
                  {routers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-white/5 mt-2">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Informasi Perangkat (Remote)</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">IP Address OLT</label>
                <input type="text" value={form.ip_address} onChange={e => setForm({...form, ip_address: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="192.168.x.x" />
              </div>

              <div></div> {/* Spacer */}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username OLT</label>
                <input type="text" value={form.host_username} onChange={e => setForm({...form, host_username: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="admin" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password OLT</label>
                <input type="password" value={form.host_password} onChange={e => setForm({...form, host_password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="••••••••" />
              </div>

              <div className="md:col-span-2 pt-4 border-t border-white/5 mt-2">
                <h4 className="text-sm font-bold text-slate-300 mb-3">Koordinat Lokasi</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Latitude</label>
                <input type="text" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="-8.x" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Longitude</label>
                <input type="text" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="114.x" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-medium">Batal</button>
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20">
                <Save size={18} /><span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
