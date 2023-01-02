package com.sdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import io.littlefires.android_sdk.devices.DeviceFactory
import io.littlefires.android_sdk.devices.DeviceScanner
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.Disposable

private const val TAG = "LFSdk"

class SdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  // Store metadata of added devices
  data class DeviceMeta(
    var subscriptions: List<Disposable>
  )

  // List of error codes
  enum class ErrorCode {
    // Provided device id is invalid
    INVALID_DEVICE_ID,
  }

  private var stateStreamSubscription: Disposable? = null
  private var deviceMetaMap = mutableMapOf<String, DeviceMeta>()

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
  fun setSessionkey(sessionkey: String, promise: Promise) {
    Log.d(TAG, "setSessionkey()")
    DeviceScanner.setSessionkey(sessionkey)
    promise.resolve(null)
  }

  @ReactMethod
  fun setDevice(deviceId: String, promise: Promise) {
    Log.d(TAG, "setDevice(): $deviceId")

    // Unsubscribe to device events
    for (deviceMeta in deviceMetaMap) {
      for (subscription in deviceMeta.value.subscriptions) {
        subscription.dispose()
      }
    }
    deviceMetaMap.clear()

    // Clear existing devices
    DeviceScanner.clearDevices()

    // Create device
    val device = DeviceFactory.createDevice(deviceId)
    if (device == null) {
      promise.reject(ErrorCode.INVALID_DEVICE_ID.name, "Please provide a valid device id")
      return
    }

    // Subscribe to device events
    val subscriptions: MutableList<Disposable> = mutableListOf()
    subscriptions.add(
      device.getConnectionStateStream().observeOn(AndroidSchedulers.mainThread())
        .subscribe(
          { state ->
            val params = Arguments.createMap()
            params.putString("deviceId", device.deviceId)
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
              "Device.${device.deviceId}: Failed to stream connection state",
              throwable,
            )
          },
        )
    )
    subscriptions.add(
      device.getDataStream().observeOn(AndroidSchedulers.mainThread()).subscribe(
        { data ->
          val params = Arguments.createMap()
          params.putString("deviceId", device.deviceId)
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
            "Device.${device.deviceId}: Failed to stream data",
            throwable,
          )
        },
      )
    )
    deviceMetaMap[deviceId] = DeviceMeta(subscriptions)

    // Add device for scanning
    DeviceScanner.addDevice(device)

    promise.resolve(null)
  }

  @ReactMethod
  fun clearDevices(promise: Promise) {
    Log.d(TAG, "clearDevices()")

    // Unsubscribe to device events
    for (deviceMeta in deviceMetaMap) {
      for (subscription in deviceMeta.value.subscriptions) {
        subscription.dispose()
      }
    }
    deviceMetaMap.clear()

    // Clear existing devices
    DeviceScanner.clearDevices()

    promise.resolve(null)
  }

  @ReactMethod
  fun start(promise: Promise) {
    Log.d(TAG, "start()")
    val activity = getReactApplicationContext().getCurrentActivity()
    if (activity != null) {
      DeviceScanner.requestPermissions(activity!!)
    }
    DeviceScanner.start()
    promise.resolve(null)
  }

  @ReactMethod
  fun stop(promise: Promise) {
    Log.d(TAG, "stop()")
    DeviceScanner.stop()
    promise.resolve(null)
  }
}
