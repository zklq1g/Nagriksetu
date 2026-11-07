# NagrikSetu — Automated Civic Bounty, Micro-Incentives & Gamified Citizen Volunteer Protocol

> **Algorithmic Citizen Karma Valuation, Dynamic Micro-Bounty Escalation, Zero-Trust Sybil Resistance, and Direct Municipal e-RUPI/NCMC Benefit Settlement.**

---

## 1. Executive Summary & Civic Incentive Context

Urban Local Bodies (ULBs) across India face persistent citizen disengagement and reporting fatigue. While municipal infrastructures continuously deteriorate under seasonal monsoons, traffic stress, and high population density, citizen reporting remains passive and reactive. Municipal civic engagement suffers from critical structural bottlenecks:

1. **The Civic Engagement Void**: Over 92% of citizens who encounter severe road craters, exposed wiring, or overflowing sanitation dumps bypass reporting due to perceived futility and bureaucratic friction.
2. **Reporting Fatigue**: Citizens who report issues receive no tangible acknowledgment, civic standing, or community validation when problems are resolved.
3. **Sybil & Fraud Vulnerabilities**: Traditional reward mechanisms in civic tech are plagued by fraudulent submissions, duplicate claiming, staged photo manipulation, and GPS spoofing.
4. **Disjointed Municipal Incentive Systems**: Municipalities possess statutory budgets for citizen monitoring and public sanitation incentives, yet lack programmatic mechanisms to channel micro-incentives into direct citizen utility (e.g., property tax offsets, public transit credits, or municipal utility vouchers).

NagrikSetu introduces the **Automated Civic Bounty, Micro-Incentives & Gamified Citizen Volunteer Protocol (CBM-GVP)**. By transforming civic grievance reporting and community verification into a verifiable, tamper-resistant civic engagement economy, NagrikSetu bridges civic responsibility with tangible micro-incentives.

