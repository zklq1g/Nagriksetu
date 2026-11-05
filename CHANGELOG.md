# Changelog

All notable changes to the **NagrikSetu** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Push notification service integration for citizen ticket progress updates.
- Automated municipal contractor performance scorecard and penalty deduction engine.

---

## [1.7.0] - 2026-11-05

### Added
- **Municipal IoT Sensor Telemetry & Autonomous Drone Survey Specification**:
  - Authored comprehensive `docs/IOT_DRONE_TELEMETRY.md` establishing proactive infrastructure monitoring via fixed edge sensor meshes and autonomous UAV photogrammetry.
  - Formulated the MQTT v5.0 telemetry protocol and JSON message contracts (`IIoTSensorTelemetryPacket`) for storm drainage depth gauges, water distribution pressure transducers, and smart luminaire controllers.
  - Specified the autonomous drone survey ingestion pipeline utilizing MAVLink v2.0, RTK-GNSS sub-decimeter georeferencing, and edge-inferred computer vision bounding polygons for road defect quantification (`IDroneFlightSurveyBatch`).
  - Defined mathematical anomaly detection algorithms incorporating Exponentially Weighted Moving Average (EWMA) noise suppression ($\alpha = 0.20$), rate-of-change pressure burst triggers ($dP/dt \le -0.8\text{ bar/min}$), and volumetric pothole severity scoring.
  - Established the spatial deduplication bridge correlating IoT/drone telemetry anomalies with citizen reports within the 50-meter Haversine radius ($R = 6,371,000\text{ m}$) to auto-synthesize verified municipal work orders.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` to integrate `docs/IOT_DRONE_TELEMETRY.md` into the primary technical documentation directory.
  - Updated the unreleased roadmap to reflect the delivery of IoT sensor telemetry and automated drone survey specifications.

---

## [1.6.0] - 2026-11-03

### Added
- **Multilingual Localization & Accessibility Architecture**:
  - Authored comprehensive `docs/LOCALIZATION_ACCESSIBILITY.md` establishing the 8th Schedule Indic language support matrix (Hindi, Marathi, Tamil, Bengali, Telugu, and Indian English).
  - Specified the typed i18n data contract (`ICivicLocaleBundle`) with strict compile-time structural parity and cascading fallback resolution.
  - Designed the vernacular voice-assisted citizen intake pipeline leveraging the Web Speech API (`webkitSpeechRecognition`) for hands-free roadside incident capture.
  - Defined the vernacular keyword extraction matrix mapping localized colloquial grievance tokens (e.g., "खड्डा", "कचरा", "गटार", "குப்பை") to municipal department routing queues.
  - Formalized WCAG 2.2 AAA accessibility compliance standards including $\ge 48\times 48\text{ px}$ touch target bounding geometry, sunlight-readable high-contrast luminance thresholds ($\ge 7.0:1$), and Devanagari/Dravidian typographic line-height dynamics.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` to integrate `docs/LOCALIZATION_ACCESSIBILITY.md` into the primary technical resources index.
  - Refined the unreleased roadmap to reflect completion of the multilingual accessibility and vernacular speech intake specification.

---

## [1.5.0] - 2026-11-02

