# Changelog

All notable changes to the **NagrikSetu** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Regional multilingual localization (Hindi, Marathi, Tamil, Bengali) for citizen intake.
- Automated drone survey integration for peri-urban road network defect telemetry.
- Push notification service integration for citizen ticket progress updates.

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
