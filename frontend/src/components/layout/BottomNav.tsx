'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { 
  LayoutDashboard, Users, Receipt, Network, Settings,
  Package, Wifi, BarChart3, Headphones, MessageCircle,
  ChevronUp, ChevronDown,
  // Network children
  Map, Router, MonitorCog, Radio, MapPin, RefreshCcw,
  // Settings children
  UserCircle, UserCog, ToggleRight, ClipboardList, Database,
  // Feature-flagged modules
  ShieldOff, CreditCard, Bell, Ticket,
  // Language
  Languages
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: any;
  path: string;
}

interface NavSection {
  label: string;
  icon: any;
  children: NavItem[];
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('sidebar');
  const { isEnabled } = useFeatureFlags();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // === Bottom bar items (always visible) ===
  const mainItems: NavItem[] = [
    { label: t('dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('customers'), icon: Users, path: '/customers' },
    { label: t('billing'), icon: Receipt, path: '/billing' },
  ];

  // === More panel: flat items ===
  const moreItems: NavItem[] = [
    { label: t('inventory'), icon: Package, path: '/inventory' },
    { label: t('reports'), icon: BarChart3, path: '/reports' },
    // Feature-flagged modules
    ...(isEnabled('ticketing') ? [{ label: t('helpdesk'), icon: Headphones, path: '/tickets' }] : []),
    ...(isEnabled('hotspot') ? [{ label: t('hotspot'), icon: Wifi, path: '/hotspot' }] : []),
    ...(isEnabled('whatsapp') ? [{ label: t('whatsapp'), icon: MessageCircle, path: '/whatsapp' }] : []),
    ...(isEnabled('auto_suspend') ? [{ label: t('autoIsolir'), icon: ShieldOff, path: '/auto-suspend' }] : []),
    ...(isEnabled('payment_gateway') ? [{ label: t('paymentGateway'), icon: CreditCard, path: '/payment-gateway' }] : []),
    ...(isEnabled('client_portal') ? [{ label: t('portalPelanggan'), icon: UserCircle, path: '/client-portal' }] : []),
    ...(isEnabled('nms_alert') ? [{ label: t('nmsAlert'), icon: Bell, path: '/nms' }] : []),
  ];

  // === More panel: sections with children ===
  const sections: NavSection[] = [
    {
      label: t('network'),
      icon: Network,
      children: [
        { label: t('networkTopology'), icon: Map, path: '/network/map' },
        { label: t('networkRouters'), icon: Router, path: '/network/routers' },
        { label: t('networkMonitor'), icon: MonitorCog, path: '/network/monitor' },
        { label: t('networkOlt'), icon: Radio, path: '/network/olt' },
        { label: t('networkOdp'), icon: MapPin, path: '/network/odp' },
        { label: t('networkSync'), icon: RefreshCcw, path: '/network/sync' },
      ],
    },
    {
      label: t('settings'),
      icon: Settings,
      children: [
        { label: t('settingsProfile'), icon: UserCircle, path: '/settings/profile' },
        { label: t('settingsPackages'), icon: Package, path: '/settings/packages' },
        { label: t('settingsRegions'), icon: Map, path: '/settings/regions' },
        { label: t('settingsUsers'), icon: UserCog, path: '/settings/users' },
        { label: t('settingsFeatures'), icon: ToggleRight, path: '/settings/features' },
        { label: t('settingsAuditLogs'), icon: ClipboardList, path: '/settings/audit-logs' },
        { label: t('settingsBackups'), icon: Database, path: '/settings/backups' },
      ],
    },
  ];

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isSectionActive = (section: NavSection) =>
    section.children.some(c => pathname.includes(c.path));

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

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
        <div className="bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-3xl mx-3 mb-2 shadow-2xl shadow-black/50 max-h-[70vh] flex flex-col">
          {/* Header with logo */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg p-1 flex-shrink-0">
                <img src="/logo-buildyweb.png" alt="BuildyWeb" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-sm font-bold text-white">Menu</span>
            </div>
            <button
              onClick={() => {
                const newLocale = locale === 'id' ? 'en' : 'id';
                router.replace(pathname, { locale: newLocale });
                setOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white border border-white/10 hover:border-white/20 transition-all text-xs font-medium"
            >
              <Languages size={14} />
              <span className="text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                {locale === 'id' ? 'EN' : 'ID'}
              </span>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto overscroll-contain px-4 pb-4 pt-1">

            {/* Flat items grid */}
            {moreItems.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {moreItems.map(({ label, icon: Icon, path }) => {
                  const active = pathname.includes(path);
                  return (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
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
            )}

            {/* Expandable sections (Network, Settings) */}
            {sections.map((section) => {
              const SectionIcon = section.icon;
              const isExpanded = expandedSections.includes(section.label);
              const sectionActive = isSectionActive(section);

              return (
                <div key={section.label} className="mb-2">
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                      sectionActive
                        ? 'bg-blue-600/15 text-blue-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SectionIcon size={20} />
                      <span className="text-sm font-semibold">{section.label}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Section children */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="grid grid-cols-3 gap-1.5 px-1 pb-1">
                      {section.children.map(({ label, icon: ChildIcon, path }) => {
                        const active = pathname === path;
                        return (
                          <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`tap-target flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                              active
                                ? 'bg-blue-600/20 text-blue-400'
                                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                            }`}
                          >
                            <ChildIcon size={18} />
                            <span className="text-[10px] font-medium truncate max-w-[72px] leading-tight text-center">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
