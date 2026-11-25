"""One-off fixes after reviewing the EP04 sheet. Run from AUDIRA_AI_MOTION_VIRAL."""
from pathlib import Path
def patch(f, reps):
    p = Path(f); s = p.read_text(encoding="utf8")
    for a, b in reps:
        assert a in s, a
        s = s.replace(a, b)
    p.write_text(s, encoding="utf8")
patch("EP04_HEWAN_BICARA/world3d.js", [
 ("[0, .2, 4.1, 10.8, 0, 3.55, 0], [K.s1e, -.3, 4, 12.8, 0, 3.4, 0],", "[0, .2, 5, 12.5, 0, 4.85, 0], [K.s1e, -.3, 4.9, 14, 0, 4.6, 0],"),
 ("[K.s2 + 1, .6, 4.3, 16, 0, 3.15, 0], [K.s2e, -.5, 4.4, 16.8, 0, 3.15, 0],", "[K.s2 + 1, .6, 4.3, 17, 0, 3.6, 0], [K.s2e, -.5, 4.4, 17.6, 0, 3.6, 0],"),
 ("[K.s3 + 1, .1, 4.2, 12, 0, 3.75, 0], [tar - .1, -.2, 4.1, 11, 0, 3.55, 0], [tar + 1, .1, 3.9, 7.8, 0, 3.55, 0], [K.s3e, .2, 3.9, 8.2, 0, 3.55, 0],", "[K.s3 + 1, .1, 4.6, 13.5, 0, 4.5, 0], [tar - .1, -.2, 4.6, 12.6, 0, 4.4, 0], [tar + 1, .1, 4, 8, 0, 3.8, 0], [K.s3e, .2, 4, 8.4, 0, 3.8, 0],"),
 ("[K.s5 + 1, .4, 4.6, 19, 0, 3, 0], [K.s5e, -.4, 4.6, 18.4, 0, 3, 0],", "[K.s5 + 1, .4, 4.6, 19, 0, 3.4, 0], [K.s5e, -.4, 4.6, 18.4, 0, 3.4, 0],"),
 ("[K.s6 + 1.2, 3.2, 3.6, 19.5, .2, 3, 0], [K.s6e, 2.6, 3.8, 18, .2, 3.1, 0],", "[K.s6 + 1.2, 1, 3.8, 20, .25, 3.3, 0], [K.s6e, .4, 3.9, 19, .25, 3.3, 0],"),
 ("[K.s7 + 1, -1.2, 3.8, 15, 0, 3.3, 0], [rah, .6, 3.8, 13, 0, 3.5, 0], [rah + 2, .1, 4.2, 10.8, 0, 3.6, 0], [K.dur, 0, 4.2, 10.4, 0, 3.6, 0],", "[K.s7 + 1, .1, 4.4, 16, 0, 4, 0], [rah, .3, 4.4, 15, 0, 4.2, 0], [rah + 2, .1, 4.8, 13, 0, 4.7, 0], [K.dur, 0, 4.8, 12.6, 0, 4.7, 0],"),
 # frame hugs the head
 ("bar(5.2, .34, 0, 3, frame); bar(5.2, .34, 0, -2.8, frame); bar(.34, 6.14, -2.6, 0, frame); bar(.34, 6.14, 2.6, 0, frame);", "bar(4, .22, 0, 1.75, frame); bar(4, .22, 0, -1.75, frame); bar(.22, 3.72, -2, 0, frame); bar(.22, 3.72, 2, 0, frame);"),
 ("frame.position.set(0, 3.55, 1.5 + boil(4) * .02);", "frame.position.set(0, 3.8, 1.6 + boil(4) * .02);"),
 # waveform is a stage backdrop behind the cat, and returns for the payoff
 ("const wIn = Math.max(inOut(t, sus - .2, K.s3 - .2), inOut(t, suaraS4 - .2, K.s5 + .1), inOut(t, K.s6e + 100, K.s6e + 101));", "const wIn = Math.max(inOut(t, sus - .2, K.s3 - .2), inOut(t, suaraS4 - .2, K.s5 + .1), inOut(t, rah - .1, K.dur + 2));"),
 ("waveG.position.set(0, 6.85, -.6 + boil(6) * .01);", "waveG.position.set(0, 3.5, -3 + boil(6) * .01);"),
 ("waveG.scale.setScalar(Math.max(.01, wIn) * .9);", "waveG.scale.setScalar(Math.max(.01, wIn) * 1.5);"),
 ("b.scale.y = .25 + (j * 1.15 + .15) * (.55 + .45 * ph);", "b.scale.y = .4 + (j * 2.2 + .25) * (.55 + .45 * ph);"),
 # tail: tighter beads
 ("for (let i = 0; i < 9; i++) { tailG.push(sph(.3 - i * .012,", "for (let i = 0; i < 16; i++) { tailG.push(sph(.27 - i * .006,"),
 ("const u = i / 8, w = Math.sin(t * 2.2 - i * .5) * .42 * u; b.position.set(1.05 + u * 1.5 + w * .4, .5 + u * u * 2.5, -.7 - u * .3 + w);", "const u = i / 15, w = Math.sin(t * 2.2 - i * .3) * .38 * u; b.position.set(1.05 + u * 1.1 + w * .4, .5 + u * u * 1.9, -.7 - u * .3 + w);"),
 # calmer closed mouth
 ("const lipU = sph(.42, CREAM, 0, .13, .11, 1.1, .34, .42, mouth);", "const lipU = sph(.42, CREAM, 0, .13, .08, .95, .24, .34, mouth);"),
 ("lipU.scale.set(1.1 + wd * .4, .34, .42);", "lipU.scale.set(.95 + wd * .4, .24, .34);"),
 ("jaw.scale.set(1.05 + wd * .4, .36 + j * .1, .46);", "jaw.scale.set(.9 + wd * .4, .26 + j * .1, .36);"),
 # actor stands in frame, cat steps aside
 ("actor.position.set(-3.5, 0, 1.4);", "cat.position.x = 1 * smooth(clamp01(aIn)); actor.position.set(-1.95, 0, 2.2);"),
 ("camClay.position.set(-3.5, 0, 4.6); camClay.rotation.y = Math.PI;", "camClay.position.set(-2.9, 0, 4.6); camClay.rotation.y = Math.PI - .35;"),
 ("b.position.set(-3.1 + 3 * u, 3 + Math.sin(u * 3.14) * 1.5, 1.2 - u * .4);", "b.position.set(-1.5 + 2.2 * u, 2.8 + u * 1 + Math.sin(u * 3.14) * 1.2, 2 - u * .4);"),
 # sign inside frame
 ("sign.position.set(2.25, 3.05, .9); sign.scale.setScalar(Math.max(.01, sA));", "sign.position.set(1.85, 2.3, 1.5); sign.scale.setScalar(Math.max(.01, sA) * .9);"),
 # drop the stray threads; the equaliser is the payoff
 ("const thr = inOut(t, rah + .1, K.dur + 2);", "const thr = 0;"),
])
