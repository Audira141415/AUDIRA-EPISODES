"""Cek lafal VO: transkripsi Whisper, cetak teks per segmen (bukti untuk NOTES)."""
import pathlib, sys
from faster_whisper import WhisperModel

EP = pathlib.Path(__file__).resolve().parent.parent
m = WhisperModel(sys.argv[1] if len(sys.argv) > 1 else "small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(str(EP / "project/public/audio/vo.wav"), language="id")
txt = "\n".join(f"{s.start:.1f} {s.text.strip()}" for s in segs)
(EP / "audio/vo_asr.txt").write_text(txt, encoding="utf-8")
print(txt)
