'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api } from '@/lib/api';
import { MapPin, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapInput = dynamic(() => import('@/components/ui/MapInput'), { ssr: false });

interface DpData {
  id: number;
  name: string;
  olt_id: number | null;
  olt_pon_port: string | null;
  address: string | null;
  type: string;
  total_ports: number;
  available_ports: number;
  latitude: string | null;
  longitude: string | null;
  olt?: { name: string };
}

const emptyForm = { name: '', olt_id: '', olt_pon_port: '', address: '', type: 'fiber', total_ports: '8', available_ports: '8', latitude: '', longitude: '' };

export default function OdpPage() {
  const [dps, setDps] = useState<DpData[]>([]);
  const [olts, setOlts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [d, o] = await Promise.all([api.get('/distribution-points'), api.get('/olts')]);
      setDps(d); setOlts(o);
    } catch (err) { // err logged
}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (d: DpData) => {
    setForm({ 
      name: d.name, 
      olt_id: d.olt_id ? String(d.olt_id) : '', 
      olt_pon_port: d.olt_pon_port || '',
      address: d.address || '',
      type: d.type || 'fiber', 
      total_ports: String(d.total_ports), 
      available_ports: String(d.available_ports), 
      latitude: d.latitude || '', 
      longitude: d.longitude || '' 
    });
    setEditId(d.id); setShowModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) return Swal.fire({text: "Nama ODP Wajib diisi!",   icon: 'info'});
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        olt_id: form.olt_id ? Number(form.olt_id) : null, 
        olt_pon_port: form.olt_pon_port || null,
        address: form.address || null,
        total_ports: Number(form.total_ports), 
        available_ports: Number(form.available_ports) 
      };
      if (editId) await api.put(`/distribution-points/${editId}`, payload);
      else await api.post('/distribution-points', payload);
      setShowModal(false); fetchData();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus ODP ini?')) return;
    try { await api.delete(`/distribution-points/${id}`); setDps(prev => prev.filter(d => d.id !== id)); }
    catch (err) { // err logged
}
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/10"><MapPin className="text-teal-400" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">ODP / Tiang Distribusi</h1>
            <p className="text-sm text-gray-400">{dps.length} titik distribusi</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} /><span>Tambah ODP</span>
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Memuat data ODP...</div>
        ) : dps.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada ODP.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama ODP</th>
                  <th className="px-6 py-4 font-semibold">OLT Induk</th>
                  <th className="px-6 py-4 font-semibold">Tipe</th>
                  <th className="px-6 py-4 font-semibold">Port (Sisa / Total)</th>
                  <th className="px-6 py-4 font-semibold">Koordinat</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dps.map((d) => (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-500/10"><MapPin className="text-teal-400" size={16} /></div>
                        <span className="font-medium text-slate-200">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{d.olt?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${d.type === 'fiber' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                        {d.type === 'fiber' ? 'Fiber' : 'Wireless'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${d.available_ports <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {d.available_ports} / {d.total_ports}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {d.latitude && d.longitude ? `${Number(d.latitude).toFixed(4)}, ${Number(d.longitude).toFixed(4)}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-1 ">
                        <button onClick={() => openEdit(d)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(d.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
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
              <h3 className="text-xl font-bold text-white">{editId ? 'Edit ODP' : 'Tambah ODP Baru'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama ODP <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="ODP-BWI-Mawar-01" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">OLT Induk <span className="text-red-500">*</span></label>
                  <select value={form.olt_id} onChange={e => setForm({...form, olt_id: e.target.value})} required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                    <option value="">-- Pilih --</option>
                    {olts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">PON Port OLT Induk</label>
                  <input type="text" value={form.olt_pon_port} onChange={e => setForm({...form, olt_pon_port: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="PON-1 / PON-2" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Alamat Pemasangan</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Jl. Mawar No.12, Depan Toko..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipe</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                    <option value="fiber">Fiber</option>
                    <option value="wireless">Wireless</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Total Port</label>
                  <input type="number" value={form.total_ports} onChange={e => setForm({...form, total_ports: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" min="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Port Tersedia</label>
                  <input type="number" value={form.available_ports} onChange={e => setForm({...form, available_ports: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" min="0" />
                </div>
                <div></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Lokasi di Peta</label>
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
