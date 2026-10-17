"use client";

import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  sp: number;
  ph: number;
}

/** Deterministic PRNG so the starfield is stable across remounts. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ACCENT = "255,77,0";

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* Gargantua-style black hole: lensed starfield, keplerian-sheared turbulent
   accretion disk, doppler-beamed approaching limb, secondary lensed arcs,
   event-horizon shadow, photon ring. Units: 1.0 = canvas height. */
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

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
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(2.7, 5.3);
    a *= 0.5;
  }
  return v;
}
float ridge(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    float n = noise(p);
    v += a * abs(n * 2.0 - 1.0);
    p = p * 2.13 + vec2(1.3, 8.1);
    a *= 0.5;
  }
  return v;
}
float starLayer(vec2 p, float scale, float thresh) {
  vec2 g = p * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id);
  if (h < thresh) return 0.0;
  vec2 off = (vec2(hash(id + 11.1), hash(id + 27.7)) - 0.5) * 0.7;
  float d = length(f - off);
  float tw = 0.55 + 0.45 * sin(uTime * (1.0 + h * 4.0) + h * 43.0);
  return smoothstep(0.10, 0.0, d) * tw * (0.35 + 0.65 * fract(h * 7.0));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  p *= 1.7; // wide framing: shadow + full disk sweep in frame
  float t = uTime;

  // tilt the whole hole system ~35 degrees; background stays put.
  // (shadow is circular so only disk/beam/arcs rotate)
  float tiltA = radians(35.0);
  float cA = cos(tiltA);
  float sA = sin(tiltA);
  vec2 q = mat2(cA, -sA, sA, cA) * p;

  // gravitational deflection of the background (lensing)
  float r0 = length(p);
  vec2 bp = p * (1.0 + 0.10 * exp(-r0 * 2.2));

  // full galaxy backdrop: dust nebulae, four star depths, milky-way band
  // with a dark dust lane, and distant fuzzy galaxies
  vec3 col = vec3(0.017, 0.017, 0.024);
  float neb1 = fbm(bp * 1.4 + vec2(0.0, t * 0.005));
  float neb2 = fbm(bp * 0.9 + vec2(4.2, 1.1) - vec2(t * 0.004, 0.0));
  float neb3 = fbm(bp * 2.2 + vec2(8.8, 3.3) + vec2(t * 0.003, 0.0));
  col += vec3(0.063, 0.042, 0.098) * smoothstep(0.42, 0.92, neb1);
  col += vec3(0.112, 0.042, 0.011) * smoothstep(0.50, 0.95, neb2);
  col += vec3(0.028, 0.077, 0.105) * smoothstep(0.48, 0.95, neb3);
  col += vec3(0.85, 0.90, 1.00) * starLayer(bp, 34.0, 0.77) * 0.85;
  col += vec3(1.00, 0.95, 0.88) * starLayer(bp + 3.7, 80.0, 0.84) * 0.60;
  col += vec3(0.70, 0.75, 0.90) * starLayer(bp + 9.1, 150.0, 0.885) * 0.40;
  col += vec3(0.80, 0.85, 1.00) * starLayer(bp + 5.3, 220.0, 0.915) * 0.30;
  // milky-way band with dust lane
  float bandD = dot(bp, normalize(vec2(0.45, 0.89)));
  float band = exp(-bandD * bandD * 5.0);
  float bandTex = fbm(bp * 2.3 + vec2(1.7, 8.4));
  vec3 bandCol = mix(vec3(0.05, 0.07, 0.13), vec3(0.14, 0.09, 0.10), bandTex);
  bandCol *= 1.0 - exp(-bandD * bandD * 22.0) * 0.55;
  col += bandCol * band * (0.35 + 0.65 * bandTex) * 1.4;
  // distant galaxies: fuzzy tilted smudges in rare cells
  vec2 gp = bp * 5.0;
  vec2 gid = floor(gp);
  vec2 gf = fract(gp) - 0.5;
  float gh = hash(gid + 4.2);
  if (gh > 0.955) {
    vec2 go = (vec2(hash(gid + 1.1), hash(gid + 9.3)) - 0.5) * 0.6;
    float ga = gh * 6.2831;
    vec2 gd = mat2(cos(ga), -sin(ga), sin(ga), cos(ga)) * (gf - go);
    vec2 ge = gd * vec2(9.0, 22.0);
    col += vec3(0.75, 0.80, 0.95) * exp(-dot(ge, ge)) * 0.65;
  }

  // disk geometry (nearly edge-on)
  float Rsh = 0.36;
  float TILT = 0.42;
  vec2 dp = vec2(q.x, q.y / TILT);
  float rd = length(dp);
  float ang = atan(dp.y, dp.x);
  float ri = 0.40;
  float ro = 1.05;

  // keplerian shear: inner material laps the outer (fixed-frame angle kept
  // separately so the doppler beam stays pinned to the approaching limb)
  float omega = 1.35 * pow(max(rd, 0.2), -1.5);
  float a = ang - t * 0.30 * omega;

  // filamentary turbulence, stretched tangentially
  float turb = ridge(vec2(a * 2.6, rd * 7.0 - t * 0.06));
  float turb2 = fbm(vec2(a * 5.0 + 3.0, rd * 11.0));
  float fil = smoothstep(0.25, 0.85, turb * 0.65 + turb2 * 0.55);

  // radial profile: hot inner wall, extended falloff
  float innerWall = 1.0 - smoothstep(ri, ri + 0.10, rd);
  float body = smoothstep(ri - 0.03, ri + 0.16, rd) * (1.0 - smoothstep(ro * 0.45, ro, rd));
  float dens = clamp(innerWall * 1.2 + body * (0.30 + 0.85 * fil), 0.0, 1.25);
  // slow rigid density wave riding over the shear — the perceptible "spin",
  // kept subtle so it reads as swirling material, never a separate object
  dens *= 0.88 + 0.12 * sin(3.0 * a - t * 0.9);

  // temperature ramp: ember -> orange -> white-hot lip
  float temp = clamp(1.0 - (rd - ri) / (ro - ri), 0.0, 1.0);
  vec3 ember = vec3(0.42, 0.06, 0.005);
  vec3 mid = vec3(1.00, 0.36, 0.03);
  vec3 lip = vec3(1.00, 0.93, 0.80);
  vec3 dcol = mix(ember, mid, smoothstep(0.0, 0.5, temp));
  dcol = mix(dcol, lip, smoothstep(0.62, 0.95, temp));

  // doppler beaming, pinned to the approaching (left) limb
  float dopF = pow(0.5 + 0.5 * cos(ang - 3.14159), 1.6);
  dcol *= 0.40 + 0.95 * dopF;
  dcol = mix(dcol, vec3(1.0, 0.98, 0.94) * (0.6 + 0.9 * dopF * temp), dopF * temp * 0.55);
  dcol = mix(dcol, vec3(0.55, 0.08, 0.01), (1.0 - dopF) * 0.35 * (1.0 - temp));

  // (no foreign bodies: rotation reads purely from the disk material)

  // vertical scale height: thin bright midplane (kept symmetric — the
  // near-side boost is ramped in later so brightness grades across p.y = 0)
  float thick = exp(-pow(abs(q.y) / (0.055 + 0.16 * rd), 1.6));
  float edge = smoothstep(ri - 0.035, ri + 0.05, rd);

  // halo behind everything
  col += vec3(1.0, 0.32, 0.02) * exp(-pow((rd - 0.55) * 1.6, 2.0)) * 0.10;

  // full disk, both limbs — the shadow occludes the middle next
  float diskA = clamp(dens * thick * edge, 0.0, 1.0);
  col += dcol * diskA;

  // lensed secondary images hugging the shadow
  float rl = length(p);
  float arcTop = exp(-pow((rl - Rsh * 1.28) * 16.0, 2.0)) * smoothstep(-0.1, 0.35, q.y);
  float arcTop2 = exp(-pow((rl - Rsh * 1.55) * 10.0, 2.0)) * smoothstep(0.0, 0.5, q.y);
  float arcBot = exp(-pow((rl - Rsh * 1.30) * 16.0, 2.0)) * smoothstep(0.1, -0.35, q.y);
  col += vec3(1.0, 0.55, 0.15) * arcTop * (0.35 + 0.65 * dopF) * 0.7;
  col += vec3(1.0, 0.40, 0.08) * arcTop2 * 0.35;
  col += vec3(1.0, 0.50, 0.12) * arcBot * 0.25;

  // event-horizon shadow
  float sh = 1.0 - smoothstep(Rsh - 0.012, Rsh + 0.012, rl);
  col *= 1.0 - sh;

  // near-side enhancement + hot lip, ramped in below the midplane so the
  // brightness grades smoothly across p.y = 0 (no step)
  float below = smoothstep(0.0, 0.18, -q.y);
  col += dcol * diskA * below * 0.30;
  col += vec3(1.0, 0.90, 0.75) * exp(-pow((rd - (ri + 0.03)) * 14.0, 2.0)) * smoothstep(0.0, 0.10, -q.y) * (0.6 + 1.0 * dopF);

  // photon ring drawn last so the full crisp circle reads over the disk —
  // thin hot core plus wide halo, beamed like the disk
  float pra = atan(q.y, q.x);
  float pdop = 0.6 + 0.9 * pow(0.5 + 0.5 * cos(pra - 3.14159), 1.5);
  col += vec3(1.0, 0.93, 0.82) * exp(-pow((rl - Rsh * 1.015) * 34.0, 2.0)) * pdop * 1.9;
  col += vec3(1.0, 0.45, 0.10) * exp(-pow((rl - Rsh * 1.12) * 14.0, 2.0)) * pdop * 0.5;

  // filmic soft-clip: powerful highlights roll off instead of hard-clipping
  col = col / (1.0 + 0.15 * col);

  // text-zone fade: single in-shader ramp (layered DOM fades band together).
  // Reaches full brightness right of the copy so the limb never sits under text.
  col *= mix(0.04, 1.0, smoothstep(-0.85, 0.30, p.x));

  // vignette + grain
  col *= mix(0.45, 1.0, smoothstep(1.7, 0.25, length(p * vec2(0.82, 1.0))));
  col += vec3(hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.030;

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
    console.error(`[BlackHole] ${label} compile failed. infoLog=${JSON.stringify(log)}`);
    throw new Error(log || `${label} compile failed`);
  }
  return sh;
}

