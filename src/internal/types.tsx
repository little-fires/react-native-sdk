// Environment to littlefires backend
//
// prod: Production environment
// dev: Development environment for testing purposes
export type EnvMode = 'prod' | 'dev';

// Unique device identifiers
export type DeviceId =
  | 'accu_chek'
  | 'lepu_medical'
  | 'wellue'
  | 'yuwell'
  | 'auto';

// Device source type indicating the source where data comes in
export type DeviceSourceType =
  | 'cloud'
  | 'bluetooth_low_energy'
  | 'mobile_phone'
  | 'unknown';

// Device type classifying the category of the device
export type DeviceDeviceType =
  | 'blood_pressure_monitor'
  | 'continuous_glucose_monitor'
  | 'blood_glucose_meter'
  | 'mobile_phone'
  | 'pulse_oximeter'
  | 'smart_scale'
  | 'smart_watch'
  | 'thermometer'
  | 'unknown';

// Device scanner state
//
// started: Actively scanning for devices
// stopped: Not scanning for devices
export type DeviceScannerState = 'started' | 'stopped';

// Device connection state
//
// connecting: Connecting to device
// connected: Connected to device
// disconnected: Not connected to device
export type DeviceConnectionState =
  | 'connecting'
  | 'connected'
  | 'paired'
  | 'disconnected';

// Event that is emitted when the state of device scanner changes
export type DeviceScannerStateEvent = {
  state: DeviceScannerState;
};

// Event that is emitted when the connection state of a device changes
export type DeviceConnectionStateEvent = {
  // Connection state
  state: DeviceConnectionState;
};

// Event that is emitted when new data is received
export type DeviceDataEvent<T = any> = {
  data: T;
};

export type AccuChekRawData = {
  // List of readings
  readings: AccuChekRawDataReading[];
};

export type AccuChekRawDataReading = {
  // Time in milliseconds since epoch
  timeMilliseconds: number;

  // Corrected time in milliseconds since epoch
  correctedTimeMilliseconds: number;

  // Flag to indicate if time offset is available
  hasTimeOffset: boolean;

  // Flag to indicate if glucose is available
  hasGlucose: boolean;

  // Glucose units
  units: number;

  // Flag to indicate if status is available
  hasStatus: boolean;

  // Flag to indicate if context is available
  hasContext: boolean;

  // Sequence number
  sequenceNumber: number;

  // Time offset in minutes from original time -> corrected time
  timeOffsetMinutes?: number;

  // Blood glucose sugar level in mmol/L
  glucoseMillimolesPerLiter?: number;

  // Raw data in hexadecimal
  rawHex?: string;
};

export type AccuChekPublishData = {
  // List of readings
  readings: {
    // Time in milliseconds since epoch
    timeMilliseconds: number;

    // Blood glucose sugar level in mmol/L
    glucoseMillimolesPerLiter?: number;

    // Raw data reading
    rawDataReading?: AccuChekRawDataReading;
  }[];
};

export type LepuMedicalPublishData = {
  // Time in milliseconds since epoch
  timeMilliseconds: number;

  // SpO2 value in percentage: [0, 100]
  spo2Percentage?: number;

  // Pulse rate in beats per minute
  pulseRateBeatsPerMinute?: number;

  // Perfusion index in percentage: [0, 100]
  perfusionIndexPercentage?: number;
};

export type WelluePublishData = {
  deviceId: 'wellue';

  // Time in milliseconds since epoch
  timeMilliseconds: number;

  // SpO2 value in percentage: [0, 100]
  spo2Percentage?: number;

  // Pulse rate in beats per minute
  pulseRateBeatsPerMinute?: number;

  // Perfusion index in percentage: [0, 100]
  perfusionIndexPercentage?: number;
};

export type YuwellPublishData = {
  // State at which this data is measured
  //
  // measuring: Measuring in progress
  // success: Measurement has completed successfully
  // error: An error has occurred during measurement
  state: 'measuring' | 'success' | 'error';

  // Time in milliseconds since epoch
  timeMilliseconds: number;

  // Systolic value in mmHg
  systolicMillimetersOfMercury?: number;

  // Diastolic value in mmHg
  diastolicMillimetersOfMercury?: number;

  // Arterial value in mmHg
  arterialMillimetersOfMercury?: number;

  // Pulse rate in beats per minute
  pulseRateBeatsPerMinute?: number;
};

export type AutoPublishData = {
  // Detected device id
  deviceId: string;

  // Device data
  data:
    | AccuChekPublishData
    | LepuMedicalPublishData
    | WelluePublishData
    | YuwellPublishData;
};

export type MeasurementUnit =
  | 'PERCENTAGE'
  | 'BEATS_PER_MINUTE'
  | 'MICROGRAMS'
  | 'MILLIGRAMS'
  | 'GRAMS'
  | 'KILOGRAMS'
  | 'OUNCES'
  | 'POUNDS'
  | 'CENTIMETERS'
  | 'METERS'
  | 'KILOMETERS'
  | 'MILES'
  | 'INCHES'
  | 'FEET'
  | 'LITERS'
  | 'MILLILITERS'
  | 'FLUID_OUNCES_US'
  | 'MILLIMOLES_PER_LITER'
  | 'MILLIGRAMS_PER_DECILITER'
  | 'MILLIMETERS_OF_MERCURY'
  | 'WATTS'
  | 'KILOCALORIES_PER_DAY'
  | 'CALORIES'
  | 'KILOCALORIES'
  | 'JOULES'
  | 'KILOJOULES'
  | 'CELSIUS'
  | 'FAHRENHEIT'
  | 'METERS_PER_SECOND'
  | 'KILOMETERS_PER_HOUR'
  | 'MILES_PER_HOUR';
