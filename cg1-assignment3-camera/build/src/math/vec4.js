"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec4 = void 0;
const utils_1 = require("./utils");
/**
 * Vec4 is a homogenous representation of a 3D point (w === 1)
 * or 3D vector (w === 0). If the given inputs represent points, then
 * some of the methods will throw an error.
 *
 * For instance, the cross() method cannot be called on a point or with
 * a point parameter, both must be vectors:
 *
 *    const v1 = new Vec4(1, 2, 3, 4);
 *    const v2 = new Vec4(2, 3, 4, 5);
 *    try {
 *      console.log(v1.cross(v2)); // will throw an error
 *    } catch (e) {
 *      console.log(e);
 *    }
 *
 *    const v3 = new Vector(1, 2, 3, 0);
 *    const v4 = new Vector(2, 3, 4, 0);
 *    console.log(v3.cross(v4)); // OK, Vector(-1, 2, -1, 0)
 *
 */
class Vec4 {
    /**
     * constructor constructs a Vector with given x, y, z, w components.
     *
     * @param x component
     * @param y component
     * @param z component
     * @param w component
     */
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    /**
     * eq checks whether two vectors are equal.
     * @param v is a Vec4 vector
     * @returns true if two given vectors are approximately equal, otherwise false.
     */
    eq(v) {
        return ((0, utils_1.approxEqual)(this.x, v.x) &&
            (0, utils_1.approxEqual)(this.y, v.y) &&
            (0, utils_1.approxEqual)(this.z, v.z) &&
            (0, utils_1.approxEqual)(this.w, v.w));
    }
    /**
     * copy copies the current vector
     * @returns a copy of the current vector
     */
    copy() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }
    /**
     * add adds the given two vectors and returns a new resulting vector.
     * The resulting vector is a newly allocated vector.
     *
     * @param v is a Vec4 vector
     * @returns the resulting vector
     */
    add(v) {
        return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }
    /**
     * sub subtracts the given two vectors and returns a new resulting vector.
     * The resulting vector is a newly allocated vector.
     *
     * @param v is a Vec4 vector
     * @returns the resulting vector
     */
    sub(v) {
        return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }
    /**
     * dot computes the dot product of the given two vectors and returns
     * the resulting number. Note that this method will throw an error
     * if the given vectors do not represent vectors (i.e. w !== 0).
     *
     * @param v is a Vec4 vector
     * @returns the resulting number
     */
    dot(v) {
        if (!(0, utils_1.approxEqual)(this.w, 0) || !(0, utils_1.approxEqual)(v.w, 0)) {
            throw new Error('math: Vec4.dot expect vector other than point');
        }
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }
    /**
     * cross computes the cross product of the given two vectors and returns
     * the resulting vector. Note that this method will throw an error
     * if the given vectors do not represent vectors (i.e. w !== 0).
     * The resulting vector is a newly allocated vector.
     *
     * @param v is a Vec4 vector
     * @returns the resulting vector
     */
    cross(v) {
        if (!(0, utils_1.approxEqual)(this.w, 0) || !(0, utils_1.approxEqual)(v.w, 0)) {
            throw new Error('math: expect vector other than point');
        }
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vec4(x, y, z, 0);
    }
    /**
     * len computes the length of the given Vector. Note that this method
     * will throw an error if the given vector does not represent a vector
     * (i.e. w !== 0).
     *
     * @returns the vector length
     */
    len() {
        return Math.sqrt(this.dot(this));
    }
    /**
     * unit computes a unit Vector along with the given vector direction.
     * Note that this method will throw an error if the given vector does
     * not represents a vector (i.e. w !== 0).
     * The resulting vector is a newly allocated vector.
     *
     * @returns the resulting vector
     */
    unit() {
        if (!(0, utils_1.approxEqual)(this.w, 0)) {
            throw new Error('math: expect vector other than point');
        }
        const l = this.len();
        const u = new Vec4(0, 0, 0, 0);
        u.x = this.x / l;
        u.y = this.y / l;
        u.z = this.z / l;
        u.w = 0;
        return u;
    }
    /**
     * apply applies a matrix transformation on the given vector.
     * The resulting vector is a newly allocated vector.
     *
     * @param m a Mat4 matrix
     * @returns the resulting vector
     */
    apply(m) {
        const x = m.get(0, 0) * this.x +
            m.get(0, 1) * this.y +
            m.get(0, 2) * this.z +
            m.get(0, 3) * this.w;
        const y = m.get(1, 0) * this.x +
            m.get(1, 1) * this.y +
            m.get(1, 2) * this.z +
            m.get(1, 3) * this.w;
        const z = m.get(2, 0) * this.x +
            m.get(2, 1) * this.y +
            m.get(2, 2) * this.z +
            m.get(2, 3) * this.w;
        const w = m.get(3, 0) * this.x +
            m.get(3, 1) * this.y +
            m.get(3, 2) * this.z +
            m.get(3, 3) * this.w;
        return new Vec4(x, y, z, w);
    }
    /**
     * scale scales the given Vector by a given scalar value, and returns
     * a new resulting Vector.
     *
     * @param s is a scalar value
     * @returns the resulting Vector
     */
    scale(s) {
        return new Vec4(this.x * s, this.y * s, this.z * s, this.w * s);
    }
}
exports.Vec4 = Vec4;
//# sourceMappingURL=vec4.js.map