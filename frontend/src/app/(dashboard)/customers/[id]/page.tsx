'use client';

import { useEffect, useState } from 'react';
import Swal from '@/lib/swal';
import { useParams, useRouter } from 'next/navigation';
import { api, formatRupiah } from '@/lib/api';
import LocationPicker from '@/components/ui/LocationPicker';
import { 
  User, Phone, MapPin, Wifi, Package, Router, ArrowLeft, 
  Edit, Trash2, CheckCircle2, Clock, AlertCircle, Save, X, Activity, RefreshCw, Key
} from 'lucide-react';
import Link from 'next/link';

interface CustomerDetail {
  id: number;
  name: string;
  nik: string | null;
  phone: string;
  address: string;
  status: string;
  mikrotik_username: string;
  mikrotik_password: string;
  billing_cycle_date: number;
  latitude: string | null;
  longitude: string | null;
  package_id: number | null;
  router_id: number | null;
  dp_id: number | null;
  dp_port_number: string | null;
  region_id: number | null;
  ont_merk: string | null;
  ont_sn: string | null;
  package?: { id: number; name: string; price: number; rate_limit: string };
  router?: { id: number; name: string; host: string };
  dp?: { id: number; name: string };
  region?: { id: number; name: string };
  invoices?: Invoice[];
}

