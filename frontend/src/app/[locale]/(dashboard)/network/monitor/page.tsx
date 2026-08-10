'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { 
  Activity, Cpu, HardDrive, MemoryStick, Users, Wifi, 
  RefreshCcw, ArrowDown, ArrowUp, Clock, Server, MonitorCog 
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';

interface SystemData {
  board_name: string;
  architecture: string;
  version: string;
  uptime: string;
  cpu_load: number;
  cpu_count: number;
  total_memory: number;
  used_memory: number;
  free_memory: number;
  total_hdd: number;
  free_hdd: number;
}

interface PPPoESession {
  name: string;
  service: string;
  caller_id: string;
  address: string;
  uptime: string;
  encoding: string;
}

interface InterfaceData {
  name: string;
  type: string;
  running: boolean;
  disabled: boolean;
  tx_byte: number;
  rx_byte: number;
  link_downs: number;
}

interface MonitorData {
  router_name: string;
  router_host: string;
  system: SystemData;
  active_pppoe: PPPoESession[];
  interfaces: InterfaceData[];
}

interface TrafficPoint {
  time: string;
  tx: number;
  rx: number;
}

interface RouterOption { id: number; name: string; host: string; }

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatSpeed(bps: number): string {
  if (bps < 0) bps = 0;
  if (bps < 1024) return bps.toFixed(0) + ' B/s';
  if (bps < 1024 * 1024) return (bps / 1024).toFixed(1) + ' KB/s';
  return (bps / 1024 / 1024).toFixed(2) + ' MB/s';
}

const MAX_TRAFFIC_POINTS = 30;

