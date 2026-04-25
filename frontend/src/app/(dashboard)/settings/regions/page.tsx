'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api } from '@/lib/api';
import { Map, Plus, Edit, Trash2, X, Save, Users } from 'lucide-react';

interface RegionData {
  id: number;
  name: string;
  description: string | null;
  customers_count?: number;
}

const emptyForm = { name: '', description: '' };

export default function RegionsPage() {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try { setRegions(await api.get('/regions')); }
    catch (err) { // err logged
}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (r: RegionData) => {
    setForm({ name: r.name, description: r.description || '' });
    setEditId(r.id); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await api.put(`/regions/${editId}`, form);
      else await api.post('/regions', form);
      setShowModal(false); fetchData();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus wilayah ini?')) return;
    try { await api.delete(`/regions/${id}`); setRegions(prev => prev.filter(r => r.id !== id)); }
    catch (err) { // err logged
}
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-green-500/10"><Map className="text-green-400" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Wilayah / Area</h1>
            <p className="text-sm text-gray-400">{regions.length} wilayah</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} /><span>Tambah Wilayah</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-900/50 rounded-3xl border border-white/5 animate-pulse" />)}
        </div>
      ) : regions.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center text-gray-500">Belum ada wilayah.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((r) => (
            <div key={r.id} className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl bg-green-500/10"><Map className="text-green-400" size={20} /></div>
                <div className="flex gap-1 ">
                  <button onClick={() => openEdit(r)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white">{r.name}</h3>
              {r.description && <p className="text-sm text-gray-500 mt-1">{r.description}</p>}
              <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-400">
                <Users size={14} /><span>{r.customers_count ?? 0} pelanggan</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editId ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama Wilayah</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Banyuwangi Kota" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Deskripsi (Opsional)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" rows={3} placeholder="Area layanan kota..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-medium">Batal</button>
              <button onClick={handleSave} disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20">
                <Save size={18} /><span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
