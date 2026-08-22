import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap"
});

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains",
  display: "swap"
});

export const metadata: Metadata = {
  title: "NagrikSetu | Civic Accountability Engine",
  description: "Smart Cities Hackathon 2026 - Radical Transparency",
  manifest: "/manifest.json", // PWA support
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Prevent Leaflet CSS missing from SSR */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-background min-h-screen flex flex-col`}>
        
        {/* Global Radial Gradient Background */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-background to-background" />

        {/* Main Content */}
        <main className="flex-1 relative z-10">
          {children}
        </main>

        {/* Premium Toast Notifications */}
        <Toaster 
          richColors 
          theme="dark" 
          position="top-center"
          toastOptions={{
            className: "bg-surface border border-border text-white font-sans",
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155"
            }
          }}
        />
      </body>
    </html>
  );
}
