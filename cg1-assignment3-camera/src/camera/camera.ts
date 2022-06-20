/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Mat4} from '../math/mat4';
import {Vec4} from '../math/vec4';

/**
 * Camera is an interface that defines the abstract methods that should
 * be supported by any type of cameras.
 */
export interface ICamera {
  viewMatrix(): Mat4;
  projMatrix(): Mat4;
}

/**
 * Camera is an interface represents either a perspective camera
 * or a orthographic camera.
 */
export class Camera {
  position: Vec4;
  lookAt: Vec4;
  up: Vec4;
  /**
   * constrctor constructs a camera using given parameters.
   *
   * @param position represents the camera position
   * @param lookAt represents the *position* of where the camera is looking
   * @param up specifies the up direction of the given camera, the up
   * direction is not guaranteed to be orthogonal to the look at direction.
   */
  constructor(position: Vec4, lookAt: Vec4, up: Vec4) {
    this.position = position;
    this.lookAt = lookAt;
    this.up = up;
  }
  /**
   * viewMatrix returns the view transformation matrix for the given camera
   * settings.
   *
   * @returns the view transformation matrix
   */
  // prettier-ignore
  viewMatrix(): Mat4 {
    // TODO
    const translation = new Mat4([
      1,0,0,-this.position.x,
      0,1,0,-this.position.y,
      0,0,1,-this.position.z,
      0,0,0,1
    ])
    
  
    const xcross = this.up.y * this.lookAt.z - this.up.z * this.lookAt.y;
    const ycross = this.up.z * this.lookAt.x - this.up.x * this.lookAt.z;
    const zcross = this.up.x * this.lookAt.y - this.up.y * this.lookAt.x;

    //const helper = this.lookAt.cross(this.up);
    const rotation = new Mat4([
      xcross, ycross, zcross, 0,
      this.up.x, this.up.y, this.up.z, 0,
      -this.lookAt.x, -this.lookAt.y, -this.lookAt.z ,0,
      0,0,0,1
    ])
    return translation.mulM(rotation);
  }

  projMatrix(): Mat4 {
    throw new Error('unsupported when camera type is not specified!');
  }
}

/**
 * PerspectiveCamera extends the Camera implemnetation and provides a
 * perspective projection method.
 */
export class PerspectiveCamera extends Camera {
  fov: number;
  aspect: number;
  near: number;
  far: number;

  constructor(
    position: Vec4,
    lookAt: Vec4,
    up: Vec4,
    fov = 45,
    aspect = 1,
    near = 0.1,
    far = 1000
  ) {
    super(position, lookAt, up);
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
  /**
   * projMatrix returns an perspective projection matrix.
   * @returns the resulting projection matrix.
   */
  // prettier-ignore
  projMatrix(): Mat4 {
    // TODO: implement perspective projection transformation (Tpersp)
    return new Mat4([
      -(1/(this.aspect*Math.tan(this.fov/2))), 0, 0, 0,
      0, -(1/(Math.tan(this.fov/2))), 0, 0,
      0, 0, (this.near+this.far)/(this.near-this.far), 0,
      0, 0, 1, 0] )
  }
}

/**
 * OrthographicCamera extends the Camera implemnetation and provides a
 * orthographic projection method.
 */
export class OrthographicCamera extends Camera {
  left: number;
  right: number;
  bottom: number;
  top: number;
  near: number;
  far: number;

  constructor(
    position: Vec4,
    lookAt: Vec4,
    up: Vec4,
    left = -1,
    right = 1,
    bottom = -1,
    top = 1,
    near = 1,
    far = -1
  ) {
    super(position, lookAt, up);
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.near = near;
    this.far = far;
  }
  /**
   * projMatrix returns an orthographic projection matrix.
   * @returns the resulting projection matrix.
   */
  // prettier-ignore
  projMatrix(): Mat4 {  
    return new Mat4([
      2/(this.right-this.left), 0, 0, (this.left+this.right)/(this.left-this.right),
      0, 2/(this.top-this.bottom), 0, (this.bottom+this.top)/(this.bottom-this.top),
      0, 0, 2/(this.near-this.far), (this.far+this.near)/(this.far-this.near),
      0, 0, 0, 1
    ])
  }
}

/**
 * viewportMatrix returns the viewport matrix.
 * @param width is the screen width
 * @param height is the screen height
 * @returns the resulting viewport matrix.
 */
// prettier-ignore
export function viewportMatrix(width: number, height: number): Mat4 {
  // TODO: implement viewport transformation (Tviewport)
  return new Mat4([
    width/2,0,0,width/2,
    0,height/2,0,height/2,
    0,0,1,0,
    0,0,0,1
  ])
}
