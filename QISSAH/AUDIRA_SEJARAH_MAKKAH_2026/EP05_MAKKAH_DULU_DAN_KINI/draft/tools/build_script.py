"""Build docs/SCRIPT.md from audio/vo-chapters.json (word counts, durations at 140 WPM)."""
import json, re, pathlib

EP = pathlib.Path(__file__).resolve().parents[2]
data = json.loads((EP / "audio/vo-chapters.json").read_text(encoding="utf-8"))
WPM = 140

VISUAL = {
    "c00_hook": "Pelat gravir terbelah: genangan 1941 sebagai garis air emas di dinding diorama pelataran, Ka'bah kubus hitam berpita emas di tengah; kamera mundur memperlihatkan menara jam di sisi kanan.",
    "c01_intro": "Cover topik hidup: pelat tembaga 'dulu | kini', vignette kapal layar berdenyut, label HUD AUDIRA terukir di bingkai pelat.",
    "c02_lembah": "Maket topografi gravir lembah Makkah; kamera turun dari Jabal An-Nur ke dasar lembah; garis aliran air emas mengalir dari lereng ke satu titik di Masjidil Haram (tanpa figur).",
    "c03_banjir_klasik": "Diorama naskah kuno: pita arus biru-verdigris menyapu kotak Maqam (benda dalam kotak), lalu tali ukur emas membentang ke Rukun, pintu Hijr, Zamzam; halaman Akhbar Makkah sebagai bingkai.",
    "c04_banjir_1941": "Rekonstruksi diorama pelataran tergenang, air memantulkan cahaya, Ka'bah utuh; tawaf berenang hanya sebagai titik-titik riak cahaya tanpa wajah; penutup: penampang lantai naik dan terowongan drainase menyala.",
    "c05_zubaidah": "Penampang tanah gravir: saluran batu dari lereng Ta'if ke Arafah, air berkilau; koin emas jatuh per 'ayunan kapak'; peta garis rute Hunain dan Nu'man, penggaris kemiringan 1:3000.",
    "c06_nusantara": "Peta laut kartografi kolonial; kapal layar lalu kapal uap miniatur dari Tanjung Priok ke Jeddah dengan penghitung hari; papan nama SOEKABOEMI dan MEDAN; mimbar dan kitab untuk Ahmad Khatib (tanpa wajah).",
    "c07_ajyad_menara": "Slider dulu-kini satu sudut kamera: benteng batu di Bukit Bulbul, bukit menyusut, menara naik bertahap; penggaris HUD 601 m; dua kartu kutipan Turki dan Saudi berdampingan dengan bobot sama.",
    "c08_kota_modern": "Peta 3D Makkah malam: garis metro, rel Haramain, Jamarat lima lantai menyala satu per satu; grafik batang jemaah 1970-2026 dengan patahan 2020; kota tenda putih dari udara.",
    "c09_payoff": "Kembali ke pelat terbelah: kapal 1928 di kiri vs ikon pesawat 96,1% di kanan; antrean 5,4 juta sebagai aliran titik; kartu CTA, outro AUDIRA.",
}

def words(t: str) -> int:
    return len(re.findall(r"\S+", t))

def dur(n: int) -> float:
    return n / WPM * 60

def mmss(s: float) -> str:
    s = round(s)
    return f"{s // 60}:{s % 60:02d}"

out = ["# Naskah — EP05 MAKKAH DULU DAN KINI (video panjang 16:9 + 2 short)", "",
       "Narator: Cartesia Galang (`04b567df-2923-4b0c-896b-4b7df0a07e1a`), bahasa Indonesia. Estimasi durasi = kata / 140 x 60.",
       "Sumber narasi untuk TTS: `audio/vo-chapters.json` (teks identik). Tahun ditulis sebagai angka, angka lain dieja.",
       "Semua fakta dari `research/SOURCE_REGISTER.md`; frasa hedging mengikuti tabel Sengketa di `RESEARCH_REPORT.md`.", ""]
total = 0
t = 0.0
for c in data["chapters"]:
    n = words(c["text"]); d = dur(n); total += n
    out += [f"## {c['title']}  (`{c['id']}`)", "",
            f"- Kata: **{n}** · Estimasi: **{d:.0f} dtk** · Mulai sekitar {mmss(t)}",
            f"- Visual: {VISUAL[c['id']]}", "", c["text"], ""]
    t += d
out += ["---", "", f"**Total: {total} kata ≈ {mmss(dur(total))} menit** (pada 140 WPM; {mmss(total/150*60)} pada 150 WPM, {mmss(total/135*60)} pada 135 WPM). End screen 20 dtk terakhir menumpang di bawah CTA dan kalimat penutup.", ""]

out += ["## Segmen short (9:16, dirender ulang dari adegan yang sama)", ""]
chap = {c["id"]: c["text"] for c in data["chapters"]}
def span(text, a, b):
    i = text.index(a); j = text.index(b, i) + len(b); return text[i:j]
SPANS = {
    "short01": [("c02_lembah", "Ka'bah berada di bagian terendah lembah.", "Ke Masjidil Haram."),
                ("c04_banjir_1941", "Tahun 1941, atau 1360 Hijriah", "dari sedikit foto banjir itu."),
                ("c04_banjir_1941", "Tahun 1969, banjir besar datang lagi.", "tinggal kenangan.")],
    "short02": [("c06_nusantara", "Sebelum ada kapal uap", "lima bulan."),
                ("c06_nusantara", "Kapal-kapal Kongsi Tiga", "orang meninggal."),
                ("c06_nusantara", "Tahun 1952, Indonesia", "akhir 1970-an."),
                ("c09_payoff", "Yang tidak berubah hanya satu.", "empat puluh tujuh tahun.")],
}
for s in data["shorts"]:
    body = " ".join(span(chap[cid], a, b) for cid, a, b in SPANS[s["id"]])
    n = words(s["hook"]) + words(body) + words(s["outro"])
    out += [f"### {s['id']}: {s['title']}", "",
            f"- Memakai ulang: {', '.join('`'+r+'`' for r in s['reuse'])}",
            f"- Hook baru 0-3 dtk: \"{s['hook']}\"",
            f"- Penutup: \"{s['outro']}\"",
            f"- Kata: {n} · Estimasi: **{dur(n):.0f} dtk** (+ sekitar 3 dtk outro card)", "",
            "Teks short lengkap:", "", f"> {s['hook']} {body} {s['outro']}", ""]

(EP / "docs/SCRIPT.md").write_text("\n".join(out), encoding="utf-8")
print("total", total, mmss(dur(total)))
for c in data["chapters"]:
    n = words(c["text"]); print(c["id"], n, round(dur(n)))
