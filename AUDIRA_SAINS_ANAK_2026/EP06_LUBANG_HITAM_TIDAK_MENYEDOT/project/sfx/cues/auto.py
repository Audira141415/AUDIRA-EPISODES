"""AUDIRA default cue sheet: sound from the shot list, under the voice-over.

Reads out/sfx-timeline.json written by `npm run sfx` (shots, cuts, hook/payoff/outro beats, VO
pauses, style). Copy this file to cues/<episode>.py to tune one film; keep every time coming from
`tl`, never typed in.

Rules (from claude-motion's sound-design skill, adapted for a VO-led film):
- accent, don't narrate: a sound on a cut, a text pop, the hero moment; continuous motion stays silent
- one riser and one impact per film, on the payoff
- one key for every tonal sound (D major here), pitch rising with progress
- pan follows the screen: cuts alternate left/right
- the stem is mastered quiet (TARGET_LUFS); render:final ducks it under the VO and masters the film
"""

from sfx.synth import blip, chime, click, envelope, impact, pad, pop, riser, scratch, whoosh

TARGET_LUFS = -29.0  # EP05 s4: -26 gave G18c gap 9.9 LU (<12); stem level before mixing (was -20: forced soft-clip drive 2.0 on a sparse stem = audible distortion); render:final trims it 4 dB more, ducks it under the VO, and the film master sets -14 LUFS

# D major
D4, FS4, A4, D5, FS5, A5 = 293.66, 369.99, 440.0, 587.33, 739.99, 880.0
CHORDS = [(146.83, 220.0, 293.66), (196.0, 246.94, 293.66), (220.0, 277.18, 329.63), (146.83, 220.0, 293.66)]

# accent family per style: paper/ink/textile scratch, screen styles click, everything else whooshes
PAPER = {"PAPERWORLD", "INKSTORY", "SKETCHFORGE", "CHALKCRAFT", "WATERCOLOR", "MANUSCRIPT", "RISOFORGE", "UKIYOFORGE",
         "COMICFORGE", "DRAFTFORGE", "HISTORYMAP", "WAYANGFORGE", "SULAMFORGE", "FELTCRAFT", "ISLAMICDOCUMENTARY"}
SCREEN = {"CYBERFORGE", "DEVFORGE", "TRADINGTERMINAL", "CIRCUITFORGE", "GLITCHFORGE", "ARCADECRT", "PIXELSTORY",
          "TEXTVOYAGE", "SATELLITEBRIEFING", "VISUALINVESTIGATION", "AUDIRABOT", "RETROWAVE", "Y2KCHROME",
          "LIDARFORGE", "THERMALFORGE", "DATAPHYSICAL"}
FAST = ("whip", "cepat", "fast", "snap", "smash", "crash")


def near(t, marks, window):
    return any(m is not None and abs(t - m) < window for m in marks)


def score(mix, tl):
    dur = tl["duration"]
    style = (tl.get("style") or "").upper()
    family = "paper" if style in PAPER else "screen" if style in SCREEN else "air"
    shots = tl["shots"]
    beats = tl["beats"]
    hook = beats.get("hook") or 0.0
    # payoff: the shot marked Payoff, else the shot starting nearest 79 % of the film (6-stage structure)
    payoff = beats.get("payoff")
    if payoff is None and len(shots) > 2:
        payoff = min((s["start"] for s in shots[1:]), key=lambda t: abs(t - 0.79 * dur))
    outro = beats.get("outro") or shots[-1]["start"]

    # hook: the film opens with movement, not silence
    mix.put(hook, whoosh(0.6, 260, 2600, peak=0.7), 0.22)
    mix.put(hook + 0.45, blip(D5), 0.08)

    # cuts (the payoff and outro have their own sounds)
    for i, t in enumerate(tl["cuts"]):
        if near(t, [payoff, outro], 0.5):
            continue
        shot = next((s for s in shots if s["start"] == t), {})
        strong = any(w in (shot.get("camera") or "").lower() for w in FAST)
        pan = -0.35 if i % 2 == 0 else 0.35
        if family == "paper":
            mix.put(t - 0.12, scratch(0.35), 0.24 if strong else 0.17, pan)
        elif family == "screen":
            mix.put(t, click(1800 if strong else 2400), 0.2 if strong else 0.15, pan)
            mix.put(t + 0.02, blip(A4 if i % 2 else D5, dur=0.25), 0.05, pan)
        else:
            mix.put(t - 0.3, whoosh(0.4, 400, 2200, peak=0.75), 0.3 if strong else 0.2, pan)

    # on-screen text pops in, pitch climbing across the film
    texts = [s for s in shots if (s.get("text") or "").strip(" -–—") and not near(s["start"], [payoff, outro], 0.4)]
    for i, s in enumerate(texts):
        f0 = 700 + 90 * min(i, 8)
        mix.put(s["start"] + 0.35, pop(f0, f0 * 0.45), 0.07, -0.2 + 0.4 * (i % 2))

    # the one hero moment
    if payoff is not None:
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
        pts = [(0, 0.0), (1.5, 1.0), (dur - 1.5, 1.0), (dur, 0.0)]
        if payoff is not None:
            pts += [(payoff - 0.4, 1.0), (payoff, 0.3), (payoff + 1.2, 0.3), (payoff + 2.0, 1.0)]
        left, right = pad(dur, chords, volume=envelope(pts))
        # 0.012 (was 0.03): the stem is normalised to TARGET_LUFS, so a loud bed got boosted ~20 dB and
        # droned under the whole VO; the bed must sit well below the accents (2026-11-22 audit)
        mix.put_stereo(0, left, right, 0.012)
