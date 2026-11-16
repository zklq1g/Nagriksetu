/**
 * NagrikSetu - Autonomous Offline-First CRDT-Driven Store-and-Forward
 * Municipal State Synchronization & Disaster Zone Mesh Consensus Protocol (OF-CRDT-MESH)
 *
 * Implements mathematically verified State-based Conflict-Free Replicated Data Types (CvRDT):
 * - Vector Clocks with causal partial order verification
 * - Last-Write-Wins Registers (LWW-Register) with Hybrid Logical Clock and deterministic tie-breaking
 * - Observed-Remove Sets (OR-Set / Add-Wins Set) for dynamic collections and manifests
 * - Positive-Negative Counters (PNCounter) for emergency resource and logistics tracking
 * - Merkle-DAG state digest generation for low-bandwidth delta synchronization
 * - PeerMeshSyncEngine orchestrating ad-hoc peer packet exchange and state convergence
 */

export type DisasterTicketStatus =
  | 'REPORTED'
  | 'TRIAGED_CRITICAL'
  | 'SQUAD_DISPATCHED'
  | 'ON_SITE_CONTAINMENT'
  | 'RESCUE_COMPLETED'
  | 'VERIFIED_RESOLVED'
  | 'CLOSED';

export type DisasterSeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CATASTROPHIC_SECTOR_WIDE';

export type IncidentCategory =
  | 'STRUCTURAL_COLLAPSE_TRAPPED_VICTIMS'
  | 'SUBMERGED_ELECTRICAL_SUBSTATION'
  | 'WATER_MAIN_BREACH_DRINKING_CONTAMINATION'
  | 'LANDSLIDE_ROAD_BLOCKADE'
  | 'HAZMAT_GAS_LEAK_DISASTER'
  | 'EMERGENCY_MEDICAL_EVACUATION';

/**
 * Vector Clock for tracking causal dependencies across distributed mesh nodes.
 */
export class VectorClock {
  private clockMap: Map<string, number>;

  constructor(initialMap?: Record<string, number> | Map<string, number>) {
    this.clockMap = new Map();
    if (initialMap) {
      const entries = initialMap instanceof Map ? initialMap.entries() : Object.entries(initialMap);
      for (const [nodeId, counter] of entries) {
        this.clockMap.set(nodeId, counter);
      }
    }
  }

  public get(nodeId: string): number {
    return this.clockMap.get(nodeId) || 0;
  }

  public increment(nodeId: string): void {
    const current = this.get(nodeId);
    this.clockMap.set(nodeId, current + 1);
  }

  public clone(): VectorClock {
    const copy = new VectorClock();
    for (const [nodeId, counter] of this.clockMap.entries()) {
      copy.clockMap.set(nodeId, counter);
    }
    return copy;
  }

  /**
   * Semi-lattice join operator: takes maximum counter for each known node.
   */
  public merge(other: VectorClock): VectorClock {
    const merged = this.clone();
    for (const [nodeId, counter] of other.clockMap.entries()) {
      const localVal = merged.get(nodeId);
      merged.clockMap.set(nodeId, Math.max(localVal, counter));
    }
    return merged;
  }

  /**
   * Returns true if this vector clock causally happened before or equals the other.
   */
  public happensBefore(other: VectorClock): boolean {
    let hasStrictlySmaller = false;
    const allKeys = new Set([...this.clockMap.keys(), ...other.clockMap.keys()]);

    for (const key of allKeys) {
      const thisVal = this.get(key);
      const otherVal = other.get(key);

      if (thisVal > otherVal) {
        return false;
      }
      if (thisVal < otherVal) {
        hasStrictlySmaller = true;
      }
    }

    return hasStrictlySmaller;
  }

  public isConcurrent(other: VectorClock): boolean {
    return !this.happensBefore(other) && !other.happensBefore(this) && !this.equals(other);
  }

  public equals(other: VectorClock): boolean {
    const allKeys = new Set([...this.clockMap.keys(), ...other.clockMap.keys()]);
    for (const key of allKeys) {
      if (this.get(key) !== other.get(key)) {
        return false;
      }
    }
    return true;
  }

  public toJSON(): Record<string, number> {
    const obj: Record<string, number> = {};
    for (const [nodeId, counter] of this.clockMap.entries()) {
      obj[nodeId] = counter;
    }
    return obj;
  }
}

