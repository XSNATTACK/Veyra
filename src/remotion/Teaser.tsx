import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";

const { fontFamily: display } = loadBricolage("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});
const { fontFamily: serif } = loadInstrumentSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
});

/** Brand tokens — sampled from the live site. */
const INK = "#0A0A0B";
const PAPER = "#F4F2ED";
const ACCENT = "#FF4D00";
const ACCENT_SOFT = "#FF8A3D";

/** Act boundaries on the 1080-frame (36s @30fps) timeline. */
const A1 = [0, 180] as const;
const A2 = [180, 390] as const;
const A3 = [390, 660] as const;
const A4 = [660, 870] as const;
const A5 = [870, 1080] as const;

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

const clamp = () => ({
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
});

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

/**
 * A single translucent orange glass panel — the film's core material.
 * Every act composes these; pricing of blur/shadow keeps the CPU render sane.
 */
function GlassPanel({
  w,
  h,
  opacity = 1,
  glow = 1,
  blur = 0,
  style,
  chrome = true,
}: {
  w: number;
  h: number;
  opacity?: number;
  glow?: number;
  blur?: number;
  style?: React.CSSProperties;
  chrome?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        borderRadius: Math.min(14, h * 0.1),
        background:
          "linear-gradient(112deg, rgba(255,77,0,0.34) 0%, rgba(255,31,0,0.07) 46%, rgba(255,138,61,0.26) 100%)",
        border: "1px solid rgba(255,124,52,0.34)",
        boxShadow: `0 0 ${(18 * glow).toFixed(0)}px rgba(255,77,0,${(0.12 * glow).toFixed(2)}), 0 22px 38px rgba(0,0,0,0.55)`,
        overflow: "hidden",
        ...style,
      }}
    >
      {chrome && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(172deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.02) 28%, transparent 44%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
              opacity: 0.7 * glow,
            }}
          />
        </>
      )}
    </div>
  );
}

/** A thin glowing orange light line — the film's ignition motif. */
function LightLine({
  w,
  h = 2,
  opacity = 1,
  glow = 1,
  x,
  y,
  rotate,
}: {
  w: number;
  h?: number;
  opacity?: number;
  glow?: number;
  x: number;
  y: number;
  rotate?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        background: `linear-gradient(90deg, transparent, ${ACCENT} 18%, #FFB27A 50%, ${ACCENT} 82%, transparent)`,
        borderRadius: h,
        boxShadow: `0 0 ${14 * glow}px ${ACCENT}, 0 0 ${38 * glow}px rgba(255,77,0,${0.45 * glow})`,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    />
  );
}

/**
 * The 3D "stage" — a perspective world every act animates inside.
 * Camera pushes register as scale/rotation on this group.
 */
function Stage({
  rotateY = 0,
  rotateX = 0,
  scale = 1,
  translateX = 0,
  translateY = 0,
  children,
}: {
  rotateY?: number;
  rotateX?: number;
  scale?: number;
  translateX?: number;
  translateY?: number;
  children?: React.ReactNode;
}) {
  return (
    <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: "50% 42%" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `translate(${translateX}px, ${translateY}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
        }}
      >
        {children}
      </div>
      {/* obsidian floor sheen */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 340,
          background:
            "linear-gradient(0deg, rgba(255,77,0,0.05), rgba(10,10,11,0) 60%)",
        }}
      />
    </AbsoluteFill>
  );
}

/** Restrained uppercase kicker — every act's typographic accent. */
function Kicker({
  children,
  y = 50,
  t,
  enter = 9,
  exit,
  size = 28,
  trackingTo = 0.46,
}: {
  children: React.ReactNode;
  y?: number;
  t: number;
  enter?: number;
  exit?: number;
  size?: number;
  trackingTo?: number;
}) {
  if (t < 0 || (exit !== undefined && t > exit + 10)) return null;
  const o = interpolate(
    t,
    [0, enter, Math.max(enter, (exit ?? 1e9) - 12), exit ?? 1e9],
    [0, 0.78, 0.78, 0],
    clamp(),
  );
  if (o <= 0.001) return null;
  // quick rise-and-settle: the line lands in ~3 frames, not ~18
  const rise = spring({ frame: t, fps: 30, config: { damping: 14, stiffness: 190 } });
  const tracking = interpolate(t, [0, enter * 1.6], [trackingTo * 0.62, trackingTo], {
    easing: easeOut,
    ...clamp(),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${y}%`,
        textAlign: "center",
        fontFamily: display,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: `${tracking}em`,
        textTransform: "uppercase",
        color: "rgba(244,242,237,0.8)",
        opacity: o,
        transform: `translateY(${(1 - rise) * 10}px)`,
      }}
    >
      {children}
    </div>
  );
}

