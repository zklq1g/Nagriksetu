# NagrikSetu — Automated Municipal Contractor Performance Scorecard & Penalty Deduction Engine

> **Algorithmic SLA Enforcement, Multi-Tier Financial Penalty Compounding, Cryptographic Proof-of-Work Verification Gating, and Municipal Public Financial Management System (PFMS) Escrow Settlement.**

---

## 1. Executive Summary & Fiscal Accountability Context

Municipal corporations across India (ULBs — Urban Local Bodies) outsource over 70% of routine civic maintenance—including asphalt pothole resurfacing, solid waste clearing, storm drain desilting, and sodium/LED streetlamp maintenance—to private civic contractors. Despite detailed Service Level Agreements (SLAs) mandated in municipal tenders, civic administration suffers from persistent systemic vulnerabilities:

1. **Unenforced SLA Deadlines**: Manual reporting allows work orders to languish in administrative queues for weeks without fiscal consequences for delinquent contractors.
2. **Ghost Closures & False Sign-Offs**: Field supervisors frequently sign off on incomplete works without deterministic verification, leading to recurring civic failures.
3. **Subjective Contractor Scoring**: Vendor re-tendering decisions lack empirical performance tracking, allowing chronically underperforming vendors to secure repeat municipal contracts.
4. **Manual Billing Reconciliation**: Penalty calculations are calculated manually at the end of fiscal quarters, leading to contractor disputes, protracted litigation, and uncollected municipal deductions.

NagrikSetu introduces the **Automated Contractor Performance Scorecard & Penalty Deduction Engine (CPS-PDE)**. By binding real-time citizen reports, Google Gemini multi-modal vision verification, and micro-geofenced proof-of-work timestamps directly to contractor escrow accounts, NagrikSetu transforms passive contractual terms into **autonomous, deterministic fiscal deductions**.

