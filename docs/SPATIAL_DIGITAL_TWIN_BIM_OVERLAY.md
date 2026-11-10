# NagrikSetu — Municipal Spatial Digital Twin & 3D Building Information Modeling (BIM) Asset Overlay Engine (MSDT-BIM)

> **Subsurface Infrastructure Defect Mapping, OGC 3D Tiles & IFC 4.3 Asset Visualization, ASCE 38-02 Excavation Clearance Geofencing, and PM Gati Shakti National Master Plan GIS Alignment.**

---

## 1. Executive Summary & Problem Context

Urban civic maintenance in Indian metropolitan and tier-1/tier-2 municipal corporations (e.g., BBMP Bengaluru, MCGM Mumbai, MCD Delhi, GHMC Hyderabad) operates in high-density subsurface corridors. Beneath standard municipal road networks lies a labyrinth of interdependent utility networks:
1. **Potable Water Mains & High-Pressure Sewage Culverts**: Managed by municipal water and sewerage boards (BWSSB, DJB).
2. **High-Voltage Power Distribution & Underground Cabling**: 11kV/33kV feeder lines managed by state electricity distribution companies (BESCOM, MSEDCL).
3. **Piped Natural Gas (PNG) Utility Conduits**: High-pressure gas distribution networks managed by city gas distribution entities.
4. **Optical Fiber Cable (OFC) Duct Banks & Telecommunication Conduits**: High-count multi-tenant telecom pathways critical to municipal surveillance and emergency dispatch.

### The Subterranean Excavation Blind Spot

When municipal field workers, contracted road gangs, or public works agencies arrive at a civic incident (such as a severe pothole crater, sinkhole, or localized water pipe burst reported via NagrikSetu), they traditionally lack **subsurface situational awareness**. Excavation teams rely on fragmented 2D CAD drawings or oral estimates, leading to catastrophic utility strikes:
- **Accidental OFC Conduit Shearing**: Disconnecting ward command centers and emergency hospital data lines.
- **Gas Pipeline Ruptures and High-Voltage Arc Flashes**: Presenting lethal explosion hazards to on-site field laborers and surrounding urban populations.
- **Repeat Road Cuts & Pavement Destruction**: One utility repairs a leak only for another utility to excavate the identical asphalt stretch 72 hours later.

To eliminate this vulnerability, NagrikSetu introduces the **Municipal Spatial Digital Twin & 3D BIM Asset Overlay Engine (MSDT-BIM)**. MSDT-BIM extends the tri-portal civic reporting topology by projecting an interactive 3D subterranean digital twin directly within the **Department Portal** and **Municipal Command Center**, rendering buried conduits, soil stratigraphy, and utility clearance buffers with millimeter-scale spatial precision.

