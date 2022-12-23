#import "Sdk.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import <ios_sdk/ios_sdk-Swift.h>

@interface DeviceScannerDelegateImpl : NSObject<DeviceScannerDelegate>

@property (nonatomic, weak, nullable) Sdk *emitter;

@end

@interface DeviceDelegateImpl : NSObject<DeviceDelegate>

@property (nonatomic, weak, nullable) Sdk *emitter;
@property (nonatomic, strong, nullable) NSString *deviceId;

@end

@interface Sdk()

@property (nonatomic, strong, nullable) DeviceDelegateImpl *deviceDelegateImpl;
@property (nonatomic, strong, nullable) DeviceScannerDelegateImpl *deviceScannerDelegateImpl;
@property (nonatomic, strong, nullable) DeviceScanner *deviceScanner;
@property (nonatomic, strong, nullable) Device *device;

@end

@implementation DeviceScannerDelegateImpl

- (void)onStateChange:(NSString * _Nonnull)state {
    NSLog(@"DeviceScannerDelegateImpl.onStateChange(): %@", state);
    if (!self.emitter.hasListeners) {
        return;
    }
    [self.emitter sendEventWithName:@"DeviceScanner.state" body:@{@"state": state}];
}

@end

@implementation DeviceDelegateImpl

- (void)onConnectionStateChange:(NSString * _Nonnull)state {
    NSLog(@"DeviceDelegateImpl.onConnectionStateChange(): %@", state);
    if (!self.emitter.hasListeners) {
        return;
    }
    if (self.deviceId == nil) {
        return;
    }
    [self.emitter sendEventWithName:@"Device.connectionState" body:@{@"deviceId": self.deviceId, @"state": state}];
}

- (void)onReceive:(NSString * _Nonnull)dataJsonString {
    //    NSLog(@"DeviceDelegateImpl.onReceive(): %@", dataJsonString);
    if (!self.emitter.hasListeners) {
        return;
    }
    if (self.deviceId == nil) {
        return;
    }
    NSMutableArray *body = [NSMutableArray new];
    [body addObject:self.deviceId];
    [body addObject:dataJsonString];
    [self.emitter sendEventWithName:@"Device.data" body:@{@"deviceId": self.deviceId, @"data": dataJsonString}];
}

@end

@implementation Sdk

RCT_EXPORT_MODULE(LFSdk)

-(id)init {
    if (self = [super init]) {
        self.hasListeners = false;
        self.deviceDelegateImpl = [DeviceDelegateImpl new];
        self.deviceDelegateImpl.emitter = self;
        self.deviceScannerDelegateImpl = [DeviceScannerDelegateImpl new];
        self.deviceScannerDelegateImpl.emitter = self;
        self.deviceScanner = [DeviceScanner new];
        self.deviceScanner.delegate = self.deviceScannerDelegateImpl;
        self.device = nil;
    }
    return self;
}

-(NSArray<NSString *> *)supportedEvents {
    return @[
        @"DeviceScanner.state",
        @"Device.connectionState",
        @"Device.data"
    ];
}

-(void)startObserving {
    self.hasListeners = true;
}

-(void)stopObserving {
    self.hasListeners = false;
}

RCT_REMAP_METHOD(setSessionkey,
                 withSessionkey:(NSString *)sessionkey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    [self.deviceScanner setSessionkey:sessionkey];
    resolve(nil);
}

RCT_REMAP_METHOD(setDevice,
                 withDeviceId:(NSString *)deviceId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Unsubscribe from existing device and clear devices
    if (self.device != nil) {
        self.deviceDelegateImpl.deviceId = nil;
        self.device.delegate = nil;
    }
    [self.deviceScanner clearDevices];
    
    // Create device
    Device *device = [DeviceFactory createDevice:deviceId];
    if (device == nil) {
        reject(@"INVALID_DEVICE_ID", @"Please provide a valid device id", nil);
        return;
    }
    
    // Subscribe to device events
    self.deviceDelegateImpl.deviceId = deviceId;
    device.delegate = self.deviceDelegateImpl;
    
    // Add device to scanner
    [self.deviceScanner addDevice:device];
    resolve(nil);
}

RCT_REMAP_METHOD(clearDevices,
                 clearDevicesWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    // Unsubscribe from existing device and clear devices
    if (self.device != nil) {
        self.deviceDelegateImpl.deviceId = nil;
        self.device.delegate = nil;
    }
    [self.deviceScanner clearDevices];
    resolve(nil);
}

RCT_REMAP_METHOD(start,
                 startWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    [self.deviceScanner start];
    resolve(nil);
}

RCT_REMAP_METHOD(stop,
                 stopWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    [self.deviceScanner stop];
    resolve(nil);
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeSdkSpecJSI>(params);
}
#endif

@end
