"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NDC = void 0;
const three_1 = require("three");
const gl_1 = require("./gl");
class NDC extends gl_1.GLRenderer {
    constructor() {
        super();
    }
    /**
     *
     * @param model
     * @param camera
     * @param name
     */
    async visualize(models, camera, names, reset = false) {
        if (reset) {
            const objs = this.scene.getObjectByName('visobjs');
            this.scene.remove(objs);
        }
        // load texture don't use our texture loader because this is
        // used for rendering in three.js
        const load = (url) => {
            return new Promise(resolve => new three_1.TextureLoader().load(url, resolve));
        };
        const projSpace = new three_1.WireframeGeometry(new three_1.BoxBufferGeometry(2, 2, 2));
        const projCube = new three_1.LineSegments(projSpace);
        projCube.name = 'projcube';
        this.scene.add(projCube);
        const gg = new three_1.Group();
        gg.name = 'visobjs';
        for (let k = 0; k < models.length; k++) {
            const texture = await load(`./assets/${names[k]}.png`);
            const model = models[k];
            const modelMatrix = model.modelMatrix();
            const viewMatrix = camera.viewMatrix();
            const projMatrix = camera.projMatrix();
            for (let i = 0; i < model.faces.length; i++) {
                for (let j = 0; j < model.faces[i].verts.length; j++) {
                    let v = model.faces[i].verts[j].position;
                    v = v.apply(modelMatrix);
                    v = v.apply(viewMatrix);
                    v = v.apply(projMatrix);
                    v = v.scale(1 / v.w);
                    model.faces[i].verts[j].position = v;
                }
            }
            // Early error checking.
            if (model.faces === undefined || model.faces === null) {
                throw new Error('Expect a TriangleMesh contains an array of Face, but got:' +
                    model.faces);
            }
            if (model.faces.length > 1e6) {
                throw new Error('The array of Face is too big, there must be a mistake.');
            }
            // Start converting TriangleMesh to a BufferGeometry.
            const len = model.faces.length * 3; // triangle mesh only.
            const idxs = new Uint32Array(len);
            const bufPos = new Float32Array(len * 3);
            const bufUV = new Float32Array(len * 3);
            const bufNormal = new Float32Array(len * 3);
            let idx = 0;
            for (let j = 0; j < model.faces.length; j++) {
                model.faces[j].verts.forEach(v => {
                    // indices
                    idxs[3 * idx + 0] = 3 * idx + 0;
                    idxs[3 * idx + 1] = 3 * idx + 1;
                    idxs[3 * idx + 2] = 3 * idx + 2;
                    // vertex positions
                    bufPos[3 * idx + 0] = v.position.x;
                    bufPos[3 * idx + 1] = v.position.y;
                    bufPos[3 * idx + 2] = v.position.z;
                    // vertex uv
                    bufUV[3 * idx + 0] = v.uv.x;
                    bufUV[3 * idx + 1] = v.uv.y;
                    bufUV[3 * idx + 2] = 0;
                    // vertex normals
                    bufNormal[3 * idx + 0] = v.normal.x;
                    bufNormal[3 * idx + 1] = v.normal.y;
                    bufNormal[3 * idx + 2] = v.normal.z;
                    idx++;
                });
            }
            const g = new three_1.BufferGeometry();
            g.setIndex(new three_1.BufferAttribute(idxs, 1));
            g.setAttribute('position', new three_1.BufferAttribute(bufPos, 3));
            g.setAttribute('uv', new three_1.BufferAttribute(bufUV, 3));
            g.setAttribute('normal', new three_1.BufferAttribute(bufNormal, 3));
            gg.add(new three_1.LineSegments(new three_1.WireframeGeometry(g), new three_1.LineBasicMaterial({ color: 0xaaaaaa })), new three_1.Mesh(g, new three_1.MeshBasicMaterial({
                map: texture,
                side: three_1.FrontSide,
            })));
        }
        this.scene.add(gg);
    }
}
exports.NDC = NDC;
//# sourceMappingURL=view.js.map