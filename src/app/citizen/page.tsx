"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getLocalIssues, saveLocalIssue, updateLocalIssue, compressImage, Issue } from "@/lib/localDB";

import CameraCapture from "@/components/citizen/CameraCapture";
import AIPipeline, { AIResult } from "@/components/citizen/AIPipeline";
import GPSLock from "@/components/citizen/GPSLock";

// Demo user UUID — in production this comes from Supabase Auth
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export default function CitizenPortal() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real GPS State
  const [gpsLocked, setGpsLocked] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Demo State
  const [demoMode, setDemoMode] = useState<"normal" | "duplicate">("normal");

  const handleImageCaptured = (url: string, file: File) => {
    setCapturedImage(url);
    setCapturedFile(file);
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

  // Haversine formula to calculate distance in meters
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleLocationAcquired = async (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setGpsLocked(true);

    // Real Duplicate Detection Check (Local)
    if (aiResult && !aiResult.isDuplicate && demoMode !== "duplicate") {
      const existingIssues = getLocalIssues().filter(i => i.status === "Open");
      
      for (const issue of existingIssues) {
        if (issue.department_id === aiResult.departmentId && getDistance(lat, lng, issue.lat, issue.lng) < 50) {
          setAiResult({ ...aiResult, isDuplicate: true, duplicateId: issue.id });
          toast.warning("Duplicate Detected", {
            description: "An identical issue was found nearby.",
            duration: 5000
          });
          break;
        }
      }
    }
  };

  const handleResetFlow = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setAiResult(null);
    setGpsLocked(false);
    setUserLocation(null);
  };

  const handleUpvote = () => {
    if (!aiResult || !aiResult.duplicateId) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const issues = getLocalIssues();
      const existing = issues.find(i => i.id === aiResult.duplicateId);
      if (existing) {
        updateLocalIssue(existing.id, {
          upvotes: (existing.upvotes || 1) + 1
        });
        toast.success("Upvoted Existing Issue", {
          description: "Your report has been merged as an upvote. Priority increased!"
        });
      }
      setIsSubmitting(false);
      handleResetFlow();
    }, 600); // tiny delay for UX
  };

  const handleSubmit = async () => {
    if (!capturedFile || !userLocation || !aiResult) return;
    setIsSubmitting(true);

    try {
      // Compress and convert image to base64 for local storage
      const base64Image = await compressImage(capturedFile, 600);

      const newIssue: Issue = {
        id: crypto.randomUUID(),
        user_id: DEMO_USER_ID,
        department_id: aiResult.departmentId,
        image_url: base64Image,
        lat: userLocation.lat,
        lng: userLocation.lng,
        status: "Open",
        ai_confidence: aiResult.confidence,
        ai_severity_score: aiResult.severity,
        description: `Reported via Citizen Portal — ${aiResult.department}`,
        created_at: new Date().toISOString()
      };

      saveLocalIssue(newIssue);

      const ticketId = newIssue.id.slice(0, 8).toUpperCase();
      toast.success("Report Submitted", {
        description: `Ticket #NS-${ticketId} filed. SLA: ${aiResult.slaHours}h`,
        duration: 5000,
      });
      handleResetFlow();
    } catch (err: any) {
      toast.error("Submission Failed", {
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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

                {/* REAL GPS Lock Component */}
                <GPSLock
                  isLocked={gpsLocked}
                  onLocationAcquired={handleLocationAcquired}
                  onReset={() => setGpsLocked(false)}
                  autoAcquire={true}
                />

                {/* Submit / Upvote Button */}
                {aiResult.isDuplicate ? (
                  <button
                    disabled={!gpsLocked || isSubmitting}
                    onClick={handleUpvote}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                      gpsLocked && !isSubmitting
                        ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? "Merging as Upvote..." : "👍 Upvote Existing Issue"}
                  </button>
                ) : (
                  <button
                    disabled={!gpsLocked || isSubmitting}
                    onClick={handleSubmit}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                      gpsLocked && !isSubmitting
                        ? "bg-cyber-blue hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Verified Report"}
                  </button>
                )}
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
            imageFile={capturedFile ?? undefined}
            onComplete={handlePipelineComplete}
            forceDuplicate={demoMode === "duplicate"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
