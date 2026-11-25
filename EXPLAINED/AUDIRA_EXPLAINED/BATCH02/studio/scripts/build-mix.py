# Mix: VO on top, felt-piano bed ducked under speech, rain, scissors, clock tick, door bell.
# In: public/audio/vo.wav, music/seed.wav, timeline.json. Out: public/audio/mix.wav (48 kHz stereo).
import json, subprocess, numpy as np, soundfile as sf
SR = 48000
SFX = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
def load(path):
    p = subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","2","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(p,dtype=np.float32).reshape(-1,2).copy()
def db(x): return 10**(x/20)
tl = json.load(open("src/scenes/barber/timeline.json"))
T = {c["id"]:c["start"] for c in tl["clips"]}; E = {c["id"]:c["end"] for c in tl["clips"]}
vo = load("public/audio/vo.wav"); N = int(tl["total"]*SR); vo = np.pad(vo[:N],((0,max(0,N-len(vo))),(0,0)))
env = lambda pts: np.interp(np.arange(N)/SR,[p[0] for p in pts],[p[1] for p in pts])
# music: equal-power crossfaded loop of the seed
seed = load("public/audio/music/seed.wav"); seed = seed/ max(1e-6,np.sqrt(np.mean(seed**2)))*db(-24)
X = 4*SR; hop = len(seed)-X; m = np.zeros((N+len(seed),2)); fade = np.sqrt(np.linspace(0,1,X))[:,None]
for k in range(0,N,hop):
    c = seed.copy(); c[:X]*=fade; c[-X:]*=fade[::-1]; m[k:k+len(c)] += c
m = m[:N]
# duck under speech from the VO envelope (attack 60 ms, release 500 ms)
level = np.abs(vo).mean(1); gate = (level>db(-45)).astype(float); g = np.zeros(N); y=0.0
a,r = 1-np.exp(-1/(.06*SR)),1-np.exp(-1/(.5*SR))
for i in range(N):
    y += (gate[i]-y)*(a if gate[i]>y else r); g[i]=y
total = tl["total"]
music_env = env([(0,0),(2.5,.9),(T["s6c"],1),(tl["voEnd"],1.25),(total-2.5,1.25),(total,0)])*(1-g*0.62)
m = m*(music_env*db(-3))[:,None]
# rain: pink noise, band-limited; loud outside, muffled level inside by shot time
subprocess.run(["ffmpeg","-y","-v","error","-f","lavfi","-i",f"anoisesrc=d={total+1}:c=pink:r={SR}:a=0.6:seed=7","-af","highpass=f=500,lowpass=f=9000","-ac","2","public/audio/music/rain.wav"],check=True)
rain = load("public/audio/music/rain.wav")[:N]; rain = rain/np.sqrt(np.mean(rain**2))
rain_env = env([(0,-70),(1.5,-34),(T["s2a"]-.3,-34),(T["s2a"],-46),(E["s5c"],-46),(E["s5c"]+.5,-36),(T["s6c"]+2,-36),(T["s6d"],-70),(total,-70)])
rain = rain*(10**(rain_env/20))[:,None]
sfx = np.zeros((N,2))
def put(buf,t,vol):
    i=int(t*SR); e=min(N,i+len(buf)); sfx[i:e]+=buf[:e-i]*vol
snip = load(SFX+"click-soft.mp3")[:int(.12*SR)]; snip=snip/np.abs(snip).max()
for a0,b0 in [(E["s2b"],T["s3a"]),(E["s3d"]-3.6,T["s4b"]),(E["s4d"]+.3,T["s5b"]+5)]:
    t=a0
    while t<b0:
        put(snip,t,db(-30)); put(snip,t+.17,db(-34)); t+=1.14
tick = load(SFX+"click.mp3")[:int(.08*SR)]; tick=tick/np.abs(tick).max()
t=int(E["s5b"]);
while t<T["s5c"]+.5: put(tick,t,db(-28)); t+=1
chime = load(SFX+"chime.mp3"); chime=chime/np.abs(chime).max(); put(chime,T["s6c"]+3.6,db(-30))
mix = vo+m+rain+sfx
print("peak",np.abs(mix).max())
sf.write("public/audio/mix.wav",mix/max(1,np.abs(mix).max()/.95),SR,subtype="PCM_16")
