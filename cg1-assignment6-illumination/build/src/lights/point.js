"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointLight = void 0;
const vec4_1 = require("../math/vec4");
/**
 * PointLight represents a point light.
 */
class PointLight {
    /**
     * constructor constructs a point light with given position and color.
     * @param pos is the position of the point light
     * @param color is the color of the point light
     */
    constructor(pos, color = new vec4_1.Vec4(255, 255, 255, 1)) {
        this.position = pos;
        this.color = color;
    }
}
exports.PointLight = PointLight;
//# sourceMappingURL=point.js.map