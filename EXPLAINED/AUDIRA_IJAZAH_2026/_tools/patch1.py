"""First art pass after the contact sheet: framing and overlap fixes. Run from AUDIRA_IJAZAH_2026."""
from pathlib import Path

F = Path("EP01_SELEMBAR_KERTAS/world3d.js")
s = F.read_text(encoding="utf8")


def sub(a, b):
    global s
    if a not in s:
        raise SystemExit("MISSING: " + a[:70])
    s = s.replace(a, b)


# Sheets run past the frame in depth so no kraft band shows under the captions.
sub('D: [0xf4eedf, 72, 66, -0.02]', 'D: [0xf4eedf, 60, 66, -0.02]')
sub('const s = card(w, d, paper(c), cx, 0.08, 0, scene, 0.16);', 'const s = card(w, 170, paper(c), cx, 0.08, 10, scene, 0.16);')

# Courtroom: judges sit above the bench; audience is smaller and lower so the witness stays visible.
sub('j.G.position.y = 0; });', 'j.G.position.y = 2.8; });')
sub('figure(row % 2 ? 0x3a2f27 : 0x4a3c30, 0.9 + row * 0.08, -19 + i * 4.8 + (row % 2) * 2.2 + rnd() * 0.7, 14 + row * 3.4, A)', 'figure(row % 2 ? 0x3a2f27 : 0x4a3c30, 0.5 + row * 0.04, -19 + i * 4.8 + (row % 2) * 2.2 + rnd() * 0.7, 13 + row * 3, A)')
sub('held.position.y = 3.4 + up * 9.4;', 'held.position.y = 3.4 + up * 7.2;')
sub('f.G.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.22', 'f.G.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.16')

# Security crew scattered instead of strung along a spiral.
sub('const th = (i * 2.399963) % 6.2832, rad = a + (b - a) * ((i * 0.618034) % 1);', 'const th = rnd() * 6.2832, rad = a + (b - a) * rnd();')

# Paper trail: smaller props and side flags so nothing collides with the panel or caption.
sub('const y = face(9, 4, label(year, "#f7f1e2", "#1e1b18", "bold 170px Georgia"), x, 0, 7, C); pop(y, at, 0.5); return y;', 'const y = face(4.4, 2.2, label(year, "#f7f1e2", "#1e1b18", "bold 88px Georgia"), x - 6.6, 0, 3, C); pop(y, at, 0.5); return y;')
sub('card(8.4, 15, paper(0x24282c), 0, 7.5, 0, phone, 0.5);', 'card(5.6, 10, paper(0x24282c), 0, 5, 0, phone, 0.4);')
sub('new THREE.PlaneGeometry(7.4, 13.4), printed(444, 804,', 'new THREE.PlaneGeometry(5, 9), printed(444, 804,')
sub('scr.position.set(0, 7.6, 0.27);', 'scr.position.set(0, 5.05, 0.22);')
sub('card(13, 12, paper(0xd9a441), 0, 6, 0, folder, 0.5);', 'card(10.4, 8.6, paper(0xd9a441), 0, 4.3, 0, folder, 0.5);')
sub('card(5, 1.4, paper(0xd9a441), -3.8, 12.5, 0, folder, 0.5);', 'card(4, 1.1, paper(0xd9a441), -3.2, 9.1, 0, folder, 0.5);')
sub('new THREE.PlaneGeometry(11, 3.2), printed(660, 192, label("GUGATAN"', 'new THREE.PlaneGeometry(9, 2.6), printed(660, 192, label("GUGATAN"')
sub('ft.position.set(0, 8.6, 0.27);', 'ft.position.set(0, 6.3, 0.27);')
sub('new THREE.PlaneGeometry(10, 3.2), new THREE.MeshBasicMaterial({ map: canvasTex(620, 200,', 'new THREE.PlaneGeometry(8.2, 2.65), new THREE.MeshBasicMaterial({ map: canvasTex(620, 200,')
sub('stampG.position.set(35, 4, 0.32);', 'stampG.position.set(35, 3, 0.32);')
sub('const dcf = face(11, 15, blankDoc("1985"), 0, 0, 0, docC);', 'const dcf = face(7.6, 10, blankDoc("1985"), 0, 0, 0, docC);')
sub('lens.position.set(70 + Math.sin(t * 1.4) * 2.4 - 6, 8.6 + Math.cos(t * 1.1) * 1.3, 3);', 'lens.position.set(65 + Math.sin(t * 1.4) * 1.5, 5.8 + Math.cos(t * 1.1) * 1, 2.6);')
sub('lens.scale.setScalar(eout((t - AT["s4:2025"]) / 0.4));', 'lens.scale.setScalar(Math.max(0.001, 0.62 * eout((t - AT["s4:2025"]) / 0.4)));')

