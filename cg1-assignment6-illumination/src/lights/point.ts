/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Vec4} from '../math/vec4';

/**
 * PointLight represents a point light.
 */
export class PointLight {
  position: Vec4;
  color: Vec4;

  /**
   * constructor constructs a point light with given position and color.
   * @param pos is the position of the point light
   * @param color is the color of the point light
   */
  constructor(pos: Vec4, color = new Vec4(255, 255, 255, 1)) {
    this.position = pos;
    this.color = color;
  }
}
