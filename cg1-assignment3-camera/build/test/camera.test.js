"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mesh_1 = require("../src/geometry/mesh");
const mat4_1 = require("../src/math/mat4");
const vec4_1 = require("../src/math/vec4");
const utils_1 = require("./utils");
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
        const v1 = new vec4_1.Vec4(1.00000009, 2, 3, 4);
        const v2 = new vec4_1.Vec4(1, 2, 3, 4);
        const v3 = new vec4_1.Vec4(0, 0, 0, 0);
        expect((0, utils_1.checkEqual)(v1, v2)).toBe(true);
        expect((0, utils_1.checkEqual)(v1, v3, false)).toBe(false);
        sanity++;
    });
    test('Vec4.copy', () => {
        const v = new vec4_1.Vec4(1.0000009, 2, 3, 4);
        expect((0, utils_1.checkEqual)(v, v.copy())).toBe(true);
        sanity++;
    });
    test('sanity pass?', () => {
        expect(sanity).toBe(2);
        sanityPass = true;
    });
});
const testcases = [
    {
        mesh: new mesh_1.Mesh(
        // we don't need other information than the face
        [], [], [], [
            new mesh_1.Face([
                new mesh_1.Vert(new vec4_1.Vec4(5, 0, 0, 1), new vec4_1.Vec4(0, 0, 0, 0), new vec4_1.Vec4(0, 0, 0, 0)),
                new mesh_1.Vert(new vec4_1.Vec4(0, 0, 0, 1), new vec4_1.Vec4(0, 0, 0, 0), new vec4_1.Vec4(0, 0, 0, 0)),
                new mesh_1.Vert(new vec4_1.Vec4(0, 0, 5, 1), new vec4_1.Vec4(0, 0, 0, 0), new vec4_1.Vec4(0, 0, 0, 0)),
            ]),
        ]),
        screen: { width: 800, height: 500 },
        commonCamera: {
            position: new vec4_1.Vec4(-550, 194, 734, 1),
            lookAt: new vec4_1.Vec4(-1000, 0, 0, 1),
            up: new vec4_1.Vec4(0, 1, 1, 0),
        },
        perspCamera: {
            fov: 45,
            aspect: 1.6,
            near: -100,
            far: -600,
        },
        orthoCamera: {
            left: -0.5,
            right: 0.5,
            top: 1,
            bottom: -0.5,
            near: 0,
            far: -3,
        },
        model: {
            scale: new vec4_1.Vec4(1500, 1500, 1500, 0),
            position: new vec4_1.Vec4(-700, -5, 350, 1),
        },
    },
];
describe('Tmodel', () => {
    test('(+2) translate', () => {
        const tranlateCases = [
            {
                sequence: [
                    [10, 5, 1],
                    [1, 5, 10],
                ],
                want: new mat4_1.Mat4([1, 0, 0, 11, 0, 1, 0, 10, 0, 0, 1, 11, 0, 0, 0, 1]),
            },
        ];
        for (const tt of testcases) {
            tt.mesh.reset();
            for (const transtt of tranlateCases) {
                for (const seq of transtt.sequence) {
                    tt.mesh.translate(seq[0], seq[1], seq[2]);
                }
                expect((0, utils_1.checkEqual)(tt.mesh.context, transtt.want)).toBe(true);
            }
        }
        score += 2;
    });
    test('(+2) scale', () => {
        const scaleCases = [
            {
                sequence: [
                    [1, 2, 3],
                    [1, 2, 3],
                ],
                want: new mat4_1.Mat4([1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 9, 0, 0, 0, 0, 1]),
            },
        ];
        for (const tt of testcases) {
            tt.mesh.reset();
            for (const transtt of scaleCases) {
                for (const seq of transtt.sequence) {
                    tt.mesh.scale(seq[0], seq[1], seq[2]);
                }
                expect((0, utils_1.checkEqual)(tt.mesh.context, transtt.want)).toBe(true);
            }
        }
        score += 2;
    });
    test('(+2) rotation', () => {
        const rotateCases = [
            {
                sequence: [
                    [new vec4_1.Vec4(0, 1, 0, 0), Math.PI / 2],
                    [new vec4_1.Vec4(0, 1, 0, 0), Math.PI / 2],
                ],
                want: new mat4_1.Mat4([
                    -1, 0, 4.440892098500626e-16, 0, 0, 1, 0, 0, -4.440892098500626e-16,
                    0, -1, 0, 0, 0, 0, 1,
                ]),
            },
        ];
        for (const tt of testcases) {
            tt.mesh.reset();
            for (const transtt of rotateCases) {
                for (const seq of transtt.sequence) {
                    tt.mesh.rotate(seq[0], seq[1]);
                }
                expect((0, utils_1.checkEqual)(tt.mesh.context, transtt.want)).toBe(true);
            }
        }
        score += 2;
    });
    test('(+1) Tmodel', () => {
        const modelCases = [
            {
                sequence: [
                    {
                        type: 'scale',
                        value: [10, 5, 1],
                    },
                    {
                        type: 'translate',
                        value: [1, 2, 3],
                    },
                    {
                        type: 'rotate',
                        value: [new vec4_1.Vec4(0, 1, 0, 0), Math.PI / 2],
                    },
                    {
                        type: 'scale',
                        value: [1, 5, 10],
                    },
                    {
                        type: 'translate',
                        value: [1, 2, 3],
                    },
                    {
                        type: 'rotate',
                        value: [new vec4_1.Vec4(0, 1, 0, 0), Math.PI / 2],
                    },
                ],
                want: new mat4_1.Mat4([
                    -100, 0, 0, -7, 0, 25, 0, 12, 0, 0, -1, -4, 0, 0, 0, 1,
                ]),
            },
            {
                sequence: [
                    {
                        type: 'scale',
                        value: [10, 5, 1],
                    },
                    {
                        type: 'translate',
                        value: [1, 2, 3],
                    },
                    {
                        type: 'rotate',
                        value: [new vec4_1.Vec4(0, 1, 0, 0), Math.PI / 2],
                    },
                ],
                want: new mat4_1.Mat4([
                    0, 0, -1, -1, 0, 125, 0, 62, 1000, 0, 0, 69, 0, 0, 0, 1,
                ]),
            },
            {
                sequence: [
                    {
                        type: 'translate',
                        value: [1, 2, 3],
                    },
                    {
                        type: 'scale',
                        value: [10, 5, 1],
                    },
                    {
                        type: 'rotate',
                        value: [new vec4_1.Vec4(0, 1, 0, 0), Math.PI / 2],
                    },
                ],
                want: new mat4_1.Mat4([
                    1000, 0, 0, 72, 0, 625, 0, 320, 0, 0, 10, 0, 0, 0, 0, 1,
                ]),
            },
        ];
        for (const tt of testcases) {
            tt.mesh.reset();
            for (const modeltt of modelCases) {
                for (const seq of modeltt.sequence) {
                    switch (seq.type) {
                        case 'translate':
                            tt.mesh.translate(seq.value[0], seq.value[1], seq.value[2]);
                            break;
                        case 'rotate':
                            tt.mesh.rotate(seq.value[0], seq.value[1]);
                            break;
                        case 'scale':
                            tt.mesh.scale(seq.value[0], seq.value[1], seq.value[2]);
                            break;
                    }
                }
                expect((0, utils_1.checkEqual)(tt.mesh.context, modeltt.want)).toBe(true);
            }
        }
        score += 1;
    });
});
test('(+4) Tview', () => {
    // Note: Not provided. Will run at correction.
    score += 4;
});
test('(+3) Tpersp', () => {
    // Note: Not provided. Will run at correction.
    score += 3;
});
test('(+3) Tortho', () => {
    // Note: Not provided. Will run at correction.
    score += 3;
});
test('(+3) Tviewport', () => {
    // Note: Not provided. Will run at correction.
    score += 3;
});
//# sourceMappingURL=camera.test.js.map