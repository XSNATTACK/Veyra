"""
VEYRA brand film — procedural cinematic score, SFX cues, and final mix.

Everything is synthesized deterministically (fixed seed) at the narration's
native 24 kHz, placed on the exact 1080-frame @30fps timeline, ducked under
the voiceover, limited, and written to audio/master_mix.wav plus per-stem
files in audio/stems/.

Stems kept separate for reproducibility:
  music_drone.wav   — evolving dark pad/sub bed
  music_pulse.wav   — rhythmic pulse grid (soft, cinematic)
  sfx.wav           — all cue-triggered sound effects
  voice.wav         — copy of the placed narration master

Usage: .venv-tts/Scripts/python.exe tools/synth_audio.py
"""

import json
import math
import os

import numpy as np
import soundfile as sf

SR = 24000
FPS = 30
FILM_FRAMES = 1080
FILM_LEN = FILM_FRAMES // FPS * SR  # 864000
SEED = 1904

rng = np.random.default_rng(SEED)

STEMS = "audio/stems"
OUT = "audio/master_mix.wav"


def t(freq: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    return np.arange(n, dtype=np.float64) / SR * (2 * math.pi * freq)


def env(n: int, a: float, d: float = 0.0, s: float = 1.0, r: float = 0.3, hold: float = 0.0) -> np.ndarray:
    """ADSR-ish envelope in seconds, normalized length n samples."""
    total = n / SR
    roof = a + hold
    pts = [0.0, a, roof, roof + d, max(total - r, 0.01), total]
    vals = [0.0, 1.0, 1.0, s, s, 0.0]
    x = np.arange(n) / SR
    return np.interp(x, pts, np.clip(vals, 0, 1)).astype(np.float64)


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    rc = 1.0 / (2 * math.pi * cutoff)
    tau = rc / SR
    y = np.empty_like(x)
    acc = 0.0
    # one-pole — good enough for soft cinematic tone shaping
    for_chunk = tau / (tau + 1.0) if tau > 0 else 0.0
    for i, v in enumerate(x):
        acc += for_chunk * (v - acc)
        y[i] = acc
    return y


def highpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    return x - lowpass(x, cutoff)


def decay_noise(dur: float, cutoff: float, seed_n: int) -> np.ndarray:
    rr = np.random.default_rng(seed_n)
    x = rr.standard_normal(int(dur * SR)).astype(np.float64)
    x *= np.exp(-np.linspace(0, 9, len(x)))  # sharp exp decay
    return lowpass(x, cutoff)


def brown(dur: float, a: float = 0.02) -> np.ndarray:
    n = int(dur * SR)
    rr = np.random.default_rng(seed_phase)
    w = rr.standard_normal(n).astype(np.float64)
    x = np.cumsum(w)
    x -= np.linspace(x[0], x[-1], n)  # detrend to zero DC
    return lowpass(x / (np.abs(x).max() + 1e-9), a * SR / 2)


seed_phase = SEED


# ---------------------------------------------------------------- layers ----

def music_drone() -> np.ndarray:
    n = FILM_LEN
    time = np.arange(n) / SR

    # deep sub bed — two slow-breathing sines
    sub = 0.9 * np.sin(t(39.0, FILM_LEN / SR)) + 0.55 * np.sin(t(58.5, FILM_LEN / SR))
    sub *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.055 * time + 0.6)

    # dark pad — detuned partial cluster, one-pole darkened
    pad = (
        np.sin(t(110.0, FILM_LEN / SR)) * 0.5
        + np.sin(t(110.85, FILM_LEN / SR)) * 0.42
        + np.sin(t(164.8, FILM_LEN / SR)) * 0.30
        + np.sin(t(220.0, FILM_LEN / SR)) * 0.22
        + np.sin(t(330.0, FILM_LEN / SR)) * 0.12
    )
    pad = lowpass(pad, 900)

    # octave shimmer only really enters from Act III onward
    shimmer = np.sin(t(440.0, FILM_LEN / SR) + 0.4 * np.sin(2 * np.pi * 0.21 * time)) * 0.16
    shimmer *= np.interp(time, [0, 12.4, 14.5, 28.8, 30.9, 36], [0, 0, 1, 1, 0.15, 0])

    # intensity envelope per act (hand-drawn automation)
    acts = [0.0, 1.0, 6.0, 13.0, 22.0, 28.2, 30.2, 30.85, 31.4, 34.6, 36.0]
    gains = [0.05, 0.13, 0.26, 0.30, 0.40, 0.52, 0.10, 0.64, 0.34, 0.10, 0.0]
    master_env = np.interp(time, acts, gains)
    pad *= master_env
    sub *= master_env
    sub = np.clip(sub, -1, 1)

    # air texture
    air = brown(FILM_LEN / SR, 0.35) * np.interp(time, acts, [g for g in gains]) * 0.35

    return (sub * 0.30 + pad * 0.34 + shimmer + air * 0.22)


