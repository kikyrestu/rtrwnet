'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Ticket, Plus, Search, Loader2, Trash2, X, Printer,
  Zap, Hash, Clock, ChevronDown, Settings2
} from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  rate_limit: string | null;
  shared_users: number;
  price: number;
  validity_hours: number;
  vouchers_count: number;
  router: { name: string } | null;
}

interface Voucher {
  id: number;
  code: string;
  username: string;
  password: string;
  status: string;
  created_at: string;
  profile: { name: string; price: number };
}

interface Summary {
  total_profiles: number;
  total_vouchers: number;
  unused: number;
  active: number;
  used: number;
}

const statusColors: Record<string, string> = {
  unused: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  used: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function HotspotPage() {
  const [tab, setTab] = useState<'vouchers' | 'profiles'>('vouchers');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterProfile, setFilterProfile] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showGenerate, setShowGenerate] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [genForm, setGenForm] = useState({ profile_id: '', quantity: 10, prefix: 'HS' });
  const [profileForm, setProfileForm] = useState({ name: '', rate_limit: '', shared_users: 1, price: 0, validity_hours: 24 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProfile) params.set('profile_id', filterProfile);
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const [pRes, vRes, sRes] = await Promise.all([
        fetch('/api/hotspot/profiles'),
        fetch(`/api/hotspot/vouchers?${params}`),
        fetch('/api/hotspot/summary'),
      ]);
      if (pRes.ok) setProfiles(await pRes.json());
      if (vRes.ok) setVouchers(await vRes.json());
      if (sRes.ok) setSummary(await sRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterProfile, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/hotspot/vouchers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(genForm),
      });
      if (res.ok) { setShowGenerate(false); fetchData(); }
    } finally { setSaving(false); }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/hotspot/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        setShowProfileForm(false);
        setProfileForm({ name: '', rate_limit: '', shared_users: 1, price: 0, validity_hours: 24 });
        fetchData();
      }
    } finally { setSaving(false); }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!confirm('Hapus voucher ini?')) return;
    await fetch(`/api/hotspot/vouchers/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/20">
              <Ticket className="text-blue-400" size={24} />
            </div>
            Hotspot Voucher
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Generate dan kelola voucher WiFi hotspot</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowProfileForm(true)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2">
            <Settings2 size={16} /> Profil Baru
          </button>
          <button onClick={() => { setGenForm({ ...genForm, profile_id: profiles[0]?.id?.toString() || '' }); setShowGenerate(true); }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20">
            <Zap size={16} /> Generate Voucher
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Voucher', value: summary.total_vouchers, color: 'text-white' },
            { label: 'Belum Dipakai', value: summary.unused, color: 'text-emerald-400' },
            { label: 'Aktif', value: summary.active, color: 'text-blue-400' },
            { label: 'Sudah Dipakai', value: summary.used, color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('vouchers')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'vouchers' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
          <Hash size={14} className="inline mr-1" /> Voucher
        </button>
        <button onClick={() => setTab('profiles')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'profiles' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
          <Settings2 size={14} className="inline mr-1" /> Profil
        </button>
      </div>

      {/* Vouchers Tab */}
      {tab === 'vouchers' && (
        <>
          <div className="flex flex-wrap gap-3">
            <select value={filterProfile} onChange={e => setFilterProfile(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="">Semua Profil</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="all">Semua Status</option>
              <option value="unused">Belum Dipakai</option>
              <option value="active">Aktif</option>
              <option value="used">Sudah Dipakai</option>
            </select>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue-400" size={28} /></div> :
            vouchers.length === 0 ? <div className="text-center py-20 text-gray-500"><Ticket size={48} className="mx-auto mb-3 opacity-30" /><p>Belum ada voucher.</p></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left p-4">Kode</th><th className="text-left p-4">Username</th><th className="text-left p-4">Password</th>
                    <th className="text-left p-4">Profil</th><th className="text-center p-4">Status</th><th className="text-right p-4">Harga</th><th className="text-center p-4">Aksi</th>
                  </tr></thead>
                  <tbody>
                    {vouchers.map(v => (
                      <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-4 font-mono text-white font-bold">{v.code}</td>
                        <td className="p-4 font-mono text-gray-300">{v.username}</td>
                        <td className="p-4 font-mono text-gray-300">{v.password}</td>
                        <td className="p-4 text-gray-300">{v.profile?.name}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusColors[v.status] || ''}`}>{v.status}</span>
                        </td>
                        <td className="p-4 text-right text-gray-300">Rp {Number(v.profile?.price || 0).toLocaleString('id-ID')}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteVoucher(v.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Profiles Tab */}
      {tab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map(p => (
            <div key={p.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <h3 className="font-bold text-white text-lg">{p.name}</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Speed</span><span className="text-white">{p.rate_limit || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shared Users</span><span className="text-white">{p.shared_users}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Durasi</span><span className="text-white">{p.validity_hours} jam</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Harga</span><span className="text-emerald-400 font-bold">Rp {Number(p.price).toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Voucher</span><span className="text-white">{p.vouchers_count}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGenerate(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Generate Voucher</h2>
              <button onClick={() => setShowGenerate(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Profil Hotspot</label>
                <select required value={genForm.profile_id} onChange={e => setGenForm({ ...genForm, profile_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="">Pilih profil</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name} - Rp {Number(p.price).toLocaleString('id-ID')}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Jumlah</label>
                  <input required type="number" min="1" max="100" value={genForm.quantity} onChange={e => setGenForm({ ...genForm, quantity: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prefix Kode</label>
                  <input type="text" value={genForm.prefix} onChange={e => setGenForm({ ...genForm, prefix: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="HS" />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Zap size={16} /> Generate</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProfileForm(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Tambah Profil Hotspot</h2>
              <button onClick={() => setShowProfileForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Profil</label>
                <input required type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Contoh: WiFi 3 Jam - 5Mbps" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rate Limit</label>
                  <input type="text" value={profileForm.rate_limit} onChange={e => setProfileForm({ ...profileForm, rate_limit: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="5M/5M" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Shared Users</label>
                  <input type="number" min="1" value={profileForm.shared_users} onChange={e => setProfileForm({ ...profileForm, shared_users: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga (Rp)</label>
                  <input required type="number" min="0" value={profileForm.price} onChange={e => setProfileForm({ ...profileForm, price: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Durasi (Jam)</label>
                  <input required type="number" min="1" value={profileForm.validity_hours} onChange={e => setProfileForm({ ...profileForm, validity_hours: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={16} /> Simpan Profil</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
