#import "IosSdkBridge.h"
#import <ios_sdk/HealthKitClient.h>
#import <ios_sdk/ios_sdk-Swift.h>

@interface DeviceScannerDelegateImpl : NSObject<DeviceScannerDelegate>

@property (nonatomic, weak, nullable) IosSdkBridge *bridge;

@end

@interface DeviceDelegateImpl : NSObject<DeviceDelegate>

@property (nonatomic, weak, nullable) IosSdkBridge *bridge;
@property (nonatomic, strong, nullable) NSString *deviceUuid;

@end

@interface DeviceCache : NSObject

@property (nonatomic, strong, nullable) Device *device;
@property (nonatomic, strong, nullable) DeviceDelegateImpl *delegate;

@end

@implementation DeviceScannerDelegateImpl

- (void)onStateChange:(NSString * _Nonnull)state {
    NSLog(@"DeviceScannerDelegateImpl.onStateChange(): %@", state);
    NSDictionary *arguments = [NSDictionary dictionaryWithObjects:[NSArray arrayWithObjects:state, nil]
                                                          forKeys:[NSArray arrayWithObjects:@"state", nil]];
    [self.bridge.delegate onCallback:@"DeviceScanner.state" arguments:arguments];
}

@end

@implementation DeviceDelegateImpl

- (void)onConnectionStateChange:(NSString * _Nonnull)state {
    NSLog(@"DeviceDelegateImpl.onConnectionStateChange(): %@", state);
    NSDictionary *arguments = [NSDictionary
                               dictionaryWithObjects:[NSArray arrayWithObjects:self.deviceUuid, state, nil]
                               forKeys:[NSArray arrayWithObjects:@"deviceUuid", @"state", nil]];
    [self.bridge.delegate onCallback:@"Device.connectionState" arguments:arguments];
}

- (void)onPublish:(NSDictionary<NSString *, id> * _Nonnull)data {
    NSString *dataJson = [JSONUtils dictToJSONString:data];
    //    NSLog(@"DeviceDelegateImpl.onPublish(): %@", dataJson);
    
    NSDictionary *arguments = [NSDictionary
                               dictionaryWithObjects:[NSArray arrayWithObjects:self.deviceUuid, dataJson, nil]
                               forKeys:[NSArray arrayWithObjects:@"deviceUuid", @"data", nil]];
    [self.bridge.delegate onCallback:@"Device.data" arguments:arguments];
}

@end

@implementation DeviceCache

@end

@interface IosSdkBridge()

@property (nonatomic, strong, nullable) HealthKitClient *healthKitClient;
@property (nonatomic, strong, nullable) DeviceScanner *deviceScanner;
@property (nonatomic, strong, nullable) FlutterMethodChannel *channel;
@property (nonatomic, strong, nullable) DeviceScannerDelegateImpl *deviceScannerDelegateImpl;
@property (nonatomic, strong, nullable) NSMutableDictionary<NSString *, DeviceCache *> *deviceCacheDictionary;

@end

@implementation IosSdkBridge
- (id)init {
    if (self = [super init]) {
        self.delegate = nil;
        self.healthKitClient = [HealthKitClient new];
        self.deviceScannerDelegateImpl = [DeviceScannerDelegateImpl new];
        self.deviceScanner = [DeviceScanner new];
        self.deviceScanner.delegate = self.deviceScannerDelegateImpl;
        self.deviceCacheDictionary = [NSMutableDictionary new];
    }
    return self;
}

-(void)envSetEnvMode:(NSString *)envMode {
    [Env setMode:envMode];
    [self.delegate onSuccess:nil];
}

