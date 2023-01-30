import { EventEmitter } from 'events';

import type {
  EnvMode,
  DeviceId,
  DeviceSourceType,
  DeviceDeviceType,
  DeviceConnectionStateEvent,
  DeviceDataEvent,
  AccuChekPublishData,
  YuwellPublishData,
  WelluePublishData,
  LepuMedicalPublishData,
  AutoPublishData,
} from './internal/types';
import { Api } from './internal/api';
import * as events from './internal/events';

// Manages littlefires backend environment
export class Env {
  /**
   * Set environment to littlefires backend
   * @param envMode Environment mode
   */
  static setEnvMode = (envMode: EnvMode) => {
    Api.envSetEnvMode(envMode);
  };
}

// Manages scanning for devices
export class DeviceScanner {
  /**
   * Gets the device scanner event emitter
   * @returns Device scanner event emitter
   */
  static emitter() {
    return events.deviceScannerEventEmitter;
  }

  /**
   * Sets sessionkey to littlefires backend
   * @param sessionkey Sessionkey
   */
  static setSessionkey = (sessionkey: string) => {
    Api.deviceScannerSetSessionkey(sessionkey);
  };

  /**
   * Adds device for scanning
   * @param deviceUuid Device uuid
   */
  static addDevice = (deviceUuid: string) => {
    Api.deviceScannerAddDevice(deviceUuid);
  };

  /**
   * Clears all added devices
   */
  static clearDevices = () => {
    Api.deviceScannerClearDevices();
  };

  /**
   * Starts scanning for devices
   */
  static start = () => {
    Api.deviceScannerStart();
  };

  /**
   * Stops scanning for devices
   */
  static stop = () => {
    Api.deviceScannerStop();
  };
}

declare interface DeviceEventEmitter<T> {
  on(
    event: 'connection_state',
    listener: (event: DeviceConnectionStateEvent) => void
  ): this;
  on(event: 'data', listener: (event: DeviceDataEvent<T>) => void): this;
}

class DeviceEventEmitter<T> extends EventEmitter {}

// Represents a device
export class Device<T> {
  eventEmitter = new DeviceEventEmitter<T>();
  deviceId: DeviceId;
  deviceUuid: string | null = null;

  constructor(deviceId: DeviceId) {
    this.deviceId = deviceId;
  }

  /**
   * Gets the device event emitter
   * @returns Device event emitter
   */
  emitter() {
    return this.eventEmitter;
  }

  /**
   * Create a new device
   * You must call this before performing any device operations
   */
  new = async () => {
    if (!this.deviceUuid) {
      this.deviceUuid = await Api.deviceNew(this.deviceId);
      events.rawEventEmitter.on(
        'device.connection_state',
        this.onDeviceConnectionStateEvent
      );
      events.rawEventEmitter.on('device.data', this.onDeviceDataEvent);
    } else {
      console.warn(`Please do not call Device.new() repeatedly`);
    }
  };

  /**
   * Delete this device
   * Call this after new()
   */
  delete = async (): Promise<void> => {
    if (this.deviceUuid) {
      await Api.deviceDelete(this.deviceUuid);
      events.rawEventEmitter.off(
        'device.connection_state',
        this.onDeviceConnectionStateEvent
      );
      events.rawEventEmitter.off('device.data', this.onDeviceDataEvent);
    }
  };

