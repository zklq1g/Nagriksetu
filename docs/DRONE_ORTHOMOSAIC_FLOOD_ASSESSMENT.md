# NagrikSetu — Autonomous Drone Orthomosaic Volumetric Photogrammetry & Monsoon Flood Hydrological Damage Assessment (ADOP-FDA)

> **Sub-2.5cm Nadir Photogrammetry, Structure-from-Motion (SfM) Volumetric Ponding Integration, Manning-Strickler Hydrodynamic Runoff Modeling, and DigitalSky Drone Rules 2021 Airspace Integration.**

---

## 1. Executive Summary & Problem Context

Urban centers across India—from the low-lying coastal plains of Mumbai and Chennai to the riverine basins of Patna, Guwahati, and the lake-interconnected topography of Bengaluru—face catastrophic seasonal monsoon flash floods and storm sewer inundation. Intense precipitation events (exceeding $75\text{ mm/hr}$) overwhelm municipal stormwater drainage (SWD) networks within minutes, resulting in:
1. **Arterial Underpass Submergence**: Unmonitored vehicular underpasses accumulating $1.5\text{m}$ to $3.5\text{m}$ of standing water, trapping transit buses and emergency service vehicles.
2. **Subterranean Electrical Substation Inundation**: Flooding of roadside compact substation transformers (CSS) and feeder pillars, precipitating widespread electrocution hazards and cascading grid shutdowns.
3. **Informal Settlement & Low-Lying Habitation Displacement**: Inundation of high-density slums situated along secondary natural drainage channels (*rajakaluves*), necessitating rapid evacuation before structural collapse.
4. **Post-Flood Silt & Debris Clogging**: Volumetric accumulation of road silt, asphalt aggregate, and municipal solid waste preventing standard gravity drainage long after precipitation ceases.

### The Ground Surveying & Satellite Blind Spot

Municipal disaster management teams and public works engineers currently suffer from a critical intelligence deficit during active monsoon crises:
- **Hazardous Ground Access**: Waterlogging renders ground patrol vehicles inoperable, preventing field operators from measuring flood depths or identifying obstructed culverts.
- **Satellite Imaging Latency & Cloud Occlusion**: Optical Earth observation satellites (e.g., Sentinel-2, Landsat) cannot penetrate dense monsoon cumulonimbus cloud covers, while Synthetic Aperture Radar (SAR) constellations (e.g., Sentinel-1) suffer from 12-to-36-hour revisit intervals and severe urban specular radar bounce in high-rise corridors.

To solve this, NagrikSetu introduces the **Autonomous Drone Orthomosaic Volumetric Photogrammetry & Monsoon Flood Hydrological Damage Assessment Engine (ADOP-FDA)**. Leveraging autonomous Unmanned Aerial Vehicle (UAV) fleets equipped with RTK-GNSS positioning, dual-frequency multi-spectral nadir sensors, and Structure-from-Motion (SfM) edge photogrammetry pipelines, ADOP-FDA operates directly beneath cloud ceilings ($<120\text{m}$ Above Ground Level). The system quantifies flood water depths, measures cubic meters of standing water, calculates hydrodynamic runoff velocities, and synthesizes automated emergency dispatch orders within the **Municipal Command Center** and **Citizen Portal**.