-(void)deviceNew:(NSString * _Nonnull)deviceId {
    Device *device = [DeviceFactory createDevice:deviceId];
    if (device == nil) {
        [self.delegate onError:@"INVALID_DEVICE_ID"
                  errorMessage:[NSString stringWithFormat:@"Invalid device id: %@", deviceId]
                  errorDetails:nil];
        return;
    }
    
    // Create device delegate to receive updates
    DeviceDelegateImpl *delegate = [DeviceDelegateImpl new];
    delegate.bridge = self;
    delegate.deviceUuid = device.getDeviceUuid;
    device.delegate = delegate;
    
    // Cache device
    DeviceCache *deviceCache = [DeviceCache new];
    deviceCache.device = device;
    deviceCache.delegate = delegate;
    [deviceCache setValue:device forKey:@"device"];
    [self.deviceCacheDictionary setValue:deviceCache forKey:device.getDeviceUuid];
    
    [self.delegate onSuccess:device.getDeviceUuid];
}

-(void)deviceSetMacAddress:(NSString * _Nonnull)deviceUuid
                macAddress:(NSString * _Nonnull)macAddress {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [deviceCache.device setMatchBluetoothUuid:macAddress];
    [self.delegate onSuccess:nil];
}

-(void)deviceGetDeviceId:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [self.delegate onSuccess:deviceCache.device.getDeviceId];
}

-(void)deviceGetSourceType:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [self.delegate onSuccess:deviceCache.device.getSourceTypeAsString];
}

-(void)deviceGetDeviceType:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [self.delegate onSuccess:deviceCache.device.getDeviceTypeAsString];
}

-(void)deviceGetDeviceModel:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [self.delegate onSuccess:deviceCache.device.getDeviceModel];
}

-(void)deviceGetBluetoothName:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [self.delegate onSuccess:deviceCache.device.getBluetoothName];
}

-(void)deviceGetBluetoothMacAddress:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [self.delegate onSuccess:deviceCache.device.getBluetoothUuid];
}

-(void)deviceDelete:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    
    // Remove device from device scanner if added
    [self.deviceScanner removeDevice:deviceCache.device];
    
    // Disconnect device
    [deviceCache.device disconnect];
    
    // Remove device delegate
    deviceCache.device.delegate = nil;
    
    // Remove device from cache
    [self.deviceCacheDictionary removeObjectForKey:deviceCache.device.getDeviceUuid];
    
    [self.delegate onSuccess:nil];
}


-(void)deviceScannerSetSessionkey:(NSString * _Nonnull)sessionkey {
    [self.deviceScanner setSessionkey:sessionkey];
    [self.delegate onSuccess:nil];
}

-(void)deviceScannerAddDevice:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self getDeviceCache:deviceUuid];
    if (deviceCache == nil) {
        return;
    }
    [self.deviceScanner addDevice:deviceCache.device];
    [self.delegate onSuccess:nil];
}

-(void)deviceScannerClearDevices {
    [self.deviceScanner clearDevices];
    [self.delegate onSuccess:nil];
}

-(void)deviceScannerStart {
    [self.deviceScanner start];
    [self.delegate onSuccess:nil];
}

-(void)deviceScannerStop {
    [self.deviceScanner stop];
    [self.delegate onSuccess:nil];
}

-(void)deviceCacheClear {
    for (DeviceCache *deviceCache in self.deviceCacheDictionary) {
        // Remove device from device scanner if added
        [self.deviceScanner removeDevice:deviceCache.device];

        // Disconnect device
        [deviceCache.device disconnect];
        
        // Remove device delegate
        deviceCache.device.delegate = nil;
    }
    [self.deviceCacheDictionary removeAllObjects];
    
    [self.delegate onSuccess:nil];
}

-(DeviceCache *)getDeviceCache:(NSString * _Nonnull)deviceUuid {
    DeviceCache *deviceCache = [self.deviceCacheDictionary objectForKey:deviceUuid];
    if (deviceCache == nil) {
        [self.delegate onError:@"INVALID_DEVICE_UUID"
                  errorMessage:[NSString stringWithFormat:@"Invalid device uuid: %@", deviceUuid]
                  errorDetails:nil];
        return nil;
    }
    return deviceCache;
}

@end
