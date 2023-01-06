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
export type DeviceConnectionState = 'connecting' | 'connected' | 'disconnected';

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

export type AccuChekPublishData = {
  // Time in milliseconds since epoch
  timeMilliseconds: number;

  // Blood glucose sugar level in mmol/L
  glucoseMillimolesPerLiter?: number;
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
