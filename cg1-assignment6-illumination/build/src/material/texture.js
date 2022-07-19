"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Texture = exports.scaleDown2x = void 0;
const interpolate_1 = require("../math/interpolate");
const vec4_1 = require("../math/vec4");
const utils_1 = require("../math/utils");
/**
 * scaleDown2x resizes a given buffer to a 2x smaller array
 * (aka Average Pooling).
 *
 * @param width is the width of the given buf
 * @param height is the height of the given buf
 * @param buf is a given buffer to be resized
 */
function scaleDown2x(width, height, buf) {
    if (width % 2 !== 0 || height % 2 !== 0) {
        throw new Error('material: odd number sizes down scaling is not supported');
    }
    width *= 0.5;
    height *= 0.5;
    const ret = new Array(width * height).fill(new vec4_1.Vec4(0, 0, 0, 1));
    for (let i = 0; i < width * 2; i += 2) {
        for (let j = 0; j < height * 2; j += 2) {
            const c1 = buf[i + j * width * 2];
            const c2 = buf[i + 1 + j * width * 2];
            const c3 = buf[i + (j + 1) * width * 2];
            const c4 = buf[i + 1 + (j + 1) * width * 2];
            const r = (c1.x + c2.x + c3.x + c4.x) * 0.25;
            const g = (c1.y + c2.y + c3.y + c4.y) * 0.25;
            const b = (c1.z + c2.z + c3.z + c4.z) * 0.25;
            ret[0.5 * (i + j * width)] = new vec4_1.Vec4(r, g, b, 1);
        }
    }
    return ret;
}
exports.scaleDown2x = scaleDown2x;
/**
 * Texture represents a power-of-two 2D texture. Power-of-two means
 * that the texture width and height must be a power of two.
 * e.g. 512x512, 1024x1024.
 */
