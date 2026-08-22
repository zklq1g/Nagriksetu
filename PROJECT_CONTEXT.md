# PROJECT_CONTEXT.md: NagrikSetu (AI-Powered Civic Accountability Engine)

## 1. Project Overview & Hackathon Context
*   **Project Name:** NagrikSetu (Citizen Bridge)
*   **Hackathon:** Frontend Arena (Focus: UI/UX, Performance, Visual Storytelling)
*   **Theme:** Smart Cities / Viksit Bharat 2026
*   **Problem Statement:** "The Complaint That Nobody Heard" (Lack of transparency, updates, accountability, and trust in civic reporting).
*   **Timeframe:** 48 Hours (1-2 person team).
*   **Core Philosophy:** Don't just build a "reporting tool." Build an **Accountability & Workflow Engine** that enforces deadlines (SLAs), prevents spam, and provides radical public transparency.

---

## 2. The "Architectural Illusion" Strategy (CRITICAL FOR AI CODING)
We are building a frontend-heavy "Vertical Slice" demo. We cannot build actual Python microservices, train CV models, or integrate real Gov APIs in 48 hours. 
**Rule for AI Code Generation:** When a feature requires complex backend processing (AI, EXIF, CPGRAMS), build a **beautiful, highly realistic UI loading state** that simulates the process using `setTimeout`, and returns mock JSON data. Document in the code that this represents a production microservice.

### What is REAL (Fully Functional):
*   Next.js App Router frontend with Tailwind CSS & Framer Motion.
*   Supabase PostgreSQL database with **PostGIS** enabled for spatial queries.
*   Supabase Storage for actual image uploads.
*   Browser `navigator.geolocation` for live GPS locking.
*   HTML5 `<input capture="environment">` to enforce live camera-only access (no gallery).
*   Client-side Haversine formula to calculate distance between two GPS coordinates.
*   React-Leaflet for the public interactive map.

### What is SIMULATED (The Illusion):
*   **AI Image Classification:** Mocked via a 2-second loading animation returning a hardcoded department and severity score.
*   **EXIF/Anti-Spoofing Validation:** Mocked via a sequential checklist animation.
*   **Duplicate Detection (pHash):** Simulated via a "Demo Mode" toggle that forces the duplicate UI flow. (In production, this uses PostGIS `ST_DWithin`).
*   **Computer Vision Closure Verification:** Mocked via a loading state when an Admin reviews a closed ticket.
*   **CPGRAMS Interoperability:** A dummy button that triggers a success toast notification.

---

## 3. Tech Stack
*   **Framework:** Next.js 14 (App Router), TypeScript.
*   **Styling:** Tailwind CSS, Dark Mode theme (Slate/Blue palette).
*   **UI Components:** `shadcn/ui` (Tables, Dialogs, Cards, Buttons), `lucide-react` (Icons).
*   **Animations:** `framer-motion` (Page transitions, scanning sequences, modals).
*   **Backend/DB:** Supabase (PostgreSQL + PostGIS + Storage + Auth).
*   **Maps:** `react-leaflet` and `leaflet`.
*   **Deployment:** Vercel.

---

## 4. Database Schema (Supabase SQL)
The database must support dynamic SLAs, AI metadata, and spatial queries.

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Departments Table (Dynamic SLAs)
CREATE TABLE departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  sla_hours INT NOT NULL,
  color TEXT NOT NULL
);

-- Issues Table
CREATE TABLE issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  department_id UUID REFERENCES departments NOT NULL,
  image_url TEXT NOT NULL,
  after_image_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Unassigned', 'In Progress', 'Resolved')),
  ai_confidence FLOAT DEFAULT 0,
  ai_severity INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Spatial Index for Duplicate Checking
CREATE INDEX idx_issues_location ON issues USING GIST (geography(ST_SetSRID(ST_MakePoint(lng, lat), 4326)));

