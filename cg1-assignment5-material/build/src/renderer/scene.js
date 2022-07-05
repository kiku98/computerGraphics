"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
/**
 * Scene is a basic scene graph.
 */
class Scene {
    /**
     * constructor constructs a very basic scene graph which only allows
     * containing a group of triangle mesh and a camera.
     *
     * @param meshes is a group of triangle mesh
     * @param camera is a camera either is perspective or orthographic
     */
    constructor(meshes, camera) {
        this.meshes = meshes;
        this.camera = camera;
    }
}
exports.Scene = Scene;
//# sourceMappingURL=scene.js.map