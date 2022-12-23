#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSdkSpec.h"

@interface Sdk : RCTEventEmitter <NativeSdkSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Sdk : RCTEventEmitter <RCTBridgeModule>
#endif

@property bool hasListeners;

@end
