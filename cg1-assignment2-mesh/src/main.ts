/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {LoadOBJ, Vert} from './geometry/mesh';

import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  GridHelper,
  PointLight,
  Color,
  BufferGeometry,
  Mesh,
  MeshPhongMaterial,
  BufferAttribute,
  FrontSide,
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

class SimpleWorld {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;

  constructor() {
    const container = document.body;
    container.style.overflow = 'hidden';
    container.style.margin = '0';

    // Create renderer and add to the container
    this.renderer = new WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Create scene
    this.scene = new Scene();
    this.scene.background = new Color('#181818');

    // Create a camera
    const cameraParam = {
      fov: 40,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000,
      position: new Vector3(0.3, 0.3, 1.2),
      lookAt: new Vector3(0, 0, 0),
    };
    this.camera = new PerspectiveCamera(
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

    // Setup orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.15;

    // setup everything
    this.setup();
  }
  // The render loop
  render() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.render());
  }
  setup() {
    const params = {
      color: 0xffffff,
      intensity: 1,
      distance: 5,
      position: new Vector3(0.5, 0.5, 0.5),
    };
    const l1 = new PointLight(params.color, params.intensity, params.distance);
    const l2 = new PointLight(params.color, params.intensity, params.distance);
    const l3 = new PointLight(params.color, params.intensity, params.distance);
    const l4 = new PointLight(params.color, params.intensity, params.distance);
    l1.position.copy(params.position);
    l2.position.copy(
      new Vector3(-params.position.x, params.position.y, params.position.z)
    );
    l3.position.copy(
      new Vector3(params.position.x, -params.position.y, params.position.z)
    );
    l4.position.copy(
      new Vector3(params.position.x, params.position.y, -params.position.z)
    );
    this.scene.add(l1, l2, l3, l4);
    this.scene.add(new GridHelper(5, 100));

    this.setupBunny();
  }
  async setupBunny() {
    const resp = await fetch('./assets/bunny.obj');
    const data = await resp.text();

    const m = LoadOBJ(data);

    // Early error checking.
    if (m.faces === undefined || m.faces === null) {
      throw new Error(
        'Expect a Mesh contains an array of Face, but got:' + m.faces
      );
    }
    if (m.faces.length > 1e6) {
      throw new Error('The array of Face is too big, there must be a mistake.');
    }

    // Start converting Mesh to a BufferGeometry.
    // This process turns any polygon mesh into triangle mesh.
    const vs: Vert[] = [];
    m.primitives((v1, v2, v3): boolean => {
      vs.push(v1, v2, v3);
      return true;
    });

    const idxs: Uint32Array = new Uint32Array(vs.length);
    const bufPos: Float32Array = new Float32Array(vs.length * 3);
    const bufUV: Float32Array = new Float32Array(vs.length * 3);
    const bufColor: Float32Array = new Float32Array(vs.length * 3);
    const bufNormal: Float32Array = new Float32Array(vs.length * 3);

    for (let idx = 0; idx < vs.length; idx++) {
      const v = vs[idx];

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

      // vertex colors
      bufColor[3 * idx + 0] = 0;
      bufColor[3 * idx + 1] = 0.5;
      bufColor[3 * idx + 2] = 1;

      // vertex normals
      bufNormal[3 * idx + 0] = v.normal.x;
      bufNormal[3 * idx + 1] = v.normal.y;
      bufNormal[3 * idx + 2] = v.normal.z;
    }

    const g = new BufferGeometry();
    g.setIndex(new BufferAttribute(idxs, 1));
    g.setAttribute('position', new BufferAttribute(bufPos, 3));
    g.setAttribute('uv', new BufferAttribute(bufUV, 3));
    g.setAttribute('color', new BufferAttribute(bufColor, 3));
    g.setAttribute('normal', new BufferAttribute(bufNormal, 3));

    const bunny = new Mesh(
      g,
      new MeshPhongMaterial({
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        side: FrontSide,
        flatShading: true,
      })
    );
    this.scene.add(bunny);
  }
}

// Create a simple world and render it.
new SimpleWorld().render();
