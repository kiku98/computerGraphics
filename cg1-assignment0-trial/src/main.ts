/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

/**
 * reverse returns x with its digits reversed.
 *
 * Example 1:
 * - Input: x = 24
 * - Output: 42
 *
 * Example 2:
 * - Input: x = -24
 * - Output: -42
 *
 * @param x is a given integer number.
 * @returns a number that reverses the digits of x.
 */
export function reverse(x: number): number {
  const isNegative = x<0;
  var digit, result = 0

    while( x ){
        digit = x % 10  //  Get right-most digit. Ex. 123/10 → 12.3 → 3
        result = (result * 10) + digit  //  Ex. 123 → 1230 + 4 → 1234
        x = x/10|0  //  Remove right-most digit. Ex. 123 → 12.3 → 12
    }  
  return result;
}