```
+----------------------------------------------------------------------------------------------------+
|                                    MSDT-BIM Architectural Topology                                 |
|                                                                                                    |
|  +-------------------------+     +--------------------------+     +------------------------------+ |
|  | PM Gati Shakti GIS      |     | Municipal BIM / IFC 4.3  |     | Ground Penetrating Radar     | |
|  | National Master Plan API|     | Engineering Repositories |     | (GPR) Survey & As-Built Point| |
|  +------------+------------+     +------------+-------------+     +--------------+---------------+ |
|               |                               |                                  |                 |
|               | GeoJSON / LandBase            | Industry Foundation Classes      | LAS / LAZ Point |
|               v                               v                                  v Clouds          |
|  +-----------------------------------------------------------------------------------------------+ |
|  |                      NagrikSetu Spatial Ingestion & 3D Tiling Pipeline                        | |
|  |  - Coordinate Transformation: WGS84 (EPSG:4326) <-> Indian Grid (EPSG:24378 / UTM Zone 43N)    | |
|  |  - Geometry Simplification & Level of Detail (LoD 1 to LoD 4) Generation                      | |
|  |  - OGC 3D Tiles 1.1 Specification Compliant Hierarchical Bounding Volume Tree (BVH)           | |
|  +-----------------------------------------------+-----------------------------------------------+ |
|                                                  |                                                 |
|                                                  v Streamed 3D Tile Bins (.b3dm / .pnts)           |
|  +-----------------------------------------------------------------------------------------------+ |
|  |                   Municipal Digital Twin Spatial Engine (PostGIS 3D + Redis)                  | |
|  |  - 3D Volumetric Buffer Evaluation: ST_3DDWithin(defect_geom, utility_conduit, clearance_r)    | |
|  |  - Subsurface Utility Engineering (SUE) ASCE 38-02 Quality Classification (Level A, B, C, D)   | |
|  |  - Automated Dig-Permit & "Call Before You Dig" (CBYD) Utility Conflict Detection            | |
|  +-----------------------+-----------------------------------------------+-----------------------+ |
|                          |                                               |                         |
|   Sub-50ms Viewport Sync | WebSockets                                    | WebGPU / WebGL Shader   |
|                          v                                               v Streams                 |
|  +-----------------------------------------------+   +-------------------------------------------+ |
|  | Department Field Portal (Tablet / Mobile Web) |   | Integrated Municipal Command Center (ICCC)| |
|  | - Augmented Reality (AR) Ground X-Ray View    |   | - 3D God-View Volumetric Digital Twin     | |
|  | - Trenchless Excavation Safety Clearance Cone |   | - Multi-Utility Outage Simulation Sandbox | |
|  | - Automated ASCE 38-02 Conflict Warnings      |   | - Ward Capital Expenditure Coordination   | |
|  +-----------------------------------------------+   +-------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Technical Specifications & Performance Benchmarks

| Metric Vector | Target Performance | Real-World Operational Standard |
|---|---|---|
| **Subsurface Query Latency** | $\le 45\text{ ms}$ for 25m radial cylinder | Real-time field clearance display prior to excavation |
| **3D Tile Streaming Bandwidth** | $\le 1.8\text{ MB}$ initial viewport load | Optimized for field 4G/5G mobile networks in urban canyons |
| **Spatial Coordinate Precision** | $\pm 50\text{ mm}$ for SUE Quality Level A assets | Prevents catastrophic high-voltage utility puncture strikes |
| **LOD (Level of Detail) Dynamic Scaling** | 4-Tier Hierarchical Bounding Volume Hierarchy | LoD 1 (Footprints) $\to$ LoD 4 (Internal conduit lumens) |
| **Supported File Formats** | IFC 4.3 (ISO 16739), CityGML 3.0, OGC 3D Tiles 1.1, LAS/LAZ Point Clouds, LandXML | Universal municipal interoperability without vendor lock-in |
| **Security & Privacy Masking** | Redaction of defense & high-security conduits | Strict compliance with DPDP Act 2023 & NCIIPC guidelines |

---

## 3. Mathematical Formulations & Clearance Geofencing

### 3.1 3D Subsurface Proximity & Clearance Cone Formulation

When a civic defect (such as a pothole requiring cold-mix milling or a broken water pipe requiring mechanical excavation) is registered at coordinates $\mathbf{P}_0 = (x_0, y_0, z_0)$ where $z_0$ represents elevation above mean sea level (AMSL), the system evaluates the distance to all subterranean utility line strings $\mathcal{U}_i(t) = \mathbf{A}_i + t (\mathbf{B}_i - \mathbf{A}_i)$ for $t \in [0, 1]$:

$$D_{3D}(\mathbf{P}_0, \mathcal{U}_i) = \min_{t \in [0, 1]} \left\| \mathbf{P}_0 - \left( \mathbf{A}_i + t(\mathbf{B}_i - \mathbf{A}_i) \right) \right\|_2$$

The safety clearance threshold $R_{\text{safe}}(u_i)$ is dynamically determined by the utility's criticality weight $\omega_{\text{type}}$ and operational pressure/voltage scalar $\mathcal{V}_i$:

$$R_{\text{safe}}(u_i) = R_{\text{base}} \cdot \left( 1 + \kappa_1 \cdot \omega_{\text{type}} + \kappa_2 \cdot \log_{10}(1 + \mathcal{V}_i) \right)$$

Where:
- $R_{\text{base}} = 1.5\text{ meters}$ (standard municipal excavation manual clearance).
- $\omega_{\text{type}} \in \{ \text{PNG Gas}: 2.5, \; \text{11kV Power}: 2.0, \; \text{Water Main}: 1.2, \; \text{OFC Telecom}: 1.0 \}$.
- $\kappa_1 = 0.40, \; \kappa_2 = 0.25$ are empirical risk coefficients.

### 3.2 Subsurface Utility Engineering (SUE) Quality Weighting

In accordance with **ASCE 38-02** (*Standard Guideline for the Collection and Depiction of Existing Subsurface Utility Data*), utility records possess varying confidence levels:
- **Quality Level D (QL-D)**: Existing utility records, oral recollections (Low reliability, positional error $\pm 3.0\text{m}$).
- **Quality Level C (QL-C)**: Surface surveying of visible utility features (manholes, valve boxes) correlated with records (Error $\pm 1.5\text{m}$).
- **Quality Level B (QL-B)**: Two-dimensional surface geophysical prospecting (Ground Penetrating Radar, Electromagnetic Induction) (Error $\pm 0.3\text{m}$).
- **Quality Level A (QL-A)**: Non-destructive vacuum excavation test holes exposing exact 3D coordinates (Error $\le 0.05\text{m}$).

The Volumetric Excavation Risk Score $\mathcal{R}_{\text{excavation}} \in [0, 100]$ is computed as:

$$\mathcal{R}_{\text{excavation}} = \min\left(100, \; \sum_{i=1}^{N} \frac{100 \cdot \omega_{\text{type}, i} \cdot \mathcal{Q}_i}{\max\left(0.5, \; D_{3D}(\mathbf{P}_0, \mathcal{U}_i)\right)^2}\right)$$

Where $\mathcal{Q}_i \in \{ \text{QL-A}: 0.25, \; \text{QL-B}: 0.50, \; \text{QL-C}: 0.85, \; \text{QL-D}: 1.00 \}$ penalizes unverified subsurface documentation, mandating pre-excavation exploratory hand-digging when $\mathcal{R}_{\text{excavation}} \ge 45.0$.

---

## 4. Production TypeScript Contracts & Engine Implementation

The following domain contracts and reference calculation engine power the MSDT-BIM spatial inspection subsystem:

```typescript
/**
 * NagrikSetu Municipal Spatial Digital Twin & 3D BIM Overlay (MSDT-BIM)
 * Subsurface Infrastructure Mapping, ASCE 38-02 Risk Calculation, and 3D Tiles Domain Engine.
 */