```
+----------------------------------------------------------------------------------------------------+
|                                    ADOP-FDA Architectural Topology                                 |
|                                                                                                    |
|  +---------------------------+     +--------------------------+     +----------------------------+ |
|  | Autonomous UAV Fleet      |     | RTK-GNSS Base Stations   |     | DigitalSky Airspace API    | |
|  | - 4K Nadir RGB Camera     |     | - Network RTK (NTRIP)    |     | - Green Zone Auto-Clearance| |
|  | - Green/NIR Multispectral |     | - 1.5cm Spatial Datum    |     | - NPNT Cryptographic Token | |
|  +-------------+-------------+     +------------+-------------+     +--------------+-------------+ |
|                |                                |                                  |               |
|                | MAVLink v2 / Raw TIFF Frames   | RTCM 3.2 Corrections             | Flight Permit |
|                v                                v                                  v               |
|  +-----------------------------------------------------------------------------------------------+ |
|  |                           Edge UAV Photogrammetry & Ingestion Pipeline                        | |
|  |  - Lens Distortion Correction (Brown-Conrady Radial-Tangential Model)                        | |
|  |  - Structure-from-Motion (SfM) Epipolar Tie-Point Matching & Bundle Adjustment                | |
|  |  - High-Resolution Dense Point Cloud (.laz) & Orthomosaic Raster Generation (GSD <= 2.5cm)     | |
|  +-----------------------------------------------+-----------------------------------------------+ |
|                                                  |                                                 |
|                                                  v Streamed GeoTIFF & Elevation Slices             |
|  +-----------------------------------------------------------------------------------------------+ |
|  |                     NagrikSetu Hydrological & Volumetric Inference Engine                     | |
|  |  - Digital Surface Model (DSM) vs. Dry Baseline Digital Terrain Model (DTM) Slicing           | |
|  |  - Modified Normalized Difference Water Index (mNDWI) Spectral Water Boundary Extraction     | |
|  |  - Volumetric Water Inundation Integral: V_flood = \iint (h_water(x,y) - z_terrain(x,y)) dx dy| |
|  |  - Manning-Strickler Hydrodynamic Overland Runoff Discharge: Q = (1/n) * A * R_h^(2/3) * S^0.5| |
|  +-----------------------+-----------------------------------------------+-----------------------+ |
|                          |                                               |                         |
|   50m Spatial Clustering | GeoJSON Alerts                                | Sub-50ms WebSockets     |
|                          v                                               v                         |
|  +-----------------------------------------------+   +-------------------------------------------+ |
|  | Citizen Navigation Portal (/citizen)          |   | Integrated Municipal Command Center (ICCC)| |
|  | - Submerged Underpass Roadway Avoidance       |   | - 3D Contour Inundation Depth God-View    | |
|  | - Real-Time Evacuation Corridor Geo-Pill      |   | - High-Hazard Substation Power Kill Order | |
|  | - Localized Citizen Surcharge Upvote          |   | - High-Capacity Dewatering Pump Dispatch  | |
|  +-----------------------------------------------+   +-------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Technical Specifications & Performance Benchmarks

| Metric Vector | Target Performance | Real-World Operational Standard |
|---|---|---|
| **Ground Sampling Distance (GSD)** | $\le 2.5\text{ cm/pixel}$ at $80\text{m}$ AGL | Resolves curb heights, drain gratings, and vehicle tire submergence |
| **Volumetric Bathymetry Precision** | $\pm 45\text{ mm}$ vertical elevation error | Accurately differentiates impassable $30\text{cm}$ pools from minor surface sheen |
| **Point Cloud Density** | $\ge 180\text{ points/m}^2$ | Dense reconstruction of urban street furniture, barriers, and sidewalks |
| **Turnaround Processing Latency** | $\le 180\text{ seconds}$ for $0.25\text{ km}^2$ corridor | Enables rapid tactical emergency dispatch before water levels peak |
| **Airspace Authorization Speed** | $\le 15\text{ seconds}$ via DigitalSky API | Instant emergency fly-out under DGCA Drone Rules 2021 disaster provisions |
| **Multispectral Spectral Bands** | Green ($560\text{ nm}$), NIR ($840\text{ nm}$), Red ($660\text{ nm}$) | Precise water edge delineation regardless of high turbidity or suspended silt |
| **Regulatory & Privacy Standard** | Automatic face & vehicle license plate obfuscation | 100% compliance with India's DPDP Act 2023 & DGCA CAR Section 3 |

---

## 3. Mathematical Formulations & Hydrological Models

### 3.1 Photogrammetric Ground Sampling Distance (GSD) & Epipolar Geometry

The flight controller computes the target flight altitude $H_{\text{AGL}}$ required to maintain the sub-$2.5\text{cm}$ spatial resolution:

$$\text{GSD} = \frac{H_{\text{AGL}} \cdot s_{\text{sensor}}}{f \cdot W_{\text{image}}}$$

Where:
- $s_{\text{sensor}}$ is the physical sensor width (e.g., $13.2\text{ mm}$ for a 1-inch CMOS sensor).
- $f$ is the optical focal length ($8.8\text{ mm}$).
- $W_{\text{image}}$ is the horizontal image resolution ($5472\text{ pixels}$).
- To ensure $\text{GSD} \le 0.025\text{ m/px}$, maximum altitude is bounded by:
  $$H_{\text{AGL}} \le \frac{0.025 \cdot 0.0088 \cdot 5472}{0.0132} \approx 91.2\text{ meters}$$

During Structure-from-Motion (SfM) processing, corresponding keypoints $\mathbf{x} \leftrightarrow \mathbf{x}'$ across overlapping frames satisfy the epipolar constraint:

$$\mathbf{x}'^T \mathbf{E} \mathbf{x} = 0, \quad \mathbf{E} = [\mathbf{t}]_\times \mathbf{R}$$

where $\mathbf{R} \in \mathbb{SO}(3)$ and $\mathbf{t} \in \mathbb{R}^3$ are relative camera rotation and translation matrices optimized via Levenberg-Marquardt bundle adjustment.

### 3.2 Modified Normalized Difference Water Index (mNDWI)

Suspended particulate matter and urban debris cause regular optical false positives in standard spectral water analysis. ADOP-FDA implements the green and near-infrared (NIR) modified index:

$$\text{mNDWI} = \frac{\rho_{\text{Green}} - \rho_{\text{NIR}}}{\rho_{\text{Green}} + \rho_{\text{NIR}}}$$

A pixel is classified as standing flood surface when:

$$\text{mNDWI}(x, y) \ge \tau_{\text{water}} \quad \text{where } \tau_{\text{water}} = 0.12$$

### 3.3 Volumetric Water Ponding & Bathymetric Elevation Integration

By subtracting the pre-calibrated dry-season Digital Terrain Model ($z_{\text{DTM}}$) from the active monsoon Digital Surface Model ($z_{\text{DSM}}$), the local flood water depth $h_{\text{water}}(x, y)$ is evaluated across the spatial grid $\Omega$:

$$h_{\text{water}}(x, y) = \max\left(0, \, z_{\text{DSM}}(x, y) - z_{\text{DTM}}(x, y)\right) \cdot \mathbb{I}\left(\text{mNDWI}(x, y) \ge \tau_{\text{water}}\right)$$

The total standing water volume $\mathcal{V}_{\text{flood}}$ within an affected civic ward or road polygon $\mathcal{A}$ is:

$$\mathcal{V}_{\text{flood}} = \iint_{\mathcal{A}} h_{\text{water}}(x, y) \, dx \, dy \approx \sum_{i=1}^{N_x} \sum_{j=1}^{N_y} h_{\text{water}}(x_i, y_j) \cdot (\Delta x \cdot \Delta y)$$

### 3.4 Hydrodynamic Overland Runoff & Culvert Discharge (Manning-Strickler)

To determine whether municipal storm lines are draining or experiencing backflow, the system models open-channel surface velocity $v$ and discharge rate $Q$:

$$v = \frac{1}{n} R_h^{2/3} S_0^{1/2}, \quad Q = v \cdot A$$

Where:
- $n$ is Manning’s roughness coefficient ($n = 0.016$ for asphalt pavement, $n = 0.024$ for choked rubble gutters).
- $R_h = \frac{A}{P}$ is the hydraulic radius (ratio of cross-sectional flow area $A$ to wetted perimeter $P$).
- $S_0 = -\frac{\partial z}{\partial s}$ is the hydraulic energy slope calculated from high-resolution DTM contours.

### 3.5 Composite Flood Hazard Index ($\mathcal{R}_{\text{flood}}$)

The holistic risk scalar $\mathcal{R}_{\text{flood}} \in [0, 100]$ drives automated dispatch triggers:

$$\mathcal{R}_{\text{flood}} = \min\left(100, \, \alpha_1 \cdot \left(\frac{\bar{h}_{\text{water}}}{h_{\text{crit}}}\right) + \alpha_2 \cdot \log_{10}(1 + \mathcal{V}_{\text{flood}}) + \alpha_3 \cdot \Phi_{\text{infra}} + \alpha_4 \cdot \Psi_{\text{pop}}\right)$$

Where:
- $h_{\text{crit}} = 0.50\text{ meters}$ (critical vehicle floatation depth).
- $\alpha_1 = 35.0, \, \alpha_2 = 25.0, \, \alpha_3 = 25.0, \, \alpha_4 = 15.0$ are empirical weighting coefficients.
- $\Phi_{\text{infra}} \in [0, 1]$ represents proximity to electrical substations, hospitals, and primary evacuation corridors.
- $\Psi_{\text{pop}} \in [0, 1]$ is ward demographic density.

---

## 4. Production-Ready TypeScript Domain Implementation

The following production TypeScript implementation models the autonomous drone survey ingestion, volumetric photogrammetry bathymetry calculation, and municipal emergency dispatch synthesis.

```typescript
/**
 * NagrikSetu — Autonomous Drone Orthomosaic Volumetric Photogrammetry & Flood Inundation Engine
 * Production Domain Interfaces & Deterministic Hydrological Analytical Module
 */

