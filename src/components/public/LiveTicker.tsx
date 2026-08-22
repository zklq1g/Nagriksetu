"use client";

import { motion } from "framer-motion";
import { recentResolutions } from "@/data/mockPublicData";

export default function LiveTicker() {
  // Duplicate array for seamless infinite scroll
  const items = [...recentResolutions, ...recentResolutions];

  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] bg-surface/90 backdrop-blur-md border-b border-slate-700 overflow-hidden h-10 flex items-center">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface to-transparent z-10" />
      
      <motion.div
        className="flex whitespace-nowrap gap-12 px-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-xs font-mono font-bold text-cyber-cyan flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
