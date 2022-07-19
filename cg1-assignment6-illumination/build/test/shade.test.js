"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const camera_1 = require("../src/camera/camera");
const mesh_1 = require("../src/geometry/mesh");
const point_1 = require("../src/lights/point");
const utils_1 = require("../src/math/utils");
const vec4_1 = require("../src/math/vec4");
const material_1 = require("../src/material/material");
const raster_1 = require("../src/renderer/raster");
const utils_2 = require("./utils");
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
        expect((0, utils_2.checkEqual)(v1, v2)).toBe(true);
        expect((0, utils_2.checkEqual)(v1, v3, false)).toBe(false);
        sanity++;
    });
    test('Vec4.copy', () => {
        const v = new vec4_1.Vec4(1.0000009, 2, 3, 4);
        expect((0, utils_2.checkEqual)(v, v.copy())).toBe(true);
        sanity++;
    });
    test('sanity pass?', () => {
        expect(sanity).toBe(2);
        sanityPass = true;
    });
});
test('(+1p) TriangleMesh.normalMatrix', () => {
    const m = new mesh_1.Mesh([new vec4_1.Vec4(5, 0, 0, 1), new vec4_1.Vec4(0, 0, 0, 1), new vec4_1.Vec4(0, 0, 5, 1)], [], [], []);
    m.translate(10, 5, 1);
    m.translate(1, 5, 10);
    m.scale(2, 1, 3);
    m.rotate(new vec4_1.Vec4(1, 2, 3, 0), Math.PI / 6);
    const modelMat = m.modelMatrix();
    expect(modelMat.inv().T().eq(m.normalMatrix())).toBe(true);
    score += 1;
});
test('(+1p) Rasterizer.lightDir', () => {
    const l = new point_1.PointLight(new vec4_1.Vec4(1, 1, 1, 1), new vec4_1.Vec4(255, 255, 255, 1));
    const x = new vec4_1.Vec4(5, 5, 0, 1);
    const r = new raster_1.Rasterizer(10, 10, 2);
    expect((0, utils_2.checkEqual)(r.lightDir(x, l), new vec4_1.Vec4(-0.6963106238227914, -0.6963106238227914, 0.17407765595569785, 0))).toBe(true);
    score += 1;
});
test('(+1p) Rasterizer.viewDir', () => {
    const params = {
        camera: {
            position: new vec4_1.Vec4(-550, 194, 734, 1),
            fov: 45,
            aspect: 1.6,
            near: -100,
            far: -600,
            lookAt: new vec4_1.Vec4(-1000, 0, 0, 1),
            up: new vec4_1.Vec4(0, 1, 1, 0),
        },
    };
    const c = new camera_1.PerspectiveCamera(params.camera.position, params.camera.lookAt, params.camera.up, params.camera.fov, params.camera.aspect, params.camera.near, params.camera.far);
    const x = new vec4_1.Vec4(5, 5, 0, 1);
    const r = new raster_1.Rasterizer(10, 10, 2);
    expect((0, utils_2.checkEqual)(r.viewDir(x, c), new vec4_1.Vec4(-0.5907927184545819, 0.2011888716899387, 0.7813366762984921, 0))).toBe(true);
    score += 1;
});
test('(+1p) Rasterizer.halfVector', () => {
    const L = new vec4_1.Vec4(1, 2, 3, 0).unit();
    const V = new vec4_1.Vec4(4, 3, 1, 0).unit();
    const r = new raster_1.Rasterizer(10, 10, 2);
    expect((0, utils_2.checkEqual)(r.halfVector(L, V), new vec4_1.Vec4(0.5735270683246122, 0.612323915558148, 0.5441747185734682, 0))).toBe(true);
    score += 1;
});
test('(+1p) Rasterizer.La', () => {
    const r = new raster_1.Rasterizer(10, 10, 2);
    const matopts = new material_1.MaterialOptions(0.5, 1.2, 0.8, 100);
    expect(r.La(matopts)).toBe(0.5);
    score += 1;
});
test('(+1p) Rasterizer.Ld', () => {
    const r = new raster_1.Rasterizer(10, 10, 2);
    const matopts = new material_1.MaterialOptions(0.5, 1.2, 0.8, 100);
    expect((0, utils_1.approxEqual)(r.Ld(matopts, new vec4_1.Vec4(1, 2, 33, 0).unit(), new vec4_1.Vec4(1, 45, 3, 0).unit()), 0.15280725676270987)).toBe(true);
    score += 1;
});
test('(+1p) Rasterizer.Ls', () => {
    const r = new raster_1.Rasterizer(10, 10, 2);
    const matopts = new material_1.MaterialOptions(0.5, 1.2, 0.8, 100);
    expect((0, utils_1.approxEqual)(r.Ls(matopts, new vec4_1.Vec4(11, 2, 3, 0).unit(), new vec4_1.Vec4(1, 23, 34, 0).unit()), 2.211484940756446e-48)).toBe(true);
    score += 1;
});
test('(+1p) Rasterizer.blinnPhong', () => {
    const params = {
        camera: {
            position: new vec4_1.Vec4(-550, 194, 734, 1),
            fov: 45,
            aspect: 1.6,
            near: -100,
            far: -600,
            lookAt: new vec4_1.Vec4(-1000, 0, 0, 1),
            up: new vec4_1.Vec4(0, 1, 1, 0),
        },
    };
    const c = new camera_1.PerspectiveCamera(params.camera.position, params.camera.lookAt, params.camera.up, params.camera.fov, params.camera.aspect, params.camera.near, params.camera.far);
    const r = new raster_1.Rasterizer(10, 10, 2);
    r.La = () => {
        return 1;
    };
    r.Ld = () => {
        return 2;
    };
    r.Ls = () => {
        return 3;
    };
    expect(r.blinnPhong(new vec4_1.Vec4(5, 5, 0, 1), new vec4_1.Vec4(0, 0, 0, 0), new material_1.MaterialOptions(), new point_1.PointLight(new vec4_1.Vec4(0, 0, 0, 1)), c)).toBe(6);
    score += 1;
});
test('(+2p) Rasterizer.antialiasing', () => {
    const framebuf = [
        new vec4_1.Vec4(255, 255, 255, 1),
        new vec4_1.Vec4(0, 0, 0, 1),
        new vec4_1.Vec4(0, 0, 0, 1),
        new vec4_1.Vec4(255, 255, 255, 1),
    ];
    const r = new raster_1.Rasterizer(1, 1, 2);
    const got = r.antialiasing(framebuf);
    const want = [new vec4_1.Vec4(127.5, 127.5, 127.5, 1)];
    expect(got.length).toBe(want.length);
    for (let i = 0; i < got.length; i++) {
        expect((0, utils_2.checkEqual)(got[i], want[i])).toBe(true);
    }
    score += 2;
});
//# sourceMappingURL=shade.test.js.map