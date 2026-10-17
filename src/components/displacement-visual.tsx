"use client";

import { useEffect, useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "framer-motion";
import type { Project } from "@/content/projects";

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* Procedural motif morph: two generative patterns cross-dissolved
   through FBM domain displacement. No textures — pure GPU. */
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;
uniform float uPatA;
uniform float uPatB;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// 0 = grid contours, 1 = ledger bars, 2 = field blobs, 3 = signal wave
vec3 pattern(float idx, vec2 p, float t) {
  vec3 paper = vec3(0.957, 0.949, 0.929);
  vec3 accent = vec3(1.0, 0.302, 0.0);
  vec3 col = vec3(0.0);
  if (idx < 0.5) {
    float f = fbm(p * 1.6 + vec2(t * 0.25, -t * 0.2));
    float bands = abs(fract(f * 7.0 + t * 0.6) - 0.5) * 2.0;
    float contour = 1.0 - smoothstep(0.0, 0.10, bands);
    col = paper * contour * 0.35;
    vec2 g = abs(fract(p * 9.0) - 0.5);
    float grid = 1.0 - smoothstep(0.0, 0.05, min(g.x, g.y));
    col += paper * grid * 0.10;
    col += accent * contour * 0.35;
  } else if (idx < 1.5) {
    float row = floor((p.y + 0.6) * 4.0);
    float fr = fract((p.y + 0.6) * 4.0);
    float v = 0.5 + 0.3 * sin(t * 0.9 + row * 1.8);
    float bar = step(p.x, -0.5 + v * 1.1) * step(0.25, fr) * step(fr, 0.75);
    float isAccent = 1.0 - min(abs(row - 1.0), 1.0);
    col = paper * bar * 0.22 + accent * bar * (0.25 + 0.75 * isAccent);
  } else if (idx < 2.5) {
    vec2 sp = vec2(p.x * 0.8 + t * 0.15, p.y * 1.1 - t * 0.1);
    float ff = fbm(sp + 2.0 * fbm(sp + t * 0.1));
    float mass = smoothstep(0.35, 0.7, ff);
    float rim = 1.0 - smoothstep(0.0, 0.08, abs(ff - 0.52));
    col = mix(vec3(0.0), vec3(0.55, 0.12, 0.01), mass);
    col += paper * rim * 0.5;
    col += accent * mass * 0.35;
  } else {
    float wy = sin(p.x * 5.0 + t * 1.6) * 0.16 + sin(p.x * 11.0 - t * 1.1) * 0.06;
    float d = abs(p.y - 0.05 - wy);
    float line = exp(-d * d * 160.0);
    float echo = exp(-abs(p.y - 0.05 - sin(p.x * 5.0 + (t - 0.5) * 1.6) * 0.16) * 40.0);
    col = paper * (line * 0.7 + echo * 0.15);
    col += accent * line * 0.8;
  }
  return col;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float pr = clamp(uProgress, 0.0, 1.0);

  // displacement peaks mid-transition — the morph feels physical
  float disp = pr * (1.0 - pr) * 4.0;
  vec2 dp = (vec2(fbm(p * 2.5 + t * 0.2), fbm(p * 2.5 + 7.3 - t * 0.15)) - 0.5) * 0.45 * disp;
  vec2 q = p + dp;

  vec3 colA = pattern(uPatA, q, t);
  vec3 colB = pattern(uPatB, q, t + 3.7);
  // eased mix with a hot seam at the crossover
  float m = smoothstep(0.0, 1.0, pr);
  vec3 col = mix(colA, colB, m);
  col += vec3(1.0, 0.45, 0.1) * disp * 0.18;

  // animated grain + vignette
  col += vec3(hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.035;
  col *= mix(0.5, 1.0, smoothstep(1.6, 0.3, length(p * vec2(0.82, 1.0))));

  gl_FragColor = vec4(col, 1.0);
}
`;

const PATTERN_INDEX: Record<Project["motif"], number> = {
  grid: 0,
  ledger: 1,
  field: 2,
  signal: 3,
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("shader alloc failed");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || "compile failed");
  }
  return sh;
}

/** Raw WebGL morph surface — progress driven externally (scroll/hover). */
export function DisplacementSurface({
  from,
  to,
  progress,
  className,
}: {
  from: Project["motif"];
  to: Project["motif"];
  progress: MotionValue<number>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      progressRef.current = Math.min(1, Math.max(0, v));
    });
    return unsub;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      depth: false,
      stencil: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    let prog: WebGLProgram | null = null;
    try {
      prog = gl.createProgram();
      if (!prog) throw new Error("program alloc failed");
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link failed");
      gl.useProgram(prog);
    } catch (e) {
      console.error("[DisplacementSurface] init failed:", e);
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    if (loc >= 0) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uProgress = gl.getUniformLocation(prog, "uProgress");
    const uPatA = gl.getUniformLocation(prog, "uPatA");
    const uPatB = gl.getUniformLocation(prog, "uPatB");
    gl.uniform1f(uPatA, PATTERN_INDEX[from]);
    gl.uniform1f(uPatB, PATTERN_INDEX[to]);

    const renderScale = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(2, Math.floor(rect.width * renderScale));
      const h = Math.max(2, Math.floor(rect.height * renderScale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    let raf = 0;
    let running = true;
    const loop = (time: number) => {
      if (!running) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time / 1000);
      gl.uniform1f(uProgress, progressRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(resize, 200);
    };
    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && !document.hidden;
        if (visible && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    obs.observe(canvas);
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      obs.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [from, to]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

/**
 * Case-study hero visual — scroll scrubs a WebGL morph from the
 * project's motif into the next one. The signature moment.
 */
export function CaseHeroVisual({
  motif,
  nextMotif,
  index,
  title,
}: {
  motif: Project["motif"];
  nextMotif: Project["motif"];
  index: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useTransform(scrollYProgress, [0.15, 0.85], [0, 1]);

  return (
    <div
      ref={ref}
      className="gen relative aspect-[16/10] w-full overflow-hidden bg-[#0D0D10] sm:aspect-[21/10]"
      role="img"
      aria-label={`${title} — morphing project visual, scroll to transform`}
    >
      <DisplacementSurface from={motif} to={nextMotif} progress={progress} className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden
        className="font-display pointer-events-none absolute -bottom-6 right-2 select-none text-[7rem] leading-none text-[#F4F2ED]/[0.08] sm:text-[10rem]"
      >
        {index}
      </div>
      <div aria-hidden className="absolute left-[4%] right-[4%] top-[5%] flex justify-between meta text-[11px] tracking-[0.2em] text-[#A7A5A0]">
        <span>FIG. {index}</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF4D00]" />
          SCROLL TO MORPH
        </span>
      </div>
    </div>
  );
}
