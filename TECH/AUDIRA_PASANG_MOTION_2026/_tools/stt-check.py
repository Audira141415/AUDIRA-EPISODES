"""Transcribes each VO_MASTER.wav with faster-whisper and writes PROJECT/qc/stt.txt, as an automatic listen for wrong or dropped words. Model files stay on F:. Run from AUDIRA_AI_MOTION_VIRAL."""
import os
from pathlib import Path
os.environ["HF_HOME"] = "F:/hf-cache"
from faster_whisper import WhisperModel

m = WhisperModel("base", device="cpu", compute_type="int8", download_root="F:/hf-cache")
for d in sorted(Path(".").glob("EP0*")):
    seg, _ = m.transcribe(str(d / "AUDIO/VO_MASTER.wav"), language="id", beam_size=1, vad_filter=True)
    t = " ".join(s.text.strip() for s in seg)
    (d / "PROJECT/qc/stt.txt").write_text(t, encoding="utf8")
    print("==", d.name, len(t.split()), "words\n", t, flush=True)
