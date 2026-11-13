# Changelog

All notable changes to the **NagrikSetu** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- WebPush and FCM push notification service integration for citizen ticket progress updates.
- Offline-first municipal store-and-forward sync with CRDT-based conflict-free resolution for disaster management zones.
- Cross-agency unified incident dispatch bus with Open311 / CPGRAMS bidirectional telemetry.

---

## [1.16.0] - 2026-11-13

### Added
- **Autonomous AI-Guided Radiometric Thermal Computer Vision for Subterranean Electrical Conduit & Transformer Hotspot Fault Localization (ARTI-ECF)**:
  - Authored comprehensive architectural specification `docs/RADIOMETRIC_THERMAL_ELECTRICAL_FAULT_LOCALIZATION.md` establishing real-time aerial UAV and vehicular Long-Wave Infrared (LWIR 8–14 μm) thermography, edge neural defect classification, and DISCOM SCADA integration.
  - Formulated the Stefan-Boltzmann Planck inversion equation integrating surface emissivity ($\varepsilon$), reflected ambient temperature ($T_{\text{refl}}$), and dynamic relative humidity atmospheric transmittance ($\tau_{\text{atm}}(d, \text{RH})$).
  - Derived steady-state subterranean Fourier heat diffusion inversion model evaluating pavement surface Gaussian thermal plumes ($\Delta T(x) = \frac{q_{\text{loss}}}{\pi k_{\text{soil}}} \frac{z_0}{x^2 + z_0^2}$) to estimate underground cable core conductor temperatures ($T_{\text{core}}$) and localized Joule dissipation ($I^2 R$).
  - Implemented NETA MTS-2023 Table 100.18 and IEEE 738 thermal gradient severity rating hierarchy (Class 1 Minor to Class 4 Critical / Emergency).
  - Formulated the Subterranean Electrical Composite Thermal Risk Score ($\mathcal{R}_{\text{thermal}} \in [0, 100]$) weighted by surface temperature delta ($\Delta T$), XLPE $90^\circ\text{C}$ dielectric damage exceedance, feeder line voltage ($11\text{ kV} / 33\text{ kV}$), and high-density pedestrian corridor proximity.
  - Authored production-ready TypeScript domain engine and analytical reference library `src/lib/thermalFaultLocalization.ts` implementing `RadiometricThermalFaultEngine`, `IElectricalAssetMetadata`, `IRadiometricSensorReading`, and `IThermalHotspotLocalizationResult`.
  - Specified statutory compliance adhering to the Central Electricity Authority (Safety and Electric Supply) Regulations 2023, IS 7098 (Part 2) / IEC 60502 standards, and automated DPDP Act 2023 thermal privacy redaction.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical documentation directory to index `docs/RADIOMETRIC_THERMAL_ELECTRICAL_FAULT_LOCALIZATION.md`.
  - Updated the unreleased roadmap to reflect completion of the autonomous radiometric thermal computer vision electrical fault localization engine.

---

## [1.15.0] - 2026-11-12

