'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { api } from '@/lib/api';
import { UserCog, Plus, Edit, Trash2, X, Save, Shield } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  region_id: number | null;
  region?: { name: string };
}

interface Region { id: number; name: string; }

const emptyForm = { name: '', email: '', password: '', role: 'technician', region_id: '' };

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [u, r] = await Promise.all([api.get('/users'), api.get('/regions')]);
      setUsers(u); setRegions(r);
    } catch (err) { // err logged
}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (u: UserData) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, region_id: u.region_id ? String(u.region_id) : '' });
    setEditId(u.id); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, role: form.role, region_id: form.region_id ? Number(form.region_id) : null };
      if (form.password) payload.password = form.password;
      if (editId) await api.put(`/users/${editId}`, payload);
      else { payload.password = form.password; await api.post('/users', payload); }
      setShowModal(false); fetchData();
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    try { await api.delete(`/users/${id}`); setUsers(prev => prev.filter(u => u.id !== id)); }
    catch (err) { // err logged
}
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: 'bg-red-500/15 text-red-400 border-red-500/20',
      technician: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
      sales: 'bg-green-500/15 text-green-400 border-green-500/20',
      collector: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    };
    return map[role] || '';
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = { admin: 'Admin', technician: 'Teknisi', sales: 'Sales', collector: 'Kolektor' };
    return map[role] || role;
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10"><UserCog className="text-rose-400" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pengguna & RBAC</h1>
            <p className="text-sm text-gray-400">{users.length} pengguna sistem</p>
          </div>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} /><span>Tambah User</span>
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Memuat data pengguna...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada pengguna.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Pengguna</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Wilayah</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit border ${roleBadge(u.role)}`}>
                        <Shield size={12} />{roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{u.region?.name || 'Semua'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-1 ">
                        <button onClick={() => openEdit(u)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
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
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editId ? 'Edit User' : 'Tambah User Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nama</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Ahmad" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="ahmad@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password {editId && '(kosongkan jika tidak diubah)'}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                    <option value="admin">Admin</option>
                    <option value="technician">Teknisi</option>
                    <option value="sales">Sales</option>
                    <option value="collector">Kolektor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Wilayah</label>
                  <select value={form.region_id} onChange={e => setForm({...form, region_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                    <option value="">Semua (Admin)</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
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
