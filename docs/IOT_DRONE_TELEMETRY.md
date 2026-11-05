# NagrikSetu — Municipal IoT Sensor Telemetry & Autonomous Drone Survey Specification

> **Real-Time SCADA/MQTT Telemetry for Municipal Drainage & Water Distribution, Autonomous UAV Orthomosaic Road Defect Inspection, Edge AI Inferencing, and PostGIS Spatial Incident Correlation.**

---

## 1. Operational Overview & Proactive Ingestion Context

Traditional civic reporting platforms rely exclusively on reactive citizen intervention: municipal authorities only become aware of infrastructure failures after potholes damage vehicles, storm drains overflow into residential basements, or water distribution mains burst under urban thoroughfares.

NagrikSetu introduces a **Proactive Dual-Telemetry Ingestion Architecture** integrating:
1. **Fixed IoT Edge Sensor Meshes**: Continuous, low-latency telemetry from municipal storm sewer ultrasonic level gauges, water distribution hydrostatic pressure transducers, and smart streetlighting photocell/current monitors.
2. **Autonomous Drone (UAV) Aerial Surveys**: Scheduled and on-demand orthomosaic corridor sweeps across peri-urban arterial highways, leveraging on-device TensorRT computer vision to quantify road surface cracking, pothole surface area, and volumetric ballast displacement.

By coupling high-frequency telemetric data with the NagrikSetu central triage engine, the system automatically detects anomalies, correlates them with citizen reports within the **50-meter Haversine radius**, and synthesizes prioritized department work orders before civic disruptions escalate.

```
+----------------------------------------------------------------------------------------------------+
|                                    Telemetry Edge Acquisition Layer                                |
|                                                                                                    |
|  +------------------------------------+             +-------------------------------------------+  |
|  |     Municipal Fixed IoT Meshes     |             |       Autonomous Drone (UAV) Fleet        |  |
|  |  - Storm Drain Ultrasonic Gauges   |             |  - MAVLink v2 / RTK-GNSS Flight Controller|  |
|  |  - Water Main Pressure Sensors     |             |  - 4K Nadir Orthomosaic Camera Gimbal     |  |
|  |  - Smart Luminaire Current Shunts  |             |  - Edge TensorRT Road Defect Inferencing  |  |
|  +-----------------+------------------+             +---------------------+---------------------+  |
|                    |                                                      |                        |
|                    | MQTT v5.0 (TLS 8883)                                 | GeoJSON Telemetry Batches |
|                    v                                                      v                        |
|  +----------------------------------------------------------------------------------------------+  |
|  |                           NagrikSetu Ingestion Gateway & Message Broker                      |  |
|  |  - EMQX MQTT Ingestion Cluster                                                               |  |
|  |  - Token Authentication & HMAC-SHA256 Payload Signature Verification                        |  |
|  |  - Protocol Buffers / Canonical JSON Normalization                                           |  |
|  +----------------------------------------------+-----------------------------------------------+  |
+-------------------------------------------------|--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                               Telemetry Stream Processing & Anomaly Engine                         |
|                                                                                                    |
|  +---------------------------------------+          +-------------------------------------------+  |
|  |     Signal Filtering & Anomaly Gate   |          |      PostGIS Spatial Correlation Bridge   |  |
|  |  - EWMA Noise Smoothing (alpha = 0.2) |          |  - ST_DWithin 50m Proximity Query         |  |
|  |  - Rate-of-Change (dP/dt) Detection   | <------> |  - Cross-references Citizen Submissions   |  |
|  |  - Hysteresis Window Gating (180s)    |          |  - Auto-Upvotes or Synthesizes New Ticket |  |
|  +---------------------------------------+          +---------------------+---------------------+  |
|                                                                           |                        |
|                                                                           v                        |
|  +----------------------------------------------------------------------------------------------+  |
|  |                       Department SLA Dispatch & Public Heatmap Feeds                         |  |
|  |  - Auto-generates PWD / Sanitation / Electrical Tickets with Verified Priority Badges        |  |
|  |  - Broadcasts Real-time Incident Geometries to GodView Admin and Public Heatmaps             |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Fixed IoT Edge Sensor Telemetry Protocol

Fixed municipal sensors communicate over **MQTT v5.0** secured via mutual TLS (mTLS) with X.509 device certificates. Telemetry streams are organized under a strict hierarchical topic structure.

### 2.1 MQTT Topic Taxonomy

```
nagriksetu/telemetry/{ward_id}/{sensor_type}/{device_uuid}
```

- `{ward_id}`: Municipal administrative ward identifier (e.g., `ward-07-central`, `ward-12-rohini`).
- `{sensor_type}`: Telemetry domain identifier (`storm_drain` | `water_main` | `smart_luminaire`).
- `{device_uuid}`: RFC 4122 v4 unique hardware identifier provisioned during field commissioning.

### 2.2 Telemetry Packet Schema (`IIoTSensorTelemetryPacket`)

```typescript
export type IoTSensorType = 'storm_drain' | 'water_main' | 'smart_luminaire';

