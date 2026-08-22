"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import CameraCapture from "@/components/citizen/CameraCapture";
import AIPipeline, { AIResult } from "@/components/citizen/AIPipeline";
// Note: We will build GPSLock in the next step, using a mock for now
// import GPSLock from "@/components/citizen/GPSLock"; 

export default function CitizenPortal() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Demo State
  const [demoMode, setDemoMode] = useState<"normal" | "duplicate">("normal");
  const [gpsLocked, setGpsLocked] = useState(false); // Mock state for now

  const handleImageCaptured = (url: string) => {
    setCapturedImage(url);
    setIsScanning(true);
  };

  const handlePipelineComplete = (result: AIResult) => {
    setAiResult(result);
    setIsScanning(false);
    
    if (result.isDuplicate) {
      toast.warning("Duplicate Detected", {
        description: "Haversine Geofencing & pHash Match: Merged as UPVOTE.",
        duration: 5000
      });
    } else {
      toast.success("Issue Classified", {
        description: `Auto-routed to ${result.department}.`
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-surface/50 backdrop-blur sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold">Back</span>
        </Link>
        <h1 className="font-black tracking-tight text-white">Report Issue</h1>
        
        {/* The Demo Toggle */}
        <button 
          onClick={() => setDemoMode(demoMode === "normal" ? "duplicate" : "normal")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
            demoMode === "duplicate" 
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" 
              : "bg-slate-800 border-slate-700 text-slate-400"
          )}
        >
          {demoMode === "duplicate" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          QA: {demoMode === "duplicate" ? "Duplicate" : "Normal"}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <CameraCapture onImageCaptured={handleImageCaptured} />
            </motion.div>
          ) : (
            !isScanning && aiResult && (
              <motion.div
                key="submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6"
              >
                {/* AI Result Summary */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  aiResult.isDuplicate 
                    ? "bg-yellow-500/5 border-yellow-500/20" 
                    : "bg-green-500/5 border-green-500/20"
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    {aiResult.isDuplicate ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <MapPin className="w-5 h-5 text-green-400" />
                    )}
                    <h3 className="font-bold text-white">
                      {aiResult.isDuplicate ? "Duplicate Report Detected" : "Ready for Submission"}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400">
                    {aiResult.isDuplicate 
                      ? "An identical issue was reported 12 minutes ago within 15 meters. Your report has been merged as an upvote to increase SLA priority."
                      : `Issue classified as high severity. Routed to ${aiResult.department} with a ${aiResult.slaHours}-hour resolution SLA.`
                    }
                  </p>
                </div>

                {/* GPS Lock & Submit (Mocked for now) */}
                <div className="space-y-4">
                  <button
                    onClick={() => setGpsLocked(true)} // Mocking the GPS lock
                    disabled={gpsLocked}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                      gpsLocked 
                        ? "bg-green-500/10 text-green-400 border border-green-500/30" 
                        : "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    {gpsLocked ? "GPS Coordinates Locked" : "Acquire Live GPS Coordinates"}
                  </button>

                  <button
                    disabled={!gpsLocked || aiResult.isDuplicate}
                    onClick={() => toast.success("Report Submitted", { description: "Ticket ID: #NS-9942X" })}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-sm transition-all",
                      gpsLocked && !aiResult.isDuplicate
                        ? "bg-cyber-blue hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    {aiResult.isDuplicate ? "Merged as Upvote" : "Submit Verified Report"}
                  </button>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* The AI Pipeline Overlay */}
      <AnimatePresence>
        {isScanning && capturedImage && (
          <AIPipeline 
            imageUrl={capturedImage} 
            onComplete={handlePipelineComplete}
            forceDuplicate={demoMode === "duplicate"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
