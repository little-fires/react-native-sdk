import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
} from 'react-native';
import { EventEmitter } from 'events';

const LINKING_ERROR =
  `The package 'react-native-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const LFSdk = NativeModules.LFSdk
  ? NativeModules.LFSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export type DeviceId = 'accu_chek' | 'lepu_medical' | 'wellue' | 'yuwell';

// Event that is emitted when the state of device scanner changes
export type DeviceScannerStateEvent = {
  // started: Actively scanning for devices
  // stopped: Not scanning for devices
  state: 'started' | 'stopped';
};

// Event that is emitted when the connection state of a device changes
export type DeviceConnectionStateEvent = {
  deviceId: DeviceId;

  // Connection state
  //
  // connecting: Connecting to device
  // connected: Connected to device
  // disconnected: Not connected to device
  state: 'connecting' | 'connected' | 'disconnected';
};

export type AccuChekData = {
  // Time in milliseconds since epoch
  timeMilliseconds: number;

  // Blood glucose sugar level in mmol/L
  glucoseMillimolesPerLiter?: number;
};

export type LepuMedicalData = {
  // Time in milliseconds since epoch
  timeMilliseconds: number;

  // SpO2 value in percentage: [0, 100]
  spo2Percentage?: number;

  // Pulse rate in beats per minute
  pulseRateBeatsPerMinute?: number;

  // Perfusion index in percentage: [0, 100]
  perfusionIndexPercentage?: number;
};

export type WellueData = {
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

export type YuwellData = {
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

export type DeviceDataEvent =
  | ({ deviceId: 'accu_chek' } & AccuChekData)
  | ({ deviceId: 'lepu_medical' } & LepuMedicalData)
  | ({ deviceId: 'wellue' } & WellueData)
  | ({ deviceId: 'yuwell' } & YuwellData);

declare interface Subscription {
  on(
    event: 'device_scanner.state',
    listener: (event: DeviceScannerStateEvent) => void
  ): this;
  on(
    event: 'device.connection_state',
    listener: (event: DeviceConnectionStateEvent) => void
  ): this;
  on(event: 'device.data', listener: (event: DeviceDataEvent) => void): this;
  on(event: string, listener: Function): this;
}

class Subscription extends EventEmitter {}

export const subscription = new Subscription();

/**
 * Sets sessionkey to littlefires backend
 * @param sessionkey Sessionkey
 */
export const setSessionkey = (sessionkey: string) => {
  LFSdk.setSessionkey(sessionkey);
};

/**
 * Sets device for scanning
 * Any existing devices will be removed
 * @param deviceId Device id
 */
export const setDevice = (deviceId: DeviceId) => {
  LFSdk.setDevice(deviceId);
};

/**
 * Clears all added devices
 */
export const clearDevices = () => {
  LFSdk.clearDevices();
};

/**
 * Starts scanning for devices
 */
export const start = () => {
  LFSdk.start();
};

/**
 * Stops scanning for devices
 */
export const stop = () => {
  LFSdk.stop();
};

// Handles device scanner state updates
const onDeviceScannerState = (data: any) => {
  let event: DeviceScannerStateEvent | null = null;
  let state = data.state.toLowerCase();
  if (state === 'started') {
    event = { state: 'started' };
  } else if (state === 'stopped') {
    event = { state: 'stopped' };
  } else {
    console.warn(`Invalid device scanner state: ${state}`);
  }
  if (event != null) {
    subscription.emit('device_scanner.state', event);
  }
};

// Handles device connection state updates
const onDeviceConnectionState = (data: any) => {
  const deviceId = data.deviceId as DeviceId;
  const state = data.state.toLowerCase();

  let event: DeviceConnectionStateEvent | null = null;
  if (state === 'connecting') {
    event = { deviceId, state: 'connecting' };
  } else if (state === 'connected') {
    event = { deviceId, state: 'connected' };
  } else if (state === 'disconnected') {
    event = { deviceId, state: 'disconnected' };
  } else {
    console.warn(`Invalid device connection state: ${state}`);
  }
  if (event) {
    subscription.emit('device.connection_state', event);
  }
};

// Handles device data stream
const onDeviceData = (data: any) => {
  const deviceId = data.deviceId as DeviceId;
  const jsonString = data.data!;

  let event: DeviceDataEvent | null = null;
  const jsonData = JSON.parse(jsonString);
  if (deviceId === 'accu_chek') {
    event = { deviceId, ...jsonData };
  } else if (deviceId === 'lepu_medical') {
    event = { deviceId, ...jsonData };
  } else if (deviceId === 'wellue') {
    event = { deviceId, ...jsonData };
  } else if (deviceId === 'yuwell') {
    const state = (`${jsonData.state}` || '').toLowerCase();
    if (state === 'measuring' || state === '1') {
      jsonData.state = 'measuring';
    } else if (state === 'success' || state === '2') {
      jsonData.state = 'success';
    } else if (state === 'error' || state === '3') {
      jsonData.state = 'error';
    } else {
      console.warn(`Invalid yuwell state: ${state}`);
    }
    event = { deviceId, ...jsonData };
  }
  if (event) {
    subscription.emit('device.data', event);
  }
};

// Subscribe to events in Android
if (Platform.OS === 'android') {
  DeviceEventEmitter.addListener('DeviceScanner.state', onDeviceScannerState);
  DeviceEventEmitter.addListener(
    'Device.connectionState',
    onDeviceConnectionState
  );
  DeviceEventEmitter.addListener('Device.data', onDeviceData);
}
// Subscribe to events in iOS
else if (Platform.OS === 'ios') {
  const emitter = new NativeEventEmitter(LFSdk);
  emitter.addListener('DeviceScanner.state', onDeviceScannerState);
  emitter.addListener('Device.connectionState', onDeviceConnectionState);
  emitter.addListener('Device.data', onDeviceData);
}
