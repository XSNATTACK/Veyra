"""
VEYRA brand film — voiceover generation with Kokoro TTS (voice: am_michael).

Generates one WAV per narration segment + master narration WAV + timing.json.
Durations measured here drive the film's act boundaries.

Usage: .venv-tts/Scripts/python.exe tools/gen_voice.py
"""

import json
import os

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

MODEL = "audio/.models/model_quantized.onnx"
VOICES = "audio/.models/voices-v1.0.bin"
OUT = "audio/voiceover"
SEGS = os.path.join(OUT, "segments")
VOICE = "am_michael"
SPEED = 1.0  # natural pace — a brand film must not sound rushed
SR = 24000

# Exact narration, one segment per act. Wording is fixed by the brief.
SEGMENTS = [
    ("act1", "Every business has something worth showing the world."),
    ("act2", "At Veyra, we turn that potential into digital experiences built with intent."),
    ("act3", "From business websites to web applications and digital products, every detail has a purpose."),
    ("act4", "Strategy, design, and development—working as one, from first idea to final build."),
    ("act5", "Veyra. Digital products, built with intent."),
]

THRESH_DB = -45.0  # trim marks below this level
PAD_HEAD = 0.08    # s of quiet head kept after trim
PAD_TAIL = 0.30    # s of natural decay kept after trim


def trim(samples: np.ndarray, sr: int) -> np.ndarray:
    peak = np.max(np.abs(samples)) or 1.0
    env = np.abs(samples) / peak
    db = 20 * np.log10(np.maximum(env, 1e-12))
    loud = np.where(db > THRESH_DB)[0]
    if len(loud) == 0:
        return samples
    a = max(0, loud[0] - int(PAD_HEAD * sr))
    b = min(len(samples), loud[-1] + int(PAD_TAIL * sr))
    return samples[a:b]


def main() -> None:
    os.makedirs(SEGS, exist_ok=True)
    k = Kokoro(MODEL, VOICES)

    timing = {"voice": VOICE, "speed": SPEED, "sample_rate": SR, "segments": []}
    master = []
    for name, text in SEGMENTS:
        samples, sr = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        assert sr == SR, f"unexpected sample rate {sr}"
        samples = trim(np.asarray(samples, dtype=np.float32), SR)
        path = os.path.join(SEGS, f"{name}.wav")
        sf.write(path, samples, SR)
        dur = len(samples) / SR
        timing["segments"].append({"act": name, "text": text, "file": path, "duration": round(dur, 3)})
        master.append(samples)
        print(f"{name}: {dur:.2f}s  '{text[:50]}...'", flush=True)

    # Segment start frames on the 36s @30fps timeline — VO leads/lands on cuts.
    PLACEMENTS = {"act1": 42, "act2": 196, "act3": 414, "act4": 690, "act5": 924}
    FILM_FRAMES = 1080  # 36.0s @ 30fps
    master_len = FILM_FRAMES // 30 * SR
    masterarray = np.zeros(master_len, dtype=np.float32)
    for t, seg in zip(timing["segments"], master):
        start = int(PLACEMENTS[t["act"]] / 30 * SR)
        end = min(master_len, start + len(seg))
        masterarray[start:end] += seg[: end - start]
        t["start_frame"] = PLACEMENTS[t["act"]]
    master_path = os.path.join(OUT, "am_michael_master.wav")
    sf.write(master_path, masterarray, SR)

    total = sum(s["duration"] for s in timing["segments"])
    timing["spoken_total"] = round(total, 3)
    timing["master"] = master_path
    timing["master_duration"] = round(len(masterarray) / SR, 3)
    with open(os.path.join(OUT, "timing.json"), "w", encoding="utf-8") as f:
        json.dump(timing, f, indent=2)
    print(f"master: {timing['master_duration']}s (spoken {total:.2f}s)")


if __name__ == "__main__":
    main()