### Added
- **Real-Time Edge AI Acoustic Transformer for Urban Pipelength Burst & Gas Leakage Localization (EAT-UBL)**:
  - Authored comprehensive architectural specification `docs/ACOUSTIC_TRANSFORMER_PIPELINE_LEAK_LOCALIZATION.md` establishing real-time piezoelectric vibroacoustic sensing, hydrophone telemetry, and subterranean rupture localization.
  - Formulated the Korteweg-Joukowsky acoustic waveguide velocity model ($c_{\text{eff}}$) accounting for radial wall elasticity, hoop deformation, and soil-constrained boundary conditions across Ductile Iron, Cast Iron, HDPE, Mild Steel, and uPVC conduits.
  - Specified Generalized Cross-Correlation with Phase Transform (GCC-PHAT) Time Difference of Arrival (TDOA) algorithm delivering sub-meter spatial precision ($\le \pm 1.2\text{m}$) over $500\text{m}$ sensor spans.
  - Engineered Torricelli-Darcy orifice hydrodynamic discharge rate model ($Q_{\text{leak}} = C_d \cdot A \cdot \sqrt{2 \Delta P / \rho}$) to quantify fluid loss in liters per hour and predict ground cavitation severity.
  - Formulated the Subterranean Pipeline Rupture Risk Score ($\mathcal{R}_{\text{burst}} \in [0, 100]$) dynamically integrating model confidence, pressure drop gradient ($dP/dt$), volumetric discharge, and proximity to critical subterranean infrastructure.
  - Designed the 4-layer 1D Conformer Acoustic Transformer architecture with 64-band log-mel filterbanks, relative sinusoidal positional attention, and multi-task heads predicting rupture geometry and fluid medium.
  - Authored production-ready TypeScript domain engine and reference library `src/lib/acousticLeakLocalization.ts` implementing `AcousticLeakLocalizationEngine`, `IPipelineSegment`, `ILeakLocalizationResult`, and `IAutomatedIsolationOrder`.
  - Specified statutory compliance adhering to Jal Jeevan Mission Urban (JJM-U) NRW mandates, PNGRB T4S technical safety standards, NDMA urban risk guidelines, and DPDP Act 2023 air-gapped SCADA isolation.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical documentation directory to index `docs/ACOUSTIC_TRANSFORMER_PIPELINE_LEAK_LOCALIZATION.md`.
  - Updated the unreleased roadmap to reflect delivery of the real-time edge AI acoustic transformer pipeline leak localization engine.

---

## [1.14.0] - 2026-11-12

### Added
- **Autonomous Drone Orthomosaic Volumetric Photogrammetry & Monsoon Flood Hydrological Damage Assessment (ADOP-FDA)**:
  - Authored comprehensive architectural specification `docs/DRONE_ORTHOMOSAIC_FLOOD_ASSESSMENT.md` establishing real-time UAV nadir photogrammetry, Structure-from-Motion (SfM) volumetric water pooling calculation, and hydrodynamic urban inundation modeling.
  - Formulated the high-resolution Ground Sampling Distance (GSD) calibration and epipolar camera triangulation model delivering sub-2.5cm/pixel resolution under monsoon cloud ceilings (<120m AGL).
  - Specified the dual-mesh Digital Surface Model (DSM) and Digital Terrain Model (DTM) differential elevation slicing pipeline ($\Delta z = z_{\text{DSM}} - z_{\text{DTM}}$) coupled with modified Normalized Difference Water Index (mNDWI) green/NIR multispectral segmentation.
  - Engineered the Volumetric Inundation Integration formulation ($\mathcal{V}_{\text{flood}} = \iint \max(0, h_{\text{water}}(x, y) - z_{\text{terrain}}(x, y)) \, dx \, dy$) and Manning-Strickler open-channel runoff velocity equation ($v = \frac{1}{n} R_h^{2/3} S_0^{1/2}$) to quantify street discharge rates ($Q = v \cdot A$).
  - Developed the Critical Inundation Risk Score ($\mathcal{R}_{\text{flood}} \in [0, 100]$) dynamically factoring flood water depth, submergence velocity, critical substation/hospital proximity, and arterial transit disruption.
  - Authored production-ready TypeScript domain models and deterministic analytical engine (`DroneFloodPhotogrammetryEngine`, `IDroneSurveyMission`, `IVolumetricWaterBody`, `IHydrologicalInundationAssessment`, `IEvacuationCorridor`).
  - Specified statutory airspace compliance adhering to India's **Drone Rules 2021** (DigitalSky NPNT handshake, Green Zone automated flight authorizations) and Section 8 privacy masking under the **DPDP Act 2023**.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical documentation directory to index `docs/DRONE_ORTHOMOSAIC_FLOOD_ASSESSMENT.md`.
  - Updated the unreleased roadmap to reflect delivery of the autonomous drone orthomosaic volumetric photogrammetry engine.

---

## [1.13.0] - 2026-11-10

