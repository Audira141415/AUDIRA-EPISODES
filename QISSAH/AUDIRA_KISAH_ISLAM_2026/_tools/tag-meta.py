"""Writes AUDIRA ownership metadata into each FINAL_VIDEO.mp4 (streams copied). Run from AUDIRA_KISAH_ISLAM_2026: python _tools/tag-meta.py [EP folders]"""
import os, subprocess, sys
sys.path.insert(0, "_tools")
from epdata import EPS
from epdata2 import EPS as E2
from epdata3 import EPS as E3
from epdata4 import EPS as E4
from epdata5 import EPS as E5
from epdata6 import EPS as E6
from epdata7 import EPS as E7
EPS = {**EPS, **E2, **E3, **E4, **E5, **E6, **E7}
for name in sys.argv[1:] or list(EPS):
    E = EPS[name]; src = f"{name}/FINAL_VIDEO.mp4"; tmp = f"{name}/_tag.mp4"
    slug = name.split("_", 1)[1].lower().replace("_", "-")
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-c", "copy", "-map_metadata", "-1",
        "-metadata", f"title={E['yt_title']}", "-metadata", "artist=AUDIRA (Agus Dwi R.)",
        "-metadata", "copyright=© 2026 AUDIRA - Agus Dwi R. All rights reserved.",
        "-metadata", f"comment=AUDIRA-kisah-islam-{slug}-EP{E['n']} | audira.my.id", "-metadata", "date=2026-11-07",
        "-movflags", "+faststart+use_metadata_tags", tmp])
    if r.returncode == 0:
        os.replace(tmp, src)
    print(name, subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format_tags=comment", "-of", "csv=p=0", src], capture_output=True, text=True, encoding="utf8").stdout.strip())
