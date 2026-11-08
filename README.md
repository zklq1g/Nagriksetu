# NagrikSetu — AI-Powered Civic Issue Reporting Platform

> नागरिक सेतु | *Bridging Citizens and Government through AI*

**Live Demo:** https://nagriksetu-nine.vercel.app/
**GitHub:** https://github.com/zklq1g/Nagriksetu

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.svg)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/) [![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-orange?logo=google)](https://ai.google.dev/) [![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 📌 Problem Statement

Municipal bodies receive thousands of civic complaints daily — potholes, broken streetlights, overflowing garbage — but suffer from:
- **Duplicate reporting** of the same issue by multiple citizens, wasting resources
- **Manual triage** causing delays in routing issues to the right department
- **No accountability loop** — citizens report but never know if it was resolved
- **No proof of work** from field workers, enabling false closure of tickets

---

## 💡 Our Solution

NagrikSetu is a three-portal civic intelligence system:

| Portal | User | Purpose |
|---|---|---|
| **Citizen Portal** | Public | Report civic issues via live camera |
| **Department Portal** | Field Worker | View, verify location, and resolve issues with proof |
| **Public Dashboard** | Everyone | See live heatmap, leaderboard, and issue feed |

---

## 🚀 Key Innovations

### 1. AI Image Classification (Google Gemini)
Citizens capture a photo — Gemini Vision instantly classifies the issue type (pothole, garbage, streetlight), assigns a severity score, and auto-routes it to the correct department with an SLA deadline. No manual selection needed.

### 2. Haversine Geofencing for Duplicate Detection
When a report is submitted, we compute the GPS distance (Haversine formula) between the new report and all existing open issues of the same type. If another report exists within **50 meters**, the new submission is merged as an **upvote** on the original — automatically boosting its priority — instead of creating a duplicate ticket.

### 3. WebRTC Live Camera (Desktop + Mobile)
Instead of a standard file picker, we use the browser''s `navigator.mediaDevices.getUserMedia()` API to open a live webcam/camera feed directly in the browser. This works on both phones and Windows laptops.

### 4. GPS-Verified Proof of Work
Field workers in the Department Portal must physically be within **100 meters** of the reported issue (verified via GPS) before they can submit a resolution. They must also capture an "after" photo using the live camera, creating a verifiable evidence trail.

---

## ✨ Feature Highlights

**Citizen Portal (`/citizen`)**
- Live WebRTC camera capture (no file picker, works on PC + mobile)
- Real-time AI scanning animation while Gemini processes the image
- Automatic GPS lock after analysis (with desktop fallback)
- Duplicate detection with upvote flow

**Department Portal (`/department`)**
- SLA-prioritized issue queue with urgency badges (ON TRACK / URGENT / OVERDUE)
- GPS proximity check before resolution is allowed
- Live camera proof-of-work capture
- Before/After photo comparison

**Public Dashboard (`/`)**
- Live issue heatmap
- Department leaderboard (resolution rate)
- Scrolling live ticker of recent activity

---

## 🛠️ Tech Stack

| | |
|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Styling** | Tailwind CSS + Framer Motion |
| **AI** | Google Gemini 1.5 Flash (Vision API) |
| **Camera** | WebRTC — navigator.mediaDevices.getUserMedia |
| **Storage** | Browser localStorage (standalone, no DB required) |
| **Deployment** | Vercel |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public dashboard (heatmap, leaderboard, ticker)
│   ├── citizen/page.tsx      # Citizen reporting portal
│   ├── department/page.tsx   # Field operator portal
│   ├── admin/page.tsx        # Admin overview
│   └── api/classify/         # Gemini AI classification endpoint
├── components/
│   ├── citizen/
│   │   ├── CameraCapture.tsx # WebRTC camera component
│   │   ├── AIPipeline.tsx    # AI scan animation + Gemini call
│   │   └── GPSLock.tsx       # GPS acquisition component
│   └── public/
│       ├── PublicHeatmap.tsx
│       ├── Leaderboard.tsx
│       └── LiveTicker.tsx
└── lib/
    └── localDB.ts            # Standalone localStorage CRUD + seed data
```

---

## ⚙️ Running Locally

**Prerequisites:** Node.js 18+, a Google Gemini API key (free at aistudio.google.com)

```bash
# Clone and install
git clone https://github.com/zklq1g/Nagriksetu.git
cd Nagriksetu
npm install

# Add environment variable
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Run
npm run dev
```

Open **http://localhost:3000**

> The app runs fully standalone — no database, no backend services needed. All issue data is stored in `localStorage`. To reset demo data, clear localStorage or use an Incognito window.

---

## 🎯 Demo Instructions for Judges

### Normal Flow
1. Open `/citizen` → Click **"Capture Civic Issue"** → Allow camera
2. Point camera at anything, tap the shutter button
3. Watch the AI scan animate, then see the classified result
4. GPS auto-locks → click **"Submit Verified Report"**
5. Open `/department` → See the issue in the queue
6. Click the issue card → GPS verifies proximity → tap **"Tap to Capture Proof"**
7. Take proof photo → click **"Mark as Resolved"**
8. Return to `/` to see the public dashboard update

### Duplicate Detection Demo
1. Open `/citizen` → toggle **"QA: Duplicate"** in the top-right header
2. Capture and submit any photo
3. The system will detect a nearby duplicate and show the **"👍 Upvote Existing Issue"** button instead of Submit

---

## 👥 Team

Built for [Hackathon Name] — 2024

---

## 📄 License

MIT License


---

## 📜 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for daily release notes, feature iterations, and version history.

---

## 📚 Documentation & Technical Resources

- **[Architecture & Technical Design](docs/ARCHITECTURE.md)**: Deep dive into the tri-portal domain model, Haversine formula geofencing, and hybrid storage topology.
- **[API & Integration Specification](docs/API_SPECIFICATION.md)**: REST endpoint schemas, Gemini AI vision contracts, PostGIS spatial synchronization, and CPGRAMS government bridge protocol.
- **[Offline Field Operations Specification](docs/OFFLINE_FIELD_OPERATIONS.md)**: Field operator offline resilience, IndexedDB caching schema, deterministic offline Haversine geofencing, and Background Sync protocol.
- **[Multilingual Localization & Accessibility](docs/LOCALIZATION_ACCESSIBILITY.md)**: 8th Schedule Indic language support, voice-assisted intake (Web Speech API), dialectal keyword classification, and WCAG 2.2 AAA accessibility.
- **[Municipal IoT & Drone Telemetry Specification](docs/IOT_DRONE_TELEMETRY.md)**: SCADA/MQTT storm drainage and water pressure telemetry, autonomous UAV orthomosaic defect sweeps, and 50m spatial correlation.
- **[Contractor Performance & Penalty Engine](docs/CONTRACTOR_SLA_PENALTY_ENGINE.md)**: Automated SLA enforcement, non-linear compounding penalty deductions, 30-day Contractor Performance Scorecard (CPS), and PFMS escrow settlement.
- **[Civic Bounty & Gamified Rewards Protocol](docs/CIVIC_BOUNTY_REWARDS_SYSTEM.md)**: Algorithmic citizen karma valuation, dynamic micro-bounty escalation, zero-trust Sybil resistance, and e-RUPI/NCMC municipal utility benefit settlement.
- **[Real-Time Command Center & WebSockets Dispatch Protocol](docs/COMMAND_CENTER_WEBSOCKETS_DISPATCH.md)**: Low-latency bidirectional WebSocket gateway, spatial Geohash channel multiplexing, distributed Redis Pub/Sub backplane, and autonomous municipal emergency dispatch.
- **[Edge AI On-Device Classification & WASM Vision Pipeline](docs/EDGE_AI_ON_DEVICE_CLASSIFICATION.md)**: Sub-85ms client-side MobileNetV4-INT8 neural inference, WebAssembly SIMD/WebGPU acceleration, DPDP Act 2023 privacy sanitization, and dual-tier cloud consensus dispatch.
- **[Demo Walkthrough Script](docs/DEMO_SCRIPT.md)**: 3-minute golden path walkthrough script for hackathon presentations.
- **[Hackathon Judge Guide](HACKATHON_README.md)**: Offline evaluation instructions and feature matrix.
- **[Changelog](CHANGELOG.md)**: Daily iteration tracking and version release notes.
