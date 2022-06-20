/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Vec4} from './math/vec4';
import {LoadOBJ, Mesh, Vert} from './geometry/mesh';
import {
  ICamera,
  OrthographicCamera,
  PerspectiveCamera,
  viewportMatrix,
} from './camera/camera';
import {
  AxesHelper,
  BoxBufferGeometry,
  BufferAttribute,
  BufferGeometry,
  CameraHelper,
  FrontSide,
  GridHelper,
  Group,
  LineSegments,
  Mesh as ThreeMesh,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera as ThreePerspCamera,
  OrthographicCamera as ThreeOrthoCamera,
  PointLight,
  Vector3,
  WireframeGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  Color,
  DoubleSide,
} from 'three';
import {Renderer} from './renderer';
import {Font} from 'three/examples/jsm/loaders/FontLoader';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json';

class CameraViewingPipeline extends Renderer {
  // properties for menu
  menu: {
    camera: string;
    space: string;
  };

  // properties for rendering
  bunny?: Mesh;
  cam?: ICamera;

  constructor() {
    super();

    this.menu = {
      space: 'original',
      camera: 'perspective',
    };

    this.gui
      .add(this.menu, 'space', [
        'original',
        'model',
        'camera',
        'projection',
        'viewport',
      ])
      .onChange(() => {
        this.visualize();
      });
    this.gui
      .add(this.menu, 'camera', ['perspective', 'orthographic'])
      .onChange(() => {
        this.visualize();
      });

    this.setup();
  }
  async setup() {
    const params = {
      color: 0xffffff,
      intensity: 1,
      distance: 5,
      position: new Vector3(0.5, 0.5, 0.5),
    };
    const light = new PointLight(
      params.color,
      params.intensity,
      params.distance
    );
    light.position.copy(params.position);
    this.scene.add(light);
    this.scene.add(new GridHelper(5, 100));
    this.scene.add(new AxesHelper(1));

    this.visualize();
  }
  async reset() {
    ['bunny', 'camera', 'projcube', 'screen', 'screentext'].forEach(name => {
      this.scene.remove(<Object3D>this.scene.getObjectByName(name));
    });

    await this.loadBunny();
    this.loadCamera();
  }
  async loadBunny() {
    const resp = await fetch('./assets/bunny.obj');
    const data = await resp.text();
    this.bunny = LoadOBJ(data);
  }
  transformBunny() {
    if (!this.bunny) {
      return;
    }
    this.bunny.rotate(new Vec4(0, 0, 1, 0), Math.PI / 6);
    this.bunny.scale(2, 2, 2);
    this.bunny.scale(2, 2, 2);
    this.bunny.translate(0.5, -0.2, -0.5);
  }
  loadCamera() {
    const params = {
      pos: new Vec4(-0.5, 0.5, 0.5, 1),
      lookAt: new Vec4(0, 0, -0.5, 1),
      up: new Vec4(0, 1, 0, 0),
    };
    const perspParam = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: -0.1,
      far: -3,
    };
    const orthoParam = {
      left: -0.5,
      right: 0.5,
      top: 0.5,
      bottom: -0.5,
      near: 0,
      far: -2,
    };