/**
 * Hybrid Logical Clock (HLC) timestamp tuple for monotonic physical-logical ordering.
 */
export interface IHybridTimestamp {
  physicalMillis: number;
  logicalCounter: number;
  originNodeId: string;
}

/**
 * Last-Write-Wins Register (LWW-Register) CvRDT.
 * Resolves scalar concurrent mutations deterministically using HLC and lexicographical node ID tie-break.
 */
export class LWWRegister<T> {
  private value: T;
  private timestamp: IHybridTimestamp;

  constructor(value: T, timestamp?: IHybridTimestamp) {
    this.value = value;
    this.timestamp = timestamp || {
      physicalMillis: Date.now(),
      logicalCounter: 0,
      originNodeId: 'INIT',
    };
  }

  public getValue(): T {
    return this.value;
  }

  public getTimestamp(): IHybridTimestamp {
    return { ...this.timestamp };
  }

  public update(newValue: T, physicalMillis: number, logicalCounter: number, originNodeId: string): void {
    if (this.isIncomingDominant(physicalMillis, logicalCounter, originNodeId)) {
      this.value = newValue;
      this.timestamp = { physicalMillis, logicalCounter, originNodeId };
    }
  }

  /**
   * Semi-lattice join operator for LWW-Register.
   */
  public merge(other: LWWRegister<T>): LWWRegister<T> {
    const otherTs = other.getTimestamp();
    if (this.isIncomingDominant(otherTs.physicalMillis, otherTs.logicalCounter, otherTs.originNodeId)) {
      return new LWWRegister<T>(other.getValue(), otherTs);
    }
    return new LWWRegister<T>(this.value, this.timestamp);
  }

  private isIncomingDominant(remotePhysical: number, remoteLogical: number, remoteNodeId: string): boolean {
    if (remotePhysical > this.timestamp.physicalMillis) return true;
    if (remotePhysical < this.timestamp.physicalMillis) return false;

    if (remoteLogical > this.timestamp.logicalCounter) return true;
    if (remoteLogical < this.timestamp.logicalCounter) return false;

    // Lexicographical tie-breaker for deterministic convergence
    return remoteNodeId > this.timestamp.originNodeId;
  }
}

/**
 * Element entry tag for Observed-Remove Set (OR-Set).
 */
export interface IORSetTag {
  tagId: string;
  timestampMillis: number;
  nodeId: string;
}

/**
 * Observed-Remove Set with Add-Wins semantics (OR-Set) CvRDT.
 * Elements can be added and removed without resurrection or permanent death traps.
 */
export class ORSet<T> {
  // Elements map to a set of unique birth tags
  private additions: Map<string, { element: T; tags: Set<string> }>;
  // Set of tombstone tagIds that have been observed and removed
  private tombstones: Set<string>;

  constructor() {
    this.additions = new Map();
    this.tombstones = new Set();
  }

  private serializeKey(element: T): string {
    return typeof element === 'string' ? element : JSON.stringify(element);
  }

