"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoOriginal, LogoPatch, LogoWrench, LogoPulse, LogoScaffold, LogoNut, LogoLoop } from "@/components/ui/Logo";

const logoMap: Record<string, { name: string; dark: React.ReactNode; light: React.ReactNode }> = {
  original: {
    name: "Original Concept (Target Pin)",
    dark: <LogoOriginal theme="dark" className="w-64 h-auto" />,
    light: <LogoOriginal theme="light" className="w-64 h-auto" />
  },
  patch: {
    name: "Concept 1: The Infrastructure Patch",
    dark: <LogoPatch theme="dark" className="w-64 h-auto" />,
    light: <LogoPatch theme="light" className="w-64 h-auto" />
  },
  wrench: {
    name: "Concept 2: The Tactical Wrench",
    dark: <LogoWrench theme="dark" className="w-64 h-auto" />,
    light: <LogoWrench theme="light" className="w-64 h-auto" />
  },
  pulse: {
    name: "Concept 3: The Resolution Pulse",
    dark: <LogoPulse theme="dark" className="w-64 h-auto" />,
    light: <LogoPulse theme="light" className="w-64 h-auto" />
  },
  scaffold: {
    name: "Concept 4: The Geodesic Scaffold",
    dark: <LogoScaffold theme="dark" className="w-64 h-auto" />,
    light: <LogoScaffold theme="light" className="w-64 h-auto" />
  },
  nut: {
    name: "Concept 5: The Tactical Hex Nut",
    dark: <LogoNut theme="dark" className="w-64 h-auto" />,
    light: <LogoNut theme="light" className="w-64 h-auto" />
  },
  loop: {
    name: "Concept 6: The Resolution Loop",
    dark: <LogoLoop theme="dark" className="w-64 h-auto" />,
    light: <LogoLoop theme="light" className="w-64 h-auto" />
  }
};

interface PageProps {
  params: Promise<{ concept: string }>;
}

export default function ConceptPreview({ params }: PageProps) {
  const resolvedParams = use(params);
  const conceptKey = resolvedParams.concept.toLowerCase();
  const concept = logoMap[conceptKey];

  if (!concept) {
    return (
      <div className="min-h-screen bg-[#090F16] flex flex-col items-center justify-center gap-4 text-white">
        <h1 className="text-xl font-bold">Concept "{resolvedParams.concept}" Not Found</h1>
        <Link href="/logo-preview" className="text-cyan-400 hover:underline">Back to Logo Hub</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090F16] text-white p-8 md:p-16 flex flex-col items-center justify-start gap-8">
      {/* Header Back Button */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <Link href="/logo-preview" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-mono">
          <ArrowLeft className="w-4 h-4" /> Back to Logo Hub
        </Link>
        <span className="text-xs font-mono text-slate-500">Standalone View</span>
      </div>

      <div className="w-full max-w-4xl space-y-8 mt-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{concept.name}</h1>
          <p className="text-slate-400 text-sm font-mono">Route: /logo-preview/{conceptKey}</p>
        </div>

        {/* Dark Background Card */}
        <div className="border border-slate-800/80 rounded-2xl p-8 bg-slate-950/40 space-y-4">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Dark Background Showcase</h3>
          <div className="w-full bg-[#0D1922] border border-slate-800 rounded-xl p-16 flex items-center justify-center min-h-[200px]">
            {concept.dark}
          </div>
        </div>

        {/* Light Background Card */}
        <div className="border border-slate-800/80 rounded-2xl p-8 bg-slate-950/40 space-y-4">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Light Background Showcase</h3>
          <div className="w-full bg-white border border-slate-200 rounded-xl p-16 flex items-center justify-center min-h-[200px]">
            {concept.light}
          </div>
        </div>

        {/* Responsive Code Block Snippet */}
        <div className="border border-slate-800/80 rounded-2xl p-6 bg-[#0B131E] font-mono text-xs text-slate-400 space-y-3">
          <h4 className="text-[#00E5FF] font-bold">Import Snippet</h4>
          <pre className="bg-slate-950/80 p-4 rounded-lg overflow-x-auto text-slate-300">
{`import { Logo${conceptKey.charAt(0).toUpperCase() + conceptKey.slice(1)} } from "@/components/ui/Logo";

// Use directly in navigation bars:
<Logo${conceptKey.charAt(0).toUpperCase() + conceptKey.slice(1)} className="w-40 h-auto" theme="auto" />`}
          </pre>
        </div>
      </div>
    </div>
  );
}
