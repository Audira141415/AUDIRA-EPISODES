"""One-off fixes after reviewing frames from the rendered previews. Run from AUDIRA_AI_MOTION_VIRAL."""
from pathlib import Path
def patch(f, reps):
    p = Path(f); s = p.read_text(encoding="utf8")
    for a, b in reps:
        assert a in s, a
        s = s.replace(a, b)
    p.write_text(s, encoding="utf8")
# The glossy floor showed a grey hotspot in the rear shot.
patch("EP03_MOBIL_TRANSFORM/world3d.js", [("color: 0x0C0C0F, roughness: .46, metalness: .2,", "color: 0x0C0C0F, roughness: .72, metalness: 0,")])
# The picture frame threw a hood-shaped shadow onto the cat's head.
patch("EP04_HEWAN_BICARA/world3d.js", [("m.position.set(x, y, 0); m.castShadow = true; p.add(m); return m; };\n  bar(", "m.position.set(x, y, 0); p.add(m); return m; };\n  bar(")])