export interface IVector3D {
  x: number;
  y: number;
  z: number; // Elevation in meters AMSL
}

export interface IGeoCoordinate {
  latitude: number;
  longitude: number;
  altitudeMetersAGL: number;
}

export interface IDroneCameraCalibration {
  focalLengthMm: number;
  sensorWidthMm: number;
  sensorHeightMm: number;
  imageWidthPx: number;
  imageHeightPx: number;
  lensDistortionCoefficients: [number, number, number]; // k1, k2, p1
}

export interface IDroneSurveyMission {
  missionId: string;
  wardId: string;
  droneRegistrationNumber: string; // DGCA UIN (Unique Identification Number)
  digitalSkyPermitToken: string;
  flightAltitudeAGL: number;
  targetGsdCm: number;
  timestamp: string;
  camera: IDroneCameraCalibration;
}

export interface IOrthomosaicGridCell {
  gridId: string;
  centerCoordinate: IGeoCoordinate;
  dsmElevationMeters: number; // Active monsoon surface elevation
  dtmElevationMeters: number; // Pre-flood dry baseline ground elevation
  mNdwiIndex: number;         // Modified Normalized Difference Water Index [-1.0, 1.0]
  areaSqMeters: number;
}

export interface IVolumetricWaterBody {
  waterBodyId: string;
  wardId: string;
  centroid: IGeoCoordinate;
  surfaceAreaSqMeters: number;
  averageDepthMeters: number;
  peakDepthMeters: number;
  totalVolumeCubicMeters: number;
  estimatedDrainageDurationHours: number;
  isArterialRoadBlocked: boolean;
  containsElectricalSubstationHazard: boolean;
}

