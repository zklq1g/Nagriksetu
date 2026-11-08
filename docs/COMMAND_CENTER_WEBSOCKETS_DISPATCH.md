# NagrikSetu — Municipal Operations Command Center & Real-Time WebSockets Event Broadcasting Protocol (MOCC-EBP)

> **Low-Latency Bidirectional WebSocket Gateway, Spatial Geohash Channel Multiplexing, Distributed Redis Pub/Sub Backplane, and Autonomous Municipal Emergency Dispatch Engine.**

---

## 1. Executive Summary & Problem Context

Modern Urban Local Bodies (ULBs) and Smart City Integrated Command and Control Centres (ICCCs) require instantaneous situational awareness across hundreds of square kilometers. In typical municipal governance workflows, civic issues reported by citizens or detected by automated IoT sensors take anywhere from 15 minutes to 48 hours to propagate to field supervisors and control rooms due to polling-based architectures, batched ETL pipelines, and fragmented departmental silos.

Critical limitations of legacy municipal dispatch systems include:
1. **Polling Bottlenecks & Network Overhead**: High-frequency HTTP polling by hundreds of municipal consoles and field handhelds creates unnecessary server load, battery drain on mobile devices, and high latency (30–120s delay).
2. **Spatial Blind Spots**: Command center dispatchers lack dynamic geofenced spatial viewport subscriptions. An operator viewing Ward 12 typically receives the global feed or has to manually re-filter large datasets client-side.
3. **Loss of In-Flight Event Continuity**: When field workers transition through subterranean transit hubs, underpasses, or areas with low cellular reception, standard WebSocket connections terminate, causing dropped dispatch alerts and inconsistent ticket states.
4. **Delayed Emergency Escalation**: Cascading hazards (e.g., severe storm drainage overflow coupled with exposed high-voltage cables) require immediate multi-agency dispatch within seconds, rather than periodic hourly triage.

NagrikSetu introduces the **Municipal Operations Command Center & Real-Time WebSockets Event Broadcasting Protocol (MOCC-EBP)**. MOCC-EBP provides a sub-50ms reactive event pipeline connecting the Citizen Portal, Field Worker Handhelds, Municipal Command Consoles, and National Smart City ICCC bridges through a distributed, geohash-partitioned publish/subscribe mesh.

```
+----------------------------------------------------------------------------------------------------+
|                                    NagrikSetu Real-Time Topology                                   |
|                                                                                                    |
|  +--------------------+    +----------------------+    +--------------------+    +--------------+  |
|  |   Citizen Portal   |    |  Field Worker App    |    |   Municipal ICCC   |    |  IoT/Drones  |  |
|  |  (Live Camera/GPS) |    |  (100m Proximity Lock)|   |   Command Console  |    |  Telemetry   |  |
|  +---------+----------+    +----------+-----------+    +---------+----------+    +------+-------+  |
|            |                          |                          |                      |          |
|            | TLS 1.3 / WSS            | TLS 1.3 / WSS            | TLS 1.3 / WSS        | MQTT/TLS |
|            v                          v                          v                      v          |
|  +----------------------------------------------------------------------------------------------+  |
|  |                      NagrikSetu Distributed WebSocket Edge Gateway Clusters                   |  |
|  |                     (Horizontal Auto-Scaling, TLS Termination, Token Auth)                   |  |
|  +----------------------------------------------+-----------------------------------------------+  |
|                                                 |                                                  |
|                                                 v                                                  |
|  +----------------------------------------------------------------------------------------------+  |
|  |                         Spatial Channel Multiplexer & Router (SCMR)                          |  |
|  |         - Geohash Level 6/7/8 Spatial Indexing   - Ward & Department Routing Matrix          |  |
|  |         - Role-Based Access Enforcement (RBAC)   - Sequence Numbering & Vector Clocks        |  |
|  +----------------------------------------------+-----------------------------------------------+  |
|                                                 |                                                  |
|                        +------------------------+------------------------+                         |
|                        |                                                 |                         |
|                        v                                                 v                         |
|  +---------------------------------------------+   +--------------------------------------------+  |
|  |       Distributed Redis Pub/Sub Cluster     |   |         Emergency Clustering Engine        |  |
|  |      - High-Throughput Memory Backplane     |   |    - Real-Time DBSCAN Spatial Clustering   |  |
|  |      - Channel Sharding by Geohash & Ward   |   |    - Multi-Ticket Severity Escalation      |  |
|  |      - Redis Streams Persistence (AOF)      |   |    - Autonomous Dispatch Recommendation    |  |
|  +---------------------------------------------+   +--------------------------------------------+  |
|                        |                                                 |                         |
|                        +------------------------+------------------------+                         |
|                                                 v                                                  |
|  +----------------------------------------------------------------------------------------------+  |
|  |                        PostgreSQL / PostGIS & CPGRAMS Upstream Bridge                        |  |
|  |        - Spatial Persistence & Audit Log         - Smart Cities Mission Open Data API        |  |
|  |        - Electronic Debit Advice Settlement      - Automated SMS/IVR Emergency Gateways      |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Low-Latency Event Gateway Architecture

### 2.1 Connection Lifecycle & Cryptographic Handshake

The edge gateway accepts incoming WebSocket connections over TLS 1.3 (`wss://api.nagriksetu.gov.in/v1/events`). During connection initialization, the client must negotiate authentication via an ephemeral JWT bearer token:

