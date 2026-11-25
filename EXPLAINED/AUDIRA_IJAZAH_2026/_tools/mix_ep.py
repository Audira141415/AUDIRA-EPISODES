"""Music + SFX for EP05-EP09. Each episode gets its own harmony, timbre and tempo; cues key to spoken words.
Run from the episode folder: python ../_tools/mix_ep.py ep05   (writes AUDIO/mix.wav)"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from audio_lib import Mix, stereo
from scorelib import paper, murmur

EP = sys.argv[1]
M = Mix({"ep05": 505, "ep06": 606, "ep07": 707, "ep08": 808, "ep09": 909, "ep10": 1010, "ep11": 1111, "ep12": 1212}[EP])
DUR, rng, g, w = M.DUR, M.rng, M.put, M.word
END = M.TL["speech_end"]
K = {s["id"]: s["start"] for s in M.TL["scenes"]}
hz = lambda d, base=110.0: base * 2 ** (d / 12)

# (bpm, chord roots/intervals, arpeggio, lead timbre, bed timbre, bed band)
STYLE = {
    "ep05": (84, [(0, 3, 7), (-4, 0, 3), (-2, 2, 5), (-5, -1, 2)], [12, 15, 19, 22, 19, 15], "pluck", "tri", (90, 1600)),   # cold minor, phone glass
    "ep06": (72, [(0, 4, 7), (-3, 0, 4), (-7, -3, 0), (-5, -1, 2)], [12, 16, 19, 16], "tri", "saw", (60, 900)),           # measured, legal
    "ep07": (96, [(0, 5, 9), (2, 5, 9), (-3, 0, 4), (-1, 2, 5)], [12, 17, 21, 24, 21, 17, 12, 9], "pluck", "tri", (80, 1400)),  # procession
    "ep08": (78, [(0, 3, 7), (5, 8, 12), (3, 7, 10), (-2, 2, 5)], [7, 12, 15, 12], "sine", "saw", (70, 1100)),            # map, travel
    "ep09": (100, [(0, 4, 7), (-2, 2, 5), (-5, -1, 2), (-7, -3, 0)], [12, 19, 24, 19], "square", "tri", (80, 1300)),     # clock, countdown
    "ep10": (68, [(0, 3, 7), (-4, -1, 3), (-7, -4, 0), (-5, -2, 2)], [12, 15, 19, 15], "sine", "saw", (60, 1000)),        # grave, institutional
    "ep11": (92, [(0, 3, 6), (-1, 2, 6), (-3, 0, 3), (-2, 1, 5)], [12, 18, 15, 12, 18, 21], "pluck", "saw", (70, 1200)),  # tense, surveillance
    "ep12": (88, [(0, 4, 7), (-3, 0, 4), (-5, -1, 2), (2, 5, 9)], [12, 16, 19, 24, 19, 16], "tri", "tri", (90, 1500)),    # street, social media
}[EP]
bpm, prog, arp, lead, bedk, (lo, hi) = STYLE
beat = 60 / bpm
bed, top = M.mono(), M.mono()
for b in range(0, int(DUR / beat), 8):
    for d in prog[(b // 8) % len(prog)]:
        M.lay(bed, M.note(hz(d), beat * 8.3, bedk, 0.12, 0.8), b * beat, 0.3)
for b in range(int(END / beat)):
    c = prog[(b // 8) % len(prog)]
    M.lay(top, M.note(hz(arp[b % len(arp)] + c[0]), 0.9, lead, 3.0), b * beat, 0.3 if lead == "square" else 0.4)
if EP == "ep09":  # ticking clock under the countdown
    for b in range(int(END / (beat / 2))):
        M.lay(top, M.burst(0.012, 400, 1), b * beat / 2, 0.12)
bed = M.band(bed, lo, hi)
ids = list(K)
mid = K[ids[len(ids) // 2]]
be = M.env([(0, .6), (mid, .95), (K[ids[-1]], .7), (END, .4), (DUR - .5, 0), (DUR, 0)])
te = M.env([(0, .7), (mid, .55), (K[ids[-1]], .45), (END, .35), (DUR - .4, 0), (DUR, 0)])
music = stereo(.6 * bed * be + .5 * top * te, .16 * bed * be + .1 * top * te)

for s in ids[1:]:
    g(paper(rng, .3, 12), K[s] - .2, .12)
g(M.lib("whoosh-short"), 0.05, .05)


def at(sc, word, n=0):
    try:
        return w(sc, word, n)
    except (IndexError, StopIteration):
        print("no cue word", sc, word)
        return None


def cue(name, sc, word, gain, off=0.0, n=0):
    t = at(sc, word, n)
    if t is not None:
        g(name if not isinstance(name, str) else M.lib(name), t + off, gain)


if EP == "ep05":
    for i in range(6):
        cue("pop", "s1", "Fotonya", .03, i * .08)
    g(murmur(M, 2.5, .05), K["s1"] + 2.2, 1)
    cue("click-soft", "s2", "15", .06)
    cue(M.thump(.3), "s2", "Ia", .1)
    cue("click-soft", "s3", "22", .06)
    cue("ping", "s3", "Gambar", .04)
    cue("click", "s4", "Ia", .07)
    cue(M.thump(.4), "s6", "menyela", .12)
    cue("whoosh", "s6", "keluar", .05)
    for word in ("akun", "Dian", "publik"):
        cue("click", "s7", word, .07)
    cue(M.thump(.35), "s8", "Mei", .1)
elif EP == "ep06":
    cue(M.thump(.45), "s1", "Bukan", .14)
    cue("click", "s1", "surat", .07)
    for word in ("30", "Tujuh"):
        cue("click-soft", "s1b", word, .06)
    for word in ("fitnah", "pencemaran", "ITE"):
        cue(M.thump(.25), "s2", word, .08)
    for word in ("433", "434", "32", "35"):
        cue("click", "s3", word, .06)
    cue(M.thump(.4), "s4", "mengabulkan", .11)
    cue(M.thump(.3), "s5", "mengabulkan", .09)
    cue(M.thump(.45), "s6", "Dakwaan", .12)
elif EP == "ep07":
    g(murmur(M, 3.5, .06), 0.3, 1)
    cue(M.thump(.4), "s1", "26", .1)
    for word in ("Lechumanan", "Kedua", "Di"):
        sc = {"Lechumanan": "s3", "Kedua": "s5", "Di": "s6"}[word]
        cue("whoosh-short", sc, word, .05, -.15)
    for i in range(5):
        cue(M.thump(.22), "s4", "lima", .07, i * .13)
    cue("click", "s5", "tujuh", .07)
    cue("ping", "s7", "1977", .05)
    cue(M.thump(.35), "s7b", "menolak", .1)
elif EP == "ep08":
    cue("whoosh-cinematic", "s1", "Ada", .05, -.3)
    for sc, word in (("s2", "menolak"), ("s3", "menolak"), ("s4", "menolak")):
        cue(M.thump(.42), sc, word, .12)
    cue("click-soft", "s4b", "enam", .06)
    cue("click-soft", "s4b", "empat", .06)
    cue("chime", "s4b", "amnesti", .04)
    for word in ("2005", "2019"):
        cue(M.thump(.22), "s5", word, .08)
    cue(M.thump(.35), "s6", "terbuka", .1)
    cue("ping", "s7", "11", .05)
elif EP == "ep09":
    cue(M.thump(.45), "s1", "11", .13)
    cue(M.thump(.3), "s1b", "menunjukkan", .1)
    for word in ("Syarif", "Dian", "Dumatno"):
        cue("click", "s2", word, .07)
    cue("click-soft", "s3", "izinnya", .07)
    cue(M.thump(.3), "s4", "putusan", .09)
    cue(M.thump(.38), "s5", "belum", .1)
    for word in ("siapa", "bukti", "apakah"):
        cue("click", "s7", word, .07)
elif EP == "ep10":
    cue(M.thump(.42), "s1", "membatalkan", .12)
    cue("click-soft", "s2", "setara", .06)
    cue("click", "s3", "Bukan", .07)
    cue("click", "s3", "bukan", .07, n=0)
    cue(M.thump(.45), "s4", "batal", .13)
    cue(M.thump(.3), "s5", "tidak", .09)
    for word in ("DPR", "Mahkamah", "MPR"):
        cue("click", "s7", word, .07)
    cue("ping", "s8", "sepuluh", .05)
elif EP == "ep11":
    cue("glitch-1", "s1", "disadap", .05)
    for word in ("Listyo", "Ahrie", "Eko", "Slamet"):
        cue("click", "s2", word, .07)
    cue("glitch-2", "s3", "tanpa", .05)
    cue(M.thump(.38), "s4", "menghapus", .11)
    cue(M.thump(.45), "s5", "makar", .12)
    cue("click-soft", "s6", "enam", .06)
    for word in ("belum", "bukan", "tidak"):
        cue("click", "s7", word, .07)
    for word in ("motif", "isi", "siapa"):
        cue("click-soft", "s9", word, .06)
elif EP == "ep12":
    cue(M.thump(.45), "s1", "turunkan", .13)
    cue(M.thump(.3), "s2", "lantai", .1)
    cue("click-soft", "s3", "belum", .06)
    cue("whoosh-short", "s4", "merembet", .05)
    cue("click", "s5", "mencopot", .07)
    cue("pop", "s6", "boikot", .06)
    cue("glitch-3", "s7", "AI", .06)
    cue(M.thump(.4), "s7", "hoaks", .12)
    cue(M.thump(.35), "s8", "hoaks", .11)
g(M.lib("chime"), END + .55, .05)

os.makedirs("AUDIO/work", exist_ok=True)
_orig = Mix.save
Mix.save = staticmethod(lambda path, a: _orig("AUDIO/mix.wav" if path.endswith("mix.wav") else path, a))
M.finish(music)
print(EP, "duration", DUR)
