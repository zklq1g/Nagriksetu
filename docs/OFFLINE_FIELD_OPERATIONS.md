# NagrikSetu — Offline-First Field Operations & Background Sync Specification

> **Field Operator Resilience, Offline Geofencing, IndexedDB Queue Architecture, and Cryptographic Proof Synchronization for Low-Bandwidth Municipal Environments.**

---

## 1. Operational Overview & Field Context

Municipal field workers resolving critical urban infrastructure tickets (potholes, water main ruptures, storm drainage blockages, downed streetlights) frequently operate in network-degraded conditions. Urban micro-canyons, underground utility tunnels, peripheral municipal wards, and adverse monsoon weather regularly degrade or eliminate 4G/5G cellular connectivity.

NagrikSetu implements an **Offline-First Resilience Architecture** ensuring that field operations, SLA progression, and cryptographic proof-of-work capture never fail due to intermittent or absent internet connectivity.

```
+---------------------------------------------------------------------------------------+
|                               Field Operator Client Device                            |
|                                                                                       |
|  +----------------------------+        +-------------------------------------------+  |
|  |   Department UI Viewport   |        |           Dedicated Web Worker            |  |
|  | - Pre-cached Ticket Queue  | <----> | - Deterministic Haversine Geofencing      |  |
|  | - WebRTC Camera Feed       |        | - SHA-256 Proof Hashing (Web Crypto)     |  |
|  +--------------+-------------+        +---------------------+---------------------+  |
|                 |                                            |                        |
|                 v                                            v                        |
|  +---------------------------------------------------------------------------------+  |
|  |                   IndexedDB Local Cache ("NagrikSetuFieldCache_v1")             |  |
|  |  - ObjectStore: cached_assignments (Active SLA tickets)                        |  |
|  |  - ObjectStore: offline_proofs (Captured imagery + GPS tokens + hash)          |  |
|  |  - ObjectStore: sync_queue (Prioritized upload queue with backoff state)        |  |
|  +------------------------------------+--------------------------------------------+  |
+---------------------------------------|-----------------------------------------------+
                                        |
                 Network Reconnection Trigger / ServiceWorker
                                        |
                                        v
                 +---------------------------------------------+
                 |       Background Sync Manager API           |
                 | - Validates network round-trip latency      |
                 | - Multipart chunked stream transmission     |
                 | - Exponential backoff with full jitter      |
                 +----------------------+----------------------+
                                        |
                                        v
                 +---------------------------------------------+
                 |          NagrikSetu Central Gateway         |
                 | - Supabase PostGIS Spatial Verification     |
                 | - CPGRAMS Federation Bridge Dispatch        |
                 +---------------------------------------------+
```

---

## 2. IndexedDB Local Storage Schema (`NagrikSetuFieldCache_v1`)

The client persists all operational data in an IndexedDB database named `NagrikSetuFieldCache_v1`. Schema versioning and migration are handled deterministically through standard `IDBOpenDBRequest` upgrades.

### 2.1 Object Stores & Index Topology

```typescript
export interface IFieldDatabaseSchema {
  cached_assignments: {
    key: string; // Ticket UUID
    value: ICachedAssignment;
    indexes: {
      by_department: string;
      by_urgency: 'ON_TRACK' | 'URGENT' | 'OVERDUE';
      by_status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED_OFFLINE';
    };
  };
  offline_proofs: {
    key: string; // Proof UUID
    value: IOfflineProofRecord;
    indexes: {
      by_ticket_id: string;
      by_sync_status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
    };
  };
  sync_queue: {
    key: string; // Sync Task ID
    value: ISyncQueueItem;
    indexes: {
      by_priority: number;
      by_retry_count: number;
    };
  };
}
```

### 2.2 Record Data Contracts

#### Cached Assignment Record (`ICachedAssignment`)
```typescript
export interface ICachedAssignment {
  id: string;
  departmentId: string;
  category: 'pothole' | 'garbage' | 'streetlight' | 'water_drainage';
  severityScore: number; // Scale: 1 - 5
  description: string;
  location: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    addressDescription: string;
  };
  sla: {
    targetResolutionTimestamp: string; // ISO 8601
    allottedHours: number;
  };
  beforeImageUrl: string; // Data URL or cached Object URL
  cachedAtTimestamp: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED_OFFLINE';
}
```

#### Offline Proof Record (`IOfflineProofRecord`)
```typescript
export interface IOfflineProofRecord {
  proofId: string;
  ticketId: string;
  operatorId: string;
  capturedAt: string; // ISO 8601
  capturedGps: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    altitudeMeters: number | null;
  };
  geofenceVerification: {
    calculatedDistanceMeters: number;
    isWithinBoundary: boolean; // Must be <= 100.00 meters
    geofenceThresholdMeters: 100.0;
  };
  imageBlob: Blob; // Compressed WebP binary stream
  imageSha256Hash: string; // Cryptographic integrity checksum
  syncStatus: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  lastSyncAttempt: string | null;
  errorMessage: string | null;
}
```

---

## 3. Offline Geofencing & Proximity Verification Protocol

To prevent fraudulent ticket closure while disconnected from network infrastructure, geofence verification is executed **locally on the client device** inside a dedicated Web Worker.

### 3.1 Mathematical Formulation: Haversine Great-Circle Distance

