/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera as ThreePerspCamera,
  Vector3,
  Color,
  Group,
  Euler,
  MathUtils,
  Mesh,
  CylinderBufferGeometry,
  MeshBasicMaterial,
  CylinderGeometry,
} from 'three';
import {Font} from 'three/examples/jsm/loaders/FontLoader';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GUI} from 'dat.gui';
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';

export class Renderer {
  // properties for three.js
  renderer: WebGLRenderer;
  scene: Scene;
  camera: ThreePerspCamera;
  controls: OrbitControls;
  gui: GUI;

  constructor() {
    const container = document.body;
    container.style.overflow = 'hidden';
    container.style.margin = '0';

    this.gui = new GUI();
    this.gui
      .add({export: () => this.exportScreenshot()}, 'export')
      .name('screenshot');

    this.renderer = new WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color('#181818');

    const cameraParam = {
      fov: 40,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000,
      position: new Vector3(1.3, 1.3, 3.2),
      lookAt: new Vector3(0, 0, 0),
    };
    this.camera = new ThreePerspCamera(
      cameraParam.fov,
      cameraParam.aspect,
      cameraParam.near,
      cameraParam.far
    );
    this.camera.position.copy(cameraParam.position);
    this.camera.lookAt(cameraParam.lookAt);
    window.addEventListener(
      'resize',
      () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.updateProjectionMatrix();
      },
      false
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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
    const axes = new Group();
    axes.add(
      this.createAxis(
        'X',
        new Euler(0, 0, -MathUtils.degToRad(90)),
        new Vector3(1, 0, 0),
        0xdc0015
      ),
      this.createAxis('Y', new Euler(0, 0, 0), new Vector3(0, 1, 0), 0x4caf50),
      this.createAxis(
        'Z',
        new Euler(MathUtils.degToRad(90), 0, 0),
        new Vector3(0, 0, 1),
        0x2e75b5
      )
    );
    this.scene.add(axes);
  }
  createAxis(label: string, euler: Euler, direction: Vector3, color: number) {
    const length = 2;
    const radius = 0.003;
    const height = 0.01;
    const segments = 32;
    const fontParam = {
      object: helvetiker,
      size: 0.03,
      height: 0.01,
    };
    const axis = new Group();

    const line = new Mesh(
      new CylinderBufferGeometry(radius, radius, length, segments),
      new MeshBasicMaterial({color: color})
    );
    line.setRotationFromEuler(euler);
    axis.add(line);

    const arrow = new Mesh(
      new CylinderGeometry(0, radius * 2, height, segments),
      new MeshBasicMaterial({color: color})
    );
    arrow.translateOnAxis(direction, length / 2);
    arrow.setRotationFromEuler(euler);
    axis.add(arrow);

    const text = new Mesh(
      new TextGeometry(label, {
        font: new Font(fontParam.object),
        size: fontParam.size,
        height: fontParam.height,
      }),
      new MeshBasicMaterial({color: color})
    );
    text.translateOnAxis(direction, length / 2 + 0.05);
    text.translateOnAxis(new Vector3(-1, 0, 0), 0.01);
    text.translateOnAxis(new Vector3(0, -1, 0), 0.01);
    axis.add(text);

    return axis;
  }
}
