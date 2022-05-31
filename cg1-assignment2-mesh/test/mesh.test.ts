/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import * as fs from 'fs';
import {LoadOBJ, Vert, Face, Mesh} from '../src/geometry/mesh';
import {Vec4} from '../src/math/vec4';
import {checkEqual} from './utils';

let score = 0;
let sanityPass = false;
afterAll(() => {
  if (!sanityPass) {
    // The final result depends on the sanity checks.
    // If there exists any sanity checks failed, the whole test is not
    // trustable. In this case, we set the score to zero.
    //
    // This should arise the biggest attention to let correct check
    // why this submission got 0 and did some manual inspections and
    // see whether it is our mistake or the submission is faulty.
    score = 0;
  }
  console.log(`Total collected points: ${score}`);
});

describe('sanity check', () => {
  let sanity = 0;
  // Sanity check, in case eq was changed from the provided implementation.
  test('Vec4.eq', () => {
    const v1 = new Vec4(1.00000009, 2, 3, 4);
    const v2 = new Vec4(1, 2, 3, 4);
    const v3 = new Vec4(0, 0, 0, 0);
    expect(checkEqual(v1, v2)).toBe(true);
    expect(checkEqual(v1, v3, false)).toBe(false);
    sanity++;
  });
  test('Vec4.copy', () => {
    const v = new Vec4(1.0000009, 2, 3, 4);
    expect(checkEqual(v, v.copy())).toBe(true);
    sanity++;
  });
  test('sanity pass?', () => {
    expect(sanity).toBe(2);
    sanityPass = true;
  });
});

class TestCase {
  input: string;
  faces: Face[];
  positions: Vec4[];
  normals: Vec4[];
  uvs: Vec4[];

  constructor(
    input: string,
    faces: Face[],
    positions: Vec4[],
    normals: Vec4[],
    uvs: Vec4[]
  ) {
    this.input = input;
    this.faces = faces;
    this.positions = positions;
    this.normals = normals;
    this.uvs = uvs;
  }
}

const testdata: TestCase[] = [];

beforeAll(() => {
  // Load data once.
  testdata.push({
    input: fs.readFileSync('./test/testdata/tetrahedron.obj', 'utf-8'),
    faces: [
      // face 1
      new Face([
        new Vert(
          new Vec4(-0.038214, 0.990508, -0.126177, 1),
          new Vec4(0.3538, 0.234, -0.9056, 0),
          new Vec4(0.436598, 0.75356, 0, 1)
        ),
        new Vert(
          new Vec4(0.951827, -0.215059, -0.050857, 1),
          new Vec4(0.3538, 0.234, -0.9056, 0),
          new Vec4(0.833648, 0.512884, 0, 1)
        ),
        new Vert(
          new Vec4(-0.55029, -0.387725, -0.682297, 1),
          new Vec4(0.3538, 0.234, -0.9056, 0),
          new Vec4(0.833648, 1.0, 0, 1)
        ),
      ]),
      // face 2
      new Face([
        new Vert(
          new Vec4(-0.038214, 0.990508, -0.126177, 1),
          new Vec4(0.4727, 0.4361, 0.7658, 0),
          new Vec4(0.436598, 0.464299, 0, 1)
        ),
        new Vert(
          new Vec4(-0.363322, -0.387725, 0.85933, 1),
          new Vec4(0.4727, 0.4361, 0.7658, 0),
          new Vec4(0.0, 0.195168, 0, 1)
        ),
        new Vert(
          new Vec4(0.951827, -0.215059, -0.050857, 1),
          new Vec4(0.4727, 0.4361, 0.7658, 0),
          new Vec4(0.436598, 0.0, 0, 1)
        ),
      ]),
      // face 3
      new Face([
        new Vert(
          new Vec4(0.951827, -0.215059, -0.050857, 1),
          new Vec4(0.1202, -0.9926, -0.0146, 0),
          new Vec4(0.0, 0.685842, 0, 1)
        ),
        new Vert(
          new Vec4(-0.363322, -0.387725, 0.85933, 1),
          new Vec4(0.1202, -0.9926, -0.0146, 0),
          new Vec4(0.423825, 0.464299, 0, 1)
        ),
        new Vert(
          new Vec4(-0.55029, -0.387725, -0.682297, 1),
          new Vec4(0.1202, -0.9926, -0.0146, 0),
          new Vec4(0.423825, 0.925956, 0, 1)
        ),
      ]),
      // face 4
      new Face([
        new Vert(
          new Vec4(-0.55029, -0.387725, -0.682297, 1),
          new Vec4(-0.9454, 0.305, 0.1147, 0),
          new Vec4(0.436598, 0.25132, 0, 1)
        ),
        new Vert(
          new Vec4(-0.363322, -0.387725, 0.85933, 1),
          new Vec4(-0.9454, 0.305, 0.1147, 0),
          new Vec4(0.823853, 0.0, 0, 1)
        ),
        new Vert(
          new Vec4(-0.038214, 0.990508, -0.126177, 1),
          new Vec4(-0.9454, 0.305, 0.1147, 0),
          new Vec4(0.823853, 0.512884, 0, 1)
        ),
      ]),
    ],
    positions: [
      new Vec4(-0.363322, -0.387725, 0.85933, 1),
      new Vec4(-0.55029, -0.387725, -0.682297, 1),
      new Vec4(-0.038214, 0.990508, -0.126177, 1),
      new Vec4(0.951827, -0.215059, -0.050857, 1),
    ],
    normals: [
      new Vec4(0.3538, 0.234, -0.9056, 0),
      new Vec4(0.4727, 0.4361, 0.7658, 0),
      new Vec4(0.1202, -0.9926, -0.0146, 0),
      new Vec4(-0.9454, 0.305, 0.1147, 0),
    ],
    uvs: [
      new Vec4(0.436598, 0.75356, 0, 1),
      new Vec4(0.833648, 0.512884, 0, 1),
      new Vec4(0.833648, 1.0, 0, 1),
      new Vec4(0.436598, 0.464299, 0, 1),
      new Vec4(0.0, 0.195168, 0, 1),
      new Vec4(0.436598, 0.0, 0, 1),
      new Vec4(0.0, 0.685842, 0, 1),
      new Vec4(0.423825, 0.464299, 0, 1),
      new Vec4(0.423825, 0.925956, 0, 1),
      new Vec4(0.436598, 0.25132, 0, 1),
      new Vec4(0.823853, 0.0, 0, 1),
      new Vec4(0.823853, 0.512884, 0, 1),
    ],
  });
});

