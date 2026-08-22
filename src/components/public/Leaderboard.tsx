"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import { departmentStats } from "@/data/mockPublicData";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.5 }}
      className="absolute top-24 right-4 z-[1000] w-80 glass rounded-xl overflow-hidden shadow-2xl hidden md:block"
    >
      <div className="p-4 border-b border-white/10 bg-slate-800/50 flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" /> Dept. Accountability
        </h3>
        <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> LIVE
        </span>
      </div>

      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {departmentStats.map((dept, i) => {
          const percentage = Math.round((dept.resolved / dept.total) * 100);
          return (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-200">{dept.name}</span>
                <span className="text-xs font-mono text-slate-400">
                  {dept.resolved}/{dept.total}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.8 + (i * 0.1), ease: "easeOut" }}
                  className={cn("h-full rounded-full", dept.color)}
                />
              </div>
              <div className="flex justify-end">
                <span className={cn(
                  "text-[10px] font-black",
                  percentage > 80 ? "text-green-400" : percentage > 50 ? "text-yellow-400" : "text-red-400"
                )}>
                  {percentage}% SLA Met
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
