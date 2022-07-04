/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Mat4} from '../math/mat4';
import {Vec4} from '../math/vec4';
import {Quaternion} from '../math/quaternion';

/**
 * Object3D implements the abstraction for a transformable object.
 *
 * A 3D object can be rotated, scaled and translated.
 */
export class Object3D {
  // context accumulates applied transformation matrices (multiplied
  // from left side) for the given mesh.
  //
  // context is a persistant status for the given mesh and can be reused
  // for each of the rendering frame unless the mesh intentionally calls
  // reset() method.
  context: Mat4;

  constructor() {
    this.context = new Mat4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  /**
   * modelMatrix returns the transformation matrix.
   *
   * @returns the model matrix.
   */
  modelMatrix(): Mat4 {
    return this.context;
  }
  /**
   * reset resets the transformation context.
   */
  // prettier-ignore
  reset() {
    this.context = new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }
  /**
   * scale applies scale transformation on the given mesh.
   * @param sx is a scaling factor on x-axis
   * @param sy is a scaling factor on y-axis
   * @param sz is a scaling factor on z-axis
   */
  // prettier-ignore
  scale(sx: number, sy: number, sz: number) {
    const scaleM = new Mat4([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1
    ])

    this.context = scaleM.mulM(this.context);
  }
  /**
   * translate applies translation on the given mesh.
   * @param tx is a translation factor on x-axis
   * @param ty is a translation factor on y-axis
   * @param tz is a translation factor on z-axis
   */
  // prettier-ignore
  translate(tx: number, ty: number, tz: number) {
    const transM = new Mat4([
      1, 0, 0, tx,
      0, 1, 0, ty,
      0, 0, 1, tz,
      0, 0, 0, 1,
    ])
    this.context = transM.mulM(this.context);
  }
  /**
   * rotate applies rotation on the given mesh.
   * @param dir is a given rotation direction.
   * @param angle is a given rotation angle counterclockwise.
   */
  rotate(dir: Vec4, angle: number) {
    const u = dir.unit();
    const cosa = Math.cos(angle / 2);
    const sina = Math.sin(angle / 2);
    const q = new Quaternion(cosa, sina * u.x, sina * u.y, sina * u.z);
    this.context = q.toRoMat().mulM(this.context);
  }
}
