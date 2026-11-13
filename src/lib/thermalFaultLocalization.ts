/**
 * NagrikSetu - Autonomous AI-Guided Radiometric Thermal Computer Vision for
 * Subterranean Electrical Conduit & Transformer Hotspot Fault Localization (ARTI-ECF)
 *
 * Implements Stefan-Boltzmann radiometric temperature calibration with atmospheric
 * and emissivity compensation, steady-state Fourier subterranean heat diffusion modeling,
 * NETA MTS-2023 / IEEE 738 thermal gradient severity classification, and automated
 * DISCOM SCADA emergency dispatch ticket generation.
 */

export type ElectricalAssetType =
  | 'UNDERGROUND_11KV_CABLE_JOINT'
  | 'UNDERGROUND_33KV_FEEDER_TRUNK'
  | 'PAD_MOUNTED_DISTRIBUTION_TRANSFORMER'
  | 'COMPACT_SUBSTATION_RMU'
  | 'ROADSIDE_FEEDER_PILLAR'
  | 'SUBTERRANEAN_CABLE_TRENCH';

export type ThermalFaultClassification =
  | 'NOMINAL_OPERATING'
  | 'RESISTIVE_JOINT_OVERHEATING'
  | 'DIELECTRIC_INSULATION_BREAKDOWN'
  | 'TRANSFORMER_BUSHING_DEGRADATION'
  | 'PHASE_IMBALANCE_OVERLOAD'
  | 'SUBTERRANEAN_CABLE_FIRE_IMMINENT';

export type NETASeverityGrade =
  | 'CLASS_1_MINOR'      // 1-10°C delta over reference/ambient
  | 'CLASS_2_MODERATE'   // 11-20°C delta: Repair during next scheduled maintenance
  | 'CLASS_3_SEVERE'     // 21-40°C delta: Repair required promptly
  | 'CLASS_4_CRITICAL';  // >40°C delta or >90°C absolute: Immediate emergency isolation

export interface IElectricalAssetMetadata {
  assetId: string;
  assetType: ElectricalAssetType;
  feederIdentifier: string;
  operatingVoltageKv: number;
  ratedCurrentAmperes: number;
  nominalDepthMeters: number; // Subterranean burial depth (0 for surface assets)
  installationDate: string;
  insulationType: 'XLPE' | 'PILC' | 'EPR' | 'OIL_IMPREGNATED';
  surroundingMedium: 'DRY_SAND' | 'COMPACTED_SOIL' | 'ASPHALT_PAVEMENT' | 'CONCRETE_DUCT';
  geographicLocation: {
    latitude: number;
    longitude: number;
    elevationMeters: number;
  };
  connectedSubstationId: string;
}

export interface IRadiometricSensorReading {
  sensorId: string;
  timestamp: string;
  rawDigitalLevel16Bit: number; // Raw ADC reading (0-65535)
  calibratedMaxTempCelsius: number;
  calibratedMeanTempCelsius: number;
  ambientTemperatureCelsius: number;
  relativeHumidityPercent: number;
  distanceToTargetMeters: number;
  surfaceEmissivity: number; // e.g., 0.95 for asphalt, 0.92 for concrete
  reflectedApparentTempCelsius: number;
  atmosphericTransmittance?: number;
}

export interface IThermalHotspotLocalizationResult {
  assetId: string;
  assetType: ElectricalAssetType;
  isHotspotDetected: boolean;
  confidenceScore: number;
  faultClassification: ThermalFaultClassification;
  netaSeverity: NETASeverityGrade;
  surfaceMaxTemperatureCelsius: number;
  ambientReferenceTemperatureCelsius: number;
  temperatureDeltaCelsius: number;
  estimatedSubterraneanCoreTempCelsius: number;
  estimatedJouleHeatLossWatts: number;
  subsurfaceDepthEstimateMeters: number;
  thermalCentroidCoordinates: {
    latitude: number;
    longitude: number;
  };
  compositeThermalRiskScore: number; // Scale 0 - 100
  isScadaFeederTripAdvised: boolean;
  discomEmergencyAction: string;
  synthesizedGrievancePayload?: {
    title: string;
    description: string;
    department: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
    slaHours: number;
  };
}

/**
 * Deterministic domain computation engine for radiometric infrared thermography
 * and subterranean thermal plume inversion.
 */
export class RadiometricThermalFaultEngine {
  // Stefan-Boltzmann constant (W / (m^2 * K^4))
  private static readonly STEFAN_BOLTZMANN = 5.670374419e-8;

