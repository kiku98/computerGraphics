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
        const translation = new mat4_1.Mat4([
            1, 0, 0, -this.position.x,
            0, 1, 0, -this.position.y,
            0, 0, 1, -this.position.z,
            0, 0, 0, 1
        ]);
        const lookAtCrossUp = this.lookAt.cross(this.up);
        const rotation = new mat4_1.Mat4([
            lookAtCrossUp.x, lookAtCrossUp.y, lookAtCrossUp.z, 0,
            this.up.x, this.up.y, this.up.z, 0,
            0, 0, -1, 0,
            0, 0, 0, 1
        ]);
        //Tr*Tt
        return translation.mulM(rotation);
    }
    projMatrix() {
        throw new Error('unsupported when camera type is not specified!');
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
        // TODO: implement perspective projection transformation (Tpersp)
        return new mat4_1.Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
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
        // TODO: implement orthographic projection transformation (Tortho)
        return new mat4_1.Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
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
function viewportMatrix(width, height) {
    // TODO: implement viewport transformation (Tviewport)
    return new mat4_1.Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}
exports.viewportMatrix = viewportMatrix;
//# sourceMappingURL=camera.js.map