export interface IHydrologicalInundationAssessment {
  missionId: string;
  wardId: string;
  evaluatedAt: string;
  totalInundatedAreaSqMeters: number;
  aggregateStandingVolumeCubicMeters: number;
  compositeFloodHazardScore: number; // [0, 100]
  hazardTier: 'NOMINAL' | 'ADVISORY' | 'CRITICAL_INUNDATION' | 'CATASTROPHIC_EMERGENCY';
  identifiedWaterBodies: IVolumetricWaterBody[];
  recommendedDewateringPumpCapacityHP: number;
  evacuationRoutesToClose: string[];
  autoGeneratedEmergencyTickets: {
    department: 'DRAINAGE' | 'DISASTER_MANAGEMENT' | 'TRAFFIC_POLICE' | 'ELECTRICITY';
    priority: 'URGENT' | 'OVERDUE';
    description: string;
    targetLocation: IGeoCoordinate;
  }[];
}

export class DroneFloodPhotogrammetryEngine {
  private static readonly WATER_MNDWI_THRESHOLD = 0.12;
  private static readonly CRITICAL_DEPTH_THRESHOLD_METERS = 0.50; // Vehicle floatation risk
  private static readonly STANDARD_PUMP_DISCHARGE_RATE_M3_HR_PER_HP = 4.2; // 1 HP pump moves ~4.2 m3/hr against 10m head

