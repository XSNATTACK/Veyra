"use client";

import { useEffect, useRef, useState } from "react";
import { HeroCanvas } from "./hero-canvas";

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
// click ripples: xy in aspect-corrected space, z = start time, w = strength
uniform vec4 uHits[6];
// mouse follow: xy in aspect-corrected space, z = strength (fades when pointer leaves)
uniform vec3 uMouse;

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
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.16;

  // click ripples — expanding rings that shove the flow aside + flash hot
  float flash = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 h = uHits[i];
    float age = uTime - h.z;
    if (h.w > 0.0 && age > 0.0 && age < 2.5) {
      float radius = age * 1.1;
      vec2 diff = p - h.xy;
      float d = max(length(diff), 0.0001);
      float ring = exp(-pow((d - radius) * 6.0, 2.0)) * exp(-age * 1.8);
      p += (diff / d) * ring * 0.12 * h.w;
      flash += ring * h.w;
    }
  }

  // mouse follow — gently pulls the flow toward the cursor
  vec2 mDiff = uMouse.xy - p;
  float mDist = length(mDiff);
  float mField = exp(-mDist * mDist * 3.0) * uMouse.z;
  p += mDiff * mField * 0.12;
  float mGlow = exp(-mDist * mDist * 7.0) * uMouse.z;

  // domain-warped flow field — constantly in motion
  vec2 q = vec2(
    fbm(p * 1.4 + vec2(t, -t * 0.7)),
    fbm(p * 1.4 + vec2(5.2 + t * 0.6, 1.3 - t * 0.5))
  );
  vec2 r = vec2(
    fbm(p * 1.4 + 2.6 * q + vec2(1.7 + t * 0.3, 9.2 - t * 0.2)),
    fbm(p * 1.4 + 2.6 * q + vec2(8.3 - t * 0.25, 2.8 + t * 0.35))
  );
  float f = fbm(p * 1.4 + 2.4 * r);

  // drifting contour lines
  float bands = abs(fract(f * 7.0 + t * 1.5) - 0.5) * 2.0;
  float contour = 1.0 - smoothstep(0.0, 0.12, bands);

  // faint drifting grid
  vec2 g = abs(fract(p * 9.0 + vec2(t * 2.0, -t * 1.2)) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.06, min(g.x, g.y));

  // traveling accent sweep — a band of light crossing the field ~every 9s
  float aspect = uRes.x / uRes.y;
  float sweepX = mix(-0.3, aspect + 0.3, fract(t * 0.5));
  float sweepD = uv.x - sweepX;
  float sweep = exp(-sweepD * sweepD * 90.0);

  // LIQUID METAL — heavy mercury current interleaved with the mono field
  // Majestic pass: slower drift, broader bodies, stronger sovereign presence.
  float t2 = uTime * 0.11;
  // broad stretched domain: massive slow bodies instead of wisps
  vec2 sp = vec2(p.x * 0.34 + p.y * 0.24 + t2 * 0.55, p.y * 0.70 - p.x * 0.13 - t2 * 0.38);
  vec2 fq = vec2(
    fbm(sp + vec2(-t2 * 0.9, t2 * 0.6) + 3.1),
    fbm(sp + vec2(7.7 - t2 * 0.5, 4.2 + t2 * 0.8))
  );
  float ff = fbm(sp + 4.5 * fq);

  // molten bodies — thick thresholded masses that merge and split as they flow
  float mass = smoothstep(0.27, 0.64, ff);
  // chrome rim light along the mass boundaries
  float rim = 1.0 - smoothstep(0.0, 0.09, abs(ff - 0.46));
  // surface streaks flowing over the metal
  float fbands = abs(fract(ff * 3.0 - t * 0.6) - 0.5) * 2.0;
  float streak = 1.0 - smoothstep(0.0, 0.32, fbands);
  // blend mask: metal lives where the mono field breathes, never flat
  float blend = smoothstep(0.05, 0.32, f) * (0.5 + 0.6 * contour);
  // soft orange wash beneath the metal for sovereign presence
  float wash = smoothstep(0.52, 0.88, ff);

  vec3 deepOrange = vec3(0.30, 0.06, 0.0);
  vec3 hotOrange = vec3(0.98, 0.33, 0.02);
  vec3 specular = vec3(1.0, 0.93, 0.85);

  // animated grain
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5;

  vec3 base = vec3(0.039, 0.039, 0.043);
  vec3 paper = vec3(0.957, 0.949, 0.929);
  vec3 accent = vec3(1.0, 0.302, 0.0);

  vec3 col = base;
  col += paper * contour * 0.18;
  col += paper * grid * 0.07;
  // molten metal replaces the base inside bodies, rim + streaks on top
  vec3 metal = mix(deepOrange, hotOrange, smoothstep(0.26, 0.76, ff));
  col = mix(col, metal, mass * blend * 0.95);
  col += specular * rim * blend * 1.0;
  col += hotOrange * streak * blend * 0.55;
  col += accent * wash * blend * 0.22;
  col += accent * smoothstep(0.52, 0.88, ff) * blend * 0.34;
  // click flash — hot burst riding the ripple ring
  col += (hotOrange * 0.4 + specular * 0.3) * flash * (0.25 + 0.75 * blend);
  // cursor glow — warm halo trailing the mouse
  col += (hotOrange * 0.25 + specular * 0.15) * mGlow * (0.25 + 0.75 * blend);
  col += (paper * 0.35 + accent * 0.45) * sweep * (0.25 + 0.7 * contour);
  col += vec3(grain) * 0.035;

  float vig = smoothstep(1.25, 0.35, length(p * vec2(0.8, 1.0)));
  col *= mix(0.55, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("shader alloc failed");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
  if (!ok) {
    const log = gl.getShaderInfoLog(sh);
    const label = type === gl.VERTEX_SHADER ? "VERT" : "FRAG";
    console.error(`[HeroShader] ${label} compile failed. infoLog=${JSON.stringify(log)} err=${gl.getError()} len=${src.length}`);
    throw new Error(log || `${label} compile failed`);
  }
  return sh;
}

