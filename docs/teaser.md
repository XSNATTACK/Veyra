# VEYRA — Brand Reveal Teaser (36s)

Procedurally rendered five-act teaser film for the studio showreel modal (home page CTA). No stock footage, no video-gen models — 100% Remotion composition driven by the real brand system.

## Deliverables (deployed)

| File | What |
|---|---|
| `public/teaser.mp4` | 1920×1080 @30fps, 36.01s, H.264 High (faststart) + AAC 48kHz stereo, ~2.0 MB |
| `public/teaser-poster.jpg` | Reveal frame (f~1010), 1920×1080 |
| `public/teaser-mix.wav` | Sound master used as the render's audio track (kept for reproducibility) |
| `src/remotion/Teaser.tsx` | The film composition (1080 frames, five acts, `<Audio>` wired) |
| `src/components/showreel-modal.tsx` | Plays `/teaser.mp4`, unmuted (user-initiated click) |

## Structure (frame ranges @30fps)

- **Act I, 0–179** — obsidian void, a line of light ignites; unformed glass fragments; VO 1
- **Act II, 180–389** — five glass panes stack into a monolith ("Design with intent."); VO 2 with glass-tap SFX synced at f204/228/252
- **Act III, 390–659** — real client work: BaanThong (websites), Sinergipest (applications), BDA Capital (products), inside authored browser chrome; VO 3–4
- **Act IV, 660–869** — layout blueprint assembles, then refolds desktop → mobile; VO 4 tail
- **Act V, 870–1079** — dispersal → held breath (silence 30.05–30.55s) → impact logo f922 → monogram + VEYRA® + tagline reveal; VO 5 lands f924

Sound master: `public/teaser-mix.wav` — 36.0s, 24kHz stereo, RMS −21 dBFS, reveal impact −10.4 dB against a −28.8 dB breath valley.

## Regenerating

### Film + web encode
```bash
npx remotion render src/remotion/index.tsx Teaser remotion-out/teaser-master.mp4 --overwrite
ffmpeg -y -i remotion-out/teaser-master.mp4 \
  -c:v libx264 -preset slow -crf 29 -profile:v high -level 4.1 \
  -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k -ar 48000 \
  public/teaser.mp4
# poster still
npx remotion still src/remotion/index.tsx Teaser public/teaser-poster.jpg --frame 1010 --overwrite
```

### Sound rebuild (procedural score + SFX)
```bash
.venv-tts/Scripts/python.exe tools/synth_audio.py   # -> audio/master_mix.wav
Copy-Item audio/master_mix.wav public/teaser-mix.wav -Force
```

### Voice rebuild (Kokoro TTS — heavy, cached)
```bash
.venv-tts/Scripts/python.exe tools/gen_voice.py    # -> audio/voiceover/*
```
Voice `am_michael`; models live in `audio/.models/` (gitignored, not tracked):

- `model_quantized.onnx` (~88 MB, int8) — release `thewh1teagle/kokoro-onnx`, tag `model-files-v1.0`
- `voices-v1.0.bin` (~27 MB)

## Notes

- Brand tokens: ink `#0A0A0B`, paper `#F4F2ED`, accent `#FF4D00`, soft `#FF8A3D`; type: Bricolage Grotesque + Instrument Serif italic via `@remotion/google-fonts`.
- Act III screenshots are real project shots from `public/work/` (1366×768), inner-parallaxed with a top-origin scale so each site's nav stays visible.
- The reveal frame uses the real `public/veyra-logo.png` (rgba, orange on transparency) — no fabricated wordmark.
- Quota-blocked image-gen models were **not** used; every pixel is CSS/SVG in the composition.
- Motion pass (2026-10-26): de-AI'd the timing system. Springs snapped to snap-territory (damping 9–15, stiffness 160–230, slight overshoot; no more damping-16–26 mush). Camera moves front-loaded into a fast beat then ambient drift instead of whole-act linear creep. Act III redesigned as an asymmetric relay — sheets slide in from alternating sides (center / −430 left / +340 right), each punch-lands (scale 1.07→1), and the outgoing sheet **wipes out in 9 frames** the moment its successor arrives (exit-cancel, never two stacked sheets). Inner parallax is real travel now (26–30px over 60f) and labels sit on fixed sides (left/right/left), never jumping on handoff. Bloom halved across GlassPanel/LightLine (30px→18px halos, 0.16→0.12 alpha) and the global vignette eased 0.62→0.54. Entrances tightened: ignition line cracks in 10f, seam pulses ±9/10f, Act IV blocks pop in 7f with 3f stagger, logo lands as an impact punch-down on the f922-style impact beat.
- `tools/gen_keyframes.py` (abandoned Gemini image-gen attempt) removed — superseded by fully procedural rendering.
- `remotion-out/`, `.venv-tts/`, `audio/.models/`, `audio/master_mix.wav` are local-only (gitignored).