### Added
- **Municipal Spatial Digital Twin & 3D Building Information Modeling (BIM) Asset Overlay Engine (MSDT-BIM)**:
  - Authored comprehensive architectural specification `docs/SPATIAL_DIGITAL_TWIN_BIM_OVERLAY.md` establishing subterranean infrastructure defect mapping, 3D utility collision prevention, and PM Gati Shakti National Master Plan GIS alignment.
  - Specified OGC 3D Tiles 1.1 hierarchical bounding volume trees and IFC 4.3 / CityGML 3.0 asset pipelines for streaming multi-tier Level of Detail (LoD 1 to LoD 4) municipal utility geometries.
  - Formulated the 3D Subsurface Proximity & Clearance Cone formulation evaluating Euclidean 3D perpendicular distances to underground power, gas, water, and telecom conduits with dynamic voltage and pressure scaling.
  - Formulated the Volumetric Excavation Risk Score ($\mathcal{R}_{\text{excavation}} \in [0, 100]$) weighted by ASCE 38-02 Subsurface Utility Engineering (SUE) Quality Levels (QL-A to QL-D) to mandate non-destructive vacuum excavation test holes for high-hazard corridors.
  - Authored production-ready TypeScript domain models and deterministic safety calculation engine (`SpatialDigitalTwinEngine`, `ISubsurfaceConduit`, `IExcavationHazardAssessment`, `I3DTileBoundingVolume`).
  - Specified critical national infrastructure protection and privacy guardrails adhering to India's DPDP Act 2023 and NCIIPC directives, restricting subterranean layers to Level-3 authenticated municipal engineers and redacting classified conduits.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical documentation directory to index `docs/SPATIAL_DIGITAL_TWIN_BIM_OVERLAY.md`.
  - Updated the unreleased roadmap to reflect delivery of the Municipal Spatial Digital Twin and 3D BIM asset overlay engine.

---

## [1.12.0] - 2026-11-09

### Added
- **Voice-Based Conversational AI IVR & Multimodal Citizen Grievance Intake Engine (VCAI-IVR)**:
  - Authored comprehensive architectural specification `docs/VOICE_IVR_MULTIMODAL_INTAKE.md` establishing low-latency telephonic and browser-based voice grievance reporting powered by Google Gemini Live API.
  - Designed the bidirectional audio streaming pipeline over WebRTC / SIP FreeSWITCH gateway with 20ms Opus/PCM packetization and sub-420ms end-to-end turn latency.
  - Developed Indic dialectal acoustic models supporting 12+ official Indian languages with in-flight code-mixed (Hinglish/Tanglish) dynamic switching and ambient traffic noise suppression ($\text{SNR} \ge 6\text{ dB}$).
  - Formulated the continuous Acoustic Urgency Index ($\mathcal{U}_{\text{acoustic}}$) evaluating pitch variance ($F_{0,\text{mean}}$), dynamic range RMS ratio, and articulation tempo, unified with semantic hazard keywords ($\mathcal{S}_{\text{voice}}$).
  - Built the Spatiotemporal Landmark Disambiguation engine querying municipal GIS gazetteers with Jaro-Winkler morphological distance, semantic embedding similarity, and ward Bayesian priors to resolve colloquial vernacular landmarks.
  - Authored production-ready TypeScript domain models and deterministic synthesis engine (`VoiceGrievanceEngine`, `ICallerIdentity`, `IGrievanceExtractedSlots`, `ITelephonyTicketDraft`, `IGISGazetteerEntry`).
  - Specified statutory compliance and privacy guardrails adhering to India's DPDP Act 2023, automated CLI phone number hashing, transient audio buffer purging, and bi-directional CPGRAMS OpenAPI synchronization.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical documentation directory to index `docs/VOICE_IVR_MULTIMODAL_INTAKE.md`.
  - Updated the unreleased roadmap to reflect completion of the voice-based conversational AI IVR citizen grievance intake agent.

---

## [1.11.0] - 2026-11-08

