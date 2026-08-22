"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, AlertTriangle, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GPSLockProps {
  onLocationAcquired: (lat: number, lng: number) => void;
  onReset: () => void;
  isLocked: boolean;
}

export default function GPSLock({ onLocationAcquired, onReset, isLocked }: GPSLockProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      toast.error("Browser Error", { description: "Geolocation not supported." });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        onLocationAcquired(latitude, longitude);
        setIsLoading(false);
        toast.success("GPS Locked", { 
          description: `Coordinates verified: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
        });
      },
      (err) => {
        setIsLoading(false);
        let errorMsg = "Failed to acquire location.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Location access denied. Please enable in browser settings.";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "GPS request timed out. Please try again.";
        }
        setError(errorMsg);
        toast.error("GPS Error", { description: errorMsg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Force fresh location
      }
    );
  };

  return (
    <motion.div 
      layout
      className={cn(
        "w-full rounded-xl border transition-all duration-300 overflow-hidden",
        isLocked 
          ? "bg-green-500/5 border-green-500/30" 
          : error 
            ? "bg-red-500/5 border-red-500/30" 
            : "bg-slate-800/50 border-slate-700"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon State */}
          <div className={cn(
            "p-2 rounded-lg",
            isLocked ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
          )}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyber-cyan" />
            ) : isLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </div>

          {/* Text State */}
          <div>
            <h4 className="font-bold text-white text-sm">
              {isLoading ? "Acquiring Satellite Lock..." : isLocked ? "GPS Coordinates Locked" : "Location Verification Required"}
            </h4>
            
            {isLocked && coords && (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="font-mono text-xs text-green-400 mt-0.5"
              >
                LAT: {coords.lat.toFixed(6)} | LNG: {coords.lng.toFixed(6)}
              </motion.p>
            )}
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-400 mt-0.5 flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" /> {error}
              </motion.p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {!isLocked && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={requestLocation}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              isLoading 
                ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                : "bg-cyber-blue hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            )}
          >
            {isLoading ? "Scanning" : "Acquire GPS"}
          </motion.button>
        )}

        {isLocked && (
          <button 
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
          >
            <Unlock className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Loading Radar Ping Effect */}
      {isLoading && (
        <div className="h-1 w-full bg-slate-700 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cyber-cyan"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </motion.div>
  );
}
