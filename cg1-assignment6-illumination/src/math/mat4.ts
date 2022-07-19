/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
import {Vec4} from './vec4';
import {approxEqual} from './utils';

/**
 * Mat4 represents a row-major 4x4 matrix.
 */
export class Mat4 {
  xs: number[];
  /**
   * constructor creates a new Mat4 matrix.
   * @param xs is an array of numbers that must contain 16 elements.
   */
  constructor(xs: number[]) {
    if (xs.length !== 4 * 4) {
      throw new Error(
        `math: mismatched number of elements, expect ${16} got ${xs.length}`
      );
    }

    this.xs = xs;
  }
  /**
   * get returns the matrix element at row i (0 ≤ i < 4) and column j (0 ≤ j < 4).
   * @param i row
   * @param j column
   * @returns the element
   */
  get(i: number, j: number): number {
    const idx = i * 4 + j;
    if (idx < 0 || idx > this.xs.length) {
      throw new Error(`math: matrix element index (${i}, ${j}) out of range`);
    }

    return this.xs[idx];
  }
  /**
   * set sets the given value at row i (0 ≤ i < 4) and column j (0 ≤ j < 4).
   *
   * @param i row
   * @param j column
   * @param value to be set
   */
  set(i: number, j: number, value: number): void {
    const idx = i * 4 + j;
    if (idx < 0 || idx > this.xs.length) {
      throw new Error(`math: matrix element index (${i}, ${j}) out of range`);
    }

    this.xs[idx] = value;
  }
  /**
   * eq checks whether the given two matrices are equal or not.
   *
   * @param m a given Mat4 matrix
   * @returns true if two given matrices are element-wise equal, otherwise false.
   */
  eq(m: Mat4): boolean {
    for (let i = 0; i < this.xs.length; i++) {
      if (!approxEqual(this.xs[i], m.xs[i])) {
        return false;
      }
    }
    return true;
  }
  /**
   * copy copies the current matrix
   * @returns a copy of the current matrix
   */
  copy(): Mat4 {
    const elems = new Array<number>(this.xs.length);
    for (let i = 0; i < this.xs.length; i++) {
      elems[i] = this.xs[i];
    }
    return new Mat4(elems);
  }
  /**
   * add adds two given matrices element-wise.
   * The resulting matrix is a newly allocated matrix.
   *
   * @param m is a Mat4 matrix
   * @returns the resulting Matrix
   */
  add(m: Mat4): Mat4 {
    const elems = new Array<number>(4 * 4);
    for (let i = 0; i < this.xs.length; i++) {
      elems[i] = this.xs[i] + m.xs[i];
    }
    return new Mat4(elems);
  }
  /**
   * sub subtracts two given matrices element-wise.
   * The resulting matrix is a newly allocated matrix.
   *
   * @param m is a Mat4 matrix
   * @returns the resulting Matrix
   */
  sub(m: Mat4): Mat4 {
    const elems = new Array<number>(4 * 4);
    for (let i = 0; i < this.xs.length; i++) {
      elems[i] = this.xs[i] - m.xs[i];
    }
    return new Mat4(elems);
  }
  /**
   * mulM computes the matrix multiplication of two given matrices.
   * The resulting matrix is a newly allocated matrix.
   *
   * @param m is Mat4 matrix
   * @returns the resulting matrix.
   */
  mulM(m: Mat4): Mat4 {
    const r = new Mat4(new Array<number>(4 * 4));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += this.get(i, k) * m.get(k, j);
        }
        r.set(i, j, sum);
      }
    }
    return r;
  }
  /**
   * mulV computes the matrix-vector multiplication of a given Mat4
   * matrix and a given Vec4 vector.
   * The resulting vector is a newly allocated vector.
   *
   * @param v is a Vec4 vector.
   * @returns the resulting vector.
   */
  mulV(v: Vec4): Vec4 {
    return v.apply(this);
  }
  /**
   * T computes the transpose of the given matrix.
   * The resulting matrix is a newly allocated matrix.
   *
   * @returns the resulting matrix
   */
  T(): Mat4 {
    const elems = new Array<number>(4 * 4);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const idx1 = i * 4 + j;
        const idx2 = j * 4 + i;
        elems[idx1] = this.xs[idx2];
      }
    }
    return new Mat4(elems);
  }
  /**
   * det computes the determinant of the given matrix.
   *
   * @returns the resulting determinant
   */
  det(): number {
    return (
      this.get(0, 0) * this.get(1, 1) * this.get(2, 2) * this.get(3, 3) -
      this.get(0, 0) * this.get(1, 1) * this.get(2, 3) * this.get(3, 2) +
      this.get(0, 0) * this.get(1, 2) * this.get(2, 3) * this.get(3, 1) -
      this.get(0, 0) * this.get(1, 2) * this.get(2, 1) * this.get(3, 3) +
      this.get(0, 0) * this.get(1, 3) * this.get(2, 1) * this.get(3, 2) -
      this.get(0, 0) * this.get(1, 3) * this.get(2, 2) * this.get(3, 1) -
      this.get(0, 1) * this.get(1, 2) * this.get(2, 3) * this.get(3, 0) +
      this.get(0, 1) * this.get(1, 2) * this.get(2, 0) * this.get(3, 3) -
      this.get(0, 1) * this.get(1, 3) * this.get(2, 0) * this.get(3, 2) +
      this.get(0, 1) * this.get(1, 3) * this.get(2, 2) * this.get(3, 0) -
      this.get(0, 1) * this.get(1, 0) * this.get(2, 2) * this.get(3, 3) +
      this.get(0, 1) * this.get(1, 0) * this.get(2, 3) * this.get(3, 2) +
      this.get(0, 2) * this.get(1, 3) * this.get(2, 0) * this.get(3, 1) -
      this.get(0, 2) * this.get(1, 3) * this.get(2, 1) * this.get(3, 0) +
      this.get(0, 2) * this.get(1, 0) * this.get(2, 1) * this.get(3, 3) -
      this.get(0, 2) * this.get(1, 0) * this.get(2, 3) * this.get(3, 1) +
      this.get(0, 2) * this.get(1, 1) * this.get(2, 3) * this.get(3, 0) -
      this.get(0, 2) * this.get(1, 1) * this.get(2, 0) * this.get(3, 3) -
      this.get(0, 3) * this.get(1, 0) * this.get(2, 1) * this.get(3, 2) +
      this.get(0, 3) * this.get(1, 0) * this.get(2, 2) * this.get(3, 1) -
      this.get(0, 3) * this.get(1, 1) * this.get(2, 2) * this.get(3, 0) +
      this.get(0, 3) * this.get(1, 1) * this.get(2, 0) * this.get(3, 2) -
      this.get(0, 3) * this.get(1, 2) * this.get(2, 0) * this.get(3, 1) +
      this.get(0, 3) * this.get(1, 2) * this.get(2, 1) * this.get(3, 0)
    );
  }
  /**
   * inv computes the inverse matrix of the given matrix. Note that the
   * method will throw an error if the given matrix is not invertible.
   *
   * @returns the resulting matrix.
   */
  inv(): Mat4 {
    const de = this.det();
    if (approxEqual(de, 0)) {
      throw new Error('zero determinant');
    }
    const n = new Mat4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const d = 1 / de;
    n.set(
      0,
      0,
      (this.get(1, 2) * this.get(2, 3) * this.get(3, 1) -
        this.get(1, 3) * this.get(2, 2) * this.get(3, 1) +
        this.get(1, 3) * this.get(2, 1) * this.get(3, 2) -
        this.get(1, 1) * this.get(2, 3) * this.get(3, 2) -
        this.get(1, 2) * this.get(2, 1) * this.get(3, 3) +
        this.get(1, 1) * this.get(2, 2) * this.get(3, 3)) *
        d
    );
    n.set(
      0,
      1,
      (this.get(0, 3) * this.get(2, 2) * this.get(3, 1) -
        this.get(0, 2) * this.get(2, 3) * this.get(3, 1) -
        this.get(0, 3) * this.get(2, 1) * this.get(3, 2) +
        this.get(0, 1) * this.get(2, 3) * this.get(3, 2) +
        this.get(0, 2) * this.get(2, 1) * this.get(3, 3) -
        this.get(0, 1) * this.get(2, 2) * this.get(3, 3)) *
        d
    );
    n.set(
      0,
      2,
      (this.get(0, 2) * this.get(1, 3) * this.get(3, 1) -
        this.get(0, 3) * this.get(1, 2) * this.get(3, 1) +
        this.get(0, 3) * this.get(1, 1) * this.get(3, 2) -
        this.get(0, 1) * this.get(1, 3) * this.get(3, 2) -
        this.get(0, 2) * this.get(1, 1) * this.get(3, 3) +
        this.get(0, 1) * this.get(1, 2) * this.get(3, 3)) *
        d
    );
    n.set(
      0,
      3,
      (this.get(0, 3) * this.get(1, 2) * this.get(2, 1) -
        this.get(0, 2) * this.get(1, 3) * this.get(2, 1) -
        this.get(0, 3) * this.get(1, 1) * this.get(2, 2) +
        this.get(0, 1) * this.get(1, 3) * this.get(2, 2) +
        this.get(0, 2) * this.get(1, 1) * this.get(2, 3) -
        this.get(0, 1) * this.get(1, 2) * this.get(2, 3)) *
        d
    );
    n.set(
      1,
      0,
      (this.get(1, 3) * this.get(2, 2) * this.get(3, 0) -
        this.get(1, 2) * this.get(2, 3) * this.get(3, 0) -
        this.get(1, 3) * this.get(2, 0) * this.get(3, 2) +
        this.get(1, 0) * this.get(2, 3) * this.get(3, 2) +
        this.get(1, 2) * this.get(2, 0) * this.get(3, 3) -
        this.get(1, 0) * this.get(2, 2) * this.get(3, 3)) *
        d
    );
    n.set(
      1,
      1,
      (this.get(0, 2) * this.get(2, 3) * this.get(3, 0) -
        this.get(0, 3) * this.get(2, 2) * this.get(3, 0) +
        this.get(0, 3) * this.get(2, 0) * this.get(3, 2) -
        this.get(0, 0) * this.get(2, 3) * this.get(3, 2) -
        this.get(0, 2) * this.get(2, 0) * this.get(3, 3) +
        this.get(0, 0) * this.get(2, 2) * this.get(3, 3)) *
        d
    );
    n.set(
      1,
      2,
      (this.get(0, 3) * this.get(1, 2) * this.get(3, 0) -
        this.get(0, 2) * this.get(1, 3) * this.get(3, 0) -
        this.get(0, 3) * this.get(1, 0) * this.get(3, 2) +
        this.get(0, 0) * this.get(1, 3) * this.get(3, 2) +
        this.get(0, 2) * this.get(1, 0) * this.get(3, 3) -
        this.get(0, 0) * this.get(1, 2) * this.get(3, 3)) *
        d
    );
    n.set(
      1,
      3,
      (this.get(0, 2) * this.get(1, 3) * this.get(2, 0) -
        this.get(0, 3) * this.get(1, 2) * this.get(2, 0) +
        this.get(0, 3) * this.get(1, 0) * this.get(2, 2) -
        this.get(0, 0) * this.get(1, 3) * this.get(2, 2) -
        this.get(0, 2) * this.get(1, 0) * this.get(2, 3) +
        this.get(0, 0) * this.get(1, 2) * this.get(2, 3)) *
        d
    );
    n.set(
      2,
      0,
      (this.get(1, 1) * this.get(2, 3) * this.get(3, 0) -
        this.get(1, 3) * this.get(2, 1) * this.get(3, 0) +
        this.get(1, 3) * this.get(2, 0) * this.get(3, 1) -
        this.get(1, 0) * this.get(2, 3) * this.get(3, 1) -
        this.get(1, 1) * this.get(2, 0) * this.get(3, 3) +
        this.get(1, 0) * this.get(2, 1) * this.get(3, 3)) *
        d
    );
    n.set(
      2,
      1,
      (this.get(0, 3) * this.get(2, 1) * this.get(3, 0) -
        this.get(0, 1) * this.get(2, 3) * this.get(3, 0) -
        this.get(0, 3) * this.get(2, 0) * this.get(3, 1) +
        this.get(0, 0) * this.get(2, 3) * this.get(3, 1) +
        this.get(0, 1) * this.get(2, 0) * this.get(3, 3) -
        this.get(0, 0) * this.get(2, 1) * this.get(3, 3)) *
        d
    );
    n.set(
      2,
      2,
      (this.get(0, 1) * this.get(1, 3) * this.get(3, 0) -
        this.get(0, 3) * this.get(1, 1) * this.get(3, 0) +
        this.get(0, 3) * this.get(1, 0) * this.get(3, 1) -
        this.get(0, 0) * this.get(1, 3) * this.get(3, 1) -
        this.get(0, 1) * this.get(1, 0) * this.get(3, 3) +
        this.get(0, 0) * this.get(1, 1) * this.get(3, 3)) *
        d
    );
    n.set(
      2,
      3,
      (this.get(0, 3) * this.get(1, 1) * this.get(2, 0) -
        this.get(0, 1) * this.get(1, 3) * this.get(2, 0) -
        this.get(0, 3) * this.get(1, 0) * this.get(2, 1) +
        this.get(0, 0) * this.get(1, 3) * this.get(2, 1) +
        this.get(0, 1) * this.get(1, 0) * this.get(2, 3) -
        this.get(0, 0) * this.get(1, 1) * this.get(2, 3)) *
        d
    );
    n.set(
      3,
      0,
      (this.get(1, 2) * this.get(2, 1) * this.get(3, 0) -
        this.get(1, 1) * this.get(2, 2) * this.get(3, 0) -
        this.get(1, 2) * this.get(2, 0) * this.get(3, 1) +
        this.get(1, 0) * this.get(2, 2) * this.get(3, 1) +
        this.get(1, 1) * this.get(2, 0) * this.get(3, 2) -
        this.get(1, 0) * this.get(2, 1) * this.get(3, 2)) *
        d
    );
    n.set(
      3,
      1,
      (this.get(0, 1) * this.get(2, 2) * this.get(3, 0) -
        this.get(0, 2) * this.get(2, 1) * this.get(3, 0) +
        this.get(0, 2) * this.get(2, 0) * this.get(3, 1) -
        this.get(0, 0) * this.get(2, 2) * this.get(3, 1) -
        this.get(0, 1) * this.get(2, 0) * this.get(3, 2) +
        this.get(0, 0) * this.get(2, 1) * this.get(3, 2)) *
        d
    );
    n.set(
      3,
      2,
      (this.get(0, 2) * this.get(1, 1) * this.get(3, 0) -
        this.get(0, 1) * this.get(1, 2) * this.get(3, 0) -
        this.get(0, 2) * this.get(1, 0) * this.get(3, 1) +
        this.get(0, 0) * this.get(1, 2) * this.get(3, 1) +
        this.get(0, 1) * this.get(1, 0) * this.get(3, 2) -
        this.get(0, 0) * this.get(1, 1) * this.get(3, 2)) *
        d
    );
    n.set(
      3,
      3,
      (this.get(0, 1) * this.get(1, 2) * this.get(2, 0) -
        this.get(0, 2) * this.get(1, 1) * this.get(2, 0) +
        this.get(0, 2) * this.get(1, 0) * this.get(2, 1) -
        this.get(0, 0) * this.get(1, 2) * this.get(2, 1) -
        this.get(0, 1) * this.get(1, 0) * this.get(2, 2) +
        this.get(0, 0) * this.get(1, 1) * this.get(2, 2)) *
        d
    );
    return n;
  }
}
