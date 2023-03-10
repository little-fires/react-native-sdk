#import "Sdk2.h"
#import <CoreBluetooth/CoreBluetooth.h>

@interface Sdk2()

@property (nonatomic, weak, nullable) RCTPromiseResolveBlock currentResolve;
@property (nonatomic, weak, nullable) RCTPromiseRejectBlock currentReject;
@property (nonatomic, strong, nullable) Bridge *iosSdkBridge;

@end

@implementation Sdk2

RCT_EXPORT_MODULE(LFSdk2)

-(id)init {
    if (self = [super init]) {
        self.currentResolve = nil;
        self.currentReject = nil;
        self.iosSdkBridge = [[Bridge alloc] initWithDelegate:self];
        self.hasListeners = false;
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

RCT_REMAP_METHOD(envSetEnvMode,
                 envSetEnvModeWithEnvMode:(NSString *)envMode
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge envSetEnvMode:envMode];
}

RCT_REMAP_METHOD(backendSetSessionkey,
                 backendSetSessionkeyWithSessionkey:(NSString *)sessionkey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge backendSetSessionkey:sessionkey];
}

RCT_REMAP_METHOD(deviceNew,
                 deviceNewWithDeviceId:(NSString *)deviceId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceNew:deviceId];
}

RCT_REMAP_METHOD(deviceSetMatchBluetoothNames,
                 deviceSetMatchBluetoothNamesWithDeviceUuid:(NSString *)deviceUuid
                 macAddress:(NSArray *)matchBluetoothNames
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceSetMatchBluetoothNames:deviceUuid
                                matchBluetoothNames:matchBluetoothNames];
}

RCT_REMAP_METHOD(deviceSetMatchBluetoothMacAddresses,
                 deviceSetMatchBluetoothMacAddressesWithDeviceUuid:(NSString *)deviceUuid
                 macAddress:(NSArray *)matchBluetoothMacAddresses
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceSetMatchBluetoothMacAddresses:deviceUuid
                                matchBluetoothMacAddresses:matchBluetoothMacAddresses];
}

RCT_REMAP_METHOD(deviceSetAutoTimeSync,
                 deviceSetAutoTimeSyncWithDeviceUuid:(NSString *)deviceUuid
                 autoTimeSync:(BOOL *)autoTimeSync
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceSetAutoTimeSync:deviceUuid autoTimeSync:*autoTimeSync];
}

RCT_REMAP_METHOD(deviceSetAutoNotify,
                 deviceSetAutoNotifyWithDeviceUuid:(NSString *)deviceUuid
                 autoNotify:(BOOL *)autoNotify
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceSetAutoNotify:deviceUuid autoNotify:*autoNotify];
}

RCT_REMAP_METHOD(deviceGetDeviceId,
                 deviceGetDeviceIdWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceGetDeviceId:deviceUuid];
}

RCT_REMAP_METHOD(deviceGetSourceType,
                 deviceGetSourceTypeWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceGetSourceType:deviceUuid];
}

RCT_REMAP_METHOD(deviceGetDeviceType,
                 deviceGetDeviceTypeWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceGetDeviceType:deviceUuid];
}

RCT_REMAP_METHOD(deviceGetDeviceModel,
                 deviceGetDeviceModelWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceGetDeviceModel:deviceUuid];
}

RCT_REMAP_METHOD(deviceGetBluetoothName,
                 deviceGetBluetoothNameWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceGetBluetoothName:deviceUuid];
}

RCT_REMAP_METHOD(deviceGetBluetoothMacAddress,
                 deviceGetBluetoothMacAddressWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceGetBluetoothMacAddress:deviceUuid];
}

RCT_REMAP_METHOD(deviceGetNeedsPairing,
                 deviceGetNeedsPairingWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceGetNeedsPairing:deviceUuid];
}

RCT_REMAP_METHOD(deviceGetDeviceDelete,
                 deviceGetDeviceDeleteWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceDelete:deviceUuid];
}

RCT_REMAP_METHOD(autoDeviceSetFilterByDeviceIds,
                 autoDeviceSetFilterByDeviceIdsWithDeviceUuid:(NSString *)deviceUuid
                 filterByDeviceIds:(NSArray<NSString *> *)filterByDeviceIds
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge autoDeviceSetFilterByDeviceIds:deviceUuid filterByDeviceIds: filterByDeviceIds];
}

RCT_REMAP_METHOD(deviceScannerSetSessionkey,
                 deviceScannerSetSessionkeyWithSessionkey:(NSString *)sessionkey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceScannerSetSessionkey:sessionkey];
}

RCT_REMAP_METHOD(deviceScannerAddDevice,
                 deviceScannerAddDeviceWithDeviceUuid:(NSString *)deviceUuid
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceScannerAddDevice:deviceUuid];
}

RCT_REMAP_METHOD(deviceScannerClearDevices,
                 deviceScannerClearDevicesWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceScannerClearDevices];
}

RCT_REMAP_METHOD(deviceScannerStart,
                 deviceScannerStartWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceScannerStart];
}

RCT_REMAP_METHOD(deviceScannerStop,
                 deviceScannerStopWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceScannerStop];
}

RCT_REMAP_METHOD(deviceCacheClear,
                 deviceCacheClearWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge deviceCacheClear];
}

RCT_REMAP_METHOD(measurementUnitConversionUtilsConvert,
                 measurementUnitConversionUtilsConvertWithValue:(double *)value
                 src:(NSString *)src
                 dst:(NSString *)dst
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    self.currentResolve = resolve;
    self.currentReject = reject;
    [self.iosSdkBridge measurementUnitConversionUtilsConvert:*value :src :dst];
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeSdkSpecJSI>(params);
}
#endif

- (void)onSuccess:(id _Nullable)result {
    if (!self.currentResolve) {
        return;
    }
    self.currentResolve(result);
}

- (void)onError:(NSString * _Nonnull)errorCode
   errorMessage:(NSString * _Nonnull)errorMessage
   errorDetails:(NSString * _Nullable)errorDetails {
    if (!self.currentReject) {
        return;
    }
    self.currentReject(errorCode, errorMessage, nil);
}

- (void)onCallback:(NSString * _Nonnull)name
         arguments:(NSDictionary * _Nonnull)arguments {
    if (!self.hasListeners) {
        return;
    }
    if ([name isEqual:@"DeviceScanner.state"]) {
        NSString *state = [arguments objectForKey:@"state"];
        [self sendEventWithName:name body:@{@"state": state}];
    } else if ([name isEqual:@"Device.connectionState"]) {
        NSString *deviceUuid = [arguments objectForKey:@"deviceUuid"];
        NSString *state = [arguments objectForKey:@"state"];
        [self sendEventWithName:name body:@{@"deviceUuid": deviceUuid, @"state": state}];
    } else if ([name isEqual:@"Device.data"]) {
        NSString *deviceUuid = [arguments objectForKey:@"deviceUuid"];
        NSString *data = [arguments objectForKey:@"data"];
        [self sendEventWithName:name body:@{@"deviceUuid": deviceUuid, @"data": data}];
    }
}

@end
