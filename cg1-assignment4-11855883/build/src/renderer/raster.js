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
const camera_1 = require("../camera/camera");
const mesh_1 = require("../geometry/mesh");
const mat4_1 = require("../math/mat4");
const vec4_1 = require("../math/vec4");
/**
 * Rasterizer is a software rasterizer.
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
            throw new Error('The size of rasterizer is too small!');
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
        // DONE: creates and returns a frame buffer that is initialized using
        // black color (0, 0, 0, 1) for R, G, B, A four channels.
        const vecArray = new Array();
        for (let index = 0; index < this.width * this.height; index++) {
            vecArray.push(new vec4_1.Vec4(0, 0, 0, 1));
        }
        return vecArray;
    }
    /**
     * viewportMatrix returns the viewport matrix of the given rasterizer.
     * @returns the resulting viewport matrix.
     */
    // prettier-ignore
    viewportMatrix() {
        return new mat4_1.Mat4([
            this.width / 2, 0, 0, this.width / 2,
            0, this.height / 2, 0, this.height / 2,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    /**
     * render computes one rendering pass and returns a rendered frame
     * buffer.
     *
     * @returns a frame buffer that renders the scene.
     */
    render(s) {
        const frameBuf = this.initFrameBuffer();
        const shaderInputs = new Map([
            ['modelMatrix', s.mesh.modelMatrix()],
            ['viewMatrix', s.camera.viewMatrix()],
            ['projMatrix', s.camera.projMatrix()],
            ['vpMatrix', (0, camera_1.viewportMatrix)(this.width, this.height)],
        ]);
        const length = s.mesh.faces.length;
        for (let i = 0; i < length; i++) {
            s.mesh.faces[i].primitives((v1, v2, v3) => {
                const t = this.vertexProcessing(v1, v2, v3, shaderInputs);
                // backface culling
                if (this.isBackFace(t[0].position, t[1].position, t[2].position)) {
                    return true;
                }
                // view frustum culling
                if (!this.isInViewport(t[0].position, t[1].position, t[2].position)) {
                    return true;
                }
                // draw all triangles using the same color.
                this.drawTriangle(frameBuf, t[0], t[1], t[2], new vec4_1.Vec4(0, 128, 255, 1));
                return true;
            });
        }
        return frameBuf;
    }
    /**
     * vertexProcessing prepares vertex uniforms and passes it to vertex
     * shader.
     *
     * @param tri is a given triangle
     * @param uniforms contains uniform values equal among all vertices
     * @returns
     */
    vertexProcessing(v1, v2, v3, uniforms) {
        return [
            this.vertexShader(v1, uniforms),
            this.vertexShader(v2, uniforms),
            this.vertexShader(v3, uniforms),
        ];
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
        // DONE: implement a minimum vertex shader that transform the given
        // vertex from model space to screen space.
        //
        // One can use the UV and normal directly from input vertex without
        // applying any transformations. To access elements in a Map, one
        // can use .get() method.
        //console.log(uniforms)
        const projMatrix = uniforms.get("projMatrix");
        const modelMatrix = uniforms.get("modelMatrix");
        const viewMatrix = uniforms.get("viewMatrix");
        const vpMatrix = uniforms.get("vpMatrix");
        let vert = v.position;
        vert = vert.apply(modelMatrix);
        vert = vert.apply(viewMatrix);
        vert = vert.apply(projMatrix);
        vert = vert.scale(1 / vert.w);
        vert = vert.apply(vpMatrix);
        return new mesh_1.Vert(vert, v.normal, v.uv);
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
    // Camera?? -> where is it called -> after vertexprocessing: It is a constant direction
    isBackFace(v1, v2, v3) {
        // DONE: check whether the triangle of three given vertices is a
        // backface or not.
        // Backface culling can be easily implemented by calculating the dot product*
        // of face normal and camera look at direction.assumed to be unit vectors
        // calculate the 2 vectors
        const u = v1.sub(v2);
        const v = v3.sub(v2);
        let normalVector = v.cross(u);
        normalVector.unit();
        // assuming looking at -z
        const lookAtDirection = new vec4_1.Vec4(0, 0, -1, 0);
        lookAtDirection.unit();
        // calc dot product of normal, lookAt
        const dotProd = normalVector.dot(lookAtDirection);
        if (dotProd >= 0) {
            return true;
        }
        return false;
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
        // DONE: implement view frustum culling assertion, test if a given
        // triangle is inside the screen space [0, width] x [0, height] or not.
        //
        // Hint: one can test if the AABB of the given triangle intersects
        // with the AABB of the viewport space.
        // return true;
        const aabbVector = new aabb_1.AABB(v1, v2, v3);
        const aabbViewport = new aabb_1.AABB(new vec4_1.Vec4(this.width, this.height, -1, 1), new vec4_1.Vec4(0, 0, 0, 1), new vec4_1.Vec4(0, 0, 0, 1));
        if (aabbVector.intersect(aabbViewport)) {
            return true;
        }
        return false;
    }
    /**
     * drawTriangle draws the given triangle on the given frame buffer.
     *
     * @param v1 is a vertex
     * @param v2 is a vertex
     * @param v3 is a vertex
     */
    drawTriangle(frameBuf, v1, v2, v3, color) {
        // Compute AABB make the AABB a little bigger that align with pixels
        // to contain the entire triangle.
        const aabb = new aabb_1.AABB(v1.position, v2.position, v3.position);
        const xmin = Math.round(aabb.min.x) - 1;
        const xmax = Math.round(aabb.max.x) + 1;
        const ymin = Math.round(aabb.min.y) - 1;
        const ymax = Math.round(aabb.max.y) + 1;
        // Loop all pixels in the AABB and draw if it is inside the triangle
        for (let x = xmin; x < xmax; x++) {
            for (let y = ymin; y < ymax; y++) {
                const p = new vec4_1.Vec4(x, y, 0, 1);
                if (!this.isInsideTriangle(p, v1.position, v2.position, v3.position)) {
                    continue;
                }
                this.drawPixel(frameBuf, x, y, color);
            }
        }
    }
    /**
     * isInsideTriangle tests if a given position is inside the given triangle.
     * @param p is a given position
     * @param v1 is a given vertex
     * @param v2 is a given vertex
     * @param v3 is a given vertex
     * @returns true if p is inside triangle v1v2v3
     */
    isInsideTriangle(p, v1, v2, v3) {
        // DONE: implement point in triangle assertion, returns true if the given
        // point is inside the given triangle (three vertices), or false otherwise.
        //
        // If the given point is on the edge of the given triangle, it is considered
        // as inside of the triangle in this implementation.
        // const triangle = new Triangle(new Vector3(v1.x, v1.y, v1.z), new Vector3(v2.x, v2.y, v2.z),new Vector3(v3.x, v3.x, v3.z))
        // triangle.containsPoint(new Vector3(p.x, p.y, p.z))
        // function sameSide(p1:Vec4, p2:Vec4, a:Vec4, b: Vec4): boolean{
        //   const cp1 = (b.sub(a)).cross(p1.sub(a))
        //   const cp2 = (b.sub(a)).cross(p2.sub(a))
        //   if (cp1.dot(cp2)>=0) {
        //     return true
        //   }
        //   else{
        //     return false
        //   }
        // }
        // if (sameSide(p, v1, v2, v3) && sameSide(p,v2,v1,v3) && sameSide(p,v3,v2,v1)){
        //   return true
        // }
        // else{
        //   return false
        // }
        if ((((v1.sub(v2)).cross(v1.sub(p))).dot(new vec4_1.Vec4(0, 0, 1, 0)) >= 0) &&
            (((v2.sub(v3)).cross(v2.sub(p))).dot(new vec4_1.Vec4(0, 0, 1, 0)) >= 0) &&
            ((v3.sub(v1)).cross(v3.sub(p))).dot(new vec4_1.Vec4(0, 0, 1, 0)) >= 0) {
            return true;
        }
        return false;
    }
    /**
     * drawPixel draws a pixel by its given position (x, y), the drawing
     * color is stored in the frame buffer.
     *
     * @param frameBuf is a frame buffer for pixel drawing
     * @param x is x coordiantes in screen space
     * @param y is the y coordiante in screen space
     * @param color is the color to draw
     */
    drawPixel(frameBuf, x, y, color) {
        this.updateBuffer(frameBuf, x, y, color);
    }
    /**
     * updateBuffer updates a given buffer with a given value.
     * This is a generic function that can be used to update any type of buffers
     * that contains different types of values. However, there is no difference
     * from the caller side.
     *
     * @param buf is a given buffer.
     * @param i is the index of the column of buf
     * @param j is the index of the row of buf
     * @param value is the new value to be stored in the buffer.
     */
    updateBuffer(buf, i, j, value) {
        // DONE: implement the buffer update, update the corresponding values
        // in the given buffer by the given value. Any invalid inputs (such
        // as updating index outside the buffer range) should be discarded
        // directly without bothring the buffer.
        // this.height = row = j
        // this.width = column = i
        if (i < this.width && i >= 0 && j < this.height && j >= 0) {
            const totalIndex = (this.width * j) + i;
            buf[totalIndex] = value;
        }
    }
}
exports.Rasterizer = Rasterizer;
//# sourceMappingURL=raster.js.map