// Directional lighting
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' + // Normal
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform vec3 u_LightColor;\n' + // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'varying vec4 v_Color;\n' +
    'uniform bool u_isLighting;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
    '  if(u_isLighting)\n' +
    '  {\n' +
    '     vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
    '     float nDotL = max(dot(normal, u_LightDirection), 0.0);\n' +
    // Calculate the color due to diffuse reflection
    '     vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
    '     v_Color = vec4(diffuse, a_Color.a);\n' + '  }\n' +
    '  else\n' +
    '  {\n' +
    '     v_Color = a_Color;\n' +
    '  }\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4(); // The view matrix
var projMatrix = new Matrix4(); // The projection matrix
var g_normalMatrix = new Matrix4(); // Coordinate transformation matrix for normals

var zoom = 50; // How far zoomed in the camera is, higher is further out

var ANGLE_STEP = 3.0; // The increments of rotation angle (degrees)
var g_xAngle = 0.0; // The rotation x angle (degrees)
var g_yAngle = 0.0; // The rotation y angle (degrees)
var g_zAngle = 0.0; // The rotation z angle (degrees)

var chairMove = 0; // Move the chairs

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set clear color and enable hidden surface removal
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Get the storage locations of uniform attributes
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');

    // Trigger using lighting or not
    var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting');

    if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
        !u_ProjMatrix || !u_LightColor || !u_LightDirection ||
        !u_isLighting) {
        console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
        return;
    }

    // Set the light color (white)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Set the light direction (in the world coordinate)
    var lightDirection = new Vector3([0.5, 3.0, 4.0]);
    lightDirection.normalize(); // Normalize
    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    // Calculate the view matrix and the projection matrix
    viewMatrix.setLookAt(0, 0, 15, 0, 0, -100, 0, 1, 0);
    projMatrix.setPerspective(zoom, canvas.width / canvas.height, 1, 100);
    // Pass the model, view, and projection matrix to the uniform variable respectively
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


    document.onkeydown = function(ev) {
        keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
    };

    draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}

function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {
    switch (ev.keyCode) {
        case 40: // Up arrow key -> positive rotation around the x-axis
            g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
            break;
        case 38: // Down arrow key -> negative rotation around the x-axis
            g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
            break;
        case 39: // Right arrow key -> positive rotation around the y-axis
            g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
            break;
        case 37: // Left arrow key -> negative rotation around the y-axis
            g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
            break;
        case 90: // 'ｚ'key -> positive rotation around the z-axis
            g_zAngle = (g_zAngle + ANGLE_STEP) % 360;
            break; 
        case 88: // 'x'key -> negative rotation around the z-axis
            g_zAngle = (g_zAngle - ANGLE_STEP) % 360;
            break;
        case 86: // 'v'key -> move chairs away from the table
            //if (zoom > 10) {
            //    zoom = zoom - 10;
                //projMatrix.setPerspective(zoom, canvas.width / canvas.height, 1, 100);
                //gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
            //}
            if (chairMove < 1) {
                chairMove += 0.1;
            }
            break;
        case 67: // 'c'key -> move chairs towards the table
            //if (zoom < 100) {
            //    zoom = zoom + 10;
                //projMatrix.setPerspective(zoom, canvas.width / canvas.height, 1, 100);
                //gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
            //}
            if (chairMove > -0.3) {
                chairMove -= 0.1;
            }
            break;
        // zoom
        default:
            return; // Skip drawing at no effective action
    }

    // Draw the scene
    //projMatrix.setPerspective(zoom, canvas.width / canvas.height, 1, 100);
    draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}

function initVertexBuffers(gl, r, g, b) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([ // Coordinates
        0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, // v0-v1-v2-v3 front
        0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, // v0-v3-v4-v5 right
        0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
        -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, // v1-v6-v7-v2 left
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, // v7-v4-v3-v2 down
        0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5 // v4-v7-v6-v5 back
    ]);


    var colors = new Float32Array([ // Colors
        r, g, b, r, g, b, r, g, b, r, g, b, // v0-v1-v2-v3 front
        r, g, b, r, g, b, r, g, b, r, g, b, // v0-v3-v4-v5 right
        r, g, b, r, g, b, r, g, b, r, g, b, // v0-v5-v6-v1 up
        r, g, b, r, g, b, r, g, b, r, g, b, // v1-v6-v7-v2 left
        r, g, b, r, g, b, r, g, b, r, g, b, // v7-v4-v3-v2 down
        r, g, b, r, g, b, r, g, b, r, g, b　 // v4-v7-v6-v5 back
    ]);


    var normals = new Float32Array([ // Normal
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
    ]);


    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // right
        8, 9, 10, 8, 10, 11, // up
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // down
        20, 21, 22, 20, 22, 23 // back
    ]);


    // Write the vertex property to buffers (coordinates, colors and normals)
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}