1. **Authentication Token Exchange**: Handshake HTTP `Upgrade` header includes:
   ```http
   GET /v1/events HTTP/1.1
   Host: api.nagriksetu.gov.in
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
   Sec-WebSocket-Version: 13
   Authorization: Bearer <Ed25519-Signed-JWT>
   X-Nagrik-Client-Type: FIELD_OPERATOR | COMMAND_CONSOLE | CITIZEN_FEED
   X-Nagrik-Client-Version: 1.10.0
   ```
2. **Session Context Allocation**: Upon token verification, the gateway instantiates an isolated `ClientSession` maintaining:
   - `session_id`: Cryptographically random UUIDv4.
   - `client_type`: Role determining broadcast permissions and rate limits.
   - `subscriptions`: Dynamic set of spatial geohash prefixes and administrative ward channels.
   - `last_acknowledged_seq`: High-water mark sequence ID for gapless recovery.
   - `heartbeat_timer`: Ping/Pong interval set to 15 seconds with a 5-second deadline.

### 2.2 Redis Cluster Pub/Sub Backplane

To decouple WebSocket connection termination from message routing across multiple edge pods, NagrikSetu employs an in-memory Redis Cluster (v7+) running active-active pub/sub and Redis Streams:

- **Broadcasting Channels**: Namespaced channels partitioned by administrative boundaries and spatial geohashes:
  - `ward:{ward_code}:events` — E.g., `ward:DL-NDMC-04:events`
  - `geo:{geohash6}:stream` — E.g., `geo:ttnf4x:stream` (approx. $1.2\text{km} \times 0.6\text{km}$)
  - `dept:{department_id}:urgent` — E.g., `dept:ROADS_PWD:urgent`
  - `ticket:{ticket_id}:state` — Point-to-point ticket progress notifications.
- **Persistence & Replay**: High-priority events (`CRITICAL`, `EMERGENCY`) are concurrently committed to a Redis Stream with a 72-hour sliding retention window, allowing newly reconnected clients to re-synchronize missing states.

---

## 3. Spatial Quadkey & Geohash Channel Multiplexing

Municipal operators in the Command Center pan and zoom across multi-scale GIS map viewports. Delivering citywide feeds to every workstation degrades client rendering performance and leaks irrelevant ward events. MOCC-EBP implements dynamic spatial subscription multiplexing.

### 3.1 Geohash Precision Grid Mapping

The system indexes all civic events and operator viewports into standard Base32 Geohash hierarchies:

$$\text{Geohash Level} \longleftrightarrow \text{Spatial Bounding Resolution}$$

