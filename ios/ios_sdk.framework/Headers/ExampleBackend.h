//
//  Backend.h
//  ios-sdk
//
//  Created by admin on 14/10/22.
//

#ifndef Backend_h
#define Backend_h

#import <Foundation/Foundation.h>

/*!
 @class This is meant for getting sessionkey from an example backend provided by littelfires.
 */
@interface ExampleBackend : NSObject

/*!
 @property URL to example backend.
 */
@property (nonatomic, strong, nullable) NSString *url;

/*!
 @method Login to the example backend.
 
 @param username Username.
 @param password Password.
 @param onComplete Callback handler to indicate operation has completed.
 accessToken: Access token generated for the authenticated user. Note: this access token is not saved locally.
 error: A non-nil value indicates an error has occured, nil value indicates operation has completed successfully.
 */
-(void)login:(nonnull NSString *)username
    password:(nonnull NSString *)password
  onComplete:(nonnull void(^)(NSString * _Nullable accessToken, NSError * _Nullable error))onComplete;

/*!
 @method Get sessionkey for communicating with littlefires backend.
 
 @param accessToken Access token for an authenticated user.
 @param onComplete Callback handler to indicate operation has completed.
 sessionkey: Generated sessionkey on success, nil otherwise.
 error: A non-nil value indicates an error has occured, nil value indicates operation has completed successfully.
 */
-(void)getSessionkey:(NSString * _Nullable)accessToken
          onComplete:(nonnull void(^)(NSString * _Nullable sessionkey, NSError * _Nullable error))onComplete;

@end

#endif /* Backend_h */
