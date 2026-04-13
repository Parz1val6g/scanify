import React, { useRef, useEffect } from 'react';

// GLSL fragment shader for vibrant, organic fluid-like background
const fragShader = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Simple organic noise function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;
    float t = u_time * 0.2;
    // Organic flow
    float n = noise(uv * 6.0 + t) * 0.5 + noise(uv * 12.0 - t) * 0.5;
    float d = distance(uv, mouse);
    // Neon color blend
    vec3 color = mix(
        vec3(0.0, 1.0, 0.8), // Cyan
        vec3(1.0, 0.0, 0.8), // Magenta
        n
    );
    color = mix(color, vec3(0.0, 1.0, 0.0), sin(t + uv.x * 3.0 + uv.y * 3.0) * 0.5 + 0.5); // Neon green
    // Mouse shadow effect
    color *= smoothstep(0.18, 0.05, d);
    // Vignette
    float vignette = smoothstep(0.9, 0.5, length(uv - 0.5));
    color *= vignette * 0.8 + 0.2;
    // Black base
    color = mix(vec3(0.08, 0.08, 0.10), color, 0.95);
    gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
}

const vertShader = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

export default function FluidBackground() {
    const canvasRef = useRef();
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');
        if (!gl) return;
        // Setup GLSL program
        const program = createProgram(gl, vertShader, fragShader);
        gl.useProgram(program);
        // Fullscreen quad
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                -1, 1,
                1, -1,
                1, 1
            ]),
            gl.STATIC_DRAW
        );
        const aPosition = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
        // Uniforms
        const uTime = gl.getUniformLocation(program, 'u_time');
        const uRes = gl.getUniformLocation(program, 'u_resolution');
        const uMouse = gl.getUniformLocation(program, 'u_mouse');
        let frame = 0;
        let animationId;
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        window.addEventListener('resize', resize);
        resize();
        // Mouse interaction
        function handleMouse(e) {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = canvas.height - e.clientY;
        }
        window.addEventListener('mousemove', handleMouse);
        // Animation loop
        function render() {
            frame++;
            gl.useProgram(program);
            gl.uniform1f(uTime, frame * 0.016);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationId = requestAnimationFrame(render);
        }
        render();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -2,
                pointerEvents: 'none',
                background: '#18181b'
            }}
        />
    );
}
