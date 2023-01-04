package com.sdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

private const val TAG = "LFSdk"

class SdkModule2(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private val bridge = object : AndroidSdkBridge() {
    var emitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null
    var currentPromise: Promise? = null

    override fun onSuccess(result: Any?) {
      currentPromise?.resolve(result)
    }

    override fun onError(errorCode: String, errorMessage: String?, errorDetails: Any?) {
      currentPromise?.reject(errorCode, errorMessage)
    }

    override fun onCallback(name: String, arguments: Map<String, Any?>) {
      val params = Arguments.createMap()
      arguments.keys.forEach { key ->
        val argument = arguments[key]
        if (argument is Boolean) {
          params.putBoolean(key, argument)
        } else if (argument is Double) {
          params.putDouble(key, argument)
        } else if (argument is Int) {
          params.putInt(key, argument)
        } else if (argument is String) {
          params.putString(key, argument)
        } else if (argument == null) {
          params.putNull(key)
        } else {
          Log.e(TAG, "Invalid callback data type: $argument")
        }
      }
      emitter?.emit(name, params)
    }
  }

  init {
    Log.d(TAG, "init()")
    bridge.emitter = getReactApplicationContext()
      .getJSModule(
        DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
      )
    bridge.setContext(getReactApplicationContext().getApplicationContext())
  }

  override fun getName(): String {
    return TAG
  }

  @ReactMethod
  fun envSetEnvMode(envMode: String, promise: Promise) {
    Log.d(TAG, "envSetEnvMode()")
    bridge.currentPromise = promise
    bridge.envSetEnvMode(envMode)
  }

  @ReactMethod
  fun deviceNew(deviceId: String, promise: Promise) {
    Log.d(TAG, "deviceNew()")
    bridge.currentPromise = promise
    bridge.deviceNew(deviceId)
  }

  @ReactMethod
  fun deviceSetMacAddress(deviceUuid: String, macAddress: String, promise: Promise) {
    Log.d(TAG, "deviceSetMacAddress()")
    bridge.currentPromise = promise
    bridge.deviceSetMacAddress(deviceUuid, macAddress)
  }

  @ReactMethod
  fun deviceGetDeviceId(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetDeviceId()")
    bridge.currentPromise = promise
    bridge.deviceGetDeviceId(deviceUuid)
  }

  @ReactMethod
  fun deviceGetSourceType(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetSourceType()")
    bridge.currentPromise = promise
    bridge.deviceGetSourceType(deviceUuid)
  }

  @ReactMethod
  fun deviceGetDeviceType(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetDeviceType()")
    bridge.currentPromise = promise
    bridge.deviceGetDeviceType(deviceUuid)
  }

  @ReactMethod
  fun deviceGetDeviceModel(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetDeviceModel()")
    bridge.currentPromise = promise
    bridge.deviceGetDeviceModel(deviceUuid)
  }

  @ReactMethod
  fun deviceGetBluetoothName(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetBluetoothName()")
    bridge.currentPromise = promise
    bridge.deviceGetBluetoothName(deviceUuid)
  }

  @ReactMethod
  fun deviceGetBluetoothMacAddress(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetBluetoothMacAddress()")
    bridge.currentPromise = promise
    bridge.deviceGetBluetoothMacAddress(deviceUuid)
  }

  @ReactMethod
  fun deviceGetNeedsPairing(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetNeedsPairing()")
    bridge.currentPromise = promise
    bridge.deviceGetNeedsPairing(deviceUuid)
  }

  @ReactMethod
  fun deviceDelete(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceDelete()")
    bridge.currentPromise = promise
    bridge.deviceDelete(deviceUuid)
  }

  @ReactMethod
  fun deviceScannerSetSessionkey(sessionkey: String, promise: Promise) {
    Log.d(TAG, "deviceScannerSetSessionkey()")
    bridge.currentPromise = promise
    bridge.deviceScannerSetSessionkey(sessionkey)
  }

  @ReactMethod
  fun deviceScannerAddDevice(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceScannerAddDevice()")
    bridge.currentPromise = promise
    bridge.deviceScannerAddDevice(deviceUuid)
  }

  @ReactMethod
  fun deviceScannerClearDevices(promise: Promise) {
    Log.d(TAG, "deviceScannerClearDevices()")
    bridge.currentPromise = promise
    bridge.deviceScannerClearDevices()
  }

  @ReactMethod
  fun deviceScannerStart(promise: Promise) {
    Log.d(TAG, "deviceScannerStart()")
    bridge.currentPromise = promise
    bridge.deviceScannerStart()
  }

  @ReactMethod
  fun deviceScannerStop(promise: Promise) {
    Log.d(TAG, "deviceScannerStop()")
    bridge.currentPromise = promise
    bridge.deviceScannerStop()
  }

  @ReactMethod
  fun deviceCacheClear(promise: Promise) {
    Log.d(TAG, "deviceCacheClear()")
    bridge.currentPromise = promise
    bridge.deviceCacheClear()
  }
}