def music_pulse() -> np.ndarray:
    n = FILM_LEN
    out = np.zeros(n)
    bpm = 96.0
    step = 60.0 / bpm / 2  # 8th note = 0.3125 s
    k = 0
    time_a = step * k
    while time_a < FILM_LEN / SR:
        when = int(time_a * SR)
        if when >= n:
            break
        accent = k % 8 == 0
        gain = 0.16 if accent else 0.08
        tm = time_a
        g = float(np.interp(tm, [5.4, 6.4, 22.0, 28.0, 28.9, 36],
                            [0.0, 0.55, 1.0, 1.0, 0.0, 0.0])) * gain
        if g > 1e-4:
            tick = np.sin(t(880 if accent else 1760, 0.12)) * env(int(0.12 * SR), 0.002, 0.0, 0.8, 0.11, 0.0)
            tick = highpass(tick, 500)
            out[when : when + len(tick)] += tick * g
        k += 1
        time_a = step * k
    return out


def whoosh(dur: float, rise: bool, cutoff_hi: float = 6000, seed_n: int = None) -> np.ndarray:
    rr = np.random.default_rng(seed_n or 700)
    x = rr.standard_normal(int(dur * SR)).astype(np.float64)
    x = lowpass(x, cutoff_hi)
    shape = np.linspace(0.02, 1, len(x)) ** 0.8 if rise else np.linspace(1, 0.02, len(x)) ** 0.8
    return x * shape * 4


def ring(partials, dur: float, decay: float = 2.2) -> np.ndarray:
    n = int(dur * SR)
    x = np.zeros(n)
    for (f, a) in partials:
        x += a * np.sin(t(f, dur) + rng.uniform(0, 6.28))
    x *= np.exp(-np.linspace(0, decay, n) * decay / dur * (dur / decay))  # natural
    x *= np.exp(-np.linspace(0, 2.2 * dur, n))
    return x


def click(dur: float = 0.06) -> np.ndarray:
    x = rng.standard_normal(int(dur * SR)).astype(np.float64)
    x *= np.exp(-np.linspace(0, 26, len(x)))
    return highpass(x, 2600) * 2.2


def ignition() -> np.ndarray:
    dur = 0.55
    n = int(dur * SR)
    f1, f2 = 900.0, 2600.0
    phase = np.linspace(0, 1, n)
    freq = f1 * (f2 / f1) ** phase
    ph = 2 * np.pi * np.cumsum(freq) / SR
    x = np.sin(ph) * env(int(dur * SR), 0.02, 0, 0.9, dur - 0.03, 0.02)
    x += ring([(2960, 0.5), (4120, 0.3)], dur, 3) * 0.5
    return x


def riser() -> np.ndarray:
    dur = 2.1
    phase = np.linspace(0, 1, int(dur * SR))
    freq = 180 * (900 / 180) ** phase ** 1.3
    x = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.5
    noise = whoosh(dur, True, 2600) * 0.8
    x = np.concatenate([x, noise])
    x = x * env(len(x), dur * 0.85, 0, 1.0, 0.06, 0.0)
    return x * 0.7


