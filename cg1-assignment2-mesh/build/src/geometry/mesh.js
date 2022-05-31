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
const vec4_1 = require("../math/vec4");
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
            throw new Error('number of input vertices is less than 3');
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
        // TODO: iterate all triangle primitives and pass the corresponding
        // vertices as arguments of the given function iter.
        return iter(this.verts[0], this.verts[1], this.verts[2]);
    }
}
exports.Face = Face;
/**
 * Mesh represents a polygon mesh.
 */
class Mesh {
    constructor(positions, normals, uvs, faces) {
        this.positions = positions;
        this.normals = normals;
        this.uvs = uvs;
        this.faces = faces;
    }
    /**
     * primitives iterates all primitives of the given mesh.
     *
     * @param fn is an iterator that receives three vertices (in counterclockwise)
     * that represents a triangle. The iteration stops if fn returns false.
     * @returns true if all primitives are iterated
     */
    primitives(iter) {
        // TODO: iterate all triangle primitives and pass the corresponding
        // vertices as arguments of the given function iter.
        for (let i = 0; i < this.faces.length; i++) {
            if (!iter(this.faces[i].verts[0], this.faces[i].verts[1], this.faces[i].verts[2])) {
                return iter(this.faces[i].verts[0], this.faces[i].verts[1], this.faces[i].verts[2]);
            }
        }
        return true;
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
    // TODO: parse the input `data` into a Mesh.
    const splitEveryLine = data.split('\n');
    const positions = [];
    const normals = [];
    const uvs = [];
    const faces = [];
    for (let i = 0; i < splitEveryLine.length; i++) {
        if (splitEveryLine[i].startsWith('v ')) {
            const elements = splitEveryLine[i].split(' ');
            if (elements.length === 4) {
                positions.push(new vec4_1.Vec4(parseFloat(elements[1]), parseFloat(elements[2]), parseFloat(elements[3]), 1));
            }
        }
        if (splitEveryLine[i].startsWith('vn ')) {
            const elements = splitEveryLine[i].split(' ');
            if (elements.length === 4) {
                normals.push(new vec4_1.Vec4(parseFloat(elements[1]), parseFloat(elements[2]), parseFloat(elements[3]), 0));
            }
        }
        if (splitEveryLine[i].startsWith('vt ')) {
            const elements = splitEveryLine[i].split(' ');
            if (elements.length === 3) {
                uvs.push(new vec4_1.Vec4(parseFloat(elements[1]), parseFloat(elements[2]), 0, 1));
            }
        }
        if (splitEveryLine[i].startsWith('f ')) {
            const elements = splitEveryLine[i].split(' ');
            if (elements.length === 4) {
                const vertsStorer = [];
                for (let i = 1; i < elements.length; i++) {
                    const subelem = elements[i].split('/');
                    const position_elem = parseInt(subelem[0]);
                    const uvs_elem = parseInt(subelem[1]);
                    const normal_elem = parseInt(subelem[2]);
                    const newvert = new Vert(positions[position_elem - 1], normals[normal_elem - 1], uvs[uvs_elem - 1]);
                    vertsStorer.push(newvert);
                }
                faces.push(new Face(vertsStorer));
            }
        }
    }
    return new Mesh(positions, normals, uvs, faces);
}
exports.LoadOBJ = LoadOBJ;
//# sourceMappingURL=mesh.js.map