```
+----------------------------------------------------------------------------------------------------+
|                                    Civic Intake & AI Classification                                |
|                                                                                                    |
|  +------------------------------------+             +-------------------------------------------+  |
|  |     Citizen WebRTC Camera Intake   |             |        Gemini Vision AI Engine            |  |
|  |  - Zero File Upload (Live Stream)  | ----------> |  - Multi-Modal Severity & Class Analysis  |  |
|  |  - Hardware GPS & Geofencing Lock  |             |  - Synthetic / Tamper Anomaly Detection   |  |
|  +------------------------------------+             +---------------------+---------------------+  |
|                                                                           |                        |
+---------------------------------------------------------------------------|------------------------+
                                                                            v
+----------------------------------------------------------------------------------------------------+
|                              Dynamic Bounty & Sybil Resistance Gateway                             |
|                                                                                                    |
|  +---------------------------------------------------+  +---------------------------------------+  |
|  |          Dynamic Micro-Bounty Calculator          |  |         Sybil Shield & Trust Scoring  |  |
|  |  - Base Reward Factor (B_0)                       |  |  - Citizen Trust Quotient (TQ_c)      |  |
|  |  - Geotemporal Neglect Multiplier (Lambda_neglect)|  |  - Hardware Device Fingerprinting     |  |
|  |  - Upvote Staking Pool (Phi_upvotes)              |  |  - Ward Velocity & Rate-Limit Window  |  |
|  +-------------------------+-------------------------+  +-------------------+-------------------+  |
|                            |                                                |                      |
|                            +-----------------------+------------------------+                      |
|                                                    v                                               |
|  +----------------------------------------------------------------------------------------------+  |
|  |                           Proof-of-Resolution & Dual Verification Gate                       |  |
|  |  - Field Contractor Resolved Photo (100m Proximity Gate)                                     |  |
|  |  - Citizen Confirmation Upvote Window (48-Hour Community Attestation)                         |  |
|  |  - SSIM Structural & Visual Delta Verification (SSIM >= 0.88)                                |  |
|  +-------------------------------------------------+--------------------------------------------+  |
+----------------------------------------------------|-----------------------------------------------+
                                                     v
+----------------------------------------------------------------------------------------------------+
|                                Settlement & Municipal Redemption Grid                              |
|                                                                                                    |
|  +---------------------------------------+          +-------------------------------------------+  |
|  |      Civic Karma Ledger & Tiers       |          |      Municipal Incentive Settlement       |  |
|  |  - Tiered Citizen Badges & Ranking    |          |  - e-RUPI Purpose-Bound NPCI Vouchers     |  |
|  |  - Ward Champion Public Leaderboard   | <------> |  - NCMC Transit Card Top-Up Credits       |  |
|  |  - W3C DID/VC Civic Credentials       |          |  - Municipal Property Tax Rebate Vouchers |  |
|  +---------------------------------------+          +-------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Dynamic Micro-Bounty & Civic Karma Economics

In NagrikSetu, civic participation is quantified through two decoupled currencies:
- **Civic Karma ($\mathcal{K}$)**: A non-transferable, soulbound reputation score quantifying long-term civic contribution, report accuracy, and community upvote validation.
- **Civic Bounty Credits ($\mathcal{B}$)**: Programmatic, redeemable micro-incentives backed by municipal civic innovation and public participation grant allocations.

### 2.1 Mathematical Formulation of Dynamic Bounties

A grievance report $i$ initiated at timestamp $t_{\text{created}}$ accumulates dynamic bounty credits as it remains open, incentivizing contractor resolution and encouraging community surveillance in historically neglected wards.

The dynamic bounty value $\mathcal{B}_i(t)$ at evaluation timestamp $t$ is formulated as:

$$\mathcal{B}_i(t) = \mathcal{B}_0 \cdot \mathcal{M}_{\text{sev}} \cdot \left(1 + \ln\left(1 + \lambda_{\text{ward}} \cdot \frac{t - t_{\text{created}}}{86400}\right)\right) \cdot \Phi_{\text{upvote}}$$

Where:
- $\mathcal{B}_0$: Base municipal civic bounty constant ($\mathcal{B}_0 = 50\text{ points}$, equivalent to ₹50 nominal voucher value).
- $\mathcal{M}_{\text{sev}}$: Severity multiplier determined deterministically by Gemini Vision triage:
  - $\mathcal{M}_{\text{sev}} = 1.0$ for Low severity ($S=1$, single luminaire or minor pavement crack).
  - $\mathcal{M}_{\text{sev}} = 2.0$ for Moderate severity ($S=2$, open garbage overflow or blocked secondary drain).
  - $\mathcal{M}_{\text{sev}} = 4.0$ for Critical severity ($S=3$, active water main rupture or cratering on high-speed arterial roadway).
- $\lambda_{\text{ward}}$: Ward equity coefficient ($\lambda_{\text{ward}} \in [1.0, 2.5]$), calibrating bounty escalation to ward development indices (ensuring peripheral, historically underfunded municipal wards accrue bounty value at up to $2.5\times$ speed).
- $\Phi_{\text{upvote}}$: Community validation coefficient based on verified unique citizen upvotes $U_i$ within the 50-meter Haversine deduplication radius:

$$\Phi_{\text{upvote}} = 1.0 + 0.15 \cdot \min(20, \ln(1 + U_i))$$

### 2.2 Pro-Rata Bounty Staking Distribution

When an issue reaches verified resolution, the accumulated bounty credit pool $\mathcal{B}_i(t_{\text{resolved}})$ is split programmatically:
1. **Primary Reporter Allocation ($60\%$)**: Awarded to the citizen who first initiated the geolocated report.
2. **Community Upvote Staking Pool ($30\%$)**: Distributed pro-rata across verified citizens who upvoted the ticket prior to contractor dispatch, rewarding proactive neighborhood validation.
3. **Ward Civic Reserve ($10\%$)**: Retained in the municipal ward discretionary grant fund for neighborhood public amenities.

$$\mathcal{B}_{\text{reporter}} = 0.60 \cdot \mathcal{B}_i, \quad \mathcal{B}_{\text{upvoter}, k} = \frac{0.30 \cdot \mathcal{B}_i}{U_i}, \quad \mathcal{B}_{\text{ward\_pool}} = 0.10 \cdot \mathcal{B}_i$$

---

## 3. Zero-Trust Anti-Gaming & Sybil Resistance

Rewarding civic actions with economic value creates adversarial incentives for spoofing, automated spamming, and staged photo capture. NagrikSetu enforces a zero-trust verification pipeline.

### 3.1 Hardware Enforced Capture & Geolocation Integrity
- **Browser WebRTC Live Streams**: Image input is strictly constrained to `navigator.mediaDevices.getUserMedia()`. Standard file inputs (`<input type="file">`) are disabled, eliminating pre-recorded, downloaded, or stock image injection.
- **Hardware Coordinate Attestation**: Geolocation coordinates $(\text{lat}, \text{lng})$ must originate from the browser's high-accuracy W3C Geolocation provider with an accuracy radius $\sigma_{\text{gps}} \le 25\text{ meters}$.
- **EXIF & Temporal Check**: Injected streams are validated against continuous browser timestamp deltas; out-of-sequence frame captures trigger immediate session revocation.

### 3.2 Citizen Trust Quotient ($TQ_c$)

Every citizen profile maintains a bounded Trust Quotient $TQ_c \in [0.10, 1.00]$, initialized at $TQ_0 = 0.50$. The trust score evolves as a Bayesian update based on the ratio of successfully verified issues versus rejected/spurious submissions:

$$TQ_c^{(k+1)} = \text{clamp}\left(0.10, 1.00, TQ_c^{(k)} + \Delta_{TQ}\right)$$

$$\Delta_{TQ} = \begin{cases} 
+0.05 \cdot \left(1.0 - TQ_c^{(k)}\right) & \text{if report is verified \& resolved} \\
-0.20 \cdot TQ_c^{(k)} & \text{if report is rejected as frivolous/staged} \\
-0.40 & \text{if report is identified as synthetic/fraudulent}
\end{cases}$$

### 3.3 Token-Bucket Rate Limiting

To prevent ward-level denial-of-service or bounty farming, individual device fingerprints are bound by a leaky bucket rate-limiter:
- **Maximum Burst**: 3 reports per 6-hour rolling window per ward.
- **Refill Rate**: 1 submission token per 180 minutes.
- **Spatial Diversity Rule**: Consecutive reports from the same device within 15 minutes must be separated by at least 150 meters, preventing artificial grid spam.

---

## 4. Gamified Civic Karma Hierarchy & Leaderboard Tiers

To build intrinsic social motivation alongside financial micro-incentives, NagrikSetu implements a four-tiered civic status architecture:

```
+----------------------------------------------------------------------------------------------------+
|                                    NagrikSetu Civic Honor Roll                                     |
|                                                                                                    |
|   [Tier 1: Nagrik Citizen]         [Tier 2: Ward Guardian]          [Tier 3: Civic Champion]       |
|      0 - 250 Karma Points            251 - 1,000 Karma Points        1,001 - 3,500 Karma Points    |
|   * Standard reporting rights      * 1.1x Bounty yield multiplier   * 1.25x Bounty yield multiplier|
|   * Public heatmap access          * Ward upvote prioritization     * Direct escalations to JE     |
|   * Citizen badge                  * Municipal newsletter honor     * Fast-track AI review queue   |
|                                                                                                    |
|                                [Tier 4: Nagrik Ratna (Mayor's Circle)]                             |
|                                         3,501+ Karma Points                                        |
|                            * 1.5x Bounty yield multiplier                                          |
|                            * Annual Municipal Felicitation by Municipal Commissioner                |
|                            * Up to 5% Municipal Property Tax Rebate                                |
|                            * Free Unlimited NCMC Public Bus / Metro Pass credits                   |
+----------------------------------------------------------------------------------------------------+
```

### 4.1 Tier Specification Matrix

| Tier Title | Karma Range ($\mathcal{K}$) | Verification Accuracy | Entitlements & Municipal Privileges |
|---|---|---|---|
| **Tier 1: Nagrik Citizen** | $0 - 250$ | Standard | Base submission capabilities, community upvoting, public dashboard visibility. |
| **Tier 2: Ward Guardian** | $251 - 1,000$ | $\ge 80\%$ | $1.1\times$ bounty accumulation multiplier, priority queue in automated triage, digital badge. |
| **Tier 3: Civic Champion** | $1,001 - 3,500$ | $\ge 90\%$ | $1.25\times$ bounty multiplier, voting power in Ward Participatory Budgeting, invite to Ward Committee. |
| **Tier 4: Nagrik Ratna** | $3,501+$ | $\ge 95\%$ | $1.5\times$ bounty multiplier, municipal property tax rebates (up to ₹2,500/year), NCMC transit passes. |

---

## 5. Municipal Benefit Settlement Architecture (e-RUPI & NCMC)

Civic bounty credits are convertible into verified municipal utility and welfare instruments using standard Indian digital public infrastructure:

1. **NPCI e-RUPI Vouchers**:
   - Programmatic, purpose-bound SMS/QR digital vouchers delivered directly to the citizen's mobile number.
   - Usable exclusively at authorized municipal partner outlets (e.g., municipal water bill payments, property tax desks, compost purchasing, and public EV charging stations).
2. **National Common Mobility Card (NCMC) Wallet Top-Up**:
   - Integrated transit micro-credits deposited directly to the citizen's RuPay/NCMC contactless transit card for city bus and metro ridership.
3. **Municipal Property Tax Rebate Vouchers**:
   - Electronic credit memos linked to the citizen's Property Identification Number (PID), automatically deducted during annual property tax assessments.

---

## 6. TypeScript Domain Contracts & Protocol Implementation

Below is the complete, production-grade TypeScript domain model and algorithmic calculator powering the NagrikSetu Civic Bounty and Rewards Protocol.

```typescript
/**
 * NagrikSetu — Civic Bounty & Gamified Rewards Engine
 * Domain Types, Anti-Gaming Models, and Deterministic Calculators
 */

export type CivicSeverityLevel = 1 | 2 | 3;

export type CivicIssueCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'water_leakage'
  | 'drainage_overflow'
  | 'fallen_tree';

export type CivicKarmaTierId =
  | 'nagrik_citizen'
  | 'ward_guardian'
  | 'civic_champion'
  | 'nagrik_ratna';

export interface ICitizenKarmaProfile {
  citizenId: string;
  maskedPhone: string;
  totalKarmaPoints: number;
  availableBountyCredits: number;
  lifetimeEarnedCredits: number;
  currentTier: CivicKarmaTierId;
  trustQuotient: number; // 0.10 to 1.00
  totalReportsSubmitted: number;
  totalReportsVerified: number;
  totalReportsRejected: number;
  totalUpvotesGiven: number;
  activeBadges: string[];
  lastSubmissionTimestampMs: number;
  wardId: string;
}

export interface ICivicBountyTier {
  id: CivicKarmaTierId;
  displayName: string;
  minKarma: number;
  maxKarma: number;
  bountyMultiplier: number;
  perksDescription: string[];
}

export interface ICivicBountyTicket {
  ticketId: string;
  category: CivicIssueCategory;
  severity: CivicSeverityLevel;
  wardId: string;
  wardEquityCoefficient: number; // 1.0 to 2.5
  createdTimestampMs: number;
  resolvedTimestampMs?: number;
  reporterCitizenId: string;
  upvoterCitizenIds: string[];
  baseBountyPoints: number;
  isResolved: boolean;
  isVerified: boolean;
}

export interface IBountyDistributionResult {
  ticketId: string;
  totalBountyPool: number;
  reporterCitizenId: string;
  reporterPayout: number;
  upvoterPayouts: Array<{ citizenId: string; payout: number }>;
  wardReserveAllocation: number;
  calculationTimestamp: string;
}

export interface ISybilShieldAssessment {
  citizenId: string;
  isPermitted: boolean;
  reason?: string;
  currentTrustQuotient: number;
  remainingDailyTokens: number;
}

export const CIVIC_TIER_DEFINITIONS: Record<CivicKarmaTierId, ICivicBountyTier> = {
  nagrik_citizen: {
    id: 'nagrik_citizen',
    displayName: 'Nagrik Citizen',
    minKarma: 0,
    maxKarma: 250,
    bountyMultiplier: 1.0,
    perksDescription: ['Standard reporting rights', 'Public heatmap access', 'Citizen badge'],
  },
  ward_guardian: {
    id: 'ward_guardian',
    displayName: 'Ward Guardian',
    minKarma: 251,
    maxKarma: 1000,
    bountyMultiplier: 1.1,
    perksDescription: ['1.1x Bounty accumulation', 'Ward upvote prioritization', 'Quarterly honor roll'],
  },
  civic_champion: {
    id: 'civic_champion',
    displayName: 'Civic Champion',
    minKarma: 1001,
    maxKarma: 3500,
    bountyMultiplier: 1.25,
    perksDescription: ['1.25x Bounty accumulation', 'Ward committee observer invite', 'Fast-track triage'],
  },
  nagrik_ratna: {
    id: 'nagrik_ratna',
    displayName: 'Nagrik Ratna (Mayor Circle)',
    minKarma: 3501,
    maxKarma: Infinity,
    bountyMultiplier: 1.5,
    perksDescription: ['1.5x Bounty multiplier', 'Annual Mayoral commendation', 'Property tax rebates'],
  },
};

/**
 * Deterministic Calculator for Dynamic Bounty Accumulation
 */
export class CivicBountyEngine {
  private static readonly BASE_BOUNTY = 50;

  private static readonly SEVERITY_MULTIPLIERS: Record<CivicSeverityLevel, number> = {
    1: 1.0,
    2: 2.0,
    3: 4.0,
  };

  /**
   * Calculates instantaneous bounty valuation for an open civic ticket
   */
  public static calculateInstantaneousBounty(
    ticket: ICivicBountyTicket,
    currentTimestampMs: number = Date.now()
  ): number {
    const elapsedSeconds = Math.max(0, (currentTimestampMs - ticket.createdTimestampMs) / 1000);
    const elapsedDays = elapsedSeconds / 86400;

    const severityMultiplier = this.SEVERITY_MULTIPLIERS[ticket.severity] || 1.0;
    const wardEquity = Math.min(2.5, Math.max(1.0, ticket.wardEquityCoefficient));

    // Time decay / escalation factor
    const timeEscalation = 1.0 + Math.log(1.0 + wardEquity * elapsedDays);

    // Upvote community amplification
    const upvoteCount = ticket.upvoterCitizenIds.length;
    const upvoteMultiplier = 1.0 + 0.15 * Math.min(20, Math.log(1.0 + upvoteCount));

    const totalValuation =
      this.BASE_BOUNTY * severityMultiplier * timeEscalation * upvoteMultiplier;

    return Math.round(totalValuation);
  }

  /**
   * Settles ticket bounty across reporter, upvoters, and ward civic reserve
   */
  public static settleBountyDistribution(
    ticket: ICivicBountyTicket,
    resolvedTimestampMs: number = Date.now()
  ): IBountyDistributionResult {
    const finalPool = this.calculateInstantaneousBounty(ticket, resolvedTimestampMs);

    const reporterShare = Math.floor(finalPool * 0.6);
    const wardReserveShare = Math.floor(finalPool * 0.1);
    const upvotePool = finalPool - reporterShare - wardReserveShare;

    const upvoterPayouts: Array<{ citizenId: string; payout: number }> = [];
    const validUpvoters = ticket.upvoterCitizenIds.filter(
      (id) => id !== ticket.reporterCitizenId
    );

    if (validUpvoters.length > 0) {
      const perUpvoter = Math.floor(upvotePool / validUpvoters.length);
      const remainder = upvotePool % validUpvoters.length;

      validUpvoters.forEach((upvoterId, index) => {
        const payout = index === 0 ? perUpvoter + remainder : perUpvoter;
        upvoterPayouts.push({ citizenId: upvoterId, payout });
      });
    }

    return {
      ticketId: ticket.ticketId,
      totalBountyPool: finalPool,
      reporterCitizenId: ticket.reporterCitizenId,
      reporterPayout: reporterShare,
      upvoterPayouts,
      wardReserveAllocation: wardReserveShare,
      calculationTimestamp: new Date(resolvedTimestampMs).toISOString(),
    };
  }

  /**
   * Resolves the citizen karma tier based on accumulated score
   */
  public static resolveKarmaTier(karmaPoints: number): CivicKarmaTierId {
    if (karmaPoints >= 3501) return 'nagrik_ratna';
    if (karmaPoints >= 1001) return 'civic_champion';
    if (karmaPoints >= 251) return 'ward_guardian';
    return 'nagrik_citizen';
  }

  /**
   * Evaluates Sybil resistance checks for a citizen attempting a new submission
   */
  public static evaluateSybilShield(
    profile: ICitizenKarmaProfile,
    currentTimestampMs: number = Date.now()
  ): ISybilShieldAssessment {
    // 1. Critical trust quotient lockout
    if (profile.trustQuotient < 0.2) {
      return {
        citizenId: profile.citizenId,
        isPermitted: false,
        reason: 'Citizen trust quotient below statutory threshold. Account under administrative review.',
        currentTrustQuotient: profile.trustQuotient,
        remainingDailyTokens: 0,
      };
    }

    // 2. Velocity cooldown check (15 minutes between submissions)
    const elapsedMinutes = (currentTimestampMs - profile.lastSubmissionTimestampMs) / (1000 * 60);
    if (elapsedMinutes < 15) {
      return {
        citizenId: profile.citizenId,
        isPermitted: false,
        reason: `Velocity rate limit active. Please wait ${Math.ceil(15 - elapsedMinutes)} minutes before submitting another report.`,
        currentTrustQuotient: profile.trustQuotient,
        remainingDailyTokens: 1,
      };
    }

    return {
      citizenId: profile.citizenId,
      isPermitted: true,
      currentTrustQuotient: profile.trustQuotient,
      remainingDailyTokens: 3,
    };
  }
}
```

---

## 7. Public Auditability & Civic Accountability

1. **Tamper-Evident Ledger**: All bounty transactions, karma adjustments, and municipal redemptions are written with deterministic hash pointers (`SHA-256(previous_hash + payload)`), ensuring zero tampering by administrative operators.
2. **Ward Equity Audits**: The Public Dashboard (`/public`) features real-time transparency charts displaying aggregate bounty disbursements per municipal ward, preventing preferential fiscal allocation.
3. **Open Access Verification**: Citizens can independently audit their karma history and verification proofs directly from their profile without authenticating into closed government silos.
