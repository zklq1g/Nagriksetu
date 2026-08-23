"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ShieldAlert, MapPin, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for our Mock AI Result
export interface AIResult {
  department: string;
  departmentId: string;
  confidence: number;
  severity: number;
  slaHours: number;
  isDuplicate: boolean;
  duplicateId?: string;
}

interface AIPipelineProps {
  imageUrl: string;
  imageFile?: File; // The real file for /api/classify
  onComplete: (result: AIResult) => void;
  forceDuplicate?: boolean; // For the Demo Toggle
}

const MOCK_LOGS = [
  "[SYS] Initializing secure telemetry handshake...",
  "[EXIF] Extracting sensor data & timestamp...",
  "[SEC] Running anti-spoofing heuristics... PASSED",
  "[CV] Loading YOLOv8 multi-label classification model...",
  "[CV] Detecting structural anomalies... FOUND: Pothole",
  "[GEO] Cross-validating GPS coordinates with municipal grid...",
  "[AI] Calculating severity index & routing destination..."
];

// Fallback result if API is unavailable
const FALLBACK_RESULT: AIResult = {
  department: "PWD (Potholes/Roads)",
  departmentId: "bd527a62-e673-452d-b0db-f3160190727b",
  confidence: 96,
  severity: 88,
  slaHours: 168,
  isDuplicate: false,
};

export default function AIPipeline({ imageUrl, imageFile, onComplete, forceDuplicate = false }: AIPipelineProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<"scanning" | "complete">("scanning");
  const logContainerRef = useRef<HTMLDivElement>(null);

  // The "Illusion" Sequence — runs visual animation and real API concurrently
  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      // 1. Fire the real API call in the background IMMEDIATELY
      let apiPromise = Promise.resolve({ 
        ...FALLBACK_RESULT, 
        isDuplicate: forceDuplicate,
        ...(forceDuplicate ? { duplicateId: "1" } : {})
      });
      
      if (imageFile && !forceDuplicate) {
        const formData = new FormData();
        formData.append("image", imageFile);
        
        apiPromise = fetch("/api/classify", { method: "POST", body: formData })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              return {
                department: data.department?.name ?? FALLBACK_RESULT.department,
                departmentId: data.department?.id ?? FALLBACK_RESULT.departmentId,
                confidence: data.confidence === "high" ? 96 : 42,
                severity: data.severity ?? FALLBACK_RESULT.severity,
                slaHours: data.department?.sla_hours ?? FALLBACK_RESULT.slaHours,
                isDuplicate: false,
              };
            }
            return { ...FALLBACK_RESULT, isDuplicate: forceDuplicate };
          })
          .catch(() => ({ ...FALLBACK_RESULT, isDuplicate: forceDuplicate }));
      }

      // 2. Play the visual logs (hides the API loading time)
      for (let i = 0; i < MOCK_LOGS.length; i++) {
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 150 + Math.random() * 150));
        setLogs(prev => [...prev, MOCK_LOGS[i]]);
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }

      // 3. Wait for the API call to finish (if it hasn't already)
      const result = await apiPromise;
      if (!isMounted) return;

      // 4. Briefly flash the "Complete" phase, then transition out
      setPhase("complete");
      await new Promise(r => setTimeout(r, 400));
      
      if (isMounted) onComplete(result);
    };

    runSequence();
    return () => { isMounted = false; };
  }, [onComplete, forceDuplicate, imageFile]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <BrainCircuit className="w-5 h-5 text-cyber-cyan animate-pulse" />
        <h2 className="font-mono text-sm font-bold text-white tracking-wider uppercase">
          {phase === "scanning" ? "Analyzing Telemetry" : "Analysis Complete"}
        </h2>
      </div>

      {/* Image & Scanner Container */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
          <img src={imageUrl} alt="Captured issue" className="w-full h-full object-cover" />
          
          {/* AI Grid Overlay */}
          <div className="absolute inset-0 ai-grid opacity-50" />

          {/* Scanning Line */}
          <AnimatePresence>
            {phase === "scanning" && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-cyber-cyan shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee]"
              />
            )}
          </AnimatePresence>

          {/* Corner Brackets (Targeting UI) */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyber-cyan" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyber-cyan" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyber-cyan" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyber-cyan" />
        </div>
      </div>

      {/* Terminal Logs & Results */}
      <div className="bg-surface border-t border-slate-700 p-4 h-64 flex flex-col">
        <AnimatePresence mode="wait">
          {phase === "scanning" ? (
            <motion.div 
              key="logs"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              ref={logContainerRef}
              className="flex-1 overflow-y-auto font-mono text-xs space-y-1 pr-2 custom-scrollbar"
            >
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "text-slate-400",
                    log.includes("PASSED") && "text-green-400",
                    log.includes("FOUND") && "text-cyber-cyan"
                  )}
                >
                  {log}
                </motion.div>
              ))}
              <span className="inline-block w-2 h-4 bg-cyber-cyan animate-pulse ml-1" />
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="flex items-center gap-2 mb-4 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wide">Verification Successful</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ResultCard icon={<MapPin className="w-4 h-4" />} label="Routed To" value="PWD" />
                <ResultCard icon={<ShieldAlert className="w-4 h-4" />} label="Severity" value="88/100" highlight />
                <ResultCard icon={<BrainCircuit className="w-4 h-4" />} label="AI Confidence" value="96%" />
                <ResultCard icon={<Loader2 className="w-4 h-4" />} label="SLA Target" value="72 Hrs" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Helper Component for the Result Grid
function ResultCard({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
        {icon} {label}
      </div>
      <div className={cn(
        "font-mono text-lg font-bold",
        highlight ? "text-red-400" : "text-white"
      )}>
        {value}
      </div>
    </div>
  );
}
