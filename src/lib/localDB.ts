"use client";

// Hardcoded departments for the standalone version
export const DEPARTMENTS = [
  { id: "a65c2b53-7cad-46ef-a0e9-4d91d8dae3b8", name: "Sanitation (Garbage)", sla_hours: 24, color: "#ef4444" },
  { id: "6c832e05-48d6-48c5-a819-d7b459df440d", name: "Electrical (Streetlights)", sla_hours: 48, color: "#f59e0b" },
  { id: "bd527a62-e673-452d-b0db-f3160190727b", name: "PWD (Potholes/Roads)", sla_hours: 168, color: "#3b82f6" }
];

export interface Issue {
  id: string;
  user_id: string;
  department_id: string;
  image_url: string;
  lat: number;
  lng: number;
  status: "Open" | "Resolved" | "Unassigned";
  ai_confidence: number;
  ai_severity_score: number;
  description: string;
  created_at: string;
  resolved_at?: string;
  after_image_url?: string;
}

const SEED_ISSUES: Issue[] = [
  { id: "1", user_id: "demo-user", department_id: "bd527a62-e673-452d-b0db-f3160190727b", image_url: "https://images.unsplash.com/photo-1621955511667-e2c316e4575d?q=80&w=800&auto=format&fit=crop", lat: 28.6328, lng: 77.2195, status: "Open", ai_confidence: 96, ai_severity_score: 88, description: "Severe Pothole on KG Marg", created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "2", user_id: "demo-user", department_id: "a65c2b53-7cad-46ef-a0e9-4d91d8dae3b8", image_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=800&auto=format&fit=crop", lat: 28.6400, lng: 77.2100, status: "Open", ai_confidence: 91, ai_severity_score: 72, description: "Illegal Dumping near Rajiv Chowk", created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "3", user_id: "demo-user", department_id: "6c832e05-48d6-48c5-a819-d7b459df440d", image_url: "https://images.unsplash.com/photo-1542317854-7f579d902cbf?q=80&w=800&auto=format&fit=crop", lat: 28.6250, lng: 77.2350, status: "Open", ai_confidence: 85, ai_severity_score: 65, description: "Streetlight Outage on Outer Circle", created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: "4", user_id: "demo-user", department_id: "bd527a62-e673-452d-b0db-f3160190727b", image_url: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=800&auto=format&fit=crop", lat: 28.6129, lng: 77.2295, status: "Open", ai_confidence: 42, ai_severity_score: 55, description: "Road Damage near India Gate", created_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: "5", user_id: "demo-user", department_id: "a65c2b53-7cad-46ef-a0e9-4d91d8dae3b8", image_url: "https://images.unsplash.com/photo-1612965607446-25e1ef880887?q=80&w=800&auto=format&fit=crop", lat: 28.6180, lng: 77.2050, status: "Resolved", ai_confidence: 94, ai_severity_score: 80, description: "Garbage Overflow at Block A", created_at: new Date(Date.now() - 24 * 3600000).toISOString(), resolved_at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "6", user_id: "demo-user", department_id: "bd527a62-e673-452d-b0db-f3160190727b", image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop", lat: 28.6450, lng: 77.2180, status: "Resolved", ai_confidence: 89, ai_severity_score: 70, description: "Broken Pavement on Janpath", created_at: new Date(Date.now() - 30 * 3600000).toISOString(), resolved_at: new Date(Date.now() - 10 * 3600000).toISOString() },
  { id: "7", user_id: "demo-user", department_id: "6c832e05-48d6-48c5-a819-d7b459df440d", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop", lat: 28.6500, lng: 77.2300, status: "Open", ai_confidence: 78, ai_severity_score: 60, description: "Faulty Traffic Signal at Karol Bagh", created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: "8", user_id: "demo-user", department_id: "a65c2b53-7cad-46ef-a0e9-4d91d8dae3b8", image_url: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=800&auto=format&fit=crop", lat: 28.6350, lng: 77.2420, status: "Resolved", ai_confidence: 97, ai_severity_score: 92, description: "Illegal Waste Dump Sarojini Nagar", created_at: new Date(Date.now() - 48 * 3600000).toISOString(), resolved_at: new Date(Date.now() - 24 * 3600000).toISOString() }
];

export const getLocalIssues = (): Issue[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("nagriksetu_issues");
  if (!stored) {
    localStorage.setItem("nagriksetu_issues", JSON.stringify(SEED_ISSUES));
    return SEED_ISSUES;
  }
  return JSON.parse(stored);
};

export const saveLocalIssue = (issue: Issue) => {
  const issues = getLocalIssues();
  issues.push(issue);
  localStorage.setItem("nagriksetu_issues", JSON.stringify(issues));
};

export const updateLocalIssue = (id: string, updates: Partial<Issue>) => {
  const issues = getLocalIssues();
  const index = issues.findIndex(i => i.id === id);
  if (index > -1) {
    issues[index] = { ...issues[index], ...updates };
    localStorage.setItem("nagriksetu_issues", JSON.stringify(issues));
  }
};

// Image compression to prevent localStorage from crashing on 5MB quota
export const compressImage = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  });
};
