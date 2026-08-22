'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Activity, Award, TrendingUp, MapPin, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// We MUST dynamically import react-leaflet components with ssr: false
// otherwise Next.js will crash during SSR because window/document are not defined.
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Real Issue type based on our database
type Issue = {
  id: string;
  department_id: string;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
  ai_severity_score: number;
  departments: { name: string; sla_hours: number };
};

// --- CUSTOM GLOWING MAP PINS ---
const createCustomIcon = (status: string) => {
  // Safe check for L being available
  if (typeof window === 'undefined' || !window.L) return undefined;
  
  const color = status === 'Resolved' ? '#22c55e' : status === 'In Progress' ? '#eab308' : '#ef4444';
  return window.L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #0f172a; box-shadow: 0 0 12px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export default function PublicDashboard() {
  const supabase = createClient();
  const [isMounted, setIsMounted] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Prevent SSR crash for Leaflet and load L global
  useEffect(() => {
    // Import leaflet for the icons only on client
    import('leaflet').then((L) => {
      window.L = L.default;
      setIsMounted(true);
    });
  }, []);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchRealData = async () => {
      const { data } = await supabase
        .from('issues')
        .select('*, departments(name, sla_hours)')
        .order('created_at', { ascending: false });
      
      if (data) {
        setIssues(data as Issue[]);
      }
      setLoading(false);
    };
    fetchRealData();
  }, [supabase]);

  // Calculate Leaderboard Stats
  const leaderboard = useMemo(() => {
    if (issues.length === 0) return [];
    const stats: Record<string, { total: number; resolved: number }> = {};
    
    issues.forEach(issue => {
      const dept = issue.departments?.name || 'Unknown';
      if (!stats[dept]) stats[dept] = { total: 0, resolved: 0 };
      stats[dept].total++;
      if (issue.status === 'Resolved') stats[dept].resolved++;
    });
    
    return Object.entries(stats)
      .map(([dept, data]) => ({
        dept,
        ...data,
        rate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [issues]);

  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const cityHealth = issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 100;

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white font-sans">
        <Activity size={48} className="text-blue-500 animate-pulse mb-4" />
        <p className="font-bold tracking-widest uppercase text-slate-400 text-xs">Initializing God View...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0f172a] text-white font-sans relative overflow-hidden">
      
      {/* --- THE MAP --- */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          // Default center on Delhi, Connaught place
          center={[28.6315, 77.2167]} 
          zoom={13} 
          className="h-full w-full bg-[#0f172a]"
          zoomControl={false}
        >
          {/* Cyberpunk Dark Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {issues.map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.lat, issue.lng]} 
              icon={createCustomIcon(issue.status)}
            >
              <Popup className="custom-popup bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-0 m-0">
                <div className="text-slate-200 font-sans p-3 space-y-1 min-w-[200px]">
                  <p className="font-bold text-sm text-white">{issue.departments?.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">#{issue.id.slice(0,8).toUpperCase()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${issue.status === 'Resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {issue.status}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                      Severity: {issue.ai_severity_score}/100
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* --- GLASSMORPHISM SIDEBAR OVERLAY --- */}
      <motion.div 
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="absolute top-4 left-4 bottom-4 w-[360px] bg-[#0f172a]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] z-10 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-b from-blue-900/20 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">City Health Monitor</h1>
              <p className="text-[10px] text-blue-400 font-mono font-bold tracking-widest">LIVE DATA · NEW DELHI</p>
            </div>
          </div>
          
          {/* Overall Health Score */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Resolution Rate</p>
              <p className="text-3xl font-black text-white flex items-end gap-1">
                {cityHealth}<span className="text-lg text-slate-500">%</span>
              </p>
            </div>
            <div className="text-right space-y-1.5">
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 justify-end">
                <MapPin size={12} className="text-slate-500"/> {issues.length} Total Issues
              </p>
              <p className="text-[10px] text-green-400 font-bold flex items-center gap-1.5 justify-end">
                <CheckCircle2 size={12}/> {resolvedCount} Fixed
              </p>
              <p className="text-[10px] text-red-400 font-bold flex items-center gap-1.5 justify-end">
                <AlertTriangle size={12}/> {issues.length - resolvedCount} Active
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Award size={14} className="text-yellow-500" /> Department Accountability Leaderboard
          </h2>
          
          {leaderboard.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-10">No data available yet.</div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((dept, index) => (
                <motion.div 
                  key={dept.dept}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-200">{dept.dept}</span>
                    <span className={`text-sm font-black ${dept.rate >= 70 ? 'text-green-400' : dept.rate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {dept.rate}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.rate}%` }}
                      transition={{ duration: 1.5, delay: 0.8 + (index * 0.1), ease: "easeOut" }}
                      className={`h-full rounded-full ${dept.rate >= 70 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : dept.rate >= 40 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-2">{dept.resolved} of {dept.total} closed</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / ROI */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0f172a]">
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <TrendingUp size={16} className="text-green-400 flex-shrink-0" />
            <p>Estimated Taxpayer ROI: <span className="text-green-400 font-bold">₹14.2 Lakhs</span> saved via early detection & prevention.</p>
          </div>
        </div>
      </motion.div>

      {/* Map Legend (Bottom Right) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 right-6 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 z-10 space-y-3 shadow-2xl"
      >
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-700 pb-2">Live Node Status</p>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] ring-2 ring-red-500/30"></div> 
          Unresolved
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)] ring-2 ring-yellow-500/30"></div> 
          In Progress
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)] ring-2 ring-green-500/30"></div> 
          Resolved
        </div>
      </motion.div>

      {/* Global overrides for leaflet popups to match dark mode */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #0f172a !important;
          color: white !important;
          border: 1px solid #334155;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-container a.leaflet-popup-close-button { color: #94a3b8 !important; padding: 4px !important; }
        .leaflet-control-container { display: none !important; } /* Hide default zoom controls */
      `}} />
    </div>
  );
}