  // Typical soil thermal conductivities (W / (m * K))
  private static readonly THERMAL_CONDUCTIVITY: Record<string, number> = {
    DRY_SAND: 0.35,
    COMPACTED_SOIL: 1.25,
    ASPHALT_PAVEMENT: 0.75,
    CONCRETE_DUCT: 1.65,
  };

  /**
   * Calibrates raw infrared radiometric temperature against object surface emissivity,
   * atmospheric path attenuation, and reflected ambient background radiation.
   *
   * Formulated via Stefan-Boltzmann Law:
   * W_tot = ε * τ * σ * T_obj^4 + (1 - ε) * τ * σ * T_refl^4 + (1 - τ) * σ * T_atm^4
   */
  public static calculateCalibratedSurfaceTemperature(
    apparentTempCelsius: number,
    emissivity: number,
    ambientTempCelsius: number,
    relativeHumidityPercent: number,
    distanceMeters: number
  ): number {
    const eps = Math.max(0.1, Math.min(1.0, emissivity));
    const tApparentK = apparentTempCelsius + 273.15;
    const tReflK = ambientTempCelsius + 273.15;
    const tAtmK = ambientTempCelsius + 273.15;

    // Approximate atmospheric transmittance tau_atm as empirical function of distance and humidity
    const waterVaporPressure =
      (relativeHumidityPercent / 100.0) *
      Math.exp(17.27 * ambientTempCelsius / (ambientTempCelsius + 237.3)) *
      6.1078;
    const tauAtm = Math.max(
      0.75,
      Math.min(
        0.99,
        Math.exp(-0.00015 * distanceMeters * Math.sqrt(Math.max(1.0, waterVaporPressure)))
      )
    );

    // Radiometric total incident flux inversion
    const totalFlux = Math.pow(tApparentK, 4);
    const reflectedFlux = (1.0 - eps) * tauAtm * Math.pow(tReflK, 4);
    const atmosphericFlux = (1.0 - tauAtm) * Math.pow(tAtmK, 4);

    const emittedTargetFlux = (totalFlux - reflectedFlux - atmosphericFlux) / (eps * tauAtm);

    if (emittedTargetFlux <= 0) {
      return apparentTempCelsius;
    }

    const tObjK = Math.pow(emittedTargetFlux, 0.25);
    const tObjCelsius = tObjK - 273.15;

    return Number(tObjCelsius.toFixed(2));
  }

  /**
   * Inverts subterranean Fourier heat conduction equation to estimate underground
   * cable core conductor temperature from pavement surface thermal profile.
   *
   * Formula:
   * T_core = T_surface + (q_loss / (2 * π * k_medium)) * ln(2 * depth / r_cable)
   */
  public static estimateSubterraneanCoreTemperature(
    surfaceTempCelsius: number,
    ambientTempCelsius: number,
    burialDepthMeters: number,
    surroundingMedium: 'DRY_SAND' | 'COMPACTED_SOIL' | 'ASPHALT_PAVEMENT' | 'CONCRETE_DUCT',
    operatingVoltageKv: number
  ): { coreTempCelsius: number; estimatedJouleLossWatts: number } {
    if (burialDepthMeters <= 0.05) {
      // Surface asset (transformer, feeder pillar)
      return {
        coreTempCelsius: surfaceTempCelsius,
        estimatedJouleLossWatts: Number(((surfaceTempCelsius - ambientTempCelsius) * 14.5).toFixed(1)),
      };
    }

    const k = this.THERMAL_CONDUCTIVITY[surroundingMedium] || 1.1;
    const deltaTSurface = Math.max(0, surfaceTempCelsius - ambientTempCelsius);
    const cableRadiusMeters = 0.045; // Standard 11kV/33kV 3-core XLPE cable radius (~90mm OD)

    // Geometric thermal resistance factor G
    const depth = Math.max(0.3, burialDepthMeters);
    const geometricFactor = Math.log((2 * depth) / cableRadiusMeters) / (2 * Math.PI * k);

    // Heat dissipation rate per meter (Watts/m) inferred from surface temperature footprint
    const heatFluxWattsPerMeter = deltaTSurface / (geometricFactor * 0.42);

    // Underground core conductor temperature elevation
    const coreTempK = surfaceTempCelsius + heatFluxWattsPerMeter * geometricFactor;

    // Additional dielectric loss factor proportional to square of line voltage
    const dielectricLossWatts = 0.85 * Math.pow(operatingVoltageKv / 11.0, 2);
    const totalEstimatedLossWatts = heatFluxWattsPerMeter + dielectricLossWatts;

    return {
      coreTempCelsius: Number(coreTempK.toFixed(1)),
      estimatedJouleLossWatts: Number(totalEstimatedLossWatts.toFixed(1)),
    };
  }

