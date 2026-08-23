# ============================================================
#   NagrikSetu — AI-Powered Civic Issue Reporting Platform
# ============================================================
#   नागरिक सेतु | Citizen Bridge
# ============================================================

LIVE DEMO  : https://nagriksetu-nine.vercel.app/
GITHUB     : https://github.com/zklq1g/Nagriksetu

---

## TABLE OF CONTENTS

  1. Problem Statement
  2. Our Solution
  3. Key Technical Innovations
  4. How to Run Locally
  5. Project Structure
  6. Tech Stack
  7. Demo Walkthrough for Judges
  8. Team

---

## 1. PROBLEM STATEMENT

Every city corporation receives thousands of civic complaints daily.
The current system is broken in four critical ways:

  [1] DUPLICATE REPORTS
      The same pothole gets reported 20 times by 20 people.
      Each report creates a new ticket. Workers waste time triaging
      duplicates instead of fixing actual problems.

  [2] MANUAL DEPARTMENT ROUTING
      A citizen submits a complaint. A human admin must read it,
      decide which department it belongs to, and manually forward it.
      This takes hours. SLAs are missed.

  [3] ZERO ACCOUNTABILITY
      Citizens submit a report and never hear back. There is no way
      to know if the issue was actually fixed or just marked "Closed"
      on a spreadsheet by a bored clerk.

  [4] NO PROOF OF WORK
      Field workers claim issues are resolved with no evidence.
      Corruption and false closures are rampant.

---

## 2. OUR SOLUTION

NagrikSetu is a three-portal AI civic intelligence system:

  ┌─────────────────────────────────────────────────────┐
  │  CITIZEN PORTAL  (/citizen)                         │
  │  · Citizens capture a photo with the live camera    │
  │  · AI classifies and routes the issue instantly     │
  │  · Duplicate check merges similar nearby reports    │
  │  · GPS-locked report submitted in under 30 seconds  │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  DEPARTMENT PORTAL  (/department)                   │
  │  · Field workers see a priority-sorted task queue   │
  │  · Must be within 100m of issue to resolve (GPS)    │
  │  · Must submit a live "after" photo as proof        │
  │  · SLA countdown visible per ticket                 │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  PUBLIC DASHBOARD  (/)                              │
  │  · Live heatmap of all reported issues in the city  │
  │  · Department leaderboard by resolution rate        │
  │  · Scrolling live ticker of activity                │
  └─────────────────────────────────────────────────────┘

---

## 3. KEY TECHNICAL INNOVATIONS

─────────────────────────────────────────────────────────────
3a. GEMINI AI VISION CLASSIFICATION
─────────────────────────────────────────────────────────────

  When a citizen submits a photo, it is sent to the Google
  Gemini 1.5 Flash Vision API. Gemini returns:

    · Issue category  (Pothole / Garbage / Streetlight / etc.)
    · Target department (PWD / Sanitation / Electrical)
    · Severity score (0–100)
    · Confidence level (High / Low)

  The API call runs CONCURRENTLY with the UI animation so
  there is zero perceived wait time for the user.

  File: src/app/api/classify/route.ts
        src/components/citizen/AIPipeline.tsx


─────────────────────────────────────────────────────────────
3b. HAVERSINE GEOFENCING — DUPLICATE DETECTION
─────────────────────────────────────────────────────────────

  After classification, we run a geofence check against all
  existing open issues of the same department:

    distance = 2 * R * atan2(
      sqrt(sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlon/2)),
      sqrt(1 - sin²(Δlat/2) - cos(lat1)*cos(lat2)*sin²(Δlon/2))
    )

  If distance < 50 meters → the new report is an UPVOTE.
  The original ticket''s priority is boosted instead of
  creating a duplicate. This is the core of our deduplication.

  File: src/app/citizen/page.tsx  (handleLocationAcquired)


─────────────────────────────────────────────────────────────
3c. WEBRTC LIVE CAMERA (DESKTOP + MOBILE)
─────────────────────────────────────────────────────────────

  Standard <input type="file" capture="environment"> degrades
  to a file picker on Windows laptops. We use the WebRTC API:

    navigator.mediaDevices.getUserMedia({ video: { facingMode:
      { ideal: ''environment'' } } })

  This forces a true live camera feed in the browser window
  on both mobile phones AND Windows PCs. The stream is
  attached using a carefully timed useEffect to avoid the
  browser''s "play() on hidden element" bug.

  File: src/components/citizen/CameraCapture.tsx


─────────────────────────────────────────────────────────────
3d. GPS-VERIFIED PROOF OF WORK
─────────────────────────────────────────────────────────────

  A field worker cannot mark an issue as resolved unless:

    (a) Their current GPS coordinates are within 100 meters
        of the originally reported GPS coordinates.

    (b) They submit a live "after" photo taken at the scene
        via the WebRTC camera in the Department Portal.

  This creates a cryptographically attributable, GPS-stamped,
  photographic evidence trail for every resolution.

  File: src/app/department/page.tsx


─────────────────────────────────────────────────────────────
3e. FULLY STANDALONE — NO DATABASE REQUIRED
─────────────────────────────────────────────────────────────

  The entire app runs on browser localStorage. There is no
  external database, no cloud backend, no auth service.
  This makes it deployable anywhere in under 60 seconds
  and fully demonstrable offline.

  8 realistic seed issues are pre-loaded on first visit.
  Images are compressed via canvas before storage to stay
  within the 5MB localStorage quota.

  File: src/lib/localDB.ts