  public add(element: T, nodeId: string): string {
    const key = this.serializeKey(element);
    const tagId = `${nodeId}:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;

    if (!this.additions.has(key)) {
      this.additions.set(key, { element, tags: new Set() });
    }
    this.additions.get(key)!.tags.add(tagId);
    return tagId;
  }

  public remove(element: T): void {
    const key = this.serializeKey(element);
    const entry = this.additions.get(key);
    if (!entry) return;

    // Tombstone all currently observed tags for this element
    for (const tag of entry.tags) {
      this.tombstones.add(tag);
    }
  }

  public read(): T[] {
    const result: T[] = [];
    for (const [, entry] of this.additions.entries()) {
      // An element is active if it has at least one tag not in the tombstones set
      let isLive = false;
      for (const tag of entry.tags) {
        if (!this.tombstones.has(tag)) {
          isLive = true;
          break;
        }
      }
      if (isLive) {
        result.push(entry.element);
      }
    }
    return result;
  }

  public contains(element: T): boolean {
    const key = this.serializeKey(element);
    const entry = this.additions.get(key);
    if (!entry) return false;

    for (const tag of entry.tags) {
      if (!this.tombstones.has(tag)) return true;
    }
    return false;
  }

  /**
   * Semi-lattice join operator: takes set union of additions and set union of tombstones.
   */
  public merge(other: ORSet<T>): ORSet<T> {
    const merged = new ORSet<T>();

    // Merge additions
    for (const [key, entry] of this.additions.entries()) {
      merged.additions.set(key, { element: entry.element, tags: new Set(entry.tags) });
    }
    for (const [key, entry] of other.additions.entries()) {
      if (!merged.additions.has(key)) {
        merged.additions.set(key, { element: entry.element, tags: new Set(entry.tags) });
      } else {
        const targetTags = merged.additions.get(key)!.tags;
        for (const tag of entry.tags) {
          targetTags.add(tag);
        }
      }
    }

    // Merge tombstones
    for (const tomb of this.tombstones) {
      merged.tombstones.add(tomb);
    }
    for (const tomb of other.tombstones) {
      merged.tombstones.add(tomb);
    }

    return merged;
  }

  public exportState(): { additions: Record<string, { element: T; tags: string[] }>; tombstones: string[] } {
    const adds: Record<string, { element: T; tags: string[] }> = {};
    for (const [k, v] of this.additions.entries()) {
      adds[k] = { element: v.element, tags: Array.from(v.tags) };
    }
    return {
      additions: adds,
      tombstones: Array.from(this.tombstones),
    };
  }

  public importState(data: { additions: Record<string, { element: T; tags: string[] }>; tombstones: string[] }): void {
    for (const [k, v] of Object.entries(data.additions)) {
      this.additions.set(k, { element: v.element, tags: new Set(v.tags) });
    }
    for (const t of data.tombstones) {
      this.tombstones.add(t);
    }
  }
}

/**
 * Distributed Positive-Negative Counter (PNCounter) CvRDT for logistics & supply tracking.
 */
export class PNCounter {
  private pVector: Map<string, number>;
  private nVector: Map<string, number>;

  constructor() {
    this.pVector = new Map();
    this.nVector = new Map();
  }

  public increment(nodeId: string, amount: number = 1): void {
    const curr = this.pVector.get(nodeId) || 0;
    this.pVector.set(nodeId, curr + amount);
  }

  public decrement(nodeId: string, amount: number = 1): void {
    const curr = this.nVector.get(nodeId) || 0;
    this.nVector.set(nodeId, curr + amount);
  }

  public value(): number {
    let sumP = 0;
    let sumN = 0;
    for (const v of this.pVector.values()) sumP += v;
    for (const v of this.nVector.values()) sumN += v;
    return sumP - sumN;
  }

  public merge(other: PNCounter): PNCounter {
    const merged = new PNCounter();
    const allPKeys = new Set([...this.pVector.keys(), ...other.pVector.keys()]);
    const allNKeys = new Set([...this.nVector.keys(), ...other.nVector.keys()]);

    for (const k of allPKeys) {
      const v1 = this.pVector.get(k) || 0;
      const v2 = other.pVector.get(k) || 0;
      merged.pVector.set(k, Math.max(v1, v2));
    }
    for (const k of allNKeys) {
      const v1 = this.nVector.get(k) || 0;
      const v2 = other.nVector.get(k) || 0;
      merged.nVector.set(k, Math.max(v1, v2));
    }

    return merged;
  }
}

/**
 * Composite Municipal Disaster Ticket CRDT entity.
 */
export interface IDisasterLocation {
  latitude: number;
  longitude: number;
  wardId: string;
  landmark: string;
}

export class DisasterTicketCRDT {
  public readonly ticketId: string;
  public readonly category: IncidentCategory;
  public readonly location: IDisasterLocation;
  public readonly originNodeId: string;

  public statusRegister: LWWRegister<DisasterTicketStatus>;
  public severityRegister: LWWRegister<DisasterSeverityLevel>;
  public descriptionRegister: LWWRegister<string>;
  public assignedSquadsSet: ORSet<string>;
  public requestedSuppliesSet: ORSet<string>;
  public photoProofHashesSet: ORSet<string>;
  public vectorClock: VectorClock;

  constructor(
    ticketId: string,
    category: IncidentCategory,
    location: IDisasterLocation,
    originNodeId: string,
    initialStatus: DisasterTicketStatus = 'REPORTED',
    initialSeverity: DisasterSeverityLevel = 'HIGH',
    initialDescription: string = ''
  ) {
    this.ticketId = ticketId;
    this.category = category;
    this.location = location;
    this.originNodeId = originNodeId;

    const ts: IHybridTimestamp = {
      physicalMillis: Date.now(),
      logicalCounter: 0,
      originNodeId,
    };

    this.statusRegister = new LWWRegister<DisasterTicketStatus>(initialStatus, ts);
    this.severityRegister = new LWWRegister<DisasterSeverityLevel>(initialSeverity, ts);
    this.descriptionRegister = new LWWRegister<string>(initialDescription, ts);
    this.assignedSquadsSet = new ORSet<string>();
    this.requestedSuppliesSet = new ORSet<string>();
    this.photoProofHashesSet = new ORSet<string>();

    this.vectorClock = new VectorClock();
    this.vectorClock.increment(originNodeId);
  }

  /**
   * Updates status with causal vector clock advancement.
   */
  public updateStatus(newStatus: DisasterTicketStatus, nodeId: string): void {
    this.vectorClock.increment(nodeId);
    this.statusRegister.update(newStatus, Date.now(), this.vectorClock.get(nodeId), nodeId);
  }

  public updateSeverity(newSeverity: DisasterSeverityLevel, nodeId: string): void {
    this.vectorClock.increment(nodeId);
    this.severityRegister.update(newSeverity, Date.now(), this.vectorClock.get(nodeId), nodeId);
  }

  public assignSquad(squadIdentifier: string, nodeId: string): void {
    this.vectorClock.increment(nodeId);
    this.assignedSquadsSet.add(squadIdentifier, nodeId);
  }

  public removeSquad(squadIdentifier: string, nodeId: string): void {
    this.vectorClock.increment(nodeId);
    this.assignedSquadsSet.remove(squadIdentifier);
  }

  public addPhotoProofHash(sha256Hash: string, nodeId: string): void {
    this.vectorClock.increment(nodeId);
    this.photoProofHashesSet.add(sha256Hash, nodeId);
  }

  /**
   * Deterministic join merge of two ticket states.
   */
  public merge(other: DisasterTicketCRDT): DisasterTicketCRDT {
    if (this.ticketId !== other.ticketId) {
      throw new Error(`Cannot merge tickets with mismatched IDs: ${this.ticketId} vs ${other.ticketId}`);
    }

    const merged = new DisasterTicketCRDT(
      this.ticketId,
      this.category,
      this.location,
      this.originNodeId
    );

    merged.statusRegister = this.statusRegister.merge(other.statusRegister);
    merged.severityRegister = this.severityRegister.merge(other.severityRegister);
    merged.descriptionRegister = this.descriptionRegister.merge(other.descriptionRegister);
    merged.assignedSquadsSet = this.assignedSquadsSet.merge(other.assignedSquadsSet);
    merged.requestedSuppliesSet = this.requestedSuppliesSet.merge(other.requestedSuppliesSet);
    merged.photoProofHashesSet = this.photoProofHashesSet.merge(other.photoProofHashesSet);
    merged.vectorClock = this.vectorClock.merge(other.vectorClock);

    return merged;
  }

  public getSummary() {
    return {
      ticketId: this.ticketId,
      category: this.category,
      status: this.statusRegister.getValue(),
      severity: this.severityRegister.getValue(),
      description: this.descriptionRegister.getValue(),
      assignedSquads: this.assignedSquadsSet.read(),
      requestedSupplies: this.requestedSuppliesSet.read(),
      photoProofCount: this.photoProofHashesSet.read().length,
      vectorClock: this.vectorClock.toJSON(),
    };
  }
}

/**
 * Merkle-DAG state digest generation for bandwidth-efficient anti-entropy sync.
 */
export class MerkleDAGDigest {
  /**
   * Generates a deterministic integer/hex hash for a string payload (FNV-1a / Murmur-inspired).
   */
  public static hashString(input: string): string {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Computes hierarchical Merkle root digest over a collection of disaster tickets.
   */
  public static computeRootDigest(tickets: Map<string, DisasterTicketCRDT>): {
    rootHash: string;
    ticketHashes: Map<string, string>;
  } {
    const sortedTicketIds = Array.from(tickets.keys()).sort();
    const ticketHashes = new Map<string, string>();
    const leafHashes: string[] = [];

    for (const id of sortedTicketIds) {
      const ticket = tickets.get(id)!;
      const serialized = JSON.stringify(ticket.getSummary());
      const hash = this.hashString(serialized);
      ticketHashes.set(id, hash);
      leafHashes.push(hash);
    }

    if (leafHashes.length === 0) {
      return { rootHash: '00000000', ticketHashes };
    }

    // Build Merkle binary tree levels up to root
    let currentLevel = leafHashes;
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          nextLevel.push(this.hashString(currentLevel[i] + currentLevel[i + 1]));
        } else {
          // Odd leaf duplication
          nextLevel.push(this.hashString(currentLevel[i] + currentLevel[i]));
        }
      }
      currentLevel = nextLevel;
    }

    return { rootHash: currentLevel[0], ticketHashes };
  }
}

/**
 * Ad-Hoc Peer-to-Peer Mesh Synchronization Engine.
 * Simulates radio frame exchange, divergent slice pinpointing, and deterministic merge.
 */
export class PeerMeshSyncEngine {
  public readonly nodeId: string;
  private localTickets: Map<string, DisasterTicketCRDT>;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.localTickets = new Map();
  }

  public registerTicket(ticket: DisasterTicketCRDT): void {
    this.localTickets.set(ticket.ticketId, ticket);
  }

  public getTicket(ticketId: string): DisasterTicketCRDT | undefined {
    return this.localTickets.get(ticketId);
  }

  public getAllTickets(): Map<string, DisasterTicketCRDT> {
    return this.localTickets;
  }

  /**
   * Step 1 of handshake: Generate beacon frame containing Merkle Root.
   */
  public generateBeacon(): { nodeId: string; rootHash: string; ticketCount: number } {
    const { rootHash } = MerkleDAGDigest.computeRootDigest(this.localTickets);
    return {
      nodeId: this.nodeId,
      rootHash,
      ticketCount: this.localTickets.size,
    };
  }

  /**
   * Step 2: Compare remote beacon root hash with local root hash.
   * If root hashes match, state is identical. If they differ, identify missing/divergent IDs.
   */
  public evaluatePeerSyncNeeds(remoteBeacon: { rootHash: string; ticketCount: number }): {
    isInSync: boolean;
    localRootHash: string;
  } {
    const { rootHash } = MerkleDAGDigest.computeRootDigest(this.localTickets);
    return {
      isInSync: rootHash === remoteBeacon.rootHash,
      localRootHash: rootHash,
    };
  }

  /**
   * Generates delta sync payload containing tickets that remote peer lacks or has divergent state for.
   */
  public generateDeltaPayload(remoteTicketHashes: Map<string, string>): DisasterTicketCRDT[] {
    const { ticketHashes: localHashes } = MerkleDAGDigest.computeRootDigest(this.localTickets);
    const deltaList: DisasterTicketCRDT[] = [];

    for (const [ticketId, ticket] of this.localTickets.entries()) {
      const localHash = localHashes.get(ticketId);
      const remoteHash = remoteTicketHashes.get(ticketId);

      // Include if remote doesn't have it or hash differs
      if (!remoteHash || remoteHash !== localHash) {
        deltaList.push(ticket);
      }
    }

    return deltaList;
  }

  /**
   * Applies incoming delta payload to local repository via semi-lattice join.
   */
  public applyDeltaPayload(incomingTickets: DisasterTicketCRDT[]): {
    updatedCount: number;
    newRootHash: string;
  } {
    let updatedCount = 0;

    for (const incoming of incomingTickets) {
      const local = this.localTickets.get(incoming.ticketId);
      if (!local) {
        this.localTickets.set(incoming.ticketId, incoming);
        updatedCount++;
      } else {
        const merged = local.merge(incoming);
        this.localTickets.set(incoming.ticketId, merged);
        updatedCount++;
      }
    }

    const { rootHash } = MerkleDAGDigest.computeRootDigest(this.localTickets);
    return { updatedCount, newRootHash: rootHash };
  }
}
