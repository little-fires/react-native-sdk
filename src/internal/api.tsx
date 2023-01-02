import { NativeModules, Platform } from 'react-native';

import type {
  EnvMode,
  DeviceId,
  DeviceSourceType,
  DeviceDeviceType,
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

// Raw APIs to native SDK module
// You should be using classes such as DeviceScanner and Device instead of calling this directly
// Use this at your own risk!
export class Api {
  static envSetEnvMode = async (envMode: EnvMode) => {
    await LFSdk.envSetEnvMode(envMode);
  };

  static deviceNew = async (deviceId: DeviceId): Promise<string> => {
    return LFSdk.deviceNew(deviceId);
  };

  static deviceSetMacAddress = async (
    deviceUuid: string,
    macAddress: string
  ) => {
    await LFSdk.deviceSetMacAddress(deviceUuid, macAddress);
  };

  static deviceGetDeviceId = async (deviceUuid: string): Promise<string> => {
    return LFSdk.deviceGetDeviceId(deviceUuid);
  };

  static deviceGetSourceType = async (
    deviceUuid: string
  ): Promise<DeviceSourceType> => {
    return LFSdk.deviceGetSourceType(deviceUuid);
  };

  static deviceGetDeviceType = async (
    deviceUuid: string
  ): Promise<DeviceDeviceType> => {
    return LFSdk.deviceGetDeviceType(deviceUuid);
  };

  static deviceGetDeviceModel = async (deviceUuid: string): Promise<string> => {
    return LFSdk.deviceGetDeviceModel(deviceUuid);
  };

  static deviceGetBluetoothName = async (
    deviceUuid: string
  ): Promise<string> => {
    return LFSdk.deviceGetBluetoothName(deviceUuid);
  };

  static deviceGetBluetoothMacAddress = async (
    deviceUuid: string
  ): Promise<string> => {
    return LFSdk.deviceGetBluetoothMacAddress(deviceUuid);
  };

  static deviceDelete = async (deviceUuid: string): Promise<void> => {
    await LFSdk.deviceDelete(deviceUuid);
  };

  static deviceScannerSetSessionkey = async (sessionkey: string) => {
    await LFSdk.deviceScannerSetSessionkey(sessionkey);
  };

  static deviceScannerAddDevice = async (deviceUuid: string) => {
    await LFSdk.deviceScannerAddDevice(deviceUuid);
  };

  static deviceScannerClearDevices = async () => {
    await LFSdk.deviceScannerClearDevices();
  };

  static deviceScannerStart = async () => {
    await LFSdk.deviceScannerStart();
  };

  static deviceScannerStop = async () => {
    await LFSdk.deviceScannerStop();
  };

  static deviceCacheClear = async () => {
    await LFSdk.deviceCacheClear();
  };
}