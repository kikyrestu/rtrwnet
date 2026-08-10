'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, Users, Receipt, Network, Settings,
  Package, Wifi, BarChart3, Headphones, MessageCircle,
  ChevronUp, X
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('sidebar');
  const [open, setOpen] = useState(false);

  const mainItems = [
    { label: t('dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('customers'), icon: Users, path: '/customers' },
    { label: t('billing'), icon: Receipt, path: '/billing' },
    { label: t('network'), icon: Network, path: '/network' },
  ];

  const moreItems = [
    { label: t('inventory'), icon: Package, path: '/inventory' },
    { label: t('hotspot'), icon: Wifi, path: '/hotspot' },
    { label: t('reports'), icon: BarChart3, path: '/reports' },
    { label: t('helpdesk'), icon: Headphones, path: '/tickets' },
    { label: t('whatsapp'), icon: MessageCircle, path: '/whatsapp' },
    { label: t('settings'), icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-up Menu — sits above the bottom bar */}
      <div className={`md:hidden fixed bottom-16 left-0 right-0 z-40 transition-all duration-300 ease-out ${
        open 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-3xl mx-3 mb-2 shadow-2xl shadow-black/50">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <button 
              onClick={() => setOpen(false)}
              className="tap-target w-10 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
            />
          </div>

          {/* More items grid */}
          <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-2">
            {moreItems.map(({ label, icon: Icon, path }) => {
              const active = pathname.includes(path);
              return (
                <button
                  key={path}
                  onClick={() => { router.push(path); setOpen(false); }}
                  className={`tap-target flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                    active 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-[11px] font-medium truncate max-w-[80px]">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {mainItems.map(({ label, icon: Icon, path }) => {
            const active = pathname.includes(path);
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`tap-target flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-200 active:scale-90 ${
                  active ? 'text-blue-400 scale-105' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium truncate max-w-[56px]">{label}</span>
              </button>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setOpen(!open)}
            className={`tap-target flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-200 active:scale-90 ${
              open ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <ChevronUp size={20} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
