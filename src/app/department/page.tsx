'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Camera, CheckCircle2, AlertTriangle, 
  Loader2, X, Navigation, ShieldCheck, Aperture
} from 'lucide-react';

// Haversine formula to calculate distance between two GPS coordinates (in meters)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180; const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180; const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getSLAStatus = (createdAt: string, slaHours: number) => {
  const timeLeft = (new Date(createdAt).getTime() + slaHours * 3600000) - Date.now();
  const pct = (timeLeft / (slaHours * 3600000)) * 100;
  if (timeLeft <= 0) return { color: 'border-red-500 bg-red-500/10', text: 'OVERDUE', textCol: 'text-red-400' };
  if (pct <= 30) return { color: 'border-yellow-500 bg-yellow-500/10', text: 'URGENT', textCol: 'text-yellow-400' };
  return { color: 'border-green-500 bg-green-500/10', text: 'ON TRACK', textCol: 'text-green-400' };
};

export default function DepartmentPortal() {
  const supabase = createClient();
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [workerLocation, setWorkerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  // WebRTC camera for proof-of-work
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Demo Controls
  const [demoDept, setDemoDept] = useState('Sanitation');

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*, departments(name, sla_hours)')
      .eq('status', 'Open')
      .order('created_at', { ascending: true }); // Oldest first = closest to SLA breach

    if (data) {
      setIssues(data.filter((i: any) => i.departments.name.toLowerCase().includes(demoDept.toLowerCase())));
    }
  };

  useEffect(() => { fetchTasks(); }, [demoDept]);

  // Clean up camera on unmount
  useEffect(() => { return () => stopCamera(); }, []);

  const verifyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setWorkerLocation(loc);
      if (selectedIssue) {
        setDistance(getDistance(loc.lat, loc.lng, selectedIssue.lat, selectedIssue.lng));
      }
    });
  };

  const openResolutionModal = (issue: any) => {
    setSelectedIssue(issue);
    setAfterImage(null);
    setAfterPreview(null);
    setDistance(null);
    // Kick off GPS check immediately
    navigator.geolocation.getCurrentPosition((pos) => {
      const dist = getDistance(pos.coords.latitude, pos.coords.longitude, issue.lat, issue.lng);
      setWorkerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setDistance(dist);
    });
  };

  // WebRTC Camera functions for the proof-of-work capture
  const startProofCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      alert('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const captureProofPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'proof.jpg', { type: 'image/jpeg' });
          setAfterImage(file);
          setAfterPreview(URL.createObjectURL(file));
          stopCamera();
        }
      }, 'image/jpeg', 0.85);
    }
  };

  const handleResolve = async () => {
    if (!afterImage || !selectedIssue) return;
    setIsSubmitting(true);

    const fileName = `resolved-${Date.now()}.jpg`;
    await supabase.storage.from('issues').upload(fileName, afterImage);
    const { data: { publicUrl } } = supabase.storage.from('issues').getPublicUrl(fileName);

    await supabase.from('issues').update({
      status: 'Resolved',
      resolved_at: new Date().toISOString(),
      after_image_url: publicUrl,
    }).eq('id', selectedIssue.id);

    setSelectedIssue(null);
    setAfterImage(null);
    setAfterPreview(null);
    setWorkerLocation(null);
    setDistance(null);
    fetchTasks();
    setIsSubmitting(false);
  };

  const isLocationVerified = distance !== null && distance <= 100;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 font-sans">

      {/* Demo Dept Toggle */}
      <div className="fixed top-4 right-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-1.5 rounded-full text-xs font-bold z-50 flex items-center gap-2">
        <span>Dept:</span>
        <select value={demoDept} onChange={(e) => setDemoDept(e.target.value)} className="bg-transparent border-none text-blue-300 font-bold focus:ring-0 cursor-pointer">
          <option value="Sanitation">Sanitation</option>
          <option value="PWD">PWD (Roads)</option>
          <option value="Electrical">Electrical</option>
        </select>
      </div>

      <h1 className="text-2xl font-black mt-12 mb-1 tracking-tight">⚙️ Field Operations</h1>
      <p className="text-slate-400 mb-6 text-sm">{demoDept} Department · {issues.length} Active Tasks</p>

      {/* Task Queue */}
      <div className="space-y-4 pb-24">
        {issues.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold text-lg">All Clear!</p>
            <p className="text-sm">No pending tasks for this department.</p>
          </div>
        )}

        {issues.map((issue) => {
          const sla = getSLAStatus(issue.created_at, issue.departments.sla_hours);
          return (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#1e293b] border-l-4 ${sla.color} rounded-xl p-4 shadow-lg`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ticket #{issue.id.slice(0, 8).toUpperCase()}</p>
                  <p className={`text-xs font-black mt-0.5 ${sla.textCol}`}>{sla.text}</p>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/30">
                  Severity: {issue.ai_severity_score ?? '?'}/100
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <img src={issue.image_url} alt="Defect" className="w-20 h-20 rounded-lg object-cover border border-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-start gap-1.5 text-xs text-slate-400">
                    <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                    <span className="truncate font-mono">{issue.lat.toFixed(5)}, {issue.lng.toFixed(5)}</span>
                  </div>
                  <button
                    onClick={() => openResolutionModal(issue)}
                    className="w-full py-3 bg-white text-black font-black text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation size={15} /> START RESOLUTION
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* RESOLUTION MODAL */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-[#1e293b] border border-slate-700 border-b-0 md:border-b rounded-t-3xl md:rounded-2xl w-full max-w-md p-6 space-y-5 relative max-h-[92vh] overflow-y-auto"
            >
              <button onClick={() => { setSelectedIssue(null); stopCamera(); }} className="absolute top-5 right-5 text-slate-500 hover:text-white z-10">
                <X size={20} />
              </button>

              <div>
                <h2 className="text-xl font-black">Verify & Close Ticket</h2>
                <p className="text-xs text-slate-500 mt-1 font-mono">#{selectedIssue.id.slice(0, 8).toUpperCase()}</p>
              </div>

              {/* GPS Verification */}
              <div className={`p-4 rounded-xl border text-xs font-bold flex items-start gap-3 transition-all ${
                distance === null ? 'bg-slate-800 border-slate-700 text-slate-400' :
                isLocationVerified ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-black">Location Verification</p>
                  <p className="text-[11px] font-normal opacity-80 mt-1">
                    {distance === null
                      ? 'Acquiring GPS signal…'
                      : isLocationVerified
                        ? `✓ Verified: ${distance.toFixed(0)}m from reported site`
                        : `✗ You are ${distance.toFixed(0)}m from the site. Must be within 100m.`}
                  </p>
                  {/* Demo Override — only shows when too far */}
                  {distance !== null && !isLocationVerified && (
                    <button
                      onClick={() => setDistance(45)}
                      className="mt-2 text-[11px] text-yellow-400 underline font-bold"
                    >
                      [Demo Override: Simulate On-Site]
                    </button>
                  )}
                </div>
              </div>

              {/* Before Photo */}
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">📸 Reported Defect (Citizen)</p>
                <img src={selectedIssue.image_url} className="w-full h-36 object-cover rounded-xl border border-slate-700" alt="Before" />
              </div>

              {/* After — WebRTC Proof Camera */}
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">✅ Proof of Resolution (Your Camera)</p>
                <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 overflow-hidden flex items-center justify-center">

                  {/* Live video feed */}
                  <video ref={videoRef} playsInline muted className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`} />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Preview */}
                  {afterPreview && !isCameraActive && (
                    <img src={afterPreview} className="absolute inset-0 w-full h-full object-cover" alt="Proof" />
                  )}

                  {/* Default: tap to open camera */}
                  {!isCameraActive && !afterPreview && (
                    <button onClick={startProofCamera} className="flex flex-col items-center text-slate-500 hover:text-blue-400 transition-colors z-10">
                      <Camera size={32} className="mb-2" />
                      <span className="text-xs font-bold">Tap to Capture Proof</span>
                      <span className="text-[10px] text-red-400 mt-1">Gallery disabled</span>
                    </button>
                  )}

                  {/* Capture shutter button */}
                  {isCameraActive && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center z-20">
                      <button onClick={captureProofPhoto} className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-slate-400 hover:scale-105 transition-transform">
                        <Aperture size={22} className="text-slate-900" />
                      </button>
                      <button onClick={stopCamera} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Retake */}
                  {afterPreview && !isCameraActive && (
                    <button onClick={startProofCamera} className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-[10px] font-bold z-10">
                      RETAKE
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleResolve}
                disabled={!afterImage || !isLocationVerified || isSubmitting}
                className="w-full py-4 bg-green-600 text-white font-black text-base rounded-xl disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-green-500 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? <><Loader2 className="animate-spin" size={18} /> Uploading Proof…</>
                  : <><CheckCircle2 size={18} /> Confirm & Close Ticket</>}
              </button>
              <p className="text-[10px] text-center text-slate-600">GPS match + photo proof required to close ticket</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