---

## 4. HOW TO RUN LOCALLY

  REQUIREMENTS:
    · Node.js 18 or higher
    · npm
    · A Google Gemini API key (free at https://aistudio.google.com)

  STEPS:

    Step 1 — Install dependencies
    ─────────────────────────────
    npm install

    Step 2 — Add your Gemini API key
    ─────────────────────────────────
    Create a file called .env.local in the project root:

      GEMINI_API_KEY=your_api_key_here

    Step 3 — Start the dev server
    ──────────────────────────────
    npm run dev

    Step 4 — Open in browser
    ─────────────────────────
    http://localhost:3000

  NOTE: The app also works WITHOUT a Gemini key. If the key
  is missing or the API call fails, the system silently falls
  back to a pre-classified result (Pothole / PWD dept) so
  the rest of the demo flow is fully unaffected.

---

## 5. PROJECT STRUCTURE

  NagrikSetu/
  │
  ├── src/
  │   ├── app/
  │   │   ├── page.tsx                  Public dashboard (heatmap, leaderboard)
  │   │   ├── citizen/
  │   │   │   └── page.tsx              Citizen reporting portal
  │   │   ├── department/
  │   │   │   └── page.tsx              Field operator portal
  │   │   ├── admin/
  │   │   │   └── page.tsx              Admin overview
  │   │   └── api/classify/
  │   │       └── route.ts              Gemini AI classification endpoint
  │   │
  │   ├── components/
  │   │   ├── citizen/
  │   │   │   ├── CameraCapture.tsx     WebRTC live camera component
  │   │   │   ├── AIPipeline.tsx        AI scan animation + concurrent API call
  │   │   │   └── GPSLock.tsx           GPS acquisition with desktop fallback
  │   │   └── public/
  │   │       ├── PublicHeatmap.tsx     Issue heatmap
  │   │       ├── Leaderboard.tsx       Department leaderboard
  │   │       └── LiveTicker.tsx        Live activity feed
  │   │
  │   └── lib/
  │       ├── localDB.ts                localStorage CRUD + seed data + image compression
  │       └── utils.ts                  Utility helpers
  │
  ├── .env.local                        (you create this — Gemini API key)
  ├── package.json
  └── README.md

---

## 6. TECH STACK

  Layer               Technology
  ──────────────────────────────────────────────────
  Framework           Next.js 15 (App Router)
  Language            TypeScript
  Styling             Tailwind CSS
  Animations          Framer Motion
  AI Vision           Google Gemini 1.5 Flash
  Camera              WebRTC (getUserMedia API)
  Storage             Browser localStorage
  Deployment          Vercel
  ──────────────────────────────────────────────────

---

## 7. DEMO WALKTHROUGH FOR JUDGES

  We recommend opening THREE browser tabs side-by-side:
    Tab 1: http://localhost:3000           (Public Dashboard)
    Tab 2: http://localhost:3000/citizen   (Citizen Portal)
    Tab 3: http://localhost:3000/department (Dept Portal)

  ────────────────────────────────────────────────────
  FLOW A: Normal Civic Report
  ────────────────────────────────────────────────────

  [1] In Tab 2 (Citizen Portal):
      → Click "Capture Civic Issue"
      → Allow camera when browser prompts
      → Point camera at anything, tap the shutter (○) button
      → Watch the AI scanning animation run
      → See the classification result (department + severity)
      → GPS auto-locks (or simulates on desktop)
      → Click "Submit Verified Report"
      → Toast confirms: "Ticket #NS-XXXXXXXX filed. SLA: Xh"

  [2] Switch to Tab 3 (Department Portal):
      → Your issue appears at the top of the queue
      → Click the issue card to open the resolution panel
      → See "Before" photo (citizen''s capture)
      → GPS verifies you are near the issue
      → Click "Tap to Capture Proof" → live camera opens
      → Take the proof photo → click shutter
      → Click "Mark as Resolved"

  [3] Switch to Tab 1 (Public Dashboard):
      → See the resolved issue disappear from the heatmap
      → Leaderboard updates with new resolution count

  ────────────────────────────────────────────────────
  FLOW B: Duplicate Detection Demo
  ────────────────────────────────────────────────────

  [1] In Tab 2 (Citizen Portal):
      → Click the "QA: Normal" toggle in the TOP-RIGHT header
      → It switches to "QA: Duplicate" (yellow indicator)

  [2] Capture a photo and complete the analysis

  [3] Instead of the green "Submit" button, you will see:
      → Yellow "👍 Upvote Existing Issue" button
      → Message: "An identical issue was reported nearby"

  [4] Click the upvote button:
      → The existing issue''s priority is boosted
      → No duplicate ticket is created
      → Flow resets for the next report

---

## 8. TEAM

  Project: NagrikSetu
  Event  : [Hackathon Name]
  Year   : 2024

  Links:
    Live Demo  → https://nagriksetu-nine.vercel.app/
    GitHub     → https://github.com/zklq1g/Nagriksetu

---

  Thank you for reviewing NagrikSetu!
  We built this to show that civic tech doesn''t need to be
  slow, ugly, or complicated. A citizen should be able to
  report a pothole in under 30 seconds — and a field worker
  should be able to prove they fixed it just as fast.

# ============================================================
