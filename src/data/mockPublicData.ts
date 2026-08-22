// Generate 50 random points around Connaught Place (28.6328, 77.2195)
export const generateHeatmapPoints = (): [number, number, number][] => {
  const points: [number, number, number][] = [];
  const centerLat = 28.6328;
  const centerLng = 77.2195;

  for (let i = 0; i < 50; i++) {
    const lat = centerLat + (Math.random() - 0.5) * 0.02;
    const lng = centerLng + (Math.random() - 0.5) * 0.02;
    const intensity = Math.random(); // 0.0 to 1.0
    points.push([lat, lng, intensity]);
  }
  return points;
};

export const recentResolutions = [
  "✅ PWD resolved 'Severe Pothole' on KG Marg - 14 mins ago",
  "✅ Jal Board fixed 'Water Logging' near Rajiv Chowk - 42 mins ago",
  "✅ Sanitation Dept cleared 'Illegal Dumping' in Block A - 1 hr ago",
  "✅ PWD resolved 'Broken Streetlight' on Outer Circle - 2 hrs ago",
  "✅ NDMC repaired 'Damaged Pavement' near Plaza - 3 hrs ago",
  "✅ Traffic Police addressed 'Signal Failure' at Janpath - 4 hrs ago",
];

export const departmentStats = [
  { name: "Public Works (PWD)", resolved: 142, total: 150, color: "bg-blue-500" },
  { name: "Jal Board", resolved: 88, total: 110, color: "bg-cyan-500" },
  { name: "Sanitation Dept", resolved: 210, total: 250, color: "bg-green-500" },
  { name: "NDMC", resolved: 45, total: 60, color: "bg-purple-500" },
  { name: "Traffic Police", resolved: 31, total: 55, color: "bg-yellow-500" },
];
