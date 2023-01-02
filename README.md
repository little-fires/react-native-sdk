# react-native-sdk

> This React Native native module is made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

This repository contains the React Native native module that bridges to underlying littlefires native Android/iOS SDK.

## New API Version Notice

A newer API version [src/index_v2.tsx](src/index_v2.tsx) is currently working in progress so as o provide a more OOP approach.

This new API version **does not** break support for the previous API version [src/index.tsx](src/index.tsx).

## Test on Physical Device

Please take note that testing can be done on a real physical device only.

This is because a physical Bluetooth connection has to be established.

## Run Example Application

A sample React Native application is provided inside the [example](example) folder to demonstrate how to use this native module.

This section provides instructions to run the example application.

### Android

Inside [example/android](example/android) folder, please create a file called `local.properties` and enter the following line to specify your Android SDK directory:

```
sdk.dir=<sdk_dir>
```

Then, open a terminal in the root project directory and run the following commands:

```bash
# Install module dependencies
npm install

# Install example application dependencies
cd example
npm install

# Deploy on Android device
# This will automatically start metro
npx react-native run-android
```

### iOS

Open a terminal in the root project directory and run the following commands:

```bash
# Install module dependencies
npm install

# Install example application dependencies
cd example
npm install

# Install CocoaPods
cd ios
pod install
cd ..
```

Finally, open [example/ios/SdkExample.xcworkspace](example/ios/SdkExample.xcworkspace) and deploy on your iOS device.

> Note: Remember to configure your Provisioning Profile!

## Getting Started

### Android Permissions

Please ensure the following permissions are in the AndroidManifest.xml file.

```
<!-- API 31+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- API 18-30 -->
<uses-permission
    android:name="android.permission.BLUETOOTH"
    android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- API * -->
<uses-permission android:name="android.permission.INTERNET" />
```

Please refer to [AndroidManifest.xml](example/android/app/src/main/AndroidManifest.xml) in the example application.

### iOS Permissions

Please ensure the following permissions are in Info.plist:
```
<key>NSHealthShareUsageDescription</key>
<string>This app uses Apple HealthKit</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app uses Bluetooth</string>
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth</string>
```

Do replace the simplified permission explanations with more detailed ones.

Please refer to [Info.plist](example/ios/SdkExample/Info.plist) in the example application.

## API Use Case Examples

This section provides examples on how to use the API for common use cases.

### Set Sessionkey to Sync with littlefires Backend

```ts
import { setSessionkey } from 'react-native-sdk';

// Generate sessionkey from your backend with littlefires backend
let sessionkey = 'xxxx-xxxx-xxxx-xxxx';

// Set sessionkey
setSessionkey(sessionkey);
```

### Start Device Scanning Operation

> Even if scanning is started, actual Bluetooth scanning will take place only if there are devices being added for scanning

```ts
import { subscription, start } from 'react-native-sdk';

// Start scan
start();

// Subscribe to device scanner state events
subscription.on('device_scanner.state', (event) => {
  // State
  // - started
  // - stopped
  console.log(`State: ${event.state}`);
});
```

### Connect and Receive Wellue Pulse Oximeter Values

> Please check internal API for list of supported devices

```ts
import { subscription, setDevice } from 'react-native-sdk';

// Set to receive events from Wellue device
setDevice('wellue');

// Subscribe to device connection state events
subscription.on('device.connection_state', (event) => {
  // event.deviceId is always equal to 'wellue' in this example
  console.log(`Device id: ${event.deviceId}`);

  // Connection state
  // - connecting
  // - connected
  // - disconnected
  console.log(`Connection state: ${event.state}`);
});

// Subscribe to device data stream
subscription.on('device.data', (event) => {
  // event.deviceId is always equal to 'wellue' in this example
  console.log(`Device id: ${event.deviceId}`);

  // Wellue pulse oximeter values
  console.log(`Data: ${JSON.stringify(event.data)}`);
});
```

### Clear and Disconnect Existing Devices

```ts
import { clearDevices } from 'react-native-sdk';

// Clear all existing devices
clearDevices();
```

### Stop Device Scanning Operation

```ts
import { stop } from 'react-native-sdk';

// Stop scan
stop();
```

## API Documentation

The React Native API bridging codes are located in the [index.tsx](src/index.tsx) file.

A brief description of the available APIs and event subscriptions is shown below.

For a more detailed description, please refer to the [index.tsx](src/index.tsx) file itself.

| API           | Description                            |
| ------------- | -------------------------------------- |
| setSessionkey | Sets sessionkey to littlefires backend |
| setDevice     | Sets device for scanning               |
| clearDevices  | Clears all added devices               |
| start         | Starts scanning for devices            |
| stop          | Stops scanning for devices             |

Events are notified using EventEmitter via the exported `subscription` variable.

| Event                  | Description                              |
| ---------------------- | ---------------------------------------- |
| DeviceScanner.state    | Provides device scanning state updates   |
| Device.connectionState | Provides device connection state updates |
| Device.data            | Provides device data stream              |
