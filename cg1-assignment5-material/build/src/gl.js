"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLRenderer = void 0;
const three_1 = require("three");
const FontLoader_1 = require("three/examples/jsm/loaders/FontLoader");
const TextGeometry_1 = require("three/examples/jsm/geometries/TextGeometry");
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
const TrackballControls_1 = require("three/examples/jsm/controls/TrackballControls");
const dat_gui_1 = require("dat.gui");
const helvetiker_regular_typeface_json_1 = __importDefault(require("three/examples/fonts/helvetiker_regular.typeface.json"));
class GLRenderer {
    constructor() {
        const container = document.body;
        container.style.overflow = 'hidden';
        container.style.margin = '0';
        this.gui = new dat_gui_1.GUI();
        this.gui
            .add({ export: () => this.exportScreenshot() }, 'export')
            .name('screenshot');
        this.menu = { screenSpace: true };
        this.gui.add(this.menu, 'screenSpace', true).onChange(v => {
            console.log(v);
        });
        // renderer is the three.js rendering backend.
        this.renderer = new three_1.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        // scene is the three.js scene graph manager.
        this.scene = new three_1.Scene();
        this.scene.background = new three_1.Color('#181818');
        // projCmaera manages the camera to the projection space camera.
        this.projCamera = new three_1.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.projCamera.position.copy(new three_1.Vector3(1.3, 1.3, 3.2));
        this.projCamera.lookAt(new three_1.Vector3(0, 0, 0));
        // screenCamera is the camera that points to the simulated screen.
        const scaleFactor = 3.5;
        this.screenCamera = new three_1.OrthographicCamera(-window.innerWidth / scaleFactor, window.innerWidth / scaleFactor, window.innerHeight / scaleFactor, -window.innerHeight / scaleFactor);
        this.screenCamera.position.copy(new three_1.Vector3(Math.round(500 * (window.innerWidth / window.innerHeight)) / 2, 250, 0.5));
        this.screenCamera.lookAt(new three_1.Vector3(Math.round(500 * (window.innerWidth / window.innerHeight)) / 2, 250, -1));
        // handle window resizing
        window.addEventListener('resize', () => {
            if (this.menu.screenSpace) {
                this.screenCamera.left = -window.innerWidth / scaleFactor;
                this.screenCamera.right = window.innerWidth / scaleFactor;
                this.screenCamera.top = window.innerHeight / scaleFactor;
                this.screenCamera.bottom = -window.innerHeight / scaleFactor;
            }
            else {
                this.projCamera.aspect = window.innerWidth / window.innerHeight;
            }
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.screenCamera.updateProjectionMatrix();
            this.projCamera.updateProjectionMatrix();
        }, false);
        this.projControl = new OrbitControls_1.OrbitControls(this.projCamera, this.renderer.domElement);
        this.screenControl = new TrackballControls_1.TrackballControls(this.screenCamera, this.renderer.domElement);
        this.screenControl.noRotate = true;
        this.screenControl.target.copy(new three_1.Vector3(Math.round(500 * (window.innerWidth / window.innerHeight)) / 2, 250, -1));
        this.screenControl.panSpeed = 20;
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
        if (this.menu.screenSpace) {
            this.screenControl.update();
            this.renderer.render(this.scene, this.screenCamera);
        }
        else {
            this.projControl.update();
            this.renderer.render(this.scene, this.projCamera);
        }
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
        const height = 0.03;
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
exports.GLRenderer = GLRenderer;
//# sourceMappingURL=gl.js.map