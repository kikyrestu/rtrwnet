'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Edit3, Trash2, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  unit: string;
  description: string | null;
  items_count: number;
}

export default function InventoryCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', unit: 'pcs', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/categories');
      if (res.ok) setCategories(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/inventory/categories/${editingId}` : '/api/inventory/categories';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', unit: 'pcs', description: '' });
        fetchCategories();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, unit: cat.unit, description: cat.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus kategori ini? Semua item di dalamnya juga akan terhapus.')) return;
    const res = await fetch(`/api/inventory/categories/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
    if (res.ok) fetchCategories();
  };

  const unitOptions = [
    { value: 'pcs', label: 'Pcs (Pieces)' },
    { value: 'unit', label: 'Unit' },
    { value: 'meter', label: 'Meter' },
    { value: 'roll', label: 'Roll' },
    { value: 'buah', label: 'Buah' },
    { value: 'set', label: 'Set' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/inventory" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-violet-600/20 rounded-xl border border-violet-500/20">
                <Package className="text-violet-400" size={24} />
              </div>
              Kategori Inventaris
            </h1>
          </div>
          <p className="text-gray-400 mt-1 text-sm ml-8">Kelola kategori untuk mengelompokkan item inventaris</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ name: '', unit: 'pcs', description: '' }); setShowModal(true); }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} />
          Tambah Kategori
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-400" size={28} />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada kategori. Tambahkan kategori pertama Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-violet-600/20 rounded-xl border border-violet-500/20">
                    <Package className="text-violet-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Satuan: <span className="text-gray-300 uppercase">{cat.unit}</span></p>
                    {cat.description && <p className="text-xs text-gray-500 mt-1">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-xs text-gray-500">{cat.items_count} item terdaftar</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Kategori</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Contoh: ONT / Modem" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Satuan</label>
                <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50">
                  {unitOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deskripsi (Opsional)</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={2} />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={16} /> {editingId ? 'Simpan Perubahan' : 'Simpan Kategori'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
