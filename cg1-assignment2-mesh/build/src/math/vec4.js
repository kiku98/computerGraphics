"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec4 = void 0;
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
const utils_1 = require("./utils");
/**
 * Vec4 is a homogenous representation of a 3D point (w === 1)
 * or 3D vector (w === 0).
 */
class Vec4 {
    /**
     * constructor constructs a Vector with given x, y, z, w components.
     *
     * @param x component
     * @param y component
     * @param z component
     * @param w component
     */
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    /**
     * eq checks whether two vectors are equal.
     * @param v is a Vec4 vector
     * @returns true if two given vectors are approximately equal, otherwise false.
     */
    eq(v) {
        return ((0, utils_1.approxEqual)(this.x, v.x) &&
            (0, utils_1.approxEqual)(this.y, v.y) &&
            (0, utils_1.approxEqual)(this.z, v.z) &&
            (0, utils_1.approxEqual)(this.w, v.w));
    }
    /**
     * copy copies the current vector
     * @returns a copy of the current vector
     */
    copy() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }
}
exports.Vec4 = Vec4;
//# sourceMappingURL=vec4.js.map