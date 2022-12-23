import * as React from 'react';

import { View } from 'react-native';
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
  Appbar,
  Divider,
  List,
  Switch,
  Text,
} from 'react-native-paper';
import {
  DeviceId,
  DeviceScannerStateEvent,
  DeviceConnectionStateEvent,
  DeviceDataEvent,
  subscription,
  start,
  stop,
  setDevice,
  clearDevices,
} from 'react-native-sdk';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

export default function App() {
  // UI flags
  const [deviceScannerStarted, setDeviceScannerStarted] = React.useState(false);
  const [selectedDeviceId, setSelectedDeviceId] =
    React.useState<DeviceId | null>(null);

  // Events received from native sdk
  const [deviceScannerStateEvent, setDeviceScannerStateEvent] =
    React.useState<DeviceScannerStateEvent | null>(null);
  const [deviceConnectionStateEvent, setDeviceConnectionStateEvent] =
    React.useState<DeviceConnectionStateEvent | null>(null);
  const [deviceDataEvent, setDeviceDataEvent] =
    React.useState<DeviceDataEvent | null>(null);

  // Subscribe to events
  React.useEffect(() => {
    // Listen to device scanner state updates
    subscription.on('device_scanner.state', setDeviceScannerStateEvent);

    // Listen to device connection state updates
    subscription.on('device.connection_state', setDeviceConnectionStateEvent);

    // Listen to device data stream
    subscription.on('device.data', setDeviceDataEvent);

    return () => {
      // Remove all listeners
      subscription.removeListener(
        'device_scanner.state',
        setDeviceScannerStateEvent
      );
      subscription.removeListener(
        'device.connection_state',
        setDeviceConnectionStateEvent
      );
      subscription.removeListener('device.data', setDeviceDataEvent);
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content title="littlefires" />
      </Appbar.Header>
      <Divider />

      {/* Main content */}
      <View
        style={{
          height: '100%',
          padding: 8,
          backgroundColor: theme.colors.background,
        }}
      >
        <List.Subheader>Settings</List.Subheader>

        {/* Start or stop device scanning */}
        <List.Item
          title="Tap to start or stop scanning"
          description={`Current state: ${
            deviceScannerStateEvent?.state || 'stopped'
          }`}
          right={() => (
            <Switch
              value={deviceScannerStarted}
              onChange={() => {
                const newValue = !deviceScannerStarted;
                setDeviceScannerStarted(newValue);
                if (newValue) {
                  start();
                } else {
                  stop();
                }
              }}
            />
          )}
          onPress={() => {
            const newValue = !deviceScannerStarted;
            setDeviceScannerStarted(newValue);
            if (newValue) {
              start();
            } else {
              stop();
            }
          }}
        />
        <Divider />

        {/* Toggle to receive device data from one device at a time */}
        <List.Subheader>Connect to Device</List.Subheader>
        {[
          {
            deviceId: 'lepu_medical',
            name: 'Lepu Medical',
          },
          {
            deviceId: 'wellue',
            name: 'Wellue',
          },
          {
            deviceId: 'yuwell',
            name: 'Yuwell',
          },
        ].map((device) => (
          <React.Fragment key={device.deviceId}>
            <List.Item
              title={device.name}
              description={
                selectedDeviceId === device.deviceId
                  ? deviceScannerStarted
                    ? `Current state: ${
                        deviceConnectionStateEvent &&
                        deviceConnectionStateEvent.deviceId === device.deviceId
                          ? deviceConnectionStateEvent.state
                          : 'disconnected'
                      }`
                    : 'Please start scanning'
                  : undefined
              }
              right={() => (
                <Switch
                  value={selectedDeviceId === device.deviceId}
                  onChange={() => {
                    // If already selected, then un-select it
                    if (selectedDeviceId === device.deviceId) {
                      setSelectedDeviceId(null);

                      // Clear existing devices
                      clearDevices();
                    } else {
                      setSelectedDeviceId(device.deviceId as DeviceId);

                      // Invoke native sdk to select current device
                      setDevice(device.deviceId as DeviceId);
                    }
                  }}
                />
              )}
              onPress={() => {
                // If already selected, then un-select it
                if (selectedDeviceId === device.deviceId) {
                  setSelectedDeviceId(null);

                  // Clear existing devices
                  clearDevices();
                } else {
                  setSelectedDeviceId(device.deviceId as DeviceId);

                  // Invoke native sdk to select current device
                  setDevice(device.deviceId as DeviceId);
                }
              }}
            />
          </React.Fragment>
        ))}
        <Divider />

        {/* Show the last received data in JSON format */}
        <List.Subheader>Last Received Data</List.Subheader>
        <View
          style={{
            marginLeft: 16,
            marginRight: 16,
          }}
        >
          <Text variant="bodyLarge">
            {deviceDataEvent
              ? JSON.stringify(deviceDataEvent)
              : 'No data available'}
          </Text>
        </View>
      </View>
    </PaperProvider>
  );
}
