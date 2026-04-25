'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api, formatRupiah } from '@/lib/api';
import { Package, Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface PackageData {
  id: number;
  name: string;
  price: number;
  mikrotik_profile_name: string;
  rate_limit: string | null;
  local_address: string | null;
  remote_address: string | null;
}

const emptyForm = { name: '', price: '', mikrotik_profile_name: '', rate_limit: '', local_address: '', remote_address: '' };

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try { setPackages(await api.get('/packages')); }
    catch (err) { // err logged
}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (p: PackageData) => {
    setForm({ name: p.name, price: String(p.price), mikrotik_profile_name: p.mikrotik_profile_name || '', rate_limit: p.rate_limit || '', local_address: p.local_address || '', remote_address: p.remote_address || '' });
    setEditId(p.id); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editId) await api.put(`/packages/${editId}`, payload);
      else await api.post('/packages', payload);
      setShowModal(false); fetchData();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus paket ini? Pastikan tidak ada pelanggan yang menggunakan paket ini.')) return;
    try { await api.delete(`/packages/${id}`); setPackages(prev => prev.filter(p => p.id !== id)); }
    catch (err) { // err logged
}
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-500/10"><Package className="text-violet-400" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Paket Internet</h1>
            <p className="text-sm text-gray-400">{packages.length} paket terdaftar</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} /><span>Tambah Paket</span>
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-900/50 rounded-3xl border border-white/5 animate-pulse" />)}
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center text-gray-500">Belum ada paket.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((p) => (
            <div key={p.id} className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-violet-500/10"><Package className="text-violet-400" size={20} /></div>
                <div className="flex gap-1 ">
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
              <p className="text-2xl font-bold text-blue-400 mb-3">{formatRupiah(p.price)}<span className="text-sm text-gray-500 font-normal">/bln</span></p>
              <div className="space-y-1 text-xs text-gray-500">
                {p.rate_limit && <p>Speed: <span className="text-gray-400">{p.rate_limit}</span></p>}
                {p.mikrotik_profile_name && <p>Profile: <span className="text-gray-400 font-mono">{p.mikrotik_profile_name}</span></p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editId ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nama Paket</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Home 20 Mbps" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Harga (Rp)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="150000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nama Profil Mikrotik</label>
                <input type="text" value={form.mikrotik_profile_name} onChange={e => setForm({...form, mikrotik_profile_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono" placeholder="home-20m" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rate Limit (Upload/Download)</label>
                <input type="text" value={form.rate_limit} onChange={e => setForm({...form, rate_limit: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono" placeholder="20M/20M" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Local Address</label>
                  <input type="text" value={form.local_address} onChange={e => setForm({...form, local_address: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm" placeholder="10.0.0.1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Remote Address (Pool)</label>
                  <input type="text" value={form.remote_address} onChange={e => setForm({...form, remote_address: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm" placeholder="pool-pppoe" />
                </div>
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