# Type timeline: only 1932 and 1985, both inside the frame. 1992 is not part of the script.
sub('const rulerX = (y) => -13.5 + (y - 1932) * 0.46;', 'const rulerX = (y) => -10.4 + (y - 1932) * 0.39;')
sub('rulerX(y), 0, 8.4 + zOff, D); return f; };', 'rulerX(y), 0, 6 + zOff, D); return f; };')
sub('const t32 = tick(1932, 0), t85 = tick(1985, -0.4), t92 = tick(1992, 2.6); t92.position.x += 1.6;', 'tick(1932, 0); tick(1985, 0);')
sub('bar.scale.x = Math.max(0.001, 36 * 0.87 * ramp(', 'bar.scale.x = Math.max(0.001, (rulerX(1985) - rulerX(1932)) * ramp(')

# Light table: everything fits the portrait frame. Red circle lands on the signature mark of the thesis.
sub('g.fillStyle = "#c8321f"; g.font = `bold ${w * 0.062}px Arial`; g.fillText("ILUSTRASI", w * 0.34, h * 0.83);', 'g.fillStyle = "#c8321f"; g.font = `bold ${w * 0.062}px Arial`; g.fillText("ILUSTRASI", w * 0.34, h * 0.83);\n    g.strokeStyle = "#1e1b18"; g.lineWidth = w * 0.01; g.beginPath(); g.moveTo(w * 0.63, h * 0.81); g.bezierCurveTo(w * 0.68, h * 0.72, w * 0.72, h * 0.88, w * 0.76, h * 0.78); g.bezierCurveTo(w * 0.78, h * 0.75, w * 0.8, h * 0.82, w * 0.84, h * 0.79); g.stroke();')
sub('const mainDoc = flat(11, 15, "UJI", 0, 0);', 'flat(8, 11, "UJI", 0, 0);')
sub('const cmp = [flat(8, 11, "A", -32, -6), flat(8, 11, "B", 32, -6), flat(8, 11, "C", 0, -40)];', 'const cmp = [flat(6, 8.4, "A", -40, -3), flat(6, 8.4, "B", 40, -3), flat(6, 8.4, "C", 40, 8)];')
sub('const cmpTo = [[-15, -4], [15, -4], [15, 8]];', 'const cmpTo = [[-8.4, -3], [8.4, -3], [8.4, 6.6]];')
sub('new THREE.BoxGeometry(12.5, 0.12, 0.3)', 'new THREE.BoxGeometry(8.8, 0.12, 0.3)')
sub('new THREE.PlaneGeometry(12.2, 16.2)', 'new THREE.PlaneGeometry(9, 12)')
sub('const skripsi = flat(11, 14, "SKRIPSI", -15, 28);', 'const skripsi = flat(6.6, 8.8, "SKRIPSI", -8.4, 34); skripsi.position.y = 2.15;')
sub('new THREE.TorusGeometry(2.3, 0.2, 8, 80)', 'new THREE.TorusGeometry(1.35, 0.11, 8, 80)')
sub('circle.position.set(-11.8, 2.2, 5.5);', 'circle.position.set(-6.95, 2.4, 9.3);')
sub('scan.position.z = -7.5 + 15 * sc;', 'scan.position.z = -5.5 + 11 * sc;')
sub('const sx = [-40, 40, 40][i], sz = [-6, -6, 30][i];', 'const sx = [-40, 40, 40][i], sz = [-3, -3, 8][i];')
sub('skripsi.position.z = 34 - 24 * sk; skripsi.position.x = -15;', 'skripsi.position.z = 34 - 27.4 * sk;')

