/**
 * Copyright © 2022 LMU Munich Medieninformatik. All rights reserved.
 * Created by Changkun Ou <https://changkun.de>.
 *
 * Use of this source code is governed by a GNU GPLv3 license that
 * can be found in the LICENSE file.
 */

import {ICamera, PerspectiveCamera, viewportMatrix} from '../camera/camera';
import {AABB} from '../geometry/aabb';
import {Vert} from '../geometry/mesh';
import {PointLight} from '../lights/point';
import {Mat4} from '../math/mat4';
import {approxEqual} from '../math/utils';
import {clampV} from '../math/interpolate';
import {Vec4} from '../math/vec4';
import {Material, MaterialOptions} from '../material/material';
import {scaleDown2x} from '../material/texture';
import {Scene} from './scene';

/**
 * Rasterizer is a CPU rasterizer.
 */
export class Rasterizer {
  // width is the width of the rasterizer
  width: number;
  // height is the height of the rasterizer
  height: number;
  // msaa enables multi-sample anti aliasing
  msaa: number;
  // context is the scene to render
  context?: Scene;

  /**
   * constructor constructs a rasterizer for rendering a scene to a
   * screen with the given size (width x height).
   *
   * @param width is the width of the screen for rasterization
   * @param height is the height of the screen for rasterization
   * @param msaa is the MSAA level
   */
  constructor(width: number, height: number, msaa = 1) {
    if (width <= 0.5 || height <= 0.5) {
      throw new Error('The size of rasterizer is too small!');
    }
    if (msaa < 1 || !Number.isInteger(Math.log2(msaa))) {
      throw new Error('invalid msaa option!');
    }

    this.width = Math.round(width * msaa);
    this.height = Math.round(height * msaa);
    this.msaa = msaa;
  }
  /**
   * initFrameBuffer initializes a frame buffer by the size of the
   * rasterizer.
   *
   * @returns a frame buffer that stores a black color in all pixels.
   */
  initFrameBuffer(): Array<Vec4> {
    return new Array<Vec4>(this.width * this.height).fill(new Vec4(0, 0, 0, 1));
  }
  /**
   * initDepthBuffer initializes a depth buffer by the size of the
   * rasterizer.
   *
   * @returns a depth buffer that stores a black color in all pixels.
   */
  initDepthBuffer(): Array<number> {
    // Any values <= -1 are valid, but -1 is the optimal.
    return new Array<number>(this.width * this.height).fill(-1);
  }

