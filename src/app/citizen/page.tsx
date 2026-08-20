'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, MapPin, Loader2, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

type Department = {
  id: string;
  name: string;
  sla_hours: number;
  color: string;
};

type AIStatus = 'idle' | 'analyzing' | 'done' | 'error';

export default function CitizenReport() {
  const supabase = createClient();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [detectedDept, setDetectedDept] = useState<Department | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.from('departments').select('*');
      if (data) setDepartments(data);
    };
    fetchDepartments();
  }, [supabase]);

  // Auto-classify image using Gemini Vision as soon as photo is taken
  const handleImageCapture = async (file: File) => {
    setImageFile(file);
    setDetectedDept(null);
    setAiStatus('analyzing');

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Call Gemini API
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/classify', { method: 'POST', body: formData });
      const { department } = await res.json();

      // Match department name to our DB
      const matched = departments.find(d => d.name === department);
      if (matched) {
        setDetectedDept(matched);
        setAiStatus('done');
      } else {
        setAiStatus('error');
      }
    } catch {
      setAiStatus('error');
    }
  };

  // GPS Lock
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('Location access is required to report an issue.')
    );
  };

  // Submit to Supabase
  const handleSubmit = async () => {
    if (!location || !imageFile || !detectedDept) return;
    setIsSubmitting(true);

    const fileName = `${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('issues')
      .upload(fileName, imageFile);

    if (uploadError) {
      alert('Image upload failed: ' + uploadError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('issues').getPublicUrl(fileName);

    const { error: dbError } = await supabase.from('issues').insert({
      department_id: detectedDept.id,
      image_url: publicUrl,
      lat: location.lat,
      lng: location.lng,
      user_id: '00000000-0000-0000-0000-000000000000',
    });

    if (!dbError) {
      const id = Math.floor(1000 + Math.random() * 9000).toString();
      setTrackingId(id);
      setSuccess(true);
    } else {
      alert('Submission failed: ' + dbError.message);
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Report Submitted!</h2>
          <p className="text-gray-500">Your issue has been routed to</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-bold text-blue-700">{detectedDept?.name}</p>
            <p className="text-sm text-blue-500">SLA: {detectedDept?.sla_hours} hours to resolve</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-500">Your Tracking ID</p>
            <p className="text-2xl font-mono font-bold text-gray-800">#{trackingId}</p>
          </div>
          <button
            onClick={() => { setSuccess(false); setImageFile(null); setImagePreview(null); setDetectedDept(null); setLocation(null); setAiStatus('idle'); }}
            className="w-full p-3 bg-gray-800 text-white rounded-lg font-semibold"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">🏛️ NagrikSetu</h1>
        <p className="text-sm text-gray-500 mt-1">Report a civic issue in seconds</p>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md space-y-5">

        {/* Step 1: Live Camera */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Step 1 — Snap a Live Photo</p>
          <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Camera size={36} />
                <span className="mt-2 text-sm font-medium">Tap to take a live photo</span>
                <span className="text-xs text-red-400 mt-1">Gallery uploads disabled</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageCapture(file);
              }}
            />
          </label>
        </div>

        {/* AI Detection Result */}
        {aiStatus === 'analyzing' && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <Loader2 size={20} className="text-purple-600 animate-spin" />
            <div>
              <p className="font-semibold text-purple-700">AI Analyzing Photo...</p>
              <p className="text-xs text-purple-500">Detecting issue type automatically</p>
            </div>
          </div>
        )}

        {aiStatus === 'done' && detectedDept && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <Sparkles size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-green-500 font-medium">AI Detected — Auto-Routed To</p>
              <p className="font-bold text-green-800">{detectedDept.name}</p>
              <p className="text-xs text-green-600">⏱ SLA: {detectedDept.sla_hours} hours to resolve</p>
            </div>
          </div>
        )}

        {aiStatus === 'error' && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm text-red-600">Could not detect issue type. Please retake photo.</p>
          </div>
        )}

        {/* Step 2: GPS Lock */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Step 2 — Lock Your Location</p>
          <button
            onClick={requestLocation}
            className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
              location
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <MapPin size={20} />
            {location
              ? `📍 Locked (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
              : 'Get My Live Location'}
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!location || !imageFile || aiStatus !== 'done' || isSubmitting}
          className="w-full p-4 bg-gray-900 text-white rounded-xl font-bold text-base disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : '🚀 Submit Report'}
        </button>

        {(!location || !imageFile || aiStatus !== 'done') && (
          <p className="text-center text-xs text-gray-400">
            {!imageFile ? '📷 Take a photo first' : aiStatus === 'analyzing' ? '🤖 Wait for AI to detect...' : !location ? '📍 Then lock your location' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