-- Row Level Security (RLS)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Citizens insert issues" ON issues FOR INSERT WITH CHECK (true); -- Simplified for demo
CREATE POLICY "Admins update issues" ON issues FOR UPDATE USING (true);
```

---

## 5. Page-by-Page Specifications

### A. Landing Page (`/`)
*   **UI:** High-impact dark mode hero section.
*   **Action:** Three distinct role cards to bypass auth for the demo: "Citizen Portal", "Field Worker Portal", "Admin Command Center".

### B. Citizen Portal (`/citizen`)
*   **Target:** Mobile PWA.
*   **Core Logic:** Anti-Spam & Frictionless Reporting.
*   **Key Features:**
    1.  **Live Camera Only:** `<input type="file" accept="image/*" capture="environment">`. Explicit UI text: "Gallery uploads disabled".
    2.  **AI & Security Pipeline (Simulated):** Upon photo capture, trigger a Framer Motion sequence:
        *   *Step 1:* "Running Computer Vision Multi-Label Classification..." (Wait 800ms) -> Checkmark.
        *   *Step 2:* "Cross-validating EXIF & Sensor Telemetry..." (Wait 800ms) -> Checkmark.
        *   *Step 3:* "Executing Anti-Spoofing Heuristics..." (Wait 800ms) -> Checkmark.
    3.  **Dynamic SLA Injection:** After scanning, display a mock result: "Auto-Routed to PWD", "Confidence: 96%", "Severity: 88/100", "Expedited SLA: 72 Hrs".
    4.  **GPS Lock:** A button "Acquire Live GPS Coordinates". The final Submit button is `disabled` until this succeeds.
    5.  **Demo Toggle (Top Right):** A dropdown to switch between "Normal Submit" and "Simulate Duplicate".
        *   *If Normal:* Show success modal with Ticket ID.
        *   *If Duplicate:* Show warning modal: "Haversine Geofencing & pHash Match: 2 identical reports within 50m. Merged as UPVOTE."

### C. Department Field-Worker Portal (`/department`)
*   **Target:** Mobile PWA. Dead-simple task execution.
*   **Core Logic:** Proof-of-Work & Location Verification.
*   **Key Features:**
    1.  **Task Queue:** List of tickets filtered by department. Cards have thick left borders indicating SLA status (Red=Overdue, Yellow=Urgent, Green=On Track).
    2.  **Haversine GPS Check:** When worker clicks "Start Resolution", grab live GPS. Calculate distance to the ticket's `lat/lng`.
        *   If distance > 100m: Show Red Warning ("You are X meters away"). Disable submit.
        *   If distance <= 100m: Show Green Success ("Location Matched").
    3.  **Demo Override:** If distance > 100m, show a tiny `[Demo Override: Fake GPS Match]` button for the hackathon video recording.
    4.  **Mandatory Proof:** Worker must use `<input capture="environment">` to take an "After" photo. Ticket cannot be closed without it.

### D. Admin Command Center (`/admin`)
*   **Target:** Desktop. "God View" oversight.
*   **Core Logic:** AI Fallback & Systemic Accountability.
*   **Key Features:**
    1.  **Unassigned Queue (AI Fallback):** A specific view for tickets where AI Confidence was < 80%. Admin manually assigns these to prevent the "Ping-Pong" jurisdictional effect.
    2.  **Master Data Table:** `shadcn/ui` table showing all tickets, SLA timers, and Before/After thumbnails.
    3.  **CV Closure Verification (Simulated):** When Admin clicks a resolved ticket, show a mock loading state: "Running Computer Vision Structural Comparison...". Then show: "✅ Defect Resolved. AI Match Confirmed."
    4.  **Interoperability Flex:** A "Sync to CPGRAMS" button that triggers a toast: "Syncing 14 unresolved tickets to Central Gov API..."

### E. Public Transparency Dashboard (`/public`)
*   **Target:** Desktop/Mobile. Radical Transparency.
*   **Core Logic:** Data Visualization.
*   **Key Features:**
    1.  **Live Heatmap:** Full-screen `react-leaflet` map. Red pins for Open, Green for Resolved.
    2.  **Pre-Seeded Data:** Read from a local `mockData.ts` file containing 50 fake issues around Connaught Place, Delhi, so the map looks highly active.
    3.  **Leaderboard:** Sidebar ranking departments by resolution rate.

---

## 6. Design System & UI/UX Guidelines (CRITICAL FOR FRONTEND ARENA)
Since this is a frontend-focused hackathon, the UI must look like a million-dollar GovTech SaaS product. Do not use default browser styles.

*   **Color Palette (Dark Mode "Command Center" Aesthetic):**
    *   Background: `bg-[#0f172a]` (Slate 900)
    *   Cards/Surfaces: `bg-[#1e293b]` (Slate 800) with `border border-slate-700`
    *   Primary Action: `bg-blue-600` (Hover: `bg-blue-500`)
    *   Success/Resolved: `text-green-400`, `bg-green-500/10`, `border-green-500/30`
    *   Urgent/Overdue: `text-red-400`, `bg-red-500/10`, `border-red-500/30`
    *   Text: Primary `text-white`, Secondary `text-slate-400`, Muted `text-slate-500`
*   **Typography:** Use `font-sans` (Inter or Geist). Headings must be `font-black` or `font-bold` with `tracking-tight`. Monospace (`font-mono`) for Ticket IDs and GPS coordinates.
*   **Micro-Interactions (Framer Motion):**
    *   **Modals:** Must slide up from the bottom on mobile (`initial={{ y: "100%" }} animate={{ y: 0 }} type="spring" stiffness={300} damping={30}`).
    *   **Lists:** Staggered fade-in for task queues (`initial={{ opacity: 0, y: 10 }}`).
    *   **Loading States:** NEVER use a default browser spinner. Use `lucide-react` `<Loader2 className="animate-spin" />` inside buttons. Use Skeleton loaders (`bg-slate-700 animate-pulse`) for data tables.
*   **Accessibility (a11y):**
    *   All inputs must have associated `<label>` tags (can be visually hidden with `sr-only` if needed).
    *   Focus states must be visible (`focus:ring-2 focus:ring-blue-500`).
    *   Color contrast must pass WCAG AA (hence the specific slate/blue palette above).

---

## 7. Granular Next.js App Router Architecture
Maintain a clean, modular file structure. AI should generate components in the correct directories.

```text
nagrik-setu/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Global fonts, dark mode background, Toaster
│   │   ├── page.tsx                # Landing Page (Role Selector)
│   │   ├── citizen/page.tsx        # Citizen Reporting Flow
│   │   ├── department/page.tsx     # Field Worker Task Queue
│   │   ├── admin/page.tsx          # Admin Command Center
│   │   └── public/page.tsx         # Transparency Heatmap
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (button, card, table, dialog)
│   │   ├── citizen/
│   │   │   ├── CameraCapture.tsx   # Live camera input with anti-spoof UI
│   │   │   ├── AIPipeline.tsx      # The simulated scanning animation
│   │   │   └── GPSLock.tsx         # Geolocation button
│   │   ├── department/
│   │   │   ├── TaskCard.tsx        # Individual ticket card with SLA border
│   │   │   └── ResolutionModal.tsx # Before/After photo & Haversine check
│   │   └── admin/
│   │       ├── UnassignedQueue.tsx # AI Fallback routing
│   │       └── MasterTable.tsx     # shadcn data table
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client initialization
│   │   ├── utils.ts                # cn() helper for tailwind
│   │   └── haversine.ts            # Distance calculation math
│   └── data/
│       └── mockData.ts             # 50 pre-seeded Delhi coordinates for the map
├── public/
│   ├── manifest.json               # PWA configuration
│   └── icons/                      # PWA icons
├── .env.local                      # Supabase Keys
└── PROJECT_CONTEXT.md              # This file
```

---

## 8. Edge Case & Error Handling Matrix
Amateurs build for the happy path. We build for the real world. Implement these specific UI states:

| Scenario | User Action | System Response (UI) |
| :--- | :--- | :--- |
| **Camera Denied** | User blocks camera access | Show red toast: "Camera access is mandatory for verified reporting. Please enable in browser settings." |
| **GPS Denied** | User blocks location access | Submit button remains `disabled`. Show text: "GPS Lock Required" in red. |
| **No Network (2G)** | User tries to submit | Show offline indicator. (For demo: Just ensure UI doesn't crash on slow load, use Framer Motion `AnimatePresence` to handle delayed states gracefully). |
| **Worker too far** | Dept worker >100m from pothole | Red border on modal. Button disabled. Text: "GPS Mismatch: You are X meters away. Move to the reported site." |
| **Missing Proof** | Admin tries to close without photo | HTML5 validation prevents it. Button disabled until `afterImage` state is populated. |
| **AI Fails (Low Confidence)** | Citizen uploads blurry photo | Mock AI returns `< 80%` confidence. Ticket routes to `/admin` Unassigned Queue instead of a Department. |

---

## 9. AI Coding Directives (Meta-Rules for Cursor/Copilot)
When asking the AI to write code for this project, enforce these rules:

1.  **NO CONSOLE LOGS IN PRODUCTION:** Use a mock UI Toast (e.g., `sonner` or a custom fixed div) to show success/error messages instead of `console.log`.
2.  **MOCK OVER BUILD:** If I ask for "AI Classification", DO NOT write a Python backend. Write a Next.js async function that uses `setTimeout` for 2 seconds and returns a mock JSON object. Add a comment: `// TODO: Replace with Supabase Edge Function calling Python CV Microservice`.
3.  **STRICT TYPING:** Use TypeScript interfaces for all Supabase data (e.g., `interface Issue { id: string, lat: number... }`).
4.  **MOBILE FIRST:** All citizen and department views must use `min-h-screen`, `p-4`, and flexbox to look like native mobile apps when viewed in Chrome DevTools.
5.  **HARDcoded DEMO DATA:** For the Admin and Public Map views, if the Supabase query returns empty, fallback to importing `mockData.ts` so the UI is never empty during the demo recording.
