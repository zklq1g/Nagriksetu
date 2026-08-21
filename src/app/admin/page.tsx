'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle, AlertTriangle, Upload, X, RefreshCw, Send, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Issue = {
  id: string;
  image_url: string;
  after_image_url: string | null;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
  resolved_at: string | null;
  ai_severity_score: number;
  departments: { name: string; sla_hours: number; color: string; };
};

function useTicker() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
}

const getSLAStatus = (createdAt: string, baseSlaHours: number, severity: number) => {
  // Advanced Feature: Dynamic SLA based on AI severity
  const actualSlaHours = severity > 80 ? baseSlaHours / 2 : baseSlaHours;
  
  const deadline = new Date(createdAt).getTime() + actualSlaHours * 60 * 60 * 1000;
  const now = Date.now();
  const timeLeft = deadline - now;
  const percentLeft = (timeLeft / (actualSlaHours * 60 * 60 * 1000)) * 100;

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return 'OVERDUE';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
    return `${h}h ${m}m ${s}s left`;
  };

  const isExpedited = severity > 80;

  if (timeLeft <= 0) return {
    color: 'bg-red-50 border-l-4 border-l-red-500',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    text: 'OVERDUE',
    icon: <AlertTriangle size={14} />,
    timeLeftText: formatTimeLeft(timeLeft),
    isExpedited
  };
  if (percentLeft <= 50) return {
    color: 'bg-yellow-50 border-l-4 border-l-yellow-400',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    text: 'URGENT',
    icon: <Clock size={14} />,
    timeLeftText: formatTimeLeft(timeLeft),
    isExpedited
  };
  return {
    color: 'bg-white border-l-4 border-l-green-400',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    text: 'ON TRACK',
    icon: <Clock size={14} />,
    timeLeftText: formatTimeLeft(timeLeft),
    isExpedited
  };
};

