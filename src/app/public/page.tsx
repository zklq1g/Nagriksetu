"use client";

import { ArrowLeft, BarChart3, Globe } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LiveTicker from "@/components/public/LiveTicker";
import Leaderboard from "@/components/public/Leaderboard";

// Dynamically import map to prevent SSR window errors
const PublicHeatmap = dynamic(() => import("@/components/public/PublicHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Globe className="w-10 h-10 text-cyber-cyan animate-pulse" />
        <p className="font-mono text-sm text-slate-400">Loading Civic Telemetry...</p>
      </div>
    </div>
  )
});

export default function PublicDashboard() {
  return (
    <div className="h-screen w-full relative bg-background overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="absolute top-10 left-4 z-[1001] flex items-center gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-cyber-cyan/50 transition-all shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Exit</span>
        </Link>
        
        <div className="px-4 py-2 bg-surface/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-cyber-cyan" />
          <div>
            <h1 className="text-sm font-black text-white tracking-tight">RADICAL TRANSPARENCY</h1>
            <p className="text-[10px] font-mono text-slate-400">Delhi NCR // Live Civic Data</p>
          </div>
        </div>
      </header>

      {/* Live Ticker */}
      <LiveTicker />

      {/* The Map */}
      <div className="absolute inset-0 z-0">
        <PublicHeatmap />
      </div>

      {/* Leaderboard Overlay */}
      <Leaderboard />

      {/* Bottom Left Stats (Mobile friendly alternative to leaderboard) */}
      <div className="absolute bottom-4 left-4 z-[1000] md:hidden glass p-4 rounded-xl shadow-2xl max-w-[calc(100%-2rem)]">
        <h3 className="text-xs font-black text-white mb-2 uppercase tracking-wider">System Status</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-cyber-cyan font-mono">1,204</p>
            <p className="text-[10px] text-slate-400 uppercase">Resolved Today</p>
          </div>
          <div>
            <p className="text-2xl font-black text-green-400 font-mono">94%</p>
            <p className="text-[10px] text-slate-400 uppercase">SLA Compliance</p>
          </div>
        </div>
      </div>

    </div>
  );
}
