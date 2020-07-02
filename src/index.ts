
import { mat4 } from "gl-matrix";
import { SimpleRotator } from "./simple-rotator";

let canvas;

let gl;

let cubeRotation = 0;
let rotate = true;
let lightingEnabled = true;

/** A SimpleRotator object to enable rotation by mouse dragging. */
let rotator;

let currentZoom = 8;

const zoomBounds = [5, 30]
const standardView = () => [[2, 2, 5], [0, 1, 0], currentZoom];

const backgroundColor = [0, 0, 0];

const drawCoordinateAxes = false;

const rotationSpeed = 1;

let modelViewMatrix;

let dragging = false;

window.onload = init;

function logDebug() {
    console.log(`width: ${canvas.width}`);
    console.log(`height: ${canvas.height}`);
    console.log(`clientWidth: ${canvas.clientWidth}`);
    console.log(`clientHeight: ${canvas.clientHeight}`);
}

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
        

        const vertexShaderSource = getExternalScriptSource("vertex-shader");
        const fragmentShaderSource = getExternalScriptSource("fragment-shader");
        const shaderProgram = initShaderProgram(vertexShaderSource, fragmentShaderSource);
        // const shaderProgram = initShaderProgram(vsSource, fsSource);

        const programInfo = {
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
            },
        }

        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        const buffers = initBuffers()

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

        const draw = () => drawScene(programInfo, buffers)

        rotator = new SimpleRotator(canvas, draw)

        resetView(draw);

        window.onresize = draw;

        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();

            const zoomSpeed = 0.01;

            currentZoom += event.deltaY * zoomSpeed;

            // Restrict zoom level
            currentZoom = Math.min(Math.max(currentZoom, zoomBounds[0]), zoomBounds[1]);

            // update zoom
            rotator.setViewDistance(currentZoom);

            draw();
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

function getExternalScriptSource(elementID) : string {
    try {
        const script = document.getElementById(elementID) as HTMLScriptElement;
        // make sure this is a script element with valid src attribute...?
        var xhr = new XMLHttpRequest();
        xhr.open("GET", script.src, false)
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
    rotator.setView(...standardView())
    draw()
}

function resize() {

    const realToCSSPixels = window.devicePixelRatio;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    const displayWidth = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
    const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width != displayWidth ||
        gl.canvas.height != displayHeight) {

        // Make the canvas the same size
        gl.canvas.width = displayWidth;
        gl.canvas.height = displayHeight;
    }
}

function getPositionsFromDimensions(width, height, depth) {
    let frontFace = [
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
    ];
    let backFace = [
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
    ];
    let topFace = [
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
    ];
    let bottomFace = [
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
    ];
    let rightFace = [
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
    ];
    let leftFace = [
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ]

    const faces = () => [
        ...frontFace, ...backFace, ...topFace,
        ...bottomFace, ...rightFace, ...leftFace
    ];

    // width

    let returnFaces = faces().map((value, i) => {
        if (i % 3 == 2) {
            return value * depth / 2;
        }
        else if (i % 3 == 1) {
            return value * height / 2;
        }
        else if (i % 3 == 0) {
            return value * width / 2;
        }
    })

    return returnFaces;
}

function initBuffers() {

    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.

    const positions = getPositionsFromDimensions(1, 1, 12);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const vertexNormals = [
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

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
        gl.STATIC_DRAW);

    const faceColors = [
        [1.0, 0.0, 0.0, 1.0],    // Front face: red
        [0.0, 1.0, 0.0, 1.0],    // Back face: green
        [0.0, 0.0, 1.0, 1.0],    // Top face: blue
        [1.0, 1.0, 0.0, 1.0],    // Bottom face: yellow
        [1.0, 0.0, 1.0, 1.0],    // Right face: purple
        [0.0, 1.0, 1.0, 1.0]    // Left face: cyan/aqua
    ];


    var colors = []

    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];

        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

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

    gl.clearColor(...backgroundColor, 1);
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

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

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
        const numComponents = 3;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, modelViewMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    // Set the shader uniforms

    gl.uniform1i(programInfo.uniformLocations.lightingEnabled, lightingEnabled);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix)

    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    /* Draws a WebGL primitive.  The first parameter must be one of the constants
    * that specifiy primitives:  gl.POINTS, gl.LINES, gl.LINE_LOOP, gl.LINE_STRIP,
    * gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN.  The second parameter must
    * be an array of 4 numbers in the range 0.0 to 1.0, giving the RGBA color of
    * the color of the primitive.  The third parameter must be an array of numbers.
    * The length of the array must be amultiple of 3.  Each triple of numbers provides
    * xyz-coords for one vertex for the primitive.  This assumes that uColor is the
    * location of a color uniform in the shader program, aCoords is the location of
    * the coords attribute, and aCoordsBuffer is a VBO for the coords attribute.
    */
    function drawPrimitive(primitiveType, color, vertices) {
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

        //gl.uniform4fv(uColor, color);

        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STREAM_DRAW);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);


        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);

        // drawing call?
        gl.drawArrays(primitiveType, 0, vertices.length / 3);
    }


    if (drawCoordinateAxes) {
        // disable lighting for coordinate axes
        gl.uniform1i(programInfo.uniformLocations.lightingEnabled, 0);
        gl.lineWidth(4);
        drawPrimitive(gl.LINES, [1, 0, 0, 1], [-2, 0, 0, 2, 0, 0]);
        drawPrimitive(gl.LINES, [0, 1, 0, 1], [0, -2, 0, 0, 2, 0]);
        drawPrimitive(gl.LINES, [0, 0, 1, 1], [0, 0, -2, 0, 0, 2]);
        gl.lineWidth(1);
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
    const shader = gl.createShader(type);

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
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
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