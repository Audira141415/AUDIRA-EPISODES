"""One-off look fixes after reviewing EP01 and EP02 sheets. Run from AUDIRA_AI_MOTION_VIRAL."""
from pathlib import Path
def patch(f, reps):
    p = Path(f); s = p.read_text(encoding="utf8")
    for a, b in reps:
        assert a in s, a
        s = s.replace(a, b)
    p.write_text(s, encoding="utf8")
patch("EP01_SATU_FOTO/world3d.js", [
 ("const pm = paper(PERSON, 1.5, 2.5, 256, 512); person.add(pm);", "const pm = paper(PERSON, 1.5, 2.5, 256, 512); pm.castShadow = false; person.add(pm);"),
 ("c.position.set(x, y, hingeZ + .35); scene.add(c);", "c.castShadow = false; c.position.set(x, y, hingeZ + .35); scene.add(c);"),
 ("scarf.castShadow = true;", "scarf.castShadow = false;"),
])
patch("EP02_MOTION_TRANSFER/world3d.js", [
 ("bloom: [.42, .55, .82]", "bloom: [.26, .45, .92]"),
 ("new THREE.SpotLight(0xFFFFFF, 520, 50", "new THREE.SpotLight(0xFFFFFF, 210, 50"),
 ("scene.environmentIntensity = .9;", "scene.environmentIntensity = .42;"),
 ("body = std(0xF2E7D5, .34, .12)", "body = std(0xCDB89A, .42, .1)"),
 ("const edge = (w, h, c) => { const g = new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)); return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0 })); };",
  "const edge = (w, h, c) => { const G = new THREE.Group(), material = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false }), T = .05; for (const [a, b, x, y] of [[w, T, 0, h / 2], [w, T, 0, -h / 2], [T, h, -w / 2, 0], [T, h, w / 2, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(a, b), material); m.position.set(x, y, 0); G.add(m); } G.material = material; return G; };"),
 ("const px = -1.85, qx = 1.85;", "const px = -1.5, qx = 1.5;"),
 ("[K.s1e, 0, 3.4, 14.5, 0, 1.9, 0],", "[K.s1e, 0, 3.4, 17, 0, 2, 0],"),
 ("[K.s2 + 1.5, -1.4, 3.8, 16, 0, 1.8, 0], [K.s2e, 1.4, 4.2, 16, 0, 1.8, 0],", "[K.s2 + 1.5, -.8, 3.8, 17.5, 0, 2, 0], [K.s2e, .8, 4.2, 17.5, 0, 2, 0],"),
 ("[K.s3 + 1, 4.6, 5, 14.5, .3, 1.9, 0], [K.s3e, 3.2, 4.2, 15.5, .3, 1.9, 0],", "[K.s3 + 1, 3.6, 5, 16.8, .1, 2, 0], [K.s3e, 2.4, 4.2, 17, .1, 2, 0],"),
 ("[K.s4 + .8, 0, 3.1, 15, 0, 1.9, 0], [K.s4e, -.6, 3.1, 14.5, 0, 1.9, 0],", "[K.s4 + .8, 0, 3.1, 17.5, 0, 2, 0], [K.s4e, -.3, 3.1, 17, 0, 2, 0],"),
 ("[K.s5e, 1, 3.2, 15, 0, 1.9, 0],", "[K.s5e, .6, 3.2, 17, 0, 2, 0],"),
 ("[K.s6 + 1.5, 3.6, 3.8, 13.5, .6, 1.9, 0], [K.s6 + 6, -4.4, 4.1, 14, -.2, 1.9, 0], [K.s6e, -4.6, 4.4, 15, 0, 1.9, 0],", "[K.s6 + 1.5, 2.6, 3.8, 16.5, .3, 2, 0], [K.s6 + 6, -3.2, 4.1, 16.5, -.1, 2, 0], [K.s6e, -3.4, 4.4, 17, 0, 2, 0],"),
 ("[K.s7 + 1.2, 0, 2.8, 12, 1, 2.1, 0], [K.dur, .4, 2.8, 10, 1.3, 2.3, 0],", "[K.s7 + 1.2, 0, 2.8, 13.5, .9, 2.2, 0], [K.dur, .4, 2.8, 11.5, 1.1, 2.4, 0],"),
])
