"""Second look-dev pass: numeral legibility, final ledger page, EP03 distance, handshake overlap. Run from AUDIRA_IJAZAH_2026."""
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
    ("fontFamily: `'${FONT.serif}'`, fontSize: 54, lineHeight: 1.12", "fontFamily: \"Georgia, serif\", fontSize: 44, lineHeight: 1.18"),
    ("text={{ fontFamily: `'${FONT.serif}'`, fontSize: 62, lineHeight: 1.08 }}", "text={{ fontFamily: \"Georgia, serif\", fontSize: 50, lineHeight: 1.16 }}"),
    ('<E geo={G.box} pos={[0, 0.2, 0]} s={[20, 0.4, 6]} />', '<E geo={G.box} pos={[0, 0.2, 0]} s={[17.4, 0.4, 6]} />'),
    ("position={[-7.6 + i * 3.8, 0.4, 0]}", "position={[-6.8 + i * 3.4, 0.4, 0]}"),
    ('<Label txt="KETERANGAN DITOLAK"', '<mesh position={[-3, 0.98, 0.25]} rotation={[-1.47, 0.05, 0.05]}><planeGeometry args={[5.5, 7.4]} /><meshBasicMaterial color="#F3E8CC" toneMapped={false} /></mesh>\n          <mesh position={[3, 0.98, 0.25]} rotation={[-1.47, -0.05, -0.05]}><planeGeometry args={[5.5, 7.4]} /><meshBasicMaterial color="#F3E8CC" toneMapped={false} /></mesh>\n          <Label txt="KETERANGAN DITOLAK"'),
    ("pos={[-3, 1, 0.3]} rot={[-1.4, 0, 0]}", "pos={[-3, 1.08, 0.3]} rot={[-1.47, 0, 0]}"),
    ("pos={[3, 1, 0.3]} rot={[-1.4, 0, 0]}", "pos={[3, 1.08, 0.3]} rot={[-1.47, 0, 0]}"),
])
patch("Ep03Draft.tsx", [
    ("cam0[1] + 6, cam0[2] * 1.8,", "cam0[1] + 5, cam0[2] * 1.45,"),
    ("<group position={[2.4, 4.8, 0]} scale={0.72}", "<group position={[2.6, 5, 0]} scale={0.9}"),
])
patch("Ep04Brutal.tsx", [
    ("-5.6 + shakeHands * 2.6, pump, 0]", "-5.6 + shakeHands * 3.3, pump, 0]"),
    ("5.6 - shakeHands * 2.6, pump, 0.1]", "5.6 - shakeHands * 3.3, pump, 0.1]"),
])
print("patched")
