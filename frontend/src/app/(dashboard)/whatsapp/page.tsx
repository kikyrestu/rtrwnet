'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, Plus, Send, Loader2, Trash2, X, Clock,
  CheckCircle2, XCircle, Users, FileText, Zap, Edit3
} from 'lucide-react';

interface Template {
  id: number;
  name: string;
  type: string;
  body: string;
  is_active: boolean;
  logs_count: number;
}

interface LogEntry {
  id: number;
  phone: string;
  message: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  customer: { name: string } | null;
  template: { name: string } | null;
}

interface Summary {
  total_templates: number;
  total_sent: number;
  total_failed: number;
  total_pending: number;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  reminder: { label: 'Reminder', color: 'bg-amber-500/20 text-amber-400' },
  payment_confirm: { label: 'Konfirmasi Bayar', color: 'bg-emerald-500/20 text-emerald-400' },
  gangguan: { label: 'Info Gangguan', color: 'bg-red-500/20 text-red-400' },
  welcome: { label: 'Welcome', color: 'bg-blue-500/20 text-blue-400' },
  custom: { label: 'Custom', color: 'bg-violet-500/20 text-violet-400' },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-amber-400', icon: Clock },
  sent: { label: 'Terkirim', color: 'text-emerald-400', icon: CheckCircle2 },
  failed: { label: 'Gagal', color: 'text-red-400', icon: XCircle },
};

