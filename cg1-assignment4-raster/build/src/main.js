"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const BufferGeometryUtils_1 = require("three/examples/jsm/utils/BufferGeometryUtils");
const raster_1 = require("./renderer/raster");
const scene_1 = require("./renderer/scene");
const view_1 = require("./view");
/**
 * Rasterization implements a rasterization process.
 */
class Rasterization extends view_1.CameraViewingPipeline {
    constructor() {
        super();
        this.setup();
    }
    async setup() {
        await this.visualize(); // visualizes projection space
        // Load the bunny mesh
        const bunny = await this.loadBunny();
        const camera = this.loadCamera();
        // Initializes a 800x500 resolution screen.
        const params = {
            scene: {
                model: bunny,
                camera: camera,
            },
            screen: {
                width: Math.round(500 * (window.innerWidth / window.innerHeight)),
                height: 500,
            },
        };
        this.initScreen(params.screen.width, params.screen.height);
        // Creates a rasterizer and adding the loaded bunny and the created
        // camera to the scene.
        const r = new raster_1.Rasterizer(params.screen.width, params.screen.height);
        const s = new scene_1.Scene(params.scene.model, params.scene.camera);
        // Rasterizes the scene using the created rasterizer.
        const buf = r.render(s);
        // Early error checking.
        const nPixels = params.screen.width * params.screen.height;
        if (buf.length !== nPixels) {
            throw new Error('flushFrameBuffer: incorrect size of frame buffer,' +
                ` expect: ${nPixels}, got: ${buf.length}.`);
        }
        // Flush the returned frame buffer from the rasterizer to "screen".
        this.flush(buf, params.screen.width, params.screen.height);
    }
    /**
     * initScreen creates a plane to simulate a pixel based screen.
     *
     * @param width is the width of the monitor
     * @param height is the height of the monitor
     */
    initScreen(width, height) {
        const c = new three_1.Color(0xffffff);
        const vs = new Array();
        const cs = new Array();
        for (let i = 0, j = 0, k = 0; i <= height; i++, k++) {
            vs.push(0, k, 0, width, k, 0);
            for (let l = 0; l < 4; l++) {
                c.toArray(cs, j);
                j += 3;
            }
        }
        for (let i = 0, j = 0, k = 0; i <= width; i++, k++) {
            vs.push(k, 0, 0, k, height, 0);
            for (let l = 0; l < 4; l++) {
                c.toArray(cs, j);
                j += 3;
            }
        }
        const geometry = new three_1.BufferGeometry();
        geometry.setAttribute('position', new three_1.Float32BufferAttribute(vs, 3));
        geometry.setAttribute('color', new three_1.Float32BufferAttribute(cs, 3));
        const material = new three_1.LineBasicMaterial({ vertexColors: true });
        material.opacity = 0.15;
        material.transparent = true;
        const screen = new three_1.LineSegments(geometry, material);
        this.scene.add(screen);
    }
    /**
     * flush flushes the stored colors in buf to a created screen.
     *
     * This function contains performance optimization for rendering
     * massive number of objects (PlaneBufferGeometry as Pixel).
     *
     * Do NOT touch anything from here unless you know what you are doing.
     */
    flush(buf, width, height) {
        this.scene.remove(this.scene.getObjectByName('screen'));
        const gg = [];
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const g = new three_1.PlaneBufferGeometry(1, 1, 1, 1);
                g.translate(i + 0.5, j + 0.5, 0);
                const bufcolor = buf[j * width + i];
                // 3 rgb * 4 vertices
                g.setAttribute('color', new three_1.BufferAttribute(new Uint8Array([
                    bufcolor.x,
                    bufcolor.y,
                    bufcolor.z,
                    bufcolor.x,
                    bufcolor.y,
                    bufcolor.z,
                    bufcolor.x,
                    bufcolor.y,
                    bufcolor.z,
                    bufcolor.x,
                    bufcolor.y,
                    bufcolor.z,
                ]), 3, true));
                gg.push(g);
            }
        }
        const m = new three_1.Mesh((0, BufferGeometryUtils_1.mergeBufferGeometries)(gg), new three_1.MeshBasicMaterial({ vertexColors: true, side: three_1.DoubleSide }));
        m.name = 'screen';
        this.scene.add(m);
    }
}
// Run the rasterization process.
new Rasterization().render();
//# sourceMappingURL=main.js.map