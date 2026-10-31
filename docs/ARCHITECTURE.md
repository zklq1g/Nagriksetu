# NagrikSetu — Architecture & Technical Design Specification

> **नागरिक सेतु (Citizen Bridge)** — AI-Driven Civic Accountability, Geofencing, and Proof-of-Work Verification Engine.

---

## 1. System Overview

NagrikSetu is designed as an end-to-end civic intelligence and accountability platform. Rather than acting as a passive complaint inbox, it functions as an active enforcement engine that routes, deduplicates, time-bounds, and cryptographically/geographically verifies civic repairs.

```
                           +---------------------------+
                           |   Citizen Mobile Portal   |
                           |   (WebRTC Camera & GPS)   |
                           +-------------+-------------+
                                         |
                                         v
                         +---------------+---------------+
                         |  Gemini Vision API Classifier  |
                         |  - Issue Category & Severity  |
                         |  - Auto Department & SLA      |
                         +---------------+---------------+
                                         |
                                         v
                         +---------------+---------------+
                         |   Haversine Geofencing Engine |
                         |   < 50m: Merge as Upvote      |
                         |   > 50m: Create New Ticket    |
                         +---------------+---------------+
                                         |
                 +-----------------------+-----------------------+
                 |                                               |
                 v                                               v
   +-------------+-------------+                   +-------------+-------------+
   |  Department Field Portal  |                   |   Public Transparency     |
   |  - SLA Urgency Queue      |                   |   Dashboard & Heatmap     |
   |  - 100m Proximity Lock    |                   |   - Resolution Leaderboard|
   |  - WebRTC "After" Proof   |                   |   - Live Civic Ticker     |
   +-------------+-------------+                   +---------------------------+
                 |
                 v
   +-------------+-------------+
   |  Admin Command Center     |
   |  - Fallback Triage Queue  |
   |  - CPGRAMS Sync Bridge    |
   +---------------------------+
```

---

## 2. Multi-Portal Domain Model

The platform is partitioned into three specialized user surfaces and an administrative control plane:

| Portal | Route | Primary Persona | Critical Technical Constraints |
|---|---|---|---|
| **Citizen Portal** | `/citizen` | Citizens | Live camera capture only (WebRTC `environment` stream), automated client GPS acquisition, 50m duplicate detection. |
| **Department Portal** | `/department` | Field Workers & Contractors | 100-meter proximity gatekeeper (Haversine check), mandatory WebRTC "after" photo proof, dynamic SLA urgency sorting. |
| **Public Dashboard** | `/` & `/public` | General Public & Media | Leaflet.js real-time issue heatmap, municipal department resolution leaderboards, and live activity ticker. |
| **Admin Command Center**| `/admin` | Municipal Commissioners | Low-confidence triage fallback, Structural Similarity (SSIM) resolution audit, upstream CPGRAMS dispatch bridge. |

---

## 3. End-to-End Incident Lifecycle

### Step 1: Capture & Anti-Spoofing (Citizen)
- Access to the device gallery is explicitly prevented to stop pre-recorded or downloaded imagery from being submitted.
- Live video streams are initiated via `navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })` and frozen to canvas upon trigger.

### Step 2: AI Multi-Modal Inference
- Captured image frames (JPEG Base64) are sent to `/api/classify`, invoking **Google Gemini 1.5 Flash Vision**.
- Gemini extracts:
  1. **Issue Classification:** PWD (Potholes/Roads), Sanitation (Garbage/Dumping), Electrical (Streetlights/Traffic Lights).
  2. **Severity Score (0–100):** Visual assessment of hazard and public danger.
  3. **Department Mapping & SLA Allocation:**
     - Sanitation: 24-hour turnaround SLA.
     - Electrical: 48-hour turnaround SLA.
     - PWD / Roads: 168-hour (7-day) turnaround SLA.

### Step 3: Spatial Deduplication via Haversine Formula
Before a new ticket is persisted, coordinates $(\text{lat}_1, \text{lon}_1)$ are cross-referenced with all unresolved tickets of the matching category:

$$\Delta\phi = \frac{(\text{lat}_2 - \text{lat}_1)\pi}{180}, \quad \Delta\lambda = \frac{(\text{lon}_2 - \text{lon}_1)\pi}{180}$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \cdot c \quad (R = 6,371,000\text{ m})$$

- **Distance $d \le 50\text{ m}$:** System identifies the submission as a duplicate. Instead of creating a duplicate ticket, it converts the submission into an **upvote** on the existing ticket, incrementing its priority weight.
- **Distance $d > 50\text{ m}$:** System creates a new distinct incident record with timestamp, AI confidence, and dynamic SLA deadline.

### Step 4: Proximity-Gated Proof of Work (Department)
- Field operators view their active queue sorted by SLA deadline urgency (`OVERDUE` $\rightarrow$ `URGENT` $\rightarrow$ `ON TRACK`).
- To prevent fraudulent ticket closures from municipal offices:
  1. The operator's live browser GPS is checked against the incident's registered GPS.
  2. If distance $d > 100\text{ m}$, resolution actions are strictly locked: `Confirm & Close` button remains disabled.
  3. If distance $d \le 100\text{ m}$, the operator is permitted to open the WebRTC camera to capture an "After" photo.
  4. Ticket transitions to `Resolved` status with `resolved_at` timestamp and evidence photo.

---

## 4. Data Persistence & Scalability Architecture

### Hybrid Resilience Strategy
NagrikSetu operates on a dual-tier storage strategy designed for standalone evaluation and cloud scalability:

1. **Client-Side Standalone Mode (`src/lib/localDB.ts`):**
   - Enables offline and fully self-contained demonstrations without requiring live external database connections.
   - Initialized with seed data reflecting realistic civic incidents across Delhi NCR.
   - Synchronizes state dynamically across tabs via `localStorage` change events.

2. **Supabase Cloud Topology (PostgreSQL + PostGIS):**
   - High-throughput relational store with spatial extensions enabled.
   - Spatial index implementation:
     ```sql
     CREATE INDEX idx_issues_location 
     ON issues USING GIST (geography(ST_SetSRID(ST_MakePoint(lng, lat), 4326)));
     ```
   - Enables sub-millisecond radius search using native PostGIS operators:
     ```sql
     SELECT * FROM issues 
     WHERE ST_DWithin(
       geography(ST_SetSRID(ST_MakePoint(lng, lat), 4326)),
       geography(ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326)),
       50
     ) AND status = 'Open';
     ```

---

## 5. Security & Verification Posture

- **Spoofing Prevention:** Elimination of traditional file input dialogs prevents uploading stock imagery.
- **Client Geolocation Constraints:** High accuracy mode requested (`enableHighAccuracy: true`, `timeout: 10000`) with error handling for hardware GPS acquisition.
- **Tamper-Evident Evidence:** Paired before-and-after photographic evidence permanently preserved with GPS telemetry for independent civic audit.
