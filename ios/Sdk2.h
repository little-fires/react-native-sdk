#import <React/RCTEventEmitter.h>
//#if defined(__arm64__) && __arm64__
//#import <ios_sdk/ios_sdk-Swift.h>
//#elif defined(__x86_64__) && __x86_64__
//#import <ios_sdk/ios_sdk-simulator-Swift.h>
//#endif
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
