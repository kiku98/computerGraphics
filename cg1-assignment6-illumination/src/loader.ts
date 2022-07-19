/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Texture as ThreeTexture, TextureLoader} from 'three';
import {ICamera, OrthographicCamera, PerspectiveCamera} from './camera/camera';
import {LoadOBJ, Mesh} from './geometry/mesh';
import {Vec4} from './math/vec4';
import {Texture} from './material/texture';

export async function loadModel(name: string): Promise<Mesh> {
  const resp = await fetch(`./assets/${name}.obj`);
  const data = await resp.text();
  return LoadOBJ(data);
}

export function loadCamera(persp: boolean): ICamera {
  const params = {
    pos: new Vec4(-0.5, 0.5, 0.5, 1),
    lookAt: new Vec4(0, 0, -0.5, 1),
    up: new Vec4(0, 1, 0, 0),
  };
  if (persp) {
    const perspParam = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: -0.1,
      far: -3,
    };
    return new PerspectiveCamera(
      params.pos,
      params.lookAt,
      params.up,
      perspParam.fov,
      perspParam.aspect,
      perspParam.near,
      perspParam.far
    );
  }
  const orthoParam = {
    left: -window.innerWidth / 2500,
    right: window.innerWidth / 2500,
    top: window.innerHeight / 2500,
    bottom: -window.innerHeight / 2500,
    near: 0,
    far: -2,
  };
  return new OrthographicCamera(
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

export async function loadTexture(name: string): Promise<Texture> {
  const load = (url: string): Promise<ThreeTexture> => {
    return new Promise<ThreeTexture>(resolve =>
      new TextureLoader().load(url, resolve)
    );
  };

  const t = await load(`./assets/${name}.png`);
  if (t.image.width !== t.image.height) {
    throw new Error('unsupported texture size, expect a square!');
  }
  const size = t.image.width;

  const canvas = <HTMLCanvasElement>document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = <CanvasRenderingContext2D>canvas.getContext('2d');
  context.drawImage(t.image, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const buf = new Array<Vec4>(size * size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // reverse y coordinates at loading time, so that u,v, or others
      // consistent with the coordinate system where origin is on bottom
      // left corner.
      buf[i + (size - j - 1) * size] = new Vec4(
        data[(i + j * size) * 4 + 0],
        data[(i + j * size) * 4 + 1],
        data[(i + j * size) * 4 + 2],
        data[(i + j * size) * 4 + 3]
      );
    }
  }
  return new Texture(size, buf, true);
}