| Level | Cell Dimensions | Typical Municipal Context | MOCC-EBP Subscription Target |
|:---:|:---:|:---|:---|
| **Level 5** | $\approx 4.9\text{km} \times 4.9\text{km}$ | Zone / Sub-Division | Overview Macro Viewport |
| **Level 6** | $\approx 1.2\text{km} \times 0.6\text{km}$ | Ward / Neighborhood | Standard Command Center Grid |
| **Level 7** | $\approx 152\text{m} \times 152\text{m}$ | Street Cluster / Micro-Sector | Dispatcher Focus & Drone Sweep |
| **Level 8** | $\approx 38\text{m} \times 19\text{m}$ | Exact Defect Vicinity ($<50\text{m}$) | Field Operator Proximity Gate |

```
Spatial Bounding Hierarchy:
+----------------------------------------------------+
| Geohash Level 5 (Zone: ttnf)                       |
|   +-----------------------+---------------------+  |
|   | Geohash Level 6       | Geohash Level 6     |  |
|   | (Ward 04: ttnf4)      | (Ward 05: ttnf5)    |  |
|   |   +--------+--------+ |                     |  |
|   |   | ttnf4x | ttnf4y | |                     |  |
|   |   | (L7)   | (L7)   | |                     |  |
|   |   +--------+--------+ |                     |  |
|   +-----------------------+---------------------+  |
+----------------------------------------------------+
```

### 3.2 Dynamic Viewport Subscription Formulation

When an operator's GIS canvas changes, the client computes the minimum covering set of Geohash cells $\mathcal{G}_{\text{covered}}$:

$$\mathcal{G}_{\text{covered}} = \text{Cover}(\text{Lat}_{\min}, \text{Lon}_{\min}, \text{Lat}_{\max}, \text{Lon}_{\max}, \text{precision}=6)$$

The client dispatches an atomic `SUBSCRIBE_SPATIAL` frame:

```json
{
  "action": "SUBSCRIBE_SPATIAL",
  "client_id": "operator_console_402",
  "add_hashes": ["ttnf4x", "ttnf4y", "ttnf51"],
  "remove_hashes": ["ttnf1a", "ttnf1b"],
  "min_severity": "MEDIUM",
  "departments": ["ROADS_PWD", "DRAINAGE_JAL_BOARD"]
}
```

The gateway unsubscribes the socket from obsolete Redis channels and binds it to newly entered cells with zero frame loss.

---

## 4. Event Taxonomy & Wire Protocol Specification

All broadcast events conform to a typed, versioned, and cryptographically verified JSON envelope. Where bandwidth-constrained mobile field links occur, the protocol supports GZIP/Brotli or Protobuf compaction.

### 4.1 Canonical Message Envelope

```typescript
export interface INagrikEventEnvelope<T = unknown> {
  eventId: string;             // UUIDv7 containing millisecond timestamp
  version: "1.0.0";
  timestamp: string;           // ISO 8601 UTC
  eventType: NagrikEventType;
  sequenceNumber: number;      // Monotonically increasing per channel
  channel: string;             // E.g., "geo:ttnf4x:stream"
  source: {
    actorId: string;
    role: "CITIZEN" | "FIELD_OPERATOR" | "AI_DISPATCHER" | "SYSTEM_CRON";
    deviceId?: string;
  };
  payload: T;
  hmacSignature?: string;      // SHA256 integrity signature for emergency commands
}
```

### 4.2 Core Event Catalog