/**
 * 2D fallback: stylized shadow + disk + starfield for no-WebGL clients.
 * Decorative only (aria-hidden canvas). DPR-capped, pauses offscreen.
 */
function BlackHoleFallback({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mobile = window.innerWidth < 768;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let running = true;
    let hotAngle = 0.6;
    let last = performance.now();

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas!.width = Math.max(1, Math.floor(w * DPR));
      canvas!.height = Math.max(1, Math.floor(h * DPR));
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    }

    function seed() {
      const rand = lcg(1379);
      const count = mobile ? 70 : 130;
      stars = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        r: 0.4 + rand() * 1.1,
        base: 0.25 + rand() * 0.55,
        sp: 0.6 + rand() * 2.2,
        ph: rand() * Math.PI * 2,
      }));
    }

    function diskPaint(x: number, y: number, start: number) {
      if (typeof ctx!.createConicGradient === "function") {
        const g = ctx!.createConicGradient(start, x, y);
        g.addColorStop(0, `rgba(${ACCENT},0.12)`);
        g.addColorStop(0.28, `rgba(${ACCENT},0.55)`);
        g.addColorStop(0.42, "rgba(255,214,170,0.95)");
        g.addColorStop(0.55, `rgba(${ACCENT},0.5)`);
        g.addColorStop(1, `rgba(${ACCENT},0.12)`);
        return g;
      }
      const g = ctx!.createRadialGradient(x, y, 0, x, y, 1);
      g.addColorStop(0, `rgba(${ACCENT},0.5)`);
      g.addColorStop(1, `rgba(${ACCENT},0.1)`);
      return g;
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.52;
      const R = Math.min(w, h) * 0.155;
      const TILT = 0.38;
      const SKEW = -0.1;

      for (const s of stars) {
        const a = s.base + 0.22 * Math.sin(t * s.sp + s.ph);
        ctx!.fillStyle = `rgba(244,242,237,${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, R * 4.2);
      glow.addColorStop(0, `rgba(${ACCENT},0.16)`);
      glow.addColorStop(0.55, `rgba(${ACCENT},0.05)`);
      glow.addColorStop(1, "rgba(255,77,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(cx - R * 4.2, cy - R * 4.2, R * 8.4, R * 8.4);

      const outer = R * 2.35;
      const inner = R * 1.22;

      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(SKEW);
      ctx!.scale(1, TILT);
      ctx!.fillStyle = diskPaint(0, 0, hotAngle + Math.PI);
      ctx!.globalAlpha = 0.85;
      ctx!.beginPath();
      ctx!.arc(0, 0, outer, Math.PI, Math.PI * 2);
      ctx!.arc(0, 0, inner, Math.PI * 2, Math.PI, true);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
      ctx!.globalAlpha = 1;

      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(SKEW);
      ctx!.scale(1, 0.6);
      ctx!.strokeStyle = "rgba(255,220,185,0.5)";
      ctx!.lineWidth = Math.max(1, R * 0.022);
      ctx!.shadowColor = `rgba(${ACCENT},0.8)`;
      ctx!.shadowBlur = R * 0.25;
      ctx!.beginPath();
      ctx!.arc(0, 0, R * 1.45, Math.PI * 1.12, Math.PI * 1.88);
      ctx!.stroke();
      ctx!.restore();

      const shade = ctx!.createRadialGradient(cx, cy, R * 0.55, cx, cy, R * 1.04);
      shade.addColorStop(0, "rgba(0,0,0,1)");
      shade.addColorStop(0.85, "rgba(0,0,0,1)");
      shade.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = shade;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.05, 0, Math.PI * 2);
      ctx!.fill();

      const pulse = 0.75 + 0.25 * Math.sin(t * 1.4);
      ctx!.save();
      ctx!.strokeStyle = `rgba(255,236,214,${(0.65 + 0.3 * pulse).toFixed(3)})`;
      ctx!.lineWidth = Math.max(1.2, R * (0.028 + 0.008 * pulse));
      ctx!.shadowColor = `rgba(${ACCENT},0.9)`;
      ctx!.shadowBlur = R * 0.35;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.07, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(SKEW);
      ctx!.scale(1, TILT);
      ctx!.fillStyle = diskPaint(0, 0, hotAngle);
      ctx!.beginPath();
      ctx!.arc(0, 0, outer, 0, Math.PI);
      ctx!.arc(0, 0, inner, Math.PI, 0, true);
      ctx!.closePath();
      ctx!.fill();
      ctx!.strokeStyle = "rgba(255,224,190,0.85)";
      ctx!.lineWidth = Math.max(1, R * 0.03);
      ctx!.shadowColor = `rgba(${ACCENT},0.9)`;
      ctx!.shadowBlur = R * 0.3;
      ctx!.beginPath();
      ctx!.arc(0, 0, inner * 1.02, 0.12, Math.PI - 0.12);
      ctx!.stroke();
      ctx!.restore();

      const hx = cx + Math.cos(hotAngle) * (inner + outer) * 0.5;
      const hy = cy + Math.sin(hotAngle) * (inner + outer) * 0.5 * TILT;
      const hg = ctx!.createRadialGradient(hx, hy, 0, hx, hy, R * 0.5);
      hg.addColorStop(0, "rgba(255,240,220,0.9)");
      hg.addColorStop(0.4, `rgba(${ACCENT},0.5)`);
      hg.addColorStop(1, `rgba(${ACCENT},0)`);
      ctx!.fillStyle = hg;
      ctx!.beginPath();
      ctx!.arc(hx, hy, R * 0.5, 0, Math.PI * 2);
      ctx!.fill();
    }

    function loop(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      hotAngle += dt * 0.35;
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    }

    resize();
    raf = requestAnimationFrame(loop);

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
          last = performance.now();
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
        const r = canvas.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(loop);
        }
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      obs.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

/**
 * Full-bleed starfield for the whole section (the hole canvas only covers
 * the right side). Sparse dim stars + occasional shooting stars.
 * Decorative only.
 */
interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
}
export function StarsBackdrop({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mobile = window.innerWidth < 768;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let nextMeteor = 2.0;
    let last = performance.now();
    let raf = 0;
    let running = true;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas!.width = Math.max(1, Math.floor(w * DPR));
      canvas!.height = Math.max(1, Math.floor(h * DPR));
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      const rand = lcg(4242);
      const count = mobile ? 80 : 150;
      stars = Array.from({ length: count }, (_, i) => ({
        x: rand() * w,
        y: rand() * h,
        r: i % 18 === 0 ? 1.4 + rand() * 0.9 : 0.4 + rand() * 0.9,
        base: 0.18 + rand() * 0.45,
        sp: 0.5 + rand() * 1.8,
        ph: rand() * Math.PI * 2,
      }));
    }

    function spawnMeteor() {
      if (meteors.length >= 3) return;
      // streak down-left from the upper area
      const a = 0.35 + Math.random() * 0.35;
      const speed = 420 + Math.random() * 380;
      meteors.push({
        x: w * (0.35 + Math.random() * 0.65),
        y: Math.random() * h * 0.4,
        vx: -Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0,
        maxLife: 1.1 + Math.random() * 0.5,
        len: 90 + Math.random() * 70,
      });
      nextMeteor = 2.5 + Math.random() * 4.0;
    }

    function draw(t: number, dt: number) {
      ctx!.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = s.base + 0.18 * Math.sin(t * s.sp + s.ph);
        ctx!.fillStyle = `rgba(235,238,248,${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      nextMeteor -= dt;
      if (nextMeteor <= 0) spawnMeteor();
      meteors = meteors.filter((m) => m.life < m.maxLife);
      for (const m of meteors) {
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const fade = 1 - m.life / m.maxLife;
        const al = Math.min(1, m.life * 8) * fade;
        const dl = Math.hypot(m.vx, m.vy) || 1;
        const tx = m.x - (m.vx / dl) * m.len;
        const ty = m.y - (m.vy / dl) * m.len;
        const g = ctx!.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, `rgba(255,255,255,${al.toFixed(3)})`);
        g.addColorStop(0.25, `rgba(200,215,255,${(al * 0.6).toFixed(3)})`);
        g.addColorStop(1, "rgba(200,215,255,0)");
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.6;
        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tx, ty);
        ctx!.stroke();
        ctx!.fillStyle = `rgba(255,255,255,${al.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(now / 1000, dt);
      raf = requestAnimationFrame(loop);
    }

    resize();
    raf = requestAnimationFrame(loop);

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
        const r = canvas.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          running = true;
          raf = requestAnimationFrame(loop);
        }
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      obs.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

/**
 * Black hole backdrop: WebGL Gargantua-style render with 2D fallback.
 * Decorative only (aria-hidden canvas). DPR-capped, pauses offscreen.
 * Studio decision: motion is always on — OS reduced-motion preference ignored.
 */
export function BlackHole({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
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
      console.error("[BlackHole] init failed, falling back:", e);
      setFallback(true);
      return;
    }

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

    const mobile = window.innerWidth < 768;
    const renderScale = (mobile ? 0.55 : 0.75) * Math.min(window.devicePixelRatio || 1, 1.5);

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
      ctx!.uniform2f(uRes, canvas!.width, canvas!.height);
      ctx!.uniform1f(uTime, time / 1000);
      ctx!.drawArrays(ctx!.TRIANGLE_STRIP, 0, 4);
    }

    resize();

    let raf = 0;
    let running = true;
    const loop = (time: number) => {
      if (!running) return;
      frame(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onCtxLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      setRetry((r) => r + 1);
    };
    const onCtxRestored = () => {
      setFallback(false);
      setRetry((r) => r + 1);
    };
    canvas.addEventListener("webglcontextlost", onCtxLost);
    canvas.addEventListener("webglcontextrestored", onCtxRestored);

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

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      obs.disconnect();
      canvas.removeEventListener("webglcontextlost", onCtxLost);
      canvas.removeEventListener("webglcontextrestored", onCtxRestored);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      // NOTE: never loseContext here — it kills the shared canvas context
      // across StrictMode/HMR remounts and forces permanent fallback.
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

  return (
    <>
      <canvas ref={canvasRef} className={className} aria-hidden="true" />
      {fallback && <BlackHoleFallback className={className} />}
    </>
  );
}
