"""EP48 sound: a playful accordion-like waltz in G major (reedy detuned square/saw with bellows tremolo, oom-pah
bass), a small village church bell, mountain wind on the wide crane shots, soft clay "squish" on every pop, paper
for the 1278 scroll, ballots dropping into the box, a quill scratch, a comic tuba slide for Boris I, footsteps of
the tiny police figure, a heavy vault door and a sign flip. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(48)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 132  # waltz, 3 beats per bar

# G - C - D - G, Em - C - D - G, one chord per bar
prog = [[55, 59, 62], [48, 52, 55], [50, 54, 57], [55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57], [55, 59, 62]]
mel = [71, 74, 72, 71, 69, 71, 72, 74, 76, 74, 72, 71, 69, 67, 69, 71, 72, 71, 69, 66, 67, 69, 71, 67]
bar = beat * 3
acc, bass, lead = M.mono(), M.mono(), M.mono()


def reed(f, dur, amp=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = sum(np.sign(np.sin(2 * np.pi * f * d * tt)) * 0.5 + np.sin(2 * np.pi * f * d * 2 * tt) * 0.3 for d in (0.996, 1.0, 1.005)) / 3
    env = np.minimum(1, tt / 0.02) * np.minimum(1, (dur - tt) / 0.05) * (0.82 + 0.18 * np.sin(2 * np.pi * 5.5 * tt))
    return x * env * amp


k = 0
for b0 in np.arange(0.2, END + 1.0, bar):
    ch = prog[int(b0 / bar) % len(prog)]
    M.lay(bass, M.note(hz(ch[0] - 12), beat * 0.9, "tri", 3.0), b0, 0.9)
    for j in (1, 2):
        for m in ch:
            M.lay(acc, reed(hz(m), beat * 0.55), b0 + j * beat, 0.22)
    for j in range(3):
        if b0 > K["s2"] - 1 and (k + j) % 2 == 0:
            M.lay(lead, reed(hz(mel[(k + j) % len(mel)]), beat * 0.9), b0 + j * beat, 0.35)
    k += 3
acc = M.band(acc, 150, 4500); lead = M.band(lead, 300, 6000)
for x in (acc, bass, lead):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.4, 0.8), (K["s4"], 0.8), (K["s6"], 1.0), (K["s7"], 0.85), (K["s8"], 1.0), (END, 1.0), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * acc + 0.5 * bass + 0.35 * lead) * e_all
music = stereo(mono, 0.12 * lead * e_all)

# mountain wind, louder on the high crane shots (s2, s8)
w = M.band(rng.standard_normal(N), 80, 1200); w /= np.abs(w).max()
we = M.env([(0, 0.2), (K["s2"], 0.2), (K["s2"] + 1.5, 1), (K["s3"], 1), (K["s3"] + 1.5, 0.2), (K["s8"], 0.2), (K["s8"] + 2.5, 1), (DUR, 1)])
M.fx += np.stack([w * we, np.roll(w, 1700) * we], 1) * 0.022


def squish(t, a=0.05):  # wet clay pop: low thump + short filtered noise with falling pitch
    n = int(0.16 * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * (180 * tt - 300 * tt * tt)) * np.exp(-tt * 28) + 0.4 * M.band(M.burst(0.16, 40, 4), 300, 2500)
    g(x, t, a)


def bell(t, a=0.07):
    x = sum(M.tone((f,), 3.5, dec) * amp for f, dec, amp in ((523, 1.0, 1.0), (1046, 1.5, 0.45), (1244, 2.0, 0.3), (1568, 2.4, 0.2), (262, 0.8, 0.5)))
    g(x, t, a)


def rustle(t, d=0.5, a=0.04):
    g(M.band(M.burst(d, 6, 1), 1800, 9000), t, a)


def step(t, a=0.025):
    g(M.band(M.burst(0.05, 80, 2), 250, 3000), t, a)


# s1 hook
bell(0.05, 0.06)
squish(AT["s1:kepala"] - 0.1); squish(AT["s1:presiden"]); g(M.lib("pop"), AT["s1:presiden"], 0.03)
squish(AT["s1:Prancis"] - 0.1, 0.06); g(M.lib("chime"), AT["s1:Prancis"], 0.03)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.03)
# s2 crane up
g(M.lib("whoosh-cinematic"), K["s2"], 0.025)
squish(AT["s2:Andorra"]); squish(AT["s2:Prancis"]); squish(AT["s2:Spanyol"])
g(M.lib("sparkle"), AT["s2:dua"], 0.03); bell(AT["s2:pangeran"], 0.04)
# s3 the two princes walk in
for i in range(6):
    step(AT["s3:Uskup"] - 1.6 + i * 0.3); step(AT["s3:Presiden"] - 1.6 + i * 0.3)
bell(AT["s3:Uskup"], 0.05); g(M.lib("chime"), AT["s3:Presiden"], 0.03)
for i in range(4):
    g(M.lib("pop"), AT["s3:siapa"] + i * 0.35, 0.02)
# s4 scroll, tug, handshake, crown hops
rustle(AT["s4:1278"] - 0.3, 0.9, 0.06)
for i in range(6):
    squish(AT["s4:berebut"] - 0.3 + i * 0.25, 0.03)
g(M.thump(0.3), AT["s4:sepakat"], 0.1); squish(AT["s4:sepakat"] + 0.25, 0.05)
g(M.lib("pop"), AT["s4:Hak"], 0.03)
for k in ("s4:raja", "s4:presiden"):
    squish(AT[k] - 0.25, 0.05); g(M.lib("ping"), AT[k] + 0.3, 0.03)
# s5 book, ballots, signatures
squish(AT["s5:konstitusi"] - 0.3, 0.05); g(M.lib("chime"), AT["s5:1993"], 0.03)
v0, v1 = AT["s5:Rakyatnya"] - 0.2, AT["s5:suara"] + 0.4
for i in range(4):
    tv = v0 + i * (v1 - v0) / 4
    rustle(tv, 0.25, 0.03); g(M.lib("click-soft"), tv + 0.5, 0.04)
for t0 in (AT["s5:menandatanganinya"] + 0.2, AT["s5:Presiden"]):
    g(M.band(M.burst(1.0, 2, 1), 2500, 9000) * (0.6 + 0.4 * np.sign(np.sin(np.arange(int(SR)) / SR * 2 * np.pi * 7))), t0, 0.02)
# s6 Boris I: fanfare, war cry, calendar flips, arrest, crown falls
fan = sum(M.note(hz(m), 0.3, "saw", 2.0) for m in (67, 71, 74))
for i, m in enumerate((0, 0, 5)):
    g(np.roll(fan, 0) * 0.5, AT["s6:menobatkan"] - 0.2 + i * 0.22, 0.03)
squish(AT["s6:menobatkan"] + 0.4, 0.06)
g(M.lib("impact-bass-1"), AT["s6:perang"], 0.035); g(M.lib("glitch-1"), AT["s6:perang"], 0.01)
for i in range(8):
    rustle(AT["s6:Delapan"] + i * 0.18, 0.08, 0.035)
for i in range(10):
    step(AT["s6:Delapan"] - 0.2 + i * 0.17, 0.02)
n = int(0.9 * SR); tt = np.arange(n) / SR
tuba = np.sign(np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tt * 1.2)) / SR)) * np.exp(-tt * 1.5) * 0.6
g(M.band(tuba, 60, 1500), AT["s6:ditangkap"], 0.05)
for i in range(4):
    g(M.lib("click"), AT["s6:ditangkap"] + 0.2 + i * 0.15 * (1 - i * 0.15), 0.03)
# s7 vault
g(M.lib("pop"), AT["s7:2009"], 0.03)
g(M.lib("impact-bass-1"), AT["s7:mengancam"], 0.03); squish(AT["s7:mundur"], 0.05)
g(M.band(M.burst(0.9, 3, 2), 60, 900), AT["s7:surga"] - 0.4, 0.08); g(M.lib("sparkle"), AT["s7:surga"] + 0.3, 0.035)
g(M.thump(0.4), AT["s7:mereformasi"] + 0.4, 0.12); g(M.lib("whoosh-short"), AT["s7:mereformasi"], 0.035); g(M.lib("chime"), AT["s7:mereformasi"] + 0.6, 0.035)
# s8 wide finale
g(M.lib("whoosh-cinematic"), K["s8"] + 0.2, 0.025)
g(M.lib("sparkle"), AT["s8:dua"], 0.03); bell(AT["s8:AUDIRA"], 0.05)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