  /**
   * Set device Bluetooth names to search
   * @param matchBluetoothNames List of Bluetooth names
   */
  setMatchBluetoothNames = async (matchBluetoothNames: string[]) => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.setMatchBluetoothNames(): Did you forget to call Device.new()?'
      );
    }
    await Api.deviceSetMatchBluetoothNames(
      this.deviceUuid,
      matchBluetoothNames
    );
  };

  /**
   * Set device Bluetooth MAC addresses to search
   * @param matchBluetoothMacAddresses List of Bluetooth MAC addresses
   */
  setMatchBluetoothMacAddresses = async (
    matchBluetoothMacAddresses: string[]
  ) => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.setMatchBluetoothMacAddresses(): Did you forget to call Device.new()?'
      );
    }
    await Api.deviceSetMatchBluetoothMacAddresses(
      this.deviceUuid,
      matchBluetoothMacAddresses
    );
  };

  /**
   * Set device auto time sync flag
   * @param autoTimeSync Auto time sync flag
   */
  setAutoTimeSync = async (autoTimeSync: boolean) => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.setAutoTimeSync(): Did you forget to call Device.new()?'
      );
    }
    await Api.deviceSetAutoTimeSync(this.deviceUuid, autoTimeSync);
  };

  /**
   * Set device auto notify flag
   * @param autoNotify Auto notify flag
   */
  setAutoNotify = async (autoNotify: boolean) => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.setAutoNotify(): Did you forget to call Device.new()?'
      );
    }
    await Api.deviceSetAutoTimeSync(this.deviceUuid, autoNotify);
  };

  /**
   * Get device id
   * @returns Device id
   */
  getDeviceId = async (): Promise<string> => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.getDeviceId(): Did you forget to call Device.new()?'
      );
    }
    return Api.deviceGetDeviceId(this.deviceUuid);
  };

  /**
   * Get device source type
   * @returns Device source type
   */
  getSourceType = async (): Promise<DeviceSourceType> => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.getSourceType(): Did you forget to call Device.new()?'
      );
    }
    return Api.deviceGetSourceType(this.deviceUuid);
  };

  /**
   * Get device type
   * @returns Device type
   */
  getDeviceType = async (): Promise<DeviceDeviceType> => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.getDeviceType(): Did you forget to call Device.new()?'
      );
    }
    return Api.deviceGetDeviceType(this.deviceUuid);
  };

  /**
   * Get device model
   * @returns Device model
   */
  getDeviceModel = async (): Promise<string> => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.getDeviceModel(): Did you forget to call Device.new()?'
      );
    }
    return Api.deviceGetDeviceModel(this.deviceUuid);
  };

  /**
   * Get Bluetooth name
   * @returns Bluetooth name
   */
  getBluetoothName = async (): Promise<string> => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.getBluetoothName(): Did you forget to call Device.new()?'
      );
    }
    return Api.deviceGetBluetoothName(this.deviceUuid);
  };

  /**
   * Get Bluetooth MAC address
   * @returns Bluetooth MAC address
   */
  getBluetoothMacAddress = async (): Promise<string> => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run Device.getBluetoothMacAddress(): Did you forget to call Device.new()?'
      );
    }
    return Api.deviceGetBluetoothMacAddress(this.deviceUuid);
  };

  private onDeviceConnectionStateEvent = (
    event: events.DeviceConnectionStateEvent
  ) => {
    if (event.deviceUuid === this.deviceUuid) {
      this.eventEmitter.emit('connection_state', event.state);
    }
  };

  private onDeviceDataEvent = (event: events.DeviceDataEvent) => {
    if (event.deviceUuid === this.deviceUuid) {
      this.eventEmitter.emit('data', event.data);
    }
  };
}

export class AccuChekDevice extends Device<AccuChekPublishData> {
  constructor() {
    super('accu_chek');
  }
}

export class LepuMedicalDevice extends Device<LepuMedicalPublishData> {
  constructor() {
    super('lepu_medical');
  }
}

export class WellueDevice extends Device<WelluePublishData> {
  constructor() {
    super('wellue');
  }
}

export class YuwellDevice extends Device<YuwellPublishData> {
  constructor() {
    super('yuwell');
  }
}

export class AutoDevice extends Device<AutoPublishData> {
  constructor() {
    super('auto');
  }

  /**
   * Set filter by device IDs
   * @param filterByDeviceIds List of device IDs to filter
   */
  setFilterByDeviceIds = async (filterByDeviceIds?: string[]) => {
    if (!this.deviceUuid) {
      throw Error(
        'Failed to run AutoDevice.setFilterByDeviceIds(): Did you forget to call Device.new()?'
      );
    }
    await Api.autoDeviceSetFilterByDeviceIds(
      this.deviceUuid,
      filterByDeviceIds
    );
  };
}
