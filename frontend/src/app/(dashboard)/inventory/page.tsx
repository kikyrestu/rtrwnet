'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Boxes, Plus, Search, Package, AlertTriangle, TrendingDown,
  TrendingUp, ArrowDownCircle, ArrowUpCircle, Loader2, Trash2,
  Edit3, X, ChevronRight, Filter, DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  unit: string;
  items_count: number;
}

interface Item {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  min_stock: number;
  unit_price: number;
  location: string | null;
  is_low_stock: boolean;
  category: Category;
}

interface Summary {
  total_items: number;
  total_value: number;
  low_stock_count: number;
  recent_transactions: any[];
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalType, setStockModalType] = useState<'in' | 'out'>('in');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCategory) params.set('category_id', filterCategory);
      if (filterLowStock) params.set('low_stock', 'true');

      const [itemsRes, catRes, summaryRes] = await Promise.all([
        fetch(`/api/inventory/items?${params}`),
        fetch('/api/inventory/categories'),
        fetch('/api/inventory/summary'),
      ]);

      if (itemsRes.ok) setItems(await itemsRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterLowStock]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({});
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/items/${selectedItem.id}/stock-${stockModalType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowStockModal(false);
        setFormData({});
        setSelectedItem(null);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Yakin hapus item ini?')) return;
    const res = await fetch(`/api/inventory/items/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
    if (res.ok) fetchData();
  };

  const openStockModal = (item: Item, type: 'in' | 'out') => {
    setSelectedItem(item);
    setStockModalType(type);
    setFormData({ quantity: '', reference: '', notes: '' });
    setShowStockModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/20">
              <Boxes className="text-blue-400" size={24} />
            </div>
            Inventaris
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Kelola stok perangkat dan material jaringan</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/inventory/categories"
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
          >
            <Package size={16} />
            Kategori
          </Link>
          <button
            onClick={() => { setFormData({ quantity: 0, min_stock: 5, unit_price: 0 }); setShowAddModal(true); }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            Tambah Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Item</p>
                <p className="text-2xl font-bold text-white mt-1">{summary.total_items}</p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-xl"><Boxes className="text-blue-400" size={22} /></div>
            </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Nilai Stok</p>
                <p className="text-2xl font-bold text-white mt-1">Rp {summary.total_value.toLocaleString('id-ID')}</p>
              </div>
              <div className="p-3 bg-emerald-600/20 rounded-xl"><DollarSign className="text-emerald-400" size={22} /></div>
            </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Stok Menipis</p>
                <p className="text-2xl font-bold text-white mt-1">{summary.low_stock_count}</p>
              </div>
              <div className="p-3 bg-red-600/20 rounded-xl"><AlertTriangle className="text-red-400" size={22} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari item atau SKU..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-600"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 border transition-all ${
            filterLowStock
              ? 'bg-red-500/20 border-red-500/30 text-red-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
          }`}
        >
          <AlertTriangle size={14} />
          Stok Menipis
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-400" size={28} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Boxes size={48} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada item inventaris.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left p-4">Item</th>
                  <th className="text-left p-4">Kategori</th>
                  <th className="text-center p-4">Stok</th>
                  <th className="text-right p-4">Harga Satuan</th>
                  <th className="text-right p-4">Total Nilai</th>
                  <th className="text-center p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <Link href={`/inventory/${item.id}`} className="hover:text-blue-400 transition-colors">
                        <p className="text-white font-medium">{item.name}</p>
                        {item.sku && <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>}
                        {item.location && <p className="text-xs text-gray-600 mt-0.5">📍 {item.location}</p>}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300">
                        {item.category?.name}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${item.is_low_stock ? 'text-red-400' : 'text-white'}`}>
                          {item.quantity}
                        </span>
                        {item.is_low_stock && (
                          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-md uppercase">
                            Low
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-600 mt-0.5">Min: {item.min_stock}</p>
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      Rp {Number(item.unit_price).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-right text-white font-medium">
                      Rp {(item.quantity * Number(item.unit_price)).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openStockModal(item, 'in')}
                          title="Stok Masuk"
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                          <ArrowDownCircle size={16} />
                        </button>
                        <button
                          onClick={() => openStockModal(item, 'out')}
                          title="Stok Keluar"
                          className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        >
                          <ArrowUpCircle size={16} />
                        </button>
                        <Link
                          href={`/inventory/${item.id}`}
                          title="Detail"
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <ChevronRight size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Hapus"
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Tambah Item Baru</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                <select
                  required
                  value={formData.category_id || ''}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Item</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Contoh: ONT Huawei HG8245H5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SKU (Opsional)</label>
                  <input type="text" value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="SKU-001" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Lokasi (Opsional)</label>
                  <input type="text" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Gudang A" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stok Awal</label>
                  <input required type="number" min="0" value={formData.quantity ?? 0} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min. Stok</label>
                  <input required type="number" min="0" value={formData.min_stock ?? 5} onChange={e => setFormData({ ...formData, min_stock: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga Satuan</label>
                  <input required type="number" min="0" value={formData.unit_price ?? 0} onChange={e => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={16} /> Simpan Item</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stock In/Out Modal */}
      {showStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStockModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {stockModalType === 'in' ? (
                  <><ArrowDownCircle size={20} className="text-emerald-400" /> Stok Masuk</>
                ) : (
                  <><ArrowUpCircle size={20} className="text-amber-400" /> Stok Keluar</>
                )}
              </h2>
              <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Item: <span className="text-white font-medium">{selectedItem.name}</span> (Stok saat ini: <span className="text-white">{selectedItem.quantity}</span>)
            </p>
            <form onSubmit={handleStock} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Jumlah</label>
                <input required type="number" min="1" value={formData.quantity || ''} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Masukkan jumlah" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Referensi (Opsional)</label>
                <input type="text" value={formData.reference || ''} onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder={stockModalType === 'out' ? 'Contoh: Instalasi Customer #123' : 'Contoh: Pembelian dari Toko ABC'} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Catatan (Opsional)</label>
                <textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={2} />
              </div>
              <button type="submit" disabled={saving}
                className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-white ${
                  stockModalType === 'in' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                } ${saving ? 'opacity-50' : ''}`}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : stockModalType === 'in' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                {saving ? 'Memproses...' : stockModalType === 'in' ? 'Tambah Stok' : 'Kurangi Stok'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
