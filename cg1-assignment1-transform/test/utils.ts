/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
import {Vec4} from '../src/math/vec4';
import {Mat4} from '../src/math/mat4';
import {diff} from 'jest-diff';
import {approxEqual} from '../src/math/utils';

/**
 * checkEqual implements an approximate equal check of two given
 * parameters. Instead of using expect(v1).toBe(v2) from jest, the
 * purpose of this function is to compare the parameters using
 * utils.approxEqual to get a lower precision numerical checking.
 *
 * Furthermore, this function will console log the difference of the two
 * given parameters using jest.diffDefault. to get a better output in
 * understanding what went wrong.
 *
 * @param got is either a number, or a Vec4, or a Mat4.
 * @param want is either a number, or a Vec4, or a Mat4.
 * @returns true if equal or false if not.
 */
export function checkEqual(
  got: Mat4 | Vec4 | number,
  want: Mat4 | Vec4 | number,
  log = true
): boolean {
  let equal = false;
  if (got instanceof Mat4) {
    equal = got.eq(<Mat4>want);
  } else if (got instanceof Vec4) {
    equal = got.eq(<Vec4>want);
  } else {
    equal = approxEqual(got, <number>want);
  }
  if (!equal && log) {
    // log the difference if not equal.
    console.log(expect.getState().currentTestName + '\n', diff(want, got));
  }
  return equal;
}

/**
 * randomInts returns a random integer in [0, 10)
 * @returns an integer
 */
export function randomInts() {
  return Math.floor(Math.random() * 10);
}