    if (this.menu.camera === 'perspective') {
      this.cam = new PerspectiveCamera(
        params.pos,
        params.lookAt,
        params.up,
        perspParam.fov,
        perspParam.aspect,
        perspParam.near,
        perspParam.far
      );
    } else {
      // orthographic
      this.cam = new OrthographicCamera(
        params.pos,
        params.lookAt,
        params.up,
        orthoParam.left,
        orthoParam.right,
        orthoParam.bottom,
        orthoParam.top,
        orthoParam.near,
        orthoParam.far
      );
    }
  }
  async visualize() {
    await this.reset();
    switch (this.menu.space) {
      // original space renders the raw mesh described in .obj file
      case 'original':
        this.visOriginal();
        break;
      // apply Tmodel and visualize a camera
      case 'model':
        this.transformBunny();
        this.visModelSpace();
        break;
      // apply Tview for camera and the bunny
      case 'camera':
        this.transformBunny();
        this.visCameraSpace();
        break;
      // apply Tpersp for the bunny, no camera anymore
      case 'projection':
        this.transformBunny();
        this.visProjectionSpace();
        break;
      // apply Tviewport, both for projection space and viewport
      case 'viewport':
        this.transformBunny();
        this.visScreenSpace();
        break;
    }
    this.renderBunny();
  }
  visOriginal() {
    // nothing, really.
  }
  visModelSpace() {
    if (!this.bunny) {
      return;
    }

    const modelMatrix = this.bunny.modelMatrix();
    for (let i = 0; i < this.bunny.faces.length; i++) {
      for (let j = 0; j < this.bunny.faces[i].verts.length; j++) {
        const v = this.bunny.faces[i].verts[j].position.apply(modelMatrix);
        this.bunny.faces[i].verts[j].position = v;
      }
    }

    if (!this.cam) {
      return;
    }
    const g = new Group();
    if (this.cam instanceof PerspectiveCamera) {
      const threejsCam = new ThreePerspCamera(
        this.cam.fov,
        this.cam.aspect,
        -this.cam.near,
        -this.cam.far
      );
      g.add(threejsCam);
      threejsCam.position.set(
        this.cam.position.x,
        this.cam.position.y,
        this.cam.position.z
      );
      threejsCam.lookAt(
        this.cam.lookAt.x,
        this.cam.lookAt.y,
        this.cam.lookAt.z
      );
      const camVis = new CameraHelper(threejsCam);
      g.add(camVis);
    } else if (this.cam instanceof OrthographicCamera) {
      // orthographic
      const threejsCam = new ThreeOrthoCamera(
        this.cam.left,
        this.cam.right,
        this.cam.top,
        this.cam.bottom,
        -this.cam.near,
        -this.cam.far
      );
      g.add(threejsCam);
      threejsCam.position.set(
        this.cam.position.x,
        this.cam.position.y,
        this.cam.position.z
      );
      threejsCam.lookAt(
        this.cam.lookAt.x,
        this.cam.lookAt.y,
        this.cam.lookAt.z
      );
      const camVis = new CameraHelper(threejsCam);
      g.add(camVis);
    }
    g.name = 'camera';
    this.scene.add(g);
  }
  visCameraSpace() {
    if (!this.bunny || !this.cam) {
      return;
    }

    const modelMatrix = this.bunny.modelMatrix();

    const viewMatrix = this.cam.viewMatrix();
    for (let i = 0; i < this.bunny.faces.length; i++) {
      for (let j = 0; j < this.bunny.faces[i].verts.length; j++) {
        let v = this.bunny.faces[i].verts[j].position;
        v = v.apply(modelMatrix);
        v = v.apply(viewMatrix);
        this.bunny.faces[i].verts[j].position = v;
      }
    }

    const g = new Group();
    g.name = 'camera';
    if (this.cam instanceof PerspectiveCamera) {
      const threejsCam = new ThreePerspCamera(
        this.cam.fov,
        this.cam.aspect,
        -this.cam.near,
        -this.cam.far
      );
      g.add(threejsCam);
      threejsCam.lookAt(0, 0, -1);
      const camVis = new CameraHelper(threejsCam);
      g.add(camVis);
    } else if (this.cam instanceof OrthographicCamera) {
      const threejsCam = new ThreeOrthoCamera(
        this.cam.left,
        this.cam.right,
        this.cam.top,
        this.cam.bottom,
        -this.cam.near,
        -this.cam.far
      );
      g.add(threejsCam);
      threejsCam.lookAt(0, 0, -1);
      const camVis = new CameraHelper(threejsCam);
      g.add(camVis);
    }
    this.scene.add(g);
  }
  visProjectionSpace() {
    const projSpace = new WireframeGeometry(new BoxBufferGeometry(2, 2, 2));
    const projCube = new LineSegments(projSpace);
    projCube.name = 'projcube';
    this.scene.add(projCube);

    if (!this.bunny || !this.cam) {
      return;
    }

    const modelMatrix = this.bunny.modelMatrix();
    const viewMatrix = this.cam.viewMatrix();
    const projMatrix = this.cam.projMatrix();

    for (let i = 0; i < this.bunny.faces.length; i++) {
      for (let j = 0; j < this.bunny.faces[i].verts.length; j++) {
        let v = this.bunny.faces[i].verts[j].position;
        v = v.apply(modelMatrix);
        v = v.apply(viewMatrix);
        v = v.apply(projMatrix);
        v = v.scale(1 / v.w);
        this.bunny.faces[i].verts[j].position = v;
      }
    }
  }
  visScreenSpace() {
    // 1920*1080 ratio 1.7:1
    const screen = new ThreeMesh(
      new PlaneGeometry(1.7, 1),
      new MeshBasicMaterial({
        color: 'gray',
        opacity: 0.3,
        transparent: true,
        side: DoubleSide,
      })
    );
    screen.name = 'screen';
    screen.position.set(0.85, 0.5, 0);

    const text = new ThreeMesh(
      new TextGeometry('screen', {
        font: new Font(helvetiker),
        size: 0.03,
        height: 0.01,
      }),
      new MeshBasicMaterial({color: new Color(0, 0.5, 1)})
    );
    text.position.set(0.1, 0.05, 0);
    text.name = 'screentext';
    this.scene.add(text);

    const projSpace = new WireframeGeometry(new BoxBufferGeometry(1.7, 1, 2));
    const projCube = new LineSegments(projSpace);
    projCube.position.set(0.85, 0.5, 0);
    projCube.name = 'projcube';
    this.scene.add(projCube);
    this.scene.add(screen);

    if (!this.bunny || !this.cam) {
      return;
    }

    const modelMatrix = this.bunny.modelMatrix();
    const viewMatrix = this.cam.viewMatrix();
    const projMatrix = this.cam.projMatrix();
    const viewportM = viewportMatrix(1.7, 1);
    for (let i = 0; i < this.bunny.faces.length; i++) {
      for (let j = 0; j < this.bunny.faces[i].verts.length; j++) {
        let v = this.bunny.faces[i].verts[j].position;
        v = v.apply(modelMatrix);
        v = v.apply(viewMatrix);
        v = v.apply(projMatrix);
        v = v.scale(1 / v.w);
        v = v.apply(viewportM);
        this.bunny.faces[i].verts[j].position = v;
      }
    }
  }

  renderBunny() {
    if (!this.bunny) {
      return;
    }

    // Early error checking.
    if (this.bunny.faces === undefined || this.bunny.faces === null) {
      throw new Error(
        'Expect a Mesh contains an array of Face, but got:' + this.bunny.faces
      );
    }
    if (this.bunny.faces.length > 1e6) {
      throw new Error('The array of Face is too big, there must be a mistake.');
    }

    // Start converting Mesh to a BufferGeometry.
    const vs: Vert[] = [];
    this.bunny.primitives((v1: Vert, v2: Vert, v3: Vert): boolean => {
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

    const bunny = new ThreeMesh(
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
    bunny.name = 'bunny';
    this.scene.add(bunny);
  }
}

new CameraViewingPipeline().render();
