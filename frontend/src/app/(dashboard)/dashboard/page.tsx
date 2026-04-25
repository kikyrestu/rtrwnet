'use client';

import { useEffect, useState } from 'react';
import { api, formatRupiah } from '@/lib/api';
import { 
  Users, 
  TrendingUp, 
  Wifi, 
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-opacity-20 ${color}`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${color} bg-opacity-20`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-gray-400 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
  </div>
);

import { useRouter } from 'next/navigation';
import Swal from '@/lib/swal';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
    const router = useRouter();

    const handleRemindInvoice = async (invoiceId: string | number) => {
        const result = await Swal.fire({
            title: 'Kirim Reminder WA?',
            text: "Pesan tagihan akan dikirimkan secara otomatis lewat WhatsApp.",
            icon: 'question',
            showCancelButton: true,
            
            confirmButtonText: 'Ya, Kirim!',
            cancelButtonText: 'Batal',
            
            
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Mengirim...', allowOutsideClick: false, didOpen: () => Swal.showLoading(),   });
                await api.post(`/invoices/${invoiceId}/remind`, {});
                Swal.fire({ title: 'Terkirim!', text: 'Sukses mengirim reminder WhatsApp!', icon: 'success',   });
            } catch (err: any) {
                // err logged
                Swal.fire({ title: 'Gagal!', text: err.message || 'Terjadi kesalahan saat mengirim WA', icon: 'error',   });
            }
        }
    };

    const handlePayInvoice = async (invoiceId: string | number) => {
        const result = await Swal.fire({
            title: 'Konfirmasi Lunas?',
            text: "Tagihan pelanggan ini akan ditandai LUNAS secara permanen.",
            icon: 'warning',
            showCancelButton: true,
            
            
            confirmButtonText: 'Ya, Lunas!',
            cancelButtonText: 'Batal',
            
            
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading(),   });
                await api.post(`/invoices/${invoiceId}/pay`, {});
                // Refresh data
                const res = await api.get('/dashboard-summary');
                setData(res);
                Swal.fire({ title: 'Lunas!', text: 'Pembayaran tagihan sukses dicatat!', icon: 'success',   });
            } catch (err: any) {
                // err logged
                Swal.fire({ title: 'Gagal!', text: err.message || 'Terjadi kesalahan', icon: 'error',   });
            }
        }
    };

    useEffect(() => {
        api.get('/dashboard-summary')
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                // err logged
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
       return (
         <div className="animate-pulse space-y-6">
           <div className="h-32 bg-slate-900/50 rounded-3xl w-full border border-white/5"></div>
           <div className="h-64 bg-slate-900/50 rounded-3xl w-full border border-white/5"></div>
         </div>
       );
    }

    return (
      <div className="animate-in fade-in duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Pendapatan (Bulan ini)" 
            value={formatRupiah(data.monthly_revenue)} 
            icon={TrendingUp} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="User Aktif" 
            value={data.total_customers.toString()} 
            icon={Users} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Total Tunggakan" 
            value={formatRupiah(data.total_tunggakan)} 
            icon={AlertCircle} 
            color="bg-red-500" 
          />
          <StatCard 
            title="Paket Terlaris" 
            value={data.paket_terlaris} 
            icon={Wifi} 
            color="bg-purple-500" 
          />
        </div>

        {/* Middle Section: Chart & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Statistik Revenue</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenue_chart}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                    formatter={(val: any) => formatRupiah(Number(val))}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
            <h3 className="font-bold text-lg mb-4 text-white">Pemberitahuan Sistem</h3>
            <div className="space-y-4">
              {data.notifications.map((notif: any, i: number) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                  <div className={`p-2 rounded-lg ${notif.type === 'alert' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {notif.type === 'alert' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{notif.msg}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions / Users Table */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl">
          <div className="p-6 flex justify-between items-center border-b border-white/5">
            <h3 className="font-bold text-lg text-white">Status Pembayaran Terkini</h3>
          </div>
          <div className="overflow-x-auto min-h-[280px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Paket</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Jumlah</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recent_transactions.map((user: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-200">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{user.package}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        user.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 
                        user.status === 'Unpaid' ? 'bg-amber-500/15 text-amber-400' : 
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {user.status === 'Paid' ? <CheckCircle2 size={12} /> : user.status === 'Unpaid' ? <Clock size={12} /> : <AlertCircle size={12} />}
                        <span>{user.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {user.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">
                      {user.amount}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === idx ? null : idx);
                        }}
                        className="p-2 hover:bg-slate-700/80 rounded-lg text-slate-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <MoreVertical size={18} className="pointer-events-none" />
                      </button>
                      
                      {actionMenuOpen === idx && (
                        <>
                          <div 
                            className="fixed inset-0 z-[998]" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setActionMenuOpen(null); 
                            }} 
                          />
                          <div className="absolute right-8 top-12 w-56 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl z-[999] py-2 origin-top-right text-left animate-in fade-in zoom-in duration-200">
                            <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); handleRemindInvoice(user.id); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-2">
                              <span>💬</span> Kirim Reminder Tagihan
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); handlePayInvoice(user.id); }} className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2">
                              <span>✔️</span> Konfirmasi Lunas
                            </button>
                            <div className="h-px bg-slate-700/50 my-1 mx-2"></div>
                            <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); router.push(`/billing/invoices/${user.id}`); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-2">
                              <span>📄</span> Lihat Detail / Invoice
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}
