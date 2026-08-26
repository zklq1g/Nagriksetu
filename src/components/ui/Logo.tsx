import React from "react";

interface LogoProps {
  className?: string;
  theme?: "light" | "dark" | "auto";
}

// -------------------------------------------------------------
// HELPER FUNCTIONS FOR DYNAMIC STYLING
// -------------------------------------------------------------
const getBracketsClass = (theme: string) => {
  if (theme === "light") return "stroke-slate-500";
  if (theme === "dark") return "stroke-slate-400";
  return "stroke-slate-400 dark:stroke-slate-500";
};

const getPinBaseClass = (theme: string) => {
  if (theme === "light") return "stroke-slate-900 fill-slate-100";
  if (theme === "dark") return "stroke-slate-100 fill-slate-950";
  return "stroke-slate-900 dark:stroke-slate-100 fill-slate-100 dark:fill-slate-950";
};

const getCheckmarkClass = (theme: string) => {
  if (theme === "light") return "stroke-cyan-600";
  if (theme === "dark") return "stroke-cyan-400";
  return "stroke-cyan-600 dark:stroke-cyan-400";
};

const getTextClass = (theme: string) => {
  if (theme === "light") return "fill-slate-900";
  if (theme === "dark") return "fill-slate-100";
  return "fill-slate-900 dark:fill-slate-100";
};

const getHighlightClass = (theme: string) => {
  if (theme === "light") return "fill-cyan-600";
  if (theme === "dark") return "fill-cyan-400";
  return "fill-cyan-600 dark:fill-cyan-400";
};

const getMutedLineClass = (theme: string) => {
  if (theme === "light") return "stroke-slate-400";
  if (theme === "dark") return "stroke-slate-500";
  return "stroke-slate-400 dark:stroke-slate-500";
};

const getScannerBracketsClass = (theme: string) => {
  if (theme === "light") return "stroke-slate-500";
  if (theme === "dark") return "stroke-slate-400";
  return "stroke-slate-500 dark:stroke-slate-400";
};

const getSuccessNodeClass = (theme: string) => {
  if (theme === "light") return "fill-emerald-500";
  if (theme === "dark") return "fill-[#00FF9D]";
  return "fill-emerald-500 dark:fill-[#00FF9D]";
};

// -------------------------------------------------------------
// CONCEPT 1: THE INFRASTRUCTURE PATCH (Recommended)
// -------------------------------------------------------------
export function LogoPatch({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* The Broken Infrastructure (Muted) */}
      <path d="M4 16 L 10 16" className={getBracketsClass(theme)} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
      
      {/* The "Fix" / Bridging Beam (Electric Cyan) */}
      <path d="M11 16 L 19 16" className={getCheckmarkClass(theme)} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="11" cy="16" r="1.5" className={getHighlightClass(theme)} />
      <circle cx="19" cy="16" r="1.5" className={getHighlightClass(theme)} />
      
      {/* The Resolved Infrastructure (Solid Cool White/Navy) */}
      <path d="M20 16 L 28 16" className={getTextClass(theme)} strokeWidth="2" strokeLinecap="round" />

      {/* Wordmark */}
      <text x="36" y="21" className={`${getTextClass(theme)} font-mono`} fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontSize="16" fontWeight="600" letterSpacing="0.5">
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}

// -------------------------------------------------------------
// CONCEPT 2: THE TACTICAL WRENCH
// -------------------------------------------------------------
export function LogoWrench({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Geometric Wrench Body */}
      <path 
        d="M20 6 C18 4 15 4 13 6 C11.5 7.5 11 9.5 11.5 11.5 L6 17 C5 18 5 19.5 6 20.5 C7 21.5 8.5 21.5 9.5 20.5 L15 15 C17 15.5 19 15 20.5 13.5 C22.5 11.5 22.5 8.5 20 6 Z" 
        className={getPinBaseClass(theme)} 
        strokeWidth="1.5" 
      />
      
      {/* Verified Fix Checkmark inside the Wrench Head */}
      <path 
        d="M15 9 L16.5 10.5 L19 7.5" 
        className={getCheckmarkClass(theme)} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Wordmark */}
      <text x="34" y="21" className={`${getTextClass(theme)} font-mono`} fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontSize="16" fontWeight="600" letterSpacing="0.5">
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}

