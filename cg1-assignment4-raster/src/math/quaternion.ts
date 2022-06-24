/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Mat4} from './mat4';
import {Vec4} from './vec4';

/**
 * Quaternion represents a quaternion.
 */
export class Quaternion {
  a: number;
  v: Vec4;
  /**
   * constructor constructs a quaternion using the given four parameters.
   * @param a the real part of the quaternion
   * @param b the first imaginary part of the quaternion
   * @param c the second imaginary part of the quaternion
   * @param d the third imaginary part of the quaternion
   */
  constructor(a: number, b: number, c: number, d: number) {
    this.a = a;
    this.v = new Vec4(b, c, d, 0);
  }
  /**
   * mul computes the multiplication of two given quaternions.
   * @param q is a given quaternion
   * @returns the resulting quaternion
   */
  mul(q: Quaternion): Quaternion {
    const aa = this.a * q.a - this.v.dot(q.v);
    const vv = q.v.scale(this.a).add(this.v.scale(q.a)).add(this.v.cross(q.v));
    return new Quaternion(aa, vv.x, vv.y, vv.z);
  }
  /**
   * toRoMat converts a given quaternion to a rotation matrix.
   *
   * Note that this type of conversion already includes the multiplication
   * of two conjugate quaternions. If q is a quaternion, p is the conjugate
   * quaternion of q, then the counterclockwise rotation matrix of a given
   * vector v can be expressed via: qvp. The corresponding rotation matrix
   * is: q.toRoMat()
   *
   * @returns the rotation matrix
   */
  // prettier-ignore
  toRoMat(): Mat4 {
    const w = this.a;
    const x = this.v.x;
    const y = this.v.y;
    const z = this.v.z;
    const m = new Mat4([
      1-2*y*y-2*z*z, 2*x*y-2*z*w, 2*x*z+2*y*w, 0,
      2*x*y + 2*z*w, 1-2*x*x-2*z*z, 2*y*z-2*x*w, 0,
      2*x*z-2*y*w, 2*y*z+2*x*w, 1-2*x*x-2*y*y, 0,
      0, 0, 0, 1,
    ])
    return m;
  }
}