### Added
- **Offline Field Operations & Background Sync Specification**:
  - Authored comprehensive `docs/OFFLINE_FIELD_OPERATIONS.md` establishing the offline-first resilience architecture for municipal field operators in degraded connectivity zones.
  - Formulated the client-side IndexedDB database schema (`NagrikSetuFieldCache_v1`) spanning `cached_assignments`, `offline_proofs`, and prioritized `sync_queue` object stores.
  - Specified deterministic client-side Haversine geofencing calculations ($R = 6,371,000\text{ m}$) executed inside dedicated Web Workers with strict horizontal GPS accuracy gating ($\le 15\text{ m}$).
  - Designed the cryptographic proof-of-work pipeline using the Web Crypto API (`SHA-256`) to guarantee tamper-proof before/after evidence integrity prior to network dispatch.
  - Defined the ServiceWorker Background Sync protocol featuring exponential backoff, uniform random jitter, and server-side PostGIS spatial conflict reconciliation.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` to integrate `docs/OFFLINE_FIELD_OPERATIONS.md` into the primary technical documentation index.
  - Refined the unreleased roadmap to reflect completion of the offline field caching specification.

---

## [1.4.0] - 2026-11-02

### Added
- **API & Integration Specification**:
  - Authored comprehensive `docs/API_SPECIFICATION.md` detailing multi-modal vision contracts, spatial verification parameters, and government interoperability schemas.
  - Formulated the exact request/response schemas for `/api/classify` utilizing Google Gemini 1.5/3.6 Flash.
  - Specified the Supabase PostGIS cloud database schema, spatial indexes (`GIST`), and `ST_DWithin` proximity query contracts.
  - Formalized the CPGRAMS (Centralised Public Grievance Redress and Monitoring System) outbound dispatch payload and ministry routing taxonomy (`MOHUA`, `MORTH`, `MOP`).
  - Defined the Computer Vision Structural Similarity Index Measure (SSIM) proof-of-work resolution verification protocol with $\ge 90\%$ structural delta scoring.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` to integrate `docs/API_SPECIFICATION.md` into the primary technical documentation directory.

---

## [1.3.0] - 2026-10-31

### Added
- **Technical Architecture Specification**:
  - Authored comprehensive `docs/ARCHITECTURE.md` documenting end-to-end incident lifecycle, domain models, and verification pipelines.
  - Formulated detailed mathematical specifications for Haversine geofencing distance calculations ($R = 6,371,000\text{ m}$).
  - Documented dual-tier persistence strategy comparing client-side `localDB` fallback with Supabase PostGIS `ST_DWithin` spatial indexing.
  - Specified operator proof-of-work workflow and 100-meter proximity gatekeeper mechanics.

### Changed
- **Documentation & Navigation**:
  - Expanded `README.md` documentation index to cross-link architecture specifications, demo scripts, and hackathon judge evaluation rubrics.
  - Updated project references and version history for daily project milestones.

---

## [1.2.0] - 2026-10-30

### Added
- **Visual Branding Variations**:
  - Implemented 3 modern logo concepts (Patch, Wrench, Pulse) with side-by-side comparison previews.
  - Added Concept 2b (`LogoWrenchB`) featuring a crescent wrench with circuit trace handle.
  - Configured dynamic individual routing for branding and visual review.
- **Hackathon & Judge Documentation**:
  - Added comprehensive `HACKATHON_README.md` targeted for offline judge evaluations and ZIP submissions.
  - Added technology stack status badges (Next.js 15, TypeScript 5, Google Gemini AI, Supabase) to `README.md`.
  - Added project changelog documentation tracking architecture and UI iterations.

### Changed
- **Pipeline Concurrency**:
  - Executed Gemini Vision AI classification request concurrently with client-side UI scanning animation to eliminate perceived latency.
  - Automated GPS coordinate acquisition immediately upon classification completion.

### Fixed
- Resolved missing `updateLocalIssue` import in citizen reporting view (`src/app/citizen/page.tsx`).
- Fixed live camera attachment flow in department proof-of-work capture via `useEffect` hook lifecycle management.
- Corrected upvote button event binding for duplicate issue resolution.

---

## [1.1.0] - 2026-10-29

### Added
- **Geofencing & Duplicate Detection**:
  - Haversine formula calculation for proximity verification within 50-meter radius.
  - Upvote-instead-of-duplicate reporting workflow to prevent ticket spam.
- **Proof-of-Work Verification**:
  - Proximity check requiring field operators to be within 100 meters of ticket location before resolution.
  - Before/After visual comparison workflow.

---

## [1.0.0] - 2026-10-28

### Added
- Initial release of **NagrikSetu** civic reporting platform.
- Next.js 15 App Router architecture with Tailwind CSS and Framer Motion.
- Citizen reporting portal with live WebRTC camera capture.
- Google Gemini 1.5 Flash vision integration for civic issue classification and severity grading.
- Department portal with SLA urgency badges and resolution queue.
- Public dashboard featuring live heatmap, department leaderboard, and real-time activity ticker.
