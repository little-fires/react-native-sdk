package com.sdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import io.littlefires.android_sdk.core.Env
import io.littlefires.android_sdk.core.EnvMode
import io.littlefires.android_sdk.devices.Device
import io.littlefires.android_sdk.devices.DeviceFactory
import io.littlefires.android_sdk.devices.DeviceScanner
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.Disposable

private const val TAG = "LFSdk"

class SdkModule2(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  // Cache device data
  data class DeviceCache(
    var device: Device<*>,
    var subscriptions: List<Disposable>,
  )

  // List of error codes
  enum class ErrorCode {
    // Provided env mode is invalid
    INVALID_ENV_MODE,

    // Provided device id is invalid
    INVALID_DEVICE_ID,

    // Provided device UUID is invalid
    INVALID_DEVICE_UUID,

    // Device is already added to device scanner
    DEVICE_ALREADY_ADDED,
  }

  private var stateStreamSubscription: Disposable? = null
  private var deviceCacheMap = mutableMapOf<String, DeviceCache>()

  init {
    Log.d(TAG, "init()")

    // Initialize DeviceScanner
    DeviceScanner.init(getReactApplicationContext().getApplicationContext())

    // Subscribe to DeviceScanner state stream
    stateStreamSubscription =
      DeviceScanner.getStateStream().observeOn(AndroidSchedulers.mainThread()).subscribe(
        { state ->
          val params = Arguments.createMap()
          params.putString("state", state.name)
          getReactApplicationContext()
            .getJSModule(
              DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
            )
            .emit("DeviceScanner.state", params)
        },
        { throwable ->
          Log.e(TAG, "DeviceScanner: Failed to stream state", throwable)
        },
      )
  }

  override fun getName(): String {
    return TAG
  }

  @ReactMethod
  fun envSetEnvMode(envMode: String, promise: Promise) {
    Log.d(TAG, "envSetEnvMode()")
    when (envMode) {
      "prod" -> {
        Env.setEnvMode(EnvMode.PROD)
        promise.resolve(null)
      }
      "dev" -> {
        Env.setEnvMode(EnvMode.DEV)
        promise.resolve(null)
      }
      else -> {
        val validEnvModes =
          EnvMode.values().joinToString(", ") { it.name.lowercase() }
        promise.reject(
          ErrorCode.INVALID_ENV_MODE.name,
          "Please provide a valid env mode: $validEnvModes",
        )
      }
    }
  }

  @ReactMethod
  fun deviceNew(deviceId: String, promise: Promise) {
    Log.d(TAG, "deviceNew()")
    val device = DeviceFactory.createDevice(deviceId)
    if (device == null) {
      promise.reject(ErrorCode.INVALID_DEVICE_ID.name, "Invalid device id: $deviceId")
      return
    }

    val subscriptions: MutableList<Disposable> = mutableListOf()

    // Subscribe to connection state stream
    subscriptions.add(
      device.getConnectionStateStream().observeOn(AndroidSchedulers.mainThread())
        .subscribe(
          { state ->
            val params = Arguments.createMap()
            params.putString("deviceUuid", device.deviceUuid)
            params.putString("state", state.name)
            getReactApplicationContext()
              .getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
              )
              .emit("Device.connectionState", params)
          },
          { throwable ->
            Log.e(
              TAG,
              "Device.${device.deviceUuid}: Failed to stream connection state",
              throwable,
            )
          },
        )
    )

    // Subscribe to data stream
    subscriptions.add(
      device.getDataStream().observeOn(AndroidSchedulers.mainThread()).subscribe(
        { data ->
          val params = Arguments.createMap()
          params.putString("deviceUuid", device.deviceUuid)
          params.putString("data", Gson().toJson(data))
          getReactApplicationContext()
            .getJSModule(
              DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
            )
            .emit("Device.data", params)
        },
        { throwable ->
          Log.e(
            TAG,
            "Device.${device.deviceUuid}: Failed to stream data",
            throwable,
          )
        },
      )
    )

    // Cache device
    deviceCacheMap[device.deviceUuid] = DeviceCache(
      device = device,
      subscriptions = subscriptions,
    )

    promise.resolve(device.deviceUuid)
  }

  @ReactMethod
  fun deviceSetMacAddress(deviceUuid: String, macAddress: String, promise: Promise) {
    Log.d(TAG, "deviceSetMacAddress()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    deviceCache.device.matchBluetoothMacAddress = macAddress
    promise.resolve(null)
  }

  @ReactMethod
  fun deviceGetDeviceId(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetDeviceId()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    promise.resolve(deviceCache.device.deviceId)
  }

  @ReactMethod
  fun deviceGetSourceType(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetSourceType()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    promise.resolve(deviceCache.device.sourceType.name)
  }

  @ReactMethod
  fun deviceGetDeviceType(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetDeviceType()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    promise.resolve(deviceCache.device.deviceType.name)
  }

  @ReactMethod
  fun deviceGetDeviceModel(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetDeviceModel()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    promise.resolve(deviceCache.device.deviceModel)
  }

  @ReactMethod
  fun deviceGetBluetoothName(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetBluetoothName()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    promise.resolve(deviceCache.device.getBluetoothName())
  }

  @ReactMethod
  fun deviceGetBluetoothMacAddress(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceGetBluetoothMacAddress()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    promise.resolve(deviceCache.device.getBluetoothMacAddress())
  }

  @ReactMethod
  fun deviceDelete(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceDelete()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return

    // Remove device from device scanner if added
    DeviceScanner.removeDevice(deviceCache.device)

    // Disconnect device
    deviceCache.device.disconnect()

    // Cancel subscriptions
    for (subscription in deviceCache.subscriptions) {
      subscription.dispose()
    }

    // Remove device from cache
    deviceCacheMap.remove(deviceUuid)

    promise.resolve(null)
  }

  @ReactMethod
  fun deviceScannerSetSessionkey(sessionkey: String, promise: Promise) {
    Log.d(TAG, "deviceScannerSetSessionkey()")
    DeviceScanner.setSessionkey(sessionkey)
    promise.resolve(null)
  }

  @ReactMethod
  fun deviceScannerAddDevice(deviceUuid: String, promise: Promise) {
    Log.d(TAG, "deviceScannerAddDevice()")
    val deviceCache = getDeviceCache(deviceUuid, promise) ?: return
    DeviceScanner.addDevice(deviceCache.device)
    promise.resolve(null)
  }

  @ReactMethod
  fun deviceScannerClearDevices(promise: Promise) {
    Log.d(TAG, "deviceScannerClearDevices()")
    DeviceScanner.clearDevices()
    promise.resolve(null)
  }

  @ReactMethod
  fun deviceScannerStart(promise: Promise) {
    Log.d(TAG, "deviceScannerStart()")
    val activity = getReactApplicationContext().getCurrentActivity()
    if (activity != null) {
      DeviceScanner.requestPermissions(activity!!)
    }
    DeviceScanner.start()
    promise.resolve(null)
  }

  @ReactMethod
  fun deviceScannerStop(promise: Promise) {
    Log.d(TAG, "deviceScannerStop()")
    DeviceScanner.stop()
    promise.resolve(null)
  }

  @ReactMethod
  fun deviceCacheClear(promise: Promise) {
    Log.d(TAG, "deviceCacheClear()")
    // Remove all devices
    for (deviceCache in deviceCacheMap) {
      // Remove device from device scanner if added
      DeviceScanner.removeDevice(deviceCache.value.device)

      // Disconnect device
      deviceCache.value.device.disconnect()

      // Cancel subscriptions
      for (subscription in deviceCache.value.subscriptions) {
        subscription.dispose()
      }
    }
    deviceCacheMap.clear()

    promise.resolve(null)
  }

  private fun getDeviceCache(uuid: String, promise: Promise): DeviceCache? {
    val deviceCache = deviceCacheMap[uuid]
    if (deviceCache == null) {
      promise.reject(ErrorCode.INVALID_DEVICE_UUID.name, "Invalid device uuid: $uuid")
      return null
    }
    return deviceCache
  }
}