# Name tags fit the frame; the two defendants carry a red rule.
sub('const tag = (name, x, z, col = "#1e1b18", bg = "#f3ecdc") => {', 'const tag = (name, x, z, rule = false, col = "#1e1b18", bg = "#f3ecdc") => {')
sub('const f = face(10.4, 5, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h);', 'const f = face(8.4, 4.2, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); if (rule) { g.fillStyle = "#c8321f"; g.fillRect(0, h - 24, w, 24); }')
sub('g.font = `bold ${name.length > 12 ? 62 : 74}px Georgia`;', 'g.font = `bold ${name.length > 12 ? 54 : 62}px Georgia`;')
sub('const back3 = [tag("Rizal Fadillah", -11.6, -8), tag("Rustam Effendi", 0, -8), tag("Kurnia Tri R.", 11.6, -8)];', 'const back3 = [tag("Rizal Fadillah", -9.2, -8), tag("Rustam Effendi", 0, -8), tag("Kurnia Tri R.", 9.2, -8)];')
sub('const mid3 = [tag("Rismon S.", -11.6, 2), tag("Eggi Sudjana", 0, 2), tag("Damai H. Lubis", 11.6, 2)];', 'const mid3 = [tag("Rismon S.", -9.2, 2), tag("Eggi Sudjana", 0, 2), tag("Damai H. Lubis", 9.2, 2)];')
sub('const front2 = [tag("Roy Suryo", -6.2, 13), tag("Dokter Tifa", 6.2, 13)];', 'const front2 = [tag("Roy Suryo", -4.9, 13, true), tag("Dokter Tifa", 4.9, 13, true)];')
sub('m.G.scale.setScalar(1 + 0.2 * rise);', 'm.G.scale.setScalar(1 + 0.12 * rise);')
sub('    const fold = ramp(t, AT["s7:berdamai"] - 0.1, AT["s7:berdamai"] + 0.55);\n', '')
sub('    void fold;\n', '')

# Scale: shorter beam so both pans stay inside the frame.
sub('new THREE.BoxGeometry(25, 0.56, 0.56)', 'new THREE.BoxGeometry(20, 0.56, 0.56)')
sub('P.position.set(s * 12, 0, 0);', 'P.position.set(s * 9.6, 0, 0);')
sub('const f = face(5.6, 2.6, label(t, "#1e1b18", "#f3ecdc", "bold 58px Georgia"), 0, -8.4, 0, P);', 'const f = face(6.2, 2.4, label(t, "#1e1b18", "#f3ecdc", "bold 58px Georgia"), 0, -8.4, 0, P);')

# Camera.
sub('[0, 0, 9, 54, 0, 7.8, 0],', '[0, 0, 19, 54, 0, 8.3, 0],')
sub('[K.s1e - 0.2, 0.6, 9.5, 57, 0.2, 7.6, 0],', '[K.s1e - 0.2, 0.6, 19, 58, 0.2, 8.4, 0],')
sub('[K.s2 + 0.8, 7.2, 6.2, 32, 7.2, 3.4, 0],', '[K.s2 + 0.8, 8, 13, 27, 8.6, 4, 0],')
sub('[K.s2e - 0.1, 8.4, 6.8, 29, 8.1, 3.6, 0],', '[K.s2e - 0.1, 9.2, 13, 24, 9, 4, 0],')
sub('[AT["s4:2019"] + 0.2, 185, 10, 46, 185, 7.6, 0],', '[AT["s4:2019"] + 0.2, 183, 9, 50, 183, 5.8, 0],')
sub('[AT["s4:2022"] + 0.3, 215, 10, 44, 215, 7.2, 0],', '[AT["s4:2022"] + 0.3, 213, 9, 50, 213, 5.8, 0],')
sub('[AT["s4:2025"] + 0.3, 245, 10, 44, 245, 7.6, 0],', '[AT["s4:2025"] + 0.3, 243, 9, 50, 243, 5.8, 0],')
sub('[K.s4e, 250, 11, 48, 247, 8, 0],', '[K.s4e, 246, 10, 53, 244, 5.8, 0],')
sub('[K.s6 + 0.9, 390, 52, 44, 390, -2, -2],', '[K.s6 + 0.9, 390, 52, 44, 390, -1, 1],')
sub('[AT["s6:Roy"] - 0.2, 392, 46, 36, 391, -1, 0],', '[AT["s6:Roy"] - 0.2, 390, 48, 40, 390, -1, 1],')
sub('[K.s6e, 384, 36, 40, 382, 1, 6],', '[K.s6e, 386, 38, 42, 385, -1, 3],')
sub('[K.s7e, 480, 19, 66, 480, 7.2, 4],', '[K.s7e, 480, 19, 74, 480, 7.4, 4],')
sub('[K.dur, 660, 12, 78, 660, 11, 0],', '[K.dur, 660, 13, 82, 660, 11, 0],')
F.write_text(s, encoding="utf8")

B = Path("EP01_SELEMBAR_KERTAS/build-video.mjs")
b = B.read_text(encoding="utf8")
a = 'font-family:Archivo,sans-serif;font-weight:800;'
if a not in b:
    raise SystemExit("MISSING caption font")
B.write_text(b.replace(a, 'font-family:"Archivo Black",sans-serif;font-weight:400;'), encoding="utf8")
print("patched")