  /**
   * Calculates the Ground Sampling Distance (GSD) in centimeters per pixel.
   */
  public static calculateGsd(
    altitudeAglMeters: number,
    focalLengthMm: number,
    sensorWidthMm: number,
    imageWidthPx: number
  ): number {
    if (focalLengthMm <= 0 || imageWidthPx <= 0) {
      throw new Error('Focal length and image resolution must be strictly positive.');
    }
    const gsdMeters = (altitudeAglMeters * sensorWidthMm) / (focalLengthMm * imageWidthPx);
    return Number((gsdMeters * 100).toFixed(2));
  }

  /**
   * Computes open-channel overland runoff discharge rate via Manning-Strickler equation.
   * Q = (1/n) * A * R_h^(2/3) * S_0^(1/2)
   */
  public static computeManningDischarge(
    flowAreaSqMeters: number,
    wettedPerimeterMeters: number,
    hydraulicSlope: number,
    roughnessCoefficient = 0.018
  ): { velocityMetersPerSec: number; dischargeCubicMetersPerSec: number } {
    if (wettedPerimeterMeters <= 0 || flowAreaSqMeters <= 0 || hydraulicSlope <= 0) {
      return { velocityMetersPerSec: 0, dischargeCubicMetersPerSec: 0 };
    }
    const hydraulicRadius = flowAreaSqMeters / wettedPerimeterMeters;
    const velocity = (1 / roughnessCoefficient) * Math.pow(hydraulicRadius, 2 / 3) * Math.sqrt(hydraulicSlope);
    const discharge = velocity * flowAreaSqMeters;
    return {
      velocityMetersPerSec: Number(velocity.toFixed(2)),
      dischargeCubicMetersPerSec: Number(discharge.toFixed(2)),
    };
  }

