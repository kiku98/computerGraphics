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
        // DONE: computes the minimum AABB of the given triangle, and
        // stores the minimum and maximum corner of the bounding box in
        // this.min and this.max
        function largest(arr) {
            let i;
            // Initialize maximum element
            let max = arr[0];
            // Traverse array elements 
            // from second and compare
            // every element with current max 
            for (i = 1; i < arr.length; i++) {
                if (arr[i] > max)
                    max = arr[i];
            }
            return max;
        }
        function min(arr) {
            let i;
            // Initialize minimum element
            let min = arr[0];
            // Traverse array elements 
            // from second and compare
            // every element with current max 
            for (i = 1; i < arr.length; i++) {
                if (arr[i] < min)
                    min = arr[i];
            }
            return min;
        }
        const x_max = largest([v1.x, v2.x, v3.x]);
        const x_min = min([v1.x, v2.x, v3.x]);
        const y_max = largest([v1.y, v2.y, v3.y]);
        const y_min = min([v1.y, v2.y, v3.y]);
        const z_max = largest([v1.z, v2.z, v3.z]);
        const z_min = min([v1.z, v2.z, v3.z]);
        this.min = new vec4_1.Vec4(x_min, y_min, z_min, 1);
        this.max = new vec4_1.Vec4(x_max, y_max, z_max, 1);
    }
    /** DONE
     * intersect checks if the two given AABBs share an intersection.
     * If the two AABBs only share a single vertex or a 2D plane, then
     * it is also considered as an intersection and returns true.
     *
     * @param aabb is an other given AABB.
     * @returns true if the given two aabb share an intersection, false otherwise.
     */
    intersect(aabb) {
        return (this.min.x <= aabb.max.x && this.max.x >= aabb.min.x) &&
            (this.min.y <= aabb.max.y && this.max.y >= aabb.min.y) &&
            (this.min.z <= aabb.max.z && this.max.z >= this.min.z);
    }
}
exports.AABB = AABB;
//# sourceMappingURL=aabb.js.map