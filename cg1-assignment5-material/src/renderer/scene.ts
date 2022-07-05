/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {ICamera} from '../camera/camera';
import {Mesh} from '../geometry/mesh';

/**
 * Scene is a basic scene graph.
 */
export class Scene {
  meshes: Mesh[];
  camera: ICamera;

  /**
   * constructor constructs a very basic scene graph which only allows
   * containing a group of triangle mesh and a camera.
   *
   * @param meshes is a group of triangle mesh
   * @param camera is a camera either is perspective or orthographic
   */
  constructor(meshes: Mesh[], camera: ICamera) {
    this.meshes = meshes;
    this.camera = camera;
  }
}
