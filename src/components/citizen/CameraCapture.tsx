"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, AlertTriangle, Aperture, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string, file: File) => void;
}

export default function CameraCapture({ onImageCaptured }: CameraCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      toast.error("Camera Access Denied", { 
        description: "Please allow camera permissions in your browser." 
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    if (ctx) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          setIsProcessing(true);
          const file = new File([blob], `citizen-report-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const objectUrl = URL.createObjectURL(file);
          
          stopCamera();
          
          // Tiny delay to simulate processing before moving to next step
          setTimeout(() => {
            onImageCaptured(objectUrl, file);
            setIsProcessing(false);
          }, 300);
        }
      }, 'image/jpeg', 0.85);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {!isCameraActive ? (
        <motion.button
          onClick={startCamera}
          whileTap={{ scale: 0.95 }}
          className="relative flex flex-col items-center justify-center w-full max-w-sm aspect-square rounded-3xl border-2 border-dashed border-slate-700 bg-surface/50 hover:bg-surface hover:border-cyber-cyan/50 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
            <div className="p-4 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyber-cyan/50 group-hover:shadow-cyber-glow transition-all duration-300">
              <Camera className="w-10 h-10 text-slate-400 group-hover:text-cyber-cyan transition-colors" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Capture Civic Issue</h3>
              <p className="text-sm text-slate-400 font-medium flex items-center gap-2 justify-center">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                Live camera feed (Works on PC & Mobile)
              </p>
            </div>
          </div>
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-black border-2 border-cyber-cyan/50 shadow-cyber-glow"
        >
          <video 
            ref={videoRef} 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 z-20">
            <button 
              onClick={stopCamera} 
              className="w-12 h-12 bg-slate-800/80 backdrop-blur text-white rounded-full flex items-center justify-center border border-slate-600 hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
            
            <button 
              onClick={takePhoto} 
              disabled={isProcessing}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-slate-300 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Aperture size={32} className="text-slate-900" />
            </button>
            
            <div className="w-12 h-12" /> {/* Spacer to balance layout */}
          </div>
          
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
          <div className="absolute inset-x-12 inset-y-24 border-2 border-white/20 rounded-xl pointer-events-none" />
        </motion.div>
      )}
    </div>
  );
}
