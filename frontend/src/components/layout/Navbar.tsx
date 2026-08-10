'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Plus } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('navbar');
  
  const segment = pathname.split('/')[2] || 'dashboard';
  const titleKey = `titleMap.${segment}`;
  let title = t(titleKey as any);
  if (title === titleKey) {
    title = segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex justify-between items-center px-4 py-3 md:px-8 md:py-6 w-full z-10">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight truncate">
          {title}
        </h2>
        <p className="text-gray-400 mt-0.5 md:mt-1 text-sm md:text-base hidden sm:block">{t('greeting')}</p>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 ml-2 flex-shrink-0">
        <form onSubmit={handleSearch} className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            className="bg-white/5 border border-white/10 text-white rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/50 w-64 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <button className="bg-white/5 p-2 md:p-2.5 rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/10 transition-colors relative text-slate-200">
          <Bell size={18} className="md:w-5 md:h-5" />
          <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 bg-blue-500 rounded-full border border-black shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </button>
        <Link href="/customers/create" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl flex items-center space-x-2 font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} />
          <span className="hidden sm:inline">{t('addCustomer')}</span>
        </Link>
      </div>
    </header>
  );
}