  /**
   * Evaluates NETA MTS-2023 / IEEE 738 thermal gradient severity grades.
   */
  public static evaluateNETASeverity(
    deltaTCelsius: number,
    absoluteMaxTempCelsius: number
  ): NETASeverityGrade {
    if (deltaTCelsius > 40.0 || absoluteMaxTempCelsius >= 90.0) {
      return 'CLASS_4_CRITICAL';
    }
    if (deltaTCelsius > 20.0 || absoluteMaxTempCelsius >= 75.0) {
      return 'CLASS_3_SEVERE';
    }
    if (deltaTCelsius > 10.0 || absoluteMaxTempCelsius >= 60.0) {
      return 'CLASS_2_MODERATE';
    }
    return 'CLASS_1_MINOR';
  }

  /**
   * Classifies electrical defect type based on thermal profile and asset class.
   */
  public static classifyFault(
    assetType: ElectricalAssetType,
    deltaTCelsius: number,
    coreTempCelsius: number,
    currentLoadRatio: number
  ): ThermalFaultClassification {
    if (deltaTCelsius <= 5.0) {
      return 'NOMINAL_OPERATING';
    }

    if (coreTempCelsius > 115.0 || deltaTCelsius > 45.0) {
      return 'SUBTERRANEAN_CABLE_FIRE_IMMINENT';
    }

    if (assetType.includes('TRANSFORMER') || assetType.includes('RMU')) {
      if (deltaTCelsius > 25.0) {
        return 'TRANSFORMER_BUSHING_DEGRADATION';
      }
      return 'PHASE_IMBALANCE_OVERLOAD';
    }

    if (assetType.includes('CABLE') || assetType.includes('TRENCH')) {
      if (currentLoadRatio > 1.25) {
        return 'PHASE_IMBALANCE_OVERLOAD';
      }
      if (coreTempCelsius > 90.0) {
        return 'DIELECTRIC_INSULATION_BREAKDOWN';
      }
      return 'RESISTIVE_JOINT_OVERHEATING';
    }

    return 'RESISTIVE_JOINT_OVERHEATING';
  }

  /**
   * Formulates Composite Subterranean Thermal Risk Score (0 - 100).
   *
   * Weights:
   * - 40% Thermal gradient delta T over ambient
   * - 25% Core insulation threshold exceedance (>90°C for XLPE)
   * - 20% Asset criticality and operating voltage tier
   * - 15% Proximity to sensitive municipal urban corridors
   */
  public static calculateCompositeRiskScore(
    deltaTCelsius: number,
    coreTempCelsius: number,
    voltageKv: number,
    isHighDensityZone: boolean
  ): number {
    const deltaTFactor = Math.min(1.0, Math.max(0, deltaTCelsius) / 50.0) * 40.0;

    const xlpeExcess = Math.max(0, coreTempCelsius - 90.0);
    const coreFactor = Math.min(1.0, xlpeExcess / 40.0) * 25.0;

    const voltageFactor = Math.min(1.0, voltageKv / 33.0) * 20.0;
    const proximityFactor = isHighDensityZone ? 15.0 : 5.0;

    const total = deltaTFactor + coreFactor + voltageFactor + proximityFactor;
    return Number(Math.min(100.0, Math.max(0.0, total)).toFixed(1));
  }