export type SubsurfaceUtilityType =
  | 'GAS_HIGH_PRESSURE'
  | 'POWER_HIGH_VOLTAGE_11KV'
  | 'POWER_LOW_VOLTAGE_415V'
  | 'WATER_POTABLE_MAIN'
  | 'SEWAGE_TRUNK_CULVERT'
  | 'TELECOM_OPTICAL_FIBER'
  | 'STORM_WATER_DRAIN'
  | 'MUNICIPAL_SURVEILLANCE_CONDUIT';

export type SUEQualityLevel = 'QL_A' | 'QL_B' | 'QL_C' | 'QL_D';

export interface IVector3D {
  x: number; // Easting / Longitude offset (meters)
  y: number; // Northing / Latitude offset (meters)
  z: number; // Elevation AMSL or depth below surface (meters)
}

export interface ISubsurfaceConduit {
  id: string;
  utilityType: SubsurfaceUtilityType;
  ownerAgency: string; // e.g., 'BESCOM', 'BWSSB', 'GAIL', 'Airtel'
  qualityLevel: SUEQualityLevel;
  nominalDiameterMm: number;
  operatingVoltageOrPressure: number; // Volts or bar
  startPoint: IVector3D;
  endPoint: IVector3D;
  lastInspectionDate: string;
  isCriticalNationalInfrastructure: boolean;
}

