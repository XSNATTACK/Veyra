import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
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

const INK = "#0A0A0B";
const PAPER = "#F4F2ED";
const ACCENT = "#FF4D00";

const LINES: { lead: string; accent: string }[] = [
  { lead: "Design that", accent: "converts" },
  { lead: "Motion that", accent: "breathes" },
  { lead: "Code that", accent: "ships" },
  { lead: "Intent in every", accent: "pixel" },
];

function Backdrop({ seed = 0 }: { seed?: number }) {
  const frame = useCurrentFrame();
  const drift = (amp: number, speed: number, phase: number) =>
    Math.sin((frame / 30) * speed + phase + seed) * amp;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      {/* drifting ember glows */}
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: 900 + drift(120, 0.35, 0),
          top: -250 + drift(90, 0.28, 1),
          background: `radial-gradient(closest-side, ${ACCENT}55, transparent)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -300 + drift(100, 0.3, 2),
          top: 500 + drift(80, 0.4, 0),
          background: `radial-gradient(closest-side, ${ACCENT}33, transparent)`,
          filter: "blur(40px)",
        }}
      />
      {/* faint grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          backgroundImage:
            "linear-gradient(rgba(244,242,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,237,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translateY(${(frame * 0.6) % 72}px)`,
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 65% at 50% 40%, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}

function Intro({ start, end }: { start: number; end: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - start;
  const pop = spring({ frame: t, fps, config: { damping: 14, stiffness: 120 } });
  const scale = interpolate(pop, [0, 1], [0.85, 1]);
  const opacity = interpolate(t, [0, 12, end - 14, end], [0, 1, 1, 0]);
  const rise = interpolate(t, [end - 14, end], [0, -70], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineX = interpolate(t, [8, 30], [0, 1], { easing: Easing.out(Easing.exp) });
  if (t < 0) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 190,
            letterSpacing: "-0.03em",
            color: PAPER,
            lineHeight: 1,
          }}
        >
          VEYRA<span style={{ color: ACCENT }}>®</span>
        </div>
        <div
          style={{
            height: 3,
            marginTop: 36,
            background: `linear-gradient(90deg, ${ACCENT}, #FF8A3D)`,
            transform: `scaleX(${lineX})`,
            transformOrigin: "left",
            boxShadow: "0 0 24px rgba(255,77,0,0.8)",
          }}
        />
        <div
          style={{
            fontFamily: display,
            marginTop: 28,
            fontSize: 30,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(244,242,237,0.55)",
          }}
        >
          Independent digital studio
        </div>
      </div>
    </AbsoluteFill>
  );
}

function KineticLine({ index, start, span }: { index: number; start: number; span: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - start;
  if (t < 0 || t > span + 14) return null;
  const l = LINES[index];
  const enter = spring({ frame: Math.max(0, t), fps, config: { damping: 16, stiffness: 140 } });
  const y = interpolate(enter, [0, 1], [90, 0]);
  const opacity = interpolate(t, [0, 10, span - 12, span + 6], [0, 1, 1, 0]);
  const blur = interpolate(t, [0, 10, span - 12, span + 6], [14, 0, 0, 10]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div
        style={{
          transform: `translateY(${y}px)`,
          filter: `blur(${blur}px)`,
          textAlign: "center",
          padding: "0 120px",
        }}
      >
        <div
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 118,
            letterSpacing: "-0.025em",
            color: PAPER,
            lineHeight: 1.05,
          }}
        >
          {l.lead}{" "}
          <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: ACCENT }}>
            {l.accent}
          </span>
        </div>
        <div
          style={{
            fontFamily: display,
            marginTop: 30,
            fontSize: 24,
            letterSpacing: "0.3em",
            color: "rgba(244,242,237,0.5)",
          }}
        >
          0{index + 1} / 04
        </div>
      </div>
    </AbsoluteFill>
  );
}

function EndCard({ start }: { start: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - start;
  if (t < 0) return null;
  const enter = spring({ frame: t, fps, config: { damping: 15, stiffness: 110 } });
  const y = interpolate(enter, [0, 1], [70, 0]);
  const opacity = interpolate(t, [0, 10], [0, 1]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ transform: `translateY(${y}px)`, textAlign: "center" }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 600,
            fontSize: 110,
            letterSpacing: "-0.025em",
            color: PAPER,
            lineHeight: 1.05,
          }}
        >
          Have something
          <br />
          <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400 }}>
            worth building?
          </span>
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 44,
            fontFamily: display,
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#0A0A0B",
            background: PAPER,
            padding: "22px 54px",
            borderRadius: 999,
          }}
        >
          veyra.vercel.app
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function Teaser() {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  // timeline: intro 0–70, lines 70–300 (~57f each), end 300–360
  const lineStart = 70;
  const lineSpan = 56;
  const endStart = lineStart + lineSpan * LINES.length + 6;
  const globalFade = interpolate(
    frame,
    [0, 8, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
  );
  return (
    <AbsoluteFill style={{ backgroundColor: INK, opacity: globalFade }}>
      <Backdrop />
      <Intro start={0} end={70} />
      {LINES.map((_, i) => (
        <KineticLine key={i} index={i} start={lineStart + i * lineSpan} span={lineSpan} />
      ))}
      <EndCard start={endStart} />
    </AbsoluteFill>
  );
}