def impact() -> np.ndarray:
    dur = 2.5
    n_sub = int(dur * SR)
    # pitch drop 92 -> 43 Hz via cumulative phase
    freq = 92 * (43 / 92) ** np.linspace(0, 1, n_sub)
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    sub *= np.exp(-np.linspace(0, 4.2, int(dur * SR)))
    thump = lowpass(rng.standard_normal(int(dur * SR)), 220) * np.exp(-np.linspace(0, 15, int(dur * SR))) * 1.4
    clang = ring([(3520, 0.6), (5274, 0.34), (7920, 0.16)], 1.1, 4) * 0.7
    sonic_logo = sig_logo()
    n = int(dur * SR)
    x = np.zeros(n)
    x += sub * 0.9
    x[: len(thump)] += thump[:n]
    x[: len(clang)] += clang[:n]
    if sonic_logo is not None:
        x[: len(sonic_logo)] += sonic_logo[:n]
    return x


def sig_logo() -> np.ndarray:
    """Two-note identity motif (E4 -> B4) with glass character."""
    notes = [(329.6, 0.0, 0.55), (493.9, 0.22, 1.5)]
    dur = 2.3
    n = int(dur * SR)
    x = np.zeros(n)
    for f, at, dur2 in notes:
        w = ring([(f, 1.0), (f * 2, 0.35), (f * 3.01, 0.12)], dur2, 2.4)
        a = int(at * SR)
        x[a : a + len(w)] += w * 0.30
    return x


def assemble() -> np.ndarray:
    """Act IV cadence — soft rising micro-clicks."""
    dur = 3.4
    n = int(dur * SR)
    x = np.zeros(n)
    for i in range(9):
        c = click() * (0.25 + 0.09 * i)
        a = int(i * 0.36 * SR)
        x[a : a + len(c)] += c[: n - a if n - a > 0 else 0] * 0.8
    return x


def dissolve_shimmer() -> np.ndarray:
    """Act V interfaces dissolving into light."""
    dur = 2.4
    x = highpass(brown(dur, 3.0), 1400) * env(int(dur * SR), 0.6, 0, 0.9, 1.2, 0.2)
    x += ring([(1975, 0.4), (2093, 0.35), (2637, 0.3)], dur, 3.2) * 0.35
    return x * 0.8


# ------------------------------------------------------------------ cues ----

# (start_frame, wavefunction -> samples, gain, pan)
CUES = [
    (21, ignition, 0.38, 0.0),            # 0.70s — thin orange line ignites
    (58, lambda: ring([(164.8, 0.5), (246.9, 0.42), (369.9, 0.3)], 3.2, 2.0), 0.35, -0.4),
    (138, lambda: ring([(131.8, 0.4), (196.0, 0.34), (263.7, 0.26)], 1.8, 2.4), 0.28, 0.4),
    (179, lambda: np.concatenate([whoosh(0.5, True), whoosh(0.45, False)]), 1.05, 0.0),
    (204, lambda: ring([(523.3, 0.5), (784.0, 0.3)], 0.8, 2.6), 0.5, 0.5),
    (228, lambda: ring([(587.3, 0.5), (880.0, 0.3)], 0.8, 2.6), 0.45, -0.5),
    (252, lambda: ring([(659.3, 0.5), (1046.5, 0.3)], 0.9, 2.6), 0.4, 0.3),
    (390, lambda: np.concatenate([whoosh(0.28, True, 5200), whoosh(0.3, False, 4200)]), 1.4, 0.0),
    (432, lambda: click(0.05) * 0.6, 0.6, -0.4),
    (444, lambda: ring([(880, 0.4), (1318, 0.2)], 0.9, 2.8), 0.3, -0.4),
    (493, lambda: click(0.05) * 0.65, 0.6, 0.4),
    (498, lambda: ring([(987.8, 0.4), (1479.9, 0.2)], 0.9, 2.8), 0.28, 0.4),
    (555, lambda: click(0.05), 0.6, 0.0),
    (560, lambda: ring([(1174.7, 0.4), (1568, 0.2)], 1.1, 2.8), 0.26, 0.0),
    (660, assemble, 0.8, 0.0),
    (846, riser, 0.95, 0.0),
    (878, dissolve_shimmer, 0.9, 0.0),
    (922, impact, 1.15, 0.0),
    (1042, lambda: brown(1.7, 0.5) * env(int(1.7 * SR), 0.4, 0, 0.5, 1.1, 0.0), 0.35, 0.0),
]


