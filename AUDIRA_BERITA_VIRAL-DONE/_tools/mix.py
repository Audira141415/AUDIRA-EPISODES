"""Mix VO + music bed (ducked under voice) + SFX cues, master to -14 LUFS / TP < -1 dBTP.
Usage (from the series folder): python _tools/mix.py ep01  -> studio/public/audio/<ep>/mix.wav
VO stays on top: speech ~-16 LUFS, bed ~15 dB under it while talking (memory: audio-mix-voice-on-top)."""
import sys, json, glob, subprocess, numpy as np, soundfile as sf
SR = 48000; ep = sys.argv[1]
SFXDIR = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
SFX = {"whoosh": "whoosh-cinematic.mp3", "impact": "impact-bass-1.mp3", "pop": "pop.mp3", "click": "click-soft.mp3", "riser": "riser.mp3", "glitch": "glitch-1.mp3", "ping": "ping.mp3", "chime": "chime.mp3"}
def load(p):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).reshape(-1, 2).copy()
def db(x): return 10 ** (x / 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
tl = json.load(open(f"studio/src/scenes/{ep}/timeline.json", encoding="utf-8"))
N = int(tl["total"] * SR)
fit = lambda x: np.pad(x[:N], ((0, max(0, N - len(x))), (0, 0)))
vo = fit(load(f"studio/public/audio/{ep}/vo.wav"))
bed = fit(load(f"studio/public/audio/music/{ep}-bed.wav")); bed = bed / rms(bed) * rms(vo[np.abs(vo).mean(1) > db(-40)]) * db(-13)
# sidechain-style ducking from the VO envelope (attack 60 ms, release 450 ms): -9 dB more under speech
lvl = np.abs(vo).mean(1); gate = (lvl > db(-42)).astype(np.float32)
w = int(0.05 * SR); gate = np.convolve(gate, np.ones(w) / w, mode="same") > 0.05
g = np.zeros(N, np.float32); y = 0.0; a = 1 - np.exp(-1 / (0.06 * SR)); r = 1 - np.exp(-1 / (0.45 * SR))
for i in range(N):
    tgt = 1.0 if gate[i] else 0.0; y += (tgt - y) * (a if tgt > y else r); g[i] = y
outro = tl["sections"]["OUTRO"][1]
lift = np.clip((np.arange(N) / SR - outro) / 0.8, 0, 1) * 4.0  # music swells +4 dB under the AUDIRA card
bed *= (db(-9) ** g * db(lift))[:, None]
sfx = np.zeros((N, 2), np.float32)
cues_p = glob.glob(f"EP{ep[2:]}_*/audio/sfx-cues.json")
cues = json.load(open(cues_p[0], encoding="utf-8")) if cues_p else []
cache = {}
for c in cues:
    k = c.get("type", "whoosh"); fn = SFX.get(k)
    if not fn: continue
    if k not in cache: s = load(SFXDIR + fn); cache[k] = s / max(1e-6, np.abs(s).max())
    s = cache[k]; i = int(float(c["t"]) * SR); e = min(N, i + len(s))
    if 0 <= i < N: sfx[i:e] += s[: e - i] * float(c.get("gain", 0.5)) * db(-24)
mix = vo + bed + sfx
sf.write(f"studio/public/audio/{ep}/mix-pre.wav", mix, SR)
# two-pass loudnorm to -14 LUFS, TP -1.5, then hard limiter (level=disabled to avoid auto-gain)
src = f"studio/public/audio/{ep}/mix-pre.wav"
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rfind("{"): m.rfind("}") + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,"
      f"alimiter=limit=0.85:level=disabled")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", "48000", f"studio/public/audio/{ep}/mix.wav"], check=True)
q = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"studio/public/audio/{ep}/mix.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = q[q.rfind("I:"):].split()[1]; TP = q[q.rfind("Peak:"):].split()[1]
print(f"{ep}: {len(cues)} sfx cues, mix I={I} LUFS, TP={TP} dBTP")
