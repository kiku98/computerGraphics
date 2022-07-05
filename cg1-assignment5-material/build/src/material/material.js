"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = void 0;
const vec4_1 = require("../math/vec4");
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
     * @param wireframeColor specifies the wireframe color
     */
    constructor(tex, showWireframe, wireframeColor = new vec4_1.Vec4(125, 125, 125, 1)) {
        this.texture = tex;
        this.showWireframe = showWireframe;
        this.wireframeColor = wireframeColor;
    }
}
exports.Material = Material;
//# sourceMappingURL=material.js.map