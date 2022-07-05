"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AABB = void 0;
const vec4_1 = require("../math/vec4");
/**
 * AABB represents an AABB of the given vertices.
 */
class AABB {
    /**
     * constructor constructs the minimum axis aligned bounding box of the
     * given vertices.
     *
     * @param v1 is a point position
     * @param v2 is a point position
     * @param v3 is a point position
     */
    constructor(v1, v2, v3) {
        const xMin = Math.min(v1.x, v2.x, v3.x);
        const yMin = Math.min(v1.y, v2.y, v3.y);
        const zMin = Math.min(v1.z, v2.z, v3.z);
        const xMax = Math.max(v1.x, v2.x, v3.x);
        const yMax = Math.max(v1.y, v2.y, v3.y);
        const zMax = Math.max(v1.z, v2.z, v3.z);
        this.min = new vec4_1.Vec4(xMin, yMin, zMin, 1);
        this.max = new vec4_1.Vec4(xMax, yMax, zMax, 1);
    }
    /**
     * intersect checks if the two given AABBs share an intersection.
     * If the two AABBs only share a single vertex or a 2D plane, then
     * it is also considered as an intersection and returns true.
     *
     * @param aabb is an other given AABB.
     * @returns true if the given two aabb share an intersection, false otherwise.
     */
    intersect(aabb) {
        const min = new vec4_1.Vec4(Math.max(this.min.x, aabb.min.x), Math.max(this.min.y, aabb.min.y), Math.max(this.min.z, aabb.min.z), 1);
        const max = new vec4_1.Vec4(Math.min(this.max.x, aabb.max.x), Math.min(this.max.y, aabb.max.y), Math.min(this.max.z, aabb.max.z), 1);
        if (min.x <= max.x && min.y <= max.y && min.z <= max.z) {
            return true;
        }
        return false;
    }
}
exports.AABB = AABB;
//# sourceMappingURL=aabb.js.map