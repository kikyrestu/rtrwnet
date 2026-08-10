'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Receipt, Settings, Wifi, LogOut, 
  BarChart3, Network, Router, Radio, MapPin, RefreshCcw, MonitorCog,
  Package, Map, UserCog, ChevronDown, Boxes, ToggleRight,
  Ticket, Headphones, MessageCircle, ShieldOff, CreditCard,
  UserCircle, Bell, ClipboardList, Database, Languages
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';

interface MenuItem {
  name: string;
  path: string;
  icon: any;
  roles: string[];
  children?: { name: string; path: string; icon: any }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['/network', '/settings']);
  const [user, setUser] = useState<any>(null);
  const { isEnabled } = useFeatureFlags();
  const t = useTranslations('sidebar');
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const currentRole = user?.role || 'admin';

  const menuItems: MenuItem[] = [
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'technician', 'sales', 'collector'] },
    { name: t('customers'), path: '/customers', icon: Users, roles: ['admin', 'technician', 'sales'] },
    { name: t('billing'), path: '/billing', icon: Receipt, roles: ['admin', 'collector'] },
    { name: t('inventory'), path: '/inventory', icon: Boxes, roles: ['admin', 'technician'] },
    ...(isEnabled('auto_suspend') ? [{ name: t('autoIsolir'), path: '/auto-suspend', icon: ShieldOff, roles: ['admin'] }] : []),
    ...(isEnabled('payment_gateway') ? [{ name: t('paymentGateway'), path: '/payment-gateway', icon: CreditCard, roles: ['admin'] }] : []),
    ...(isEnabled('ticketing') ? [{ name: t('helpdesk'), path: '/tickets', icon: Headphones, roles: ['admin', 'technician', 'sales'] }] : []),
    ...(isEnabled('hotspot') ? [{ name: t('hotspot'), path: '/hotspot', icon: Ticket, roles: ['admin', 'sales'] }] : []),
    ...(isEnabled('whatsapp') ? [{ name: t('whatsapp'), path: '/whatsapp', icon: MessageCircle, roles: ['admin'] }] : []),
    ...(isEnabled('client_portal') ? [{ name: t('portalPelanggan'), path: '/client-portal', icon: UserCircle, roles: ['admin'] }] : []),
    ...(isEnabled('nms_alert') ? [{ name: t('nmsAlert'), path: '/nms', icon: Bell, roles: ['admin', 'technician'] }] : []),
    { name: t('reports'), path: '/reports', icon: BarChart3, roles: ['admin', 'sales', 'collector'] },
    { 
      name: t('network'), path: '/network', icon: Network, roles: ['admin', 'technician'],
      children: [
        { name: t('networkTopology'), path: '/network/map', icon: Map },
        { name: t('networkRouters'), path: '/network/routers', icon: Router },
        { name: t('networkMonitor'), path: '/network/monitor', icon: MonitorCog },
        { name: t('networkOlt'), path: '/network/olt', icon: Radio },
        { name: t('networkOdp'), path: '/network/odp', icon: MapPin },
        { name: t('networkSync'), path: '/network/sync', icon: RefreshCcw },
      ]
    },
    { 
      name: t('settings'), path: '/settings', icon: Settings, roles: ['admin'],
      children: [
        { name: t('settingsProfile'), path: '/settings/profile', icon: UserCircle },
        { name: t('settingsPackages'), path: '/settings/packages', icon: Package },
        { name: t('settingsRegions'), path: '/settings/regions', icon: Map },
        { name: t('settingsUsers'), path: '/settings/users', icon: UserCog },
        { name: t('settingsFeatures'), path: '/settings/features', icon: ToggleRight },
        { name: t('settingsAuditLogs'), path: '/settings/audit-logs', icon: ClipboardList },
        { name: t('settingsBackups'), path: '/settings/backups', icon: Database },
      ]
    },
  ];

  const toggleMenu = (path: string) => {
    setOpenMenus(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const switchLocale = () => {
    const newLocale = locale === 'id' ? 'en' : 'id';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <aside className="w-64 border-r border-white/10 p-6 flex flex-col z-20 fixed top-0 left-0 h-screen bg-black/40 backdrop-blur-xl">
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
          <Wifi className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {t('brand')}
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1 scrollbar-thin">
        {menuItems.map((item) => {
          if (!item.roles.includes(currentRole)) return null;
          
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          const isOpen = openMenus.includes(item.path);
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          
          return (
            <div key={item.path}>
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.path)}
                  className={clsx(
                    'flex items-center justify-between w-full p-3.5 cursor-pointer transition-all duration-300 rounded-xl group',
                    isActive 
                      ? 'bg-blue-600/15 text-blue-400' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} className={isActive ? 'text-blue-400' : 'group-hover:scale-110 transition-transform'} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={clsx('transition-transform duration-200', isOpen && 'rotate-180')} 
                  />
                </button>
              ) : (
                <Link 
                  href={item.path}
                  className={clsx(
                    'flex items-center space-x-3 p-3.5 cursor-pointer transition-all duration-300 rounded-xl group',
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon size={20} className={isActive ? 'text-blue-400' : 'group-hover:scale-110 transition-transform'} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              )}

              {/* Sub-menu */}
              {hasChildren && (
                <div className={clsx(
                  'overflow-hidden transition-all duration-300 ml-4 border-l border-white/5',
                  isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                )}>
                  {item.children!.map((child) => {
                    const childActive = pathname === child.path;
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={clsx(
                          'flex items-center space-x-3 p-3 pl-4 rounded-r-xl transition-all duration-200 text-sm',
                          childActive 
                            ? 'bg-blue-600/15 text-blue-400 font-medium' 
                            : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                        )}
                      >
                        <ChildIcon size={16} />
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="pt-3 border-t border-white/5">
        <button 
          onClick={switchLocale}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white border border-white/10 hover:border-white/20 transition-all text-sm font-medium group"
        >
          <Languages size={16} className="group-hover:text-blue-400 transition-colors" />
          <span className="text-xs font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
            {locale === 'id' ? 'EN' : 'ID'}
          </span>
        </button>
      </div>

      <div className="pt-3 border-t border-white/5 space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-800 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
        <button 
          onClick={async () => {
            try {
              await fetch('/api/logout', { method: 'POST', headers: { 'Accept': 'application/json' } });
            } catch {}
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