export default function WhatsAppPage() {
  const [tab, setTab] = useState<'templates' | 'broadcast' | 'logs'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [templateForm, setTemplateForm] = useState({ name: '', type: 'custom', body: '' });
  const [broadcastForm, setBroadcastForm] = useState({ template_id: '', customer_ids: [] as string[] });
  const [selectAll, setSelectAll] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, lRes, sRes, cRes] = await Promise.all([
        fetch('/api/whatsapp/templates'),
        fetch('/api/whatsapp/logs'),
        fetch('/api/whatsapp/summary'),
        fetch('/api/customers'),
      ]);
      if (tRes.ok) setTemplates(await tRes.json());
      if (lRes.ok) setLogs(await lRes.json());
      if (sRes.ok) setSummary(await sRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/whatsapp/templates/${editingId}` : '/api/whatsapp/templates';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(templateForm),
      });
      if (res.ok) {
        setShowTemplateForm(false);
        setEditingId(null);
        setTemplateForm({ name: '', type: 'custom', body: '' });
        fetchData();
      }
    } finally { setSaving(false); }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Hapus template ini?')) return;
    await fetch(`/api/whatsapp/templates/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
    fetchData();
  };

  const handleEditTemplate = (t: Template) => {
    setEditingId(t.id);
    setTemplateForm({ name: t.name, type: t.type, body: t.body });
    setShowTemplateForm(true);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastForm.customer_ids.length === 0) return alert('Pilih minimal 1 pelanggan.');
    setSaving(true);
    try {
      const res = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(broadcastForm),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setShowBroadcastForm(false);
        setBroadcastForm({ template_id: '', customer_ids: [] });
        setSelectAll(false);
        setTab('logs');
        fetchData();
      }
    } finally { setSaving(false); }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setBroadcastForm({ ...broadcastForm, customer_ids: [] });
    } else {
      setBroadcastForm({ ...broadcastForm, customer_ids: customers.filter((c: any) => c.phone).map((c: any) => c.id.toString()) });
    }
    setSelectAll(!selectAll);
  };

  const toggleCustomer = (id: string) => {
    setBroadcastForm(prev => ({
      ...prev,
      customer_ids: prev.customer_ids.includes(id)
        ? prev.customer_ids.filter(cid => cid !== id)
        : [...prev.customer_ids, id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 rounded-xl border border-emerald-500/20">
              <MessageCircle className="text-emerald-400" size={24} />
            </div>
            WhatsApp Center
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Kelola template pesan dan kirim broadcast ke pelanggan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingId(null); setTemplateForm({ name: '', type: 'custom', body: '' }); setShowTemplateForm(true); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2">
            <FileText size={16} /> Template Baru
          </button>
          <button onClick={() => { setBroadcastForm({ template_id: templates[0]?.id?.toString() || '', customer_ids: [] }); setShowBroadcastForm(true); }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-emerald-600/20">
            <Send size={16} /> Broadcast
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Template', value: summary.total_templates, color: 'text-white' },
            { label: 'Terkirim', value: summary.total_sent, color: 'text-emerald-400' },
            { label: 'Gagal', value: summary.total_failed, color: 'text-red-400' },
            { label: 'Pending', value: summary.total_pending, color: 'text-amber-400' },
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
        {[
          { key: 'templates', label: 'Template', icon: FileText },
          { key: 'broadcast', label: 'Kirim Broadcast', icon: Send },
          { key: 'logs', label: 'Riwayat Kirim', icon: Clock },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              tab === t.key ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10'
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {tab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <div className="col-span-2 flex justify-center py-20"><Loader2 className="animate-spin text-blue-400" size={28} /></div> :
          templates.length === 0 ? <div className="col-span-2 text-center py-20 text-gray-500"><FileText size={48} className="mx-auto mb-3 opacity-30" /><p>Belum ada template.</p></div> :
          templates.map(t => {
            const tc = typeLabels[t.type] || typeLabels.custom;
            return (
              <div key={t.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{t.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${tc.color}`}>{tc.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.logs_count} pesan terkirim</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditTemplate(t)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit3 size={14} /></button>
                    <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-3 bg-black/30 rounded-xl p-3 text-sm text-gray-300 whitespace-pre-wrap font-mono text-xs max-h-32 overflow-y-auto">
                  {t.body}
                </div>
                <p className="text-[10px] text-gray-600 mt-2">Placeholder: {'{nama}'}, {'{tagihan}'}, {'{periode}'}, {'{paket}'}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Tab - inline form */}
      {tab === 'broadcast' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleBroadcast} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pilih Template</label>
              <select required value={broadcastForm.template_id} onChange={e => setBroadcastForm({ ...broadcastForm, template_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="">-- Pilih Template --</option>
                {templates.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name} ({typeLabels[t.type]?.label})</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Pilih Pelanggan ({broadcastForm.customer_ids.length} dipilih)</label>
                <button type="button" onClick={toggleSelectAll}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  {selectAll ? 'Hapus Semua' : 'Pilih Semua'}
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto bg-black/30 rounded-xl p-2 space-y-1">
                {customers.filter((c: any) => c.phone).map((c: any) => (
                  <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <input type="checkbox" checked={broadcastForm.customer_ids.includes(c.id.toString())}
                      onChange={() => toggleCustomer(c.id.toString())}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.phone}</p>
                    </div>
                  </label>
                ))}
                {customers.filter((c: any) => c.phone).length === 0 && (
                  <p className="text-center text-gray-600 py-4 text-sm">Tidak ada pelanggan dengan nomor telepon.</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={saving || broadcastForm.customer_ids.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</> : <><Send size={16} /> Kirim Broadcast ({broadcastForm.customer_ids.length} pelanggan)</>}
            </button>
          </form>
        </div>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue-400" size={28} /></div> :
          logs.length === 0 ? <div className="text-center py-20 text-gray-500"><Clock size={48} className="mx-auto mb-3 opacity-30" /><p>Belum ada riwayat pengiriman.</p></div> : (
            <div className="divide-y divide-white/5">
              {logs.map(log => {
                const sc = statusConfig[log.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
                    <StatusIcon size={18} className={sc.color} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{log.customer?.name || log.phone}</span>
                        <span className={`text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{log.message}</p>
                      {log.error_message && <p className="text-xs text-red-400 mt-0.5">{log.error_message}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-[10px] text-gray-600">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTemplateForm(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Template' : 'Template Baru'}</h2>
              <button onClick={() => setShowTemplateForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleTemplateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Template</label>
                <input required type="text" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Contoh: Reminder Tagihan Bulanan" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipe</label>
                <select value={templateForm.type} onChange={e => setTemplateForm({ ...templateForm, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="reminder">Reminder Tagihan</option>
                  <option value="payment_confirm">Konfirmasi Pembayaran</option>
                  <option value="gangguan">Info Gangguan</option>
                  <option value="welcome">Welcome</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Isi Pesan</label>
                <textarea required value={templateForm.body} onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono" rows={6}
                  placeholder="Halo {nama}, tagihan internet Anda untuk periode {periode} sebesar {tagihan} sudah jatuh tempo. Mohon segera lakukan pembayaran." />
                <p className="text-[10px] text-gray-600 mt-1">Placeholder: {'{nama}'}, {'{tagihan}'}, {'{periode}'}, {'{paket}'}</p>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={16} /> {editingId ? 'Simpan Perubahan' : 'Simpan Template'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
