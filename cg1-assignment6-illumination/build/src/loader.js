"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTexture = exports.loadCamera = exports.loadModel = void 0;
const three_1 = require("three");
const camera_1 = require("./camera/camera");
const mesh_1 = require("./geometry/mesh");
const vec4_1 = require("./math/vec4");
const texture_1 = require("./material/texture");
async function loadModel(name) {
    const resp = await fetch(`./assets/${name}.obj`);
    const data = await resp.text();
    return (0, mesh_1.LoadOBJ)(data);
}
exports.loadModel = loadModel;
function loadCamera(persp) {
    const params = {
        pos: new vec4_1.Vec4(-0.5, 0.5, 0.5, 1),
        lookAt: new vec4_1.Vec4(0, 0, -0.5, 1),
        up: new vec4_1.Vec4(0, 1, 0, 0),
    };
    if (persp) {
        const perspParam = {
            fov: 45,
            aspect: window.innerWidth / window.innerHeight,
            near: -0.1,
            far: -3,
        };
        return new camera_1.PerspectiveCamera(params.pos, params.lookAt, params.up, perspParam.fov, perspParam.aspect, perspParam.near, perspParam.far);
    }
    const orthoParam = {
        left: -window.innerWidth / 2500,
        right: window.innerWidth / 2500,
        top: window.innerHeight / 2500,
        bottom: -window.innerHeight / 2500,
        near: 0,
        far: -2,
    };
    return new camera_1.OrthographicCamera(params.pos, params.lookAt, params.up, orthoParam.left, orthoParam.right, orthoParam.bottom, orthoParam.top, orthoParam.near, orthoParam.far);
}
exports.loadCamera = loadCamera;
async function loadTexture(name) {
    const load = (url) => {
        return new Promise(resolve => new three_1.TextureLoader().load(url, resolve));
    };
    const t = await load(`./assets/${name}.png`);
    if (t.image.width !== t.image.height) {
        throw new Error('unsupported texture size, expect a square!');
    }
    const size = t.image.width;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    context.drawImage(t.image, 0, 0, canvas.width, canvas.height);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const buf = new Array(size * size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            // reverse y coordinates at loading time, so that u,v, or others
            // consistent with the coordinate system where origin is on bottom
            // left corner.
            buf[i + (size - j - 1) * size] = new vec4_1.Vec4(data[(i + j * size) * 4 + 0], data[(i + j * size) * 4 + 1], data[(i + j * size) * 4 + 2], data[(i + j * size) * 4 + 3]);
        }
    }
    return new texture_1.Texture(size, buf, true);
}
exports.loadTexture = loadTexture;
//# sourceMappingURL=loader.js.map