export interface IExcavationHazardAssessment {
  incidentId: string;
  defectLocation: IVector3D;
  volumetricRiskScore: number; // 0 to 100
  hazardTier: 'SAFE' | 'ADVISORY' | 'CRITICAL_RISK' | 'EXCAVATION_PROHIBITED';
  conflictingConduits: Array<{
    conduitId: string;
    utilityType: SubsurfaceUtilityType;
    distanceMeters: number;
    requiredClearanceMeters: number;
    sueQualityLevel: SUEQualityLevel;
  }>;
  recommendedAction: string;
}

export interface I3DTileBoundingVolume {
  box: [number, number, number, number, number, number, number, number, number, number, number, number];
  geometricError: number;
  uri: string;
}

export class SpatialDigitalTwinEngine {
  private static readonly UTILITY_WEIGHTS: Record<SubsurfaceUtilityType, number> = {
    GAS_HIGH_PRESSURE: 2.5,
    POWER_HIGH_VOLTAGE_11KV: 2.0,
    POWER_LOW_VOLTAGE_415V: 1.5,
    WATER_POTABLE_MAIN: 1.2,
    SEWAGE_TRUNK_CULVERT: 1.1,
    TELECOM_OPTICAL_FIBER: 1.0,
    STORM_WATER_DRAIN: 0.8,
    MUNICIPAL_SURVEILLANCE_CONDUIT: 0.9,
  };

  private static readonly SUE_PENALTY_MULTIPLIER: Record<SUEQualityLevel, number> = {
    QL_A: 0.25,
    QL_B: 0.50,
    QL_C: 0.85,
    QL_D: 1.00,
  };

