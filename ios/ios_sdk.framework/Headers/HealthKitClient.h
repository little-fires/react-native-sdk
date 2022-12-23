//
//  HealthKitClient.h
//  ios-sdk
//
//  Created by admin on 12/10/22.
//

#ifndef HealthKitClient_h
#define HealthKitClient_h

#import <Foundation/Foundation.h>
#import <HealthKit/HKHealthStore.h>
#import <HealthKit/HKQuantitySample.h>
#import <HealthKit/HKTypeIdentifiers.h>

/*!
 @class Client for syncing data with Apple HealthKit.
 */
@interface HealthKitClient : NSObject

/*!
 @property Pointer to the Apple Healthkit HKHeaklthStore object.
 */
@property (nonatomic, strong, nullable) HKHealthStore *hkStore;

/*!
 @method Set the URL to littlefires backend.
 This is set by default. So, there is no need to set this unless otherwise needed.
 
 @param url URL to littlefires backend.
 */
-(void)setBackendUrl:(NSString * _Nonnull)url;

/*!
 @method Check if Apple HealthKit is available for use.
 
 @return true if Apple HealthKit is available for use, false otherwise.
 */
-(bool)isAvailable;

/*!
 @method Synchronize Apple HealthKit with littlefires.
 
 The sync operation runs in background thread and provides callback handlers to get progress updates.
 To execute UI codes in the callback handlers, please remember to dispatch operations to the main queue.
 For example:
 dispatch_async(dispatch_get_main_queue(), ^{
 // Execute your UI codes here
 });
 
 The sync operation keeps a cache of last sync-ed data entry's date locally on the mobile device in user defaults.
 To clear the cache, please call clearCache method.
 
 @param sessionkey Sessionkey to be used for communicating with littlefires backend.
 @param onUpdate Callback handler to receive progress updates.
 progress: Indicate the sync operation progress in the range of [0, 1] inclusive.
 @param onComplete Callback handler to indicate sync operation has ended.
 error: A non-nil value indicates an error has occured, nil value indicates operation has completed successfully.
 */
-(void)sync:(NSString * _Nullable)sessionkey
   onUpdate:(nonnull void(^)(float progress))onUpdate
 onComplete:(nonnull void(^)(NSError * _Nullable error))onComplete;

/*!
 @method Clear all cache associated with synchronization.
 */
-(void)clearCache;

@end

#endif /* HealthKitClient_h */
