"""First look-dev pass on the three Remotion films: camera distance, framing, label fit, empty beats. Run from AUDIRA_IJAZAH_2026."""
from pathlib import Path

D = Path("motion/src/scenes/ijazah")


def patch(name, pairs):
    f = D / name
    s = f.read_text(encoding="utf8")
    for a, b in pairs:
        if a not in s:
            raise SystemExit(f"{name} MISSING: {a[:70]}")
        s = s.replace(a, b)
    f.write_text(s, encoding="utf8")


patch("Ep02Vintage.tsx", [
    ("const cam = sample(CAM, t);", "const cam0 = sample(CAM, t);\n  const cam = [cam0[0], cam0[1], cam0[2] * 2, cam0[3], cam0[4], cam0[5], cam0[6]];"),
    ("normalize(vec3(-.55,.6,.6))", "normalize(vec3(-.35,.35,.87))"),
    ("hatch([0.9, 0.81, 0.62])", "hatch([0.97, 0.91, 0.77])"),
    ("fontSize: 48, lineHeight: 1.14", "fontSize: 54, lineHeight: 1.12"),
    ("[at(\"s3:SD\") + 0.1, ST[2] - 3,", "[K.s3 + 0.9, ST[2] - 4, 7, 29, ST[2] - 4, 4.6, 0, 32], [at(\"s3:SD\") + 0.1, ST[2] - 3,"),
    ("<group position={[33, 0, 0]} scale={Math.max(0.001, b[3])}>", "<group position={[33, 0, 0]} scale={Math.max(0.001, b[3]) * 0.8}>"),
    ('<Tk>Menurut keterangan Jokowi</Tk><Rows t={t} items={[[', '<Tk>Menurut keterangan Jokowi</Tk><Rows t={t} items={[["Judul skripsi diajukan 3 kali", at("s5:Judul")], ['),
    ('{/* s5: rising columns, one per election the witness listed */}\n        <group position={[ST[4], 0, 0]}>', '{/* s5: rising columns, one per election the witness listed */}\n        <group position={[ST[4], 0, 0]}>\n          {t < at("s5:ditunjukkan") ? ["1", "2", "3"].map((x, i) => <Sheet key={x} G={G.sheet} txt={x} pos={[(i - 1) * 4.4, 5, 3]} s={Math.max(0.001, pop(at("s5:tiga") + i * 0.12, t) * 1.1)} />) : null}'),
    ('txt="DITOLAK SAKSI: DICATAT"', 'txt="KETERANGAN DITOLAK"'),
    ("void PARCH;", "void PARCH;"),
])

patch("Ep03Draft.tsx", [
    ("const cam = sample(CAM, t);", "const cam0 = sample(CAM, t);\n  const cam = [cam0[0], cam0[1] + 6, cam0[2] * 1.8, cam0[3], cam0[4], cam0[5], cam0[6]];"),
    ('const s2a = lin(at("s2:ijazah"), at("s2:ijazah") + 1.2, t)', 'const s2a = lin(K.s2 + 0.2, at("s2:ijazah") + 0.6, t)'),
    ('const scope = lin(at("s3:Labfor"), at("s3:Labfor") + 1.2, t)', 'const scope = lin(K.s3 + 0.2, at("s3:Labfor") + 0.6, t)'),
    ('txt="IDENTIK: TEMUAN BARESKRIM" color={P.cadCyan} w={7.2} pos={[0, -1, 0]} font="700 58px Arial"', 'txt="IDENTIK (BARESKRIM)" color={P.cadCyan} w={6.6} pos={[0, -1, 0]} font="700 68px Arial"'),
    ('font="700 86px Arial" op={indep}', 'font="700 72px Arial" op={indep}'),
    ('font="700 86px Arial" op={sm(K.s8 + 0.5', 'font="700 74px Arial" op={sm(K.s8 + 0.5'),
    ('<group position={[ST[3], 0.8, 0]} scale={1.15}>', '<group position={[ST[3], -0.6, 0]} scale={0.95}>'),
    ('<group position={[0.5, 6.5, 0]} rotation={[0, 0, -0.45 + Math.sin(t * 0.7) * 0.03]}>', '<group position={[2.4, 4.8, 0]} scale={0.72} rotation={[0, 0, -0.45 + Math.sin(t * 0.7) * 0.03]}>'),
])

patch("Ep04Brutal.tsx", [
    ("const cam = [c[0] + Math.sin(t * 61) * shake, c[1] + Math.sin(t * 47) * shake * 0.7, c[2],", "const cam = [c[0] + Math.sin(t * 61) * shake, c[1] + Math.sin(t * 47) * shake * 0.7, c[2] * 1.8,"),
    ("<meshBasicMaterial color={color} toneMapped={false} /></mesh>)}\n", "<meshBasicMaterial color={color} side={THREE.DoubleSide} toneMapped={false} /></mesh>)}\n"),
    ("size = 118, color = W, children", "size = 118, color = INK, children"),
    ("WebkitTextStroke: `8px ${INK}`, paintOrder: \"stroke\", ", "WebkitTextStroke: color === INK ? undefined : `8px ${INK}`, paintOrder: \"stroke\", "),
    ('<group position={[0, -2.2, 0]}>\n        {Gavel(0.2, 1.6, slam1)}', '<group position={[0, -0.6, 0]}>\n        {Gavel(0.2, 1.6, slam1)}'),
    ('<group position={[40, -2.4, 0]}>', '<group position={[40, -0.6, 0]}>'),
    ('<group position={[80, -2.4, 0]}>', '<group position={[80, 0, 0]}>'),
    ('<group position={[120, -5.5, 0]}>', '<group position={[120, -4.2, 0]}>'),
    ('<group position={[160, -3, 0]}>', '<group position={[160, -0.8, 0]}>'),
    ('<group position={[200, -2.6, 0]}>', '<group position={[200, -0.4, 0]}>'),
    ('<group position={[240, -2.5, 0]}>', '<group position={[240, 0, 0]}>'),
    ('<group position={[280, -2.6, 0]}>', '<group position={[280, 0, 0]}>'),
    ('<group position={[5.6 - shakeHands * 2.6, pump, 0.1]} rotation={[0, Math.PI, 0]}><Pop geo={GEO.mitten} color={Y} sh={0} /></group>', '<group position={[5.6 - shakeHands * 2.6, pump, 0.1]}><Pop geo={GEO.mitten2} color={Y} /></group>'),
    ("mitten: mitten(), bar:", "mitten: mitten(), mitten2: mitten().scale(-1, 1, 1), bar:"),
])
print("patched")