  /**
   * Computes the Euclidean 3D perpendicular distance from a point to a 3D line segment.
   */
  public static calculatePointToSegmentDistance(
    point: IVector3D,
    segStart: IVector3D,
    segEnd: IVector3D
  ): number {
    const dx = segEnd.x - segStart.x;
    const dy = segEnd.y - segStart.y;
    const dz = segEnd.z - segStart.z;
    const segmentLengthSquared = dx * dx + dy * dy + dz * dz;

    if (segmentLengthSquared === 0) {
      return Math.hypot(point.x - segStart.x, point.y - segStart.y, point.z - segStart.z);
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - segStart.x) * dx +
          (point.y - segStart.y) * dy +
          (point.z - segStart.z) * dz) /
          segmentLengthSquared
      )
    );

    const projX = segStart.x + t * dx;
    const projY = segStart.y + t * dy;
    const projZ = segStart.z + t * dz;

    return Math.hypot(point.x - projX, point.y - projY, point.z - projZ);
  }

  /**
   * Evaluates excavation clearance zones and computes the composite volumetric risk score.
   */
  public static evaluateExcavationSafety(
    incidentId: string,
    defectLocation: IVector3D,
    conduits: ISubsurfaceConduit[]
  ): IExcavationHazardAssessment {
    let accumulatedRisk = 0;
    const conflicts: IExcavationHazardAssessment['conflictingConduits'] = [];

    for (const conduit of conduits) {
      const distance = this.calculatePointToSegmentDistance(
        defectLocation,
        conduit.startPoint,
        conduit.endPoint
      );

      const typeWeight = this.UTILITY_WEIGHTS[conduit.utilityType] || 1.0;
      const sueMultiplier = this.SUE_PENALTY_MULTIPLIER[conduit.qualityLevel];

      // Dynamic clearance radius: R_base * (1 + 0.40 * weight + 0.25 * log10(1 + voltage/pressure))
      const logScale = Math.log10(1 + conduit.operatingVoltageOrPressure);
      const requiredClearance = 1.5 * (1 + 0.4 * typeWeight + 0.25 * logScale);

      // Compute volumetric risk component
      const effectiveDistance = Math.max(0.5, distance);
      const riskComponent = (100 * typeWeight * sueMultiplier) / (effectiveDistance * effectiveDistance);
      accumulatedRisk += riskComponent;

      if (distance <= requiredClearance * 1.5) {
        conflicts.push({
          conduitId: conduit.id,
          utilityType: conduit.utilityType,
          distanceMeters: Number(distance.toFixed(2)),
          requiredClearanceMeters: Number(requiredClearance.toFixed(2)),
          sueQualityLevel: conduit.qualityLevel,
        });
      }
    }

    const normalizedRiskScore = Math.min(100, Math.round(accumulatedRisk));

    let hazardTier: IExcavationHazardAssessment['hazardTier'] = 'SAFE';
    let recommendedAction = 'Standard mechanized backhoe excavation permitted.';

    if (normalizedRiskScore >= 75) {
      hazardTier = 'EXCAVATION_PROHIBITED';
      recommendedAction =
        'CRITICAL ALERT: High-risk subsurface gas/power corridors detected. Mechanical excavation strictly banned. Mandatory manual air-vacuum exploration.';
    } else if (normalizedRiskScore >= 45) {
      hazardTier = 'CRITICAL_RISK';
      recommendedAction =
        'High proximity to utility mains. ASCE 38-02 test-pit verification required before mechanical deployment.';
    } else if (normalizedRiskScore >= 20) {
      hazardTier = 'ADVISORY';
      recommendedAction =
        'Low-to-moderate utility density. Proceed with spotter observation and manual hand shovel exploration within 2 meters.';
    }

    return {
      incidentId,
      defectLocation,
      volumetricRiskScore: normalizedRiskScore,
      hazardTier,
      conflictingConduits: conflicts,
      recommendedAction,
    };
  }
}
```

---

## 5. PM Gati Shakti & National Master Plan Integration

Under the **PM Gati Shakti National Master Plan (NMP)** for multi-modal infrastructure connectivity, Indian municipal authorities are mandated to integrate spatial asset records into unified geographic information platforms. MSDT-BIM aligns with this national directive:

1. **Spatial Asset Harmonization**: Transforms legacy municipal local coordinates (e.g., Delhi Transverse Mercator, Mumbai Municipal Grid) into **EPSG:4326 (WGS84)** and **EPSG:7755 (Indian Geodetic Datum)**.
2. **Unified RoW (Right-of-Way) Dig-Permit Coordination**: When a NagrikSetu road defect ticket triggers a civil work order, the system automatically checks the PM Gati Shakti shared corridor calendar. If another utility (e.g., GAIL Gas or Jio Fiber) is scheduled to excavate the identical road segment within 45 days, the work orders are co-scheduled to prevent recurring road cuts.
3. **Emergency Disruption Broadcast**: If an excavation involuntarily compromises a municipal conduit, real-time spatial events broadcast through the NagrikSetu WebSockets dispatch pipeline to notify downstream hospitals, fire stations, and civic wards.

---

## 6. Critical Infrastructure Protection & DPDP Act Compliance

Subsurface municipal infrastructure maps contain classified information regarding national security installations, data transmission corridors, and municipal drinking water supply reservoirs. MSDT-BIM enforces zero-trust data protection:

- **Role-Based Spatial Redaction**: Public citizens accessing the public dashboard receive abstracted surface-only 2D heatmaps. Subterranean 3D conduit layers are strictly restricted to authenticated municipal engineers holding Level-3 Field Operator clearance.
- **National Critical Information Infrastructure (NCIIPC) Filtering**: Geometries classified as `isCriticalNationalInfrastructure = true` (e.g., dedicated defense fiber pathways or atomic power transmission lines) are dynamically obscured or scrubbed from client-side WebGPU tile buffers.
- **Audit Logging**: Every 3D viewport pan, zoom, and spatial slice query is immutably logged with the operator's government employee ID and timestamp in compliance with Section 8 of India's **Digital Personal Data Protection (DPDP) Act 2023**.
