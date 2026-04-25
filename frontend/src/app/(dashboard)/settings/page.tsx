'use client';

import Link from 'next/link';
import { Package, Map, UserCog, Settings, ArrowRight } from 'lucide-react';

export default function SettingsDashboard() {
  const menus = [
    {
      title: 'Paket Internet',
      desc: 'Kelola varian layanan internet, harga, dan batasan profil bandwidth Mikrotik.',
      href: '/settings/packages',
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      title: 'Wilayah (Area)',
      desc: 'Pengaturan pemetaan geografis dan pembagian zona operasional untuk pelanggan teknisi.',
      href: '/settings/regions',
      icon: Map,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Pengguna & RBAC',
      desc: 'Manajemen hak akses admin, kolektor, teknisi lapangan, dan staf operasional lainnya.',
      href: '/settings/users',
      icon: UserCog,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-500" />
          Master Data & Pengaturan
        </h1>
        <p className="text-slate-400">Pusat kontrol konfigurasi inti sistem, paket, wilayah operasional, dan manajemen akses pengguna (RBAC).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {menus.map((item, idx) => (
          <Link key={idx} href={item.href} className="group block h-full">
            <div className={`h-full p-6 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden flex flex-col shadow-lg shadow-black/20 hover:shadow-blue-500/10`}>
              {/* decorative glowing circle behind the card */}
              <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${item.bg} blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg} ${item.border} border mb-6 relative z-10`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors relative z-10">
                {item.title}
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed flex-grow relative z-10 font-medium">
                {item.desc}
              </p>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-blue-500 font-semibold text-sm group-hover:text-blue-400 transition-colors relative z-10">
                <span>Kelola Master Data</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Decorative background bottom blur */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}