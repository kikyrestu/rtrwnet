'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import LocationPicker from '@/components/ui/LocationPicker';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const inputClass = "w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-600";
const selectClass = "w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none";
const labelClass = "block text-sm font-medium text-gray-400 mb-1";

export default function CustomerForm() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [options, setOptions] = useState<any>({ packages: [], routers: [], regions: [], distribution_points: [] });
    const [form, setForm] = useState({
        name: '', nik: '', phone: '', address: '',
        mikrotik_username: '', mikrotik_password: '',
        package_id: '', router_id: '', dp_id: '', dp_port_number: '', region_id: '',
        ont_merk: '', ont_sn: '',
        billing_cycle_date: '1',
        latitude: '', longitude: '',
    });
    const t = useTranslations('customerForm');

    useEffect(() => {
        api.get('/form-options').then(setOptions).catch(console.error);
    }, []);

    const handleLocationSelect = (lat: string, lng: string) => {
        setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.mikrotik_username) {
            Swal.fire({text: t('validation'), background: '#1e293b', color: '#f8fafc', icon: 'info'});
            return;
        }
        setSaving(true);
        try {
            const payload: any = {
                ...form,
                package_id: form.package_id ? Number(form.package_id) : null,
                router_id: form.router_id ? Number(form.router_id) : null,
                distribution_point_id: form.dp_id ? Number(form.dp_id) : null,
                region_id: form.region_id ? Number(form.region_id) : null,
                billing_cycle_date: Number(form.billing_cycle_date),
                status: 'active',
            };
            delete payload.dp_id;
            
            await api.post('/customers', payload);
            Swal.fire({text: t('success'), background: '#1e293b', color: '#f8fafc', icon: 'info'});
            router.push('/customers');
        } catch (err: any) {
            Swal.fire({text: t('failed') + err.message, background: '#1e293b', color: '#f8fafc', icon: 'info'});
        } finally {
            setSaving(false);
        }
    };

    const setField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Info Dasar */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-4">{t('basicInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>{t('fullName')}</label>
                        <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
                            className={inputClass} placeholder="Asep Ngebut" required />
                    </div>
                    <div>
                        <label className={labelClass}>{t('nik')}</label>
                        <input type="text" value={form.nik} onChange={e => setField('nik', e.target.value)}
                            className={inputClass} placeholder="351xxxxxxxx" />
                    </div>
                    <div>
                        <label className={labelClass}>{t('whatsapp')}</label>
                        <input type="text" value={form.phone} onChange={e => setField('phone', e.target.value)}
                            className={inputClass} placeholder="08123456789" />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>{t('address')}</label>
                        <textarea value={form.address} onChange={e => setField('address', e.target.value)}
                            className={inputClass} rows={2} placeholder="Jl. Durian Runtuh No 4" />
                    </div>
                </div>
            </div>

            {/* Section 2: Paket & Layanan */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-4">{t('packageService')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>{t('internetPackage')}</label>
                        <select value={form.package_id} onChange={e => setField('package_id', e.target.value)} className={selectClass}>
                            <option value="">{t('selectPackage')}</option>
                            {(options.packages || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>{t('router')}</label>
                        <select value={form.router_id} onChange={e => setField('router_id', e.target.value)} className={selectClass}>
                            <option value="">{t('selectRouter')}</option>
                            {(options.routers || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>{t('region')}</label>
                        <select value={form.region_id} onChange={e => setField('region_id', e.target.value)} className={selectClass}>
                            <option value="">{t('selectRegion')}</option>
                            {(options.regions || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 3: Teknis + GPS */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">{t('technical')}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>{t('pppoeUsername')}</label>
                            <input type="text" value={form.mikrotik_username} onChange={e => setField('mikrotik_username', e.target.value)}
                                className={`${inputClass} font-mono`} placeholder="pppoe-username" required />
                        </div>
                        <div>
                            <label className={labelClass}>{t('pppoePassword')}</label>
                            <input type="text" value={form.mikrotik_password} onChange={e => setField('mikrotik_password', e.target.value)}
                                className={`${inputClass} font-mono`} placeholder="password123" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('odpPoint')}</label>
                                <select value={form.dp_id} onChange={e => setField('dp_id', e.target.value)} className={selectClass}>
                                    <option value="">{t('selectOdp')}</option>
                                    {(options.distribution_points || []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>{t('odpPort')}</label>
                                <input type="number" min={1} max={32} value={form.dp_port_number} onChange={e => setField('dp_port_number', e.target.value)}
                                    className={inputClass} placeholder="Contoh: 1, 2, 8" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('billingDate')}</label>
                                <input type="number" min={1} max={28} value={form.billing_cycle_date} onChange={e => setField('billing_cycle_date', e.target.value)}
                                    className={inputClass} placeholder="1" />
                            </div>
                            <div className="hidden md:block"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>{t('modemBrand')}</label>
                                <input type="text" value={form.ont_merk} onChange={e => setField('ont_merk', e.target.value)}
                                    className={inputClass} placeholder="ZTE / TP-Link" />
                            </div>
                            <div>
                                <label className={labelClass}>{t('snMacAddress')}</label>
                                <input type="text" value={form.ont_sn} onChange={e => setField('ont_sn', e.target.value)}
                                    className={`${inputClass} font-mono`} placeholder="F4:.. / ZTEG..." />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-end">
                    <LocationPicker 
                        onLocationSelect={handleLocationSelect}
                        initialLat={form.latitude}
                        initialLng={form.longitude}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Link href="/customers"
                    className="px-5 py-2.5 rounded-xl border border-white/10 font-medium text-gray-400 hover:bg-white/5 flex items-center gap-2 transition-all">
                    <ArrowLeft size={16} />{t('cancel')}
                </Link>
                <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 font-semibold text-white shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? t('saving') : t('saveButton')}
                </button>
            </div>
        </form>
    );
}
