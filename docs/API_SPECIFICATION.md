# NagrikSetu — API & Integration Specification

> **Technical Interface Contracts, AI Inference Schemas, Spatial Verification, and Government Interoperability Protocols for NagrikSetu.**

---

## 1. System Overview

NagrikSetu operates a distributed civic reporting and verification pipeline. Client applications interface with local reactive stores, serverless AI classification endpoints, cloud-native spatial databases (Supabase PostGIS), and upstream national grievance clearinghouses (CPGRAMS).

```
   +-------------------------------------------------------------------------+
   |                            Client Tier                                  |
   |   - Citizen WebRTC Video Frame Capture                                 |
   |   - Operator Geofenced Proof-of-Work Capture                            |
   |   - Reactive Local State (localStorage Fallback Cache)                 |
   +------------------------------------+------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
+----------------------------------+       +-----------------------------------+
|     Next.js API Gateway          |       |      Supabase Cloud PostGIS       |
|  - POST /api/classify            |       |  - Spatial Range Deduplication    |
|  - Google Gemini 1.5/3.6 Flash   |       |  - Live Incident Registry         |
|  - Structured Vision Triage      |       |  - Real-time Subscriptions        |
+----------------------------------+       +-----------------------------------+
                 |                                             |
                 +----------------------+----------------------+
                                        |
                                        v
                       +----------------------------------+
                       |    CPGRAMS Federation Bridge     |
                       |  - Outbound Ministry Dispatch    |
                       |  - National Grievance Audit      |
                       +----------------------------------+
```

---

## 2. Multi-Modal Vision Classification API

### Endpoint: `POST /api/classify`
Classifies raw photographic civic evidence, scores damage severity, and auto-assigns municipal departments with guaranteed SLA turnaround deadlines.

#### Request Headers
| Header | Value | Description |
|---|---|---|
| `Content-Type` | `multipart/form-data` | Form payload containing binary image stream |
| `Accept` | `application/json` | Client expects JSON response |

#### Request Body
| Parameter | Type | Required | Description |
|---|---|---|---|
| `image` | `File` (Binary) | Yes | Captured WebRTC image frame (`image/jpeg` or `image/png`). Must not exceed 10 MB. |

#### Server-Side Execution Flow
1. **Stream Buffering:** The binary image buffer is converted to a base64 inline string.
2. **Model Invocation:** Handled by Google Generative AI (`gemini-3.6-flash` / `gemini-1.5-flash`).
3. **Structured Prompt:**
   ```text
   You are an AI assistant for a civic issue reporting system in India.
   Look at this image and classify the civic issue into EXACTLY ONE of these three categories:
   - "Sanitation (Garbage)"
   - "Electrical (Streetlights)"
   - "PWD (Potholes/Roads)"

   Also, determine a severity score from 1 to 100 based on the visual damage or hazard level.

   Respond ONLY with a valid JSON object in this exact format:
   {
     "category": "category name here",
     "severity": 85
   }
   ```
4. **Resilience & Sanitization:** Markdown fences (` ```json `) are stripped. If JSON parsing fails, fallback severity ($50$) is applied.
5. **Department Taxonomy Matching:** The recognized category string is matched against active municipal departments.

#### Response Schemas

##### Success (200 OK)
```json
{
  "department": {
    "id": "bd527a62-e673-452d-b0db-f3160190727b",
    "name": "PWD (Potholes/Roads)",
    "sla_hours": 168,
    "color": "#3b82f6"
  },
  "severity": 88,
  "confidence": "high"
}
```

##### Fallback / Low-Confidence Triage (200 OK)
Returned when image clarity is degraded or issue falls across multi-department boundaries.
```json
{
  "department": {
    "id": "bd527a62-e673-452d-b0db-f3160190727b",
    "name": "PWD (Potholes/Roads)",
    "sla_hours": 168,
    "color": "#3b82f6"
  },
  "severity": 50,
  "confidence": "low"
}
```

##### Error Responses
- **400 Bad Request:** Missing image in multipart payload.
  ```json
  { "error": "No image provided" }
  ```
- **500 Internal Server Error:** Upstream inference failure or network timeout.
  ```json
  { "error": "Gemini API key invalid or rate limit exceeded" }
  ```

---

## 3. Spatial Telemetry & Geofencing Protocol

All geographical coordinates strictly conform to the **WGS 84 (EPSG:4326)** coordinate reference system.

### Coordinate Standards
- **Latitude ($\phi$):** Range $[-90.000000, 90.000000]$, 6 decimal digits of precision ($\approx 0.11\text{ m}$ ground resolution).
- **Longitude ($\lambda$):** Range $[-180.000000, 180.000000]$, 6 decimal digits of precision.

### Geofence Enforcement Matrix

| Gatekeeper Event | Distance Threshold ($d$) | Action Triggered | Failure State |
|---|---|---|---|
| **Citizen Duplicate Detection** | $d \le 50\text{ meters}$ | Convert submission to `upvote` on existing parent issue. Increment priority weight. | Issue created as new standalone ticket if $d > 50\text{ m}$. |
| **Field Operator Proof-of-Work** | $d \le 100\text{ meters}$ | Unlock WebRTC "After" camera capture and enable `Confirm & Close` button. | Action locked; display warning banner: *"Operator outside 100m proximity perimeter."* |

### Mathematical Formula
Haversine distance calculation executed on both client (`src/lib/haversine.ts`) and database tiers:
$$\Delta\phi = \frac{(\phi_2 - \phi_1)\pi}{180}, \quad \Delta\lambda = \frac{(\lambda_2 - \lambda_1)\pi}{180}$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\left(\frac{\phi_1\pi}{180}\right)\cos\left(\frac{\phi_2\pi}{180}\right)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \cdot c \quad (R = 6,371,000\text{ m})$$

---

## 4. Cloud Data Synchronization Bridge

NagrikSetu integrates a hybrid synchronization architecture ensuring high resilience:

```
+---------------------------------------+
|  Client localStorage (localDB.ts)     |
|  - Fast offline access                |
|  - Seed incident fallback             |
+-------------------+-------------------+
                    |
                    | (Bi-directional Sync)
                    v
+---------------------------------------+
|  Supabase PostGIS Spatial Database    |
|  - ST_DWithin sub-millisecond queries |
|  - Centralized real-time broadcasts   |
+---------------------------------------+
```

### PostgreSQL / PostGIS Cloud Schema

```sql
-- Enable PostGIS extension for spatial indexation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Municipal Departments Reference Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    sla_hours INTEGER NOT NULL CHECK (sla_hours > 0),
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Civic Incident Records
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    image_url TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) STORED,
    status TEXT NOT NULL CHECK (status IN ('Open', 'Resolved', 'Unassigned')),
    ai_confidence DOUBLE PRECISION NOT NULL CHECK (ai_confidence BETWEEN 0 AND 100),
    ai_severity_score DOUBLE PRECISION NOT NULL CHECK (ai_severity_score BETWEEN 0 AND 100),
    description TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    after_image_url TEXT
);