$$\Delta\phi = \phi_2 - \phi_1 = (\text{lat}_2 - \text{lat}_1) \cdot \frac{\pi}{180}$$

$$\Delta\lambda = \lambda_2 - \lambda_1 = (\text{lng}_2 - \text{lng}_1) \cdot \frac{\pi}{180}$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\left(\phi_1 \cdot \frac{\pi}{180}\right) \cdot \cos\left(\phi_2 \cdot \frac{\pi}{180}\right) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \arctan2\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c \quad \text{where } R = 6,371,000 \text{ meters}$$

### 3.2 GPS Hardware Integrity Checks

Before evaluating the Haversine distance, the device must satisfy strict hardware anti-spoofing constraints:

1. **Horizontal Accuracy Gate**: `position.coords.accuracy <= 15.0` meters. If accuracy exceeds 15 meters, the reading is rejected and the operator is prompted to acquire an unobstructed sky view.
2. **Temporal Freshness Gate**: `Date.now() - position.timestamp <= 10,000` ms (rejects replayed or cached location tokens).
3. **Mock Location Detection**: Verification that `navigator.geolocation` was not instantiated from an Android mock provider or developer emulator header.

---

## 4. Cryptographic Proof & Anti-Tampering Engine

To ensure evidentiary integrity when synchronization occurs hours after physical repair, every offline capture generates a verifiable cryptographic signature.

```
 [Raw WebRTC Video Frame]
           |
           v
 [Canvas WebP Compression] (Quality: 0.85, Max Dimension: 1920x1080)
           |
           +-------------------------------------+
           |                                     |
           v                                     v
 [ArrayBuffer Conversion]             [GPS Token & Timestamp]
           |                                     |
           v                                     v
 [Web Crypto SHA-256 Digest]          [Metadata Signature Block]
           |                                     |
           +-----------------+-------------------+
                             |
                             v
           [Immutable IOfflineProofRecord in IndexedDB]
```

### 4.1 Checksum Calculation via Web Crypto API

```typescript
export async function generateProofHash(
  imageBuffer: ArrayBuffer,
  ticketId: string,
  timestampIso: string,
  lat: number,
  lng: number
): Promise<string> {
  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(`${ticketId}:${timestampIso}:${lat.toFixed(6)}:${lng.toFixed(6)}:`);
  
  // Concatenate metadata header with image buffer
  const combinedBuffer = new Uint8Array(metadataBytes.length + imageBuffer.byteLength);
  combinedBuffer.set(metadataBytes, 0);
  combinedBuffer.set(new Uint8Array(imageBuffer), metadataBytes.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## 5. Background Sync & Network Reconciliation

### 5.1 ServiceWorker Sync Registration

When the operator clicks **"Mark as Resolved"** while offline:
1. The proof record is written to `offline_proofs` with `syncStatus = 'PENDING'`.
2. A synchronization task is queued in `sync_queue`.
3. The ServiceWorker registers a one-shot background synchronization event:
   ```typescript
   if ('serviceWorker' in navigator && 'SyncManager' in window) {
     const registration = await navigator.serviceWorker.ready;
     await registration.sync.register('nagriksetu-sync-proofs');
   } else {
     // Graceful fallback: register window 'online' event listener
     window.addEventListener('online', triggerImmediateSyncQueueProcessing);
   }
   ```

### 5.2 Exponential Backoff & Jitter Strategy

To prevent thundering herd problems when thousands of field workers reconnect simultaneously at end-of-shift, requests back off according to:

$$T_{\text{wait}} = \min\left(T_{\text{max}}, T_{\text{base}} \cdot 2^{\text{attempt}}\right) \pm \text{Random}(0, \text{Jitter})$$

| Parameter | Value | Description |
|---|---|---|
| $T_{\text{base}}$ | `1000 ms` | Base initial delay |
| $T_{\text{max}}$ | `60,000 ms` | Maximum backoff ceiling |
| $\text{Jitter}$ | `500 ms` | Uniform random entropy |
| $\text{Max Attempts}$ | `5` | Transition to `FAILED` for manual intervention |

### 5.3 Server-Side Reconciliation & PostGIS Merge

Upon receiving the synchronized proof at the central API endpoint (`POST /api/department/resolve`):
1. **Hash Verification**: Server regenerates SHA-256 against received payload; rejects on mismatch.
2. **Spatial Cross-Validation**: Executes PostGIS query:
   ```sql
   SELECT ST_DWithin(
     ST_SetSRID(ST_MakePoint(submitted_lng, submitted_lat), 4326)::geography,
     ST_SetSRID(ST_MakePoint(ticket_lng, ticket_lat), 4326)::geography,
     100.0
   ) AS is_proximity_valid;
   ```
3. **Status Transition**: Updates ticket status from `IN_PROGRESS` to `RESOLVED`, sets `resolved_at` to the offline hardware timestamp, and broadcasts real-time WebSocket update to the Public Transparency Dashboard.

---

## 6. Implementation Checklist for Field Rollout

- [x] IndexedDB schema definition (`NagrikSetuFieldCache_v1`)
- [x] Web Worker Haversine proximity computation module
- [x] Web Crypto SHA-256 evidentiary integrity generator
- [x] ServiceWorker `sync` event handler and background queue manager
- [x] PostGIS spatial validation and conflict reconciliation pipeline
