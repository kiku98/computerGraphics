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
  Vector3,
  Color,
  Group,
  Euler,
  MathUtils,
  Mesh,
  CylinderBufferGeometry,
  MeshBasicMaterial,
  CylinderGeometry,
  OrthographicCamera,
  PerspectiveCamera,
} from 'three';
import {Font} from 'three/examples/jsm/loaders/FontLoader';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import {GUI} from 'dat.gui';
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';

export class GLRenderer {
  // properties for three.js
  renderer: WebGLRenderer;
  scene: Scene;
  projCamera: PerspectiveCamera;
  projControl: OrbitControls;
  screenCamera: OrthographicCamera;
  screenControl: TrackballControls;
  gui: GUI;
  // properties for menu
  menu: {screenSpace: boolean};

  constructor() {
    const container = document.body;
    container.style.overflow = 'hidden';
    container.style.margin = '0';

    this.gui = new GUI();
    this.gui
      .add({export: () => this.exportScreenshot()}, 'export')
      .name('screenshot');
    this.menu = {screenSpace: true};
    this.gui.add(this.menu, 'screenSpace', true).onChange(v => {
      console.log(v);
    });

    this.renderer = new WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color('#181818');

    this.projCamera = new PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.projCamera.position.copy(new Vector3(1.3, 1.3, 3.2));
    this.projCamera.lookAt(new Vector3(0, 0, 0));

    this.screenCamera = new OrthographicCamera(
      -window.innerWidth / 3.5,
      window.innerWidth / 3.5,
      window.innerHeight / 3.5,
      -window.innerHeight / 3.5
    );
    this.screenCamera.position.copy(
      new Vector3(
        Math.round(500 * (window.innerWidth / window.innerHeight)) / 2,
        250,
        0.5
      )
    );
    this.screenCamera.lookAt(
      new Vector3(
        Math.round(500 * (window.innerWidth / window.innerHeight)) / 2,
        250,
        -1
      )
    );
    window.addEventListener(
      'resize',
      () => {
        if (this.menu.screenSpace) {
          this.screenCamera.left = -window.innerWidth / 3.5;
          this.screenCamera.right = window.innerWidth / 3.5;
          this.screenCamera.top = window.innerHeight / 3.5;
          this.screenCamera.bottom = -window.innerHeight / 3.5;
        } else {
          this.projCamera.aspect = window.innerWidth / window.innerHeight;
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screenCamera.updateProjectionMatrix();
        this.projCamera.updateProjectionMatrix();
      },
      false
    );

    this.projControl = new OrbitControls(
      this.projCamera,
      this.renderer.domElement
    );
    this.screenControl = new TrackballControls(
      this.screenCamera,
      this.renderer.domElement
    );
    this.screenControl.noRotate = true;
    this.screenControl.target.copy(
      new Vector3(
        Math.round(500 * (window.innerWidth / window.innerHeight)) / 2,
        250,
        -1
      )
    );
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
    } else {
      this.projControl.update();
      this.renderer.render(this.scene, this.projCamera);
    }
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
    const height = 0.03;
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
