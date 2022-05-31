"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.approxEqual = void 0;
/**
 * approxEqual checks whether two given numbers are approximately equal
 * @param v1 number
 * @param v2 number
 * @param epsilon tolerance
 * @returns true if v1 and v2 are approximately equal
 */
function approxEqual(v1, v2, epsilon = 1e-7) {
    return Math.abs(v1 - v2) <= epsilon;
}
exports.approxEqual = approxEqual;
//# sourceMappingURL=utils.js.map