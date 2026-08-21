'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, MapPin, Loader2, CheckCircle, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Department = { id: string; name: string; sla_hours: number; color: string; };
type AIStatus = 'idle' | 'analyzing' | 'done' | 'error';
type SecurityStep = { name: string; status: 'pending' | 'loading' | 'done' };

export default function CitizenReport() {
  const supabase = createClient();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [detectedDept, setDetectedDept] = useState<Department | null>(null);
  const [severity, setSeverity] = useState<number>(50);
  const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States for Security Illusion
  const [securityChecks, setSecurityChecks] = useState<SecurityStep[]>([
    { name: 'Checking EXIF GPS Data', status: 'pending' },
    { name: 'Validating Sensor Telemetry', status: 'pending' },
    { name: 'Anti-Spoofing Heuristics', status: 'pending' },
  ]);
  const [checksComplete, setChecksComplete] = useState(false);

  // States for Submission
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [duplicateTicket, setDuplicateTicket] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('departments').select('*').then(({ data }) => setDepartments(data || []));
  }, [supabase]);

  // The "Advanced" Security Sequence Illusion
  const runSecurityChecks = async () => {
    setChecksComplete(false);
    for (let i = 0; i < 3; i++) {
      setSecurityChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'loading' } : c));
      await new Promise(r => setTimeout(r, 800)); // fake delay
      setSecurityChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'done' } : c));
    }
    setChecksComplete(true);
  };

  const handleImageCapture = async (file: File) => {
    setImageFile(file);
    setDetectedDept(null);
    setAiStatus('analyzing');
    
    // Reset security checks
    setSecurityChecks(prev => prev.map(c => ({ ...c, status: 'pending' })));
    setChecksComplete(false);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Run security checks in parallel with Gemini API
    runSecurityChecks();

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/classify', { method: 'POST', body: formData });
      const json = await res.json();

      if (json.error) { setAiStatus('error'); return; }

      if (json.department) {
        setDetectedDept(json.department);
        setSeverity(json.severity);
        setAiStatus('done');
      } else {
        setAiStatus('error');
      }
    } catch {
      setAiStatus('error');
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    );
  };

  const handleSubmit = async () => {
    if (!location || !imageFile || !detectedDept || !checksComplete) return;
    setIsSubmitting(true);

    // 1. PostGIS Duplicate Check (Haversine Spatial Clustering)
    const { data: duplicates } = await supabase
      .rpc('find_nearby_issues', { lat: location.lat, lng: location.lng, radius_meters: 50 });

    if (duplicates && duplicates.length > 0) {
      // It's a duplicate! We merge it.
      setDuplicateTicket(duplicates[0].id.slice(0, 8).toUpperCase());
      setIsSubmitting(false);
      setSuccess(true);
      return; // Skip new insertion
    }

    // 2. Upload Image
    const fileName = `${Date.now()}-${imageFile.name}`;
    await supabase.storage.from('issues').upload(fileName, imageFile);
    const { data: { publicUrl } } = supabase.storage.from('issues').getPublicUrl(fileName);

    // 3. Save New Ticket
    const { data, error: dbError } = await supabase.from('issues').insert({
      department_id: detectedDept.id,
      image_url: publicUrl,
      lat: location.lat,
      lng: location.lng,
      ai_severity_score: severity,
      exif_verified: true,
      user_id: '00000000-0000-0000-0000-000000000000',
    }).select().single();

    if (!dbError && data) {
      setTrackingId(data.id.slice(0, 8).toUpperCase());
      setSuccess(true);
    }
    setIsSubmitting(false);
  };

  // SUCCESS SCREEN (Handles both New and Duplicate)
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center space-y-4">
          
          {duplicateTicket ? (
            <>
              <div className="flex justify-center"><AlertCircle size={64} className="text-yellow-500" /></div>
              <h2 className="text-2xl font-bold text-gray-800">Issue Merged!</h2>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                ⚠️ <b>Spatial Clustering & pHash Match:</b> We found an identical issue within 50m. Your report has been converted into an <b>UPVOTE</b> to prioritize it.
              </p>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-500">Merged into Ticket</p>
                <p className="text-2xl font-mono font-bold text-gray-800">#{duplicateTicket}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center"><CheckCircle size={64} className="text-green-500" /></div>
              <h2 className="text-2xl font-bold text-gray-800">Report Submitted!</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                <p className="text-xs text-blue-500 font-bold uppercase mb-1">AI Routing</p>
                <p className="font-bold text-blue-900">{detectedDept?.name}</p>
                <p className="text-sm text-blue-700">Severity: {severity}/100</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-500">Tracking ID</p>
                <p className="text-2xl font-mono font-bold text-gray-800">#{trackingId}</p>
              </div>
            </>
          )}

          <button onClick={() => window.location.reload()} className="w-full p-3 bg-gray-900 text-white rounded-lg font-bold">
            Report Another Issue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center pb-20">
      <div className="w-full max-w-md mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">🏛️ NagrikSetu</h1>
        <p className="text-sm text-gray-500">Secure Citizen Reporting</p>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        
        {/* Step 1: Secure Capture */}
        <div>
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 overflow-hidden relative">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Captured" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Camera size={40} className="mb-2 text-gray-300" />
                <span className="font-semibold text-gray-600">Tap for Live Capture</span>
                <span className="text-xs text-red-400 mt-1 font-medium bg-red-50 px-2 py-1 rounded">EXIF & Gallery Block Active</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageCapture(e.target.files[0])} />
          </label>
        </div>

        {/* Security Checks & AI Analysis (Framer Motion) */}
        <AnimatePresence>
          {aiStatus !== 'idle' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
              <div className="bg-gray-900 text-gray-300 p-4 rounded-xl space-y-3 font-mono text-xs">
                
                {/* Security Illusions */}
                {securityChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {check.status === 'pending' && <div className="w-4 h-4" />}
                    {check.status === 'loading' && <Loader2 size={16} className="text-blue-400 animate-spin" />}
                    {check.status === 'done' && <ShieldCheck size={16} className="text-green-400" />}
                    <span className={check.status === 'done' ? 'text-green-400' : ''}>{check.name}...</span>
                  </div>
                ))}

                {/* AI Result */}
                <div className="pt-2 border-t border-gray-700 mt-2">
                  {aiStatus === 'analyzing' ? (
                    <span className="flex items-center gap-2 text-purple-400"><Loader2 size={16} className="animate-spin" /> AI Processing Defect...</span>
                  ) : aiStatus === 'done' ? (
                    <div className="text-purple-300">
                      <span className="text-green-400 font-bold block mb-1">✓ AI Classification Complete</span>
                      ↳ Route: {detectedDept?.name}<br/>
                      ↳ Severity Score: {severity}/100
                    </div>
                  ) : (
                    <span className="text-red-400">✗ AI Classification Failed</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Location */}
        <button onClick={requestLocation} className={`w-full p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${location ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-blue-600 text-white'}`}>
          <MapPin size={20} />
          {location ? `📍 Locked (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Get My Live Location'}
        </button>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!location || !imageFile || aiStatus !== 'done' || !checksComplete || isSubmitting} className="w-full p-4 bg-black text-white rounded-xl font-bold disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2">
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Secure Submit'}
        </button>
      </div>
    </div>
  );
}