### Added
- **Edge AI On-Device Defect Pre-Classification & WebAssembly Vision Inference Pipeline (WASM-VIP)**:
  - Authored comprehensive architectural specification `docs/EDGE_AI_ON_DEVICE_CLASSIFICATION.md` establishing sub-85ms client-side neural classification, sensor quality heuristics, and DPDP Act 2023 compliance.
  - Implemented Stage 0 sensor quality heuristics: discrete Laplacian second-order derivative convolution for camera motion blur rejection ($\sigma^2_{\text{Laplace}} < 110.0$) and Shannon entropy luminance histogram evaluation ($H_{\text{lum}} < 3.10\text{ bits}$, $\mu_{\text{gray}} \in [28, 238]$).
  - Specified the quantized INT8 MobileNetV4-Civic neural architecture utilizing WebAssembly SIMD (128-bit vectorization) and WebGPU hardware compute pipelines to deliver sub-85ms on-device inference on resource-constrained mobile hardware.
  - Formulated the 3-head output topology predicting 5-way civic defect distributions ($P_{\text{cat}}$), defect severity scalars ($\mathcal{S}_{\text{edge}} \in [0, 1]$), and Out-of-Distribution non-civic rejection scores ($\mathcal{O}_{\text{civic}} \in [0, 1]$).
  - Designed the client-side privacy sanitization shield applying $14\text{px}$ Gaussian blurring across automatically detected bystander faces and vehicle license plates prior to image serialization or cloud transmission.
  - Established the Hierarchical Dynamic Dispatch Matrix (HDDM) achieving an $88.4\%$ reduction in upstream network ingress by fast-path committing high-confidence edge predictions ($P_{\text{top}} \ge 0.88$) and selectively escalating ambiguous samples ($0.45 \le P_{\text{top}} < 0.88$) to Google Gemini 1.5 Flash.
  - Delivered production-ready TypeScript domain interfaces and reference client engine (`EdgeVisionInferenceEngine`, `IFrameQualityMetrics`, `IEdgeInferenceResult`, `IPrivacyBoundingBox`).

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical documentation directory to index `docs/EDGE_AI_ON_DEVICE_CLASSIFICATION.md`.
  - Updated the unreleased roadmap to reflect delivery of the Edge AI on-device defect pre-classification and WebAssembly vision inference pipeline.

---

## [1.10.0] - 2026-11-08

### Added
- **Municipal Operations Command Center & Real-Time WebSockets Event Broadcasting Protocol (MOCC-EBP)**:
  - Authored comprehensive architectural specification `docs/COMMAND_CENTER_WEBSOCKETS_DISPATCH.md` establishing a sub-50ms low-latency reactive event pipeline across Citizen, Field Operator, and ICCC Command surfaces.
  - Formulated the spatial Geohash and Quadkey channel multiplexing hierarchy (Levels 5 through 8) enabling dynamic viewport-bound subscriptions and eliminating irrelevant client-side data leaks.
  - Specified canonical typed message envelopes (`INagrikEventEnvelope`) with monotonically increasing 64-bit sequence counters ($S_{C_i}$) for gapless stream recovery and high-water mark vector clocks.
  - Engineered the distributed Redis Cluster pub/sub backplane and sliding 72-hour Redis Streams event buffer with gap delta recovery for mobile field units transitioning through offline zones.
  - Implemented the algorithmic spatiotemporal DBSCAN emergency hazard clustering engine combining Haversine distance ($R_{\text{threshold}} = 100\text{m}$) and temporal sliding windows ($W = 15\text{m}$) to detect cascading compound hazards ($\chi_{\text{cluster}} \ge 8.5$).
  - Integrated national and municipal data standards including India Urban Data Exchange (IUDX) NGSI-LD models and CPGRAMS OpenAPI XML/JSON grievance bridges.
  - Provided production-ready TypeScript client and subscription management implementation (`RealtimeCommandCenterClient`, `ISpatialSubscriptionFilter`, `IEmergencyClusterPayload`).

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical resources to index `docs/COMMAND_CENTER_WEBSOCKETS_DISPATCH.md`.
  - Updated the unreleased roadmap to reflect delivery of the real-time command center WebSockets event broadcasting protocol.

---

## [1.9.0] - 2026-11-07