```
+----------------------------------------------------------------------------------------------------+
|                                    Work Order Allocation & Lifecycle                               |
|                                                                                                    |
|  +------------------------------------+             +-------------------------------------------+  |
|  |     Citizen / IoT Intake Triage    |             |        Contractor Dispatch Engine         |  |
|  |  - Verified Geolocation & Severity |             |  - Ward-Specific Concessionaire Mapping   |  |
|  |  - AI Classified Category (Gemini) | ----------> |  - Automated Work Order (WO) Issuance     |  |
|  |  - Target SLA Timestamp Locked     |             |  - Dynamic Target Completion Deadline     |  |
|  +------------------------------------+             +---------------------+---------------------+  |
|                                                                           |                        |
+---------------------------------------------------------------------------|------------------------+
                                                                            v
+----------------------------------------------------------------------------------------------------+
|                                Real-Time SLA Monitoring & Penalty Gateway                          |
|                                                                                                    |
|  +---------------------------------------------------+  +---------------------------------------+  |
|  |           Deterministic Clock Gating              |  |         Active Penalty Accumulator    |  |
|  |  - Grace Period Window (T_grace)                  |  |  - Base Daily Penalty Rate (P_0)      |  |
|  |  - Weather / Force Majeure Pauses                 |  |  - Compounding Breach Exponent (gamma)|  |
|  |  - Dynamic Severity Multiplier (M_sev)            |  |  - Cap Floor: 25% Total Contract Value|  |
|  +-------------------------+-------------------------+  +-------------------+-------------------+  |
|                            |                                                |                      |
|                            +-----------------------+------------------------+                      |
|                                                    v                                               |
|  +----------------------------------------------------------------------------------------------+  |
|  |                     Proof-of-Work Verification Gate (Zero-Trust Validation)                  |  |
|  |  - 100m Field Operator Proximity Gate (Haversine ST_DWithin)                                 |  |
|  |  - Before/After Computer Vision Delta (SSIM >= 0.88 & Gemini Visual Verification)            |  |
|  |  - Cryptographic Web Crypto SHA-256 Digest & EXIF Geotag Attestation                        |  |
|  +-------------------------------------------------+--------------------------------------------+  |
+----------------------------------------------------|-----------------------------------------------+
                                                     v
+----------------------------------------------------------------------------------------------------+
|                                Settlement & Municipal Fiscal Engine                                |
|                                                                                                    |
|  +---------------------------------------+          +-------------------------------------------+  |
|  |      Automated Debit Memo Synthesizer |          |      Contractor Performance Score (CPS)   |  |
|  |  - Direct Escrow Holdback Deduction   |          |  - Normalized Rolling Score (0 - 100)     |  |
|  |  - Municipal PFMS XML/JSON Payload    | <------> |  - Bid-Disqualification Threshold (< 60)  |  |
|  |  - Tamper-Evident Audit Ledger Entry  |          |  - Tier-1 Fast-Track Bonus Eligibility    |  |
|  +---------------------------------------+          +-------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Dynamic SLA Taxonomy & Resolution Tiers

Service Level Agreements in NagrikSetu are dynamically computed based on category, civic severity, and municipal zoning density (e.g., high-density arterial corridors versus low-density residential collector roads).

### 2.1 SLA Time-to-Resolution Matrix

| Category | Severity Level | Target SLA ($T_{\text{target}}$) | Grace Period ($T_{\text{grace}}$) | Base Daily Penalty ($P_0$) |
|---|---|---|---|---|
| **Road Hazard / Pothole** | Critical ($S=3$) | 12 Hours | 2 Hours | ₹2,500 / day |
| **Road Hazard / Pothole** | Moderate ($S=2$) | 36 Hours | 4 Hours | ₹1,200 / day |
| **Road Hazard / Pothole** | Low ($S=1$) | 72 Hours | 8 Hours | ₹500 / day |
| **Solid Waste Overflow** | Critical ($S=3$) | 6 Hours | 1 Hour | ₹3,000 / day |
| **Solid Waste Overflow** | Moderate ($S=2$) | 18 Hours | 2 Hours | ₹1,000 / day |
| **Street Lighting Outage** | Critical ($S=3$, Cluster $\ge 3$) | 8 Hours | 1 Hour | ₹1,500 / day |
| **Street Lighting Outage** | Single Luminaire ($S=1$) | 48 Hours | 6 Hours | ₹300 / day |
| **Water Main Burst** | Emergency ($S=3$) | 4 Hours | 30 Mins | ₹5,000 / day |
| **Open Manhole / Drain** | Hazardous ($S=3$) | 4 Hours | 30 Mins | ₹5,000 / day |

---

## 3. Mathematical SLA Degradation & Penalty Compounding Model

Penalties are computed using continuous non-linear daily compounding to deter contractors from treating civic penalties as negligible operating overheads.

### 3.1 Non-Linear Penalty Formulation

For an incident resolved at timestamp $t_{\text{resolved}}$ with contractual deadline $t_{\text{target}}$ and grace allowance $t_{\text{grace}}$, the elapsed breach duration in decimal days is:

$$\Delta t = \max\left(0, \frac{t_{\text{resolved}} - (t_{\text{target}} + t_{\text{grace}})}{86400\text{ seconds}}\right)$$

When $\Delta t > 0$, the cumulative penalty deduction $\mathcal{P}(\Delta t)$ is computed via the exponential acceleration function:

$$\mathcal{P}(\Delta t) = \min\left(\mathcal{P}_{\max}, P_0 \cdot M_{\text{sev}} \cdot \left( \Delta t + \kappa \cdot (\Delta t)^\gamma \right) \cdot \Omega_{\text{zone}}\right)$$

Where:
- $P_0$: Base daily penalty rate defined in the municipal concession agreement.
- $M_{\text{sev}}$: Civic severity weight multiplier:
  - $M_{\text{sev}} = 1.0$ for Low severity ($S=1$)
  - $M_{\text{sev}} = 1.8$ for Moderate severity ($S=2$)
  - $M_{\text{sev}} = 3.2$ for Critical severity ($S=3$)
- $\gamma$: Escalation exponent ($\gamma = 1.45$), ensuring compounding fiscal drag for multi-day non-performance.
- $\kappa$: Acceleration coefficient ($\kappa = 0.25$).
- $\Omega_{\text{zone}}$: Municipal transit priority multiplier (Arterial Transit Corridor $= 1.5$, Commercial Ward $= 1.25$, Residential Suburb $= 1.0$).
- $\mathcal{P}_{\max}$: Statutory liability ceiling per work order, capped at $25\%$ of the contractor's monthly ward retainer allocation:

$$\mathcal{P}_{\max} = 0.25 \times V_{\text{work\_order\_budget}}$$

### 3.2 Force Majeure & Weather Suspension Gate

Penalty accrual is automatically suspended when localized municipal meteorological stations or IoT rainfall sensors register continuous torrential precipitation ($> 15\text{ mm/hr}$) preventing hot-mix bitumen adhesion or safe trenching operations:

$$\frac{d\mathcal{P}}{dt} = 0 \quad \forall t \in [t_{\text{rain\_start}}, t_{\text{rain\_stop}} + \tau_{\text{dry\_out}}]$$

where $\tau_{\text{dry\_out}} = 14,400\text{ seconds (4 hours)}$.

---

## 4. Contractor Performance Scorecard (CPS) Algorithm

The Contractor Performance Score ($CPS_c \in [0, 100]$) is recalculated on a 30-day rolling basis and exposed on the public dashboard and administrative procurement portals.

### 4.1 Weighted Metric Architecture

$$CPS_c = w_1 \cdot \mathcal{S}_{\text{SLA}} + w_2 \cdot \mathcal{S}_{\text{SSIM}} + w_3 \cdot \mathcal{S}_{\text{FTF}} + w_4 \cdot \mathcal{S}_{\text{CIT}} - \mathcal{D}_{\text{repeat}}$$

| Component | Weight | Metric Description | Mathematical Formulation |
|---|---|---|---|
| **SLA Adherence ($\mathcal{S}_{\text{SLA}}$)** | $w_1 = 0.35$ | Percentage of work orders resolved within $T_{\text{target}}$ | $\frac{N_{\text{on\_time}}}{N_{\text{total}}} \times 100$ |
| **Verification Quality ($\mathcal{S}_{\text{SSIM}}$)** | $w_2 = 0.25$ | Average structural delta score between Before and After proof photos | $\frac{1}{N}\sum_{i=1}^N \min(100, \text{SSIM}_i \times 100)$ |
| **First-Time Fix Rate ($\mathcal{S}_{\text{FTF}}$)** | $w_3 = 0.20$ | Tickets without citizen dispute or reopening within 14 days | $\left(1 - \frac{N_{\text{reopened}}}{N_{\text{resolved}}}\right) \times 100$ |
| **Citizen Upvote Sentiment ($\mathcal{S}_{\text{CIT}}$)** | $w_4 = 0.20$ | Ratio of positive citizen confirmation ratings upon closure | $\frac{N_{\text{positive\_ratings}}}{N_{\text{total\_ratings}}} \times 100$ |
| **Repeat Failure Penalty ($\mathcal{D}_{\text{repeat}}$)** | Deductive | Direct deduction for recurring defects within 25m within 30 days | $5.0 \times N_{\text{recurrent\_failures}}$ |

### 4.2 Regulatory Consequence Tiers

- **$CPS \ge 90$ (Tier-1 Elite)**: Fast-track invoice settlement (T+3 banking days), 5% tender bidding preference in upcoming municipal procurement cycles.
- **$75 \le CPS < 90$ (Tier-2 Standard)**: Standard settlement cycle (T+15 banking days), standard oversight.
- **$60 \le CPS < 75$ (Tier-3 Probationary)**: Mandatory manual physical inspection by Municipal Executive Engineer before invoice clearance; 10% additional escrow retainage.
- **$CPS < 60$ (Tier-4 Disqualified)**: Automated suspension from municipal emergency dispatch roster; formal notice of default issued under Section 145 of the Municipal Corporation Act.

---

## 5. TypeScript System Architecture & Interface Contracts

The contractor scorecard and penalty ledger is implemented using deterministic TypeScript type definitions designed to integrate directly with Next.js API routes and Supabase PostGIS schemas.

```typescript
/**
 * NagrikSetu Contractor SLA & Penalty Engine Types
 * File: src/types/contractorSla.ts
 */

