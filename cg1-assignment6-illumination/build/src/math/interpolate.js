"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampV = exports.clamp = exports.LerpV = exports.Lerp = void 0;
const vec4_1 = require("./vec4");
/**
 * Lerp is a linear interpolation of two numbers.
 *
 * @param from is one side of the interpolation endpoint
 * @param to is the other side of the interpolation endpoint
 * @param t is the interpolation parameter in [0, 1].
 */
function Lerp(from, to, t) {
    // TODO: Implement linear interpolation between two numbers.
    //
    // For instance, if from === 0, to === 1, then it should return 0.3
    // if t === 0.3.
    return from + t * (to - from);
}
exports.Lerp = Lerp;
/**
 * LerpV is a linear interpolation of two Vec4s.
 *
 * @param from is one side of the interpolation endpoint
 * @param to is the other side of the interpolation endpoint
 * @param t is the interpolation parameter in [0, 1].
 */
function LerpV(from, to, t) {
    // TODO: Implement linear interpolation between two Vec4s.
    //
    // All components should be interpolated linearly using t.
    return new vec4_1.Vec4(Lerp(from.x, to.x, t), Lerp(from.y, to.y, t), Lerp(from.z, to.z, t), Lerp(from.w, to.w, t));
}
exports.LerpV = LerpV;
function clamp(v, min = 0, max = 255) {
    return Math.min(Math.max(v, min), max);
}
exports.clamp = clamp;
function clampV(v, min = 0, max = 255) {
    return new vec4_1.Vec4(Math.min(Math.max(v.x, min), max), Math.min(Math.max(v.y, min), max), Math.min(Math.max(v.z, min), max), Math.min(Math.max(v.w, min), max));
}
exports.clampV = clampV;
//# sourceMappingURL=interpolate.js.map