interface Invoice {
  id: number;
  amount: number;
  billing_period: string;
  due_date: string;
  status: string;
  paid_at: string | null;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<any>({ packages: [], routers: [], regions: [], dps: [] });
  const [acsStatus, setAcsStatus] = useState<any>(null);
  const [acsLoading, setAcsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/customers/${id}`),
      api.get('/form-options'),
    ])
      .then(([cust, opts]) => {
        setCustomer(cust);
        setOptions(opts);
        setForm({
          name: cust.name,
          nik: cust.nik || '',
          phone: cust.phone || '',
          address: cust.address || '',
          status: cust.status,
          mikrotik_username: cust.mikrotik_username || '',
          mikrotik_password: cust.mikrotik_password || '',
          billing_cycle_date: String(cust.billing_cycle_date || 1),
          package_id: cust.package_id ? String(cust.package_id) : '',
          router_id: cust.router_id ? String(cust.router_id) : '',
          dp_id: cust.dp_id ? String(cust.dp_id) : '',
          dp_port_number: cust.dp_port_number || '',
          region_id: cust.region_id ? String(cust.region_id) : '',
          ont_merk: cust.ont_merk || '',
          ont_sn: cust.ont_sn || '',
          latitude: cust.latitude || '',
          longitude: cust.longitude || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const fetchAcsStatus = async () => {
    if (!customer?.ont_sn) return;
    setAcsLoading(true);
    try {
      const res = await api.get(`/acs/device/${id}`);
      setAcsStatus(res);
    } catch (err) {
      console.error("ACS Error", err);
    } finally {
      setAcsLoading(false);
    }
  };

  useEffect(() => {
    if (customer && customer.ont_sn) {
      fetchAcsStatus();
    }
  }, [customer?.ont_sn]);

  const handleAcsReboot = async () => {
    if (!confirm('Reboot perangkat ONT pelanggan? Jaringan akan mati selama 1-2 menit.')) return;
    try {
      Swal.fire({ title: 'Mengirim Perintah...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await api.post(`/acs/device/${id}/reboot`);
      Swal.fire({ title: 'Berhasil', text: res.message, icon: 'success' });
    } catch (err: any) {
      Swal.fire({ text: err.message || 'Gagal reboot', icon: 'error' });
    }
  };

  const handleAcsWifi = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Ganti WiFi & Password',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nama WiFi (SSID)">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Password Baru" type="password">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const ssid = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const pass = (document.getElementById('swal-input2') as HTMLInputElement).value;
        if (!ssid || pass.length < 8) {
          Swal.showValidationMessage('SSID wajib diisi dan Password minimal 8 karakter');
          return false;
        }
        return { ssid, password: pass };
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'Memproses Provisioning...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await api.put(`/acs/device/${id}/wifi`, formValues);
        Swal.fire({ title: 'Berhasil', text: res.message, icon: 'success' });
      } catch (err: any) {
        Swal.fire({ text: err.message || 'Gagal mengubah WiFi', icon: 'error' });
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        billing_cycle_date: Number(form.billing_cycle_date),
        package_id: form.package_id ? Number(form.package_id) : null,
        router_id: form.router_id ? Number(form.router_id) : null,
        dp_id: form.dp_id ? Number(form.dp_id) : null,
        region_id: form.region_id ? Number(form.region_id) : null,
      };
      const updated = await api.put(`/customers/${id}`, payload);
      setCustomer({ ...customer, ...updated });
      setEditing(false);
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin hapus pelanggan ini? Data terkait juga akan terhapus.')) return;
    try {
      await api.delete(`/customers/${id}`);
      router.push('/customers');
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
  };

  const handlePay = async (invoiceId: number) => {
    if (!confirm('Konfirmasi pembayaran tagihan ini?')) return;
    try {
      await api.post(`/invoices/${invoiceId}/pay`);
      const updated = await api.get(`/customers/${id}`);
      setCustomer(updated);
    } catch (err: any) { Swal.fire({text: err.message,   icon: 'info'}); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'Aktif' },
      isolated: { cls: 'bg-red-500/15 text-red-400 border-red-500/20', label: 'Isolir' },
      inactive: { cls: 'bg-gray-500/15 text-gray-400 border-gray-500/20', label: 'Nonaktif' },
    };
    return map[status] || map.inactive;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 bg-slate-900/50 rounded-xl border border-white/5" />
        <div className="h-64 bg-slate-900/50 rounded-3xl border border-white/5" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Pelanggan tidak ditemukan.</p>
        <Link href="/customers" className="text-blue-400 hover:underline mt-4 inline-block">← Kembali</Link>
      </div>
    );
  }

  const badge = statusBadge(customer.status);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/customers" className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xl">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${badge.cls}`}>{badge.label}</span>
              <span className="text-sm text-gray-500 font-mono">@{customer.mikrotik_username}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)}
            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold border border-blue-500/20 transition-all">
            <Edit size={16} />{editing ? 'Batal Edit' : 'Edit'}
          </button>
          <button onClick={handleDelete}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold border border-red-500/20 transition-all">
            <Trash2 size={16} />Hapus
          </button>
        </div>
      </div>

      {/* Info Cards or Edit Form */}
      {editing ? (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-white mb-2">Edit Data Pelanggan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nama</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">NIK</label>
              <input type="text" value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">No. HP</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Alamat</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username PPPoE</label>
              <input type="text" value={form.mikrotik_username} onChange={e => setForm({ ...form, mikrotik_username: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password PPPoE</label>
              <input type="text" value={form.mikrotik_password} onChange={e => setForm({ ...form, mikrotik_password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Paket</label>
              <select value={form.package_id} onChange={e => setForm({ ...form, package_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                <option value="">-- Pilih --</option>
                {(options.packages || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Router</label>
              <select value={form.router_id} onChange={e => setForm({ ...form, router_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                <option value="">-- Pilih --</option>
                {(options.routers || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">ODP</label>
              <select value={form.dp_id} onChange={e => setForm({ ...form, dp_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                <option value="">-- Pilih --</option>
                {(options.distribution_points || options.odps || []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Port ODP</label>
              <input type="number" min={1} max={32} value={form.dp_port_number} onChange={e => setForm({ ...form, dp_port_number: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Wilayah</label>
              <select value={form.region_id} onChange={e => setForm({ ...form, region_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                <option value="">-- Pilih --</option>
                {(options.regions || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                <option value="active">Aktif</option>
                <option value="isolated">Isolir</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tanggal Billing</label>
              <input type="number" min={1} max={28} value={form.billing_cycle_date} onChange={e => setForm({ ...form, billing_cycle_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Merk Modem / Router</label>
              <input type="text" value={form.ont_merk} onChange={e => setForm({ ...form, ont_merk: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="ZTE / Huawei / TP-Link" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Serial Number Modem</label>
              <input type="text" value={form.ont_sn} onChange={e => setForm({ ...form, ont_sn: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono" placeholder="SN/MAC Address" />
            </div>
          </div>
          
          <div className="mt-4">
            <LocationPicker 
              initialLat={form.latitude} 
              initialLng={form.longitude} 
              onLocationSelect={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-medium">
              <X size={16} className="inline mr-1" />Batal
            </button>
            <button onClick={handleSave} disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-blue-600/20">
              <Save size={16} />{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Info Pelanggan</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3"><User size={16} className="text-blue-400" /><span className="text-slate-300">{customer.name}</span></div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-blue-400" /><span className="text-slate-300">{customer.phone || '-'}</span></div>
              <div className="flex items-start gap-3"><MapPin size={16} className="text-blue-400 mt-0.5" /><span className="text-slate-300">{customer.address || '-'}</span></div>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Info Layanan</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3"><Package size={16} className="text-violet-400" /><span className="text-slate-300">{customer.package?.name || '-'} {customer.package?.price ? `(${formatRupiah(customer.package.price)}/bln)` : ''}</span></div>
              <div className="flex items-center gap-3"><Router size={16} className="text-cyan-400" /><span className="text-slate-300">{customer.router?.name || '-'}</span></div>
              <div className="flex items-center gap-3"><MapPin size={16} className="text-teal-400" /><span className="text-slate-300">ODP: {customer.dp?.name || '-'}</span></div>
              <div className="flex items-center gap-3"><Wifi size={16} className="text-blue-400" /><span className="text-slate-300 font-mono text-sm">PPPoE: {customer.mikrotik_username}</span></div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-sm z-10">
               <div><span className="text-gray-500 block mb-1 text-xs">Merk Modem/Router</span><strong className="text-gray-300">{customer.ont_merk || '-'}</strong></div>
               <div><span className="text-gray-500 block mb-1 text-xs">Serial Number</span><strong className="text-gray-300 font-mono">{customer.ont_sn || '-'}</strong></div>
            </div>
          </div>
          
          {/* ACS TR-069 Card */}
          {customer.ont_sn && (
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-md border border-indigo-500/20 p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} /> Manajemen ONT (GenieACS TR-069)
                </h3>
                <button onClick={fetchAcsStatus} disabled={acsLoading} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  <RefreshCw size={16} className={acsLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {acsLoading && !acsStatus ? (
                <div className="text-center py-4 text-gray-500 text-sm animate-pulse">Menghubungi GenieACS...</div>
              ) : acsStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-xs text-gray-400 mb-1">Redaman (Rx/Tx)</p>
                    <p className="text-xl font-bold text-white">
                      <span className={acsStatus.optical_rx < -25 ? 'text-red-400' : 'text-emerald-400'}>{acsStatus.optical_rx}</span>
                      <span className="text-gray-500 text-sm font-normal mx-1">/</span>
                      <span className="text-blue-400 text-sm">{acsStatus.optical_tx}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">dBm</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-xs text-gray-400 mb-1">Uptime</p>
                    <p className="text-xl font-bold text-white">{acsStatus.uptime}</p>
                    <p className="text-[10px] text-emerald-400 mt-1 uppercase font-bold tracking-wider">{acsStatus.status}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-center gap-2">
                    <button onClick={handleAcsReboot} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-colors flex items-center justify-center gap-2">
                      <RefreshCw size={12} /> Reboot Modem
                    </button>
                    <button onClick={handleAcsWifi} className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl border border-indigo-500/20 transition-colors flex items-center justify-center gap-2">
                      <Key size={12} /> Ganti WiFi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-red-400 text-sm">Gagal mengambil data dari ACS</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Invoice History */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-bold text-lg text-white">Riwayat Tagihan</h3>
        </div>
        {!customer.invoices || customer.invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada tagihan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Periode</th>
                  <th className="px-6 py-3 font-semibold">Jatuh Tempo</th>
                  <th className="px-6 py-3 font-semibold">Nominal</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customer.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-300">{inv.billing_period}</td>
                    <td className="px-6 py-3 text-sm text-slate-400">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-3 font-bold text-slate-200">{formatRupiah(inv.amount)}</td>
                    <td className="px-6 py-3">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit border ${
                        inv.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      }`}>
                        {inv.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {inv.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {inv.status === 'unpaid' && (
                        <button onClick={() => handlePay(inv.id)}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/20">
                          Bayar
                        </button>
                      )}
                      {inv.status === 'paid' && inv.paid_at && (
                        <span className="text-xs text-gray-500">{new Date(inv.paid_at).toLocaleDateString('id-ID')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
