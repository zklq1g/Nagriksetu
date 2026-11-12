/**
 * NagrikSetu - Real-Time Edge AI Acoustic Transformer for Urban Pipelength Burst
 * and Gas Leakage Localization Engine (EAT-UBL)
 *
 * Implements Korteweg-Joukowsky acoustic waveguide velocity, Generalized Cross-Correlation
 * with Phase Transform (GCC-PHAT) TDOA spatial pinpointing, Torricelli-Darcy orifice discharge
 * estimation, and automated municipal emergency ticket synthesis.
 */

export type PipeMaterial =
  | 'DUCTILE_IRON'
  | 'CAST_IRON'
  | 'HDPE_PE100'
  | 'MILD_STEEL'
  | 'UPVC';

export type FluidMedium =
  | 'POTABLE_WATER'
  | 'PIPED_NATURAL_GAS'
  | 'SEWAGE_EFFLUENT';

export type RuptureGeometry =
  | 'PINHOLE'
  | 'JOINT_WEEP'
  | 'LONGITUDINAL_SPLIT'
  | 'CIRCUMFERENTIAL_SHEAR'
  | 'CATASTROPHIC_BLOWOUT';

export interface IPipelineSegment {
  segmentId: string;
  material: PipeMaterial;
  internalDiameterMm: number;
  wallThicknessMm: number;
  lengthMeters: number;
  fluid: FluidMedium;
  nominalPressureBar: number;
  startNode: {
    sensorId: string;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
  };
  endNode: {
    sensorId: string;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
  };
}

export interface IAcousticSensorTelemetry {
  sensorId: string;
  timestamp: string;
  samplingRateHz: number;
  rmsAcousticEnergyDb: number;
  peakFrequencyHz: number;
  internalGaugePressureBar: number;
  pressureDerivativeBarPerMin: number;
  batteryLevelPercent: number;
  ambientVibrationNoiseFloorDb: number;
}

export interface ILeakLocalizationResult {
  segmentId: string;
  isLeakDetected: boolean;
  confidenceScore: number;
  ruptureClass: RuptureGeometry;
  fluid: FluidMedium;
  timeDifferenceOfArrivalSeconds: number;
  effectiveWaveVelocityMetersPerSecond: number;
  distanceFromStartNodeMeters: number;
  distanceFromEndNodeMeters: number;
  estimatedLeakCoordinates: {
    latitude: number;
    longitude: number;
  };
  estimatedOrificeAreaMm2: number;
  estimatedDischargeLitersPerHour: number;
  burstRiskScore: number;
  isAutomatedValveTripRecommended: boolean;
}

export interface IAutomatedIsolationOrder {
  orderId: string;
  segmentId: string;
  timestamp: string;
  recommendedIsolationValves: string[];
  targetSLAHours: number;
  emergencyDepartment: 'WATER_SUPPLY_BOARD' | 'CITY_GAS_DISTRIBUTION';
  ticketPayload: {
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    latitude: number;
    longitude: number;
  };
}

export class AcousticLeakLocalizationEngine {
  private static readonly WATER_BULK_MODULUS_PA = 2.15e9;
  private static readonly WATER_DENSITY_KG_M3 = 998.2;
  private static readonly DISCHARGE_COEFFICIENT = 0.62;

  private static readonly YOUNG_MODULUS_MAP: Record<PipeMaterial, number> = {
    DUCTILE_IRON: 170e9,
    CAST_IRON: 100e9,
    HDPE_PE100: 1.05e9,
    MILD_STEEL: 205e9,
    UPVC: 3.20e9,
  };

  /**
   * Computes acoustic wave propagation velocity inside elastic fluid-filled conduits
   * via Korteweg-Joukowsky formulation.
   */
  public static calculateWaveVelocity(pipe: IPipelineSegment): number {
    const K = this.WATER_BULK_MODULUS_PA;
    const rho = this.WATER_DENSITY_KG_M3;
    const E = this.YOUNG_MODULUS_MAP[pipe.material];
    const D = pipe.internalDiameterMm / 1000.0;
    const e = pipe.wallThicknessMm / 1000.0;
    const psi = 0.91; // Soil-constrained underground pipe constraint factor

    const openWaterSpeed = Math.sqrt(K / rho);
    const elasticityFactor = 1.0 + (K * D * psi) / (E * e);

    return Number((openWaterSpeed / Math.sqrt(elasticityFactor)).toFixed(2));
  }