// -------------------------------------------------------------
// CONCEPT 3: THE RESOLUTION PULSE
// -------------------------------------------------------------
export function LogoPulse({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg width="170" height="32" viewBox="0 0 170 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* The Problem: Chaotic Pulse (Muted) */}
      <path d="M4 16 L 7 16 L 9 10 L 12 22 L 14 16" className={getMutedLineClass(theme)} strokeWidth="1.5" strokeLinejoin="round" />
      
      {/* The Scanner Brackets */}
      <path d="M16 10 L 16 8 L 18 8" className={getScannerBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 22 L 16 24 L 18 24" className={getScannerBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 10 L 24 8 L 22 8" className={getScannerBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 22 L 24 24 L 22 24" className={getScannerBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" />

      {/* The Fix: Solid, Resolved Line */}
      <path d="M17 16 L 23 16" className={getCheckmarkClass(theme)} strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="16" r="2" className={getSuccessNodeClass(theme)} /> {/* Success Node */}

      {/* Wordmark */}
      <text x="36" y="21" className={`${getTextClass(theme)} font-mono`} fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontSize="16" fontWeight="600" letterSpacing="0.5">
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}

// -------------------------------------------------------------
// ORIGINAL PIN CONCEPT
// -------------------------------------------------------------
export function LogoOriginal({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg
      width="160"
      height="32"
      viewBox="0 0 160 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tactical Target Brackets */}
      <path d="M4 8 L4 4 L8 4" className={getBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 8 L28 4 L24 4" className={getBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 24 L4 28 L8 28" className={getBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 24 L28 28 L24 28" className={getBracketsClass(theme)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Map Pin Base */}
      <path
        d="M16 6 C11.5817 6 8 9.58172 8 14 C8 20 16 28 16 28 C16 28 24 20 24 14 C24 9.58172 20.4183 6 16 6 Z"
        className={getPinBaseClass(theme)}
        strokeWidth="1.5"
      />

      {/* The "Fix" Checkmark */}
      <path
        d="M12 14 L15 17 L20 11"
        className={getCheckmarkClass(theme)}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Wordmark (Monospace) */}
      <text
        x="38"
        y="21"
        className={`${getTextClass(theme)} font-mono`}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        fontSize="16"
        fontWeight="600"
        letterSpacing="0.5"
      >
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}

// -------------------------------------------------------------
// CONCEPT 4: THE GEODESIC SCAFFOLD
// -------------------------------------------------------------
export function LogoScaffold({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg width="170" height="32" viewBox="0 0 170 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Isometric Cube Scaffold */}
      {/* Left face */}
      <path d="M8 12 L14 8 L14 16 L8 20 Z" className={getBracketsClass(theme)} strokeWidth="1" strokeLinejoin="round" />
      {/* Right face - dashed/broken */}
      <path d="M14 8 L20 12 L20 20 L14 16" className={getBracketsClass(theme)} strokeWidth="1" strokeLinejoin="round" strokeDasharray="2 2" />
      {/* Top face */}
      <path d="M8 12 L14 8 L20 12 L14 16 Z" className={getBracketsClass(theme)} strokeWidth="1" strokeLinejoin="round" />
      {/* Glowing rebuild beam (cyan edge) */}
      <path d="M14 16 L20 20" className={getCheckmarkClass(theme)} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.5" className={getHighlightClass(theme)} />

      {/* Wordmark */}
      <text x="36" y="21" className={`${getTextClass(theme)} font-mono`} fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontSize="16" fontWeight="600" letterSpacing="0.5">
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}

// -------------------------------------------------------------
// CONCEPT 5: THE TACTICAL HEX NUT
// -------------------------------------------------------------
export function LogoNut({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Hexagonal Nut */}
      <path 
        d="M16 4 L26 10 L26 22 L16 28 L6 22 L6 10 Z" 
        className={getPinBaseClass(theme)} 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />
      {/* Circular Thread Center */}
      <circle cx="16" cy="16" r="5" className={getBracketsClass(theme)} strokeWidth="1" strokeDasharray="2 1" />
      {/* Glowing checkmark lock */}
      <path 
        d="M13 16 L15 18 L19 13" 
        className={getCheckmarkClass(theme)} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Wordmark */}
      <text x="36" y="21" className={`${getTextClass(theme)} font-mono`} fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontSize="16" fontWeight="600" letterSpacing="0.5">
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}

// -------------------------------------------------------------
// CONCEPT 6: THE RESOLUTION LOOP
// -------------------------------------------------------------
export function LogoLoop({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Circular Loop path representing report -> resolution */}
      {/* Muted segment (report) */}
      <path d="M10 20 A 8 8 0 1 1 22 20" className={getMutedLineClass(theme)} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      {/* Glowing resolution segment */}
      <path d="M22 20 A 8 8 0 0 1 10 20" className={getCheckmarkClass(theme)} strokeWidth="2.5" strokeLinecap="round" />
      {/* Check arrow node */}
      <path d="M8 18 L10 20 L13 16" className={getCheckmarkClass(theme)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Wordmark */}
      <text x="36" y="21" className={`${getTextClass(theme)} font-mono`} fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontSize="16" fontWeight="600" letterSpacing="0.5">
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}

// Default export maps to LogoPatch (Concept 1)
export const Logo = LogoPatch;

// -------------------------------------------------------------
// CONCEPT 2b: THE CRESCENT WRENCH — Refined Variant
// Vibe: Precision instrument, not a cartoon handyman.
// A clean crescent/adjustable wrench silhouette where the
// handle contains a glowing circuit trace (data conduit),
// making it feel like digital infrastructure maintenance.
// -------------------------------------------------------------
export function LogoWrenchB({ className = "", theme = "auto" }: LogoProps) {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Wrench Head (open crescent top) */}
      <path
        d="M8 9 C8 6.8 9.8 5 12 5 L16 5 C17.1 5 18 5.9 18 7 L18 8 C20.2 8 22 9.8 22 12 C22 14.2 20.2 16 18 16 L18 17 C18 18.1 17.1 19 16 19 L12 19 C9.8 19 8 17.2 8 15 Z"
        className={getPinBaseClass(theme)}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Inner jaw gap */}
      <path
        d="M11 9 L11 15"
        className={getBracketsClass(theme)}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="1.5 1.5"
      />
      {/* Handle — slim rod going diagonally down-right */}
      <path
        d="M18 17 L27 26"
        className={getTextClass(theme)}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Circuit trace / data conduit running through the handle */}
      <path
        d="M18 17 L21.5 20.5"
        className={getCheckmarkClass(theme)}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Node at trace end */}
      <circle cx="21.5" cy="20.5" r="1.2" className={getHighlightClass(theme)} />

      {/* Wordmark */}
      <text x="36" y="21" className={`${getTextClass(theme)} font-mono`} fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontSize="16" fontWeight="600" letterSpacing="0.5">
        what<tspan className={getHighlightClass(theme)}>DA</tspan>fix
      </text>
    </svg>
  );
}
