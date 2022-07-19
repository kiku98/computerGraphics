/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh as ThreeMesh,
  MeshBasicMaterial,
} from 'three';

import {Vec4} from './math/vec4';
import {Rasterizer} from './renderer/raster';
import {Scene} from './renderer/scene';
import {NDC} from './view';
import {Texture} from './material/texture';
import {Mesh} from './geometry/mesh';
import {ICamera} from './camera/camera';
import {loadCamera, loadModel, loadTexture} from './loader';
import {Material, MaterialOptions} from './material/material';
import {PointLight} from './lights/point';

/**
 * Monitor simulates a pixel-based display.
 */
class Monitor extends NDC {
  screen?: ThreeMesh;
  params: {
    assets?: {
      models: Mesh[];
      camera: ICamera;
      textures: Texture[];
      light: PointLight;
    };
    renderOption: {
      camera: string;
      wireframe: boolean;
      texture: boolean;
      mipmap: boolean;
      MSAA: string;
    };
    screen: {
      width: number;
      height: number;
    };
  };

  constructor() {
    super();
    this.params = {
      renderOption: {
        camera: 'perspective',
        wireframe: false,
        texture: true,
        mipmap: true,
        MSAA: '1x (1x1)',
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
    const getModel = async (name: string) => {
      const model = await loadModel(name);
      model.rotate(new Vec4(0, 1, 0, 0), -Math.PI / 6);
      model.scale(2, 2, 2);
      model.translate(0, -0, -0.4);
      return model;
    };
    let persp = true;
    if (this.params.renderOption.camera === 'perspective') {
      persp = true;
    } else {
      persp = false;
    }
    const camera = loadCamera(persp);

    let bunny = await getModel('bunny');
    let ground = await getModel('ground');
    await this.visualize([bunny, ground], camera, ['bunny', 'ground'], false);

    // Reload the bunny mesh because the visualization had changed the bunny vertex position.
    bunny = await getModel('bunny');
    ground = await getModel('ground');
    const bunnyTex = await loadTexture('bunny');
    const groundTex = await loadTexture('ground');

    // Initializes assets.
    this.params.assets = {
      models: [bunny, ground],
      camera: camera,
      textures: [bunnyTex, groundTex],
      light: new PointLight(new Vec4(-2, 2.5, 6, 1)),
    };

    // render depending on the rendering options.
    ['texture', 'wireframe', 'mipmap'].forEach(v => {
      this.gui.add(this.params.renderOption, v).onChange(() => {
        this.renderPrepare();
      });
    });

    this.gui
      .add(this.params.renderOption, 'camera', ['perspective', 'orthographic'])
      .onChange(async () => {
        let persp = true;
        if (this.params.renderOption.camera === 'perspective') {
          persp = true;
        } else {
          persp = false;
        }

        console.log(persp);
        const camera = loadCamera(persp);
        const bunny = await getModel('bunny');
        const ground = await getModel('ground');
        await this.visualize(
          [bunny, ground],
          camera,
          ['bunny', 'ground'],
          true
        );

        this.renderPrepare();
      });

    this.gui
      .add(this.params.renderOption, 'MSAA', [
        '1x (1x1)',
        '4x (2x2)',
        '16x (4x4)',
      ])
      .onChange(() => {
        this.renderPrepare();
      });

    // Default render pass.
    this.renderPrepare();
  }
  renderPrepare() {
    if (!this.params.assets) {
      throw new Error('assets are not loaded for rendering.');
    }
    if (this.params.renderOption.texture) {
      const bunny = this.params.assets.models[0];
      // Use loaded texture.
      bunny.material.texture.enableMipmap = this.params.renderOption.mipmap;
      bunny.useMaterial(
        new Material(
          this.params.assets.textures[0],
          this.params.renderOption.wireframe,
          new MaterialOptions(0.5, 0.6, 1, 150)
        )
      );
      const ground = this.params.assets.models[1];
      // Use loaded texture.
      ground.material.texture.enableMipmap = this.params.renderOption.mipmap;
      ground.useMaterial(
        new Material(
          this.params.assets.textures[1],
          this.params.renderOption.wireframe,
          new MaterialOptions(0.5, 0.6, 1, 150)
        )
      );
    } else {
      // Use pure color texture.
      this.params.assets.models.forEach(model => {
        model.useMaterial(
          new Material(
            new Texture(
              2,
              [
                new Vec4(0, 128, 255, 1),
                new Vec4(0, 128, 255, 1),
                new Vec4(0, 128, 255, 1),
                new Vec4(0, 128, 255, 1),
              ],
              false
            ),
            this.params.renderOption.wireframe,
            new MaterialOptions(0.5, 0.6, 1, 150)
          )
        );
      });
    }
    let msaa = 1;
    switch (this.params.renderOption.MSAA) {
      case '1x (1x1)':
        msaa = 1;
        break;
      case '4x (2x2)':
        msaa = 2;
        break;
      case '16x (4x4)':
        msaa = 4;
        break;
    }
    switch (this.params.renderOption.camera) {
      case 'perspective':
        this.params.assets.camera = loadCamera(true);
        break;
      case 'orthographic':
        this.params.assets.camera = loadCamera(false);
        break;
    }

    // Render it!
    this.renderPass(msaa);
  }
  renderPass(msaa: number) {
    if (!this.params.assets) {
      throw new Error('assets are not loaded for rendering.');
    }

    // Creates a rasterizer and adding the loaded bunny and the created
    // camera to the scene.
    const r = new Rasterizer(
      this.params.screen.width,
      this.params.screen.height,
      msaa
    );
    const s = new Scene(
      this.params.assets.models,
      this.params.assets.light,
      this.params.assets.camera
    );

    // Rasterizes the scene using the created rasterizer.
    const t0 = performance.now();
    const buf = r.render(s);
    const t1 = performance.now();

    // Early error checking.
    const nPixels = this.params.screen.width * this.params.screen.height;
    if (buf.length !== nPixels) {
      throw new Error(
        'flushFrameBuffer: incorrect size of frame buffer,' +
          ` expect: ${nPixels}, got: ${buf.length}.`
      );
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
  initScreen(width: number, height: number) {
    // screen grids
    const c = new Color(0xffffff);
    const vs = new Array<number>();
    const cs = new Array<number>();
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
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vs, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(cs, 3));
    const material = new LineBasicMaterial({vertexColors: true});
    material.opacity = 0.15;
    material.transparent = true;
    this.scene.add(new LineSegments(geometry, material));

    // screen pixels
    const idxs: Uint32Array = new Uint32Array(width * height * 2 * 3);
    const bufPos: Float32Array = new Float32Array(width * height * 4 * 3);
    const bufColor: Uint8Array = new Uint8Array(width * height * 4 * 3);

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
    const g = new BufferGeometry();
    g.setIndex(new BufferAttribute(idxs, 1));
    g.setAttribute('position', new BufferAttribute(bufPos, 3));
    g.setAttribute('color', new BufferAttribute(bufColor, 3, true));
    const screen = new ThreeMesh(
      g,
      new MeshBasicMaterial({vertexColors: true, side: DoubleSide})
    );
    screen.name = 'screen';
    this.scene.add(screen);
  }
  /**
   * flush flushes the stored colors in buf to a created screen.
   * This function contains performance optimization for rendering.
   * Do NOT touch anything from here unless you know what you are doing.
   */
  flush(buf: Vec4[], width: number, height: number) {
    const screen = <ThreeMesh>this.scene.getObjectByName('screen');
    const color = <Array<number>>screen.geometry.attributes.color.array;
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
