"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { generateHeatmapPoints } from "@/data/mockPublicData";
import { getLocalIssues } from "@/lib/localDB";

// Component to handle the Heat Layer injection
function HeatmapLayer() {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    const loadHeat = async () => {
      const data = getLocalIssues();

      // Map to heatmap points — Open issues at full intensity, Resolved at lower
      let points: [number, number, number][] = [];
      if (data && data.length > 0) {
        points = data.map((row: any) => [
          row.lat,
          row.lng,
          row.status === "Resolved" ? 0.3 : 1.0,
        ]);
      } else {
        points = generateHeatmapPoints();
      }

      // Dynamically import to avoid SSR issues
      await import("leaflet.heat");
      // @ts-ignore
      layerRef.current = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: "#3b82f6",
          0.4: "#22d3ee",
          0.6: "#facc15",
          0.8: "#f97316",
          1.0: "#ef4444",
        },
      }).addTo(map);
    };

    loadHeat();

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
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
