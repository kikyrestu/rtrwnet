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
  Clock,
  Receipt
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
import { useRouter } from 'next/navigation';
import Swal from '@/lib/swal';
import { useTranslations } from 'next-intl';

const colorMap: Record<string, { bg: string; text: string }> = {
  'bg-blue-500': { bg: 'bg-blue-500/20', text: 'text-blue-500' },
  'bg-emerald-500': { bg: 'bg-emerald-500/20', text: 'text-emerald-500' },
  'bg-red-500': { bg: 'bg-red-500/20', text: 'text-red-500' },
  'bg-purple-500': { bg: 'bg-purple-500/20', text: 'text-purple-500' },
  'bg-amber-500': { bg: 'bg-amber-500/20', text: 'text-amber-500' },
};

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
  const colors = colorMap[color] || { bg: 'bg-white/10', text: 'text-white' };
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 md:p-6 rounded-3xl transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors.bg}`}>
          <Icon className={colors.text} size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  );
};

const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return '0';
    if (tickItem >= 1000000) return `Rp ${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `Rp ${(tickItem / 1000).toFixed(0)}K`;
    return `Rp ${tickItem}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-blue-500/30 p-3 rounded-xl shadow-xl shadow-blue-500/10">
        <p className="text-gray-400 text-xs mb-1 font-medium">{label}</p>
        <p className="text-white font-bold text-lg">
          {formatRupiah(Number(payload[0].value))}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
    const router = useRouter();
    const t = useTranslations('dashboard');

    const handleRemindInvoice = async (invoiceId: string | number) => {
        const result = await Swal.fire({
            title: t('reminderTitle'),
            text: t('reminderText'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: t('reminderConfirm'),
            cancelButtonText: t('reminderCancel'),
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({ title: t('reminderSending'), allowOutsideClick: false, didOpen: () => Swal.showLoading(),   });
                await api.post(`/invoices/${invoiceId}/remind`, {});
                Swal.fire({ title: t('reminderSent'), text: t('reminderSentText'), icon: 'success',   });
            } catch (err: any) {
                Swal.fire({ title: t('reminderFailed'), text: err.message || t('reminderFailedText'), icon: 'error',   });
            }
        }
    };

    const handlePayInvoice = async (invoiceId: string | number) => {
        const result = await Swal.fire({
            title: t('payTitle'),
            text: t('payText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('payConfirm'),
            cancelButtonText: t('payCancel'),
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({ title: t('payProcessing'), allowOutsideClick: false, didOpen: () => Swal.showLoading(),   });
                await api.post(`/invoices/${invoiceId}/pay`, {});
                const res = await api.get('/dashboard-summary');
                setData(res);
                Swal.fire({ title: t('paySuccess'), text: t('paySuccessText'), icon: 'success',   });
            } catch (err: any) {
                Swal.fire({ title: t('payFailed'), text: err.message || t('payFailedText'), icon: 'error',   });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title={t('totalRevenue')} 
            value={formatRupiah(data.monthly_revenue)} 
            icon={TrendingUp} 
            color="bg-blue-500" 
          />
          <StatCard 
            title={t('activeUsers')} 
            value={data.total_customers.toString()} 
            icon={Users} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title={t('totalArrears')} 
            value={formatRupiah(data.total_tunggakan)} 
            icon={AlertCircle} 
            color="bg-red-500" 
          />
          <StatCard 
            title={t('bestPackage')} 
            value={data.paket_terlaris} 
            icon={Wifi} 
            color="bg-purple-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">{t('revenueStats')}</h3>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenue_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)"
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2, className: "animate-pulse" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
            <h3 className="font-bold text-lg mb-4 text-white">{t('systemNotifications')}</h3>
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

        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl">
          <div className="p-6 flex justify-between items-center border-b border-white/5">
            <h3 className="font-bold text-lg text-white">{t('paymentStatus')}</h3>
          </div>
          <div className="overflow-x-auto min-h-[280px]">
            <table className="responsive-table w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">{t('customerName')}</th>
                  <th className="px-6 py-4 font-semibold">{t('package')}</th>
                  <th className="px-6 py-4 font-semibold">{t('status')}</th>
                  <th className="px-6 py-4 font-semibold">{t('date')}</th>
                  <th className="px-6 py-4 font-semibold">{t('amount')}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(!data.recent_transactions || data.recent_transactions.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-white/5">
                          <Receipt className="text-gray-600" size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">{t('noTransactions')}</p>
                        <p className="text-gray-600 text-sm">{t('noTransactionsDesc')}</p>
                      </div>
                    </td>
                  </tr>
                ) : data.recent_transactions.map((user: any, idx: number) => (
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
                          <div className="fixed inset-0 z-[998]" onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); }} />
                          <div className="absolute right-8 top-12 w-56 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl z-[999] py-2 origin-top-right text-left animate-in fade-in zoom-in duration-200">
                            <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); handleRemindInvoice(user.id); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-2">
                              <span>💬</span> {t('sendReminder')}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); handlePayInvoice(user.id); }} className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2">
                              <span>✔️</span> {t('confirmPaid')}
                            </button>
                            <div className="h-px bg-slate-700/50 my-1 mx-2"></div>
                            <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); router.push(`/billing/invoices/${user.id}`); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-2">
                              <span>📄</span> {t('viewDetail')}
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
