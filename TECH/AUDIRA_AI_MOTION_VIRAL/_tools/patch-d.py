"""One-off fixes after reviewing EP04 and EP05 sheets, plus the render-all script. Run from AUDIRA_AI_MOTION_VIRAL."""
from pathlib import Path
def patch(f, reps):
    p = Path(f); s = p.read_text(encoding="utf8")
    for a, b in reps:
        assert a in s, a
        s = s.replace(a, b)
    p.write_text(s, encoding="utf8")
patch("EP04_HEWAN_BICARA/world3d.js", [
 ("const fIn = inOut(t, kar - .2, K.s4 - .2);", "const fIn = inOut(t, kar - .2, tar - .1);"),
 ("c.position.set(s * .17, .08, .14);", "c.position.set(s * .17, -.07, .14);"),
 ("c.scale.setScalar(t > tar - .1 && t < tar + 3.4 ? 2 : 1);", "c.scale.setScalar(t > tar - .1 && t < tar + 3.4 ? 1.6 : 1);"),
 ("sign.position.set(1.85, 2.3, 1.5);", "sign.position.set(1.55, 2.3, 1.5);"),
])
patch("EP05_MOTION_GRAPHICS/build-video.mjs", [
 ('data-at="s1:kode" data-fx="pop"', 'data-at="s1:Seluruhnya" data-fx="pop"'),
 ("#rmslot{height:500px}", "#rmslot{height:556px}"),
])
patch("EP05_MOTION_GRAPHICS/world3d.js", [
 ("ED.visible = eIn > .01; ED.position.set(0, -1 - (1 - eIn) * 12, 8.6);", "ED.visible = eIn > .01; ED.scale.setScalar(.8); ED.position.set(0, -.8 - (1 - eIn) * 12, 8.6);"),
 ("HT.visible = hIn > .01; HT.position.set(0, .3 + (1 - hIn) * 10, 8);", "HT.visible = hIn > .01; HT.scale.setScalar(.8); HT.position.set(0, .2 + (1 - hIn) * 10, 8);"),
 ("const yB = -2.8 - (side ? 0 : 0);", "const yB = -2.2;"),
 ("const xE = -4.1 + idx * .36;", "const xE = -3.1 + idx * .29;"),
 ("const rowY = split * (side ? 1.05 : -1.05);", "m.scale.setScalar(.62); const rowY = split * (side ? .7 : -.7);"),
 ("TR.visible = tIn > .01; TR.position.set(0, -1 - (1 - tIn) * 9, 7);", "TR.visible = tIn > .01; TR.scale.setScalar(.7); TR.position.set(0, -1.2 - (1 - tIn) * 9, 7);"),
 ("NUM.position.set(1.8, 1.5, 8.2); NUM.scale.setScalar(Math.max(.01, nA));", "NUM.position.set(.5, 1.05, 8.2); NUM.scale.setScalar(Math.max(.01, nA) * .7);"),
 ("- .55 * ramp(t, K.s6, K.s6 + .8)", "- .75 * ramp(t, K.s6, K.s6 + .8)"),
 ("m.position.set(-FW / 2 + 1, 4.6 - i * 1.0, i * 2.5 * s + .02);", "m.position.set(-1.4, 4.6 - i * 1.0, i * 2.5 * s + .02);"),
])
Path("_tools/render-all.sh").write_text("""#!/usr/bin/env bash
# Renders the silent previews, then gives EP05 a review sheet made of real frames from the other four.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL
cd "$ROOT"
for e in EP01_SATU_FOTO EP02_MOTION_TRANSFER EP03_MOBIL_TRANSFORM EP04_HEWAN_BICARA; do bash _tools/render.sh "$e" 4; done
ffmpeg -y -loglevel error -ss 12 -i EP01_SATU_FOTO/PREVIEW.mp4 -ss 30 -i EP02_MOTION_TRANSFER/PREVIEW.mp4 -ss 54 -i EP03_MOBIL_TRANSFORM/PREVIEW.mp4 -ss 3 -i EP04_HEWAN_BICARA/PREVIEW.mp4 -ss 48 -i EP01_SATU_FOTO/PREVIEW.mp4 -ss 60 -i EP02_MOTION_TRANSFER/PREVIEW.mp4 -ss 14 -i EP03_MOBIL_TRANSFORM/PREVIEW.mp4 -ss 60 -i EP04_HEWAN_BICARA/PREVIEW.mp4 -ss 70 -i EP03_MOBIL_TRANSFORM/PREVIEW.mp4 -filter_complex "[0:v]trim=end_frame=1,scale=360:-1[a];[1:v]trim=end_frame=1,scale=360:-1[b];[2:v]trim=end_frame=1,scale=360:-1[c];[3:v]trim=end_frame=1,scale=360:-1[d];[4:v]trim=end_frame=1,scale=360:-1[e];[5:v]trim=end_frame=1,scale=360:-1[f];[6:v]trim=end_frame=1,scale=360:-1[g];[7:v]trim=end_frame=1,scale=360:-1[h];[8:v]trim=end_frame=1,scale=360:-1[i];[a][b][c][d][e][f][g][h][i]xstack=inputs=9:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h3|w0_h0+h3|w0+w1_h0+h3[o]" -map "[o]" -frames:v 1 -q:v 3 EP05_MOTION_GRAPHICS/PROJECT/HyperFrames_Remotion/assets/img/review.jpg
bash _tools/render.sh EP05_MOTION_GRAPHICS 4
python _tools/qc-preview.py
""", encoding="utf8")
s = Path("../AUDIRA_GAMING_MMRORPG/_tools/qc-preview.py").read_text(encoding="utf8")
Path("_tools/qc-preview.py").write_text(s.replace("Run from AUDIRA_GAMING_MMRORPG", "Run from AUDIRA_AI_MOTION_VIRAL"), encoding="utf8")
