"""Second art pass: camera without overshoot, separated rows, label fit. Run from AUDIRA_IJAZAH_2026."""
from pathlib import Path

F = Path("EP01_SELEMBAR_KERTAS/world3d.js")
s = F.read_text(encoding="utf8")


def sub(a, b):
    global s
    if a not in s:
        raise SystemExit("MISSING: " + a[:70])
    s = s.replace(a, b)


# Catmull-Rom tangents overshoot on the long moves between stations. Eased segments stay on target; keys inside a station differ enough to keep moving.
sub('import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage } from "./lib3d.js";', 'import { mulberry, ramp, eout, back, smooth, canvasTex, stage } from "./lib3d.js";')
sub('const camT = track([', 'const camT = glide([')
sub('export function create(canvas, K, AT) {', '''function glide(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1][0] < t) i++;
    const a = keys[i], b = keys[i + 1], u = (t - a[0]) / (b[0] - a[0]);
    const k = b[1] === a[1] || Math.abs(b[1] - a[1]) < 12 ? Math.min(1, Math.max(0, u)) : smooth(u);
    return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k);
  };
}

export function create(canvas, K, AT) {''')

# Type ruler seen from higher so the marker clears the year cards.
sub('[K.s5 + 0.8, 297, 13, 74, 300, 8.8, 0],', '[K.s5 + 0.8, 298, 23, 74, 300, 8.6, 0],')
sub('[K.s5e - 0.2, 300, 15, 80, 300, 8.4, 0],', '[K.s5e - 0.2, 301, 23, 80, 300, 8.2, 0],')
sub('mark.position.set(rulerX(1985), 1.8, 12);', 'mark.position.set(rulerX(1985), 1.5, 13);')

# Name tags: higher angle so three rows read separately.
sub('[K.s7 + 0.9, 480, 22, 86, 480, 8.2, 0],', '[K.s7 + 0.9, 480, 40, 82, 480, 6.5, 1],')
sub('[K.s7e, 480, 19, 74, 480, 7.4, 4],', '[K.s7e, 480, 36, 76, 480, 6.5, 3],')

# Scale: the raised sheet stays under the panel, in front of the post.
sub('bold 58px Georgia"), 0, -8.4, 0, P);', 'bold 50px Georgia"), 0, -8.4, 0, P);')
sub('const floatDoc = face(6.6, 9, blankDoc("S1"), 0, 22, -3, H);', 'const floatDoc = face(5, 6.8, blankDoc("S1"), 0, 6, 3, H);')
sub('floatDoc.position.y = 12 + 10.5 * fu + Math.sin(t) * 0.12;', 'floatDoc.position.y = 3 + 6.5 * fu + Math.sin(t) * 0.1;')
F.write_text(s, encoding="utf8")
print("patched")
