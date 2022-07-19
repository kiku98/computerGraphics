/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Vec4} from '../math/vec4';
import {Texture} from './texture';

/**
 * MaterialOptions contains rendering options for a material.
 */
export class MaterialOptions {
  Kdiff: number; // diffuse
  Kspec: number; // specular
  Kamb: number; // ambient
  shininess: number;
  constructor(Kamb = 1, Kdiff = 1, Kspec = 1, shininess = 1) {
    this.Kamb = Kamb;
    this.Kspec = Kspec;
    this.Kdiff = Kdiff;
    this.shininess = shininess;
  }
}

/**
 * Material represents a material for surface shading. It supports
 * diffuse color texture mapping and wireframe mode.
 */
export class Material {
  texture: Texture;
  showWireframe: boolean;
  wireframeColor: Vec4;
  options: MaterialOptions;

  /**
   * constructor constructs a material for a given mesh-based surface.
   *
   * @param tex is a texture object
   * @param showWireframe enables wireframe drawing
   * @param opts is the rendering options of the material
   * @param wireframeColor specifies the wireframe color
   */
  constructor(
    tex: Texture,
    showWireframe: boolean,
    opts: MaterialOptions,
    wireframeColor = new Vec4(125, 125, 125, 1)
  ) {
    this.texture = tex;
    this.showWireframe = showWireframe;
    this.wireframeColor = wireframeColor;
    this.options = opts;
  }
}
