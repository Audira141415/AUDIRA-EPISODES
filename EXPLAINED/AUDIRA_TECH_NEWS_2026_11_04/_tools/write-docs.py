"""Writes SCRIPT.md, STORYBOARD.md and the production docs from the real timeline, so timecodes match the audio. Run from F:/AUDIRA-VIDEO-MOTION."""
import json, re
from pathlib import Path

ROOT = Path("AUDIRA_TECH_NEWS_2026_11_04")
TOK = re.compile(r"\{([^|}]*)\|[^}]*\}")


def fmt(t):
    return f"{int(t // 60):02}:{t % 60:04.1f}"


EP = {
    "EP01_BINANCE_CYBER_ATTACK": {
        "title": "HACKER KOREA UTARA DIDUGA CURI US$6,3 MILIAR! FBI UNGKAP SERANGAN KE BINANCE",
        "concept": "CHAIN OF CUSTODY",
        "picked": "Kamera tunggal menembus dunia 3D, dari aula server, ke brankas, ke jejaring 12.000 dompet. Penonton mengikuti jejak uang, bukan membaca kartu.",
        "rejected": [("Papan bukti detektif", "Kuat secara cerita, tetapi datar dan mudah terasa template."), ("Peta dunia dengan garis serangan", "Mengklaim jalur geografis yang tidak dilaporkan sumber.")],
        "audience": "Pengguna kripto dan penonton teknologi Indonesia, 18-40 tahun, menonton di ponsel, sering tanpa suara.",
        "tone": "Investigasi kejahatan digital internasional. Tegang, hati-hati soal atribusi.",
        "board": {
            "s1": ("Dolly maju di lorong rak server. Angka sudah di layar sejak frame 0. Batang Bybit dan Binance sesuai skala.", "Maju konstan sumbu Z", "Dengung server, bass pembuka, blip transaksi biru"),
            "s2": ("LED berubah merah bergelombang dari brankas, aliran transaksi berbalik arah. Jam UTC berjalan 20.05 ke 20.25. Tabel tiga hitungan.", "Maju, tiba di depan brankas", "Alarm dua nada, glitch, bass, blip turun, keyboard"),
            "s3": ("Kamera mengitari brankas. Pertanyaan dan stempel BELUM FINAL. Klaim awal, temuan lanjutan, laporan ditunggu.", "Orbit kiri", "Riser, klik tiap bukti"),
            "s4": ("Kamera naik menembus atap. Berkas pernyataan FBI: Korea Utara, lebih dari US$6 miliar, TraderTraitor. Catatan: dibantah.", "Naik sumbu Y", "Whoosh, riser, bass di kata Korea"),
            "s5": ("Masuk jejaring dompet. 44 balok es tepat 44% yang dibekukan. Jejaring tumbuh ke 12.000 titik, penghitung berjalan. Gerbang DeFi dan instant swap.", "Mundur sambil orbit", "Tik es, tik konfirmasi makin rapat, whoosh gerbang"),
            "s6": ("Kamera menyapu ke tugu 20 cakram. 19 cakram biru terisi (95%), satu rangka merah. Angka 95% menghitung naik.", "Sapuan lateral", "Whoosh, nada naik tiap cakram, chime"),
            "s7": ("Kembali ke jejaring. Stempel KOREA UTARA MEMBANTAH. Kutipan Kim Yo Jong lewat AP.", "Mundur lebar", "Bass, whoosh"),
            "s8": ("Jejaring utuh terlihat dari jauh, lalu kamera mendorong masuk. US$3,18 miliar. Pertanyaan penutup per kata.", "Mundur lalu dorong masuk", "Pad terbuka, hentakan tiap kata"),
        },
        "palette": [("Deep Black", "#02050A", "Latar, panel"), ("Cyber Blue", "#2FA8FF", "Sistem normal, pemulihan"), ("Neon Red", "#FF2E3F", "Serangan, aset curian"), ("Digital White", "#F3F8FF", "Teks"), ("Ice", "#BFE4FF", "Dana dibekukan"), ("Caption cyan", "#39D0FF", "Kata aktif")],
        "fonts": "Archivo Black (judul, angka), JetBrains Mono (data, HUD), Inter 900 (catatan, caption)",
        "motion": "Satu kamera 3D kontinu. Panel selalu terdorong ke arah kamera, masuk dan keluar. Getaran kamera hanya di fakta keras.",
        "light": "Lampu mengikuti kamera, biru menjadi merah saat breach, bloom ringan, kabut di dalam aula, grain 8%.",
        "assets": [("Dunia 3D (aula, brankas, jejaring, balok es, tugu)", "Prosedural Three.js r186, `assets/lib/world3d.js`", "Buatan sendiri, ilustrasi"), ("Three.js", "npm `three` 0.186.1, disalin ke `assets/lib/`", "MIT"), ("Logo Monolit AMD", "Kit logo AUDIRA, `stacked-reversed.svg`", "Milik AUDIRA"), ("SFX", "`shared/assets/sfx/` plus sintesis numpy", "Pustaka AUDIRA"), ("Musik", "Sintesis numpy, `mix.py`", "Buatan sendiri"), ("Suara", "Cartesia sonic-3, Galang", "Akun AUDIRA")],
        "audio": "Drone minor 49 Hz, denyut 62 ke 112 BPM saat pencucian, klaster disonan setelah breach.",
    },
    "EP02_IHSG_MARKET_CRISIS": {
        "title": "IHSG ANJLOK 3,78%! APA YANG SEBENARNYA TERJADI DI BURSA SAHAM INDONESIA?",
        "concept": "THE TAPE",
        "picked": "Satu pita laporan berjalan ke kiri, bergaya koran finansial. Gedung BEI asli di awal, grafik yang benar-benar bersumber di tengah, tiap angka punya bentuk.",
        "rejected": [("Lantai bursa 3D", "BEI tidak punya lantai seperti itu, jadi akan menipu."), ("Avatar investor panik", "Mengarah ke drama, bertabrakan dengan aturan tanpa rekomendasi.")],
        "audience": "Investor ritel dan pembaca ekonomi Indonesia, 20-45 tahun, menonton di ponsel.",
        "tone": "Laporan investigasi pasar. Tenang, tegas, tidak menakut-nakuti lebih dari datanya.",
        "board": {
            "s1": ("Foto asli gedung BEI dengan dorongan lambat. Sudah di layar sejak frame 0: TERJUN BEBAS, -3,78%.", "Dorong lambat", "Riuh bursa, hentakan bass"),
            "s2": ("Angka IHSG besar berdetak mengikuti garis grafik. Garis 5.000 pecah di kata jebol. Penanda buka, jeda siang, tutup.", "Pita ke kiri, lalu melayang lambat", "Tik pita, notifikasi ponsel, kaca pecah, bass"),
            "s3": ("Dinding 718 titik menyala tepat 624, 57, 37. Sebelas batang sektor. Kartu jual bersih asing.", "Pita ke kiri", "Rentetan tik, klik, ping"),
            "s4": ("Hanya tipografi: Itu datanya. Soal penyebab, jawabannya tidak tunggal.", "Pita ke kiri", "Riuh surut, hentakan pelan"),
            "s5": ("Status pasar: emerging market, panah, standalone market. Dua tanggal.", "Pita ke kiri", "Klik, hentakan"),
            "s6": ("Faktor lain: 81 saham HSC, inflasi pangan. Batang IHSG melawan Asia, skala sama.", "Pita ke kiri", "Klik berurutan"),
            "s7": ("Dua tafsir berdampingan, OJK dan Panin Sekuritas. Kartu rupiah.", "Pita ke kiri", "Klik, ping"),
            "s8": ("Grafik setahun dari 9.174 ke 4.904. -46,5%. Tiga hal dipantau di atas foto malam Jakarta. BUKAN REKOMENDASI.", "Pita ke kiri, satu perhentian terakhir", "Pad terbuka, hentakan, klik"),
        },
        "palette": [("Graphite Black", "#0F1113", "Latar"), ("Financial Red", "#E5252A", "Penurunan, kata aktif"), ("Metallic Silver", "#C7CCD1", "Label"), ("Neutral White", "#F4F5F6", "Teks"), ("Hijau data", "#3FA66B", "Hanya saham menguat")],
        "fonts": "Playfair Display 900 (judul koran), Oswald 700 (angka), IBM Plex Mono (label), Montserrat 800 (caption)",
        "motion": "Pita bergerak ke kiri dan tidak pernah berbalik, plus melayang lambat 5 px per detik. Reveal mengikuti kata. Pecahan garis 5.000 satu-satunya efek dramatis.",
        "light": "Foto digradasi ke abu-abu dingin. Tidak ada bloom. Grain 7,5%, vignette ringan.",
        "assets": [("Foto gedung BEI", "Wikimedia Commons, CC BY-SA 4.0, resolusi sumber 794x396, diperbesar 3,1 kali", "Atribusi wajib"), ("Foto Jakarta malam", "Wikimedia Commons, CC0, dipotong agar logo perusahaan keluar bingkai", "Bebas"), ("Grafik, dinding titik, batang", "SVG/HTML dari data di RESEARCH_REPORT", "Buatan sendiri"), ("Logo Monolit AMD", "Kit logo AUDIRA", "Milik AUDIRA"), ("SFX", "`shared/assets/sfx/` plus sintesis numpy", "Pustaka AUDIRA"), ("Musik", "Sintesis numpy, `mix.py`", "Buatan sendiri"), ("Suara", "Cartesia sonic-3, Galang", "Akun AUDIRA")],
        "audio": "Pad D minor tanpa ritme, sub 36,7 Hz, riuh bursa dari derau pita bicara yang surut setelah penutupan.",
    },
}

