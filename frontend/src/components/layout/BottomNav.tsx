'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, Receipt, Network, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('sidebar');

  const items = [
    { label: t('dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('customers'), icon: Users, path: '/customers' },
    { label: t('billing'), icon: Receipt, path: '/billing' },
    { label: t('network'), icon: Network, path: '/network' },
    { label: t('settings'), icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ label, icon: Icon, path }) => {
          const active = pathname.includes(path);
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`tap-target flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors ${
                active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium truncate max-w-[64px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