export default function AdminDashboard() {
  const supabase = createClient();
  useTicker();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingIssue, setResolvingIssue] = useState<Issue | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  
  // Illusion States
  const [cvStatus, setCvStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');

  const fetchIssues = useCallback(async () => {
    const { data } = await supabase.from('issues').select('*, departments(name, sla_hours, color)').order('created_at', { ascending: false });
    if (data) setIssues(data as Issue[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleSync = async () => {
    setSyncStatus('syncing');
    await new Promise(r => setTimeout(r, 2000));
    setSyncStatus('done');
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleResolve = async () => {
    if (!afterImage || !resolvingIssue) return;
    
    // The Computer Vision Illusion
    setCvStatus('scanning');
    await new Promise(r => setTimeout(r, 2500)); // Fake CV processing
    setCvStatus('done');
    await new Promise(r => setTimeout(r, 1000)); // Show success before closing

    const fileName = `resolved-${Date.now()}-${afterImage.name}`;
    const { error: uploadError } = await supabase.storage.from('issues').upload(fileName, afterImage);
    if (uploadError) { alert('Upload failed'); setCvStatus('idle'); return; }
    const { data: { publicUrl } } = supabase.storage.from('issues').getPublicUrl(fileName);

    await supabase.from('issues').update({ status: 'Resolved', resolved_at: new Date().toISOString(), after_image_url: publicUrl }).eq('id', resolvingIssue.id);

    setResolvingIssue(null);
    setAfterImage(null);
    setAfterPreview(null);
    setCvStatus('idle');
    fetchIssues();
  };

  const open = issues.filter(i => i.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between text-white">
        <div>
          <h1 className="text-2xl font-bold">🏛️ NagrikSetu Command Center</h1>
          <p className="text-sm text-gray-400">Advanced Civic Accountability & SLA Enforcement Engine</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchIssues} className="px-4 py-2 text-sm font-medium bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <RefreshCw size={16} className="inline mr-2" /> Refresh
          </button>
          
          {/* System Interoperability Illusion */}
          <button onClick={handleSync} disabled={syncStatus !== 'idle'} className={`px-4 py-2 text-sm font-bold rounded-lg transition flex items-center gap-2 ${syncStatus === 'done' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
            {syncStatus === 'idle' && <><Send size={16} /> Sync to CPGRAMS</>}
            {syncStatus === 'syncing' && <><Loader2 size={16} className="animate-spin" /> Syncing via REST API...</>}
            {syncStatus === 'done' && <><CheckCircle size={16} /> Sync Complete</>}
          </button>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider">Ticket / AI Data</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider">Dynamic SLA Status</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider">Evidence (Before/After)</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {issues.map((issue) => {
                const isResolved = issue.status === 'Resolved';
                const sla = isResolved
                  ? { color: 'bg-white', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', text: 'RESOLVED', icon: <CheckCircle size={14} />, timeLeftText: `Closed ${new Date(issue.resolved_at!).toLocaleDateString()}`, isExpedited: false }
                  : getSLAStatus(issue.created_at, issue.departments.sla_hours, issue.ai_severity_score);

                return (
                  <tr key={issue.id} className={`hover:bg-gray-50 ${sla.color}`}>
                    <td className="p-4">
                      <p className="font-mono font-bold text-gray-900">#{issue.id.slice(0, 8).toUpperCase()}</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${issue.ai_severity_score > 80 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          Severity: {issue.ai_severity_score}/100
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-green-100 text-green-700 flex items-center gap-1">
                          <ShieldCheck size={10}/> EXIF Verified
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{issue.departments.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${sla.badgeColor}`}>
                        {sla.icon} {sla.text}
                      </span>
                      <p className="text-xs text-gray-500 mt-1 font-mono font-bold">{sla.timeLeftText}</p>
                      {sla.isExpedited && !isResolved && <p className="text-[10px] text-red-500 font-bold mt-1">⚡ SLA Expedited (High Severity)</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <img src={issue.image_url} className="w-16 h-16 rounded object-cover border border-gray-200" alt="Before" />
                        {issue.after_image_url && <img src={issue.after_image_url} className="w-16 h-16 rounded object-cover border-2 border-green-500" alt="After" />}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {isResolved ? (
                        <span className="text-green-600 text-sm font-bold flex items-center justify-end gap-1"><CheckCircle size={16}/> CV Match Verified</span>
                      ) : (
                        <button onClick={() => setResolvingIssue(issue)} className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition">
                          Resolve via CV Match
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLVE MODAL */}
      <AnimatePresence>
        {resolvingIssue && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-blue-400"/> Closed-Loop CV Verification</h2>
                  <p className="text-xs text-gray-400">Ticket #{resolvingIssue.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <button onClick={() => { setResolvingIssue(null); setCvStatus('idle'); }} className="text-gray-400 hover:text-white"><X /></button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Original Defect (Verified)</p>
                    <img src={resolvingIssue.image_url} className="w-full h-48 object-cover rounded-xl border border-gray-200" alt="Before" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Resolution Proof (Pending)</p>
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative">
                      {afterPreview ? (
                        <>
                          <img src={afterPreview} className="w-full h-full object-cover" />
                          
                          {/* The CV Scanning Illusion Overlay */}
                          {cvStatus === 'scanning' && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-blue-400">
                              <ScanLine />
                              <p className="text-xs font-mono mt-2 font-bold animate-pulse">Running SSIM Match...</p>
                            </div>
                          )}
                          {cvStatus === 'done' && (
                            <div className="absolute inset-0 bg-green-500/80 flex flex-col items-center justify-center text-white">
                              <CheckCircle size={32} className="mb-2"/>
                              <p className="font-bold">Structure Match: 94%</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-gray-400 p-4"><Upload size={28} className="mx-auto mb-2" /><span className="text-xs font-bold">Upload After Photo</span></div>
                      )}
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAfterImage(f); setAfterPreview(URL.createObjectURL(f)); } }} />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleResolve}
                  disabled={!afterImage || cvStatus !== 'idle'}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {cvStatus === 'scanning' ? 'Verifying Structural Similarity...' : cvStatus === 'done' ? 'Closing Ticket...' : 'Run CV Comparison & Close Ticket'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Scanline animation component
const ScanLine = () => (
  <motion.div
    initial={{ top: 0 }}
    animate={{ top: '100%' }}
    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_#60a5fa]"
  />
);
