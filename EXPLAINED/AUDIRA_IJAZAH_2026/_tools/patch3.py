"""Paper-trail camera: hold each prop until just before the next year is spoken. Run from AUDIRA_IJAZAH_2026."""
from pathlib import Path

F = Path("EP01_SELEMBAR_KERTAS/world3d.js")
s = F.read_text(encoding="utf8")
old = [
    '    [AT["s4:2019"] + 0.2, 183, 9, 50, 183, 5.8, 0],\n',
    '    [AT["s4:2022"] + 0.3, 213, 9, 50, 213, 5.8, 0],\n',
    '    [AT["s4:2025"] + 0.3, 243, 9, 50, 243, 5.8, 0],\n',
]
new = [
    '    [AT["s4:2019"] + 0.05, 182.4, 9, 51, 182.4, 5.8, 0],\n    [AT["s4:2022"] - 0.45, 183.8, 9, 49.5, 183.8, 5.8, 0],\n',
    '    [AT["s4:2022"] + 0.25, 212.4, 9, 51, 212.4, 5.8, 0],\n    [AT["s4:2025"] - 0.4, 213.8, 9, 49.5, 213.8, 5.8, 0],\n',
    '    [AT["s4:2025"] + 0.3, 243, 9, 50, 243, 5.8, 0],\n',
]
for a, b in zip(old, new):
    if a not in s:
        raise SystemExit("MISSING " + a)
    s = s.replace(a, b)
F.write_text(s, encoding="utf8")
print("patched")
