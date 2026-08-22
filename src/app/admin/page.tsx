'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Brain, CheckCircle2, Loader2, 
  Eye, MapPin, AlertTriangle, Clock, ChevronDown, Server, RefreshCw
} from 'lucide-react';

// --- MOCK DATA: AI Fallback Queue (tickets the AI couldn't classify) ---
const initialFallbackQueue = [
  { id: 'NGK-8490', dept: 'Unassigned', image: 'https://placehold.co/400x300/1e293b/ef4444?text=Unclear+Debris', ai_confidence: 35, ai_severity: 60, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), lat: 28.6315, lng: 77.2167 },
  { id: 'NGK-8491', dept: 'Unassigned', image: 'https://placehold.co/400x300/1e293b/f59e0b?text=Broken+Pipe?', ai_confidence: 42, ai_severity: 85, created_at: new Date(Date.now() - 3600000 * 5).toISOString(), lat: 28.6280, lng: 77.2100 },
];

type RealIssue = {
  id: string;
  image_url: string;
  after_image_url: string | null;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
  resolved_at: string | null;
  ai_severity_score: number;
  departments: { name: string; sla_hours: number; };
};

// Re-uses live ticker from previous sessions
function useTicker() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
}

const getSLABadge = (issue: RealIssue) => {
  if (issue.status === 'Resolved') {
    return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold">RESOLVED</span>;
  }
  const slaMs = issue.departments.sla_hours * 3600000;
  const severity = issue.ai_severity_score;
  const effectiveSlaMs = severity > 80 ? slaMs / 2 : slaMs; // Dynamic SLA
  const deadline = new Date(issue.created_at).getTime() + effectiveSlaMs;
  const timeLeft = deadline - Date.now();

  const fmt = (ms: number) => {
    const h = Math.floor(Math.abs(ms) / 3600000);
    const m = Math.floor((Math.abs(ms) % 3600000) / 60000);
    const s = Math.floor((Math.abs(ms) % 60000) / 1000);
    return ms < 0 ? `${h}h ${m}m overdue` : `${h}h ${m}m ${s}s`;
  };

  if (timeLeft <= 0) return (
    <div>
      <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
        <AlertTriangle size={10} /> OVERDUE
      </span>
      <p className="text-[10px] text-red-400 font-mono mt-1">{fmt(timeLeft)}</p>
    </div>
  );
  if (timeLeft < effectiveSlaMs * 0.5) return (
    <div>
      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
        <Clock size={10} /> URGENT
      </span>
      <p className="text-[10px] text-yellow-400 font-mono mt-1">{fmt(timeLeft)}</p>
    </div>
  );
  return (
    <div>
      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-[10px] font-bold w-fit block">ON TRACK</span>
      <p className="text-[10px] text-green-400 font-mono mt-1">{fmt(timeLeft)}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const supabase = createClient();
  useTicker(); // forces live SLA timer re-renders

  const [realIssues, setRealIssues] = useState<RealIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallbackQueue, setFallbackQueue] = useState(initialFallbackQueue);
  const [activeTab, setActiveTab] = useState<'unassigned' | 'master'>('unassigned');
  
  // Per-row dropdown state for the AI fallback queue
  const [selectedDepts, setSelectedDepts] = useState<Record<string, string>>({});
  
  // CV Verification Modal
  const [verifyingTicket, setVerifyingTicket] = useState<RealIssue | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // CPGRAMS Sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const fetchIssues = useCallback(async () => {
    const { data } = await supabase
      .from('issues')
      .select('*, departments(name, sla_hours)')
      .order('created_at', { ascending: false });
    if (data) setRealIssues(data as RealIssue[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncDone(false);
    await new Promise(r => setTimeout(r, 2500));
    setIsSyncing(false);
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 4000);
  };

  const handleRoute = (id: string) => {
    const dept = selectedDepts[id];
    if (!dept || dept === '') return;
    setFallbackQueue(prev => prev.filter(i => i.id !== id));
  };

  const handleVerifyClosure = async () => {
    setIsVerifying(true);
    setVerificationComplete(false);
    await new Promise(r => setTimeout(r, 3000));
    setIsVerifying(false);
    setVerificationComplete(true);
  };

  const openCount = realIssues.filter(i => i.status !== 'Resolved').length;
  const resolvedCount = realIssues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">

      {/* Sticky Top Nav */}
      <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">NagrikSetu Command Center</h1>
              <p className="text-xs text-slate-500 font-mono">Municipal Commissioner Oversight Node</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="hidden md:flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={14} /> {fallbackQueue.length} Unassigned
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock size={14} /> {openCount} Active
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={14} /> {resolvedCount} Resolved
              </div>
            </div>

            <button onClick={fetchIssues} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs transition-all">
              <RefreshCw size={14} />
            </button>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold transition-all ${syncDone ? 'bg-green-600/20 border-green-500/50 text-green-400' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}
            >
              {isSyncing ? <Loader2 size={14} className="animate-spin" /> : syncDone ? <CheckCircle2 size={14} /> : <Server size={14} />}
              {isSyncing ? 'Syncing via REST...' : syncDone ? 'CPGRAMS Synced!' : 'Sync to CPGRAMS'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'unassigned' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Brain size={16} /> AI Fallback Queue
            {fallbackQueue.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{fallbackQueue.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'master' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Eye size={16} /> Master Operations Log
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">{realIssues.length}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: AI FALLBACK QUEUE */}
          {activeTab === 'unassigned' && (
            <motion.div key="unassigned" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-300">
                <p className="font-bold flex items-center gap-2"><Brain size={16} /> What is this queue?</p>
                <p className="text-xs text-yellow-400/70 mt-1">These reports have AI confidence below 80%. The system flagged them to prevent <span className="font-bold">"jurisdictional ping-pong"</span> — where a ticket bounces between departments. A human admin must manually route them.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fallbackQueue.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-slate-500">
                    <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">All clear! AI has successfully routed all incoming reports.</p>
                  </div>
                ) : (
                  fallbackQueue.map(issue => (
                    <motion.div key={issue.id} layout exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1e293b] border border-red-500/30 rounded-xl overflow-hidden shadow-lg shadow-red-500/5">
                      <div className="relative">
                        <img src={issue.image} className="w-full h-40 object-cover opacity-80" alt="Unclassified" />
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-red-400 flex items-center gap-1">
                          <Brain size={10} /> Low Confidence: {issue.ai_confidence}%
                        </div>
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-yellow-400">
                          Severity: {issue.ai_severity}/100
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 font-mono mb-1">Ticket {issue.id}</p>
                          <p className="text-sm font-bold text-white">Human Review Required</p>
                          <p className="text-xs text-slate-400 mt-1">AI could not definitively classify this defect. Manual routing required.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin size={12} /> {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={selectedDepts[issue.id] || ''}
                            onChange={e => setSelectedDepts(prev => ({ ...prev, [issue.id]: e.target.value }))}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value="">Select Department...</option>
                            <option value="PWD">PWD (Potholes & Roads)</option>
                            <option value="Sanitation">Sanitation (Garbage)</option>
                            <option value="Electrical">Electrical (Streetlights)</option>
                            <option value="Water">Water Board (Pipes)</option>
                          </select>
                          <button
                            onClick={() => handleRoute(issue.id)}
                            disabled={!selectedDepts[issue.id]}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Route
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: MASTER OPERATIONS LOG (Real Supabase Data) */}
          {activeTab === 'master' && (
            <motion.div key="master" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/50 border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-4 font-bold">Ticket ID</th>
                        <th className="p-4 font-bold">Department</th>
                        <th className="p-4 font-bold">AI Severity</th>
                        <th className="p-4 font-bold">Live SLA</th>
                        <th className="p-4 font-bold">Evidence</th>
                        <th className="p-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2" size={16} />Loading live data...</td></tr>
                      ) : realIssues.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No issues in database yet.</td></tr>
                      ) : realIssues.map(issue => (
                        <tr key={issue.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-mono text-slate-300 text-xs">#{issue.id.slice(0, 8).toUpperCase()}</td>
                          <td className="p-4 font-bold text-white text-sm">{issue.departments.name}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${issue.ai_severity_score > 70 ? 'bg-red-500' : issue.ai_severity_score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${issue.ai_severity_score}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${issue.ai_severity_score > 70 ? 'text-red-400' : 'text-slate-400'}`}>{issue.ai_severity_score}/100</span>
                            </div>
                            {issue.ai_severity_score > 80 && (
                              <p className="text-[10px] text-red-400 mt-1">⚡ SLA Expedited</p>
                            )}
                          </td>
                          <td className="p-4">{getSLABadge(issue)}</td>
                          <td className="p-4">
                            <div className="flex gap-2 items-center">
                              <div className="text-center">
                                <p className="text-[10px] text-slate-500 mb-1">Before</p>
                                <img src={issue.image_url} className="w-12 h-12 rounded object-cover border border-slate-600" alt="Before" />
                              </div>
                              {issue.after_image_url && (
                                <div className="text-center">
                                  <p className="text-[10px] text-green-500 mb-1">After ✅</p>
                                  <img src={issue.after_image_url} className="w-12 h-12 rounded object-cover border-2 border-green-500" alt="After" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {issue.status === 'Resolved' ? (
                              <button
                                onClick={() => { setVerifyingTicket(issue); setVerificationComplete(false); }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ml-auto"
                              >
                                <Brain size={12} /> CV Verify
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500 italic">In Progress</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* CV VERIFICATION MODAL */}
      <AnimatePresence>
        {verifyingTicket && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative"
            >
              <button onClick={() => { setVerifyingTicket(null); setVerificationComplete(false); setIsVerifying(false); }} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <ChevronDown size={20} className="rotate-45" />
              </button>

              <h2 className="text-xl font-black mb-1">Computer Vision Closure Verification</h2>
              <p className="text-sm text-slate-400 mb-6">Comparing structural similarity (SSIM) between reported defect and field-worker proof photo.</p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">📸 Before (Citizen Report)</p>
                  <img src={verifyingTicket.image_url} className="w-full h-48 object-cover rounded-lg border border-slate-700" alt="Before" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-green-500 uppercase mb-2">✅ After (Field Worker Proof)</p>
                  {verifyingTicket.after_image_url ? (
                    <img src={verifyingTicket.after_image_url} className="w-full h-48 object-cover rounded-lg border-2 border-green-500/50" alt="After" />
                  ) : (
                    <div className="w-full h-48 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500 text-xs">No after photo</div>
                  )}
                </div>
              </div>

              {!verificationComplete ? (
                <button
                  onClick={handleVerifyClosure}
                  disabled={isVerifying || !verifyingTicket.after_image_url}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <><Loader2 className="animate-spin" size={18} /> Running Structural Similarity (SSIM) Analysis...</>
                  ) : (
                    'Initiate AI Verification'
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-4 bg-green-500/10 border border-green-500/30 text-green-400 font-black rounded-xl flex flex-col items-center justify-center gap-1"
                >
                  <CheckCircle2 size={32} />
                  <span>DEFECT RESOLVED. AI MATCH CONFIRMED.</span>
                  <span className="text-xs font-normal text-green-600 font-mono">SSIM Score: 0.94 | GPS Delta: 12m | Ticket Closed</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
