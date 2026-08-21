'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle, AlertTriangle, Upload, X, RefreshCw } from 'lucide-react';

type Issue = {
  id: string;
  image_url: string;
  after_image_url: string | null;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
  resolved_at: string | null;
  departments: {
    name: string;
    sla_hours: number;
    color: string;
  };
};

type SLAStatus = {
  color: string;
  badgeColor: string;
  text: string;
  icon: React.ReactNode;
  timeLeftText: string;
};

// Live countdown hook - re-renders every second
function useTicker() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
}

const getSLAStatus = (createdAt: string, slaHours: number): SLAStatus => {
  const deadline = new Date(createdAt).getTime() + slaHours * 60 * 60 * 1000;
  const now = Date.now();
  const timeLeft = deadline - now;
  const percentLeft = (timeLeft / (slaHours * 60 * 60 * 1000)) * 100;

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) {
      const over = Math.abs(ms);
      const h = Math.floor(over / 3600000);
      const m = Math.floor((over % 3600000) / 60000);
      return `${h}h ${m}m overdue`;
    }
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
    return `${h}h ${m}m ${s}s left`;
  };

  if (timeLeft <= 0) return {
    color: 'bg-red-50 border-l-4 border-l-red-500',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    text: 'OVERDUE',
    icon: <AlertTriangle size={14} />,
    timeLeftText: formatTimeLeft(timeLeft),
  };
  if (percentLeft <= 50) return {
    color: 'bg-yellow-50 border-l-4 border-l-yellow-400',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    text: 'URGENT',
    icon: <Clock size={14} />,
    timeLeftText: formatTimeLeft(timeLeft),
  };
  return {
    color: 'bg-white border-l-4 border-l-green-400',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    text: 'ON TRACK',
    icon: <Clock size={14} />,
    timeLeftText: formatTimeLeft(timeLeft),
  };
};

export default function AdminDashboard() {
  const supabase = createClient();
  useTicker(); // forces re-render every second for live countdowns

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingIssue, setResolvingIssue] = useState<Issue | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIssues = useCallback(async () => {
    const { data } = await supabase
      .from('issues')
      .select('*, departments(name, sla_hours, color)')
      .order('created_at', { ascending: false });
    if (data) setIssues(data as Issue[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleAfterImage = (file: File) => {
    setAfterImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setAfterPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleResolve = async () => {
    if (!afterImage || !resolvingIssue) return;
    setIsSubmitting(true);

    const fileName = `resolved-${Date.now()}-${afterImage.name}`;
    const { error: uploadError } = await supabase.storage.from('issues').upload(fileName, afterImage);
    if (uploadError) { alert('Upload failed: ' + uploadError.message); setIsSubmitting(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('issues').getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('issues')
      .update({ status: 'Resolved', resolved_at: new Date().toISOString(), after_image_url: publicUrl })
      .eq('id', resolvingIssue.id);

    if (updateError) { alert('Update failed: ' + updateError.message); setIsSubmitting(false); return; }

    setResolvingIssue(null);
    setAfterImage(null);
    setAfterPreview(null);
    setIsSubmitting(false);
    fetchIssues();
  };

  const open = issues.filter(i => i.status !== 'Resolved').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const overdue = issues.filter(i => i.status !== 'Resolved' && getSLAStatus(i.created_at, i.departments.sla_hours).text === 'OVERDUE').length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏛️ NagrikSetu — Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Civic Accountability & SLA Enforcement Engine</p>
        </div>
        <button onClick={fetchIssues} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Open Issues</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{open}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Overdue 🔴</p>
            <p className="text-4xl font-bold text-red-600 mt-1">{overdue}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Resolved ✅</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{resolved}</p>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Ticket</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Department</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Reported</th>
                <th className="p-4 text-sm font-semibold text-gray-600">SLA Timer</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Evidence</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading issues...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No issues reported yet.</td></tr>
              ) : issues.map((issue) => {
                const isResolved = issue.status === 'Resolved';
                const sla = isResolved
                  ? { color: 'bg-white border-l-4 border-l-blue-400', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', text: 'RESOLVED', icon: <CheckCircle size={14} />, timeLeftText: `Closed ${new Date(issue.resolved_at!).toLocaleDateString()}` }
                  : getSLAStatus(issue.created_at, issue.departments.sla_hours);

                return (
                  <tr key={issue.id} className={`transition-colors ${sla.color}`}>
                    <td className="p-4 font-mono text-xs text-gray-400">#{issue.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">
                      <span className="font-semibold text-gray-800">{issue.departments.name}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(issue.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sla.badgeColor}`}>
                        {sla.icon} {sla.text}
                      </span>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{sla.timeLeftText}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">Before</p>
                          <img src={issue.image_url} alt="Before" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        </div>
                        {issue.after_image_url && (
                          <div className="text-center">
                            <p className="text-xs text-green-500 mb-1">After ✅</p>
                            <img src={issue.after_image_url} alt="After" className="w-12 h-12 rounded-lg object-cover border-2 border-green-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {isResolved ? (
                        <span className="text-green-600 text-sm font-semibold">✓ Closed</span>
                      ) : (
                        <button
                          onClick={() => { setResolvingIssue(issue); setAfterImage(null); setAfterPreview(null); }}
                          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Mark Resolved
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

      {/* PROOF OF WORK MODAL */}
      {resolvingIssue && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setResolvingIssue(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Close Ticket — Proof Required</h2>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-medium text-gray-700">{resolvingIssue.departments.name}</span> · #{resolvingIssue.id.slice(0, 8).toUpperCase()}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📸 Before (Citizen)</p>
                <img src={resolvingIssue.image_url} className="w-full h-36 object-cover rounded-xl border border-gray-200" alt="Before" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">✅ After (Your Proof)</p>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden transition">
                  {afterPreview ? (
                    <img src={afterPreview} className="w-full h-full object-cover" alt="After preview" />
                  ) : (
                    <div className="text-center text-gray-400 p-4">
                      <Upload size={28} className="mx-auto mb-2" />
                      <span className="text-xs font-medium">Upload resolution photo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAfterImage(f); }} />
                </label>
              </div>
            </div>

            <button
              onClick={handleResolve}
              disabled={!afterImage || isSubmitting}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><RefreshCw size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><CheckCircle size={16} /> Confirm Resolution</>
              )}
            </button>
            <p className="text-xs text-center text-red-500 mt-3">
              ⚠ This ticket cannot be closed without photographic proof of work.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
