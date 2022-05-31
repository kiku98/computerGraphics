"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectOr = exports.randomInts = exports.checkEqual = void 0;
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
const vec4_1 = require("../src/math/vec4");
const jest_diff_1 = require("jest-diff");
const utils_1 = require("../src/math/utils");
/**
 * checkEqual implements an approximate equal check of two given
 * parameters. Instead of using expect(v1).toBe(v2) from jest, the
 * purpose of this function is to compare the parameters using
 * utils.approxEqual to get a lower precision numerical checking.
 *
 * Furthermore, this function will console log the difference of the two
 * given parameters using jest.diffDefault. to get a better output in
 * understanding what went wrong.
 *
 * @param got is either a number, or a Vec4, or a Mat4.
 * @param want is either a number, or a Vec4, or a Mat4.
 * @returns true if equal or false if not.
 */
function checkEqual(got, want, log = true) {
    let equal = false;
    if (got instanceof vec4_1.Vec4) {
        equal = got.eq(want);
    }
    else {
        equal = (0, utils_1.approxEqual)(got, want);
    }
    if (!equal && log) {
        // log the difference if not equal.
        console.log(expect.getState().currentTestName + '\n', (0, jest_diff_1.diff)(want, got));
    }
    return equal;
}
exports.checkEqual = checkEqual;
/**
 * randomInts returns a random integer in [0, 10)
 * @returns an integer
 */
function randomInts() {
    return Math.floor(Math.random() * 10);
}
exports.randomInts = randomInts;
/**
 * expectOr test if there is a test can success.
 * @param tests all kinds of test
 */
// a helper to check multiple solution
function expectOr(...tests) {
    try {
        tests.shift()();
    }
    catch (e) {
        if (tests.length)
            expectOr(...tests);
        else
            throw e;
    }
}
exports.expectOr = expectOr;
//# sourceMappingURL=utils.js.map