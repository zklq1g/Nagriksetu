"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { generateHeatmapPoints } from "@/data/mockPublicData";

// Component to handle the Heat Layer injection
function HeatmapLayer() {
  const map = useMap();
  // Generate points once on mount; useMemo not needed since this is purely visual
  const pointsRef = useRef(generateHeatmapPoints());

  useEffect(() => {
    let heat: L.Layer | null = null;

    // Dynamically import to avoid SSR issues
    import("leaflet.heat").then(() => {
      // @ts-ignore - leaflet.heat extends L but has no official types
      heat = L.heatLayer(pointsRef.current, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: "#3b82f6", // Blue
          0.4: "#22d3ee", // Cyan
          0.6: "#facc15", // Yellow
          0.8: "#f97316", // Orange
          1.0: "#ef4444"  // Red
        }
      }).addTo(map);
    });

    return () => {
      if (heat) map.removeLayer(heat);
    };
  }, [map]);

  return null;
}

export default function PublicHeatmap() {
  return (
    <MapContainer 
      center={[28.6328, 77.2195]} // Connaught Place
      zoom={14} 
      className="w-full h-full bg-slate-900"
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <HeatmapLayer />
    </MapContainer>
  );
}
