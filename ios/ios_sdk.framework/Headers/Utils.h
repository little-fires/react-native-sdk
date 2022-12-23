//
//  Utils.h
//  ios-sdk
//
//  Created by admin on 18/10/22.
//

#ifndef Utils_h
#define Utils_h

#import <Foundation/Foundation.h>

/*!
 @class Provides utility functions.
 */
@interface Utils : NSObject

/*!
 @method Get date for start of today.
 */
+(nonnull NSDate *)getStartOfToday;

/*!
 @method Get date for end of today.
 */
+(nonnull NSDate *)getEndOfToday;

/*!
 @method Get date by adding desired days to a date.
 
 @param value Number of day(s) to add.
 @param toDate The date to add days to.
 */
+(nonnull NSDate *)dateByAddingDay:(int)value
                            toDate:(NSDate * _Nonnull)toDate;

/*!
 @method Create error with description.
 
 @param description Error description.
 */
+(nonnull NSError *)createError:(NSString * _Nonnull)description;

@end

#endif /* Utils_h */
