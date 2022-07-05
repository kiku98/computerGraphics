/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Vec4} from './vec4';

/**
 * Lerp is a linear interpolation of two numbers.
 *
 * @param from is one side of the interpolation endpoint
 * @param to is the other side of the interpolation endpoint
 * @param t is the interpolation parameter in [0, 1].
 */
export function Lerp(from: number, to: number, t: number): number {
  // TODO: Implement linear interpolation between two numbers.
  //
  // For instance, if from === 0, to === 1, then it should return 0.3
  // if t === 0.3.
  return 0;
}

/**
 * LerpV is a linear interpolation of two Vec4s.
 *
 * @param from is one side of the interpolation endpoint
 * @param to is the other side of the interpolation endpoint
 * @param t is the interpolation parameter in [0, 1].
 */
export function LerpV(from: Vec4, to: Vec4, t: number): Vec4 {
  // TODO: Implement linear interpolation between two Vec4s.
  //
  // All components should be interpolated linearly using t.
  return new Vec4(0, 0, 0, 0);
}