export type MunicipalDepartment = 'PWD' | 'Sanitation' | 'Electrical' | 'WaterSupply';

export type TicketSeverity = 1 | 2 | 3;

export type PenaltyStatus = 'ACCUMULATING' | 'DISPUTED' | 'CONFIRMED' | 'DEDUCTED' | 'WAIVED_FORCE_MAJEURE';

export interface IContractorEntity {
  contractorId: string;
  vendorCode: string; // Official municipal vendor registration (e.g. ULB-VND-2024-884)
  companyName: string;
  assignedWards: string[];
  department: MunicipalDepartment;
  contactEmail: string;
  contactPhone: string;
  escrowAccountNumber: string; // Dedicated municipal holdback escrow
  currentEscrowBalanceINR: number;
  thirtyDayCPS: number; // 0.0 - 100.0
  performanceTier: 'TIER_1_ELITE' | 'TIER_2_STANDARD' | 'TIER_3_PROBATION' | 'TIER_4_SUSPENDED';
  activeWorkOrdersCount: number;
  totalPenaltiesDeductedINR: number;
}

export interface IWorkOrderSLA {
  workOrderId: string;
  ticketId: string;
  contractorId: string;
  wardId: string;
  department: MunicipalDepartment;
  severity: TicketSeverity;
  
