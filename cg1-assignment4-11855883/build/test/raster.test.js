"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const aabb_1 = require("../src/geometry/aabb");
const mat4_1 = require("../src/math/mat4");
const vec4_1 = require("../src/math/vec4");
const raster_1 = require("../src/renderer/raster");
const utils_1 = require("./utils");
let score = 0;
let sanityPass = false;
afterAll(() => {
    if (!sanityPass) {
        // The final result depends on the sanity checks.
        // If there exists any sanity checks failed, the whole test is not
        // trustable. In this case, we set the score to zero.
        //
        // This should arise the biggest attention to let correct check
        // why this submission got 0 and did some manual inspections and
        // see whether it is our mistake or the submission is faulty.
        score = 0;
    }
    console.log(`Total collected points: ${score}`);
});
describe('sanity check', () => {
    let sanity = 0;
    // Sanity check, in case eq was changed from the provided implementation.
    test('Vec4.eq', () => {
        const v1 = new vec4_1.Vec4(1.00000009, 2, 3, 4);
        const v2 = new vec4_1.Vec4(1, 2, 3, 4);
        const v3 = new vec4_1.Vec4(0, 0, 0, 0);
        expect((0, utils_1.checkEqual)(v1, v2)).toBe(true);
        expect((0, utils_1.checkEqual)(v1, v3, false)).toBe(false);
        sanity++;
    });
    test('Vec4.copy', () => {
        const v = new vec4_1.Vec4(1.0000009, 2, 3, 4);
        expect((0, utils_1.checkEqual)(v, v.copy())).toBe(true);
        sanity++;
    });
    // prettier-ignore
    test('Rasterizer.viewportMatrix', () => {
        const want = new mat4_1.Mat4([
            400, 0, 0, 400,
            0, 250, 0, 250,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        const r = new raster_1.Rasterizer(800, 500);
        const got = r.viewportMatrix();
        expect((0, utils_1.checkEqual)(want, got)).toBe(true);
        sanity++;
    });
    test('sanity pass?', () => {
        expect(sanity).toBe(3);
        sanityPass = true;
    });
});
test('(+2) AABB.constructor', () => {
    const tests = [
        {
            v1: new vec4_1.Vec4(1, 0, 0, 1),
            v2: new vec4_1.Vec4(0, 1, 0, 1),
            v3: new vec4_1.Vec4(0, 0, 1, 1),
            min: new vec4_1.Vec4(0, 0, 0, 1),
            max: new vec4_1.Vec4(1, 1, 1, 1),
        },
    ];
    for (const tt of tests) {
        const aabb = new aabb_1.AABB(tt.v1, tt.v2, tt.v3);
        expect((0, utils_1.checkEqual)(aabb.min, tt.min)).toBe(true);
        expect((0, utils_1.checkEqual)(aabb.max, tt.max)).toBe(true);
    }
    score += 2;
});
test('(+3) AABB.intersect', () => {
    const tests = [
        {
            v1: new vec4_1.Vec4(1, 0, 0, 1),
            v2: new vec4_1.Vec4(0, 1, 0, 1),
            v3: new vec4_1.Vec4(0, 0, 1, 1),
            v4: new vec4_1.Vec4(-1, -0.5, -0.5, 1),
            v5: new vec4_1.Vec4(-0.5, -1, -0.5, 1),
            v6: new vec4_1.Vec4(-0.5, -0.5, -1, 1),
            want: false,
        },
        {
            v1: new vec4_1.Vec4(1, 0, 0, 1),
            v2: new vec4_1.Vec4(0, 1, 0, 1),
            v3: new vec4_1.Vec4(0, 0, 1, 1),
            v4: new vec4_1.Vec4(0.5, 0, 0, 1),
            v5: new vec4_1.Vec4(0, 0.5, 0, 1),
            v6: new vec4_1.Vec4(0, 0, 0.5, 1),
            want: true,
        },
        {
            v1: new vec4_1.Vec4(1, 0, 0, 1),
            v2: new vec4_1.Vec4(0, 1, 0, 1),
            v3: new vec4_1.Vec4(0, 0, 1, 1),
            v4: new vec4_1.Vec4(-1, 0, 0, 1),
            v5: new vec4_1.Vec4(0, -1, 0, 1),
            v6: new vec4_1.Vec4(0, 0, -1, 1),
            want: true,
        },
    ];
    for (const tt of tests) {
        const aabb1 = new aabb_1.AABB(tt.v1, tt.v2, tt.v3);
        const aabb2 = new aabb_1.AABB(tt.v4, tt.v5, tt.v6);
        expect(aabb1.intersect(aabb2)).toBe(tt.want);
    }
    score += 3;
});
test('(+2) Rasterizer.initFrameBuffer', () => {
    const r = new raster_1.Rasterizer(10, 10);
    const buf = r.initFrameBuffer();
    expect(buf).not.toBeNull();
    expect(buf.length).toBe(10 * 10);
    buf.forEach(v => {
        expect((0, utils_1.checkEqual)(v, new vec4_1.Vec4(0, 0, 0, 1))).toBe(true);
    });
    score += 2;
});
test('(+3) Rasterizer.vertexShader', () => {
    // Note: Not provided. Will run at correction.
    score += 3;
});
test('(+2) Rasterizer.isBackFace', () => {
    // Note: Not provided. Will run at correction.
    score += 2;
});
test('(+3) Rasterizer.isInViewport', () => {
    // Note: Not provided. Will run at correction.
    score += 3;
});
test('(+3) Rasterizer.isInsideTriangle', () => {
    // Note: Not provided. Will run at correction.
    score += 3;
});
test('(+2) Rasterizer.updateBuffer', () => {
    const width = 10;
    const height = 10;
    const buf = new Array(width * height).fill(0);
    const r = new raster_1.Rasterizer(width, height);
    // invalid inputs
    r.updateBuffer(buf, -1, -1, 100);
    let want = new Array(width * height).fill(0);
    expect(JSON.stringify(buf)).toBe(JSON.stringify(want));
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            r.updateBuffer(buf, i, j, 100);
        }
    }
    want = new Array(width * height).fill(100);
    expect(JSON.stringify(buf)).toBe(JSON.stringify(want));
    score += 2;
});
//# sourceMappingURL=raster.test.js.map