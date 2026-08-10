'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, Loader2, Upload, Landmark } from 'lucide-react';

export default function IspProfilePage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings/isp').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings/isp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      alert('Profil ISP berhasil disimpan!');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-blue-400" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/20"><Building2 className="text-blue-400" size={24} /></div>
          Profil ISP
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Data perusahaan yang tampil di invoice, kwitansi, dan portal</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Informasi Perusahaan</h2>
          {[
            { key: 'company_name', label: 'Nama ISP / Perusahaan', placeholder: 'RT/RW Net Sejahtera' },
            { key: 'company_tagline', label: 'Tagline', placeholder: 'Internet Cepat & Stabil' },
            { key: 'address', label: 'Alamat', placeholder: 'Jl. Merdeka No. 1, Kota' },
            { key: 'phone', label: 'No. Telepon', placeholder: '08123456789' },
            { key: 'email', label: 'Email', placeholder: 'admin@rtrwnet.id' },
            { key: 'website', label: 'Website', placeholder: 'https://rtrwnet.id' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
              <input type="text" value={data[f.key] || ''} onChange={e => setData({ ...data, [f.key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder={f.placeholder} />
            </div>
          ))}
        </div>

        {/* Invoice & Bank */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Pengaturan Invoice</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prefix Invoice</label>
                <input type="text" value={data.invoice_prefix || ''} onChange={e => setData({ ...data, invoice_prefix: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="INV" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Jatuh Tempo (Tanggal)</label>
                <input type="number" min="1" max="28" value={data.due_day || 10} onChange={e => setData({ ...data, due_day: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Catatan di Footer Invoice</label>
              <textarea value={data.invoice_footer_note || ''} onChange={e => setData({ ...data, invoice_footer_note: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={3} />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Landmark size={18} className="text-gray-400" /> Informasi Bank</h2>
            {[
              { key: 'bank_name', label: 'Nama Bank', placeholder: 'BCA / BRI / Mandiri' },
              { key: 'bank_account_number', label: 'No. Rekening', placeholder: '1234567890' },
              { key: 'bank_account_name', label: 'Atas Nama', placeholder: 'PT Internet Sejahtera' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
                <input type="text" value={data[f.key] || ''} onChange={e => setData({ ...data, [f.key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder={f.placeholder} />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="lg:col-span-2">
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan Profil ISP</>}
          </button>
        </div>
      </form>
    </div>
  );
}