export interface IIoTSensorTelemetryPacket {
  version: '2.0';
  deviceId: string;
  wardId: string;
  sensorType: IoTSensorType;
  timestamp: string; // ISO 8601 UTC timestamp
  location: {
    lat: number;
    lng: number;
    elevationMeters: number;
    accuracyRadiusMeters: number;
  };
  diagnostics: {
    batteryVoltage: number; // Volts (nominal: 3.6V - 12.0V)
    signalStrengthDbm: number; // Cellular / LoRaWAN RSSI in dBm
    ambientTempCelsius: number;
    sensorHealthCode: 0 | 1 | 2; // 0 = Nominal, 1 = Degraded/Drift, 2 = Hardware Fault
  };
  metrics: {
    // Storm Drain Ultrasonic Gauge
    stormDrain?: {
      manholeDepthTotalMm: number;
      currentWaterLevelMm: number;
      surchargePercentage: number; // (currentWaterLevel / manholeDepth) * 100
      flowVelocityMps: number;
    };
    // Water Distribution Main Transducer
    waterMain?: {
      staticPressureBar: number;
      pressureDeltaRateBarPerMin: number;
      flowRateLitersPerSec: number;
      cavitationAcousticDb: number;
    };
    // Smart Streetlight Luminaire Monitor
    smartLuminaire?: {
      inputVoltageRms: number;
      loadCurrentAmperes: number;
      powerFactor: number;
      ambientLux: number;
      relayClosed: boolean;
      lampFaultDetected: boolean;
    };
  };
  signature: string; // HMAC-SHA256 of canonical payload string
}
```

---

## 3. Autonomous Drone (UAV) Telemetry & Orthomosaic Inspection

For broad peri-urban road corridors where citizen reporting density is low, NagrikSetu ingests automated aerial surveys conducted by licensed municipal UAVs operating autonomous waypoint missions via **MAVLink v2.0**.

### 3.1 Flight & Sensor Parameters

- **Flight Controller**: PX4 Autopilot with dual-band RTK-GNSS positioning (horizontal position uncertainty $\le 0.05\text{ m}$).
- **Sensor Payload**: 48 MP Sony IMX-series optical sensor on a 3-axis stabilized brushless gimbal with nadir ($90^\circ$ pitch) orientation.
- **Ground Sampling Distance (GSD)**: Fixed at $\le 0.8\text{ cm/pixel}$ achieved at a flight altitude of $45\text{ m}$ AGL (Above Ground Level).
- **Edge Inference Accelerator**: Onboard Nvidia Jetson Orin Nano executing an INT8-quantized YOLOv10 segmentation model trained on asphalt distress datasets.

### 3.2 Drone Survey Flight Batch Contract (`IDroneFlightSurveyBatch`)

```typescript
export interface IDroneDefectFeature {
  featureId: string;
  defectClass: 'pothole' | 'asphalt_crack_alligator' | 'manhole_depression' | 'shoulder_erosion';
  confidenceScore: number; // 0.0 to 1.0
  centroid: {
    lat: number;
    lng: number;
    elevationAglMeters: number;
  };
  boundingPolygonGeoJson: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
  metrics: {
    surfaceAreaSquareMeters: number;
    estimatedDepthMm: number;
    volumetricDefectCubicMeters: number;
  };
  orthomosaicTileUrl: string;
  originalFrameTimestamp: string;
}

