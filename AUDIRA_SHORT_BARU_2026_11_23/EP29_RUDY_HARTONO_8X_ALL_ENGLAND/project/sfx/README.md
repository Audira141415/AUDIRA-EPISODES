# sfx: procedural sound effects under the voice-over

Every sound is synthesized in pure Python 3 stdlib (no samples, no licences, same output on every run):
click, key/typing, blip, pop, chime, whoosh, riser, impact, scratch, pad. `dsp.py` adds filters,
reverb, delay and a compressor for new generators.

Vendored from [claude-motion](https://github.com/whaleyxbt/claude-motion) by whaleyxbt (MIT,
`LICENSE-claude-motion.txt`), commit `6f80380`. The engine files (`synth.py`, `mix.py`,
`loudness.py`, `dsp.py`, `__init__.py`, `__main__.py`) are unchanged; AUDIRA adds the timeline
builder (`scripts/sfx.mjs`) and the cue sheets in `cues/`.

## AUDIRA flow

```bash
npm run sfx                                   # SHOTLIST.md + VO timing -> out/sfx-timeline.json -> public/audio/sfx.wav
npm run sfx -- --cues=sfx/cues/my-episode.py  # your own cue sheet
npm run sfx -- --list                         # generators and what each is for
npm run render:final -- --comp=<Final> --out=out/final.mp4 --vo=public/audio/vo.mp3 --offset=0.3 --sfx=public/audio/sfx.wav
```

- The timeline is built from `SHOTLIST.md` (film seconds) and, when given, the VO timing from
  `npm run vo` (`--timing=public/audio/vo.timing.json`, shifted by `Offset:`). Retime the shot list,
  run `npm run sfx` again, and the sound follows.
- `cues/auto.py` is the default cue sheet: a whoosh into every cut, pops for on-screen text, one
  riser into the payoff, one impact on it, a chime on the outro and a quiet pad bed. The accent
  family follows the style (paper and ink styles scratch, screen styles click, the rest whoosh).
  Copy it to `cues/<episode>.py` to tune an episode.
- The stem is mastered to −20 LUFS (`TARGET_LUFS`). `render:final --sfx` ducks it under the voice
  (sidechain, threshold 0.1, ratio 2.5: measured on a real VO, cut accents sit 8–14 dB and the payoff
  impact about 5 dB under the voice peaks, the pad bed about 17 dB under), mixes it with the VO, and the delivery
  master brings the whole film to −14 LUFS with true peak under −1 dBTP.
- Accent, don't narrate: continuous motion (drift, orbit, grain) stays silent. One riser and one
  impact per film.
- Pure Python is slow on long audio: a 90 s short renders in well under a minute; a 10-minute
  long-form can take several minutes (`--no-pad` skips the bed and is much faster).
