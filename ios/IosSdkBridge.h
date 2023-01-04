#import <Foundation/Foundation.h>

@protocol IosSdkBridgeDelegate <NSObject>

-(void)onSuccess:(id _Nullable)result;
-(void)onError:(NSString * _Nonnull)errorCode
  errorMessage:(NSString * _Nonnull)errorMessage
  errorDetails:(NSString * _Nullable)errorDetails;
-(void)onCallback:(NSString * _Nonnull)name
        arguments:(NSDictionary * _Nonnull)arguments;

@end

@interface IosSdkBridge : NSObject

@property (nonatomic, weak, nullable) id<IosSdkBridgeDelegate> delegate;

-(void)envSetEnvMode:(NSString * _Nonnull)envMode;

-(void)deviceNew:(NSString * _Nonnull)deviceId;
-(void)deviceSetMacAddress:(NSString * _Nonnull)deviceUuid
                macAddress:(NSString * _Nonnull)macAddress;
-(void)deviceGetDeviceId:(NSString * _Nonnull)deviceUuid;
-(void)deviceGetSourceType:(NSString * _Nonnull)deviceUuid;
-(void)deviceGetDeviceType:(NSString * _Nonnull)deviceUuid;
-(void)deviceGetDeviceModel:(NSString * _Nonnull)deviceUuid;
-(void)deviceGetBluetoothName:(NSString * _Nonnull)deviceUuid;
-(void)deviceGetBluetoothMacAddress:(NSString * _Nonnull)deviceUuid;
-(void)deviceDelete:(NSString * _Nonnull)deviceUuid;

-(void)deviceScannerSetSessionkey:(NSString * _Nonnull)sessionkey;
-(void)deviceScannerAddDevice:(NSString * _Nonnull)deviceUuid;
-(void)deviceScannerClearDevices;
-(void)deviceScannerStart;
-(void)deviceScannerStop;

-(void)deviceCacheClear;

@end
