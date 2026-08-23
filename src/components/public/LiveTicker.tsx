"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { recentResolutions } from "@/data/mockPublicData";
import { getLocalIssues, DEPARTMENTS } from "@/lib/localDB";

export default function LiveTicker() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchResolutions = () => {
      const issues = getLocalIssues()
        .filter(i => i.status === "Resolved")
        .sort((a, b) => new Date(b.resolved_at || b.created_at).getTime() - new Date(a.resolved_at || a.created_at).getTime())
        .slice(0, 10);

      if (issues && issues.length > 0) {
        const formatted = issues.map((row: any) => {
          const dept = DEPARTMENTS.find(d => d.id === row.department_id);
          const deptName = dept?.name ?? "Dept";
          const desc = row.description ?? "Civic Issue";
          const resolvedAt = row.resolved_at
            ? getTimeAgo(new Date(row.resolved_at))
            : "recently";
          return `✅ ${deptName} resolved '${desc}' — ${resolvedAt}`;
        });
        setItems([...formatted, ...formatted]);
      } else {
        setItems([...recentResolutions, ...recentResolutions]);
      }
    };

    fetchResolutions();
  }, []);

  if (items.length === 0) return null;

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

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? "s" : ""} ago`;
}
