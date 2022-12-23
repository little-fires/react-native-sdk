//
//  Encrypter.h
//  ios-sdk
//
//  Created by admin on 19/10/22.
//

#ifndef Encrypter_h
#define Encrypter_h

#import <Foundation/Foundation.h>

@interface Encrypter : NSObject

+(NSData * _Nonnull)secureRandom:(int)size;
+(NSData * _Nonnull)secureRandomAES128;

+(NSData * _Nonnull)aesCBC:(NSData * _Nonnull)plaintext
                       key:(NSData * _Nonnull)key
                        iv:(NSData * _Nonnull)iv;

+(NSData * _Nonnull)computeHMAC:(NSData * _Nonnull)data
                            key:(NSData * _Nonnull)key;

+(NSData * _Nonnull)fernetEncrypt:(NSData * _Nonnull)plaintext
                              key:(NSData * _Nonnull)key;

+(NSData * _Nullable)rsaEncrypt:(NSData * _Nonnull)plaintext
                         pubKey:(NSString * _Nonnull)pubKey;

@end

#endif /* Encrypter_h */
