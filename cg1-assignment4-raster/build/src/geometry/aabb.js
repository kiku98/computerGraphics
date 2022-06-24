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
 * AABB represents the minimum axis-aligned bounding box for given vertices.
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
        // TODO: computes the minimum AABB of the given triangle, and
        // stores the minimum and maximum corner of the bounding box in
        // this.min and this.max
        this.min = new vec4_1.Vec4(0, 0, 0, 0);
        this.max = new vec4_1.Vec4(0, 0, 0, 0);
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
        // TODO: check if given two AABBs share an intersection.
        return false;
    }
}
exports.AABB = AABB;
//# sourceMappingURL=aabb.js.map