class Texture {
    /**
     * constructor constructs a texture with mipmap support.
     *
     * @param size is the size of the constructing texture
     * @param data is the raw color data
     * @param enableMipmap indicates to use mipmap or not.
     */
    constructor(size, data, enableMipmap = true) {
        if (size * size !== data.length) {
            throw new Error('material: given data does not match size x size!');
        }
        // If the given texture size is too small, then we do not bother
        // the mipmap creation.
        this.enableMipmap = enableMipmap;
        this.size = size;
        if (size === 0 || size === 1) {
            this.mipmap = [data];
            return;
        }
        // If the texture size is not a power of 2, then we stop working
        // and complain about the size of the texture.
        if ((size & (size - 1)) !== 0 || size < 0) {
            throw new Error('material: invalid texture size!');
        }
        this.mipmap = this.createMipmap(data);
    }
    /**
     * createMipmap creates a isotropic MIP map hierarchy. The hierarchy
     * scales the texture image from its own size (e.g. 1024) down to 1.
     *
     * For instance:
     *
     * L0  mipmap[0]:  1024x1024 image
     * L1  mipmap[1]:  512x512   image
     * L2  mipmap[2]:  256x256   image
     * ...
     * L10 mipmap[10]: 1x1       image
     *
     * @returns a mipmap
     */
    createMipmap(data) {
        // Compute the number of layers appear in a mipmap
        const L = Math.log2(this.size) + 1; // and the original
        if (!Number.isInteger(L)) {
            throw new Error('material: the mipmap level is not an integer!');
        }
        const mipmap = new Array(L);
        mipmap[0] = data;
        // TODO: create MIP maps and store them into the allocated mipmap
        // array, then return the mipmap array when the scaling is finished.
        //
        // We can use the scaleDown2x function on the top of the file for
        // scaling operation (recommended) or implement a helper function
        // that does the scaling. Note that a higher level of mipmap
        // contains a smaller size of the texture.
        for (let i = 1; i < L; i++) {
            const size = this.size / Math.pow(2, i - 1);
            mipmap[i] = scaleDown2x(size, size, mipmap[i - 1]);
        }
        return mipmap;
    }
    /**
     * query fetches the color of a pixel (u, v). This function is an
     * isotropic mipmap implementation that does magnification and
     * minification.
     *
     * @param u is the u coordinate
     * @param v is the v coordinate
     * @param lod is the level of detail to query
     */
    query(u, v, lod = 0) {
        // Early error checking.
        if (u < 0 || u > 1 || v < 0 || v > 1) {
            throw new Error('material: out of UV query range!');
        }
        // Query L0 directly if not using mipmap
        if (!this.enableMipmap) {
            return this.queryNaive(u, v);
        }
        // Make sure LOD is sitting on a valid range before proceed,
        // e.g. [0, 10] .
        if (lod < 0) {
            lod = 0;
        }
        else if (lod >= this.mipmap.length - 1) {
            lod = this.mipmap.length - 2;
        }
        // Decrease the LOD so that color query get higher resolution texture,
        // thus the rendering becomes more shaper.
        if (lod < 1) {
            return this.queryNaive(u, v);
        }
        lod -= 1;
        // Figure out two different mipmap levels, then compute
        // tri-linear interpolation between the two discrete mipmap levels.
        const h = Math.floor(lod);
        let l = Math.floor(lod) + 1;
        if (l >= this.mipmap.length - 1) {
            l = h; // if l is too big, then make it equal as h.
        }
        // e.g. h = 1, l = 2, the query lod = 1.4, then t = 1.4 - 1 = 0.4
        //
        // ----------- h   (e.g. 1.0)
        //      ^
        //      |
        //      |<---- lod (e.g. 1.4)
        //      |
        //      v
        //   -------   l   (e.g. 2.0)
        const t = lod - h;
        return this.queryTrilinear(h, l, t, u, v);
    }
    /**
     * queryNaive does a coarse color query from the given texture
     * without using the internal mipmap hierarchy.
     *
     * @param u is the U coordinate of the given texture
     * @param v is the V coordinate of the given texture
     * @returns the queried color from L0 of the MIP map.
     */
    queryNaive(u, v) {
        const tex = this.mipmap[0];
        const x = Math.floor(u * (this.size - 1)); // very coarse approximation.
        const y = Math.floor(v * (this.size - 1)); // very coarse approximation.
        const idx = x + y * this.size;
        return tex[idx];
    }
    /**
     * queryTrilinear interpolates and queries the texture color from its internal
     * mipmap hierarchy.
     *
     * @param h is the mipmap level for the higher resolution image
     * @param l is the mipmap level for the lower resolution image
     * @param t is the interpolation paramter
     * @param u is the U coordinate of a texture
     * @param v is the V coordinate of a texture
     * @returns the interpolated color queried from the stored mipmap.
     */
    queryTrilinear(h, l, t, u, v) {
        // TODO: Implement trilinear interpolation by query color using
        // bilinear interpolation on two different mipmap levels, then
        // interpolate the queried two colors. Since the caller of this
        // function consider h as the interpolation starting point, and
        // l as the endpoint (see comments in above), thus say if the
        // color queried from h-level is c1, and the color queried from
        // l-level is c2, then the trilinear interpolated color should be
        // lerp(c1, c2, t).
        //
        // Hint: To interpolate two colors, one can use LerpV.
        // fast paths, avoid redudant and useless queries.
        if ((0, utils_1.approxEqual)(t, 0)) {
            const x = (u * this.size) / Math.pow(2, h);
            const y = (v * this.size) / Math.pow(2, h);
            return this.queryBilinear(h, x, y);
        }
        if ((0, utils_1.approxEqual)(t, 1)) {
            const x = (u * this.size) / Math.pow(2, l);
            const y = (v * this.size) / Math.pow(2, l);
            return this.queryBilinear(l, x, y);
        }
        const L1 = this.queryBilinear(h, (u * this.size) / Math.pow(2, h), (v * this.size) / Math.pow(2, h));
        const L2 = this.queryBilinear(l, (u * this.size) / Math.pow(2, l), (v * this.size) / Math.pow(2, l));
        return (0, interpolate_1.LerpV)(L1, L2, t);
    }
    /**
     * queryBilinear interpolates and queries the texture color at position
     * (x, y), the origin of a texture is on the bottom left corner.
     *
     *
     * ^ y
     * |
     * |-----------+
     * |           |
     * |    * (x,y)|
     * |           |
     * |           |
     * +-------------> x
     *
     * @param lod is the mipmap level for querying colors.
     * @param x is the x coordinate of the texture image instead of u
     * @param y is the y coordinate of the texture image instead of v
     * @returns the bilinearly interpolated color at (x, y).
     */
    queryBilinear(lod, x, y) {
        // TODO: Interpolate and query the color at position (x, y).
        //
        // To interpolate a color at (x, y), we can query four colors at the
        // following four different positions:
        //
        //
        // 1. (Math.floor(x),   Math.floor(y))
        // 2. (Math.floor(x)+1, Math.floor(y))
        // 3. (Math.floor(x),   Math.floor(y)+1)
        // 4. (Math.floor(x)+1, Math.floor(y)+1)
        //
        // +---------+---------+
        // |         |         |
        // |    3    |    4    |
        // |         |         |
        // +---------+---------+
        // |         |         |
        // |    1    |    2    |
        // |         |         |
        // +---------+---------+
        //
        // Then bilinearly interpolate all of them to (x, y).
        //
        // However, if Math.floor(x)+1 falls outside of the texture, then
        // the above approach can fail. In this case, we could query the
        // colors at:
        //
        // (Math.floor(x)-1, Math.floor(y))
        // (Math.floor(x),   Math.floor(y))
        // (Math.floor(x)-1, Math.floor(y)+1)
        // (Math.floor(x),   Math.floor(y)+1)
        //
        // Similarly, the same approach can also be used to deal with the case
        // when Math.floor(y)+1 falls outside of the texture.
        //
        // To get the color on a pixel of texture image, one can use the this.color()
        // method.
        //
        // The simple case: if the lod is the final level of the mipmap (1x1),
        // we can return the color directly.
        const buf = this.mipmap[lod];
        const size = Math.sqrt(buf.length);
        // Fast path: no interpolation needed.
        if (size === 1) {
            return buf[0];
        }
        // Slow path: do the job.
        let x0 = Math.floor(x);
        if (x0 + 1 >= size) {
            x0 -= 1;
            x -= 1;
        }
        let y0 = Math.floor(y);
        if (y0 + 1 >= size) {
            y0 -= 1;
            y -= 1;
        }
        const p1 = this.color(buf, size, x0, y0);
        const p2 = this.color(buf, size, x0 + 1, y0);
        const i1 = (0, interpolate_1.LerpV)(p1, p2, x - x0);
        const p3 = this.color(buf, size, x0, y0 + 1);
        const p4 = this.color(buf, size, x0 + 1, y0 + 1);
        const i2 = (0, interpolate_1.LerpV)(p3, p4, x - x0);
        return (0, interpolate_1.LerpV)(i1, i2, y - y0);
    }
    /**
     * color fetches the color of a given texture color buffer at (i, j).
     * @param buf the texture image color buffer
     * @param size is the size of the image
     * @param i is the column of the texture
     * @param j is the row of the texture
     * @returns the color of the texture at (i, j)
     */
    color(buf, size, i, j) {
        return buf[i + j * size];
    }
}
exports.Texture = Texture;
//# sourceMappingURL=texture.js.map