'use client';

import { useState, useEffect } from 'react';
import { useFeatureFlags, FeatureFlag } from '@/hooks/useFeatureFlags';
import {
  ToggleRight, ShieldOff, CreditCard, MessageCircle,
  Ticket, Headphones, UserCircle, Bell, Loader2, Check, X,
  Zap, Wifi, Users, Receipt
} from 'lucide-react';

const iconMap: Record<string, any> = {
  ShieldOff, CreditCard, MessageCircle, Ticket,
  Headphones, UserCircle, Bell,
};

const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
  billing: { label: 'Billing & Pembayaran', icon: Receipt, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20' },
  network: { label: 'Jaringan & Monitoring', icon: Wifi, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
  communication: { label: 'Komunikasi', icon: MessageCircle, color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20' },
  customer: { label: 'Pelanggan', icon: Users, color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
};

export default function FeaturesPage() {
  const { features, loading, toggle, updateConfig } = useFeatureFlags();
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [waToken, setWaToken] = useState<string>('');

  useEffect(() => {
    const wa = features.find(f => f.key === 'whatsapp');
    if (wa && wa.config?.token && !waToken) {
      setWaToken(wa.config.token);
    }
  }, [features, waToken]);

  const handleToggle = async (key: string, currentState: boolean) => {
    setTogglingKey(key);
    await toggle(key, !currentState);
    setTogglingKey(null);
  };

  const handleSaveToken = async (key: string, token: string) => {
    if (!updateConfig) return;
    setTogglingKey('save_token_' + key);
    await updateConfig(key, { token });
    setTogglingKey(null);
    alert('Pengaturan Token berhasil disimpan!');
  };

  // Group features by category
  const grouped = features.reduce<Record<string, FeatureFlag[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  if (!features || features.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-white/5">
          <ToggleRight className="text-gray-600" size={40} />
        </div>
        <h2 className="text-xl font-bold text-white">Belum Ada Modul</h2>
        <p className="text-gray-500 text-center max-w-md">
          Modul dan fitur belum tersedia. Pastikan backend API sudah berjalan dan endpoint <code className="text-blue-400/70 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs">/api/features</code> mengembalikan data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/20">
              <ToggleRight className="text-blue-400" size={24} />
            </div>
            Fitur & Modul
          </h1>
          <p className="text-gray-400 mt-2">
            Aktifkan atau nonaktifkan fitur sesuai kebutuhan bisnis Anda. Fitur yang dinonaktifkan tidak akan muncul di menu dan API-nya akan diblokir.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm text-gray-300">
            {features.filter(f => f.is_enabled).length} / {features.length} aktif
          </span>
        </div>
      </div>

      {/* Feature Groups */}
      {Object.entries(grouped).map(([category, flags]) => {
        const catInfo = categoryLabels[category] || { label: category, icon: ToggleRight, color: 'from-gray-500/20 to-gray-600/10 border-gray-500/20' };
        const CatIcon = catInfo.icon;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <CatIcon size={18} className="text-gray-400" />
              <h2 className="text-lg font-semibold text-white">{catInfo.label}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flags.map((feature) => {
                const FeatureIcon = iconMap[feature.icon] || ToggleRight;
                const isToggling = togglingKey === feature.key;

                return (
                  <div
                    key={feature.key}
                    className={`relative overflow-hidden bg-gradient-to-br ${
                      feature.is_enabled
                        ? 'from-blue-500/10 to-indigo-600/5 border-blue-500/20'
                        : 'from-white/5 to-white/[0.02] border-white/10'
                    } border rounded-2xl p-5 transition-all duration-300 hover:border-white/20`}
                  >
                    {/* Glow effect when enabled */}
                    {feature.is_enabled && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    )}

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2.5 rounded-xl ${
                          feature.is_enabled 
                            ? 'bg-blue-600/20 border border-blue-500/30' 
                            : 'bg-white/5 border border-white/10'
                        }`}>
                          <FeatureIcon
                            size={22}
                            className={feature.is_enabled ? 'text-blue-400' : 'text-gray-500'}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-1">
                            <h3 className="font-semibold text-white text-sm">{feature.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                              feature.is_enabled
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                : 'bg-gray-500/20 text-gray-500 border border-gray-500/20'
                            }`}>
                              {feature.is_enabled ? (
                                <><Check size={10} /> Aktif</>
                              ) : (
                                <><X size={10} /> Nonaktif</>
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggle(feature.key, feature.is_enabled)}
                        disabled={isToggling}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 flex-shrink-0 mt-0.5 ${
                          feature.is_enabled ? 'bg-blue-600' : 'bg-gray-700'
                        } ${isToggling ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                            feature.is_enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        {isToggling && (
                          <Loader2 size={12} className="absolute inset-0 m-auto animate-spin text-white" />
                        )}
                      </button>
                    </div>

                    {/* Form Pengaturan Khusus Modul */}
                    {feature.key === 'whatsapp' && feature.is_enabled && (
                      <div className="mt-5 pt-4 border-t border-white/10">
                        <label className="block text-xs text-gray-400 mb-1">Fonnte API Token</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={waToken} 
                            onChange={e => setWaToken(e.target.value)} 
                            placeholder="Paste token dari fonnte.com"
                            className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                          <button 
                            onClick={() => handleSaveToken(feature.key, waToken)}
                            disabled={togglingKey === 'save_token_' + feature.key}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {togglingKey === 'save_token_' + feature.key ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Simpan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Info */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Bell size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-300 font-medium">Catatan Penting</p>
          <p className="text-xs text-amber-400/70 mt-1">
            Mengaktifkan fitur baru mungkin memerlukan konfigurasi tambahan (misalnya API key untuk Payment Gateway atau WhatsApp). 
            Pastikan konfigurasi sudah benar sebelum mengaktifkan fitur.
          </p>
        </div>
      </div>
    </div>
  );
}