def place_mix() -> dict:
    os.makedirs(STEMS, exist_ok=True)

    drone = music_drone()
    pulse = music_pulse()
    sfx = np.zeros(FILM_LEN)
    sfx_l = np.zeros(FILM_LEN)
    sfx_r = np.zeros(FILM_LEN)

    # equal-power pan for [-1, 1]
    def pan_gains(pan: float):
        return math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)

    gl, gr = pan_gains(0.0)
    for frame, fn, gain, pan in CUES:
        w = np.asarray(fn(), dtype=np.float64)
        if w.ndim > 1:
            w = w[:, 0]
        w = w / (np.abs(w).max() + 1e-9) * gain
        a = int(frame / FPS * SR)
        b = min(FILM_LEN, a + len(w))
        sfx[a:b] += w[: b - a] * (1 - abs(pan)) ** 0.5
        pl, pr = pan_gains(pan)
        sfx_l[a:b] += w[: b - a] * pl * 1.25
        sfx_r[a:b] += w[: b - a] * pr * 1.25

    # voice placed track
    voice, sr = sf.read("audio/voiceover/am_michael_master.wav")
    assert sr == SR
    voice = np.asarray(voice, dtype=np.float64)
    if len(voice) < FILM_LEN:
        voice = np.pad(voice, (0, FILM_LEN - len(voice)))
    voice = voice[:FILM_LEN]

    # duck music under voice segments
    timing = json.load(open("audio/voiceover/timing.json", encoding="utf-8"))
    ducked = np.copy(voice)
    env_duck = np.ones(FILM_LEN)
    targets = []
    for seg in timing["segments"]:
        a = int(seg["start_frame"] / FPS * SR) - int(0.08 * SR)
        b = int((seg["start_frame"] + int(seg["duration"] * FPS)) / FPS * SR) + int(0.18 * SR)
        targets.append((max(0, min(FILM_LEN, a)), max(0, min(FILM_LEN, b))))
    x = np.arange(FILM_LEN, dtype=np.float64) / SR  # seconds
    duck = np.full(FILM_LEN, 1.0)
    for a, b in targets:
        duck = np.minimum(duck, np.interp(x, [(a - int(.14 * SR)) / SR, a / SR, b / SR, (b + int(.3 * SR)) / SR], [1, 0.42, 0.42, 1]))
    drone *= duck
    pulse *= duck
    # keep the room silent around the logo's held breath (30.2–30.75s),
    # then open up again for the impact and the tagline
    sfx_gate = np.interp(x, [0, 3.3, 30.05, 30.55, 30.8, 31.4, 36.0], [0.0, 0.12, 0.0, 0.0, 1.0, 0.55, 0.12])
    sfx *= sfx_gate
    sfx_l *= sfx_gate
    sfx_r *= sfx_gate

    # gentle limiter + final gain
    def limit(track: np.ndarray) -> np.ndarray:
        return np.tanh(track * 1.3) * 0.92

    stereo = np.zeros((FILM_LEN, 2))
    stereo[:, 0] = voice * 1.0 + drone * 0.9 + pulse * 0.75 + sfx_l * 0.95
    stereo[:, 1] = voice * 1.0 + drone * 0.9 + pulse * 0.75 + sfx_r * 0.95

    for gain_ch in (0, 1):
        stereo[:, gain_ch] = limit(stereo[:, gain_ch])

    peak = np.abs(stereo).max()
    target_peak = 0.82
    if peak > target_peak:
        stereo *= target_peak / peak

    sf.write(OUT, stereo, SR)
    sf.write(os.path.join(STEMS, "music_drone.wav"), drone.astype(np.float32), SR)
    sf.write(os.path.join(STEMS, "music_pulse.wav"), pulse.astype(np.float32), SR)
    sf.write(os.path.join(STEMS, "sfx.wav"), sfx.astype(np.float32), SR)
    sf.write(os.path.join(STEMS, "voice.wav"), voice.astype(np.float32), SR)

    rms = math.sqrt(float(np.mean(stereo ** 2)))
    stats = {
        "sample_rate": SR,
        "duration": round(FILM_LEN / SR, 3),
        "rms_dbfs": round(20 * math.log10(rms), 2),
        "peak": round(float(np.abs(stereo).max()), 3),
        "cues": len(CUES),
    }
    with open("audio/mix_report.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(json.dumps(stats))


if __name__ == "__main__":
    place_mix()