-- Spatial GIST Index for Sub-Millisecond Radius Searching
CREATE INDEX idx_issues_spatial ON issues USING GIST (location);
CREATE INDEX idx_issues_status ON issues (status);
CREATE INDEX idx_issues_department ON issues (department_id);
```

### High-Performance Spatial Query Contract
Query executed to identify existing duplicates within the 50m radius threshold:

```sql
SELECT 
    id, 
    description, 
    upvotes, 
    ST_Distance(location, ST_SetSRID(ST_MakePoint(:target_lng, :target_lat), 4326)::geography) AS distance_meters
FROM issues
WHERE 
    department_id = :target_dept_id
    AND status = 'Open'
    AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(:target_lng, :target_lat), 4326)::geography,
        50.0
    )
ORDER BY distance_meters ASC
LIMIT 1;
```

---

## 5. CPGRAMS Government Interoperability Protocol

For municipal authorities federating tickets to the national grievance clearinghouse, NagrikSetu implements the **CPGRAMS (Centralised Public Grievance Redress and Monitoring System)** REST payload specification.

### Outbound Webhook Dispatch Schema
```json
{
  "system": "NagrikSetu",
  "version": "1.4.0",
  "timestamp": "2026-11-02T08:30:00.000Z",
  "auth_token": "Bearer <CPGRAMS_DISPATCH_TOKEN>",
  "grievance": {
    "reference_id": "NS-DEL-2026-00491",
    "ministry_code": "MOHUA",
    "department_name": "Sanitation (Garbage)",
    "category": "MUNICIPAL_SOLID_WASTE",
    "telemetry": {
      "coordinates": {
        "latitude": 28.6328,
        "longitude": 77.2195
      },
      "geofence_status": "VERIFIED_ON_SITE",
      "address_estimate": "KG Marg, Connaught Place, New Delhi"
    },
    "ai_assessment": {
      "model": "gemini-3.6-flash",
      "severity_index": 88,
      "confidence_score": 96.0,
      "sla_deadline": "2026-11-03T08:30:00.000Z"
    },
    "evidence": {
      "citizen_image_sha256": "4b68e7b99c0ec9823f044d0ec8b63e12be88ff1e389b271d479133405781a562",
      "source_stream": "WEBRTC_LIVE_CAMERA"
    }
  }
}
```

### Ministry Routing Taxonomy

| NagrikSetu Department | Ministry Code | Central Jurisdiction |
|---|---|---|
| **PWD (Potholes/Roads)** | `MORTH` | Ministry of Road Transport and Highways / State PWD |
| **Sanitation (Garbage)** | `MOHUA` | Ministry of Housing and Urban Affairs / Swachh Bharat Urban |
| **Electrical (Streetlights)** | `MOP` | Ministry of Power / Discom Municipal Oversight |

---

## 6. Proof-of-Work Verification Specification (SSIM)

When an operator registers resolution, an automated Structural Similarity Index Measure (SSIM) comparison verifies before-and-after photo integrity.

### Verification Criteria
1. **Camera Angle Consistency:** Perspective warp transform evaluation.
2. **Structural Delta:** An SSIM delta $\ge 90\%$ indicates significant repair intervention (e.g., filled pothole, cleared dump, repaired luminaire).
3. **GPS Proximity:** Distance between resolution capture GPS and incident creation GPS must remain $\le 100\text{ m}$.
4. **Audit Trail:** Paired images and cryptographic hash signatures permanently committed for public view on `/public`.