  /**
   * render computes one rendering pass and returns a rendered frame
   * buffer.
   *
   * @returns a frame buffer that renders the scene.
   */
  render(s: Scene): Array<Vec4> {
    this.context = s;
    const frameBuf = this.initFrameBuffer();
    const depthBuf = this.initDepthBuffer();

    // Render all meshes on a scene.
    for (let m = 0; m < s.meshes.length; m++) {
      const mesh = s.meshes[m];

      const uniforms = new Map<string, Mat4>([
        ['modelMatrix', mesh.modelMatrix()],
        ['viewMatrix', s.camera.viewMatrix()],
        ['projMatrix', s.camera.projMatrix()],
        ['vpMatrix', viewportMatrix(this.width, this.height)],
        ['normalMatrix', mesh.normalMatrix()],
      ]);

      const length = mesh.faces.length;
      for (let i = 0; i < length; i++) {
        this.drawTriangle(
          frameBuf,
          depthBuf,
          uniforms,
          mesh.faces[i].verts[0],
          mesh.faces[i].verts[1],
          mesh.faces[i].verts[2],
          mesh.material
        );
      }
    }

    // Multi-sample Anti-aliasing
    return this.antialiasing(frameBuf);
  }
  /**
   * antialiasing implements the MSAA antialiasing algorithm.
   *
   * @param frameBuf is the framebuffer to be antialiased.
   * @returns the antialiased frame buffer.
   */
  antialiasing(frameBuf: Array<Vec4>): Array<Vec4> {
    // TODO: implement MSAA antialiasing algorithm.
    //
    // One can calculate using this.width, this.hight and this.msaa to determine
    // the target size of the antialiased frame buffer, then use scaleDown2x
    // to scale image down step by step.
    //
    // The this.msaa can only be 1, 2, 4, ... power of two.
    const factor = Math.log2(this.msaa);
    let frameBufferReduced = frameBuf;
    for (let index = 0; index < factor; index++) {
      frameBufferReduced = scaleDown2x(
        this.width / Math.pow(2, index),
        this.height / Math.pow(2, index),
        frameBufferReduced
      );
    }
    return frameBufferReduced;
  }
  /**
   * vertexShader is a shader that applies on a given vertex and outputs
   * a new vertex.
   *
   * @param v is a given vertex
   * @param uniforms is the uniform values that are equal among all vertices
   * @returns a vertex
   */
  vertexShader(v: Vert, uniforms: Map<string, Mat4>): Vert {
    const modelMatrix = <Mat4>uniforms.get('modelMatrix');
    const viewMatrix = <Mat4>uniforms.get('viewMatrix');
    const projMatrix = <Mat4>uniforms.get('projMatrix');
    const vpMatrix = <Mat4>uniforms.get('vpMatrix');
    const normalMatrix = <Mat4>uniforms.get('normalMatrix');
    const pos = v.position
      .apply(modelMatrix)
      .apply(viewMatrix)
      .apply(projMatrix)
      .apply(vpMatrix);
    return new Vert(pos.scale(1 / pos.w), v.normal.apply(normalMatrix), v.uv);
  }
  /**
   * drawTriangle draws the given triangle on the given frame buffer.
   */
  drawTriangle(
    frameBuf: Array<Vec4>,
    depthBuf: Array<number>,
    uniforms: Map<string, Mat4>,
    v1: Vert,
    v2: Vert,
    v3: Vert,
    mat: Material
  ) {
    const modelMatrix = <Mat4>uniforms.get('modelMatrix');
    const m1 = v1.position.apply(modelMatrix);
    const m2 = v2.position.apply(modelMatrix);
    const m3 = v3.position.apply(modelMatrix);

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
    let t1Z = 1;
    let t2Z = 1;
    let t3Z = 1;
    if (this.context!.camera instanceof PerspectiveCamera) {
      t1Z = 1 / t1.position.z;
      t1.uv = new Vec4(t1.uv.x / t1.position.z, t1.uv.y / t1.position.z, 0, 1);
      t2Z = 1 / t2.position.z;
      t2.uv = new Vec4(t2.uv.x / t2.position.z, t2.uv.y / t2.position.z, 0, 1);
      t3Z = 1 / t3.position.z;
      t3.uv = new Vec4(t3.uv.x / t3.position.z, t3.uv.y / t3.position.z, 0, 1);
    }

    // Compute AABB and make the AABB a little bigger and align it with pixels
    // to contain the entire triangle
    const aabb = new AABB(t1.position, t2.position, t3.position);
    const xmin = Math.round(aabb.min.x) - 1;
    const xmax = Math.round(aabb.max.x) + 1;
    const ymin = Math.round(aabb.min.y) - 1;
    const ymax = Math.round(aabb.max.y) + 1;

    // Loop all pixels in the AABB and draw if it is inside the triangle
    for (let x = xmin; x < xmax; x++) {
      for (let y = ymin; y < ymax; y++) {
        // Compute barycentric coordinates
        const bc = this.computeBarycentric(
          new Vec4(x, y, 0, 1),
          t1.position,
          t2.position,
          t3.position
        );
        if (bc.x < 0 || bc.y < 0 || bc.z < 0) {
          continue;
        }

        // Early Z-test
        const z = this.barycentricInterpolation(
          bc,
          t1.position.z,
          t2.position.z,
          t3.position.z
        );
        if (!this.passDepthTest(depthBuf, x, y, z)) {
          continue;
        }

        // Perspective corrected interpolation. See:
        //
        // Low, Kok-Lim. "Perspective-correct interpolation." Technical
        // writing, Department of Computer Science, University of North
        // Carolina at Chapel Hill (2002).
        let Z = 1;
        if (this.context!.camera instanceof PerspectiveCamera) {
          Z = this.barycentricInterpolation(bc, t1Z, t2Z, t3Z);
        }

        // UV interpolation
        const uv = new Vec4(
          this.barycentricInterpolation(bc, t1.uv.x, t2.uv.x, t3.uv.x) / Z,
          this.barycentricInterpolation(bc, t1.uv.y, t2.uv.y, t3.uv.y) / Z,
          0,
          1
        );

        // Compute du dv
        let L = 0;
        if (mat.texture.enableMipmap) {
          const bcX = this.computeBarycentric(
            new Vec4(x + 1, y, 0, 1),
            t1.position,
            t2.position,
            t3.position
          );
          const bcY = this.computeBarycentric(
            new Vec4(x, y + 1, 0, 1),
            t1.position,
            t2.position,
            t3.position
          );
          const dU = new Vec4(
            this.barycentricInterpolation(bcX, t1.uv.x, t2.uv.x, t3.uv.x) / Z,
            this.barycentricInterpolation(bcX, t1.uv.y, t2.uv.y, t3.uv.y) / Z,
            0,
            1
          );
          const dV = new Vec4(
            this.barycentricInterpolation(bcY, t1.uv.x, t2.uv.x, t3.uv.x) / Z,
            this.barycentricInterpolation(bcY, t1.uv.y, t2.uv.y, t3.uv.y) / Z,
            0,
            1
          );

          L = this.computeMipmapLevel(mat.texture.size, uv, dU, dV);
        }
        let color = mat.texture.query(uv.x, uv.y, L);

        // normal interpolation
        const normal = new Vec4(
          this.barycentricInterpolation(
            bc,
            t1.normal.x,
            t2.normal.x,
            t3.normal.x
          ),
          this.barycentricInterpolation(
            bc,
            t1.normal.y,
            t2.normal.y,
            t3.normal.y
          ),
          this.barycentricInterpolation(
            bc,
            t1.normal.z,
            t2.normal.z,
            t3.normal.z
          ),
          0
        ).unit();

        // fragment position interpolation (in model space)
        const px = this.barycentricInterpolation(bc, m1.x, m2.x, m3.x);
        const py = this.barycentricInterpolation(bc, m1.y, m2.y, m3.y);
        const pz = this.barycentricInterpolation(bc, m1.z, m2.z, m3.z);
        const pos = new Vec4(px, py, pz, 1);

        // draw triangle wireframe using a different color.
        const blinnPhong = this.blinnPhong(
          pos,
          normal,
          mat.options,
          this.context!.light,
          this.context!.camera
        );

        // We completed the color, let's draw the pixel!
        color = clampV(color.scale(blinnPhong));
        this.fragmentProcessing(frameBuf, depthBuf, x, y, z, color);
      }
    }
    if (mat.showWireframe) {
      this.drawWireframe(
        frameBuf,
        depthBuf,
        t1.position,
        t2.position,
        t3.position,
        mat.wireframeColor
      );
    }
  }
  /**
   * blinnPhong computes the blinn-phong reflectance model and returns
   * the corresponding shading value at given shading point.
   *
   * @param x is the shading point
   * @param normal is the normal of the shading point
   * @param matopts is the material
   * @param light is the light
   * @param camera is the camera
   * @returns the blinnPhong shading value
   */
  blinnPhong(
    x: Vec4,
    normal: Vec4,
    matopts: MaterialOptions,
    light: PointLight,
    camera: ICamera
  ): number {
    const L = this.lightDir(x, light);
    const V = this.viewDir(x, camera);
    const H = this.halfVector(L, V);

    const La = this.La(matopts);
    const Ld = this.Ld(matopts, normal, L);
    const Ls = this.Ls(matopts, normal, H);

    return La + Ld + Ls;
  }
  /**
   * lightDir calculates the unit light direction.
   *
   * @param x is the corresponding model space coordinates of the shading pixel
   * @param light is the light position in model space
   * @returns the light direction
   */
  lightDir(x: Vec4, light: PointLight): Vec4 {
    // TODO: return light direction
    return light.position.sub(x).unit();
  }
  /**
   * viewDir returns the view direction (from shading point to camera)
   *
   * @param x is the corresponding model space coordinates of the shading pixel
   * @param camera is the camera in model space
   * @returns the view direction
   */
  viewDir(x: Vec4, camera: ICamera): Vec4 {
    // TODO: return view direction
    return camera.position.sub(x).unit();
  }
  /**
   * halfVector returns the half vector.
   *
   * @param L is the light direction
   * @param V is the view direction
   * @returns the half vector
   */
  halfVector(L: Vec4, V: Vec4): Vec4 {
    // TODO: return half-vector
    return V.add(L).unit();
  }
  /**
   * La returns ambient term of the Blinn-Phong reflectance model
   * @param matopts is the material rendering options
   * @returns the ambient term of the Blinn-Phong reflectance model
   */
  La(matopts: MaterialOptions): number {
    // TODO: return ambient term
    return matopts.Kamb;
  }
  /**
   * Ld returns diffuse term of the Blinn-Phong reflectance model
   *
   * @param matopts is the material rendering options
   * @param normal is the normal direction at the shading point
   * @param L is the light direction at the shading point
   * @returns the diffuse term of the Blinn-Phong reflectance model
   */
  Ld(matopts: MaterialOptions, normal: Vec4, L: Vec4): number {
    // TODO: return diffuse term
    return matopts.Kdiff * Math.max(0, normal.dot(L));
  }
  /**
   * Ls returns specular term of the Blinn-Phong reflectance model
   *
   * @param matopts is the material rendering options
   * @param normal is the normal direction at the shading point
   * @param H is the half-vector at the shading point
   * @returns the specular term of the Blinn-Phong reflectance model
   */
  Ls(matopts: MaterialOptions, normal: Vec4, H: Vec4): number {
    // TODO: return specular term
    return (
      matopts.Kspec * Math.pow(Math.max(0, normal.dot(H)), matopts.shininess)
    );
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
  computeBarycentric(p: Vec4, v1: Vec4, v2: Vec4, v3: Vec4): Vec4 {
    // Compute the barycentric coordinates for p. The vectors
    // v1, v2, and v3 represent a triangle. Note that barycentric
    // coordinates are computed in a 2D space, thus conceptually,
    // the computation only needs to utilize the x-y coordinates and
    // can ignore z and w components. The returned value that contains
    // the barycentric coordinates is typed using Vector but the
    // corresponding w component can either be 1 or 0 (does not matter
    // in this case because it is neither a position nor a vector).
    const ap = p.sub(new Vec4(v1.x, v1.y, 0, 1));
    const ab = new Vec4(v2.x, v2.y, 0, 1).sub(new Vec4(v1.x, v1.y, 0, 1));
    const ac = new Vec4(v3.x, v3.y, 0, 1).sub(new Vec4(v1.x, v1.y, 0, 1));
    const bc = new Vec4(v3.x, v3.y, 0, 1).sub(new Vec4(v2.x, v2.y, 0, 1));
    const bp = p.sub(new Vec4(v2.x, v2.y, 0, 1));
    const out = new Vec4(0, 0, -1, 0);
    const Sabc = ab.cross(ac).dot(out);
    const Sabp = ab.cross(ap).dot(out);
    const Sapc = ap.cross(ac).dot(out);
    const Sbcp = bc.cross(bp).dot(out);
    return new Vec4(Sbcp / Sabc, Sapc / Sabc, Sabp / Sabc, 1);
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
  barycentricInterpolation(
    bc: Vec4,
    v1: number,
    v2: number,
    v3: number
  ): number {
    // Interpolate v1,v2,v3 using barycentric coordinates (bc),
    // and return the computed value. The interpolation only requires
    // the xyz component of the bc Vector and the w component is *not*
    // used here.
    return v1 * bc.x + v2 * bc.y + v3 * bc.z;
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
  passDepthTest(
    depthBuf: Array<number>,
    x: number,
    y: number,
    z: number
  ): boolean {
    // Compare and return true if depth value is greater than
    // existing depth value in the depth buffer or not otherwise.
    return z > depthBuf[x + y * this.width];
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
  computeMipmapLevel(size: number, uv: Vec4, dU: Vec4, dV: Vec4): number {
    // The Mipmap level is computed using the size of the texture, therefore
    // here we should use size, instead of size-1 (which is for computing
    // element indices).
    const Lu = dU.sub(uv).scale(size).len();
    const Lv = dV.sub(uv).scale(size).len();
    return Math.log2(Math.max(Lu, Lv));
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
  isBackFace(v1: Vec4, v2: Vec4, v3: Vec4): boolean {
    const fN = v2.sub(v1).cross(v3.sub(v1));
    return new Vec4(0, 0, -1, 0).dot(fN) >= 0;
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
  isInViewport(v1: Vec4, v2: Vec4, v3: Vec4): boolean {
    const viewportAABB = new AABB(
      new Vec4(this.width, this.height, 1, 1),
      new Vec4(0, 0, 0, 1),
      new Vec4(0, 0, -1, 1)
    );
    const triangleAABB = new AABB(v1, v2, v3);
    return viewportAABB.intersect(triangleAABB);
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
  drawWireframe(
    frameBuf: Array<Vec4>,
    depthBuf: Array<number>,
    v1: Vec4,
    v2: Vec4,
    v3: Vec4,
    color: Vec4
  ) {
    // The order of drawing wireframe is important because the line
    // drawing numerical instability of the Bresenham algorithm may show
    // different types of results. Therefore, we stick to the convention
    // of in this course, i.e. draw the lines counterclockwise: v1->v2->v3.
    this.drawLine(frameBuf, depthBuf, v1, v2, color);
    this.drawLine(frameBuf, depthBuf, v2, v3, color);
    this.drawLine(frameBuf, depthBuf, v3, v1, color);
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
  drawLine(
    frameBuf: Array<Vec4>,
    depthBuf: Array<number>,
    p1: Vec4,
    p2: Vec4,
    color: Vec4,
    epsilon = 1e-3
  ) {
    if (Math.abs(p2.y - p1.y) < Math.abs(p2.x - p1.x)) {
      if (p1.x > p2.x) {
        [p1, p2] = [p2, p1];
      }
      this.drawLineLow(frameBuf, depthBuf, p1, p2, color, epsilon);
    } else {
      if (p1.y > p2.y) {
        [p1, p2] = [p2, p1];
      }
      this.drawLineHigh(frameBuf, depthBuf, p1, p2, color, epsilon);
    }
  }
  drawLineLow(
    frameBuf: Array<Vec4>,
    depthBuf: Array<number>,
    p1: Vec4,
    p2: Vec4,
    color: Vec4,
    epsilon: number
  ) {
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
      if (approxEqual(depthBuf[x + y * this.width], z, epsilon)) {
        this.fragmentProcessing(frameBuf, depthBuf, x, y, z, color);
      }
      if (D > 0) {
        y += yi;
        D -= 2 * dx;
      }
      D += 2 * dy;
    }
  }
  drawLineHigh(
    frameBuf: Array<Vec4>,
    depthBuf: Array<number>,
    p1: Vec4,
    p2: Vec4,
    color: Vec4,
    epsilon: number
  ) {
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
      if (approxEqual(depthBuf[x + y * this.width], z, epsilon)) {
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
  fragmentProcessing(
    frameBuf: Array<Vec4>,
    depthBuf: Array<number>,
    x: number,
    y: number,
    z: number,
    color: Vec4
  ) {
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
  updateBuffer<Type>(buf: Array<Type>, i: number, j: number, value: Type) {
    if (i < 0 || i >= this.width) {
      return;
    }
    if (j < 0 || j >= this.height) {
      return;
    }

    buf[i + j * this.width] = value;
  }
}
