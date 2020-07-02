attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

attribute vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform mat4 uNormalMatrix;

varying lowp vec4 vColor;
varying highp vec3 vLighting;

uniform bool uLightingEnabled;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;

    // apply lighting effect
    if (uLightingEnabled) {
        // ambient light
        highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);

        // directional light
        highp vec3 directiionalLightColor = vec3(1, 1, 1); // light color: white
        highp vec3 directionalVector = normalize(vec3(0.2, 1, 0.2));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
        highp float directional = max(dot(transformedNormal.xzy, directionalVector), 0.0);
        
        // total lighting: ambient light + directional light
        vLighting = ambientLight + (directiionalLightColor * directional);
    }
    else {
        // no lighting
        vLighting = vec3(1.0, 1.0, 1.0);
    }
}