export default function MonitorPage() {
  const [routers, setRouters] = useState<RouterOption[]>([]);
  const [selectedRouter, setSelectedRouter] = useState('');
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [trafficHistory, setTrafficHistory] = useState<TrafficPoint[]>([]);
  const [monitorIface, setMonitorIface] = useState('');
  const prevIfaceData = useRef<Record<string, { tx: number; rx: number; time: number }>>({});

  useEffect(() => {
    api.get('/routers').then(setRouters).catch(console.error);
  }, []);

  const processTraffic = useCallback((interfaces: InterfaceData[]) => {
    const now = Date.now();
    const targetIface = monitorIface || interfaces.find(i => i.running && i.type === 'ether')?.name || interfaces[0]?.name;
    
    if (!targetIface) return;
    if (!monitorIface && targetIface) setMonitorIface(targetIface);

    const iface = interfaces.find(i => i.name === targetIface);
    if (!iface) return;

    const prev = prevIfaceData.current[targetIface];
    if (prev) {
      const dtSec = (now - prev.time) / 1000;
      if (dtSec > 0) {
        const txSpeed = Math.max(0, (iface.tx_byte - prev.tx) / dtSec);
        const rxSpeed = Math.max(0, (iface.rx_byte - prev.rx) / dtSec);
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setTrafficHistory(h => {
          const next = [...h, { time: timeStr, tx: Math.round(txSpeed), rx: Math.round(rxSpeed) }];
          return next.slice(-MAX_TRAFFIC_POINTS);
        });
      }
    }
    prevIfaceData.current[targetIface] = { tx: iface.tx_byte, rx: iface.rx_byte, time: now };
  }, [monitorIface]);

  const fetchMonitor = useCallback(async () => {
    if (!selectedRouter) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/monitor/${selectedRouter}`);
      setData(res);
      processTraffic(res.interfaces);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data monitor');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRouter, processTraffic]);

  useEffect(() => {
    if (selectedRouter) {
      // Reset chart when switching router
      setTrafficHistory([]);
      prevIfaceData.current = {};
      fetchMonitor();
    }
  }, [selectedRouter]);

  // Auto refresh every 5s for traffic graph
  useEffect(() => {
    if (!autoRefresh || !selectedRouter) return;
    const interval = setInterval(fetchMonitor, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedRouter, fetchMonitor]);

  const sys = data?.system;
  const memPercent = sys ? Math.round((sys.used_memory / sys.total_memory) * 100) : 0;
  const hddUsed = sys ? sys.total_hdd - sys.free_hdd : 0;
  const hddPercent = sys && sys.total_hdd > 0 ? Math.round((hddUsed / sys.total_hdd) * 100) : 0;

  // Current speed from last traffic point
  const lastTraffic = trafficHistory[trafficHistory.length - 1];

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10"><MonitorCog className="text-emerald-400" size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Monitor Mikrotik</h1>
            <p className="text-sm text-gray-400">Real-time system, traffic & PPPoE monitoring</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Pilih Router</label>
          <select value={selectedRouter} onChange={e => setSelectedRouter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none max-w-md">
            <option value="">-- Pilih Router --</option>
            {routers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.host})</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMonitor} disabled={!selectedRouter || loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-blue-600/20 transition-all">
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={() => setAutoRefresh(!autoRefresh)} disabled={!selectedRouter}
            className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold border transition-all ${
              autoRefresh ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
            }`}>
            <Activity size={16} className={autoRefresh ? 'animate-pulse' : ''} />{autoRefresh ? 'Live ON (5s)' : 'Live OFF'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium">{error}</div>}

      {data && sys && (
        <>
          {/* Router Identity */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Server size={18} className="text-blue-400" />
              <span className="font-bold text-white text-lg">{data.router_name}</span>
              <span className="text-gray-500 text-sm font-mono">({data.router_host})</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Board', value: sys.board_name },
                { label: 'Arch', value: sys.architecture },
                { label: 'RouterOS', value: sys.version },
                { label: 'CPU Core', value: `${sys.cpu_count}x` },
              ].map((item, i) => (
                <span key={i} className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs">
                  <span className="text-gray-500">{item.label}:</span> <span className="text-slate-300 font-medium">{item.value}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Resource Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
              <div className="flex items-center gap-2 mb-3"><Cpu size={18} className="text-blue-400" /><span className="text-sm text-gray-400 font-medium">CPU Load</span></div>
              <p className={`text-3xl font-bold ${sys.cpu_load > 80 ? 'text-red-400' : sys.cpu_load > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{sys.cpu_load}%</p>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${sys.cpu_load > 80 ? 'bg-red-500' : sys.cpu_load > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${sys.cpu_load}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
              <div className="flex items-center gap-2 mb-3"><MemoryStick size={18} className="text-violet-400" /><span className="text-sm text-gray-400 font-medium">Memory</span></div>
              <p className={`text-3xl font-bold ${memPercent > 85 ? 'text-red-400' : memPercent > 60 ? 'text-amber-400' : 'text-violet-400'}`}>{memPercent}%</p>
              <p className="text-xs text-gray-500 mt-1">{formatBytes(sys.used_memory)} / {formatBytes(sys.total_memory)}</p>
              <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${memPercent}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
              <div className="flex items-center gap-2 mb-3"><HardDrive size={18} className="text-cyan-400" /><span className="text-sm text-gray-400 font-medium">Storage</span></div>
              <p className="text-3xl font-bold text-cyan-400">{hddPercent}%</p>
              <p className="text-xs text-gray-500 mt-1">{formatBytes(hddUsed)} / {formatBytes(sys.total_hdd)}</p>
              <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${hddPercent}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
              <div className="flex items-center gap-2 mb-3"><Clock size={18} className="text-amber-400" /><span className="text-sm text-gray-400 font-medium">Uptime</span></div>
              <p className="text-lg font-bold text-amber-400 font-mono">{sys.uptime}</p>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <Users size={14} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">{data.active_pppoe.length}</span>
                <span className="text-gray-500">PPPoE aktif</span>
              </div>
            </div>
          </div>

          {/* ===== TRAFFIC GRAPH ===== */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-blue-400" />Real-Time Traffic
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {autoRefresh ? 'Mengambil data setiap 5 detik...' : 'Nyalakan Live mode untuk melihat grafik real-time'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Interface selector */}
                <select value={monitorIface} onChange={e => { setMonitorIface(e.target.value); setTrafficHistory([]); prevIfaceData.current = {}; }}
                  className="bg-white/5 border border-white/10 text-white rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-sm">
                  {data.interfaces.filter(i => !i.disabled).map(iface => (
                    <option key={iface.name} value={iface.name}>{iface.name}</option>
                  ))}
                </select>
                {/* Current speed badges */}
                {lastTraffic && (
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2.5 py-1.5 rounded-lg font-bold">
                      <ArrowUp size={12} />TX: {formatSpeed(lastTraffic.tx)}
                    </span>
                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1.5 rounded-lg font-bold">
                      <ArrowDown size={12} />RX: {formatSpeed(lastTraffic.rx)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {trafficHistory.length < 2 ? (
              <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <div className="text-center">
                  <Activity size={32} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {autoRefresh ? 'Mengumpulkan data traffic... (butuh minimal 2 polling)' : 'Nyalakan "Live" untuk mulai memonitor traffic'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficHistory}>
                    <defs>
                      <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: any) => formatSpeed(v)} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [formatSpeed(Number(val)), name === 'tx' ? '↑ Upload (TX)' : '↓ Download (RX)']}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend 
                      formatter={(value: any) => value === 'tx' ? '↑ Upload (TX)' : '↓ Download (RX)'}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="tx" stroke="#3b82f6" strokeWidth={2} fill="url(#txGrad)" dot={false} animationDuration={300} />
                    <Area type="monotone" dataKey="rx" stroke="#10b981" strokeWidth={2} fill="url(#rxGrad)" dot={false} animationDuration={300} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Active PPPoE Sessions */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi size={18} className="text-emerald-400" />
                <h3 className="font-bold text-white">PPPoE Sessions Aktif</h3>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">{data.active_pppoe.length} online</span>
            </div>
            {data.active_pppoe.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Tidak ada sesi PPPoE aktif.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-semibold">Username</th>
                      <th className="px-5 py-3 font-semibold">Service</th>
                      <th className="px-5 py-3 font-semibold">Caller ID (MAC)</th>
                      <th className="px-5 py-3 font-semibold">IP Address</th>
                      <th className="px-5 py-3 font-semibold">Uptime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.active_pppoe.map((s, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-medium text-slate-200">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-400">{s.service}</td>
                        <td className="px-5 py-3 text-xs text-slate-500 font-mono">{s.caller_id}</td>
                        <td className="px-5 py-3 text-sm text-slate-400 font-mono">{s.address}</td>
                        <td className="px-5 py-3 text-sm text-slate-400">{s.uptime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Interfaces Table */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />Network Interfaces
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Interface</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold"><span className="flex items-center gap-1"><ArrowUp size={12} className="text-blue-400" />TX</span></th>
                    <th className="px-5 py-3 font-semibold"><span className="flex items-center gap-1"><ArrowDown size={12} className="text-emerald-400" />RX</span></th>
                    <th className="px-5 py-3 font-semibold">Link Downs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.interfaces.map((iface, i) => (
                    <tr key={i} className={`hover:bg-white/5 transition-colors ${iface.name === monitorIface ? 'bg-blue-500/5' : ''}`}>
                      <td className="px-5 py-3">
                        <button onClick={() => { setMonitorIface(iface.name); setTrafficHistory([]); prevIfaceData.current = {}; }}
                          className="font-medium text-slate-200 font-mono text-sm hover:text-blue-400 transition-colors flex items-center gap-2">
                          {iface.name === monitorIface && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          {iface.name}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">{iface.type}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          iface.disabled ? 'bg-gray-500/15 text-gray-400' :
                          iface.running ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {iface.disabled ? 'Disabled' : iface.running ? 'Running' : 'Down'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-blue-400 font-mono">{formatBytes(iface.tx_byte)}</td>
                      <td className="px-5 py-3 text-sm text-emerald-400 font-mono">{formatBytes(iface.rx_byte)}</td>
                      <td className="px-5 py-3 text-sm text-slate-400">{iface.link_downs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-16 rounded-3xl text-center">
          <MonitorCog size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">Pilih router untuk mulai monitoring</p>
        </div>
      )}
    </div>
  );
}
