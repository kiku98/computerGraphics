"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
const three_1 = require("three");
const FontLoader_1 = require("three/examples/jsm/loaders/FontLoader");
const TextGeometry_1 = require("three/examples/jsm/geometries/TextGeometry");
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
const dat_gui_1 = require("dat.gui");
const helvetiker_regular_typeface_json_1 = __importDefault(require("three/examples/fonts/helvetiker_regular.typeface.json"));
class Renderer {
    constructor() {
        const container = document.body;
        container.style.overflow = 'hidden';
        container.style.margin = '0';
        this.gui = new dat_gui_1.GUI();
        this.gui
            .add({ export: () => this.exportScreenshot() }, 'export')
            .name('screenshot');
        this.renderer = new three_1.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        this.scene = new three_1.Scene();
        this.scene.background = new three_1.Color('#181818');
        const cameraParam = {
            fov: 40,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000,
            position: new three_1.Vector3(1.3, 1.3, 3.2),
            lookAt: new three_1.Vector3(0, 0, 0),
        };
        this.camera = new three_1.PerspectiveCamera(cameraParam.fov, cameraParam.aspect, cameraParam.near, cameraParam.far);
        this.camera.position.copy(cameraParam.position);
        this.camera.lookAt(cameraParam.lookAt);
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.updateProjectionMatrix();
        }, false);
        this.controls = new OrbitControls_1.OrbitControls(this.camera, this.renderer.domElement);
        this.setupAxes();
    }
    exportScreenshot() {
        const url = this.renderer.domElement.toDataURL('image/png', 'export');
        const e = document.createElement('a');
        e.setAttribute('href', url);
        e.style.display = 'none';
        e.setAttribute('download', 'export.png');
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    }
    render() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => this.render());
    }
    setupAxes() {
        const axes = new three_1.Group();
        axes.add(this.createAxis('X', new three_1.Euler(0, 0, -three_1.MathUtils.degToRad(90)), new three_1.Vector3(1, 0, 0), 0xdc0015), this.createAxis('Y', new three_1.Euler(0, 0, 0), new three_1.Vector3(0, 1, 0), 0x4caf50), this.createAxis('Z', new three_1.Euler(three_1.MathUtils.degToRad(90), 0, 0), new three_1.Vector3(0, 0, 1), 0x2e75b5));
        this.scene.add(axes);
    }
    createAxis(label, euler, direction, color) {
        const length = 2;
        const radius = 0.003;
        const height = 0.01;
        const segments = 32;
        const fontParam = {
            object: helvetiker_regular_typeface_json_1.default,
            size: 0.03,
            height: 0.01,
        };
        const axis = new three_1.Group();
        const line = new three_1.Mesh(new three_1.CylinderBufferGeometry(radius, radius, length, segments), new three_1.MeshBasicMaterial({ color: color }));
        line.setRotationFromEuler(euler);
        axis.add(line);
        const arrow = new three_1.Mesh(new three_1.CylinderGeometry(0, radius * 2, height, segments), new three_1.MeshBasicMaterial({ color: color }));
        arrow.translateOnAxis(direction, length / 2);
        arrow.setRotationFromEuler(euler);
        axis.add(arrow);
        const text = new three_1.Mesh(new TextGeometry_1.TextGeometry(label, {
            font: new FontLoader_1.Font(fontParam.object),
            size: fontParam.size,
            height: fontParam.height,
        }), new three_1.MeshBasicMaterial({ color: color }));
        text.translateOnAxis(direction, length / 2 + 0.05);
        text.translateOnAxis(new three_1.Vector3(-1, 0, 0), 0.01);
        text.translateOnAxis(new three_1.Vector3(0, -1, 0), 0.01);
        axis.add(text);
        return axis;
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map