  // Geographical Verification Coordinates
  targetCoordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Temporal SLA Milestones
  timestamps: {
    dispatchedAt: string; // ISO 8601
    acceptedAt?: string;
    targetCompletionDeadline: string;
    gracePeriodExpiry: string;
    actualCompletionSubmission?: string;
    verifiedResolutionAt?: string;
  };
  
  // Quality & Verification Gates
  verification: {
    operatorProximityMet: boolean; // Must be <= 100 meters
    measuredDistanceMeters: number;
    ssimConfidenceScore: number; // 0.00 - 1.00
    geminiVisionVerificationPass: boolean;
    sha256ProofHash?: string;
  };
  
  // Financial SLA Ledger
  financials: {
    workOrderValueINR: number;
    basePenaltyRatePerDayINR: number;
    breachDurationDays: number;
    computedPenaltyINR: number;
    penaltyStatus: PenaltyStatus;
    forceMajeureDeductionHours: number;
  };
}

export interface IPenaltyDeductionRecord {
  deductionId: string;
  workOrderId: string;
  contractorId: string;
  calculatedAt: string;
  breachDurationHours: number;
  basePenaltyAmount: number;
  severityMultiplier: number;
  compoundedTotalINR: number;
  pfmsTransactionReference?: string;
  auditorRemarks?: string;
}

export interface IContractorScorecardSummary {
  contractorId: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  totalAssignedWorkOrders: number;
  onTimeCompletions: number;
  overdueCompletions: number;
  slaAdherenceRatePercent: number;
  averageSSIMVerificationScore: number;
  firstTimeFixRatePercent: number;
  citizenApprovalRatePercent: number;
  recurrentDefectDeduction: number;
  compositeScore: number; // Final CPS (0 - 100)
}
```

---

## 6. Mathematical Penalty Computation Implementation

The following reference implementation demonstrates the exact deterministic penalty computation engine deployed within the municipal batch processing microservice.

```typescript
/**
 * Computes the exact compounded penalty for an overdue civic work order.
 */
