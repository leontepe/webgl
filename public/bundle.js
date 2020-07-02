(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /**
     * Common utilities
     * @module glMatrix
     */
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Transpose the values of a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function transpose(out, a) {
      // If we are transposing ourselves we can skip a few steps but have to cache some values
      if (out === a) {
        var a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        var a12 = a[6],
            a13 = a[7];
        var a23 = a[11];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
      } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
      }

      return out;
    }
    /**
     * Inverts a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function invert(out, a) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15];
      var b00 = a00 * a11 - a01 * a10;
      var b01 = a00 * a12 - a02 * a10;
      var b02 = a00 * a13 - a03 * a10;
      var b03 = a01 * a12 - a02 * a11;
      var b04 = a01 * a13 - a03 * a11;
      var b05 = a02 * a13 - a03 * a12;
      var b06 = a20 * a31 - a21 * a30;
      var b07 = a20 * a32 - a22 * a30;
      var b08 = a20 * a33 - a23 * a30;
      var b09 = a21 * a32 - a22 * a31;
      var b10 = a21 * a33 - a23 * a31;
      var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

      if (!det) {
        return null;
      }

      det = 1.0 / det;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return out;
    }
    /**
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

      return out;
    }

    /**
     * An object of type SimpleRotator can be used to implement a trackball-like mouse rotation
     * of a WebGL scene about the origin.  Only the first parameter to the constructor is required.
     * When an object is created, mouse event handlers are set up on the canvas to respond to rotation.
     * The class defines the following methods for an object rotator of type SimpleRotator:
     *    rotator.setView(viewDirectionVector, viewUpVector, viewDistance) set up the view, where the
     * parameters are optional and are used in the same way as the corresponding parameters in the constructor;
     *    rotator.setViewDistance(viewDistance) sets the distance of the viewer from the origin without
     * changing the direction of view;
     *    rotator.getViewDistance() returns the viewDistance;
     *    rotator.getViewMatrix() returns a Float32Array representing the viewing transformation matrix
     * for the current view, suitable for use with gl.uniformMatrix4fv or for further transformation with
     * the glmatrix library mat4 class;
     *    rotator.getViewMatrixArray() returns the view transformation matrix as a regular JavaScript
     * array, but still represents as a 1D array of 16 elements, in column-major order.
     *
     * @param canvas the HTML canvas element used for WebGL drawing.  The user will rotate the
     *    scene by dragging the mouse on this canvas.  This parameter is required.
     * @param callback if present must be a function, which is called whenever the rotation changes.
     *    It is typically the function that draws the scene
     * @param viewDirectionVector if present must be an array of three numbers, not all zero.  The
     *    view is from the direction of this vector towards the origin (0,0,0).  If not present,
     *    the value [0,0,10] is used.
     * @param viewUpVector if present must be an array of three numbers. Gives a vector that will
     *    be seen as pointing upwards in the view.  If not present, the value is [0,1,0].
     * @param viewDistance if present must be a positive number.  Gives the distance of the viewer
     *    from the origin.  If not present, the length of viewDirectionVector is used.
     */
    function SimpleRotator(canvas, callback, viewDirectionVector, viewUpVector, viewDistance) {
        if (viewDirectionVector === void 0) { viewDirectionVector = null; }
        if (viewUpVector === void 0) { viewUpVector = null; }
        if (viewDistance === void 0) { viewDistance = null; }
        var unitx = new Array(3);
        var unity = new Array(3);
        var unitz = new Array(3);
        var viewZ;
        this.setView = function (viewDirectionVector, viewUpVector, viewDistance) {
            var viewpoint = viewDirectionVector || [0, 0, 10];
            var viewup = viewUpVector || [0, 1, 0];
            if (viewDistance && typeof viewDistance == "number")
                viewZ = viewDistance;
            else
                viewZ = length(viewpoint);
            copy(unitz, viewpoint);
            normalize(unitz, unitz);
            copy(unity, unitz);
            scale(unity, unity, dot(unitz, viewup));
            subtract(unity, viewup, unity);
            normalize(unity, unity);
            cross(unitx, unity, unitz);
        };
        this.getViewMatrix = function () {
            return new Float32Array(this.getViewMatrixArray());
        };
        this.getViewMatrixArray = function () {
            return [unitx[0], unity[0], unitz[0], 0,
                unitx[1], unity[1], unitz[1], 0,
                unitx[2], unity[2], unitz[2], 0,
                0, 0, -viewZ, 1];
        };
        this.getViewDistance = function () {
            return viewZ;
        };
        this.setViewDistance = function (viewDistance) {
            viewZ = viewDistance;
        };
        function applyTransvection(e1, e2) {
            function reflectInAxis(axis, source, destination) {
                var s = 2 * (axis[0] * source[0] + axis[1] * source[1] + axis[2] * source[2]);
                destination[0] = s * axis[0] - source[0];
                destination[1] = s * axis[1] - source[1];
                destination[2] = s * axis[2] - source[2];
            }
            normalize(e1, e1);
            normalize(e2, e2);
            var e = [0, 0, 0];
            add(e, e1, e2);
            normalize(e, e);
            var temp = [0, 0, 0];
            reflectInAxis(e, unitz, temp);
            reflectInAxis(e1, temp, unitz);
            reflectInAxis(e, unitx, temp);
            reflectInAxis(e1, temp, unitx);
            reflectInAxis(e, unity, temp);
            reflectInAxis(e1, temp, unity);
        }
        // var centerX = canvas.width/2;
        // var centerY = canvas.height/2;
        var centerX = canvas.clientWidth / 2;
        var centerY = canvas.clientHeight / 2;
        var radius = Math.min(centerX, centerY);
        var radius2 = radius * radius;
        var prevx, prevy;
        var dragging = false;
        function doMouseDown(evt) {
            console.log('down');
            if (dragging)
                return;
            dragging = true;
            document.addEventListener("pointermove", doMouseDrag, false);
            document.addEventListener("pointerup", doMouseUp, false);
            var box = canvas.getBoundingClientRect();
            prevx = window.pageXOffset + evt.clientX - box.left;
            prevy = window.pageYOffset + evt.clientY - box.top;
        }
        function doMouseDrag(evt) {
            console.log('drag');
            if (!dragging)
                return;
            var box = canvas.getBoundingClientRect();
            var x = window.pageXOffset + evt.clientX - box.left;
            var y = window.pageYOffset + evt.clientY - box.top;
            var ray1 = toRay(prevx, prevy);
            var ray2 = toRay(x, y);
            applyTransvection(ray1, ray2);
            prevx = x;
            prevy = y;
            if (callback) {
                callback();
            }
        }
        function doMouseUp(evt) {
            if (dragging) {
                // log view matrix when dragging operation is done
                // console.log(`View matrix: ${getViewMatrix()}`);
                document.removeEventListener("pointermove", doMouseDrag, false);
                document.removeEventListener("pointerup", doMouseUp, false);
                dragging = false;
            }
        }
        function toRay(x, y) {
            var dx = x - centerX;
            var dy = centerY - y;
            var vx = dx * unitx[0] + dy * unity[0]; // The mouse point as a vector in the image plane.
            var vy = dx * unitx[1] + dy * unity[1];
            var vz = dx * unitx[2] + dy * unity[2];
            var dist2 = vx * vx + vy * vy + vz * vz;
            if (dist2 > radius2) {
                return [vx, vy, vz];
            }
            else {
                var z = Math.sqrt(radius2 - dist2);
                return [vx + z * unitz[0], vy + z * unitz[1], vz + z * unitz[2]];
            }
        }
        function dot(v, w) {
            return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
        }
        function length(v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        }
        function normalize(v, w) {
            var d = length(w);
            v[0] = w[0] / d;
            v[1] = w[1] / d;
            v[2] = w[2] / d;
        }
        function copy(v, w) {
            v[0] = w[0];
            v[1] = w[1];
            v[2] = w[2];
        }
        function add(sum, v, w) {
            sum[0] = v[0] + w[0];
            sum[1] = v[1] + w[1];
            sum[2] = v[2] + w[2];
        }
        function subtract(dif, v, w) {
            dif[0] = v[0] - w[0];
            dif[1] = v[1] - w[1];
            dif[2] = v[2] - w[2];
        }
        function scale(ans, v, num) {
            ans[0] = v[0] * num;
            ans[1] = v[1] * num;
            ans[2] = v[2] * num;
        }
        function cross(c, v, w) {
            var x = v[1] * w[2] - v[2] * w[1];
            var y = v[2] * w[0] - v[0] * w[2];
            var z = v[0] * w[1] - v[1] * w[0];
            c[0] = x;
            c[1] = y;
            c[2] = z;
        }
        this.setView(viewDirectionVector, viewUpVector, viewDistance);
        canvas.addEventListener("pointerdown", doMouseDown, false);
    }

    var canvas;
    var gl;
    var lightingEnabled = true;
    /** A SimpleRotator object to enable rotation by mouse dragging. */
    var rotator;
    var currentZoom = 8;
    var zoomBounds = [5, 30];
    var standardView = function () { return [[2, 2, 5], [0, 1, 0], currentZoom]; };
    var backgroundColor = [0, 0, 0];
    window.onload = init;
    function init() {
        /* const rotationCheckbox = document.querySelector('#rotationCheckbox')
        rotationCheckbox.addEventListener('change', () => {
            rotate = !rotate
        }) */
        try {
            canvas = document.querySelector('#glCanvas');
            gl = canvas.getContext('webgl');
            if (!gl) {
                gl = canvas.getContext('experimental-webgl');
            }
            if (!gl) {
                throw "Could not create WebGL context.";
            }
            console.log('lol');
            var vertexShaderSource = getExternalScriptSource("vertex-shader");
            var fragmentShaderSource = getExternalScriptSource("fragment-shader");
            var shaderProgram = initShaderProgram(vertexShaderSource, fragmentShaderSource);
            // const shaderProgram = initShaderProgram(vsSource, fsSource);
            var programInfo_1 = {
                program: shaderProgram,
                attribLocations: {
                    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                    vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                    vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
                },
                uniformLocations: {
                    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                    normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
                    lightingEnabled: gl.getUniformLocation(shaderProgram, 'uLightingEnabled')
                }
            };
            // Here's where we call the routine that builds all the
            // objects we'll be drawing.
            var buffers_1 = initBuffers();
            /*
            var then = 0;

            function render(now) {
                // convert to seconds
                now *= 0.001;
                const deltaTime = now - then;
                then = now;

                // draw the scene
                drawScene(programInfo, buffers, deltaTime)

                requestAnimationFrame(render)
            }

            requestAnimationFrame(render)
             */
            var draw_1 = function () { return drawScene(programInfo_1, buffers_1); };
            rotator = new SimpleRotator(canvas, draw_1);
            resetView(draw_1);
            window.onresize = draw_1;
            canvas.addEventListener('wheel', function (event) {
                event.preventDefault();
                var zoomSpeed = 0.01;
                currentZoom += event.deltaY * zoomSpeed;
                // Restrict zoom level
                currentZoom = Math.min(Math.max(currentZoom, zoomBounds[0]), zoomBounds[1]);
                // update zoom
                rotator.setViewDistance(currentZoom);
                draw_1();
            });
            // canvas.addEventListener("pointerdown", doMouseDown, false);
            console.log('Finished init');
        }
        catch (e) {
            // document.body.innerHTML = "Could not initialize: " + e
            // return
            throw e;
        }
    }
    function getExternalScriptSource(elementID) {
        try {
            var script = document.getElementById(elementID);
            // make sure this is a script element with valid src attribute...?
            var xhr = new XMLHttpRequest();
            xhr.open("GET", script.src, false);
            xhr.send(null);
            return xhr.responseText;
        }
        catch (e) {
            throw e;
        }
    }
    // const lightingCheckbox = document.querySelector('#lightingCheckbox')
    // lightingCheckbox.addEventListener('change', () => {
    //     lightingEnabled = !lightingEnabled
    //     // the existing render loop has to be stopped first
    //     init()
    // })
    function resetView(draw) {
        rotator.setView.apply(rotator, standardView());
        draw();
    }
    function resize() {
        var realToCSSPixels = window.devicePixelRatio;
        // Lookup the size the browser is displaying the canvas in CSS pixels
        // and compute a size needed to make our drawingbuffer match it in
        // device pixels.
        var displayWidth = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
        var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);
        // Check if the canvas is not the same size.
        if (gl.canvas.width != displayWidth ||
            gl.canvas.height != displayHeight) {
            // Make the canvas the same size
            gl.canvas.width = displayWidth;
            gl.canvas.height = displayHeight;
        }
    }
    function getPositionsFromDimensions(width, height, depth) {
        var frontFace = [
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
        ];
        var backFace = [
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
        ];
        var topFace = [
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
        ];
        var bottomFace = [
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
        ];
        var rightFace = [
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
        ];
        var leftFace = [
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ];
        var faces = function () { return __spreadArrays(frontFace, backFace, topFace, bottomFace, rightFace, leftFace); };
        // width
        var returnFaces = faces().map(function (value, i) {
            if (i % 3 == 2) {
                return value * depth / 2;
            }
            else if (i % 3 == 1) {
                return value * height / 2;
            }
            else if (i % 3 == 0) {
                return value * width / 2;
            }
        });
        return returnFaces;
    }
    function initBuffers() {
        // Create a buffer for the square's positions.
        var positionBuffer = gl.createBuffer();
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Now create an array of positions for the square.
        var positions = getPositionsFromDimensions(1, 1, 12);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        var vertexNormals = [
            // Front
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            // Back
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            // Top
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            // Bottom
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            // Right
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            // Left
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
        var faceColors = [
            [1.0, 0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0],
            [1.0, 1.0, 0.0, 1.0],
            [1.0, 0.0, 1.0, 1.0],
            [0.0, 1.0, 1.0, 1.0] // Left face: cyan/aqua
        ];
        var colors = [];
        for (var j = 0; j < faceColors.length; ++j) {
            var c = faceColors[j];
            // Repeat each color four times for the four vertices of the face
            colors = colors.concat(c, c, c, c);
        }
        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.
        var indices = [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
            normal: normalBuffer,
            color: colorBuffer,
            indices: indexBuffer
        };
    }
    function drawScene(programInfo, buffers) {
        // resize according to https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
        resize();
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor.apply(gl, __spreadArrays(backgroundColor, [1]));
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
        var fieldOfView = 45 * Math.PI / 180; // in radians
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 0.1;
        var zFar = 100.0;
        var projectionMatrix = create();
        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        /*
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.

        mat4.translate(modelViewMatrix,     // destination matrix
            modelViewMatrix,     // matrix to translate
            [-0.0, 0.0, -6.0]);  // amount to translate

        mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1])
        mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0])
        mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [1, 0, 0])
        */
        var modelViewMatrix = rotator.getViewMatrix();
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            var numComponents = 3; // pull out 2 values per iteration
            var type = gl.FLOAT; // the data in the buffer is 32bit floats
            var normalize = false; // don't normalize
            var stride = 0; // how many bytes to get from one set of values to the next
            // 0 = use type and numComponents above
            var offset = 0; // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        }
        {
            var numComponents = 4;
            var type = gl.FLOAT;
            var normalize = false;
            var stride = 0;
            var offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        }
        // Tell WebGL how to pull out the normals from
        // the normal buffer into the vertexNormal attribute.
        {
            var numComponents = 3;
            var type = gl.FLOAT;
            var normalize = false;
            var stride = 0;
            var offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);
        var normalMatrix = create();
        invert(normalMatrix, modelViewMatrix);
        transpose(normalMatrix, normalMatrix);
        // Set the shader uniforms
        gl.uniform1i(programInfo.uniformLocations.lightingEnabled, lightingEnabled);
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
        {
            var offset = 0;
            var vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
        {
            var vertexCount = 36;
            var type = gl.UNSIGNED_SHORT;
            var offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
        /*
            if (rotate) {
                cubeRotation += deltaTime * rotationSpeed
            } */
    }
    //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //
    function loadShader(type, source) {
        var shader = gl.createShader(type);
        // Send the source to the shader object
        gl.shaderSource(shader, source);
        // Compile the shader program
        gl.compileShader(shader);
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    function initShaderProgram(vsSource, fsSource) {
        var vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
        var fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
        // Create the shader program
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }

}());
//# sourceMappingURL=bundle.js.map
