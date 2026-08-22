"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BrainCircuit, AlertTriangle, CheckCircle2, 
  Loader2, Server, Eye, MapPin, ShieldAlert 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockAdminTickets, AdminTicket } from "@/data/mockAdminData";
import { delay } from "@/lib/utils";
import dynamic from "next/dynamic";

const GodViewMap = dynamic(() => import("@/components/admin/GodViewMap"), { ssr: false });

export default function AdminPortal() {
  const [tickets, setTickets] = useState<AdminTicket[]>(mockAdminTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const unassignedTickets = tickets.filter(t => t.status === 'Unassigned');
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved');
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Simulate AI Fallback Assignment
  const handleAssign = async (id: string) => {
    toast.info("Analyzing context...", { description: "Routing to best-fit department." });
    await delay(1500);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Open', department: 'Sanitation Dept' } : t));
    toast.success("Ticket Assigned", { description: `${id} routed to Sanitation Dept.` });
  };

  // Simulate Computer Vision Closure Verification
  const handleVerifyClosure = async (id: string) => {
    setVerifyingId(id);
    toast.loading("Running Computer Vision Structural Comparison...", { id: "cv-scan" });
    
    await delay(2500); // The Illusion
    
    setVerifyingId(null);
    toast.success("Defect Resolved. AI Match Confirmed.", { 
      id: "cv-scan",
      description: "Before/After structural delta exceeds 90% threshold." 
    });
    
    // Remove from resolved list in UI
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  // Simulate CPGRAMS Sync
  const handleSyncCPGRAMS = () => {
    toast.info("Initiating CPGRAMS Handshake...", {
      description: "Encrypting payload for Ministry of Housing & Urban Affairs."
    });
    setTimeout(() => {
      toast.success("Sync Complete", {
        description: `Pushed ${unassignedTickets.length} unresolved tickets to Central Gov API.`,
        action: { label: "View Logs", onClick: () => console.log("Mock Log Click") }
      });
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-white overflow-hidden">
      {/* Top Nav */}
      <header className="h-16 border-b border-slate-800 bg-surface/50 backdrop-blur flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">Exit</span>
          </Link>
          <div className="h-6 w-px bg-slate-700" />
          <h1 className="font-black tracking-tighter text-xl flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyber-cyan" />
            NAGRIK SETU <span className="text-slate-500 font-medium text-sm">COMMAND CENTER</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSyncCPGRAMS}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold transition-all"
          >
            <Server className="w-3 h-3 text-cyber-cyan" />
            Sync to CPGRAMS
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-400 font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Data & Queues */}
        <aside className="w-[400px] border-r border-slate-800 flex flex-col bg-surface/30 shrink-0">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 border-b border-slate-800">
            <div className="p-4 border-r border-slate-800">
              <p className="text-xs text-slate-500 font-bold uppercase">Unassigned</p>
              <p className="text-2xl font-black text-yellow-400 font-mono">{unassignedTickets.length}</p>
            </div>
            <div className="p-4 border-r border-slate-800">
              <p className="text-xs text-slate-500 font-bold uppercase">Active SLA</p>
              <p className="text-2xl font-black text-red-400 font-mono">{tickets.filter(t=>t.status==='Open').length}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 font-bold uppercase">Pending CV</p>
              <p className="text-2xl font-black text-green-400 font-mono">{resolvedTickets.length}</p>
            </div>
          </div>

          {/* Scrollable Queues */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            {/* AI Fallback Queue */}
            <div className="p-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <BrainCircuit className="w-3 h-3 text-yellow-500" /> AI Fallback Queue
              </h2>
              <div className="space-y-2">
                {unassignedTickets.map(ticket => (
                  <motion.div 
                    key={ticket.id}
                    layout
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all group",
                      selectedTicketId === ticket.id 
                        ? "bg-yellow-500/10 border-yellow-500/50" 
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-600"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-cyber-cyan font-bold">{ticket.id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        CONF: {ticket.aiConfidence}%
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mb-2">{ticket.title}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAssign(ticket.id); }}
                      className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded transition-colors"
                    >
                      Manual Override & Assign
                    </button>
                  </motion.div>
                ))}
                {unassignedTickets.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">Queue Clear. AI routing nominal.</p>
                )}
              </div>
            </div>

            {/* Closure Verification Queue */}
            <div className="p-4 border-t border-slate-800">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Eye className="w-3 h-3 text-green-500" /> CV Closure Verification
              </h2>
              <div className="space-y-2">
                {resolvedTickets.map(ticket => (
                  <div key={ticket.id} className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-16 rounded bg-slate-800 overflow-hidden border border-slate-700">
                        <img src={ticket.citizenImage} alt="Before" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-16 h-16 rounded bg-slate-800 overflow-hidden border border-slate-700">
                        <img src={ticket.workerImage} alt="After" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-xs text-cyber-cyan font-bold">{ticket.id}</p>
                        <p className="text-xs text-slate-400">{ticket.department}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleVerifyClosure(ticket.id)}
                      disabled={verifyingId === ticket.id}
                      className="w-full py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2"
                    >
                      {verifyingId === ticket.id ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Scanning Structural Delta...</>
                      ) : (
                        <><CheckCircle2 className="w-3 h-3" /> Verify Resolution</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: God View Map */}
        <main className="flex-1 relative">
          <GodViewMap 
            tickets={tickets} 
            selectedTicketId={selectedTicketId} 
            onSelectTicket={setSelectedTicketId} 
          />
          
          {/* Selected Ticket Detail Overlay */}
          <AnimatePresence>
            {selectedTicket && (
              <motion.div 
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-4 left-4 w-80 bg-surface/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[1000]"
              >
                <div className="relative h-40 bg-slate-800">
                  <img src={selectedTicket.citizenImage} alt="Issue" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                  <button 
                    onClick={() => setSelectedTicketId(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded text-white hover:bg-black transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-cyber-cyan font-bold">{selectedTicket.id}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      selectedTicket.status === 'Unassigned' ? "bg-yellow-500/10 text-yellow-400" :
                      selectedTicket.status === 'Resolved' ? "bg-green-500/10 text-green-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white">{selectedTicket.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                      <p className="text-slate-500 mb-1">AI Confidence</p>
                      <p className="font-mono font-bold text-white">{selectedTicket.aiConfidence}%</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                      <p className="text-slate-500 mb-1">SLA Left</p>
                      <p className="font-mono font-bold text-white">{selectedTicket.slaHoursLeft}h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-800/50 p-2 rounded border border-slate-700">
                    <MapPin className="w-3 h-3 text-cyber-cyan" />
                    {selectedTicket.lat.toFixed(4)}, {selectedTicket.lng.toFixed(4)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
