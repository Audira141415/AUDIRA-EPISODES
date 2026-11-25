import sys, json, os
from faster_whisper import WhisperModel
m = WhisperModel("F:/hf-cache/manual/fw-medium", device="cuda", compute_type="float16")
for src, tag in [a.split("::") for a in sys.argv[1:]]:
    segs, info = m.transcribe(src, language="id", word_timestamps=True, vad_filter=True, beam_size=5)
    out=[]
    for s in segs:
        out.append({"start":s.start,"end":s.end,"text":s.text.strip(),"words":[{"w":w.word,"s":w.start,"e":w.end} for w in s.words]})
    d=os.path.dirname(os.path.abspath(__file__))
    json.dump(out, open(f"{d}/{tag}.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{d}/{tag}.txt","w",encoding="utf-8").write("\n".join(f"[{s['start']:.1f}-{s['end']:.1f}] {s['text']}" for s in out))
    print("done", tag, flush=True)