| Event Type | Producer | Description | Broadcast Target |
|---|---|---|---|
| `ISSUE_CREATED` | Citizen / Gemini AI | New civic defect classified with GPS and severity | `geo:{hash}`, `ward:{code}` |
| `DUPLICATE_MERGED` | Geofence Engine | Second report merged within 50m; upvote tallied | `ticket:{id}`, `ward:{code}` |
| `SEVERITY_ESCALATED` | Triage Engine | SLA threshold nearing expiry or hazard detected | `dept:{dept}:urgent`, ICCC |
| `FIELD_DISPATCHED` | Municipal Command | Work order assigned to mobile contractor unit | `contractor:{id}`, `ticket:{id}` |
| `PROXIMITY_ENGAGED` | Field Handheld | Operator GPS locked within 100m of issue site | `ticket:{id}:audit`, Command |
| `PROOF_SUBMITTED` | Field Handheld | WebRTC "after" image captured & geoverified | `ticket:{id}`, `ward:{code}` |
| `RESOLUTION_VERIFIED`| SSIM / Admin | Computer vision verified fix (SSIM $\ge 0.88$) | Public Feed, Citizen |
| `SLA_BREACH_WARNING` | Cron Sentinel | 75% of statutory resolution window elapsed | Contractor, Ward Supervisor |
| `SLA_BREACH_PENALTY` | Financial Engine | Automatic compounding penalty debited to escrow| Finance Dept, Contractor |
| `EMERGENCY_CLUSTER` | DBSCAN Engine | Multi-ticket hazard cluster detected ($>3$ in 100m)| ICCC Alert, Police, Disaster |

---

## 5. Reconnection, Deduplication & State Resynchronization

In mobile field conditions, cellular dropped connections are common. MOCC-EBP enforces a strict high-water mark vector recovery protocol to eliminate duplicate alerts and guarantee zero dropped work orders.

### 5.1 Recovery Protocol Sequence

```
Field Handheld                                              Edge WebSocket Gateway
      |                                                               |
      |                     [Connection Interrupted]                  |
      x                                                               x
      |                                                               |
      |--- 1. WSS Reconnect (X-Last-Ack-Seq: 4128, SessionId) ------>|
      |                                                               |
      |                                 2. Query Redis Stream         |
      |                                    XRANGE channel 4129 +      |
      |                                                               |
      |<- 3. RESYNC_FRAME (Backlog: 4 items, LatestSeq: 4132) -------|
      |                                                               |
      |--- 4. Process Catch-up Delta (4129, 4130, 4131, 4132) ------->|
      |                                                               |
      |--- 5. ACK_STATE (AckSeq: 4132) ----------------------------->|
      |                                                               |
      |<- 6. RESUME_REALTIME_STREAM ----------------------------------|
      |                                                               |
```

### 5.2 Mathematical Monotonic Clock Guarantee

Each channel $C_i$ maintains an atomic 64-bit integer counter $S_{C_i}$ incremented for every published message. A client tracking $S_{\text{client}}$ detects dropped packets whenever:

$$\Delta S = S_{\text{received}} - S_{\text{expected}} > 1$$

If $\Delta S > 0$, the client automatically transitions into `RECOVERY_CATCHUP` mode, suspending UI re-renders until the intervening events are fetched from the Redis Streams buffer and applied sequentially.

---

## 6. Algorithmic Emergency Hazard Clustering & Autonomous Dispatch

When extreme weather events or structural failures strike urban centers (e.g., monsoon cloudbursts causing subterranean drain cave-ins), multiple citizens report interrelated issues in rapid succession. MOCC-EBP incorporates an autonomous **Density-Based Spatial Clustering of Applications with Noise (DBSCAN)** engine that correlates incoming real-time events.

### 6.1 Spatiotemporal Distance Metric

For any two events $e_i, e_j$ received within sliding time window $W = 15\text{ minutes}$:

$$D(e_i, e_j) = \alpha \cdot \frac{d_{\text{Haversine}}(e_i, e_j)}{R_{\text{threshold}}} + (1 - \alpha) \cdot \frac{|t_i - t_j|}{\Delta t_{\text{threshold}}}$$

Where:
- $R_{\text{threshold}} = 100\text{ meters}$ (maximum spatial correlation distance).
- $\Delta t_{\text{threshold}} = 900\text{ seconds}$ (15-minute temporal window).
- $\alpha = 0.70$ (spatial weight parameter).

### 6.2 Emergency Cluster Trigger Criteria

