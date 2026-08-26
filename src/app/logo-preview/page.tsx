import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoOriginal, LogoPatch, LogoWrench, LogoWrenchB, LogoPulse, LogoScaffold, LogoNut, LogoLoop } from "@/components/ui/Logo";

export default function LogoPreview() {
  const concepts = [
    { key: "original", name: "Original Concept (Target Pin)", dark: <LogoOriginal theme="dark" />, light: <LogoOriginal theme="light" /> },
    { key: "patch", name: "Concept 1: The Infrastructure Patch (Recommended)", dark: <LogoPatch theme="dark" />, light: <LogoPatch theme="light" /> },
    { key: "wrench", name: "Concept 2: The Tactical Wrench", dark: <LogoWrench theme="dark" />, light: <LogoWrench theme="light" /> },
    { key: "wrenchb", name: "Concept 2b: The Crescent Wrench (Refined)", dark: <LogoWrenchB theme="dark" />, light: <LogoWrenchB theme="light" /> },
    { key: "pulse", name: "Concept 3: The Resolution Pulse", dark: <LogoPulse theme="dark" />, light: <LogoPulse theme="light" /> },
    { key: "scaffold", name: "Concept 4: The Geodesic Scaffold", dark: <LogoScaffold theme="dark" />, light: <LogoScaffold theme="light" /> },
    { key: "nut", name: "Concept 5: The Tactical Hex Nut", dark: <LogoNut theme="dark" />, light: <LogoNut theme="light" /> },
    { key: "loop", name: "Concept 6: The Resolution Loop", dark: <LogoLoop theme="dark" />, light: <LogoLoop theme="light" /> },
  ];

  return (
    <div className="min-h-screen bg-[#090F16] flex flex-col items-center justify-start gap-12 p-8 md:p-16 text-slate-100">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">whatDAfix Logo Exploration</h1>
        <p className="text-slate-400 text-sm font-mono">Comparing 6 design concepts on dark and light backgrounds</p>
      </div>

      <div className="w-full max-w-5xl space-y-8">
        {concepts.map((concept, idx) => (
          <div key={idx} className="border border-slate-800/80 rounded-2xl p-6 bg-slate-950/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h2 className="text-sm font-mono font-bold text-[#00E5FF]">{concept.name}</h2>
              <Link 
                href={`/logo-preview/${concept.key}`}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
              >
                View standalone page <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dark BG Container */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">Dark BG (#0D1922)</span>
                <div className="w-full bg-[#0D1922] border border-slate-800 rounded-xl p-8 flex items-center justify-center min-h-[96px]">
                  {concept.dark}
                </div>
              </div>

              {/* Light BG Container */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">Light BG (White)</span>
                <div className="w-full bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center min-h-[96px]">
                  {concept.light}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav Bar Mock Example */}
      <div className="w-full max-w-5xl border border-slate-800/80 rounded-2xl p-6 bg-slate-950/40 space-y-4">
        <h2 className="text-sm font-mono font-bold text-[#00E5FF] border-b border-slate-800 pb-2">Nav Bar Preview (Concept 1: Patch)</h2>
        <div className="w-full bg-[#0D1922] border border-slate-800 rounded-xl px-6 py-4 flex items-center justify-between">
          <LogoPatch theme="dark" />
          <div className="flex gap-4">
            <span className="text-slate-400 text-xs font-mono">Report Issue</span>
            <span className="text-slate-400 text-xs font-mono">Department Portal</span>
            <span className="text-[#00E5FF] text-xs font-mono font-bold">Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
