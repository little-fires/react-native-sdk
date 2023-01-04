package com.sdk

import android.content.Context
import android.util.Log
import com.google.gson.Gson
import io.littlefires.android_sdk.core.Env
import io.littlefires.android_sdk.core.EnvMode
import io.littlefires.android_sdk.devices.Device
import io.littlefires.android_sdk.devices.DeviceFactory
import io.littlefires.android_sdk.devices.DeviceScanner
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.Disposable

private const val TAG = "AndroidSdkBridge"

// Common bridging codes between native SDK and
// higher level cross platform languages such as Flutter and React Native
abstract class AndroidSdkBridge {
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
  }

  private var deviceScannerStateStreamSubscription: Disposable? = null
  private var deviceCacheMap = mutableMapOf<String, DeviceCache>()

  init {
    // Subscribe to DeviceScanner state stream
    deviceScannerStateStreamSubscription =
      DeviceScanner.getStateStream().observeOn(AndroidSchedulers.mainThread()).subscribe(
        { state ->
          onCallback(
            "DeviceScanner.state",
            mapOf(
              "state" to state.name,
            ),
          )
        },
        { throwable ->
          Log.e(TAG, "DeviceScanner: Failed to stream state", throwable)
        },
      )
  }

  fun setContext(context: Context) {
    DeviceScanner.init(context)
  }

  fun envSetEnvMode(envMode: String) {
    when (envMode) {
      "prod" -> {
        Env.setEnvMode(EnvMode.PROD)
        onSuccess(null)
      }
      "dev" -> {
        Env.setEnvMode(EnvMode.DEV)
        onSuccess(null)
      }
      else -> {
        val validEnvModes =
          EnvMode.values().joinToString(", ") { it.name.lowercase() }
        onError(
          ErrorCode.INVALID_ENV_MODE.name,
          "Please provide a valid env mode: $validEnvModes",
          null,
        )
      }
    }
  }

  fun deviceNew(deviceId: String) {
    val device = DeviceFactory.createDevice(deviceId)
    if (device == null) {
      onError(
        ErrorCode.INVALID_DEVICE_ID.name,
        "Invalid device id: $deviceId",
        null,
      )
      return
    }

    val subscriptions: MutableList<Disposable> = mutableListOf()

    // Subscribe to connection state stream
    subscriptions.add(
      device.getConnectionStateStream().observeOn(AndroidSchedulers.mainThread())
        .subscribe(
          { state ->
            onCallback(
              "Device.connectionState",
              mapOf(
                "deviceUuid" to device.deviceUuid,
                "state" to state.name,
              ),
            )
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
          onCallback(
            "Device.data",
            mapOf(
              "deviceUuid" to device.deviceUuid,
              "data" to Gson().toJson(data),
            ),
          )
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

    onSuccess(device.deviceUuid)
  }

  fun deviceSetMacAddress(deviceUuid: String, macAddress: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    deviceCache.device.matchBluetoothMacAddress = macAddress
    onSuccess(null)
  }

  fun deviceGetDeviceId(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    onSuccess(deviceCache.device.deviceId)
  }

  fun deviceGetSourceType(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    onSuccess(deviceCache.device.sourceType.name)
  }

  fun deviceGetDeviceType(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    onSuccess(deviceCache.device.deviceType.name)
  }

  fun deviceGetDeviceModel(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    onSuccess(deviceCache.device.deviceModel)
  }

  fun deviceGetBluetoothName(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    onSuccess(deviceCache.device.getBluetoothName())
  }

  fun deviceGetBluetoothMacAddress(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    onSuccess(deviceCache.device.getBluetoothMacAddress())
  }

  fun deviceGetNeedsPairing(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    onSuccess(deviceCache.device.needsPairing)
  }

  fun deviceDelete(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return

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

    onSuccess(null)
  }

  fun deviceScannerSetSessionkey(sessionkey: String) {
    DeviceScanner.setSessionkey(sessionkey)
    onSuccess(null)
  }

  fun deviceScannerAddDevice(deviceUuid: String) {
    val deviceCache = getDeviceCache(deviceUuid) ?: return
    DeviceScanner.addDevice(deviceCache.device)
    onSuccess(null)
  }

  fun deviceScannerClearDevices() {
    DeviceScanner.clearDevices()
    onSuccess(null)
  }

  fun deviceScannerStart() {
    DeviceScanner.start()
    onSuccess(null)
  }

  fun deviceScannerStop() {
    DeviceScanner.stop()
    onSuccess(null)
  }

  fun deviceCacheClear() {
    // Remove all devices from cache
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

    onSuccess(null)
  }

  abstract fun onSuccess(result: Any?)

  abstract fun onError(errorCode: String, errorMessage: String?, errorDetails: Any?)

  abstract fun onCallback(name: String, arguments: Map<String, Any?>)

  private fun getDeviceCache(uuid: String): DeviceCache? {
    val deviceCache = deviceCacheMap[uuid]
    if (deviceCache == null) {
      onError(
        ErrorCode.INVALID_DEVICE_UUID.name,
        "Invalid device uuid: $uuid",
        null,
      )
      return null
    }
    return deviceCache
  }
}
