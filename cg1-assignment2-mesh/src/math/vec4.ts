/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
import {approxEqual} from './utils';

/**
 * Vec4 is a homogenous representation of a 3D point (w === 1)
 * or 3D vector (w === 0).
 */
export class Vec4 {
  x: number; // x component
  y: number; // y component
  z: number; // z component
  w: number; // w component

  /**
   * constructor constructs a Vector with given x, y, z, w components.
   *
   * @param x component
   * @param y component
   * @param z component
   * @param w component
   */
  constructor(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  /**
   * eq checks whether two vectors are equal.
   * @param v is a Vec4 vector
   * @returns true if two given vectors are approximately equal, otherwise false.
   */
  eq(v: Vec4): boolean {
    return (
      approxEqual(this.x, v.x) &&
      approxEqual(this.y, v.y) &&
      approxEqual(this.z, v.z) &&
      approxEqual(this.w, v.w)
    );
  }
  /**
   * copy copies the current vector
   * @returns a copy of the current vector
   */
  copy(): Vec4 {
    return new Vec4(this.x, this.y, this.z, this.w);
  }
}