An `EMERGENCY_CLUSTER` event is triggered when:
1. Count of correlated events $\ge 3$ within $R_{\text{threshold}}$.
2. At least two events carry `HIGH` or `CRITICAL` severity classifications (e.g., exposed electric pole + standing water).
3. Compound Hazard Index:

$$\chi_{\text{cluster}} = \sum_{k=1}^{N} \omega(e_k.\text{severity}) \cdot \mu(e_k.\text{category}) \ge 8.5$$

When $\chi_{\text{cluster}} \ge 8.5$, MOCC-EBP bypasses standard municipal queues, immediately broadcasts an audio-visual interrupt to the Chief Municipal Engineer's console, and dispatches automated emergency push notifications to ward emergency rapid-response teams.

---

## 7. Production TypeScript Implementation

Below is the production TypeScript domain contracts and client subscription engine powering the NagrikSetu Command Center console.

```typescript
/**
 * NagrikSetu - Real-Time Command Center WebSockets Dispatch Engine
 * Package: @nagriksetu/realtime-dispatcher
 */

export type NagrikEventType =
  | 'ISSUE_CREATED'
  | 'DUPLICATE_MERGED'
  | 'SEVERITY_ESCALATED'
  | 'FIELD_DISPATCHED'
  | 'PROXIMITY_ENGAGED'
  | 'PROOF_SUBMITTED'
  | 'RESOLUTION_VERIFIED'
  | 'SLA_BREACH_WARNING'
  | 'SLA_BREACH_PENALTY'
  | 'EMERGENCY_CLUSTER';

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IGeoPoint {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface INagrikEventEnvelope<T = unknown> {
  eventId: string;
  version: '1.0.0';
  timestamp: string;
  eventType: NagrikEventType;
  sequenceNumber: number;
  channel: string;
  source: {
    actorId: string;
    role: 'CITIZEN' | 'FIELD_OPERATOR' | 'AI_DISPATCHER' | 'SYSTEM_CRON';
    deviceId?: string;
  };
  payload: T;
  hmacSignature?: string;
}

export interface IIssueCreatedPayload {
  ticketId: string;
  wardId: string;
  department: string;
  category: string;
  severity: IssueSeverity;
  coordinates: IGeoPoint;
  geohash7: string;
  citizenKarmaLevel: number;
  slaDeadlineUtc: string;
  imageUrl: string;
}

export interface IEmergencyClusterPayload {
  clusterId: string;
  wardId: string;
  centroid: IGeoPoint;
  correlatedTicketIds: string[];
  hazardScore: number;
  categories: string[];
  recommendedAgencies: string[];
  detectedAtUtc: string;
}

export interface ISpatialSubscriptionFilter {
  geohashes: string[];
  wardIds?: string[];
  departments?: string[];
  minSeverity?: IssueSeverity;
}

export type EventHandler<T = unknown> = (event: INagrikEventEnvelope<T>) => void;

/**
 * Robust Client Subscription & Reconnection Manager
 */
export class RealtimeCommandCenterClient {
  private ws: WebSocket | null = null;
  private url: string;
  private authToken: string;
  private clientId: string;
  private activeFilter: ISpatialSubscriptionFilter;
  private handlers: Map<NagrikEventType, Set<EventHandler>> = new Map();
  private lastAcknowledgedSeq: number = 0;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private pingIntervalTimer: NodeJS.Timeout | null = null;

  constructor(config: {
    url: string;
    authToken: string;
    clientId: string;
    initialFilter: ISpatialSubscriptionFilter;
  }) {
    this.url = config.url;
    this.authToken = config.authToken;
    this.clientId = config.clientId;
    this.activeFilter = config.initialFilter;
  }

  public connect(): void {
    const wsUrl = new URL(this.url);
    wsUrl.searchParams.set('token', this.authToken);
    wsUrl.searchParams.set('client_id', this.clientId);
    wsUrl.searchParams.set('last_seq', this.lastAcknowledgedSeq.toString());

    this.ws = new WebSocket(wsUrl.toString());

    this.ws.onopen = () => {
      console.log(`[MOCC-EBP] Connected to command center gateway: ${this.clientId}`);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.syncSubscriptions();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data as string) as INagrikEventEnvelope;
        this.processIncomingEvent(raw);
      } catch (err) {
        console.error('[MOCC-EBP] Failed to decode event envelope:', err);
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.warn(`[MOCC-EBP] WebSocket closed (code=${event.code}). Scheduling retry...`);
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('[MOCC-EBP] WebSocket transport error:', err);
    };
  }

  public subscribe<T>(eventType: NagrikEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    const set = this.handlers.get(eventType)!;
    set.add(handler as EventHandler);

    return () => {
      set.delete(handler as EventHandler);
    };
  }

  public updateViewport(newGeohashes: string[]): void {
    this.activeFilter.geohashes = Array.from(new Set(newGeohashes));
    this.syncSubscriptions();
  }

  private syncSubscriptions(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = {
        action: 'UPDATE_SUBSCRIPTION',
        clientId: this.clientId,
        filter: this.activeFilter,
      };
      this.ws.send(JSON.stringify(payload));
    }
  }

  private processIncomingEvent(envelope: INagrikEventEnvelope): void {
    if (envelope.sequenceNumber <= this.lastAcknowledgedSeq && this.lastAcknowledgedSeq > 0) {
      // Duplicate event discarded
      return;
    }

    this.lastAcknowledgedSeq = envelope.sequenceNumber;

    const set = this.handlers.get(envelope.eventType);
    if (set && set.size > 0) {
      set.forEach((fn) => {
        try {
          fn(envelope);
        } catch (handlerErr) {
          console.error(`[MOCC-EBP] Handler failed for ${envelope.eventType}:`, handlerErr);
        }
      });
    }

    // Acknowledge high-priority messages
    if (envelope.eventType === 'EMERGENCY_CLUSTER' || envelope.eventType === 'SLA_BREACH_PENALTY') {
      this.sendAck(envelope.eventId, envelope.sequenceNumber);
    }
  }

  private sendAck(eventId: string, seq: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'ACK', eventId, seq }));
    }
  }

  private startHeartbeat(): void {
    this.pingIntervalTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: 'PING', timestamp: Date.now() }));
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[MOCC-EBP] Max reconnection attempts exhausted.');
      return;
    }
    const backoffMs = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    setTimeout(() => {
      console.log(`[MOCC-EBP] Reconnecting attempt #${this.reconnectAttempts}...`);
      this.connect();
    }, backoffMs);
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnected');
      this.ws = null;
    }
  }
}
```

---

## 8. Integration with India Smart Cities Mission & CPGRAMS

MOCC-EBP connects directly to central and state smart city data exchange frameworks:

1. **India Urban Data Exchange (IUDX)**: Real-time ticket streams are converted to NGSI-LD compliant data models for open city data hubs.
2. **CPGRAMS Government Grievance Bridge**: SLA breaches exceeding statutory boundaries trigger automated XML/JSON SOAP dispatches to the central administrative grievance repository with photographic proof-of-failure.
3. **Automated WhatsApp/SMS Alert Gateway**: High-priority neighborhood escalations generate instant alerts via local municipal telecom gateways for citizens residing within the affected Geohash-7 radius.

---

## 9. Security, Privacy & Zero-Trust Verification

- **Mutual TLS (mTLS)**: Inter-gateway and Redis cluster communication is strictly encrypted with mTLS using internal municipal PKI certificates.
- **HMAC Payload Integrity**: Emergency cluster events broadcast to public sirens or field supervisors contain an HMAC-SHA256 signature generated by the municipal controller key.
- **Rate-Limiting & Anti-DDOS**: Inbound client WebSocket messages are throttled using an in-memory token bucket ($r = 10\text{ req/s}$, burst capacity $b = 30$).
- **PII Redaction**: All live event broadcasts to the public dashboard strip citizen names, mobile numbers, and facial imagery detected in proof photos via automated OpenCV / MediaPipe face anonymization prior to channel publish.