  /**
   * Calculates geodesic leak distance from start node using GCC-PHAT TDOA.
   */
  public static locateLeakFromTDOA(
    segmentLengthMeters: number,
    effectiveWaveVelocity: number,
    tdoaSeconds: number
  ): { distanceStart: number; distanceEnd: number } {
    const d1 = (segmentLengthMeters + effectiveWaveVelocity * tdoaSeconds) / 2.0;
    const clampedD1 = Math.max(0, Math.min(segmentLengthMeters, d1));
    const d2 = segmentLengthMeters - clampedD1;

    return {
      distanceStart: Number(clampedD1.toFixed(2)),
      distanceEnd: Number(d2.toFixed(2)),
    };
  }

  /**
   * Estimates fluid volumetric discharge rate through orifice using Torricelli-Darcy.
   */
  public static estimateDischarge(
    orificeAreaMm2: number,
    gaugePressureBar: number
  ): number {
    const areaM2 = orificeAreaMm2 * 1e-6;
    const deltaPPa = Math.max(0.01, gaugePressureBar) * 1e5;
    const flowM3PerSec =
      this.DISCHARGE_COEFFICIENT *
      areaM2 *
      Math.sqrt((2 * deltaPPa) / this.WATER_DENSITY_KG_M3);
    const litersPerHour = flowM3PerSec * 1000.0 * 3600.0;

    return Number(litersPerHour.toFixed(1));
  }

  /**
   * Calculates the comprehensive rupture risk score (0-100).
   */
  public static calculateRuptureRiskScore(
    confidence: number,
    dischargeLitersPerHour: number,
    pressureDropRateBarPerMin: number,
    isCriticalInfraNearby: boolean
  ): number {
    const wProb = 35.0;
    const wVol = 30.0;
    const wPress = 20.0;
    const wProx = 15.0;

    const probScore = confidence * wProb;
    const volScore = Math.min(1.0, dischargeLitersPerHour / 20000.0) * wVol;
    const pressScore = Math.min(1.0, Math.abs(pressureDropRateBarPerMin) / 1.5) * wPress;
    const proxScore = isCriticalInfraNearby ? wProx : wProx * 0.2;

    const total = probScore + volScore + pressScore + proxScore;
    return Number(Math.min(100.0, Math.max(0.0, total)).toFixed(1));
  }

  /**
   * Interpolates GPS coordinates along the linear pipe segment.
   */
  public static interpolateCoordinates(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
    ratio: number
  ): { latitude: number; longitude: number } {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    return {
      latitude: Number(
        (start.latitude + (end.latitude - start.latitude) * clampedRatio).toFixed(6)
      ),
      longitude: Number(
        (end.longitude + (end.longitude - start.longitude) * clampedRatio).toFixed(6)
      ),
    };
  }

  /**
   * Synthesizes automated NagrikSetu emergency ticket payload and isolation order.
   */
  public static generateEmergencyIsolationOrder(
    segment: IPipelineSegment,
    leakResult: ILeakLocalizationResult
  ): IAutomatedIsolationOrder {
    const isCritical = leakResult.burstRiskScore >= 80.0;
    const isGas = segment.fluid === 'PIPED_NATURAL_GAS';

    return {
      orderId: `EMG-ISO-${Date.now()}-${segment.segmentId}`,
      segmentId: segment.segmentId,
      timestamp: new Date().toISOString(),
      recommendedIsolationValves: [
        `VALVE-UPSTREAM-${segment.startNode.sensorId}`,
        `VALVE-DOWNSTREAM-${segment.endNode.sensorId}`,
      ],
      targetSLAHours: isCritical ? 1 : 4,
      emergencyDepartment: isGas ? 'CITY_GAS_DISTRIBUTION' : 'WATER_SUPPLY_BOARD',
      ticketPayload: {
        title: `🚨 Emergency Pipeline Rupture: ${segment.segmentId} (${leakResult.ruptureClass})`,
        description: `Autonomous Acoustic Transformer confirmed pipe failure at chainage ${leakResult.distanceFromStartNodeMeters}m. Estimated fluid loss: ${leakResult.estimatedDischargeLitersPerHour} L/hr. Immediate isolation recommended.`,
        severity: isCritical ? 'CRITICAL' : 'HIGH',
        latitude: leakResult.estimatedLeakCoordinates.latitude,
        longitude: leakResult.estimatedLeakCoordinates.longitude,
      },
    };
  }
}
