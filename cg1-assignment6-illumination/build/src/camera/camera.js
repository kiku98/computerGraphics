"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewportMatrix = exports.OrthographicCamera = exports.PerspectiveCamera = exports.Camera = void 0;
const mat4_1 = require("../math/mat4");
/**
 * Camera is an interface represents either a perspective camera
 * or a orthographic camera.
 */
class Camera {
    /**
     * constrctor constructs a camera using given parameters.
     *
     * @param position represents the camera position
     * @param lookAt represents the *position* of where the camera is looking
     * @param up specifies the up direction of the given camera, the up
     * direction is not guaranteed to be orthogonal to the look at direction.
     */
    constructor(position, lookAt, up) {
        this.position = position;
        this.lookAt = lookAt;
        this.up = up;
    }
    /**
     * viewMatrix returns the view transformation matrix for the given camera
     * settings.
     *
     * @returns the view transformation matrix
     */
    // prettier-ignore
    viewMatrix() {
        const l = this.lookAt.sub(this.position).unit();
        const lxu = l.cross(this.up).unit();
        const u = lxu.cross(l).unit();
        const Tr = new mat4_1.Mat4([
            lxu.x, lxu.y, lxu.z, 0,
            u.x, u.y, u.z, 0,
            -l.x, -l.y, -l.z, 0,
            0, 0, 0, 1,
        ]);
        const Tt = new mat4_1.Mat4([
            1, 0, 0, -this.position.x,
            0, 1, 0, -this.position.y,
            0, 0, 1, -this.position.z,
            0, 0, 0, 1,
        ]);
        return Tr.mulM(Tt);
    }
    projMatrix() {
        throw new Error('camera: unsupported when camera type is not specified!');
    }
}
exports.Camera = Camera;
/**
 * PerspectiveCamera extends the Camera implemnetation and provides a
 * perspective projection method.
 */
class PerspectiveCamera extends Camera {
    constructor(position, lookAt, up, fov = 45, aspect = 1, near = 0.1, far = 1000) {
        super(position, lookAt, up);
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }
    /**
     * projMatrix returns an perspective projection matrix.
     * @returns the resulting projection matrix.
     */
    // prettier-ignore
    projMatrix() {
        const aspect = this.aspect;
        const fov = this.fov;
        const n = this.near;
        const f = this.far;
        return new mat4_1.Mat4([
            -1 / (aspect * Math.tan((fov * Math.PI) / 360)), 0, 0, 0,
            0, -1 / Math.tan((fov * Math.PI) / 360), 0, 0,
            0, 0, (n + f) / (n - f), (2 * n * f) / (f - n),
            0, 0, 1, 0,
        ]);
    }
}
exports.PerspectiveCamera = PerspectiveCamera;
/**
 * OrthographicCamera extends the Camera implemnetation and provides a
 * orthographic projection method.
 */
class OrthographicCamera extends Camera {
    constructor(position, lookAt, up, left = -1, right = 1, bottom = -1, top = 1, near = 1, far = -1) {
        super(position, lookAt, up);
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
    }
    /**
     * projMatrix returns an orthographic projection matrix.
     * @returns the resulting projection matrix.
     */
    // prettier-ignore
    projMatrix() {
        const l = this.left;
        const r = this.right;
        const t = this.top;
        const b = this.bottom;
        const n = this.near;
        const f = this.far;
        return new mat4_1.Mat4([
            2 / (r - l), 0, 0, (l + r) / (l - r),
            0, 2 / (t - b), 0, (b + t) / (b - t),
            0, 0, 2 / (n - f), (f + n) / (f - n),
            0, 0, 0, 1,
        ]);
    }
}
exports.OrthographicCamera = OrthographicCamera;
/**
 * viewportMatrix returns the viewport matrix.
 * @param width is the screen width
 * @param height is the screen height
 * @returns the resulting viewport matrix.
 */
// prettier-ignore
function viewportMatrix(w, h) {
    return new mat4_1.Mat4([
        w / 2, 0, 0, w / 2,
        0, h / 2, 0, h / 2,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
}
exports.viewportMatrix = viewportMatrix;
//# sourceMappingURL=camera.js.map