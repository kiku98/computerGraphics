"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LerpV = exports.Lerp = void 0;
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
    return (to - from) * t;
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
    return new vec4_1.Vec4(Lerp(to.x, from.x, t), Lerp(to.y, from.y, t), Lerp(to.z, from.z, t), from.w);
}
exports.LerpV = LerpV;
//# sourceMappingURL=interpolate.js.map