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
const vec4_1 = require("./math/vec4");
const raster_1 = require("./renderer/raster");
const scene_1 = require("./renderer/scene");
const view_1 = require("./view");
const texture_1 = require("./material/texture");
const loader_1 = require("./loader");
const material_1 = require("./material/material");
/**
 * Monitor simulates a pixel-based display.
 */
class Monitor extends view_1.NDC {
    constructor() {
        super();
        this.params = {
            renderOption: {
                camera: 'perspective',
                wireframe: false,
                texture: false,
                mipmap: false,
            },
            screen: {
                width: Math.round(500 * (window.innerWidth / window.innerHeight)),
                height: 500,
            },
        };
        this.initScreen(this.params.screen.width, this.params.screen.height);
        this.setup();
    }
    async setup() {
        // Load the bunny mesh
        const name = 'bunny';
        const getBunny = async () => {
            const bunny = await (0, loader_1.loadModel)(name);
            bunny.rotate(new vec4_1.Vec4(0, 1, 0, 0), -Math.PI / 6);
            bunny.scale(2.5, 2.5, 2.5);
            bunny.translate(-0.05, -0.05, -0.2);
            return bunny;
        };
        let bunny = await getBunny();
        const camera = (0, loader_1.loadCamera)();
        await this.visualize(bunny, camera, name);
        // Reload the bunny mesh because the visualization had changed the bunny vertex position.
        bunny = await getBunny();
        const bunnyTex = await (0, loader_1.loadTexture)(name);
        // Initializes assets.
        this.params.assets = {
            models: [bunny],
            camera: camera,
            textures: [bunnyTex],
        };
        // render depending on the rendering options.
        ['texture', 'wireframe', 'mipmap'].forEach(v => {
            this.gui.add(this.params.renderOption, v).onChange(() => {
                this.renderPass();
            });
        });
        // Default render pass.
        this.renderPass();
    }
    renderPass() {
        if (!this.params.assets) {
            throw new Error('assets are not loaded for rendering.');
        }
        if (this.params.renderOption.texture) {
            const bunny = this.params.assets.models[0];
            // Use loaded texture.
            bunny.material.texture.enableMipmap = this.params.renderOption.mipmap;
            bunny.useMaterial(new material_1.Material(this.params.assets.textures[0], this.params.renderOption.wireframe));
        }
        else {
            // Use pure color texture.
            this.params.assets.models.forEach(model => {
                model.useMaterial(new material_1.Material(new texture_1.Texture(2, [
                    new vec4_1.Vec4(0, 128, 255, 1),
                    new vec4_1.Vec4(0, 128, 255, 1),
                    new vec4_1.Vec4(0, 128, 255, 1),
                    new vec4_1.Vec4(0, 128, 255, 1),
                ], false), this.params.renderOption.wireframe));
            });
        }
        // Creates a rasterizer and adding the loaded bunny and the created
        // camera to the scene.
        const r = new raster_1.Rasterizer(this.params.screen.width, this.params.screen.height);
        const s = new scene_1.Scene(this.params.assets.models, this.params.assets.camera);
        // Rasterizes the scene using the created rasterizer.
        const t0 = performance.now();
        const buf = r.render(s);
        const t1 = performance.now();
        // Early error checking.
        const nPixels = this.params.screen.width * this.params.screen.height;
        if (buf.length !== nPixels) {
            throw new Error('flush: incorrect size of frame buffer,' +
                ` expect: ${nPixels}, got: ${buf.length}.`);
        }
        // Flush the returned frame buffer from the rasterizer to "screen".
        this.flush(buf, this.params.screen.width, this.params.screen.height);
        console.log(`CPU rasterizer perf: ${1000 / (t1 - t0)} fps`);
    }
    /**
     * initScreen creates a plane to simulate a pixel based screen.
     * This function contains performance optimization for rendering.
     * Do NOT touch anything from here unless you know what you are doing.
     */
    initScreen(width, height) {
        // screen grids
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
        this.scene.add(new three_1.LineSegments(geometry, material));
        // screen pixels
        const idxs = new Uint32Array(width * height * 2 * 3);
        const bufPos = new Float32Array(width * height * 4 * 3);
        const bufColor = new Uint8Array(width * height * 4 * 3);
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const idx = i + j * width;
                idxs[6 * idx + 0] = 0 + 4 * idx;
                idxs[6 * idx + 1] = 2 + 4 * idx;
                idxs[6 * idx + 2] = 1 + 4 * idx;
                idxs[6 * idx + 3] = 2 + 4 * idx;
                idxs[6 * idx + 4] = 3 + 4 * idx;
                idxs[6 * idx + 5] = 1 + 4 * idx;
                bufPos[12 * idx + 0] = i;
                bufPos[12 * idx + 1] = j + 1;
                bufPos[12 * idx + 2] = 0;
                bufPos[12 * idx + 3] = i + 1;
                bufPos[12 * idx + 4] = j + 1;
                bufPos[12 * idx + 5] = 0;
                bufPos[12 * idx + 6] = i;
                bufPos[12 * idx + 7] = j;
                bufPos[12 * idx + 8] = 0;
                bufPos[12 * idx + 9] = i + 1;
                bufPos[12 * idx + 10] = j;
                bufPos[12 * idx + 11] = 0;
                for (let k = 0; k < 12; k++) {
                    bufColor[12 * idx + k] = 0;
                }
            }
        }
        const g = new three_1.BufferGeometry();
        g.setIndex(new three_1.BufferAttribute(idxs, 1));
        g.setAttribute('position', new three_1.BufferAttribute(bufPos, 3));
        g.setAttribute('color', new three_1.BufferAttribute(bufColor, 3, true));
        const screen = new three_1.Mesh(g, new three_1.MeshBasicMaterial({ vertexColors: true, side: three_1.DoubleSide }));
        screen.name = 'screen';
        this.scene.add(screen);
    }
    /**
     * flush flushes the stored colors in buf to a created screen.
     * This function contains performance optimization for rendering.
     * Do NOT touch anything from here unless you know what you are doing.
     */
    flush(buf, width, height) {
        const screen = this.scene.getObjectByName('screen');
        const color = screen.geometry.attributes.color.array;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const idx = i + j * width;
                for (let k = 0; k < 4; k++) {
                    color[12 * idx + 0 + 3 * k] = buf[idx].x;
                    color[12 * idx + 1 + 3 * k] = buf[idx].y;
                    color[12 * idx + 2 + 3 * k] = buf[idx].z;
                }
            }
        }
        screen.geometry.attributes.color.needsUpdate = true;
    }
}
new Monitor().render();
//# sourceMappingURL=main.js.map