export interface IDroneFlightSurveyBatch {
  batchId: string;
  uavRegistrationNumber: string;
  operatorLicenseId: string;
  corridorId: string;
  wardId: string;
  surveyStartTime: string;
  surveyEndTime: string;
  flightPathSummary: {
    totalDistanceKilometers: number;
    flightDurationSeconds: number;
    averageAltitudeAglMeters: number;
    rtkFixRatioPercentage: number; // Must be >= 95.0% for valid automated triage
  };
  detectedFeatures: IDroneDefectFeature[];
  telemetryLogHash: string; // SHA-256 integrity hash of raw flight log
}
```

---

## 4. Anomaly Filtering & Dynamic Auto-Ticket Generation

To prevent transient sensor noise, wind vibrations, or vehicular turbulence from generating spurious work orders, the ingestion gateway applies statistical filtering and hysteresis gating.

### 4.1 Signal Noise Reduction via Exponentially Weighted Moving Average (EWMA)

For continuous physical metrics ($Y_t$, e.g., water level or hydrostatic pipe pressure), the ingestion worker computes a smoothed state $S_t$:

$$S_t = \alpha Y_t + (1 - \alpha) S_{t-1}$$

Where the smoothing parameter $\alpha$ is calibrated to $\alpha = 0.20$.

### 4.2 Threshold Trigger Criteria

A telemetric anomaly event is declared only when the filtered state satisfies the domain criteria:

| Telemetry Domain | Primary Anomaly Metric | Threshold Trigger Condition | Persistence Requirement | Target Department |
|---|---|---|---|---|
| **Storm Drainage** | Surcharge Percentage | $S_{\text{level}} \ge 80.0\%$ | $\Delta t \ge 180\text{ seconds}$ | Sanitation & Drainage |
| **Water Main** | Negative Pressure Gradient | $\frac{dP}{dt} \le -0.80\text{ bar/min}$ AND $P \le 1.2\text{ bar}$ | $\Delta t \ge 60\text{ seconds}$ | PWD / Water Supply |
| **Street Luminaire** | Load Current vs Relay | $\text{Relay} = \text{Closed} \land I_{\text{RMS}} \le 0.05\text{ A}$ | $\Delta t \ge 300\text{ seconds}$ | Electrical Department |
| **UAV Road Sweep** | Volumetric Displacement | $V_{\text{defect}} \ge 0.02\text{ m}^3$ OR Area $\ge 0.35\text{ m}^2$ | Single Verified Pass (RTK Fix $\ge 95\%$) | PWD Road Maintenance |

### 4.3 Volumetric Pothole Severity Index Calculation

For aerial drone defect features, the system computes the normalized severity score ($0 - 100$):

$$\text{Severity}_{\text{drone}} = \min\left(100, \, \left(\frac{A_{\text{defect}}}{0.50} \times 40\right) + \left(\frac{D_{\text{est}}}{150} \times 40\right) + (\text{Confidence} \times 20)\right)$$

Where:
- $A_{\text{defect}}$: Surface area of the defect in square meters (baseline: $0.50\text{ m}^2$).
- $D_{\text{est}}$: Estimated depth in millimeters (baseline: $150\text{ mm}$).
- $\text{Confidence}$: Model inference confidence $[0.0, 1.0]$.

---

## 5. Spatial Correlation & Citizen Report Deduplication Bridge

When a confirmed telemetric anomaly or drone defect is validated, NagrikSetu invokes the **Spatial Correlation Engine** using the standard spherical **Haversine Formula**:

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c \quad \text{where } R = 6,371,000\text{ m}$$

### 5.1 Deduplication & Cross-Validation Matrix

```
       +-------------------------------------------------------------+
       |   Validated Telemetry Anomaly / Drone Defect (lat, lng)     |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |   Spatial Query: Open Tickets of Same Class within 50m?     |
       +------------------------------+------------------------------+
                                      |
                     +----------------+----------------+
                     |                                 |
                  YES (Match)                       NO (No Match)
                     |                                 |
                     v                                 v
    +--------------------------------+   +--------------------------------+
    |  Cross-Validation & Boost      |   |  Proactive Ticket Synthesis    |
    |  - Increment ticket upvotes    |   |  - Synthesize new work order   |
    |  - Append sensor telemetry     |   |  - Attach orthomosaic / graph  |
    |  - Elevate SLA urgency to      |   |  - Auto-route to assigned      |
    |    URGENT if threshold exceeded|   |    department queue            |
    +--------------------------------+   +--------------------------------+
