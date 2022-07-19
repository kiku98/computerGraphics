/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {Material, MaterialOptions} from '../material/material';
import {Texture} from '../material/texture';
import {Mat4} from '../math/mat4';
import {Vec4} from '../math/vec4';
import {Object3D} from './object';

/**
 * A Vert contains all supported vertex information, such as position,
 * uv, and normal.
 */
export class Vert {
  position: Vec4;
  normal: Vec4;
  uv: Vec4;
  constructor(position: Vec4, normal: Vec4, uv: Vec4) {
    this.position = position;
    this.normal = normal;
    this.uv = uv;
  }
}

/**
 * Face represents a polygon that may contain n different vertices (n >=3).
 */
export class Face {
  verts: Vert[];
  constructor(vs: Vert[]) {
    if (vs.length < 3) {
      throw new Error('geometry: number of input vertices is less than 3');
    }

    this.verts = vs;
  }

  /**
   * primitives iterates all primitives of the given face.
   *
   * @param iter is an iterator that receives three vertices (in counterclockwise)
   * that represents a triangle. The iteration stops if fn returns false.
   *
   * @returns true if all primitives are iterated.
   */
  primitives(iter: (v1: Vert, v2: Vert, v3: Vert) => boolean): boolean {
    for (let i = 0; i < this.verts.length - 2; i++) {
      if (!iter(this.verts[0], this.verts[i + 1], this.verts[i + 2])) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Mesh represents a polygon mesh.
 */
export class Mesh extends Object3D {
  // vbo
  positions: Vec4[];
  uvs: Vec4[];
  normals: Vec4[];

  // primitives
  faces: Face[];

  // material is the material of the triangle mesh.
  material: Material;

  constructor(positions: Vec4[], normals: Vec4[], uvs: Vec4[], faces: Face[]) {
    super();

    this.positions = positions;
    this.normals = normals;
    this.uvs = uvs;
    this.faces = faces;
    this.material = new Material(
      new Texture(0, [], false),
      false,
      new MaterialOptions(),
      new Vec4(0, 0, 0, 1)
    );
  }
  /**
   * primitives iterates all primitives of the given mesh.
   *
   * @param fn is an iterator that receives three vertices (in counterclockwise)
   * that represents a triangle. The iteration stops if fn returns false.
   * @returns true if all primitives are iterated
   */
  primitives(iter: (v1: Vert, v2: Vert, v3: Vert) => boolean): boolean {
    for (const face of this.faces) {
      if (
        !face.primitives((v1, v2, v3): boolean => {
          return iter(v1, v2, v3);
        })
      ) {
        return false;
      }
    }
    return true;
  }
  /**
   * normalMatrix is a specialized transformation matrix that only for
   * transforming normals. It can be ((Tcamera * Tmodel)^(-1))^T or
   * ((Tmodel)^(-1))^T depending on which transformation space.
   *
   * We use the 2nd form, i.e. model space normal matrix for better
   * performance of camera transforamtion in the shading process.
   *
   * The exact reason we need normal matrix is that normals are transformed
   * incorrectly using MVP matrices. However, a normal matrix helps us
   * to fix the problem of interpolating normals between vertex shader
   * and fragment shader.
   *
   * @returns normal matrix
   */
  normalMatrix(): Mat4 {
    // TODO: Compute and return normal matrix in model space, i.e.
    // return the matrix ((modelMatrix)^(-1))^T.
    //
    // Hint: we can use the methods that were implemented in the
    // assignment 1 (check math/mat4.ts).
    return this.modelMatrix();
  }
  /**
   * useMaterial uses the given material as the rendering material of
   * the given mesh.
   *
   * @param mat is a material
   */
  useMaterial(mat: Material) {
    this.material = mat;
  }
}

/**
 * LoadOBJ loads a .obj input data and turns it into a Mesh.
 *
 * @param data is a string that contains data from a .obj file
 * @returns a Mesh that represents the input polygon mesh.
 */
export function LoadOBJ(data: string): Mesh {
  const faces: Face[] = [];
  const positions: Vec4[] = [];
  const normals: Vec4[] = [];
  const uvs: Vec4[] = [];

  const lines = data.split('\n');
  for (let line of lines) {
    line = line.trim();
    const tokens = line.split(' ');
    const verts: Vert[] = [];
    switch (tokens[0].trim()) {
      case 'v':
        positions.push(
          new Vec4(
            parseFloat(tokens[1]),
            parseFloat(tokens[2]),
            parseFloat(tokens[3]),
            1
          )
        );
        break;
      case 'vt':
        uvs.push(new Vec4(parseFloat(tokens[1]), parseFloat(tokens[2]), 0, 1));
        break;
      case 'vn':
        normals.push(
          new Vec4(
            parseFloat(tokens[1]),
            parseFloat(tokens[2]),
            parseFloat(tokens[3]),
            0
          )
        );
        break;
      case 'f':
        for (let i = 1; i < tokens.length; i++) {
          const vIdx = parseInt(tokens[i].split('/')[0]) - 1;
          const uvIdx = parseInt(tokens[i].split('/')[1]) - 1;
          const nIdx = parseInt(tokens[i].split('/')[2]) - 1;
          verts.push(new Vert(positions[vIdx], normals[nIdx], uvs[uvIdx]));
        }
        faces.push(new Face(verts));
        break;
    }
  }
  return new Mesh(positions, normals, uvs, faces);
}