// The returned polygon mesh contains the expected
// number of positions (1p), normals (1p), UVs (1p),
// and faces (1p) for a given input
describe('(+4p) LoadOBJ: length', () => {
  test('positions', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      expect(m.positions.length).toBe(tt.positions.length);
    }
    score += 1;
  });
  test('normals', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      expect(m.normals.length).toBe(tt.normals.length);
    }
    score += 1;
  });
  test('uvs', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      expect(m.uvs.length).toBe(tt.uvs.length);
    }
    score += 1;
  });
  test('faces', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      expect(m.faces.length).toBe(tt.faces.length);
    }
    score += 1;
  });
});

function isIn(v: Vec4, arr: Vec4[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].eq(v)) {
      return true;
    }
  }
  return false;
}

// All vertex positions, normals, UV coordinates from the given input
// are stored in the \texttt{positions} (1p), \texttt{normals} (1p),
// and \texttt{uvs} (1p) properties of the \texttt{Mesh} correspondingly.
describe('(+3p) LoadOBJ: attributes', () => {
  test('position', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      const positions = m.positions;
      let anyNotFound = false;
      for (let i = 0; i < tt.positions.length; i++) {
        if (!isIn(tt.positions[i], positions)) {
          console.log(
            'expect',
            tt.positions[i],
            'to appear but does not exists'
          );
          anyNotFound = true;
          break;
        }
      }
      expect(anyNotFound).toBe(false);
    }
    score += 1;
  });

  test('normals', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      const normals = m.normals;
      let anyNotFound = false;
      for (let i = 0; i < tt.normals.length; i++) {
        if (!isIn(tt.normals[i], normals)) {
          console.log('expect', tt.normals[i], 'to appear but does not exists');
          anyNotFound = true;
          break;
        }
      }
      expect(anyNotFound).toBe(false);
    }
    score += 1;
  });

  test('uvs', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      const uvs = m.uvs;
      let anyNotFound = false;
      for (let i = 0; i < tt.uvs.length; i++) {
        if (!isIn(tt.uvs[i], uvs)) {
          console.log('expect', tt.uvs[i], 'to appear but does not exists');
          anyNotFound = true;
          break;
        }
      }
      expect(anyNotFound).toBe(false);
    }
    score += 1;
  });
});

// The elements order of these attributes (each 1p, total 3p) must
// match their appearing order of the given data.
describe('(+3p) LoadOBJ: storing order', () => {
  test('position', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      const positions = m.positions;
      for (let i = 0; i < tt.positions.length; i++) {
        expect(checkEqual(tt.positions[i], positions[i])).toBe(true);
      }
    }
    score += 1;
  });

  test('normals', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      const normals = m.normals;
      for (let i = 0; i < tt.normals.length; i++) {
        expect(checkEqual(tt.normals[i], normals[i])).toBe(true);
      }
    }
    score += 1;
  });

  test('uvs', () => {
    for (const tt of testdata) {
      const m = LoadOBJ(tt.input);
      const uvs = m.uvs;
      for (let i = 0; i < tt.uvs.length; i++) {
        expect(checkEqual(tt.uvs[i], uvs[i])).toBe(true);
      }
    }
    score += 1;
  });
});

// All polygon faces are stored in the \texttt{faces} of the \texttt{Mesh}
// for the given input (2p), and the order of faces and corresponding
// vertices matches their appearing order of the provided data (2p).
describe('(+4p) LoadOBJ: faces', () => {
  test('contain all', () => {
    // Note: Not provided. Will run at correction.

    score += 2;
  });

  test('expected order', () => {
    // Note: Not provided. Will run at correction.

    score += 2;
  });
});

