'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Network, Map as MapIcon, RotateCw } from 'lucide-react';
import dynamic from 'next/dynamic';

const TopologyMap = dynamic(() => import('@/components/ui/TopologyMap'), { ssr: false });

export default function TopologyMapPage() {
  const [data, setData] = useState({ customers: [], odps: [], routers: [] });
  const [loading, setLoading] = useState(true);

  const fetchTopology = useCallback(async () => {
    setLoading(true);
    try {
      const [customers, odps, routers] = await Promise.all([
        api.get('/customers'),
        api.get('/distribution-points'),
        api.get('/routers')
      ]);
      setData({ customers, odps, routers });
    } catch (err) {
      // err logged
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopology();
  }, [fetchTopology]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/10">
            <Network className="text-teal-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Topologi Jaringan (GIS)</h1>
            <p className="text-sm text-gray-400">Peta interaktif persebaran Router, Tiang ODP, & Pelanggan.</p>
          </div>
        </div>
        <button 
          onClick={fetchTopology}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-white/10 transition-all font-semibold shadow-lg active:scale-95"
        >
          <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Memuat Data...' : 'Muat Ulang Titik'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md">
          <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          <span className="text-gray-300 font-semibold">{data.routers.length} Titik Server / Router</span>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md">
          <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg"></div>
          <span className="text-gray-300 font-semibold">{data.odps.length} Tiang / ODP</span>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md relative overflow-hidden">
          <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
          <span className="text-gray-300 font-semibold">{data.customers.length} Rumah Pelanggan</span>
          
          {/* Garis putus-putus ilustrasi */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none flex gap-1">
             <div className="w-2 h-[2px] bg-white"></div>
             <div className="w-2 h-[2px] bg-white"></div>
             <div className="w-2 h-[2px] bg-white"></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[600px] bg-slate-900/30 rounded-3xl border border-white/5 animate-pulse flex items-center justify-center flex-col gap-4 text-center">
          <MapIcon className="text-gray-500 opacity-50" size={48} />
          <p className="text-gray-400 font-medium tracking-wide">Merender Topologi Jaringan GIS...</p>
        </div>
      ) : (
        <TopologyMap customers={data.customers} odps={data.odps} routers={data.routers} />
      )}
    </div>
  );
}