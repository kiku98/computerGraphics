/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {reverse} from '../src/main';

let score = 0;
afterAll(() => {
  console.log(`Total points: ${score}`);
});

class TestCase {
  input: number;
  expect: number;

  constructor(input: number, expect: number) {
    this.input = input;
    this.expect = expect;
  }
}

const tests: TestCase[] = [
  {input: 10, expect: 1},
  {input: 24, expect: 42},
  {input: 100, expect: 1},
  {input: 110, expect: 11},
  {input: 123, expect: 321},
  {input: -0, expect: 0},
  {input: -1, expect: -1},
  {input: -100, expect: -1},
  {input: -110, expect: -11},
  {input: -123, expect: -321},
];

for (const tt of tests) {
  test(`reverse (input: ${tt.input})`, () => {
    expect(reverse(tt.input)).toBe(tt.expect);
    score += 1;
  });
}