/**
 * Live WebGL flow-field shader for the hero: warped contour bands,
 * drifting grid, mouse-follow glow, click ripples, animated grain.
 * Recovers from transient GPU context loss via re-init.
 * Falls back to the 2D particle canvas only when WebGL is truly unavailable.
 */
export function HeroShader({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  // Re-run WebGL init after a transient GPU context loss — never give up early.
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fallback) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        antialias: false,
        depth: false,
        stencil: false,
        alpha: false,
        powerPreference: "low-power",
      });
    } catch {
      gl = null;
    }
    if (!gl || gl.isContextLost()) {
      // Transient loss (HMR remount, tab switch, driver reset) — wait for the
      // browser to restore the context; 2D fallback only if it never comes.
      const t = setTimeout(() => setFallback(true), 8000);
      const onR = () => {
        clearTimeout(t);
        setFallback(false);
        setRetry((r) => r + 1);
      };
      canvas.addEventListener("webglcontextrestored", onR, { once: true });
      return () => {
        clearTimeout(t);
        canvas.removeEventListener("webglcontextrestored", onR);
      };
    }

    const ctx = gl;
    let prog: WebGLProgram | null = null;
    try {
      prog = ctx.createProgram();
      if (!prog) throw new Error("program alloc failed");
      ctx.attachShader(prog, compile(ctx, ctx.VERTEX_SHADER, VERT));
      ctx.attachShader(prog, compile(ctx, ctx.FRAGMENT_SHADER, FRAG));
      ctx.linkProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) throw new Error("link failed");
      ctx.useProgram(prog);
    } catch (e) {
      // Compile/link on a lost context is transient — same wait-for-restore.
      if (ctx.isContextLost()) {
        const t = setTimeout(() => setFallback(true), 8000);
        const onR = () => {
          clearTimeout(t);
          setFallback(false);
          setRetry((r) => r + 1);
        };
        canvas.addEventListener("webglcontextrestored", onR, { once: true });
        return () => {
          clearTimeout(t);
          canvas.removeEventListener("webglcontextrestored", onR);
        };
      }
      console.error("[HeroShader] init failed, falling back:", e);
      setFallback(true);
      return;
    }

    // fullscreen triangle strip
    const buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.bufferData(
      ctx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      ctx.STATIC_DRAW,
    );
    const loc = ctx.getAttribLocation(prog, "aPos");
    if (loc >= 0) {
      ctx.enableVertexAttribArray(loc);
      ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
    }

    const uRes = ctx.getUniformLocation(prog, "uRes");
    const uTime = ctx.getUniformLocation(prog, "uTime");
    const uHits = ctx.getUniformLocation(prog, "uHits[0]");
    const uMouse = ctx.getUniformLocation(prog, "uMouse");

    // Studio decision: motion is always on — OS reduced-motion preference ignored.
    const reduced = false;
    const mobile = window.innerWidth < 768;
    const renderScale = (mobile ? 0.6 : 0.85) * Math.min(window.devicePixelRatio || 1, 1.25);

    // click ripple slots: [x, y, startTime, strength] × 6, cycled on pointerdown
    const hits = new Float32Array(24);
    for (let i = 0; i < 6; i++) hits[i * 4 + 2] = -10;
    let hitIdx = 0;

    // mouse follow: smoothed cursor in aspect-corrected space, s fades in/out
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const w = Math.max(2, Math.floor(rect.width * renderScale));
      const h = Math.max(2, Math.floor(rect.height * renderScale));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        ctx!.viewport(0, 0, w, h);
      }
    }

    function frame(time: number) {
      // smoothed trailing so the glow chases the cursor instead of sticking to it
      mouse.x += (mouse.tx - mouse.x) * 0.09;
      mouse.y += (mouse.ty - mouse.y) * 0.09;
      mouse.s += (mouse.ts - mouse.s) * 0.08;
      ctx!.uniform2f(uRes, canvas!.width, canvas!.height);
      ctx!.uniform1f(uTime, time / 1000);
      ctx!.uniform4fv(uHits, hits);
      ctx!.uniform3f(uMouse, mouse.x, mouse.y, mouse.s);
      ctx!.drawArrays(ctx!.TRIANGLE_STRIP, 0, 4);
    }

    resize();

    if (reduced) {
      frame(900); // one composed still, no loop
      return;
    }

    let raf = 0;
    let running = true;
    const loop = (time: number) => {
      if (!running) return;
      frame(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // clicks anywhere on the hero punch a ripple through the mercury
    const section = canvas!.closest("section");
    // shared client-px → shader-space mapping (y up, aspect-corrected)
    const toLocal = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const h = Math.max(1, rect.height);
      return {
        x: (e.clientX - rect.left - rect.width / 2) / h,
        y: (rect.height / 2 - (e.clientY - rect.top)) / h,
      };
    };
    const onDown = (e: PointerEvent) => {
      const pt = toLocal(e);
      hits[hitIdx * 4] = pt.x;
      hits[hitIdx * 4 + 1] = pt.y;
      hits[hitIdx * 4 + 2] = performance.now() / 1000;
      hits[hitIdx * 4 + 3] = 1;
      hitIdx = (hitIdx + 1) % 6;
    };
    const onMove = (e: PointerEvent) => {
      const pt = toLocal(e);
      mouse.tx = pt.x;
      mouse.ty = pt.y;
      mouse.ts = 1;
      // snap on first entry so the glow doesn't sweep in from the origin
      if (mouse.s < 0.01) {
        mouse.x = pt.x;
        mouse.y = pt.y;
      }
    };
    const onLeave = () => {
      mouse.ts = 0;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
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

    const onVis = () => {
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        const r = canvas!.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          running = true;
          raf = requestAnimationFrame(loop);
        }
      }
    };

    // GPU context loss must never silently kill the mercury: preventDefault
    // allows restore, then re-run init. Permanent 2D fallback is last resort.
    const onCtxLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      setRetry((r) => r + 1); // re-run → wait-for-restore path arms fallback timer
    };
    const onCtxRestored = () => {
      setFallback(false);
      setRetry((r) => r + 1);
    };
    canvas.addEventListener("webglcontextlost", onCtxLost);
    canvas.addEventListener("webglcontextrestored", onCtxRestored);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    section?.addEventListener("pointerdown", onDown);
    section?.addEventListener("pointermove", onMove);
    section?.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      obs.disconnect();
      section?.removeEventListener("pointerdown", onDown);
      section?.removeEventListener("pointermove", onMove);
      section?.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onCtxLost);
      canvas.removeEventListener("webglcontextrestored", onCtxRestored);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      // NOTE: do not loseContext here — React 19 StrictMode / HMR remounts
      // the effect on the same canvas, and a lost context makes the
      // re-created compile fail (CONTEXT_LOST), forcing particle fallback.
    };
  }, [fallback, retry]);

  // Always-on recovery: the WebGL canvas stays mounted, so even a late
  // restore (after the give-up timer showed the 2D fallback) flips back.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onR = () => {
      setFallback(false);
      setRetry((r) => r + 1);
    };
    canvas.addEventListener("webglcontextrestored", onR);
    return () => canvas.removeEventListener("webglcontextrestored", onR);
  }, []);

  // The WebGL canvas stays mounted so a restored GPU context can always
  // recover the mercury; the 2D fallback overlays only while WebGL is down.
  return (
    <>
      <canvas ref={canvasRef} className={className} aria-hidden="true" />
      {fallback && <HeroCanvas className={className} />}
    </>
  );
}
