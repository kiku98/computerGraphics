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
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
} from 'three';
import {mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import {Vec4} from './math/vec4';
import {Rasterizer} from './renderer/raster';
import {Scene} from './renderer/scene';
import {CameraViewingPipeline} from './view';

/**
 * Rasterization implements a rasterization process.
 */
class Rasterization extends CameraViewingPipeline {
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
    const r = new Rasterizer(params.screen.width, params.screen.height);
    const s = new Scene(params.scene.model, params.scene.camera);

    // Rasterizes the scene using the created rasterizer.
    const buf = r.render(s);

    // Early error checking.
    const nPixels = params.screen.width * params.screen.height;
    if (buf.length !== nPixels) {
      throw new Error(
        'flushFrameBuffer: incorrect size of frame buffer,' +
          ` expect: ${nPixels}, got: ${buf.length}.`
      );
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
  initScreen(width: number, height: number) {
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
    const screen = new LineSegments(geometry, material);
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
  flush(buf: Vec4[], width: number, height: number) {
    this.scene.remove(<Object3D>this.scene.getObjectByName('screen'));

    const gg: BufferGeometry[] = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const g = new PlaneBufferGeometry(1, 1, 1, 1);
        g.translate(i + 0.5, j + 0.5, 0);
        const bufcolor = buf[j * width + i];
        // 3 rgb * 4 vertices
        g.setAttribute(
          'color',
          new BufferAttribute(
            new Uint8Array([
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
            ]),
            3,
            true
          )
        );
        gg.push(g);
      }
    }
    const m = new Mesh(
      mergeBufferGeometries(gg),
      new MeshBasicMaterial({vertexColors: true, side: DoubleSide})
    );
    m.name = 'screen';
    this.scene.add(m);
  }
}

// Run the rasterization process.
new Rasterization().render();
