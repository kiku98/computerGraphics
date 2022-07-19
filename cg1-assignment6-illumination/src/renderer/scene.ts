/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {ICamera} from '../camera/camera';
import {Mesh} from '../geometry/mesh';
import {PointLight} from '../lights/point';

/**
 * Scene is a basic scene graph.
 */
export class Scene {
  meshes: Mesh[];
  camera: ICamera;
  light: PointLight;

  /**
   * constructor constructs a very basic scene graph which only allows
   * containing a group of triangle mesh and a camera.
   *
   * @param meshes is a group of triangle mesh
   * @param light is a point light
   * @param camera is a camera either is perspective or orthographic
   */
  constructor(meshes: Mesh[], light: PointLight, camera: ICamera) {
    this.meshes = meshes;
    this.camera = camera;
    this.light = light;
  }
}
