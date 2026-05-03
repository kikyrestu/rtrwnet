'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, ArrowDownCircle, ArrowUpCircle,
  Loader2, Clock, User, Edit3, AlertTriangle, RotateCcw
} from 'lucide-react';

interface Transaction {
  id: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
  performer: { name: string } | null;
}

interface Item {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  min_stock: number;
  unit_price: number;
  location: string | null;
  notes: string | null;
  is_low_stock: boolean;
  category: { id: number; name: string; unit: string };
  transactions: Transaction[];
}

export default function InventoryDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/items/${params.id}`);
      if (res.ok) setItem(await res.json());
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Package size={48} className="mx-auto mb-3 opacity-30" />
        <p>Item tidak ditemukan.</p>
        <Link href="/inventory" className="text-blue-400 hover:underline text-sm mt-2 inline-block">← Kembali ke Inventaris</Link>
      </div>
    );
  }

  const typeConfig = {
    in: { label: 'Masuk', icon: ArrowDownCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    out: { label: 'Keluar', icon: ArrowUpCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    adjustment: { label: 'Penyesuaian', icon: RotateCcw, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{item.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{item.category.name} • {item.sku ? `SKU: ${item.sku}` : 'Tanpa SKU'}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Stok Saat Ini</p>
          <div className="flex items-center gap-2 mt-2">
            <p className={`text-3xl font-bold ${item.is_low_stock ? 'text-red-400' : 'text-white'}`}>{item.quantity}</p>
            <span className="text-sm text-gray-500">{item.category.unit}</span>
          </div>
          {item.is_low_stock && (
            <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
              <AlertTriangle size={12} />
              Di bawah minimum ({item.min_stock})
            </div>
          )}
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Min. Stok</p>
          <p className="text-3xl font-bold text-white mt-2">{item.min_stock}</p>
          <p className="text-xs text-gray-500 mt-1">{item.category.unit}</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Harga Satuan</p>
          <p className="text-xl font-bold text-white mt-2">Rp {Number(item.unit_price).toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-500 mt-1">per {item.category.unit}</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Nilai</p>
          <p className="text-xl font-bold text-emerald-400 mt-2">Rp {(item.quantity * Number(item.unit_price)).toLocaleString('id-ID')}</p>
          {item.location && <p className="text-xs text-gray-500 mt-1">📍 {item.location}</p>}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Riwayat Transaksi
          </h2>
        </div>

        {item.transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada transaksi untuk item ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {item.transactions.map((tx) => {
              const config = typeConfig[tx.type];
              const TxIcon = config.icon;
              const date = new Date(tx.created_at);

              return (
                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`p-2 rounded-xl border ${config.bg}`}>
                    <TxIcon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${config.color}`}>
                        {tx.type === 'in' ? '+' : tx.type === 'out' ? '-' : '~'}{tx.quantity} {item.category.unit}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    {tx.reference && <p className="text-xs text-gray-400 mt-0.5">{tx.reference}</p>}
                    {tx.notes && <p className="text-xs text-gray-500 mt-0.5 italic">{tx.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-600">
                      {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {tx.performer && (
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <User size={10} className="text-gray-600" />
                        <span className="text-[10px] text-gray-600">{tx.performer.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