```

1. **Existing Citizen Report Found within 50m**:
   - The ticket is immediately upgraded to **"Telemetry Verified"**.
   - The `ai_confidence` score is boosted to $\ge 98\%$.
   - Sensor time-series plots or drone orthomosaics are bound to the ticket as supplementary diagnostic evidence.
   - If the anomaly indicates imminent hazard (e.g., manhole surcharge $>90\%$), SLA is escalated from `ON_TRACK` to `URGENT`.
2. **No Citizen Report Found**:
   - A new ticket is automatically synthesized in `localDB` / Supabase with `user_id = "system-telemetry-agent"`.
   - The ticket displays a distinct **"Autonomous Telemetry Detection"** badge in the Department Portal queue.

---

## 6. Implementation Architecture & Data Interfaces (`src/types/telemetry.ts`)

```typescript
export interface ITelemetryAnomalyEvent {
  anomalyId: string;
  source: 'iot_fixed_sensor' | 'drone_aerial_survey';
  departmentId: string; // Matches NagrikSetu PWD, Sanitation, or Electrical UUID
  lat: number;
  lng: number;
  severityScore: number; // 0 to 100
  title: string;
  technicalDescription: string;
  telemetrySnapshotUrl?: string; // S3/Supabase Storage link to sensor graph or drone orthomosaic
  detectedAt: string;
  correlatedTicketId?: string; // Set if merged with existing citizen report
}

export interface ITelemetryIngestResult {
  status: 'PROCESSED_NEW_TICKET' | 'CORRELATED_EXISTING_TICKET' | 'FILTERED_NOISE';
  anomalyId?: string;
  ticketId?: string;
  distanceMeters?: number;
  message: string;
}
```

---

## 7. Fault Tolerance, Backpressure, & Edge Resilience

To ensure 24/7 reliability across municipal grid disruptions:

1. **Cellular Outage Buffering**: Fixed IoT microcontrollers (ESP32-S3 / STM32WB55 with LTE-M backhaul) maintain a 64 MB SPI NOR flash circular ring buffer capable of retaining 7 days of sampled telemetry during telecommunication downtime.
2. **Drone Store-and-Forward**: UAV survey batches are cached encrypted on internal NVMe storage and synchronized upon landing at the automated docking nest via gigabit Wi-Fi 6.
3. **Dead-Letter Queue (DLQ) & Throttling**: The cloud broker limits telemetry ingestion to a sustained $1,000\text{ packets/sec/ward}$ with token bucket rate limiting. Malformed signatures or unparseable packets are routed to a partitioned DLQ for operator audit.
