"use client";

import { useEffect, useRef } from "react";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  accent: boolean;
}

/**
 * Heavy technical particle field: drifting nodes + connective lines,
 * mouse-repel physics, accent nodes. DPR-capped, pauses offscreen,
 * Always animated (studio decision: reduced-motion preference ignored).
 */
export function HeroCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Studio decision: motion is always on — OS reduced-motion preference ignored.
    const reduced = false;
    const mobile = window.innerWidth < 768;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let parts: P[] = [];
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };

    const LINK = mobile ? 100 : 130;
    const COUNT = mobile ? 34 : 85;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.max(1, Math.floor(w * DPR));
      canvas!.height = Math.max(1, Math.floor(h * DPR));
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function seed() {
      parts = Array.from({ length: COUNT }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        accent: i % 12 === 0,
      }));
    }

    function step() {
      for (const p of parts) {
        // gentle mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 150 && d > 1) {
          const f = ((150 - d) / 150) * 0.6;
          p.vx += (dx / d) * f * 0.12;
          p.vy += (dy / d) * f * 0.12;
        }
        // damping back to drift speed
        p.vx *= 0.985;
        p.vy *= 0.985;
        if (Math.abs(p.vx) < 0.2) p.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(p.vy) < 0.2) p.vy += (Math.random() - 0.5) * 0.05;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      // links
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i];
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.28;
            ctx!.strokeStyle =
              a.accent || b.accent
                ? `rgba(255,77,0,${(alpha + 0.08).toFixed(3)})`
                : `rgba(244,242,237,${alpha.toFixed(3)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // nodes
      for (const p of parts) {
        if (p.accent) {
          ctx!.fillStyle = "rgba(255,77,0,0.9)";
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.strokeStyle = "rgba(255,77,0,0.35)";
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
          ctx!.stroke();
        } else {
          ctx!.fillStyle = "rgba(244,242,237,0.55)";
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function loop() {
      if (!running) return;
      step();
      draw();
      raf = requestAnimationFrame(loop);
    }

    resize();
    seed();

    if (reduced) {
      draw();
      return;
    }

    loop();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        seed();
      }, 200);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && !document.hidden;
        if (visible && !running) {
          running = true;
          loop();
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
          loop();
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      obs.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
