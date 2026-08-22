'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Camera, HardHat, ShieldAlert, Map, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

const roles = [
  {
    title: "Citizen Reporter",
    desc: "AI-powered civic issue reporting with EXIF validation & PostGIS clustering.",
    href: "/citizen",
    icon: <Camera className="w-8 h-8 text-blue-400" />,
    color: "from-blue-600/20 to-blue-900/20",
    border: "border-blue-500/30 hover:border-blue-400",
    shadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
  },
  {
    title: "Field Operations",
    desc: "GPS-fenced resolution portal with WebRTC proof-of-work enforcement.",
    href: "/department",
    icon: <HardHat className="w-8 h-8 text-yellow-400" />,
    color: "from-yellow-600/20 to-yellow-900/20",
    border: "border-yellow-500/30 hover:border-yellow-400",
    shadow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]"
  },
  {
    title: "Command Center",
    desc: "Dynamic SLA enforcement, AI fallback queues, and SSIM CV verification.",
    href: "/admin",
    icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
    color: "from-red-600/20 to-red-900/20",
    border: "border-red-500/30 hover:border-red-400",
    shadow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
  },
  {
    title: "Public God View",
    desc: "Real-time CartoDB heatmap & department accountability leaderboards.",
    href: "/public",
    icon: <Map className="w-8 h-8 text-green-400" />,
    color: "from-green-600/20 to-green-900/20",
    border: "border-green-500/30 hover:border-green-400",
    shadow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center font-sans p-6 overflow-hidden relative">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full z-10 relative"
      >
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">
            <Activity size={12} className="animate-pulse" /> Advanced Architecture Demo
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
            NagrikSetu
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Select a module to explore the end-to-end flow of the God-Tier civic accountability engine.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {roles.map((role) => (
            <motion.div key={role.title} variants={itemVariants}>
              <Link href={role.href} className="block group">
                <div className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${role.color} bg-slate-900/50 backdrop-blur-sm border ${role.border} ${role.shadow} transition-all duration-300 overflow-hidden`}>
                  
                  {/* Subtle grid background pattern inside card */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                  
                  <div className="relative z-10">
                    <div className="mb-6 inline-block p-4 bg-slate-950/50 rounded-xl shadow-inner border border-white/5">
                      {role.icon}
                    </div>
                    <h2 className="text-2xl font-black mb-2 flex items-center justify-between">
                      {role.title}
                      <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" />
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      {role.desc}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center text-xs text-slate-600 font-mono flex items-center justify-center gap-2"
        >
          <ShieldCheck size={14} /> Full End-to-End Vertical Slice Verified
        </motion.div>
      </motion.div>
    </div>
  );
}
