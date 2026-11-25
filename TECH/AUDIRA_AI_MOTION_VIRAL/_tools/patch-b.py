"""One-off look fixes after reviewing the EP03 sheet. Run from AUDIRA_AI_MOTION_VIRAL."""
from pathlib import Path
def patch(f, reps):
    p = Path(f); s = p.read_text(encoding="utf8")
    for a, b in reps:
        assert a in s, a
        s = s.replace(a, b)
    p.write_text(s, encoding="utf8")
patch("EP03_MOBIL_TRANSFORM/world3d.js", [
 ("bloom: [.3, .5, .9]", "bloom: [.16, .4, .94]"),
 ('[18, 1.2, "#FFB25A", 3, 0, 1.5, -14]', '[18, 1.2, "#FFD9B0", 1.2, 0, 1.5, -14]'),
 ("scene.environmentIntensity = .85;", "scene.environmentIntensity = 1.25;"),
 ("new THREE.HemisphereLight(0xBFC8D8, 0x080808, .16)", "new THREE.HemisphereLight(0xD8DCE6, 0x141414, .5)"),
 ("new THREE.SpotLight(0xFFF2E0, 300, 40, .55, .7, 1.6)", "new THREE.SpotLight(0xFFF2E0, 760, 40, .55, .7, 1.6)"),
 ("sp.intensity = t < K.s6 ? 300 : 300 + 220 * ramp(t, bay, bay + .3);", "sp.intensity = t < K.s6 ? 760 : 760 + 300 * ramp(t, bay, bay + .3);"),
 ("new THREE.MeshStandardMaterial({ color: 0x08080A, roughness: .28, metalness: .3, transparent: true, opacity: .86 })",
  "new THREE.MeshStandardMaterial({ color: 0x0C0C0F, roughness: .46, metalness: .2, transparent: true, alphaMap: canvasTex(512, 512, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, '#fff'); g.addColorStop(.42, '#fff'); g.addColorStop(.8, '#000'); x.fillStyle = g; x.fillRect(0, 0, w, w); }) })"),
 ("new THREE.CircleGeometry(40, 64)", "new THREE.CircleGeometry(20, 64)"),
 ("emissiveIntensity: 2.2 });\n  const lamps", "emissiveIntensity: .9 });\n  const lamps"),
 ("emissiveIntensity: 1.6, roughness: .4, metalness: .6 });", "emissiveIntensity: .7, roughness: .4, metalness: .6 });"),
 ("engineM.emissiveIntensity = 1.6 * oc;", "engineM.emissiveIntensity = .7 * oc;"),
 ("box(.56, .32, .03, std(0xE8860C, .3, .5), 2.3, 1.42, s * 1.0, wing);", "box(.56, .32, .03, wm, 2.3, 1.42, s * 1.0, wing);"),
 ("new THREE.PerspectiveCamera(30, 1.6, .1, 100); rc.position.set(-7.2, 2.1, 8.2); rc.lookAt(0, .7, 0);", "new THREE.PerspectiveCamera(30, 1.6, .1, 100); rc.position.set(-5.4, 1.55, 6); rc.lookAt(0, .72, 0);"),
 ("new THREE.MeshBasicMaterial({ map: t.texture, transparent: true,", "new THREE.MeshBasicMaterial({ map: t.texture, color: new THREE.Color(2.2, 2.2, 2.2), transparent: true,"),
 ("if (i === 0) { o = a0; sx = -.17; }", "if (i === 0) { o = a0; sx = -.118; }"),
 ("if (i === 2) { o = a1; sx = .17; }", "if (i === 2) { o = a1; sx = .118; }"),
 ("sx = -.17 + i * .17; sc = .84; sy = .075;", "sx = -.126 + i * .126; sc = .9; sy = .075;"),
 ("const P = at(-.11 + .22 * u,", "const P = at(-.05 + .1 * u,"),
])
