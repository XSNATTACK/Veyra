"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/content/projects";

const PAPER = "244,242,237";
const ACCENT = "255,77,0";

type Ctx = CanvasRenderingContext2D;

/** Shared canvas harness: DPR-capped, pauses offscreen, cleans up. */
function useCanvas(draw: (ctx: Ctx, w: number, h: number, t: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    const t0 = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.max(1, Math.floor(w * DPR));
      canvas.height = Math.max(1, Math.floor(h * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const loop = (now: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, (now - t0) / 1000);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

function faintGrid(ctx: Ctx, w: number, h: number, step = 56) {
  ctx.strokeStyle = `rgba(${PAPER},0.07)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step / 2; x < w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = step / 2; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

/* ------------------------------- GRID: topo ------------------------------ */
/** Drifting topographic contour lines — structure you can feel. */
function GridCanvas() {
  const ref = useCanvas((ctx, w, h, t) => {
    faintGrid(ctx, w, h);
    const LINES = 9;
    for (let k = 0; k < LINES; k++) {
      const baseY = (h / (LINES + 1)) * (k + 1);
      const accent = k === 4;
      ctx.strokeStyle = accent ? `rgba(${ACCENT},0.9)` : `rgba(${PAPER},${0.10 + 0.05 * Math.sin(k * 1.7)})`;
      ctx.lineWidth = accent ? 1.6 : 1;
      if (accent) {
        ctx.shadowColor = `rgba(${ACCENT},0.8)`;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      for (let x = -10; x <= w + 10; x += 6) {
        const y =
          baseY +
          Math.sin(x * 0.012 + t * 0.7 + k * 1.3) * (10 + k * 2.2) +
          Math.sin(x * 0.03 - t * 0.45 + k * 0.6) * 6;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // survey markers riding the accent line
    const ay =
      (h / (LINES + 1)) * 5 +
      Math.sin(w * 0.62 * 0.012 + t * 0.7 + 4 * 1.3) * 18 +
      Math.sin(w * 0.62 * 0.03 - t * 0.45 + 4 * 0.6) * 6;
    ctx.fillStyle = `rgba(${ACCENT},1)`;
    ctx.beginPath();
    ctx.arc(w * 0.62, ay, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${ACCENT},0.5)`;
    ctx.beginPath();
    ctx.arc(w * 0.62, ay, 9 + 2 * Math.sin(t * 2), 0, Math.PI * 2);
    ctx.stroke();
  });
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ------------------------------ LEDGER: live ----------------------------- */
/** Ticking operational rows — the app is running, not pictured. */
const LEDGER_ROWS = ["QUEUE", "ACTIVE", "SYNC", "ARCHIVE"];
function LedgerCanvas() {
  const ref = useCanvas((ctx, w, h, t) => {
    faintGrid(ctx, w, h);
    const pad = Math.max(24, w * 0.07);
    const rowH = Math.min(64, (h - pad * 2) / LEDGER_ROWS.length);
    ctx.textBaseline = "middle";
    LEDGER_ROWS.forEach((label, r) => {
      const y = pad + rowH * r + rowH / 2;
      const v = 0.5 + 0.28 * Math.sin(t * 0.9 + r * 1.8) + 0.12 * Math.sin(t * 2.3 + r * 0.7);
      const active = r === 1;
      // label
      ctx.fillStyle = active ? `rgba(${ACCENT},1)` : `rgba(${PAPER},0.45)`;
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.fillText(`0${r + 1}  ${label}`, pad, y - 12);
      // track
      const tx = pad + 110;
      const tw = w - pad - tx - 90;
      ctx.fillStyle = `rgba(${PAPER},0.08)`;
      ctx.fillRect(tx, y - 5, Math.max(0, tw), 10);
      // fill
      const fw = Math.max(0, tw * Math.min(1, Math.max(0.08, v)));
      if (active) {
        const g = ctx.createLinearGradient(tx, 0, tx + fw, 0);
        g.addColorStop(0, `rgba(${ACCENT},0.55)`);
        g.addColorStop(1, `rgba(${ACCENT},0.95)`);
        ctx.fillStyle = g;
        ctx.shadowColor = `rgba(${ACCENT},0.7)`;
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = `rgba(${PAPER},0.22)`;
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(tx, y - 5, fw, 10);
      ctx.shadowBlur = 0;
      // value
      ctx.fillStyle = active ? `rgba(${ACCENT},1)` : `rgba(${PAPER},0.4)`;
      ctx.font = "600 11px ui-monospace, monospace";
      ctx.fillText(`${Math.round(v * 100)}%`, w - pad - 44, y);
      // status dot
      ctx.fillStyle = active && Math.sin(t * 4) > -0.2 ? `rgba(${ACCENT},1)` : `rgba(${PAPER},0.25)`;
      ctx.beginPath();
      ctx.arc(w - pad - 8, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ------------------------------ FIELD: drift ----------------------------- */
/** Floating cards with depth + pointer parallax — product in space. */
function FieldCanvas() {
  const mouse = useRef({ x: 0, y: 0 });
  const ref = useCanvas((ctx, w, h, t) => {
    faintGrid(ctx, w, h);
    const { x: mx, y: my } = mouse.current;
    const cards = 6;
    for (let i = 0; i < cards; i++) {
      const depth = 0.35 + (i / cards) * 0.65;
      const cw = (w * 0.16 + 40) * (0.7 + depth * 0.5);
      const ch = cw * 0.72;
      const cx =
        w * (0.14 + (i % 3) * 0.3) +
        Math.sin(t * (0.3 + depth * 0.25) + i * 2.1) * 14 -
        mx * 26 * depth;
      const cy =
        h * (i < 3 ? 0.3 : 0.62) +
        Math.cos(t * (0.25 + depth * 0.3) + i * 1.4) * 12 -
        my * 18 * depth;
      const accent = i === 1;
      ctx.save();
      ctx.globalAlpha = 0.35 + depth * 0.6;
      ctx.fillStyle = accent ? `rgba(${ACCENT},0.10)` : `rgba(${PAPER},0.035)`;
      ctx.strokeStyle = accent ? `rgba(${ACCENT},0.85)` : `rgba(${PAPER},0.22)`;
      ctx.lineWidth = accent ? 1.5 : 1;
      if (accent) {
        ctx.shadowColor = `rgba(${ACCENT},0.6)`;
        ctx.shadowBlur = 18;
      }
      const r = 8;
      ctx.beginPath();
      ctx.roundRect(cx - cw / 2, cy - ch / 2, cw, ch, r);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // card inner lines
      ctx.strokeStyle = accent ? `rgba(${ACCENT},0.5)` : `rgba(${PAPER},0.14)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let L = 0; L < 3; L++) {
        const ly = cy - ch / 2 + 14 + L * 10;
        ctx.moveTo(cx - cw / 2 + 10, ly);
        ctx.lineTo(cx - cw / 2 + 10 + cw * (0.7 - L * 0.14), ly);
      }
      ctx.stroke();
    }
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ----------------------------- SIGNAL: pulse ----------------------------- */
/** Waveform with a traveling pulse — assistance in motion. */
function SignalCanvas() {
  const ref = useCanvas((ctx, w, h, t) => {
    faintGrid(ctx, w, h);
    const midY = h * 0.52;
    const wave = (x: number, tt: number) =>
      midY +
      Math.sin(x * 0.014 + tt * 1.6) * h * 0.16 +
      Math.sin(x * 0.036 - tt * 1.1) * h * 0.06;
    // trail
    const px = ((t * 0.22) % 1.3) * w - w * 0.15;
    // echo path
    ctx.strokeStyle = `rgba(${PAPER},0.16)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const y = wave(x, t - 0.5);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // main path
    ctx.strokeStyle = `rgba(${PAPER},0.55)`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = wave(x, t);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // glowing trail behind pulse
    const trail: [number, number][] = [];
    for (let i = 0; i < 26; i++) {
      const tx = px - i * 5;
      if (tx < 0) break;
      trail.push([tx, wave(tx, t - i * 0.012)]);
    }
    if (trail.length > 1) {
      ctx.strokeStyle = `rgba(${ACCENT},0.85)`;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = `rgba(${ACCENT},0.9)`;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      trail.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // pulse head
    if (px > 0 && px < w) {
      const py = wave(px, t);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(px, py, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${ACCENT},0.6)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(px, py, 9 + 3 * Math.sin(t * 5), 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* --------------------------------- frame --------------------------------- */

const CAPTIONS: Record<Project["motif"], string> = {
  grid: "SEC.01 — STRUCTURE / LIVE",
  ledger: "OPS — LIVE STATE",
  field: "CORE LOOP — LIVE",
  signal: "ASSIST — LIVE",
};

/**
 * Generative visual system 2.0 — living canvas compositions per motif.
 * Abstract, but animated, lit, and captioned like product stills.
 */
export function GenerativeVisual({
  motif,
  index,
  title,
}: {
  motif: Project["motif"];
  index: string;
  title: string;
}) {
  return (
    <div
      className="gen relative aspect-[16/10] w-full overflow-hidden bg-[#0D0D10] sm:aspect-[21/10]"
      role="img"
      aria-label={`${title} — animated project visual`}
    >
      {/* base glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 30% 20%, rgba(255,77,0,0.07), transparent 70%), radial-gradient(ellipse 60% 55% at 80% 90%, rgba(244,242,237,0.05), transparent 70%)",
        }}
      />
      {motif === "grid" && <GridCanvas />}
      {motif === "ledger" && <LedgerCanvas />}
      {motif === "field" && <FieldCanvas />}
      {motif === "signal" && <SignalCanvas />}
      {/* oversized index */}
      <div
        aria-hidden
        className="font-display pointer-events-none absolute -bottom-6 right-2 select-none text-[7rem] leading-none text-[#F4F2ED]/[0.08] sm:text-[10rem]"
      >
        {index}
      </div>
      {/* top meta row */}
      <div aria-hidden className="absolute left-[4%] right-[4%] top-[5%] flex justify-between meta text-[11px] tracking-[0.2em] text-[#A7A5A0]">
        <span>FIG. {index}</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF4D00]" />
          {CAPTIONS[motif]}
        </span>
      </div>
    </div>
  );
}