/** Small authored browser chrome — mirrors the site's BrowserFrame language. */
function BrowserChrome({ url }: { url: string }) {
  return (
    <div
      style={{
        height: 48,
        background: "#101013",
        borderBottom: "1px solid rgba(244,242,237,0.10)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 18px",
      }}
    >
      <span style={{ display: "flex", gap: 6 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span
            key={c}
            style={{ width: 10, height: 10, borderRadius: 99, background: c, opacity: 0.9 }}
          />
        ))}
      </span>
      <span
        style={{
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(244,242,237,0.07)",
          borderRadius: 999,
          padding: "4px 16px",
          minWidth: 280,
          justifyContent: "center",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 99, background: ACCENT }} />
        <span
          style={{
            fontFamily: display,
            fontSize: 15,
            color: "rgba(244,242,237,0.62)",
            letterSpacing: "0.04em",
          }}
        >
          {url}
        </span>
      </span>
      <span style={{ width: 30, textAlign: "center", color: "rgba(244,242,237,0.3)" }}>···</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT I — The question (frames 0–179)                                */
/* ------------------------------------------------------------------ */

function ActOne() {
  const frame = useCurrentFrame();
  const ignite = frame - 21;
  // two-beat camera: a visible push right at ignition, then a calm ambient drift
  const camera = interpolate(frame, [21, 52, 179], [1, 1.045, 1.075], {
    easing: easeOut,
    ...clamp(),
  });
  // the ignition line cracks on in 10 frames, not 34
  const lineW = interpolate(ignite, [0, 10, 34], [0, 300, 340], {
    easing: easeOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineO = interpolate(ignite, [0, 8, 150], [0, 0.85, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // fragments of the unidentified sculpture — spring-landed, not faded in
  const frag1 = spring({ frame: frame - 70, fps: 30, config: { damping: 11, stiffness: 165 } });
  const frag2 = spring({ frame: frame - 92, fps: 30, config: { damping: 11, stiffness: 175 } });
  const drift = (scale: number, phase: number) =>
    Math.sin((frame / 20) * scale + phase) * 3.5;

  return (
    <Stage scale={camera} rotateY={interpolate(frame, [21, 179], [-2, 1], { easing: easeOut, ...clamp() })}>
      <LightLine
        x={960 - lineW / 2}
        y={486}
        w={lineW}
        h={3}
        opacity={lineO}
        glow={0.8 + Math.sin(frame / 6) * 0.08}
      />
      {/* a sharp glass edge, nearly invisible */}
      <GlassPanel
        w={430}
        h={210}
        opacity={frag1 * 0.7}
        glow={0.5}
        blur={1.2}
        style={{
          left: 1050 + drift(0.4, 0),
          top: 366 + drift(0.3, 1),
          transform: "rotateY(-16deg) rotateZ(-7deg)",
        }}
      />
      {/* a curved translucent surface */}
      <GlassPanel
        w={560}
        h={150}
        opacity={frag2 * 0.55}
        glow={0.35}
        blur={2.4}
        style={{
          left: 320 + drift(0.35, 2),
          top: 610 + drift(0.3, 3),
          transform: "rotateY(14deg) rotateZ(4deg)",
          borderRadius: 120,
        }}
      />
      <Kicker t={frame - 135} y={29} trackingTo={0.5} exit={41}>
        But does the world see it?
      </Kicker>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT II — The philosophy (frames 180–389)                           */
/* ------------------------------------------------------------------ */

function ActTwo() {
  const frame = useCurrentFrame();
  const t = frame - A2[0];
  const n = 5;
  // centered stack: panes 780–980 wide, 106 tall, 146px apart
  const paneW = (i: number) => 780 + i * 50;
  const paneTop = 201; // first row

  const panes = Array.from({ length: n }, (_, i) => {
    // each pane rises into the stack with a tight snap and slight overshoot
    const rise = spring({
      frame: Math.max(0, t - 10 - i * 3),
      fps: 30,
      config: { damping: 9, stiffness: 185 },
    });
    const y = interpolate(rise, [0, 1], [-320, 0]);
    const rot = interpolate(rise, [0, 1], [-14 + i * 2.2, -2.5 + i * 1.1]);
    const o = interpolate(t, [3 + i * 4, 12 + i * 4], [0, 1], clamp());
    return { i, y, rot, o };
  });

  // two-beat orbit: settles into position fast, then breathes slowly
  const orbit = interpolate(t, [24, 62, 195], [-2, 4.5, 8.5], {
    easing: easeOut,
    ...clamp(),
  });
  const cam = interpolate(t, [0, 30, 200], [0.985, 1.035, 1.13], {
    easing: easeOut,
    ...clamp(),
  });

  // seam ignition pulses (sync with glass-tap cues at f204/228/252) — crack harder
  const seamPulse = (at: number) => {
    const s = interpolate(t, [at - 9, at, at + 10], [0.3, 1, 0.4], clamp());
    return s as number;
  };
  const seam1 = seamPulse(24);
  const seam2 = seamPulse(48);
  const seam3 = seamPulse(72);

  return (
    <Stage scale={cam} rotateY={orbit}>
      {panes.map(({ i, y, rot, o }) => (
        <GlassPanel
          key={i}
          w={paneW(i)}
          h={106}
          opacity={o * (i === 2 ? 1 : 0.85)}
          glow={0.62}
          style={{
            left: 960 - paneW(i) / 2,
            top: paneTop + i * 146 + y,
            transform: `rotateY(${rot}deg) translateZ(${i * 22}px)`,
          }}
        />
      ))}
      {/* seams cleanly sit on the bottom edge of each of the first three panes */}
      <LightLine x={530} y={paneTop + 106} w={860} h={2} opacity={seam1 * 0.9} glow={seam1} />
      <LightLine x={510} y={paneTop + 106 + 146} w={900} h={2} opacity={seam2 * 0.85} glow={seam2} />
      <LightLine x={470} y={paneTop + 106 + 292} w={980} h={2} opacity={seam3 * 0.8} glow={seam3} />
      {/* floor reflection of the monolith */}
      <GlassPanel
        w={560}
        h={84}
        opacity={interpolate(t, [40, 72], [0, 0.22], clamp())}
        glow={0.3}
        blur={3}
        style={{ left: 680, top: 950, transform: "scaleY(-1) rotateX(12deg)" }}
      />
      <Kicker t={t - 88} y={11} trackingTo={0.44} exit={192}>
        Design with {""}
        <span style={{ fontFamily: serif, fontStyle: "italic", color: ACCENT, textTransform: "none" }}>
          intent.
        </span>
      </Kicker>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT III — What VEYRA creates (frames 390–659)                      */
/* ------------------------------------------------------------------ */

interface Sheet {
  img: string;
  url: string;
  label: string;
  inAt: number; // local act frame
  width: number;
  fromX: number; // slide-in offset (alternated per sheet for asymmetric cuts)
  rotIn: number; // entrance rotation
  rotRest: number;
  panFrom: number; // inner parallax in px (real, visible travel)
  panTo: number;
  side: "left" | "right"; // fixed label alignment — never jumps as sheets hand off
  exitX: number; // where this sheet swings out when its successor arrives
}

const SHEETS: Sheet[] = [
  { img: "work/Baanthong.png", url: "baanthong.netlify.app", label: "Websites.", inAt: 26, width: 1010, fromX: 0, rotIn: -4.5, rotRest: -1.2, panFrom: 10, panTo: -26, side: "left", exitX: 560 },
  { img: "work/Sinergipest.png", url: "sinergipest.netlify.app", label: "Applications.", inAt: 92, width: 1060, fromX: -430, rotIn: 6, rotRest: -2, panFrom: -8, panTo: 30, side: "right", exitX: -580 },
  { img: "work/BDACapital.png", url: "bdacapital.vercel.app", label: "Digital products.", inAt: 158, width: 1100, fromX: 340, rotIn: -6, rotRest: 1.6, panFrom: 14, panTo: -30, side: "left", exitX: 0 },
];

function ActThree() {
  const frame = useCurrentFrame();
  const t = frame - A3[0];

  const visible = SHEETS.filter((s) => t >= s.inAt);

  return (
    <Stage
      scale={interpolate(t, [0, 30, 268], [1, 1.028, 1.06], { easing: easeOut, ...clamp() })}
      rotateY={interpolate(t, [0, 30, 268], [-2, 1.1, 2.2], { easing: easeOut, ...clamp() })}
    >
      {visible.map((s) => {
        const local = t - s.inAt;
        if (local < -1) return null;
        // exit-cancel: the moment the next sheet arrives, this one swings out
        const next = SHEETS[SHEETS.indexOf(s) + 1];
        const localOut = next ? t - next.inAt : -1;
        // fast handoff: outgoing sheet wipes out in 9 frames as its
        // successor arrives — reads as a relay swipe, never a stack
        const oExit = interpolate(localOut, [0, 9], [1, 0], clamp());
        const exitX =
          localOut > 0 ? interpolate(localOut, [0, 14], [0, s.exitX], { easing: easeOut, ...clamp() }) : 0;
        const enter = spring({ frame: local, fps: 30, config: { damping: 15, stiffness: 210 } });
        const x = interpolate(enter, [0, 1], [s.fromX, 0]) + exitX;
        const o = interpolate(local, [0, 5, 78, 90], [0, 1, 1, 0.92], clamp());
        if (o * oExit <= 0.002) return null;
        const y = interpolate(local, [0, 12], [46, 0], { easing: easeOut, ...clamp() });
        const rot = interpolate(enter, [0, 1], [s.rotIn, s.rotRest]);
        // zoom-punch on entry: the sheet lands slightly large and settles tight
        const punch = interpolate(enter, [0, 1], [1.07, 1]);
        // real parallax travel so the interface visibly scrolls while held
        const pan = interpolate(local, [0, 60], [s.panFrom, s.panTo], clamp());
        const labelShift = interpolate(local, [4, 14], [10, 0], clamp());
        return (
          <div
            key={s.img}
            style={{
              position: "absolute",
              left: 960 - s.width / 2 + x,
              top: 170 + y,
              width: s.width,
              opacity: o,
              transformStyle: "preserve-3d",
              transform: `rotateY(${rot}deg) scale(${punch})`,
            }}
          >
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(244,242,237,0.14)",
                background: "#0D0D10",
                boxShadow: "0 36px 74px rgba(0,0,0,0.65), 0 0 54px rgba(255,77,0,0.1)",
              }}
            >
              <BrowserChrome url={s.url} />
              <div style={{ position: "relative", height: s.width * (768 / 1366), overflow: "hidden" }}>
                {/* exact-height img scaled 1.06 from a top origin: the site's nav
                    stays fully visible while the bottom crops for parallax */}
                <Img
                  src={staticFile(s.img)}
                  style={{
                    position: "absolute",
                    width: s.width,
                    height: s.width * (768 / 1366),
                    top: 0,
                    transformOrigin: "50% 0%",
                    transform: `scale(1.06) translateY(${pan}px)`,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                ...(s.side === "right" ? { right: 26 } : { left: 26 }),
                bottom: -64,
                fontFamily: display,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: `${interpolate(local, [4, 14], [0.44, 0.3], clamp())}em`,
                textTransform: "uppercase",
                color: "rgba(244,242,237,0.85)",
                opacity: interpolate(local, [4, 12], [0, 1], clamp()),
                transform: `translateY(${labelShift}px)`,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/*  ACT IV — The craft (frames 660–869)                                */
/* ------------------------------------------------------------------ */

type Slot = { x: number; y: number; w: number; h: number };

const NAV_DESK: Slot = { x: 90, y: 76, w: 900, h: 44 };
const HERO_DESK: Slot = { x: 90, y: 140, w: 520, h: 240 };
const MEDIA_DESK: Slot = { x: 640, y: 140, w: 350, h: 240 };
const CARDS_DESK: Slot[] = [
  { x: 90, y: 410, w: 286, h: 190 },
  { x: 397, y: 410, w: 286, h: 190 },
  { x: 704, y: 410, w: 286, h: 190 },
];
const CTA_DESK: Slot = { x: 90, y: 640, w: 240, h: 56 };

const NAV_MOB: Slot = { x: 20, y: 60, w: 360, h: 40 };
const HERO_MOB: Slot = { x: 20, y: 118, w: 360, h: 210 };
const CHILD_MOB: Slot = { x: 20, y: 100, w: 360, h: 16 };
const CARDS_MOB: Slot[] = [
  { x: 20, y: 350, w: 360, h: 150 },
  { x: 20, y: 514, w: 360, h: 150 },
  { x: 20, y: 678, w: 360, h: 150 },
];
const CTA_MOB: Slot = { x: 20, y: 852, w: 200, h: 52 };

const FOOTER_DESK: Slot = { x: 90, y: 740, w: 890, h: 48 };
const FOOTER_MOB: Slot = { x: 20, y: 912, w: 360, h: 48 };

/** Interpolates a desktop slot into a mobile slot at progress p. */
const slot = (d: Slot, m: Slot, p: number) => ({
  left: interpolate(p, [0, 1], [d.x, m.x]),
  top: interpolate(p, [0, 1], [d.y, m.y]),
  width: interpolate(p, [0, 1], [d.w, m.w]),
  height: interpolate(p, [0, 1], [d.h, m.h]),
});

function ActFour() {
  const frame = useCurrentFrame();
  const t = frame - A4[0];
  const refold = spring({ frame: t - 96, fps: 30, config: { damping: 13, stiffness: 160 } });
  const p = Math.min(1, Math.max(0, refold)) as number;
  const glow = interpolate(t, [150, 200], [0.4, 1.15], { easing: easeInOut, ...clamp() });
  const blockO = (at: number) => interpolate(t, [at, at + 7], [0, 1], clamp());

  const lineStyle = (
    s: { left: number; top: number; width: number; height: number },
    o: number,
    withGlow: boolean,
  ) => ({
    position: "absolute" as const,
    ...s,
    borderRadius: 8,
    background: withGlow
      ? "linear-gradient(100deg, rgba(244,242,237,0.16), rgba(244,242,237,0.06))"
      : "linear-gradient(100deg, rgba(255,138,61,0.28), rgba(255,77,0,0.10))",
    boxShadow: withGlow ? undefined : `0 0 ${26 * glow}px rgba(255,77,0,${0.2 * glow})`,
    opacity: o,
  });

  const card = (i: number, o: number) => {
    const sD = CARDS_DESK[i];
    const sM = CARDS_MOB[i];
    return (
      <div
        key={`card${i}`}
        style={{
          ...lineStyle(slot(sD, sM, p), o, false),
          borderRadius: 10,
          border: "1px solid rgba(255,138,61,0.32)",
        }}
      />
    );
  };

  return (
    <Stage scale={interpolate(t, [0, 30, 200], [1.06, 1.09, 1.16], { easing: easeOut, ...clamp() })}>
      {/* container drifts from desktop-center to mobile-center as the layout refolds */}
      <div
        style={{
          position: "absolute",
          left: interpolate(p, [0, 1], [375, 775], clamp()),
          top: 96,
          width: 1080,
        }}
      >
        {/* browser-ish shell of the assembling layout */}
        <div
          style={{
            position: "absolute",
            ...slot({ x: 70, y: 56, w: 1060, h: 760 }, { x: 0, y: 44, w: 400, h: 920 }, p),
            borderRadius: interpolate(p, [0, 1], [18, 22]),
            border: "1px solid rgba(244,242,237,0.13)",
            background:
              "linear-gradient(160deg, rgba(18,18,21,0.9), rgba(13,13,16,0.86))",
            boxShadow: `0 36px 72px rgba(0,0,0,0.6), 0 0 ${60 * glow}px rgba(255,77,0,0.12)`,
            opacity: blockO(0),
          }}
        />
        {/* nav: brand dot + items (collapses toward hamburger bars on mobile) */}
        <div style={lineStyle(slot(NAV_DESK, NAV_MOB, p), blockO(6), false)} />
        {[0, 1, 2].map((i) => (
          <div
            key={`menu${i}`}
            style={{
              position: "absolute",
              ...slideFrom(i, slot(NAV_DESK, NAV_MOB, p), p),
              width: 34,
              height: 2.5,
              background: "rgba(244,242,237,0.5)",
              // glyphs materialize only as the nav morphs into the menu
              opacity: interpolate(p, [0.3, 0.55], [0, 1], clamp()) * 0.9,
            }}
          />
        ))}
        {/* hero type bars + media sheet */}
        <div style={lineStyle(slot(HERO_DESK, HERO_MOB, p), blockO(12), false)} />
        <div
          style={{
            position: "absolute",
            ...slot(HERO_DESK, HERO_MOB, p),
            opacity: blockO(12) * 0.9,
          }}
        >
          <div style={{ position: "absolute", left: 24, top: 30, width: "72%", height: 30, borderRadius: 6, background: "rgba(244,242,237,0.30)" }} />
          <div style={{ position: "absolute", left: 24, top: 74, width: "56%", height: 30, borderRadius: 6, background: "rgba(244,242,237,0.22)" }} />
          <div style={{ position: "absolute", left: 24, top: 118, width: "64%", height: 12, borderRadius: 6, background: "rgba(244,242,237,0.14)" }} />
          <div style={{ position: "absolute", left: 24, top: 146, width: "50%", height: 12, borderRadius: 6, background: "rgba(244,242,237,0.11)" }} />
          <div style={{ position: "absolute", left: 24, top: 178, width: 132, height: 34, borderRadius: 999, background: `linear-gradient(100deg, ${ACCENT}, ${ACCENT_SOFT})`, opacity: blockO(34) }} />
        </div>
        <div style={lineStyle(slot(MEDIA_DESK, CHILD_MOB, p), blockO(20), true)} />
        {[0, 1, 2].map((i) => card(i, blockO(22 + i * 3)))}
        <div style={lineStyle(slot(CTA_DESK, CTA_MOB, p), blockO(36) * 0.85, false)} />
        <div style={lineStyle(slot(FOOTER_DESK, FOOTER_MOB, p), blockO(48) * 0.6, true)} />
      </div>
      <Kicker t={t - 30} y={7} trackingTo={0.4} exit={102}>
        Thoughtfully designed.
      </Kicker>
      <Kicker t={t - 108} y={7} trackingTo={0.4} exit={196}>
        Purposefully built.
      </Kicker>
    </Stage>
  );
}

/** Hamburger row geometry while refolding nav → mobile menu.
 *  Bars stay pinned to the (morphing) nav's right edge; p is clamped so a
 *  negative spring time can never fling them off-frame. */
function slideFrom(
  i: number,
  s: { left: number; top: number; width: number; height: number },
  p: number,
) {
  const c = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  return {
    left: s.left + s.width - 114,
    top: interpolate(
      p,
      [0.35, 0.9],
      [s.top + s.height / 2 - 1.25 + i * 0.4, s.top + s.height / 2 - 5 + i * 7],
      c,
    ),
  };
}

/* ------------------------------------------------------------------ */
/*  ACT V — The reveal (frames 870–1079)                               */
/* ------------------------------------------------------------------ */

function ActFive() {
  const frame = useCurrentFrame();
  const t = frame - A5[0];

  // interfaces dissolve into motes of light
  const disperse = interpolate(t, [0, 34], [0, 1], clamp());
  const shards = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const angle = (i: number) => (i / shards.length) * Math.PI * 2;

  // the monolith returns, fully illuminated
  const monolithO = interpolate(t, [28, 46], [0, 1], clamp());
  // contracts to a single precise line
  const contract = interpolate(t, [44, 58], [0, 1], { easing: Easing.in(Easing.quad), ...clamp() });
  const scaleLeft = 1 - contract * 0.92;
  const flash = interpolate(t, [50, 52, 62], [0, 1, 0], clamp());
  // the mark lands ON the impact — a hard punch-down settle, not a float
  const logo = spring({ frame: t - 54, fps: 30, config: { damping: 13, stiffness: 210 } });

  return (
    <Stage scale={interpolate(t, [0, 54], [1.085, 1.0], { easing: easeOut, ...clamp() })}>
      {/* shards of the interfaces drifting inward */}
      {shards.map((i) => {
        const d = (1 - disperse) * 0 + disperse;
        const r = interpolate(d, [0, 1], [360 + 40 * (i % 3), 24]);
        return (
          <GlassPanel
            key={i}
            w={44 + (i % 4) * 12}
            h={10 + (i % 3) * 6}
            opacity={(1 - disperse) * (0.55 + (i % 3) * 0.18)}
            glow={0.5}
            blur={1}
            style={{
              left: 960 + Math.cos(angle(i)) * r,
              top: 520 + Math.sin(angle(i)) * r * 0.6,
              transform: `rotate(${(i % 5) * 34 + contract * 22}deg) scale(${interpolate(d, [0, 1], [1, 0.3])})`,
            }}
          />
        );
      })}

      {/* the illuminated monolith — fully dissolves as it contracts */}
      {[0, 1, 2, 3, 4].map((i) => (
        <GlassPanel
          key={`m${i}`}
          w={340 * (1 - contract * 0.94)}
          h={70 * (1 - contract * 0.8)}
          opacity={monolithO * (1 - contract)}
          glow={1.05 + interpolate(t, [28, 52], [0, 1], clamp()) * 0.45}
          style={{
            left: 960 - (340 * (1 - contract * 0.94)) / 2,
            top: 300 + i * (86 * (1 - contract * 0.82)),
            transform: `rotateY(${(i - 2) * 2.6}deg)`,
          }}
        />
      ))}
      {/* contracting into a single line of light, which the flash consumes */}
      <LightLine
        x={960 - 860 * scaleLeft}
        y={545}
        w={1720 * scaleLeft}
        h={4}
        opacity={
          interpolate(t, [46, 52], [0, 1], clamp()) *
          (1 - interpolate(t, [54, 60], [0, 1], clamp()))
        }
        glow={1.4 + flash * 2.4}
      />
      {/* the reveal flash */}
      {flash > 0.001 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.75 * flash}) 0%, rgba(255,77,0,${0.4 * flash}) 26%, transparent 55%)`,
          }}
        />
      )}

      {/* THE REVEAL — real brand assets only */}
      {t >= 54 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: interpolate(t, [54, 66, 188, 206], [0, 1, 1, 0], clamp()),
          }}
        >
          <div style={{ transform: `scale(${interpolate(logo, [0, 1], [1.055, 1])})`, textAlign: "center" }}>
            <Img
              src={staticFile("veyra-logo.png")}
              style={{
                width: 168,
                margin: "0 auto 34px",
                filter: `drop-shadow(0 0 ${26 + flash * 40}px rgba(255,77,0,0.55))`,
                transform: `translateY(${interpolate(logo, [0, 1], [10, 0])}px)`,
              }}
            />
            <div
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: 172,
                letterSpacing: "-0.03em",
                color: PAPER,
                lineHeight: 1,
              }}
            >
              VEYRA<span style={{ color: ACCENT }}>®</span>
            </div>
            <div
              style={{
                marginTop: 30,
                fontFamily: display,
                fontSize: 26,
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(244,242,237,0.55)",
                opacity: interpolate(t, [74, 86], [0, 1], clamp()),
              }}
            >
              Digital products, built with intent.
            </div>
          </div>
        </AbsoluteFill>
      )}
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/*  Composition                                                        */
/* ------------------------------------------------------------------ */

function StageBackdrop() {
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(244,242,237,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,237,0.045) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />
    </AbsoluteFill>
  );
}

export function Teaser() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const globalFade = interpolate(frame, [0, 8, durationInFrames - 20, durationInFrames - 4], [0, 1, 1, 0], clamp());
  return (
    <AbsoluteFill style={{ backgroundColor: INK, opacity: globalFade }}>
      <StageBackdrop />
      {frame < A1[1] && <ActOne />}
      {frame >= A2[0] && frame < A2[1] && <ActTwo />}
      {frame >= A3[0] && frame < A3[1] && <ActThree />}
      {frame >= A4[0] && frame < A4[1] && <ActFour />}
      {frame >= A5[0] && <ActFive />}
      {/* persistent vignette — one grade across the film */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 82% 66% at 50% 44%, transparent 42%, rgba(0,0,0,0.54) 100%)",
        }}
      />
      <Audio src={staticFile("teaser-mix.wav")} />
    </AbsoluteFill>
  );
}
