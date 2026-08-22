"use client";

import { useRef, useState } from "react";
import { Camera, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void;
}

export default function CameraCapture({ onImageCaptured }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Edge Case: Ensure it's an image
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File", { description: "Please capture a photo." });
      return;
    }

    setIsProcessing(true);
    const objectUrl = URL.createObjectURL(file);
    
    // Simulate a tiny delay before starting the heavy AI pipeline
    setTimeout(() => {
      onImageCaptured(objectUrl);
      setIsProcessing(false);
    }, 300);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="citizen-camera"
      />

      <motion.label
        htmlFor="citizen-camera"
        whileTap={{ scale: 0.95 }}
        className="relative flex flex-col items-center justify-center w-full max-w-sm aspect-square rounded-3xl border-2 border-dashed border-slate-700 bg-surface/50 hover:bg-surface hover:border-cyber-cyan/50 transition-all duration-300 cursor-pointer group overflow-hidden"
      >
        {/* Background Glow on Hover */}
        <div className="absolute inset-0 bg-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
          <div className="p-4 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-cyan/50 group-hover:shadow-cyber-glow transition-all duration-300">
            <Camera className="w-10 h-10 text-slate-400 group-hover:text-cyber-cyan transition-colors" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Capture Civic Issue</h3>
            <p className="text-sm text-slate-400 font-medium flex items-center gap-2 justify-center">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              Live camera only. Gallery disabled.
            </p>
          </div>
        </div>
      </motion.label>
    </div>
  );
}
