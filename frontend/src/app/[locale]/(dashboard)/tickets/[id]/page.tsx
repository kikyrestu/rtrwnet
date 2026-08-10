'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, CheckCircle2, Loader2, XCircle, User,
  Send, AlertTriangle, Headphones
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  closed: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};
const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-400' },
  medium: { label: 'Medium', color: 'text-blue-400' },
  high: { label: 'High', color: 'text-amber-400' },
  critical: { label: 'Critical', color: 'text-red-400' },
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${params.id}`);
      if (res.ok) setTicket(await res.json());
    } finally { setLoading(false); }
  }, [params.id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const handleStatusChange = async (status: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchTicket();
    } finally { setUpdatingStatus(false); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      const res = await fetch(`/api/tickets/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ body: comment }),
      });
      if (res.ok) { setComment(''); fetchTicket(); }
    } finally { setSendingComment(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-blue-400" size={32} /></div>;
  if (!ticket) return <div className="text-center py-20 text-gray-500"><p>Tiket tidak ditemukan.</p></div>;

  const sc = statusConfig[ticket.status] || statusConfig.open;
  const pc = priorityConfig[ticket.priority] || priorityConfig.medium;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tickets" className="text-gray-400 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-mono">{ticket.ticket_number}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${sc.color}`}>{sc.label}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 ${pc.color}`}>{pc.label}</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">{ticket.subject}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Deskripsi</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Comments */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Komentar ({ticket.comments?.length || 0})</h3>
            
            {ticket.comments?.length > 0 ? (
              <div className="space-y-4 mb-4">
                {ticket.comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(c.user?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{c.user?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-gray-500">{new Date(c.created_at).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-sm text-gray-300">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm mb-4">Belum ada komentar.</p>
            )}

            <form onSubmit={handleComment} className="flex gap-2">
              <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Tulis komentar..."
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-600" />
              <button type="submit" disabled={sendingComment || !comment.trim()}
                className="px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl flex items-center gap-2 text-sm font-medium">
                {sendingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400">Detail Tiket</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Pelanggan</span><span className="text-white">{ticket.customer?.name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Dibuat oleh</span><span className="text-white">{ticket.creator?.name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ditugaskan ke</span><span className="text-white">{ticket.assignee?.name || 'Belum di-assign'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Kategori</span><span className="text-white capitalize">{ticket.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Dibuat</span><span className="text-white">{new Date(ticket.created_at).toLocaleDateString('id-ID')}</span></div>
              {ticket.resolved_at && <div className="flex justify-between"><span className="text-gray-500">Diselesaikan</span><span className="text-emerald-400">{new Date(ticket.resolved_at).toLocaleDateString('id-ID')}</span></div>}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Ubah Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => handleStatusChange(key)} disabled={ticket.status === key || updatingStatus}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    ticket.status === key ? cfg.color + ' opacity-100' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  } disabled:cursor-not-allowed`}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
