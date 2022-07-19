"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = exports.MaterialOptions = void 0;
const vec4_1 = require("../math/vec4");
/**
 * MaterialOptions contains rendering options for a material.
 */
class MaterialOptions {
    constructor(Kamb = 1, Kdiff = 1, Kspec = 1, shininess = 1) {
        this.Kamb = Kamb;
        this.Kspec = Kspec;
        this.Kdiff = Kdiff;
        this.shininess = shininess;
    }
}
exports.MaterialOptions = MaterialOptions;
/**
 * Material represents a material for surface shading. It supports
 * diffuse color texture mapping and wireframe mode.
 */
class Material {
    /**
     * constructor constructs a material for a given mesh-based surface.
     *
     * @param tex is a texture object
     * @param showWireframe enables wireframe drawing
     * @param opts is the rendering options of the material
     * @param wireframeColor specifies the wireframe color
     */
    constructor(tex, showWireframe, opts, wireframeColor = new vec4_1.Vec4(125, 125, 125, 1)) {
        this.texture = tex;
        this.showWireframe = showWireframe;
        this.wireframeColor = wireframeColor;
        this.options = opts;
    }
}
exports.Material = Material;
//# sourceMappingURL=material.js.map