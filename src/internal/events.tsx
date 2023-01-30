import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
} from 'react-native';
import { EventEmitter } from 'events';

import type {
  DeviceId,
  DeviceScannerState,
  DeviceConnectionState,
} from './types';

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

// Event that is emitted when the state of device scanner changes
export type DeviceScannerStateEvent = {
  state: DeviceScannerState;
};

// Event that is emitted when the connection state of a device changes
export type DeviceConnectionStateEvent = {
  // The unique device instance uuid
  deviceUuid: string;

  // Connection state
  state: DeviceConnectionState;
};

// Event that is emitted when new data is received
export type DeviceDataEvent = {
  deviceUuid: string;
  data: any;
};

declare interface RawEventEmitter {
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

class RawEventEmitter extends EventEmitter {}

export const rawEventEmitter = new RawEventEmitter();

declare interface DeviceScannerEventEmitter {
  on(event: 'state', listener: (event: DeviceScannerStateEvent) => void): this;
}

class DeviceScannerEventEmitter extends EventEmitter {}

export const deviceScannerEventEmitter = new DeviceScannerEventEmitter();
rawEventEmitter.on('device_scanner.state', (event) => {
  deviceScannerEventEmitter.emit('state', event);
});

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
    rawEventEmitter.emit('device_scanner.state', event);
  }
};

// Handles device connection state updates
const onDeviceConnectionState = (data: any) => {
  const deviceUuid = data.deviceUuid as DeviceId;
  const state = data.state.toLowerCase();

  let event: DeviceConnectionStateEvent | null = null;
  if (state === 'connecting') {
    event = { deviceUuid, state: 'connecting' };
  } else if (state === 'connected') {
    event = { deviceUuid, state: 'connected' };
  } else if (state === 'paired') {
    event = { deviceUuid, state: 'paired' };
  } else if (state === 'disconnected') {
    event = { deviceUuid, state: 'disconnected' };
  } else {
    console.warn(`Invalid device connection state: ${state}`);
  }
  if (event) {
    rawEventEmitter.emit('device.connection_state', event);
  }
};

// Handles device data stream
const onDeviceData = (data: any) => {
  const deviceUuid = data.deviceUuid as DeviceId;
  const jsonString = data.data!;

  const event: DeviceDataEvent = {
    deviceUuid,
    data: JSON.parse(jsonString),
  };
  rawEventEmitter.emit('device.data', event);
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
