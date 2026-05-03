'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Swal from '@/lib/swal';
import { Database, Download, Trash2, Plus, Loader2, HardDrive, Clock } from 'lucide-react';

interface BackupFile {
  name: string;
  size: string;
  date: string;
  path: string;
}

export default function DatabaseBackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backups');
      setBackups(res);
    } catch (err) {
      // err logged
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/backups', {});
      Swal.fire({ text: 'Backup berhasil dibuat!', icon: 'success' });
      fetchBackups();
    } catch (err: any) {
      Swal.fire({ text: err.message || 'Gagal membuat backup', icon: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (filename: string) => {
    window.open(`http://127.0.0.1:8000/api/backups/${filename}/download`, '_blank');
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Hapus backup ${filename}?`)) return;
    try {
      await api.delete(`/backups/${filename}`);
      fetchBackups();
    } catch (err) {
      // err logged
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-fuchsia-500/10">
            <Database className="text-fuchsia-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Database Backup & Restore</h1>
            <p className="text-sm text-gray-400">Cadangkan seluruh data transaksi, tagihan, dan pengaturan pelanggan</p>
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-fuchsia-600/50 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-fuchsia-600/20 transition-all active:scale-95"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          <span>{generating ? 'Mencadangkan...' : 'Buat Backup Baru'}</span>
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex justify-center text-gray-500"><Loader2 className="animate-spin text-fuchsia-400" size={32} /></div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada file backup database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama File Backup</th>
                  <th className="px-6 py-4 font-semibold">Ukuran</th>
                  <th className="px-6 py-4 font-semibold">Tanggal Dibuat</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {backups.map((file, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Database size={16} /></div>
                        {file.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="flex items-center gap-1.5"><HardDrive size={14} /> {file.size}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="flex items-center gap-1.5"><Clock size={14} /> {file.date}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDownload(file.name)}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-1"
                        >
                          <Download size={14} /> Download
                        </button>
                        <button
                          onClick={() => handleDelete(file.name)}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-red-500/20 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
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

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-sm text-amber-200/80">
        <div className="mt-0.5 text-amber-400"><Database size={18} /></div>
        <div>
          <strong className="text-amber-400 block mb-1">Catatan Penting:</strong>
          File backup mengandung seluruh data rahasia pelanggan, tagihan, dan pengaturan sistem. Pastikan untuk mengunduh dan menyimpan file `.sql` ini di tempat yang sangat aman secara berkala (misal: di Google Drive atau HDD Eksternal). Untuk melakukan restore, gunakan tool seperti phpMyAdmin atau import command di MySQL console.
        </div>
      </div>
    </div>
  );
}
