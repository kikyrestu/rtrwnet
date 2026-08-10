'use client';

import CustomerForm from '@/components/features/customers/CustomerForm';
import { UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CreateCustomerPage() {
    const t = useTranslations('customerForm');
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                    <UserPlus className="text-blue-400" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
                    <p className="text-gray-400 text-sm">{t('subtitle')}</p>
                </div>
            </div>

            <CustomerForm />
        </div>
    );
}