  /**
   * Ingests high-resolution elevation raster cells and computes volumetric inundation metrics.
   */
  public static analyzeInundationGrid(
    mission: IDroneSurveyMission,
    cells: IOrthomosaicGridCell[],
    knownSubstationsNearby: IGeoCoordinate[] = []
  ): IHydrologicalInundationAssessment {
    let totalArea = 0;
    let aggregateVolume = 0;
    let maxDepth = 0;

    const submergedCells: IOrthomosaicGridCell[] = [];

    for (const cell of cells) {
      // Evaluate if cell has standing water
      if (cell.mNdwiIndex >= this.WATER_MNDWI_THRESHOLD) {
        const waterDepth = Math.max(0, cell.dsmElevationMeters - cell.dtmElevationMeters);
        if (waterDepth > 0.03) { // Filter out negligible surface sheen (<3cm)
          submergedCells.push(cell);
          const cellVolume = waterDepth * cell.areaSqMeters;
          totalArea += cell.areaSqMeters;
          aggregateVolume += cellVolume;
          if (waterDepth > maxDepth) {
            maxDepth = waterDepth;
          }
        }
      }
    }

    const avgDepth = totalArea > 0 ? aggregateVolume / totalArea : 0;

    // Check proximity to electrical substations within 50m
    let substationAtRisk = false;
    for (const cell of submergedCells) {
      for (const sub of knownSubstationsNearby) {
        const latDiff = (cell.centerCoordinate.latitude - sub.latitude) * 111320;
        const lonDiff = (cell.centerCoordinate.longitude - sub.longitude) * 111320 * Math.cos(sub.latitude * (Math.PI / 180));
        const distance = Math.hypot(latDiff, lonDiff);
        if (distance <= 50.0) {
          substationAtRisk = true;
          break;
        }
      }
      if (substationAtRisk) break;
    }

    // Synthesize discrete water bodies
    const waterBodies: IVolumetricWaterBody[] = [];
    if (totalArea > 0) {
      const isRoadBlocked = maxDepth >= this.CRITICAL_DEPTH_THRESHOLD_METERS;
      const pumpHpRequired = Math.ceil(aggregateVolume / (this.STANDARD_PUMP_DISCHARGE_RATE_M3_HR_PER_HP * 4)); // 4-hour target drainage
      
      waterBodies.push({
        waterBodyId: `wb-${mission.wardId}-${Date.now().toString(36)}`,
        wardId: mission.wardId,
        centroid: cells[Math.floor(cells.length / 2)]?.centerCoordinate || {
          latitude: 12.9716,
          longitude: 77.5946,
          altitudeMetersAGL: 0,
        },
        surfaceAreaSqMeters: Number(totalArea.toFixed(1)),
        averageDepthMeters: Number(avgDepth.toFixed(2)),
        peakDepthMeters: Number(maxDepth.toFixed(2)),
        totalVolumeCubicMeters: Number(aggregateVolume.toFixed(1)),
        estimatedDrainageDurationHours: Number((aggregateVolume / (Math.max(1, pumpHpRequired) * this.STANDARD_PUMP_DISCHARGE_RATE_M3_HR_PER_HP)).toFixed(1)),
        isArterialRoadBlocked: isRoadBlocked,
        containsElectricalSubstationHazard: substationAtRisk,
      });
    }

    // Calculate Composite Flood Hazard Score [0, 100]
    // R_flood = alpha1 * (h_bar / h_crit) + alpha2 * log10(1 + V) + alpha3 * Infra + alpha4 * Pop
    const depthRatio = Math.min(2.0, avgDepth / this.CRITICAL_DEPTH_THRESHOLD_METERS);
    const volumeFactor = Math.min(2.0, Math.log10(1 + aggregateVolume) / 3.0);
    const infraFactor = substationAtRisk ? 1.0 : (maxDepth >= this.CRITICAL_DEPTH_THRESHOLD_METERS ? 0.6 : 0.2);

    const rawScore = 35 * depthRatio + 30 * volumeFactor + 25 * infraFactor + 10;
    const compositeScore = Math.min(100, Math.round(rawScore));

    let hazardTier: IHydrologicalInundationAssessment['hazardTier'] = 'NOMINAL';
    if (compositeScore >= 80) {
      hazardTier = 'CATASTROPHIC_EMERGENCY';
    } else if (compositeScore >= 55) {
      hazardTier = 'CRITICAL_INUNDATION';
    } else if (compositeScore >= 25) {
      hazardTier = 'ADVISORY';
    }

    // Synthesize automated emergency work orders
    const tickets: IHydrologicalInundationAssessment['autoGeneratedEmergencyTickets'] = [];
    const evacuationRoutes: string[] = [];

    if (hazardTier === 'CATASTROPHIC_EMERGENCY' || hazardTier === 'CRITICAL_INUNDATION') {
      const centerCoord = waterBodies[0]?.centroid || { latitude: 12.9716, longitude: 77.5946, altitudeMetersAGL: 0 };
      
      tickets.push({
        department: 'DRAINAGE',
        priority: 'URGENT',
        description: `Autonomous Drone Alert: ${aggregateVolume.toFixed(0)}m³ flash inundation at Ward ${mission.wardId}. Deploy ${Math.ceil(aggregateVolume / 200)}x 50HP dewatering pumps immediately. Peak depth: ${maxDepth.toFixed(2)}m.`,
        targetLocation: centerCoord,
      });

      if (maxDepth >= this.CRITICAL_DEPTH_THRESHOLD_METERS) {
        evacuationRoutes.push(`Arterial Underpass Link - Ward ${mission.wardId}`);
        tickets.push({
          department: 'TRAFFIC_POLICE',
          priority: 'URGENT',
          description: `Traffic Divergence Mandate: Water depth ${maxDepth.toFixed(2)}m exceeds vehicular safety limits. Close underpass approaches and broadcast alternate route via NagrikSetu Citizen Portal.`,
          targetLocation: centerCoord,
        });
      }

      if (substationAtRisk) {
        tickets.push({
          department: 'ELECTRICITY',
          priority: 'URGENT',
          description: `LIFE SAFETY ALERT: Compact distribution substation within 50m of rising water table. Execute immediate remote circuit isolator trip to prevent live ground fault electrocution.`,
          targetLocation: centerCoord,
        });
      }
    }

    const recommendedPumpHp = Math.ceil(aggregateVolume / (this.STANDARD_PUMP_DISCHARGE_RATE_M3_HR_PER_HP * 3));

    return {
      missionId: mission.missionId,
      wardId: mission.wardId,
      evaluatedAt: new Date().toISOString(),
      totalInundatedAreaSqMeters: Number(totalArea.toFixed(1)),
      aggregateStandingVolumeCubicMeters: Number(aggregateVolume.toFixed(1)),
      compositeFloodHazardScore: compositeScore,
      hazardTier,
      identifiedWaterBodies: waterBodies,
      recommendedDewateringPumpCapacityHP: recommendedPumpHp,
      evacuationRoutesToClose: evacuationRoutes,
      autoGeneratedEmergencyTickets: tickets,
    };
  }
}
```

---

## 5. Municipal Command Center & Citizen Integration

The outputs of the ADOP-FDA engine seamlessly synchronize across the NagrikSetu tri-portal ecosystem:

### 5.1 Integrated Command & Control Center (ICCC) God-View
- **Volumetric Flood Heatmap Layer**: Municipal disaster commissioners view active 3D elevation contours colored from green ($<10\text{cm}$) to amber ($10\text{cm}-50\text{cm}$) and flashing crimson ($>50\text{cm}$).
- **Automated Pump Dispatching**: Correlates the standing cubic meters of water ($\mathcal{V}_{\text{flood}}$) with municipal dewatering inventories, calculating optimal deployment locations and estimated hours to dry pavement.
- **Substation Trip Interlocks**: Direct integration with SCADA switches sends electrical isolation trip commands when floodwaters breach transformer plinth levels.

### 5.2 Citizen Portal Real-Time Route Diversion
- **Dynamic Roadway Redirection**: When a underpass or low-lying road polygon is flagged with $\text{peakDepth} \ge 0.50\text{m}$, the Citizen Portal (`/citizen`) marks the route as impassable, preventing citizens from driving into drowned underpasses.
- **Ward Crowd Alert Geofencing**: Registered citizens within a $200\text{m}$ radius receive high-priority push notifications and interactive SMS guidance outlining verified elevated relief shelters.

---

## 6. DGCA Drone Rules 2021 & Data Protection Compliance

Autonomous urban UAV operations in India operate under strict regulatory and privacy boundaries:

1. **DigitalSky Airspace Integration (Green Zone Pre-Clearance)**:
   - Flight controllers check DigitalSky airspace vector boundaries. In Green Zones (below $120\text{m}$ AGL), missions proceed automatically under disaster emergency provisions.
   - For Yellow Zones (controlled airspace near defense airfields), the platform negotiates dynamic NPNT (No Permission, No Takeoff) cryptographic handshakes with the Air Traffic Control (ATC) gateway.
2. **Privacy Masking & DPDP Act 2023 Adherence**:
   - Automated computer vision edge models run prior to cloud raster ingestion to detect and apply a 20-pixel Gaussian blur across private residential windows, courtyards, and vehicle registration plates, preserving citizen privacy under Section 8 of India’s Digital Personal Data Protection Act.
3. **Fail-Safe Emergency Protocols**:
   - UAVs implement Triple-Redundant Return-to-Launch (RTL) triggers on low battery ($\le 25\%$), high monsoon wind gusts ($\ge 12.5\text{ m/s}$), or telemetry link loss ($>3\text{ seconds}$).
