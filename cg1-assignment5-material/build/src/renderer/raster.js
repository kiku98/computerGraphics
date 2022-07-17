"use strict";
/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rasterizer = void 0;
const aabb_1 = require("../geometry/aabb");
const mesh_1 = require("../geometry/mesh");
const camera_1 = require("../camera/camera");
const utils_1 = require("../math/utils");
const vec4_1 = require("../math/vec4");
/**
 * Rasterizer is a CPU rasterizer.
 */
class Rasterizer {
    /**
     * constructor constructs a rasterizer for rendering a scene to a
     * screen with the given size (width x height).
     *
     * @param width is the width of the screen for rasterization
     * @param height is the height of the screen for rasterization
     */
    constructor(width, height) {
        if (width <= 0.5 || height <= 0.5) {
            throw new Error('renderer: the size of rasterizer is too small!');
        }
        this.width = Math.round(width);
        this.height = Math.round(height);
    }
    /**
     * initFrameBuffer initializes a frame buffer by the size of the
     * rasterizer.
     *
     * @returns a frame buffer that stores a black color in all pixels.
     */
    initFrameBuffer() {
        return new Array(this.width * this.height).fill(new vec4_1.Vec4(0, 0, 0, 1));
    }
    /**
     * initDepthBuffer initializes a depth buffer by the size of the
     * rasterizer.
     *
     * @returns a depth buffer that stores a black color in all pixels.
     */
    initDepthBuffer() {
        // DONE: Initialize the depth buffer using an appropriate value.
        return new Array(this.width * this.height).fill(-1);
    }
    /**
     * render computes one rendering pass and returns a rendered frame
     * buffer.
     *
     * @returns a frame buffer that renders the scene.
     */
    render(s) {
        const frameBuf = this.initFrameBuffer();
        const depthBuf = this.initDepthBuffer();
        // Render all meshes on a scene.
        for (let m = 0; m < s.meshes.length; m++) {
            const mesh = s.meshes[m];
            const uniforms = new Map([
                ['modelMatrix', mesh.modelMatrix()],
                ['viewMatrix', s.camera.viewMatrix()],
                ['projMatrix', s.camera.projMatrix()],
                ['vpMatrix', (0, camera_1.viewportMatrix)(this.width, this.height)],
            ]);
            const length = mesh.faces.length;
            for (let i = 0; i < length; i++) {
                mesh.faces[i].primitives((v1, v2, v3) => {
                    this.drawTriangle(frameBuf, depthBuf, uniforms, v1, v2, v3, mesh.material);
                    return true;
                });
            }
        }
        return frameBuf;
    }
    /**
     * vertexShader is a shader that applies on a given vertex and outputs
     * a new vertex.
     *
     * @param v is a given vertex
     * @param uniforms is the uniform values that are equal among all vertices
     * @returns a vertex
     */
    vertexShader(v, uniforms) {
        const modelMatrix = uniforms.get('modelMatrix');
        const viewMatrix = uniforms.get('viewMatrix');
        const projMatrix = uniforms.get('projMatrix');
        const vpMatrix = uniforms.get('vpMatrix');
        const pos = v.position
            .apply(modelMatrix)
            .apply(viewMatrix)
            .apply(projMatrix)
            .apply(vpMatrix);
        return new mesh_1.Vert(pos.scale(1 / pos.w), v.normal, v.uv);
    }
    /**
     * drawTriangle draws the given triangle on the given frame buffer.
     */
    drawTriangle(frameBuf, depthBuf, uniforms, v1, v2, v3, mat) {
        const t1 = this.vertexShader(v1, uniforms);
        const t2 = this.vertexShader(v2, uniforms);
        const t3 = this.vertexShader(v3, uniforms);
        // Backface culling
        if (this.isBackFace(t1.position, t2.position, t3.position)) {
            return;
        }
        // View frustum culling
        if (!this.isInViewport(t1.position, t2.position, t3.position)) {
            return;
        }
        // Perspective corrected interpolation (see below)
        const t1Z = 1 / t1.position.z;
        t1.uv = new vec4_1.Vec4(t1.uv.x / t1.position.z, t1.uv.y / t1.position.z, 0, 1);
        const t2Z = 1 / t2.position.z;
        t2.uv = new vec4_1.Vec4(t2.uv.x / t2.position.z, t2.uv.y / t2.position.z, 0, 1);
        const t3Z = 1 / t3.position.z;
        t3.uv = new vec4_1.Vec4(t3.uv.x / t3.position.z, t3.uv.y / t3.position.z, 0, 1);
        // Compute AABB and make the AABB a little bigger and align it with pixels
        // to contain the entire triangle
        const aabb = new aabb_1.AABB(t1.position, t2.position, t3.position);
        const xmin = Math.round(aabb.min.x) - 1;
        const xmax = Math.round(aabb.max.x) + 1;
        const ymin = Math.round(aabb.min.y) - 1;
        const ymax = Math.round(aabb.max.y) + 1;
        // Loop all pixels in the AABB and draw if it is inside the triangle
        for (let x = xmin; x < xmax; x++) {
            for (let y = ymin; y < ymax; y++) {
                // With the barycentric coordinates computation below, the early
                // check becomes obsolete (also see this.isInsideTriangleNew).
                const p = new vec4_1.Vec4(x, y, 0, 1);
                if (!this.isInsideTriangleOld(p, t1.position, t2.position, t3.position)) {
                    continue;
                }
                // Compute barycentric coordinates
                const bc = this.computeBarycentric(new vec4_1.Vec4(x, y, 0, 1), t1.position, t2.position, t3.position);
                // We have to compute the barycentric coordinates anyway. Using
                // barycentric coordinates to check if a position is inside the
                // triangle is the most practical and efficient way.
                if (!this.isInsideTriangleNew(bc.x, bc.y, bc.z)) {
                    continue;
                }
                // Early Z-test
                const z = this.barycentricInterpolation(bc, t1.position.z, t2.position.z, t3.position.z);
                if (!this.passDepthTest(depthBuf, x, y, z)) {
                    continue;
                }
                // Perspective corrected interpolation. See:
                //
                // Low, Kok-Lim. "Perspective-correct interpolation." Technical writing,
                // Department of Computer Science, University of North Carolina at Chapel Hill (2002).
                const Z = this.barycentricInterpolation(bc, t1Z, t2Z, t3Z);
                // UV interpolation
                const uv = new vec4_1.Vec4(this.barycentricInterpolation(bc, t1.uv.x, t2.uv.x, t3.uv.x) / Z, this.barycentricInterpolation(bc, t1.uv.y, t2.uv.y, t3.uv.y) / Z, 0, 1);
                // Compute du dv
                let L = 0;
                if (mat.texture.enableMipmap) {
                    const bcX = this.computeBarycentric(new vec4_1.Vec4(x + 1, y, 0, 1), t1.position, t2.position, t3.position);
                    const bcY = this.computeBarycentric(new vec4_1.Vec4(x, y + 1, 0, 1), t1.position, t2.position, t3.position);
                    const dU = new vec4_1.Vec4(this.barycentricInterpolation(bcX, t1.uv.x, t2.uv.x, t3.uv.x) / Z, this.barycentricInterpolation(bcX, t1.uv.y, t2.uv.y, t3.uv.y) / Z, 0, 1);
                    const dV = new vec4_1.Vec4(this.barycentricInterpolation(bcY, t1.uv.x, t2.uv.x, t3.uv.x) / Z, this.barycentricInterpolation(bcY, t1.uv.y, t2.uv.y, t3.uv.y) / Z, 0, 1);
                    L = this.computeMipmapLevel(mat.texture.size, uv, dU, dV) - 1;
                }
                const color = mat.texture.query(uv.x, uv.y, L);
                // We found the color, let's draw the pixel!
                this.fragmentProcessing(frameBuf, depthBuf, x, y, z, color);
            }
        }
        if (mat.showWireframe) {
            this.drawWireframe(frameBuf, depthBuf, t1.position, t2.position, t3.position, mat.wireframeColor);
        }
    }
    /**
     * computeBarycentric computes the barycentric coordinates for
     * the given position. The computed barycentric coordinates are
     * in viewport space.
     *
     * @param p is a position
     * @param v1 is a given vertex
     * @param v2 is a given vertex
     * @param v3 is a given vertex
     * @returns the barycentric coordinates
     */
    computeBarycentric(p, v1, v2, v3) {
        // TODO: Compute the barycentric coordinates for p. The Vec4s
        // v1, v2, and v3 represent a triangle. Note that barycentric
        // coordinates are computed in a 2D space, thus conceptually,
        // the computation only needs to utilize the x-y coordinates and
        // can ignore z and w components. The returned value that contains
        // the barycentric coordinates is typed using Vec4 but the
        // corresponding w component can either be 1 or 0 (does not matter
        // in this case because it is neither a position nor a Vec4).
        // const p = new Vec4(0, 2, 0, 1);
        const v1Zero = new vec4_1.Vec4(v1.x, v1.y, 0, 1);
        const v2Zero = new vec4_1.Vec4(v2.x, v2.y, 0, 1);
        const v3Zero = new vec4_1.Vec4(v3.x, v3.y, 0, 1);
        //const fN = v2.sub(v1).cross(v3.sub(v1));
        const totalSpace = 0.5 * v1Zero.sub(v2Zero).cross(v1Zero.sub(v3Zero)).len();
        const w1Normal = p.sub(v2Zero).cross(p.sub(v3Zero));
        const w2Normal = p.sub(v1Zero).cross(p.sub(v3Zero));
        const w3Normal = p.sub(v1Zero).cross(p.sub(v2Zero));
        let w1 = 0.5 * w1Normal.len();
        let w2 = 0.5 * w2Normal.len();
        let w3 = 0.5 * w3Normal.len();
        if (v2Zero.sub(v1Zero).cross(p.sub(v1Zero)).z < 0) {
            console.log('AB');
            w3 = -w3;
        }
        if (v3Zero.sub(v2Zero).cross(p.sub(v2Zero)).z < 0) {
            console.log('BC');
            w1 = -w1;
        }
        if (v1Zero.sub(v3Zero).cross(p.sub(v3Zero)).z < 0) {
            console.log('CA');
            w2 = -w2;
        }
        // console.log(new Vec4(w1 / totalSpace, w2 / totalSpace, w3 / totalSpace, 1));
        return new vec4_1.Vec4(w1 / totalSpace, w2 / totalSpace, w3 / totalSpace, 1);
    }
    /**
     * barycentricInterpolation implements the barycentric interpolation for
     * the input values, i.e. barycentric coordinates or vertex attribute values.
     *
     * @param bc contains the barycentric coordinates for interpolation
     * @param v1 is one of the three values for barycentric interpolation
     * @param v2 is one of the three values for barycentric interpolation
     * @param v3 is one of the three values for barycentric interpolation
     * @returns the barycentric interpolated values
     */
    barycentricInterpolation(bc, v1, v2, v3) {
        // TODO: Interpolate v1,v2,v3 using barycentric coordinates (bc),
        // and return the computed value. The interpolation only requires
        // the xyz component of the bc Vec4 and the w component is *not*
        // used here.
        return 0;
    }
    /**
     * passDepthTest conducts a depth test.
     *
     * @param depthBuf is the depth buffer for applying a depth test
     * @param x is the column of the depthBuf
     * @param y is the row of the depthBuf
     * @param z is the depth value
     * @returns true if the depth test is passed or false if not.
     */
    passDepthTest(depthBuf, x, y, z) {
        // DONE: Compare and return true if a depth value is greater than the
        // existing depth value in the depth buffer or not otherwise.
        const actualDepth = depthBuf[y * this.width + x];
        if (z > actualDepth) {
            return true;
        }
        return false;
    }
    /**
     * computeMipmapLevel computes the estimated mipmap level to query the
     * texture color.
     *
     * @param size is the size of texture
     * @param uv is the actual UV coordinates of the current pixel
     * @param dU is the UV coordinates of the next pixel on X direction
     * @param dV is the UV coordinates of the next pixel on Y direction
     * @returns
     */
    computeMipmapLevel(size, uv, dU, dV) {
        // TODO: Compute the estimated mipmap level using given parameters.
        return 0;
    }
    /**
     * isBackFace checks if a given triangle is a back face or not. If the
     * face normal is orthogonal to the viewport, it is also considered as
     * a back face.
     *
     * @param v1 is a given vertex position
     * @param v2 is a given vertex position
     * @param v3 is a given vertex position
     * @returns whether the given triangle is a back face or not.
     */
    isBackFace(v1, v2, v3) {
        const fN = v2.sub(v1).cross(v3.sub(v1));
        return new vec4_1.Vec4(0, 0, -1, 0).dot(fN) >= 0;
    }
    /**
     * isInViewport asserts if the given triangles are in the
     * viewport view frustum [0, width] x [0, height] or not.
     *
     * @param v1 is a given vertex position
     * @param v2 is a given vertex position
     * @param v3 is a given vertex position
     * @returns true if the given triangle is in the view frustum, or false
     * otherwise.
     */
    isInViewport(v1, v2, v3) {
        const viewportAABB = new aabb_1.AABB(new vec4_1.Vec4(this.width, this.height, 1, 1), new vec4_1.Vec4(0, 0, 0, 1), new vec4_1.Vec4(0, 0, -1, 1));
        const triangleAABB = new aabb_1.AABB(v1, v2, v3);
        return viewportAABB.intersect(triangleAABB);
    }
    /**
     * isInsideTriangleOld tests if a given position is inside the given triangle.
     * @param p is a given position
     * @param v1 is a given vertex position
     * @param v2 is a given vertex position
     * @param v3 is a given vertex position
     * @returns true if p is inside triangle v1v2v3
     */
    isInsideTriangleOld(p, v1, v2, v3) {
        const AB = new vec4_1.Vec4(v2.x, v2.y, 0, 1).sub(new vec4_1.Vec4(v1.x, v1.y, 0, 1));
        const AP = p.sub(new vec4_1.Vec4(v1.x, v1.y, 0, 1));
        if (AB.cross(AP).z < 0) {
            console.log('AB');
            return false;
        }
        const BC = new vec4_1.Vec4(v3.x, v3.y, 0, 1).sub(new vec4_1.Vec4(v2.x, v2.y, 0, 1));
        const BP = p.sub(new vec4_1.Vec4(v2.x, v2.y, 0, 1));
        if (BC.cross(BP).z < 0) {
            console.log('BC');
            return false;
        }
        const CA = new vec4_1.Vec4(v1.x, v1.y, 0, 1).sub(new vec4_1.Vec4(v3.x, v3.y, 0, 1));
        const CP = p.sub(new vec4_1.Vec4(v3.x, v3.y, 0, 1));
        if (CA.cross(CP).z < 0) {
            console.log('CA');
            return false;
        }
        return true;
    }
    /**
     * isInsideTriangleNew tests if a given position's barycentric
     * coordinates means inside the triangle or not.
     * @param w1 is one of the barycentric coordinates
     * @param w2 is one of the barycentric coordinates
     * @param w3 is one of the barycentric coordinates
     * @returns true if p is inside triangle v1v2v3
     */
    isInsideTriangleNew(w1, w2, w3) {
        return w1 >= 0 && w2 >= 0 && w3 >= 0;
    }
    /**
     * drawWireframe draws the wireframe of the given triangle.
     *
     * @param frameBuf is a given frame buffer
     * @param v1 is a given vertex position
     * @param v2 is a given vertex position
     * @param v3 is a given vertex position
     * @param color is a given color for drawing
     */
    drawWireframe(frameBuf, depthBuf, v1, v2, v3, color) {
        // TODO: Draw the wireframe of the triangle. One can draw three
        // lines from one vertex to the other, but order matters.
    }
    /**
     * drawLine implements the Bresenham algorithm that draws a line
     * segment starting from p1 and ends at p2. The drawn pixels are
     * stored in a given frame buffer.
     *
     * @param frameBuf is a frame buffer for drawing lines
     * @param depthBuf is a depth buffer for caching depth values
     * @param p1 is the staring point for line drawing
     * @param p2 is the end point for line drawing
     * @param color is the drawing color
     * @param epsilon is used for dealing with numeric issue
     */
    drawLine(frameBuf, depthBuf, p1, p2, color, epsilon = 1e-3) {
        if (Math.abs(p2.y - p1.y) < Math.abs(p2.x - p1.x)) {
            if (p1.x > p2.x) {
                [p1, p2] = [p2, p1];
            }
            this.drawLineLow(frameBuf, depthBuf, p1, p2, color, epsilon);
        }
        else {
            if (p1.y > p2.y) {
                [p1, p2] = [p2, p1];
            }
            this.drawLineHigh(frameBuf, depthBuf, p1, p2, color, epsilon);
        }
    }
    drawLineLow(frameBuf, depthBuf, p1, p2, color, epsilon) {
        const x0 = Math.round(p1.x);
        const y0 = Math.round(p1.y);
        const z0 = p1.z;
        const x1 = Math.round(p2.x);
        const y1 = Math.round(p2.y);
        const z1 = p2.z;
        const dx = x1 - x0;
        let dy = y1 - y0;
        let yi = 1;
        if (dy < 0) {
            yi = -1;
            dy = -dy;
        }
        let D = 2 * dy - dx;
        let y = y0;
        for (let x = x0; x <= x1; x++) {
            const z = ((z1 - z0) * (x - x0)) / (x1 - x0) + z0;
            // Dealing with numeric issues. The interpolated z value above
            // might be quite different than the z value computed via
            // barycentric interpolation numerically. We use an approximate
            // z value to draw the wireframe, instead of using a depth test.
            // This approach may fail when the object is further away from
            // the camera. The caller does not have to worry about this.
            // Use it as-is. A known better approach is to cooperate with
            // barycentric coordinates using gradient but requires more
            // computation.
            if ((0, utils_1.approxEqual)(depthBuf[x + y * this.width], z, epsilon)) {
                this.fragmentProcessing(frameBuf, depthBuf, x, y, z, color);
            }
            if (D > 0) {
                y += yi;
                D -= 2 * dx;
            }
            D += 2 * dy;
        }
    }
    drawLineHigh(frameBuf, depthBuf, p1, p2, color, epsilon) {
        const x0 = Math.round(p1.x);
        const y0 = Math.round(p1.y);
        const z0 = p1.z;
        const x1 = Math.round(p2.x);
        const y1 = Math.round(p2.y);
        const z1 = p2.z;
        let dx = x1 - x0;
        const dy = y1 - y0;
        let xi = 1;
        if (dx < 0) {
            xi = -1;
            dx = -dx;
        }
        let D = 2 * dx - dy;
        let x = x0;
        for (let y = y0; y <= y1; y++) {
            const z = ((z1 - z0) * (y - y0)) / (y1 - y0) + z0;
            // Dealing with numeric issues. The interpolated z value above
            // might be quite different than the z value computed via
            // barycentric interpolation numerically. We use an approximate
            // z value to draw the wireframe, instead of using a depth test.
            // This approach may fail when the object is further away from
            // the camera. The caller does not have to worry about this.
            // Use it as-is. A known better approach is to cooperate with
            // barycentric coordinates using gradient but requires more
            // computation.
            if ((0, utils_1.approxEqual)(depthBuf[x + y * this.width], z, epsilon)) {
                this.fragmentProcessing(frameBuf, depthBuf, x, y, z, color);
            }
            if (D > 0) {
                x += xi;
                D -= 2 * dy;
            }
            D += 2 * dx;
        }
    }
    /**
     * fragmentProcessing fills pixel with color by its given position
     * (x, y), the drawing color is stored in the frame buffer.
     *
     * @param frameBuf is a frame buffer for drawing pixels
     * @param depthBuf is a depth buffer for caching depth values
     * @param x is the x coordiante in screen space
     * @param y is the y coordiante in screen space
     * @param z is the depth value
     * @param color is the color to draw
     */
    fragmentProcessing(frameBuf, depthBuf, x, y, z, color) {
        this.updateBuffer(depthBuf, x, y, z);
        this.updateBuffer(frameBuf, x, y, color);
    }
    /**
     * updateBuffer updates a given buffer with a given value.
     *
     * This is a generic function that can be used to update any type of
     * buffers that contains different types of values. However, there is
     * no difference from the caller side.
     */
    updateBuffer(buf, i, j, value) {
        if (i < 0 || i >= this.width || value === undefined) {
            return;
        }
        if (j < 0 || j >= this.height || value === undefined) {
            return;
        }
        buf[i + j * this.width] = value;
    }
}
exports.Rasterizer = Rasterizer;
//# sourceMappingURL=raster.js.map