function initAxesVertexBuffers(gl) {

    var verticesColors = new Float32Array([
        // Vertex coordinates and color (for axes)
        -20.0, 0.0, 0.0, 1.0, 1.0, 1.0, // (x,y,z), (r,g,b) 
        20.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        0.0, 20.0, 0.0, 1.0, 1.0, 1.0,
        0.0, -20.0, 0.0, 1.0, 1.0, 1.0,
        0.0, 0.0, -20.0, 1.0, 1.0, 1.0,
        0.0, 0.0, 20.0, 1.0, 1.0, 1.0
    ]);
    var n = 6;

    // Create a buffer object
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position); // Enable the assignment of the buffer object

    // Get the storage location of a_Position, assign buffer and enable
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color); // Enable the assignment of the buffer object

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return n;
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
    return g_matrixStack.pop();
}

function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(u_isLighting, false); // Will not apply lighting

    // Set the vertex coordinates and color (for the x, y axes)

    var n = initAxesVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Calculate the view matrix and the projection matrix
    modelMatrix.setTranslate(0, 0, 0); // No Translation
    // Pass the model matrix to the uniform variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Draw x and y axes
    //gl.drawArrays(gl.LINES, 0, n);

    gl.uniform1i(u_isLighting, true); // Will apply lighting

    /*
    // Set the vertex coordinates and color (for the cube)
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }
    */

    // Rotate, and then translate
    modelMatrix.setTranslate(0, 0, 0); // Translation (No translation is supported here)
    modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(g_zAngle, 0, 0, 1); // Rotate along z axis


    // x, y, z, xAngle, yAngle, zAngle, r, g, b
    drawWalls(-2, 15, 15, 7.5, 250/255, 248/255, 220/255, gl, u_ModelMatrix, u_NormalMatrix); // y coordinate of centre of floor, width depth height
    drawTable(4, 0, 4, 0, 0, 0, 171/255, 74/255, 32/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawChair(3, -0.25, 2.5 - chairMove, 0, 0, 0, 128/255, 81/255, 61/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawChair(5, -0.25, 2.5 - chairMove, 0, 0, 0, 128/255, 81/255, 61/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawChair(3, -0.25, 5.5 + chairMove, 0, 180, 0, 128/255, 81/255, 61/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawChair(5, -0.25, 5.5 + chairMove, 0, 180, 0, 128/255, 81/255, 61/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawShelf(5, 1.5, 2, 1, 2, -1.9, -7, 0, 0, 0, 107/255, 62/255, 0/255, gl, u_ModelMatrix, u_NormalMatrix); // number, spacing, width, depth
    drawShelf(5, 1.5, 2, 1, 4, -1.9, -7, 0, 0, 0, 107/255, 62/255, 0/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawShelf(5, 1.5, 2, 1, 6, -1.9, -7, 0, 0, 0, 107/255, 62/255, 0/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawShelf(3, 0.5, 5, 1.5, -6.75, -1.9, 0, 0, 90, 0, 100/255, 100/255, 100/255, gl, u_ModelMatrix, u_NormalMatrix);
    drawSofa(-1, 1, -2.5, 0, -60, 0, 1, 0.5, 0.5, gl, u_ModelMatrix, u_NormalMatrix);
    drawSofa(-1, 1, 2.5, 0, -120, 0, 1, 0.5, 0.5, gl, u_ModelMatrix, u_NormalMatrix);
    drawTV(-6.75, 1.2, 0, 0, 90, 0, 10/255, 10/255, 10/255, gl, u_ModelMatrix, u_NormalMatrix);
}

function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
    pushMatrix(modelMatrix);

    // Pass the model matrix to the uniform variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    modelMatrix = popMatrix();
}

function drawWalls(y, w, d, h, r, g, b, gl, u_ModelMatrix, u_NormalMatrix) {
    // Set the vertex coordinates and color (for the cube)
    var n = initVertexBuffers(gl, r, g, b);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Walls
    //         /|-------------------|
    //        / |                   |
    //       /  |     back wall     | height
    //      /   |                   |
    //     /left|-------------------|
    //    /wall/                    /
    //    |   /                    /
    //    |  /        floor       / depth
    //    | /                    /
    //    |/                    /
    //    |--------------------|
    //            width

    // Model floor
    pushMatrix(modelMatrix);
    //modelMatrix.translate(scale * (x + 0), scale * (y + 0), scale * (z + 0));
    modelMatrix.translate(0, y, 0);
    //modelMatrix.scale(scale * 4.0, scale * 0.25, scale * 2.0); // Scale
    modelMatrix.scale(w, 0.1, d); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model left wall
    pushMatrix(modelMatrix);
    //modelMatrix.translate(scale * (x + 1.75), scale * (y + -0.75), scale * (z + -0.75)); // Translation
    modelMatrix.translate(-d/2, y+h/2, 0); // Translation
    //modelMatrix.scale(scale * 0.25, scale * 1.5, scale * 0.25); // Scale
    modelMatrix.scale(0.1, h, d); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model back wall
    pushMatrix(modelMatrix);
    //modelMatrix.translate(scale * (x + -1.75), scale * (y + -0.75), scale * (z + -0.75)); // Translation
    modelMatrix.translate(0, y+h/2, -d/2); // Translation
    //modelMatrix.scale(scale * 0.25, scale * 1.5, scale * 0.25); // Scale
    modelMatrix.scale(w, h, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix(); 
}

function drawTable(x, y, z, xAngle, yAngle, zAngle, r, g, b, gl, u_ModelMatrix, u_NormalMatrix) {

    let tableWidth = 5;
    let tableLength = 3;
    let legWidth = 0.3;
    let legHeight = 2;

    // Set the vertex coordinates and color (for the cube)
    var n = initVertexBuffers(gl, r, g, b);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Table
    //          /---------------------------/
    //    leg1 / |                         /| leg0
    //        /  |                        / |
    //       /   |                       /  |
    //      |---------------------------|
    // leg2 |                           | leg3
    //      |                           |
    //      |                           |

    // Model table top
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(tableWidth, 0.2, tableLength); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model table leg0
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(tableWidth/2-legWidth, -legHeight/2, legWidth-tableLength/2); // Translation
    modelMatrix.scale(legWidth, legHeight, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model table leg1
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(legWidth-tableWidth/2, -legHeight/2, legWidth-tableLength/2); // Translation
    modelMatrix.scale(legWidth, legHeight, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model table leg2
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(legWidth-tableWidth/2, -legHeight/2, tableLength/2-legWidth); // Translation
    modelMatrix.scale(legWidth, legHeight, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model table leg3
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(tableWidth/2-legWidth, -legHeight/2, tableLength/2-legWidth); // Translation
    modelMatrix.scale(legWidth, legHeight, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
}

function drawChair(x, y, z, xAngle, yAngle, zAngle, r, g, b, gl, u_ModelMatrix, u_NormalMatrix) {

    let legWidth = 0.25;

    // Set the vertex coordinates and color (for the cube)
    var n = initVertexBuffers(gl, r, g, b);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Chair
    //     back |------------| back
    //          |            |
    //          |            |
    //          |            |
    //     back |            | back
    //     seat |------------|seat
    //    leg1 /||          /|| leg0
    //        / ||         / ||
    //       /  ||        /  ||   
    // seat |------------| seat
    // leg2 ||           || leg3
    //      ||           ||
    //      ||           ||

    // Model chair seat
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0, -0.25, 0);
    modelMatrix.scale(1.25, 0.25, 1.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model chair back
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0, 0.5, -0.5); // Translation // facing front
    modelMatrix.scale(1.25, 1.75, 0.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model chair leg0
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0.5, -1, -0.5); // Translation
    modelMatrix.scale(legWidth, 1.5, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model chair leg1
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(-0.5, -1, -0.5); // Translation
    modelMatrix.scale(legWidth, 1.5, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model chair leg2
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(-0.5, -1, 0.5); // Translation
    modelMatrix.scale(legWidth, 1.5, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model chair leg3
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0.5, -1, 0.5); // Translation
    modelMatrix.scale(legWidth, 1.25, legWidth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
}

function drawShelf(number, spacing, width, depth, x, y, z, xAngle, yAngle, zAngle, r, g, b, gl, u_ModelMatrix, u_NormalMatrix) {
    
    // Set the vertex coordinates and color (for the cube)
    var n = initVertexBuffers(gl, r, g, b);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Shelves
    // number = 5
    //        /-------------------/|
    //       /       shelf       / |
    //      |-------------------|  |
    //      |  |                |  |
    //      |  |----------------|  |
    //      | /                 |  |
    //      |-------------------|  |
    //      |  |                |  |
    // left |  |----------------|  | right
    // side | /                 |  | side
    //      |-------------------|  |
    //      |  |                |  |
    //      |  |----------------|  |
    //      | /                 |  |
    //      |-------------------|  |
    //      |  |                |  | spacing = 1
    //      |  |----------------|  |
    //      | /                 | / depth = 1
    //      |-------------------|/
    //             width = 2
    //
    // TV stand
    // number = 3
    //        /----------------------------------/|
    //       /              shelf               / |
    //      |----------------------------------|  |
    //      |  |-------------------------------|  | right
    // left | /                                |  | side
    // side |----------------------------------|  |
    //      |  |-------------------------------|  | spacing = 0.5
    //      | /                                | / depth = 2
    //      |----------------------------------|/
    //                    width = 4


    for (var i=0; i < number; i++) {
        // Model shelves
        pushMatrix(modelMatrix);
        modelMatrix.translate(x, y, z); // Translation
        modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
        modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
        modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
        modelMatrix.translate(0, i*spacing, 0);
        modelMatrix.scale(width, 0.1, depth); // Scale
        drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
        modelMatrix = popMatrix();
    }

    // Model left side
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0.05-width/2, (number-1)*spacing/2, 0); // Translation
    modelMatrix.scale(0.1, (number-1)*spacing, depth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model right side
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(width/2-0.05, (number-1)*spacing/2, 0); // Translation
    modelMatrix.scale(0.1, (number-1)*spacing, depth); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

}

function drawSofa(x, y, z, xAngle, yAngle, zAngle, r, g, b, gl, u_ModelMatrix, u_NormalMatrix) {
    
    // Set the vertex coordinates and color (for the cube)
    var n = initVertexBuffers(gl, r, g, b);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Sofa
    //          |---------------------------|
    //          |                           |
    //          |                           |
    //         /|                          /|
    //        / |                         / |
    //       /  |------------------------/--|
    //      /  /                        /  /|
    //      | /                         | / |
    //      |/                          |/  |   
    //      |---------------------------|   |
    //      |                           |   /
    //      |                           |  /
    //      |                           | /
    //      |---------------------------|/

    // Model sofa seat
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0, -1.75, 0);
    modelMatrix.scale(4, 0.25, 2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model sofa back
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0, -1.5, -0.875); // Translation // facing front
    modelMatrix.scale(4.25, 3, 0.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model sofa front
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0, -2.35, 0.875); // Translation // facing front
    modelMatrix.scale(4, 1.3, 0.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model sofa right side
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(2, -2, 0); // Translation
    modelMatrix.scale(0.25, 2, 2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model sofa left side
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(-2, -2, 0); // Translation
    modelMatrix.scale(0.25, 2, 2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

}

function drawTV(x, y, z, xAngle, yAngle, zAngle, r, g, b, gl, u_ModelMatrix, u_NormalMatrix) {
 
    // Set the vertex coordinates and color (for the cube)
    var n = initVertexBuffers(gl, r, g, b);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // TV
    //
    // ________________________________________
    // |                                      |
    // |                                      |
    // |                                      |
    // |                                      |
    // |                                      |
    // |                                      |
    // |                                      |
    // ----------------------------------------
    //                    |
    //                    |
    //                    |
    //      ------------------------------

    // Model TV screen
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0, 0, 0); // Translation
    modelMatrix.scale(5, 3, 0.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model TV stand
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0,-2,0); // Translation
    modelMatrix.scale(4,0.1,1.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();

    // Model TV leg
    pushMatrix(modelMatrix);
    modelMatrix.translate(x, y, z); // Translation
    modelMatrix.rotate(xAngle, 1, 0, 0); // Rotate along x axis
    modelMatrix.rotate(yAngle, 0, 1, 0); // Rotate along y axis
    modelMatrix.rotate(zAngle, 0, 0, 1); // Rotate along z axis
    modelMatrix.translate(0,-1.75,0); // Translation
    modelMatrix.scale(0.2,0.5,0.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();



}