export function calculateCompoundedPenalty(sla: IWorkOrderSLA): number {
  const targetTime = new Date(sla.timestamps.targetCompletionDeadline).getTime();
  const graceTime = new Date(sla.timestamps.gracePeriodExpiry).getTime();
  const completionTime = sla.timestamps.actualCompletionSubmission
    ? new Date(sla.timestamps.actualCompletionSubmission).getTime()
    : Date.now();

  // If completed within target deadline or grace period, zero penalty
  if (completionTime <= graceTime) {
    return 0;
  }

  // Calculate net overdue duration in decimal days, adjusting for force majeure
  const grossBreachMs = completionTime - graceTime;
  const forceMajeureMs = (sla.financials.forceMajeureDeductionHours || 0) * 3600 * 1000;
  const netBreachMs = Math.max(0, grossBreachMs - forceMajeureMs);
  const deltaDays = netBreachMs / (86400 * 1000);

  if (deltaDays === 0) {
    return 0;
  }

  // Severity Weight Multiplier (M_sev)
  const severityMultipliers: Record<TicketSeverity, number> = {
    1: 1.0,
    2: 1.8,
    3: 3.2,
  };
  const mSev = severityMultipliers[sla.severity] || 1.0;

  // Compounding parameters
  const gamma = 1.45; // Escalation exponent
  const kappa = 0.25; // Acceleration coefficient
  const p0 = sla.financials.basePenaltyRatePerDayINR;

  // Compounding formula: P = P_0 * M_sev * (deltaDays + kappa * deltaDays^gamma)
  const accelerationTerm = deltaDays + kappa * Math.pow(deltaDays, gamma);
  const rawPenalty = p0 * mSev * accelerationTerm;

  // Maximum statutory liability ceiling: 25% of total work order budget
  const maxLiability = sla.financials.workOrderValueINR * 0.25;

  return Math.min(Math.round(rawPenalty * 100) / 100, maxLiability);
}
```

---

## 7. Public Financial Management System (PFMS) Settlement Protocol

When penalties are validated through the zero-trust proof-of-work pipeline, the engine produces an immutable XML/JSON debit advice transmitted directly to the municipal treasury's PFMS integration bus.

### 7.1 Electronic Debit Advice Schema (E-DA)

```json
{
  "header": {
    "messageType": "MUNICIPAL_ESCROW_DEBIT_ADVICE",
    "specificationVersion": "2.4",
    "timestamp": "2026-11-07T03:45:00.000Z",
    "issuingAuthority": "NAGRIKSETU_ULB_TREASURY_GATEWAY"
  },
  "debitDetails": {
    "vendorCode": "ULB-VND-2024-884",
    "contractorName": "Apex Infra Maintenance Ltd.",
    "escrowAccountId": "ESC-908234-MUNI-01",
    "ticketId": "TKT-202611-0941",
    "workOrderId": "WO-PWD-2026-4401",
    "wardId": "ward-07-central",
    "category": "Road Hazard / Pothole",
    "slaDeadline": "2026-11-05T12:00:00.000Z",
    "completionTimestamp": "2026-11-06T18:30:00.000Z",
    "overdueDays": 1.27,
    "penaltyDeductionINR": 5840.50,
    "statutoryCapApplied": false,
    "cryptographicAuditDigest": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

---

## 8. Contractor Dispute Arbitration Workflow

To safeguard against wrongful deductions while maintaining zero-trust integrity, contractors possess a **48-hour formal arbitration window**:

```
+----------------------------------------------------------------------------------------------------+
|                                    Arbitration Lifecycle                                           |
|                                                                                                    |
|  [Penalty Triggered]                                                                               |
|          |                                                                                         |
|          v                                                                                         |
|  [Notice Issued via SMS/Email/Dashboard]                                                           |
|          |                                                                                         |
|          +--------------------------------------------+                                            |
|          | Contractor Accepts / Window Expires        | Contractor Disputes within 48h             |
|          v                                            v                                            |
|  [Automatic Escrow Deduction via PFMS]       [Ground-Truth Evidence Submission]                    |
|                                                       |                                            |
|                                                       v                                            |
|                                              [Independent Verification]                            |
|                                              - Autonomous UAV Orthomosaic Flight                   |
|                                              - Municipal Engineer Spot Audit Inspection            |
|                                                       |                                            |
|                                                       +--------------------+                       |
|                                                       | Claim Upheld       | Claim Rejected        |
|                                                       v                    v                       |
|                                              [Penalty Waived]      [Penalty Deducted + 10% Surcharge]
+----------------------------------------------------------------------------------------------------+
```

1. **Automated Notification**: Upon resolution upload that breaches $T_{\text{target}} + T_{\text{grace}}$, an automated notice with exact calculation breakdown is pushed to the contractor's dashboard.
2. **Ground-Truth Dispute Docket**: The contractor may submit timestamped telemetry or certified police/traffic obstruction orders justifying delays.
3. **Frivolous Dispute Deterrent**: If an independent drone flight or inspector spot-check verifies that the repair remained incomplete despite the contractor's protest, an additional **10% administrative surcharge** is added to the penalty.

---

## 9. Conclusion

The **NagrikSetu Automated Municipal Contractor Performance Scorecard & Penalty Deduction Engine** closes the loop between citizen grievances, field execution, and municipal treasury disbursements. By digitizing contract enforcement and eliminating manual discretion, urban local bodies can achieve guaranteed accountability, eliminate ghost completions, and dramatically accelerate civic repair timelines.
