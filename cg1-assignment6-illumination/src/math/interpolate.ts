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
  return from + t * (to - from);
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
  return new Vec4(
    Lerp(from.x, to.x, t),
    Lerp(from.y, to.y, t),
    Lerp(from.z, to.z, t),
    Lerp(from.w, to.w, t)
  );
}

export function clamp(v: number, min = 0, max = 255): number {
  return Math.min(Math.max(v, min), max);
}

export function clampV(v: Vec4, min = 0, max = 255): Vec4 {
  return new Vec4(
    Math.min(Math.max(v.x, min), max),
    Math.min(Math.max(v.y, min), max),
    Math.min(Math.max(v.z, min), max),
    Math.min(Math.max(v.w, min), max)
  );
}