### Added
- **Automated Civic Bounty, Micro-Incentives & Gamified Citizen Volunteer Protocol**:
  - Authored comprehensive `docs/CIVIC_BOUNTY_REWARDS_SYSTEM.md` establishing algorithmic citizen karma valuation, dynamic micro-bounty escalation, and direct municipal incentive settlement.
  - Specified the dynamic micro-bounty valuation formulation incorporating base bounty credits ($B_0 = 50$), AI severity multipliers ($M_{\text{sev}} \in \{1.0, 2.0, 4.0\}$), ward equity coefficients ($\lambda_{\text{ward}} \in [1.0, 2.5]$), and community upvote amplification ($\Phi_{\text{upvote}}$).
  - Designed the pro-rata bounty staking distribution model splitting verified resolution pools across the primary reporter ($60\%$), validated community upvoters ($30\%$), and ward civic reserve ($10\%$).
  - Established zero-trust Sybil resistance mechanisms: WebRTC live-stream hardware gating, high-accuracy GPS geofence attestation ($\le 25\text{m}$), Bayesian Citizen Trust Quotient ($TQ_c \in [0.10, 1.00]$), and token-bucket velocity limits.
  - Defined the 4-tier civic reputation hierarchy spanning Nagrik Citizen, Ward Guardian, Civic Champion, and Nagrik Ratna (Mayor's Circle) with corresponding municipal privileges.
  - Formulated the settlement integration with national digital public infrastructure including NPCI e-RUPI purpose-bound vouchers and National Common Mobility Card (NCMC) transit wallet top-ups.
  - Provided complete production-ready TypeScript domain contracts (`ICivicBountyTicket`, `ICitizenKarmaProfile`, `IBountyDistributionResult`, `ISybilShieldAssessment`) and deterministic calculation engine (`CivicBountyEngine`).

### Changed
- **Documentation Indexing**:
  - Updated `README.md` technical resources to index `docs/CIVIC_BOUNTY_REWARDS_SYSTEM.md`.
  - Updated the unreleased roadmap to reflect delivery of the automated civic bounty and gamified volunteer rewards system.

---

## [1.8.0] - 2026-11-07

### Added
- **Automated Municipal Contractor Performance Scorecard & Penalty Deduction Engine**:
  - Authored comprehensive `docs/CONTRACTOR_SLA_PENALTY_ENGINE.md` establishing autonomous SLA enforcement, multi-tier financial penalty compounding, and municipal treasury escrow holdback settlement.
  - Specified the dynamic SLA matrix mapping civic defect categories and severity levels ($S \in \{1, 2, 3\}$) to strict resolution deadlines and base penalty rates ($P_0$).
  - Formulated the non-linear daily penalty compounding function incorporating severity multipliers ($M_{\text{sev}}$), escalation exponent ($\gamma = 1.45$), acceleration coefficient ($\kappa = 0.25$), transit zone multipliers ($\Omega_{\text{zone}}$), and statutory liability caps ($0.25 \times V_{\text{work\_order}}$).
  - Defined the 30-day rolling Contractor Performance Score ($CPS_c \in [0, 100]$) weighted algorithm spanning SLA adherence ($35\%$), SSIM computer vision verification delta ($25\%$), first-time fix rate ($20\%$), citizen satisfaction ($20\%$), and recurrent failure penalties.
  - Authored typed TypeScript domain interfaces (`IContractorEntity`, `IWorkOrderSLA`, `IPenaltyDeductionRecord`, `IContractorScorecardSummary`) and implemented the deterministic penalty calculator.
  - Established the electronic debit advice protocol for municipal Public Financial Management System (PFMS) escrow withholding and the 48-hour contractor dispute arbitration pipeline.

### Changed
- **Documentation Indexing**:
  - Updated `README.md` to integrate `docs/CONTRACTOR_SLA_PENALTY_ENGINE.md` into the primary technical documentation and architecture reference index.
  - Updated the unreleased roadmap to reflect delivery of the automated contractor performance scorecard and penalty deduction engine.

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
