/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
import {Vec4} from '../src/math/vec4';
import {Mat4} from '../src/math/mat4';
import {checkEqual, randomInts} from './utils';

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
  // Sanity check, in case eq was changed from the provided implementation.
  test('Mat4.eq', () => {
    const m1 = new Mat4([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    const m2 = new Mat4([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    const m3 = new Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(checkEqual(m1, m2)).toBe(true);
    expect(checkEqual(m1, m3, false)).toBe(false);
    sanity++;
  });

  test('Vec4.copy', () => {
    const v = new Vec4(1.0000009, 2, 3, 4);
    expect(checkEqual(v, v.copy())).toBe(true);
    sanity++;
  });
  test('Mat4.copy', () => {
    const m = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect(checkEqual(m, m.copy())).toBe(true);
    sanity++;
  });

  test('sanity pass?', () => {
    expect(sanity).toBe(4);
    sanityPass = true;
  });
});

test('(+0.5) Vec4.add', () => {
  const tests = [
    {
      v1: new Vec4(1, 2, 3, 4),
      v2: new Vec4(1, 2, 3, 4),
      want: new Vec4(2, 4, 6, 8),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.v1.copy();
    const v2old = tt.v2.copy();

    const got = tt.v1.add(tt.v2);
    expect(checkEqual(tt.v1, v1old)).toBe(true);
    expect(checkEqual(tt.v2, v2old)).toBe(true);
    expect(checkEqual(tt.want, got)).toBe(true);
  }

  score += 0.5;
});

test('(+0.5) Vec4.sub', () => {
  const tests = [
    {
      v1: new Vec4(1, 2, 3, 4),
      v2: new Vec4(1, 2, 3, 4),
      want: new Vec4(0, 0, 0, 0),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.v1.copy();
    const v2old = tt.v2.copy();

    const got = tt.v1.sub(tt.v2);

    expect(checkEqual(tt.v1, v1old)).toBe(true);
    expect(checkEqual(tt.v2, v2old)).toBe(true);
    expect(checkEqual(tt.want, got)).toBe(true);
  }

  score += 0.5;
});

test('(+1.0) Vec4.dot', () => {
  const throws = [
    {
      v1: new Vec4(1, 2, 3, 1),
      v2: new Vec4(1, 2, 3, 1),
    },
    {
      v1: new Vec4(1, 2, 3, 1),
      v2: new Vec4(1, 2, 3, 0),
    },
    {
      v1: new Vec4(1, 2, 3, 0),
      v2: new Vec4(1, 2, 3, 1),
    },
  ];

  for (const tt of throws) {
    expect(() => {
      tt.v1.dot(tt.v2);
    }).toThrow();
  }
  score += 0.5;

  const tests = [
    {
      v1: new Vec4(1, 2, 3, 0),
      v2: new Vec4(1, 2, 3, 0),
      want: 1 + 4 + 9,
    },
  ];

  for (const tt of tests) {
    const v1old = tt.v1.copy();
    const v2old = tt.v2.copy();
    const got = tt.v1.dot(tt.v2);
    expect(checkEqual(tt.v1, v1old)).toEqual(true);
    expect(checkEqual(tt.v2, v2old)).toEqual(true);
    expect(checkEqual(tt.want, got)).toEqual(true);
  }
  score += 0.5;
});

test('(+1.0) Vec4.cross', () => {
  const throws = [
    {
      v1: new Vec4(1, 2, 3, 1),
      v2: new Vec4(1, 2, 3, 1),
    },
    {
      v1: new Vec4(1, 2, 3, 1),
      v2: new Vec4(1, 2, 3, 0),
    },
    {
      v1: new Vec4(1, 2, 3, 0),
      v2: new Vec4(1, 2, 3, 1),
    },
  ];

  for (const tt of throws) {
    expect(() => {
      tt.v1.cross(tt.v2);
    }).toThrow();
  }
  score += 0.5;

  const tests = [
    {
      v1: new Vec4(0, 0, 0, 0),
      v2: new Vec4(1, 2, 3, 0),
      want: new Vec4(0, 0, 0, 0),
    },
    {
      v1: new Vec4(1, 2, 3, 0),
      v2: new Vec4(1, 2, 3, 0),
      want: new Vec4(0, 0, 0, 0),
    },
    {
      v1: new Vec4(1, 0, 0, 0),
      v2: new Vec4(0, 1, 0, 0),
      want: new Vec4(0, 0, 1, 0),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.v1.copy();
    const v2old = tt.v2.copy();
    const got = tt.v1.cross(tt.v2);
    expect(checkEqual(tt.v1, v1old)).toEqual(true);
    expect(checkEqual(tt.v2, v2old)).toEqual(true);
    expect(checkEqual(tt.want, got)).toEqual(true);
  }
  score += 0.5;
});

test('(+1.0 Vec4.len', () => {
  const throws = [
    {
      v1: new Vec4(1, 2, 3, 1),
    },
  ];

  for (const tt of throws) {
    expect(() => {
      tt.v1.len();
    }).toThrow();
  }
  score += 0.5;

  const tests = [
    {
      v1: new Vec4(0, 0, 0, 0),
      want: 0,
    },
    {
      v1: new Vec4(1, 2, 3, 0),
      want: Math.sqrt(14),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.v1.copy();
    const got = tt.v1.len();
    expect(checkEqual(tt.v1, v1old)).toEqual(true);
    expect(checkEqual(tt.want, got)).toEqual(true);
  }
  score += 0.5;
});

// 1.0 Vec4.unit
test('(+1.0) Vec4.unit', () => {
  const throws = [
    {
      v1: new Vec4(1, 2, 3, 1),
    },
  ];

  for (const tt of throws) {
    expect(() => {
      tt.v1.unit();
    }).toThrow();
  }
  score += 0.5;

  const tests = [
    {
      v1: new Vec4(1, 1, 1, 0),
      want: new Vec4(1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3), 0),
    },
    {
      v1: new Vec4(2, 1, 2, 0),
      want: new Vec4(2 / 3, 1 / 3, 2 / 3, 0),
    },
    {
      v1: new Vec4(1, 1, 3, 0),
      want: new Vec4(
        1 / Math.sqrt(11),
        1 / Math.sqrt(11),
        3 / Math.sqrt(11),
        0
      ),
    },
    {
      v1: new Vec4(1, 2, -2, 0),
      want: new Vec4(1 / 3, 2 / 3, -2 / 3, 0),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.v1.copy();
    const got = tt.v1.unit();
    expect(checkEqual(tt.v1, v1old)).toEqual(true);
    expect(checkEqual(tt.want, got)).toEqual(true);
  }
  score += 0.5;
});

test('(+1.0) Vec4.apply', () => {
  const tests = [
    {
      v: new Vec4(1, 2, 3, 4),
      m: new Mat4([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]),
      want: new Vec4(30, 30, 30, 30),
    },
  ];

  for (const tt of tests) {
    const vold = tt.v.copy();
    const mold = tt.m.copy();
    const got = tt.v.apply(tt.m);
    expect(checkEqual(tt.v, vold)).toEqual(true);
    expect(checkEqual(tt.m, mold)).toEqual(true);
    expect(checkEqual(tt.want, got)).toEqual(true);
  }
  score += 1.0;
});

test('(+0.5) Mat4.add', () => {
  const tests = [
    {
      m1: new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      m2: new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      want: new Mat4([
        2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32,
      ]),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.m1.copy();
    const v2old = tt.m2.copy();

    const got = tt.m1.add(tt.m2);

    expect(checkEqual(tt.m1, v1old)).toBe(true);
    expect(checkEqual(tt.m2, v2old)).toBe(true);
    expect(checkEqual(tt.want, got)).toBe(true);
  }

  score += 0.5;
});

test('(+0.5) Mat4.sub', () => {
  const tests = [
    {
      m1: new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      m2: new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      want: new Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.m1.copy();
    const v2old = tt.m2.copy();

    const got = tt.m1.sub(tt.m2);

    expect(checkEqual(tt.m1, v1old)).toBe(true);
    expect(checkEqual(tt.m2, v2old)).toBe(true);
    expect(checkEqual(tt.want, got)).toBe(true);
  }

  score += 0.5;
});

// 1.0 Mat4.mulM
test('(+1.0) Mat4.mulM', () => {
  const tests = [
    {
      m1: new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      m2: new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      want: new Mat4([
        90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484,
        542, 600,
      ]),
    },
  ];

  for (const tt of tests) {
    const v1old = tt.m1.copy();
    const v2old = tt.m2.copy();

    const got = tt.m1.mulM(tt.m2);

    expect(checkEqual(tt.m1, v1old)).toBe(true);
    expect(checkEqual(tt.m2, v2old)).toBe(true);
    expect(checkEqual(tt.want, got)).toBe(true);
  }

  score += 1;
});

test('(+1.0) Mat4.mulV', () => {
  const tests = [
    {
      v: new Vec4(1, 2, 3, 4),
      m: new Mat4([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]),
      want: new Vec4(30, 30, 30, 30),
    },
  ];

  for (const tt of tests) {
    const vold = tt.v.copy();
    const mold = tt.m.copy();
    const got = tt.m.mulV(tt.v);
    expect(checkEqual(tt.v, vold)).toEqual(true);
    expect(checkEqual(tt.m, mold)).toEqual(true);
    expect(checkEqual(tt.want, got)).toEqual(true);
  }
  score += 1.0;
});

test('(+1.0) Mat4.T', () => {
  const tests = [
    {
      m: new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      want: new Mat4([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]),
    },
  ];

  for (const tt of tests) {
    const mold = tt.m.copy();
    const got = tt.m.T();
    expect(checkEqual(tt.m, mold)).toBe(true);
    expect(checkEqual(tt.want, got)).toBe(true);
  }
  score += 1;
});