for name, E in EP.items():
    d = ROOT / name
    TL = json.loads((d / "timeline.json").read_text(encoding="utf8"))
    lines = json.loads((d / "script-lines.json").read_text(encoding="utf8"))
    sc = {s["id"]: s for s in TL["scenes"]}
    w = len(TL["words"])
    txt = {l["id"]: TOK.sub(r"\1", l["text"]) for l in lines}
    s = f"# Script: {E['title']}\n\nVoice: Cartesia sonic-3, Galang `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa `id`.\n\n"
    s += f"{w} kata tampil. Narasi {TL['speech_end']:.1f} detik, film {TL['duration']:.2f} detik, {w / TL['speech_end'] * 60:.0f} kata per menit.\n\n"
    s += "Timecode diambil dari audio final. Ejaan fonetik TTS ada di `script-lines.json`.\n\n| Timecode | Narasi |\n|---|---|\n"
    for k in sc:
        s += f"| {fmt(sc[k]['start'])}-{fmt(sc[k]['end'])} | {txt[k]} |\n"
    s += f"| {fmt(TL['speech_end'])}-{fmt(TL['duration'])} | Tanpa narasi. Logo Monolit, Created by Agus Dwi R., sumber. |\n"
    (d / "SCRIPT.md").write_text(s, encoding="utf8")

    b = f"# Storyboard: {E['concept']}\n\nFormat 1080x1920, 30 fps. Konten di y=190-1290, caption di y=1296-1540.\n\n| Timecode | Visual | Kamera | Audio |\n|---|---|---|---|\n"
    for k in sc:
        v, c, a = E["board"][k]
        b += f"| {fmt(sc[k]['start'])}-{fmt(sc[k]['end'])} | {v} | {c} | {a} |\n"
    b += f"| {fmt(TL['speech_end'])}-{fmt(TL['duration'])} | Layar gelap, logo Monolit, Created by Agus Dwi R. | Diam | Chime, musik reda |\n"
    (d / "STORYBOARD.md").write_text(b, encoding="utf8")

    (d / "CREATIVE_BRIEF.md").write_text(f"# Creative Brief: {E['concept']}\n\n**Judul:** {E['title']}\n\n**Audiens:** {E['audience']}\n\n**Nada:** {E['tone']}\n\n**Konsep terpilih:** {E['picked']}\n\n**Konsep ditolak:**\n\n" + "".join(f"- {a}: {r}\n" for a, r in E["rejected"]), encoding="utf8")
    (d / "ART_DIRECTION.md").write_text(f"# Art Direction: {E['concept']}\n\n**Gerak:** {E['motion']}\n\n**Cahaya:** {E['light']}\n\n**Beda dari episode lain:** dunia, palet, font, sumbu kamera, gaya caption, dan skor semuanya berbeda.\n", encoding="utf8")
    (d / "DESIGN_SYSTEM.md").write_text(f"# Design System: {E['concept']}\n\n| Token | Hex | Pakai |\n|---|---|---|\n" + "".join(f"| {a} | `{h}` | {u} |\n" for a, h, u in E["palette"]) + f"\n**Font:** {E['fonts']}\n\n**Safe zone:** atas 180 px, bawah 380 px.\n\n**Catatan:** Space Grotesk, Bebas Neue, dan Syne tidak termasuk font bawaan HyperFrames, jadi tidak dipakai. Nama font ditulis literal, tidak lewat CSS variable.\n", encoding="utf8")
    (d / "ASSET_MANIFEST.md").write_text("# Asset Manifest\n\n| Aset | Asal | Lisensi atau status |\n|---|---|---|\n" + "".join(f"| {a} | {o} | {l} |\n" for a, o, l in E["assets"]) + "\nTidak ada gambar AI generatif, karena endpoint gambar 9Router meminta API key yang tidak tersedia di sesi ini.\n", encoding="utf8")
    (d / "AUDIO_PLAN.md").write_text(f"# Audio Plan\n\n**Skor:** {E['audio']}\n\n**Lapisan:** VO prioritas, SFX kedua, BGM latar. Ducking otomatis dari energi suara, musik turun 55% saat narasi.\n\n**Target:** master -14 LUFS, true peak di bawah -1 dBTP. VO dinormalkan -16 LUFS sebelum mix.\n\n**Cue:** lihat `mix.py`, tiap cue terikat ke kata di `timeline.json`, dan kolom audio di STORYBOARD.md.\n", encoding="utf8")
    print(name, "docs written")
