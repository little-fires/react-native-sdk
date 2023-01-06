#import <React/RCTEventEmitter.h>
#import <ios_sdk/ios_sdk-Swift.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSdkSpec.h"

@interface Sdk2 : RCTEventEmitter <NativeSdkSpec, BridgeDelegate>
#else
#import <React/RCTBridgeModule.h>

@interface Sdk2 : RCTEventEmitter <RCTBridgeModule, BridgeDelegate>
#endif

@property bool hasListeners;

@end