function sameVert(v1: Vert, v2: Vert): boolean {
  return (
    v1.position.eq(v2.position) && v1.normal.eq(v2.normal) && v1.uv.eq(v2.uv)
  );
}

// Primitive iterator ``\texttt{Face.primitives}'' iterates all triangle
// primitives of a face (2p). If its callback function ``\texttt{iter}''
// returns false, then stop the iteration (1p).
describe('(+3p) Face.primitives', () => {
  test('iterate all', () => {
    const tests = [
      {
        face: new Face([
          new Vert(
            new Vec4(-0.038214, 0.990508, -0.126177, 1),
            new Vec4(0.3538, 0.234, -0.9056, 0),
            new Vec4(0.436598, 0.75356, 0, 1)
          ),
          new Vert(
            new Vec4(0.951827, -0.215059, -0.050857, 1),
            new Vec4(0.3538, 0.234, -0.9056, 0),
            new Vec4(0.833648, 0.512884, 0, 1)
          ),
          new Vert(
            new Vec4(-0.55029, -0.387725, -0.682297, 1),
            new Vec4(0.3538, 0.234, -0.9056, 0),
            new Vec4(0.833648, 1.0, 0, 1)
          ),
        ]),
        verts: [
          {
            v1: new Vert(
              new Vec4(-0.038214, 0.990508, -0.126177, 1),
              new Vec4(0.3538, 0.234, -0.9056, 0),
              new Vec4(0.436598, 0.75356, 0, 1)
            ),
            v2: new Vert(
              new Vec4(0.951827, -0.215059, -0.050857, 1),
              new Vec4(0.3538, 0.234, -0.9056, 0),
              new Vec4(0.833648, 0.512884, 0, 1)
            ),
            v3: new Vert(
              new Vec4(-0.55029, -0.387725, -0.682297, 1),
              new Vec4(0.3538, 0.234, -0.9056, 0),
              new Vec4(0.833648, 1.0, 0, 1)
            ),
          },
        ],
      },
    ];

    for (const tt of tests) {
      let count = 0;
      tt.face.primitives((v1, v2, v3): boolean => {
        expect(sameVert(tt.verts[count].v1, v1)).toBe(true);
        expect(sameVert(tt.verts[count].v2, v2)).toBe(true);
        expect(sameVert(tt.verts[count].v3, v3)).toBe(true);
        count++;
        return true;
      });
      if (tt.verts.length > 0) {
        expect(count > 0).toBe(true);
      }
    }

    score += 2;
  });

  test('can stop', () => {
    // Note: Not provided.

    score += 1;
  });
});

// Primitive iterator ``\texttt{Mesh.primitives}'' iterates all triangle
// primitives of all faces (2p). If its callback function ``\texttt{iter}''
// returns false, then stop the iteration (1p).

describe('(+3p) Mesh.primitives', () => {
  test('iterate all', () => {
    const tests = [
      {
        mesh: new Mesh(
          [],
          [],
          [],
          [
            new Face([
              new Vert(
                new Vec4(-0.038214, 0.990508, -0.126177, 1),
                new Vec4(0.3538, 0.234, -0.9056, 0),
                new Vec4(0.436598, 0.75356, 0, 1)
              ),
              new Vert(
                new Vec4(0.951827, -0.215059, -0.050857, 1),
                new Vec4(0.3538, 0.234, -0.9056, 0),
                new Vec4(0.833648, 0.512884, 0, 1)
              ),
              new Vert(
                new Vec4(-0.55029, -0.387725, -0.682297, 1),
                new Vec4(0.3538, 0.234, -0.9056, 0),
                new Vec4(0.833648, 1.0, 0, 1)
              ),
            ]),
          ]
        ),
        verts: [
          {
            v1: new Vert(
              new Vec4(-0.038214, 0.990508, -0.126177, 1),
              new Vec4(0.3538, 0.234, -0.9056, 0),
              new Vec4(0.436598, 0.75356, 0, 1)
            ),
            v2: new Vert(
              new Vec4(0.951827, -0.215059, -0.050857, 1),
              new Vec4(0.3538, 0.234, -0.9056, 0),
              new Vec4(0.833648, 0.512884, 0, 1)
            ),
            v3: new Vert(
              new Vec4(-0.55029, -0.387725, -0.682297, 1),
              new Vec4(0.3538, 0.234, -0.9056, 0),
              new Vec4(0.833648, 1.0, 0, 1)
            ),
          },
        ],
      },
    ];

    for (const tt of tests) {
      let count = 0;
      tt.mesh.primitives((v1, v2, v3): boolean => {
        expect(sameVert(tt.verts[count].v1, v1)).toBe(true);
        expect(sameVert(tt.verts[count].v2, v2)).toBe(true);
        expect(sameVert(tt.verts[count].v3, v3)).toBe(true);
        count++;
        return true;
      });
      if (tt.mesh.faces.length > 0) {
        expect(count > 0).toBe(true);
      }
    }

    score += 2;
  });

  test('can stop', () => {
    // Note: Not provided. Will run at correction.

    score += 1;
  });
});
