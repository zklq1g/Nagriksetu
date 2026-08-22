"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { AdminTicket } from "@/data/mockAdminData";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Pulsing Icon for Unassigned
const createPulseIcon = (color: string) => L.divIcon({
  className: "custom-pulse-icon",
  html: `<div style="
    width: 16px; height: 16px; background: ${color}; border-radius: 50%; 
    box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
    border: 2px solid white;
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Component to handle flying to coordinates
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

interface GodViewMapProps {
  tickets: AdminTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
}

export default function GodViewMap({ tickets, selectedTicketId, onSelectTicket }: GodViewMapProps) {
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const center: [number, number] = selectedTicket ? [selectedTicket.lat, selectedTicket.lng] : [28.6139, 77.2090];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[28.6139, 77.2090]} 
        zoom={12} 
        className="w-full h-full bg-slate-900"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={selectedTicket ? [selectedTicket.lat, selectedTicket.lng] : null} />

        {tickets.map(ticket => {
          const color = ticket.status === 'Unassigned' ? '#facc15' : 
                        ticket.status === 'Resolved' ? '#4ade80' : '#f87171';
          
          return (
            <Marker 
              key={ticket.id} 
              position={[ticket.lat, ticket.lng]}
              icon={createPulseIcon(color)}
              eventHandlers={{ click: () => onSelectTicket(ticket.id) }}
            >
              <Popup className="custom-popup">
                <div className="text-slate-900 font-sans text-xs">
                  <strong>{ticket.id}</strong><br/>
                  {ticket.title}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Overlay UI */}
      <div className="absolute top-4 right-4 z-[1000] bg-surface/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl">
        <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Live Telemetry</h3>
        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_#eab308]"></span> Unassigned (AI Fallback)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></span> Active SLA</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span> Pending Verification</div>
        </div>
      </div>
    </div>
  );
}