  /**
   * Comprehensive diagnostic pipeline: processes raw radiometric sensor capture
   * against asset structural registry, predicts thermal plume, and emits triage payload.
   */
  public static processThermalTelemetry(
    asset: IElectricalAssetMetadata,
    telemetry: IRadiometricSensorReading,
    isHighDensityZone: boolean = true,
    currentLoadAmperes?: number
  ): IThermalHotspotLocalizationResult {
    // 1. Calibrated surface temperature
    const surfaceMaxTemp = this.calculateCalibratedSurfaceTemperature(
      telemetry.calibratedMaxTempCelsius,
      telemetry.surfaceEmissivity,
      telemetry.ambientTemperatureCelsius,
      telemetry.relativeHumidityPercent,
      telemetry.distanceToTargetMeters
    );

    const deltaT = Number((surfaceMaxTemp - telemetry.ambientTemperatureCelsius).toFixed(2));

    // 2. Subterranean core inversion
    const { coreTempCelsius, estimatedJouleLossWatts } =
      this.estimateSubterraneanCoreTemperature(
        surfaceMaxTemp,
        telemetry.ambientTemperatureCelsius,
        asset.nominalDepthMeters,
        asset.surroundingMedium,
        asset.operatingVoltageKv
      );

    // 3. NETA severity rating
    const netaSeverity = this.evaluateNETASeverity(deltaT, surfaceMaxTemp);

    // 4. Fault classification
    const loadAmps = currentLoadAmperes || asset.ratedCurrentAmperes * 0.75;
    const currentRatio = loadAmps / asset.ratedCurrentAmperes;
    const faultClassification = this.classifyFault(
      asset.assetType,
      deltaT,
      coreTempCelsius,
      currentRatio
    );

    // 5. Composite risk score
    const riskScore = this.calculateCompositeRiskScore(
      deltaT,
      coreTempCelsius,
      asset.operatingVoltageKv,
      isHighDensityZone
    );

    const isHotspotDetected = deltaT >= 8.0 || surfaceMaxTemp >= 55.0;
    const isScadaTripAdvised =
      netaSeverity === 'CLASS_4_CRITICAL' ||
      riskScore >= 75.0 ||
      faultClassification === 'SUBTERRANEAN_CABLE_FIRE_IMMINENT';

    let discomAction = 'Log for routine thermographic audit.';
    if (netaSeverity === 'CLASS_2_MODERATE') {
      discomAction = 'Schedule joint inspection within 14 days.';
    } else if (netaSeverity === 'CLASS_3_SEVERE') {
      discomAction = 'Dispatch maintenance crew within 24 hours. Thermographic rescan required.';
    } else if (netaSeverity === 'CLASS_4_CRITICAL') {
      discomAction = 'EMERGENCY: Immediate feeder de-energization or load-shedding reroute.';
    }

    // 6. NagrikSetu Grievance Ticket Payload Synthesis
    let synthesizedGrievancePayload;
    if (isHotspotDetected && netaSeverity !== 'CLASS_1_MINOR') {
      const priorityMap: Record<NETASeverityGrade, 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'> = {
        CLASS_1_MINOR: 'LOW',
        CLASS_2_MODERATE: 'MEDIUM',
        CLASS_3_SEVERE: 'HIGH',
        CLASS_4_CRITICAL: 'EMERGENCY',
      };

      const slaHoursMap: Record<NETASeverityGrade, number> = {
        CLASS_1_MINOR: 72,
        CLASS_2_MODERATE: 24,
        CLASS_3_SEVERE: 8,
        CLASS_4_CRITICAL: 1,
      };

      synthesizedGrievancePayload = {
        title: `Electrical Thermal Hotspot Alert: Feeder ${asset.feederIdentifier} (${faultClassification.replace(/_/g, ' ')})`,
        description:
          `Automated radiometric thermal infrared CV detected anomalous heating at asset ` +
          `${asset.assetId} (${asset.assetType}). Surface temp: ${surfaceMaxTemp}°C (ΔT: +${deltaT}°C over ambient). ` +
          `Estimated subterranean conductor core temperature: ${coreTempCelsius}°C. ` +
          `NETA Rating: ${netaSeverity}. Risk Score: ${riskScore}/100. Action: ${discomAction}`,
        department: 'Electricity / Urban Power Distribution (DISCOM)',
        priority: priorityMap[netaSeverity],
        slaHours: slaHoursMap[netaSeverity],
      };
    }

    return {
      assetId: asset.assetId,
      assetType: asset.assetType,
      isHotspotDetected,
      confidenceScore: Math.min(0.98, Number((0.72 + (deltaT / 60.0) * 0.25).toFixed(2))),
      faultClassification,
      netaSeverity,
      surfaceMaxTemperatureCelsius: surfaceMaxTemp,
      ambientReferenceTemperatureCelsius: telemetry.ambientTemperatureCelsius,
      temperatureDeltaCelsius: deltaT,
      estimatedSubterraneanCoreTempCelsius: coreTempCelsius,
      estimatedJouleHeatLossWatts,
      subsurfaceDepthEstimateMeters: asset.nominalDepthMeters,
      thermalCentroidCoordinates: {
        latitude: asset.geographicLocation.latitude,
        longitude: asset.geographicLocation.longitude,
      },
      compositeThermalRiskScore: riskScore,
      isScadaFeederTripAdvised: isScadaTripAdvised,
      discomEmergencyAction: discomAction,
      synthesizedGrievancePayload,
    };
  }
}
