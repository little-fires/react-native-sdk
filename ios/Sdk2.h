#import "IosSdkBridge.h"
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSdkSpec.h"

@interface Sdk2 : RCTEventEmitter <NativeSdkSpec, IosSdkBridgeDelegate>
#else
#import <React/RCTBridgeModule.h>

@interface Sdk2 : RCTEventEmitter <RCTBridgeModule, IosSdkBridgeDelegate>
#endif

@property bool hasListeners;

@end
