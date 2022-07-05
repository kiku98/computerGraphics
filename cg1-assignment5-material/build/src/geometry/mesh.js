"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadOBJ = exports.Mesh = exports.Face = exports.Vert = void 0;
const material_1 = require("../material/material");
const texture_1 = require("../material/texture");
const vec4_1 = require("../math/vec4");
const object_1 = require("./object");
/**
 * A Vert contains all supported vertex information, such as position,
 * uv, and normal.
 */
class Vert {
    constructor(position, normal, uv) {
        this.position = position;
        this.normal = normal;
        this.uv = uv;
    }
}
exports.Vert = Vert;
/**
 * Face represents a polygon that may contain n different vertices (n >=3).
 */
class Face {
    constructor(vs) {
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
    primitives(iter) {
        for (let i = 0; i < this.verts.length - 2; i++) {
            if (!iter(this.verts[0], this.verts[i + 1], this.verts[i + 2])) {
                return false;
            }
        }
        return true;
    }
}
exports.Face = Face;
/**
 * Mesh represents a polygon mesh.
 */
class Mesh extends object_1.Object3D {
    constructor(positions, normals, uvs, faces) {
        super();
        this.positions = positions;
        this.normals = normals;
        this.uvs = uvs;
        this.faces = faces;
        this.material = new material_1.Material(new texture_1.Texture(0, [], false), false, new vec4_1.Vec4(0, 0, 0, 1));
    }
    /**
     * primitives iterates all primitives of the given mesh.
     *
     * @param fn is an iterator that receives three vertices (in counterclockwise)
     * that represents a triangle. The iteration stops if fn returns false.
     * @returns true if all primitives are iterated
     */
    primitives(iter) {
        for (const face of this.faces) {
            if (!face.primitives((v1, v2, v3) => {
                return iter(v1, v2, v3);
            })) {
                return false;
            }
        }
        return true;
    }
    /**
     * useMaterial uses the given material as the rendering material of
     * the given mesh.
     *
     * @param mat is a material
     */
    useMaterial(mat) {
        this.material = mat;
    }
}
exports.Mesh = Mesh;
/**
 * LoadOBJ loads a .obj input data and turns it into a Mesh.
 *
 * @param data is a string that contains data from a .obj file
 * @returns a Mesh that represents the input polygon mesh.
 */
function LoadOBJ(data) {
    const faces = [];
    const positions = [];
    const normals = [];
    const uvs = [];
    const lines = data.split('\n');
    for (let line of lines) {
        line = line.trim();
        const tokens = line.split(' ');
        const verts = [];
        switch (tokens[0].trim()) {
            case 'v':
                positions.push(new vec4_1.Vec4(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]), 1));
                break;
            case 'vt':
                uvs.push(new vec4_1.Vec4(parseFloat(tokens[1]), parseFloat(tokens[2]), 0, 1));
                break;
            case 'vn':
                normals.push(new vec4_1.Vec4(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]), 0));
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
exports.LoadOBJ = LoadOBJ;
//# sourceMappingURL=mesh.js.map