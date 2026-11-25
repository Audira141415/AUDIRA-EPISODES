"""One-off fixes to EP01 after the first contact sheet. Run from AUDIRA_AI_MOTION_VIRAL."""
from pathlib import Path
p = Path("EP01_SATU_FOTO/world3d.js"); s = p.read_text(encoding="utf8")
def rep(a, b):
    global s
    assert a in s, a
    s = s.replace(a, b)
# Hermite overshoot flipped the top-down camera: hold it flat, then warp into the track, and blend out at the end.
rep("[0, 0, 21.5, -13.2, 0, 0, -13.5], [pop, 0, 20, -13.0, 0, 0, -13.5],\n", "[pop, 0, 20, -13.0, 0, 0, -13.5],\n")
rep("[K.s7 + 1.5, 0, 5.6, 21.5, 0, 3.6, -2], [close, 0, 6.2, 22.5, 0, 3.4, -2], [close + 1.8, 0, 19, -9, 0, 0, -13.5], [K.dur, 0, 19.4, -9.2, 0, 0, -13.5],\n", "[K.s7 + 1.5, 0, 5.6, 21.5, 0, 3.6, -2], [close, 0, 6.2, 22.5, 0, 3.4, -2], [K.dur, 0, 6.2, 22.5, 0, 3.4, -2],\n")
rep("""    const c = camTr(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);""", """    const FLAT = [0, 21.5 - 1.5 * clamp01(t / pop), -13.2, 0, 0, -13.5];
    let c;
    if (t <= pop) c = FLAT;
    else if (t < pop + 2.4) c = camTr(pop + 2.4 * smooth((t - pop) / 2.4));
    else c = camTr(t);
    if (t > close) { const u = smooth((t - close) / 1.8), E = [0, 19, -9, 0, 0, -13.5]; c = c.map((v, i) => v + (E[i] - v) * u); }
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);""")
# Sheets lie just above the desk so they never fight it.
rep("backdrop.position.z = hingeZ; scene.add(backdrop);", "backdrop.position.set(0, .02, hingeZ); scene.add(backdrop);")
rep("printM.castShadow = true; printM.position.z = hingeZ + 0.015; scene.add(printM);", "printM.castShadow = true; printM.position.set(0, .04, hingeZ + 0.015); scene.add(printM);")
# The figure stands behind the ridge, so the feet never float and no double shadow appears.
rep("person.position.set(-.35, 2.65, -1.1)", "person.position.set(-.35, 3.25, -1.85)")
rep("person.position.z = -1.1 + 2.6 * spread;", "person.position.z = Lz[2] - .25;")
rep('person.scale.setScalar(Math.max(.01, uP));', 'person.scale.setScalar(Math.max(.01, uP)); person.position.y = 3.25 * uP;')
rep("kite.position.set(2.5 + ksw, 9.3 + w1 * Math.sin(t * 2.3) * .22, -.9 + 2.6 * spread);", "kite.position.set(2.5 + ksw, 10 + w1 * Math.sin(t * 2.3) * .22, person.position.z);")
rep('''const PERSON = (x, w, h) => {
  x.fillStyle = "#1B2430"; x.strokeStyle = "#1B2430"; x.lineCap = "round";''', '''const PERSON = (x, w, h) => {
  x.fillStyle = "#24405F"; x.strokeStyle = "#1B2430"; x.lineCap = "round";''')
rep('''x.lineWidth = w * .1; x.beginPath(); x.moveTo(w * .66, h * .32); x.lineTo(w * .86, h * .12); x.moveTo(w * .34, h * .32); x.lineTo(w * .26, h * .58); x.stroke();
  x.fillStyle = "#2C3847"; x.beginPath(); x.arc(w * .5, h * .15, w * .15, 0, 7); x.fill();''', '''x.strokeStyle = "#24405F"; x.lineWidth = w * .1; x.beginPath(); x.moveTo(w * .66, h * .32); x.lineTo(w * .86, h * .12); x.moveTo(w * .34, h * .32); x.lineTo(w * .26, h * .58); x.stroke();
  x.fillStyle = "#E8B98F"; x.beginPath(); x.arc(w * .5, h * .15, w * .15, 0, 7); x.fill();
  x.fillStyle = "#2A1C14"; x.beginPath(); x.arc(w * .5, h * .12, w * .155, Math.PI, 0); x.fill(); x.fillRect(w * .36, h * .1, w * .28, h * .025);''')
p.write_text(s, encoding="utf8")
p = Path("EP01_SATU_FOTO/build-video.mjs"); s = p.read_text(encoding="utf8")
rep('''<div class="card"><div class="h sm" data-at="s4:Rumus">Subjek + gerakan,<br>latar + gerakan</div><div class="sub">Rumus prompt dari panduan Kling.</div></div>''', '''<div class="card" data-at="s4:Rumus"><div class="h sm">Subjek + gerakan,<br>latar + gerakan</div><div class="sub">Rumus prompt dari panduan Kling.</div></div>''')
rep('''<div class="card"><div class="h sm" data-at="s5:lima">Klip 5 atau 10 detik</div><div class="sub" data-at="s5:Tulis">Tulis yang harus terjadi, bukan yang dilarang.</div></div>''', '''<div class="card" data-at="s5:Tulis"><div class="h sm">Tulis yang terjadi,<br>bukan yang dilarang</div></div>
  <div class="card" data-at="s5:lima" style="margin-top:10px"><div class="h sm"><i>5 atau 10 detik</i> per klip</div></div>''')
p.write_text(s, encoding="utf8")
