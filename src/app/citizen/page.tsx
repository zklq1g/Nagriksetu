'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, MapPin, Loader2, CheckCircle } from 'lucide-react';

export default function CitizenReport() {
  const supabase = createClient();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deptId, setDeptId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.from('departments').select('*');
      if (data) setDepartments(data);
    };
    fetchDepartments();
  }, [supabase]);

  // 1. The GPS Lock
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("Location access is required to report an issue.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // 2. Submit to Supabase Storage & Database
  const handleSubmit = async () => {
    if (!location || !imageFile || !deptId) return;
    setIsSubmitting(true);

    // Upload Image to Supabase Storage
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('issues')
      .upload(fileName, imageFile);

    if (uploadError) { 
      alert("Image upload failed: " + uploadError.message); 
      setIsSubmitting(false); 
      return; 
    }

    const { data: { publicUrl } } = supabase.storage.from('issues').getPublicUrl(fileName);

    // Save to Database
    const { error: dbError } = await supabase.from('issues').insert({
      department_id: deptId,
      image_url: publicUrl,
      lat: location.lat,
      lng: location.lng,
      user_id: '00000000-0000-0000-0000-000000000000' 
    });

    if (dbError) {
      alert("Database error: " + dbError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); 
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Report a Civic Issue</h1>
      
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-4">
        {/* Department Selection */}
        <select 
          className="w-full p-3 border rounded-lg text-black" 
          onChange={(e) => setDeptId(e.target.value)}
          value={deptId}
        >
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name} - {dept.sla_hours}hr SLA</option>
          ))}
        </select>

        {/* Anti-Spam: Live Camera Only */}
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          {imageFile ? (
            <span className="text-green-600 font-semibold flex items-center gap-2"><CheckCircle size={20}/> Photo Captured</span>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <Camera size={32} />
              <span className="mt-2 text-sm">Tap to take a live photo</span>
              <span className="text-xs text-red-500 mt-1">*Gallery uploads disabled</span>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
          />
        </label>

        {/* GPS Lock Button */}
        <button 
          onClick={requestLocation}
          className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${location ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <MapPin size={20} />
          {location ? `Location Locked (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Get My Live Location'}
        </button>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={!location || !imageFile || !deptId || isSubmitting}
          className="w-full p-4 bg-gray-800 text-white rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Report'}
        </button>
        
        {success && <p className="text-center text-green-600 font-bold">Report Submitted Successfully! Tracking ID: #8492</p>}
      </div>
    </div>
  );
}
