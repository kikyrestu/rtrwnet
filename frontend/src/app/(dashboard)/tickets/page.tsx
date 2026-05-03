'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Headphones, Plus, Search, AlertTriangle, Clock, CheckCircle2,
  XCircle, Loader2, User, ChevronRight, X, MessageSquare, Filter
} from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  customer: { id: number; name: string } | null;
  assignee: { id: number; name: string } | null;
  creator: { id: number; name: string } | null;
}

interface Summary {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  critical: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Loader2 },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-500/20 text-gray-400' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  high: { label: 'High', color: 'bg-amber-500/20 text-amber-400' },
  critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400' },
};

const categoryLabels: Record<string, string> = {
  gangguan: 'Gangguan',
  permintaan: 'Permintaan',
  informasi: 'Informasi',
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    category: 'gangguan', priority: 'medium', subject: '', description: '',
    customer_id: '', assigned_to: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterPriority !== 'all') params.set('priority', filterPriority);

      const [ticketRes, summaryRes] = await Promise.all([
        fetch(`/api/tickets?${params}`),
        fetch('/api/tickets/summary'),
      ]);
      if (ticketRes.ok) setTickets(await ticketRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, filterStatus, filterPriority]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    Promise.all([fetch('/api/customers'), fetch('/api/users')])
      .then(async ([cRes, uRes]) => {
        if (cRes.ok) setCustomers(await cRes.json());
        if (uRes.ok) setUsers(await uRes.json());
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ category: 'gangguan', priority: 'medium', subject: '', description: '', customer_id: '', assigned_to: '' });
        fetchData();
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-violet-600/20 rounded-xl border border-violet-500/20">
              <Headphones className="text-violet-400" size={24} />
            </div>
            Helpdesk & Tiket
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Kelola laporan gangguan dan permintaan pelanggan</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <Plus size={16} /> Buat Tiket
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Open', value: summary.open, color: 'text-blue-400' },
            { label: 'In Progress', value: summary.in_progress, color: 'text-amber-400' },
            { label: 'Resolved', value: summary.resolved, color: 'text-emerald-400' },
            { label: 'Closed', value: summary.closed, color: 'text-gray-400' },
            { label: 'Critical', value: summary.critical, color: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari tiket..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-600" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none">
          <option value="all">Semua Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none">
          <option value="all">Semua Prioritas</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue-400" size={28} /></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Headphones size={48} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada tiket.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {tickets.map((ticket) => {
              const sc = statusConfig[ticket.status] || statusConfig.open;
              const pc = priorityConfig[ticket.priority] || priorityConfig.medium;
              const StatusIcon = sc.icon;
              return (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <div className={`p-2 rounded-xl border ${sc.color}`}>
                    <StatusIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono">{ticket.ticket_number}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${sc.color}`}>{sc.label}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${pc.color}`}>{pc.label}</span>
                      <span className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-gray-400">{categoryLabels[ticket.category]}</span>
                    </div>
                    <p className="text-white font-medium text-sm mt-1 truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {ticket.customer && <span>👤 {ticket.customer.name}</span>}
                      {ticket.assignee && <span>🔧 {ticket.assignee.name}</span>}
                      <span>{new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Buat Tiket Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                  <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="gangguan">Gangguan</option>
                    <option value="permintaan">Permintaan</option>
                    <option value="informasi">Informasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prioritas</label>
                  <select required value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pelanggan (Opsional)</label>
                <select value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Assign ke Teknisi (Opsional)</label>
                <select value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="">-- Belum di-assign --</option>
                  {users.filter((u: any) => u.role === 'technician' || u.role === 'admin').map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subjek</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Internet lambat, tidak bisa connect, dll" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={3} placeholder="Jelaskan detail masalahnya..." />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={16} /> Buat Tiket</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
