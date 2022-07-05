"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const interpolate_1 = require("../src/math/interpolate");
const vec4_1 = require("../src/math/vec4");
const texture_1 = require("../src/material/texture");
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
    test('sanity pass?', () => {
        expect(sanity).toBe(2);
        sanityPass = true;
    });
});
test('(+1p) Rasterizer.initDepthBuffer', () => {
    const r = new raster_1.Rasterizer(10, 10);
    const buf = r.initDepthBuffer();
    expect(buf).not.toBeNull();
    expect(buf.length).toBe(10 * 10);
    buf.forEach(v => {
        expect(v <= -1).toBe(true);
    });
    score += 1;
});
test('(+3p) Rasterizer.computeBarycentric', () => {
    const vs = [
        new vec4_1.Vec4(1, 5, 9, 1),
        new vec4_1.Vec4(3, 6, 7, 1),
        new vec4_1.Vec4(9, 51, 3, 1),
    ];
    const xys = [
        new vec4_1.Vec4(1, 5, 0, 1),
        new vec4_1.Vec4(3, 6, 0, 1),
        new vec4_1.Vec4(9, 51, 0, 1),
        new vec4_1.Vec4(1, 2, 0, 1),
    ];
    const wants = [
        new vec4_1.Vec4(1, 0, 0, 1),
        new vec4_1.Vec4(0, 1, 0, 1),
        new vec4_1.Vec4(0, 0, 1, 1),
        new vec4_1.Vec4(0.7857142857142857, 0.2857142857142857, -0.07142857142857142, 1),
    ];
    const r = new raster_1.Rasterizer(10, 10);
    for (let i = 0; i < xys.length; i++) {
        const got = r.computeBarycentric(xys[i], vs[0], vs[1], vs[2]);
        expect(got.eq(wants[i])).toEqual(true);
    }
    score += 3;
});
test('(+2p) Rasterizer.barycentricInterpolation', () => {
    const bc = [
        new vec4_1.Vec4(1, 0, 0, 1),
        new vec4_1.Vec4(0, 1, 0, 1),
        new vec4_1.Vec4(0, 0, 1, 1),
        new vec4_1.Vec4(0.7857142857142857, 0.2857142857142857, -0.07142857142857142, 1),
    ];
    const vs = [
        new vec4_1.Vec4(1, 5, 9, 1),
        new vec4_1.Vec4(3, 6, 7, 1),
        new vec4_1.Vec4(9, 51, 3, 1),
    ];
    const wants = [1, 3, 9, 1];
    const r = new raster_1.Rasterizer(10, 10);
    for (let i = 0; i < bc.length; i++) {
        const got = r.barycentricInterpolation(bc[i], vs[0].x, vs[1].x, vs[2].x);
        expect((0, utils_1.checkEqual)(got, wants[i])).toEqual(true);
    }
    score += 2;
});
test('(+2p) Rasterizer.passDepthTest', () => {
    const buf = [-0.5, -0.5, -0.5, -0.5];
    const r = new raster_1.Rasterizer(2, 2);
    expect(r.passDepthTest(buf, 1, 1, 0)).toBe(true);
    expect(r.passDepthTest(buf, 1, 1, -0.8)).toBe(false);
    score += 2;
});
test('(+2p) Rasterizer.computeMipmapLevel', () => {
    const r = new raster_1.Rasterizer(10, 10);
    const uv = [new vec4_1.Vec4(0.5, 0.5, 0, 1), new vec4_1.Vec4(0.5, 0.5, 0, 1)];
    const du = [new vec4_1.Vec4(0.6, 0.5, 0, 1), new vec4_1.Vec4(0.6, 0.4, 0, 1)];
    const dv = [new vec4_1.Vec4(0.5, 0.7, 0, 1), new vec4_1.Vec4(0.4, 0.7, 0, 1)];
    const want = [0.9999999999999997, 1.1609640474436806];
    for (let i = 0; i < uv.length; i++) {
        expect((0, utils_1.checkEqual)(r.computeMipmapLevel(10, uv[i], du[i], dv[i]), want[i])).toBe(true);
    }
    score += 2;
});
test('(+2p) Rasterizer.drawWireframe', () => {
    const r = new raster_1.Rasterizer(10, 10);
    const v1 = new vec4_1.Vec4(9, 0, 0, 1);
    const v2 = new vec4_1.Vec4(0, 9, 0, 1);
    const v3 = new vec4_1.Vec4(0, 0, 0, 1);
    const frameBuf = new Array(10 * 10).fill(new vec4_1.Vec4(0, 0, 0, 1));
    const depthBuf = new Array(10 * 10).fill(-1);
    const color = new vec4_1.Vec4(0, 128, 255, 1);
    const want = [
        new vec4_1.Vec4(-9, 9, 0, 0),
        new vec4_1.Vec4(0, -9, 0, 0),
        new vec4_1.Vec4(9, 0, 0, 0),
    ];
    let callCount = 0;
    r.drawLine = (buf1, buf2, p1, p2, c) => {
        expect(buf1).toBe(frameBuf);
        expect(buf2).toBe(depthBuf);
        expect(c).toBe(color);
        const got = p2.sub(p1);
        let found = false;
        for (let i = 0; i < want.length; i++) {
            if ((0, utils_1.checkEqual)(want[i], got, false)) {
                found = true;
                want.slice(i, 1);
            }
        }
        expect(found).toBe(true);
        callCount++;
    };
    r.drawWireframe(frameBuf, depthBuf, v1, v2, v3, color);
    expect(callCount).toBe(3);
    score += 2;
});
test('(+2p) Texture.createMipmap', () => {
    const data = [
        new vec4_1.Vec4(255, 255, 255, 1),
        new vec4_1.Vec4(0, 0, 0, 1),
        new vec4_1.Vec4(0, 0, 0, 1),
        new vec4_1.Vec4(255, 255, 255, 1),
    ];
    const t = new texture_1.Texture(2, data, false);
    t.enableMipmap = true;
    const mipmap = t.createMipmap(data);
    expect(mipmap.length).toBe(2);
    const L0 = mipmap[0];
    expect(L0.length).toBe(4);
    for (let i = 0; i < data.length; i++) {
        expect((0, utils_1.checkEqual)(L0[i], data[i])).toBe(true);
    }
    const L1 = mipmap[1];
    expect(L1.length).toBe(1);
    expect((0, utils_1.checkEqual)(L1[0], new vec4_1.Vec4(127.5, 127.5, 127.5, 1))).toBe(true);
    score += 2;
});
test('(+1p) Lerp', () => {
    const from = 0;
    const to = 1;
    const t = 0.5;
    expect((0, utils_1.checkEqual)((0, interpolate_1.Lerp)(from, to, t), 0.5)).toBe(true);
    score += 1;
});
test('(+1p) LerpV', () => {
    const from = new vec4_1.Vec4(1, 1, 1, 1);
    const to = new vec4_1.Vec4(0, 0, 0, 1);
    const t = 0.5;
    expect((0, utils_1.checkEqual)((0, interpolate_1.LerpV)(from, to, t), new vec4_1.Vec4(0.5, 0.5, 0.5, 1))).toBe(true);
    score += 1;
});
test('(+2p) Texture.bilinear', () => {
    // Note: Not provided. Will run at correction.
    score += 2;
});
test('(+2p) Texture.trilinear', () => {
    // Note: Not provided. Will run at correction.
    score += 2;
});
//# sourceMappingURL=texture.test.js.map