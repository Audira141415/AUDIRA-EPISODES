"""EP18 Bilal bin Rabah cue sheet (from cues/auto.py, EP46 pattern).

Reads out/sfx-timeline.json written by `npm run sfx` (docs/SHOTLIST.md + VO timing).
- paper scratch on every cut, one pop per callout (times from project/src/ep18/timing.ts CALLOUTS)
- one riser + one impact on the payoff: 70.64 s, the word "azan" over the Ka'bah (callout AZAN)
- no azan recording (adab): the call is shown as rings, heard only as a soft chime
- stem mastered at -28 LUFS (G18c: -26 left only 11 LU under the VO in EP18 Svalbard)
"""

from sfx.synth import blip, chime, envelope, impact, pad, pop, riser, scratch, whoosh

TARGET_LUFS = -28.0  # render:final trims it, ducks it under the VO, and masters the film at -14 LUFS

# D major
D4, FS4, A4, D5, FS5, A5 = 293.66, 369.99, 440.0, 587.33, 739.99, 880.0
CHORDS = [(146.83, 220.0, 293.66), (196.0, 246.94, 293.66), (220.0, 277.18, 329.63), (146.83, 220.0, 293.66)]

FAST = ("whip", "cepat", "fast", "snap", "smash", "crash")

# payoff hit = callout AZAN in timing.ts (t 70.6) + 0.04 to land on the stressed syllable
PAYOFF_T = 70.64

# project/src/ep18/timing.ts CALLOUTS[].t, in order
CALLOUT_T = [4.34, 6.1, 8.0, 12.76, 15.54, 18.75, 21.45, 25.32, 27.21, 30.6, 31.15, 32.07, 34.18, 36.52,
             39.45, 41.95, 43.48, 45.22, 49.85, 51.8, 53.27, 57.43, 59.51, 60.88, 64.21, 65.75, 70.6,
             71.84, 74.0, 78.9, 84.75, 86.49]


def near(t, marks, window):
    return any(m is not None and abs(t - m) < window for m in marks)


def score(mix, tl):
    dur = tl["duration"]
    shots = tl["shots"]
    beats = tl["beats"]
    hook = beats.get("hook") or 0.0
    payoff = PAYOFF_T
    outro = beats.get("outro") or shots[-1]["start"]

    # hook: the film opens with movement, not silence
    mix.put(hook, whoosh(0.6, 260, 2600, peak=0.7), 0.22)
    mix.put(hook + 0.45, blip(D5), 0.08)

    # cuts: paper scratch, alternating pan (payoff and outro have their own sounds)
    for i, t in enumerate(tl["cuts"]):
        if near(t, [payoff, outro], 0.5):
            continue
        shot = next((s for s in shots if s["start"] == t), {})
        strong = any(w in (shot.get("camera") or "").lower() for w in FAST)
        pan = -0.35 if i % 2 == 0 else 0.35
        mix.put(t - 0.12, scratch(0.35), 0.24 if strong else 0.17, pan)

    # one pop per callout, pitch climbing across the film
    texts = [t for t in CALLOUT_T if not near(t, [payoff, outro], 0.4)]
    for i, t in enumerate(texts):
        f0 = 700 + 40 * min(i, 18)
        mix.put(t + 0.05, pop(f0, f0 * 0.45), 0.07, -0.2 + 0.4 * (i % 2))

    # the one hero moment
    prev = max([c for c in tl["cuts"] if c < payoff - 0.3] or [payoff - 2.0])
    rdur = min(2.4, max(0.8, payoff - prev))
    mix.put(payoff - rdur, riser(rdur), 0.16)
    mix.put(payoff, impact(1.2), 0.3)
    mix.put(payoff + 0.05, chime([D5, FS5, A5], dur=1.6), 0.06)

    # outro card: a resolved chord
    mix.put(outro + 0.2, chime([D4, FS4, A4, D5], dur=2.2), 0.14)

    # quiet bed: four chords, dipped around the hero hit, faded in and out
    if tl.get("pad", True) and dur > 6:
        quarter = dur / 4
        chords = [(q * quarter, CHORDS[q]) for q in range(4)]
        pts = [(0, 0.0), (1.5, 1.0), (payoff - 0.4, 1.0), (payoff, 0.3), (payoff + 1.2, 0.3),
               (payoff + 2.0, 1.0), (dur - 1.5, 1.0), (dur, 0.0)]
        left, right = pad(dur, chords, volume=envelope(pts))
        mix.put_stereo(0, left, right, 0.012)
