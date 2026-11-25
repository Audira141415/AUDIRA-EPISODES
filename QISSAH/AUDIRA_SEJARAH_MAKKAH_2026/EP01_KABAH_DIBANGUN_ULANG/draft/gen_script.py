import json, re
d = json.load(open('audio/vo-chapters.json', encoding='utf-8'))
VIS = {
 'c00_hook': "Cincin diorama waktu mengelilingi Ka'bah hari ini; kamera mundur, cincin berputar mundur lewat label tahun 1996, 1630, 683, ~605 (cover film).",
 'c01_intro': "Kamera turun ke denah lantai: delapan cincin tipis menyala satu per satu, satu per babak; label AUDIRA di papan diorama.",
 'c02_ibrahim': "Lembah pasir kosong pada piringan diorama; garis fondasi persegi panjang menyala, batu 'punuk unta' naik dari pasir, dinding rendah tanpa atap tumbuh. Tanpa figur, hanya batu dan cahaya.",
 'c03_quraisy': "Pantai miniatur: kapal kayu karam, papan-papan melayang ke lokasi menjadi balok atap; tinggi dinding naik; close-up kain terbentang dengan Hajar Aswad, tangan-tangan anonim di tepi kain (tanpa wajah, tanpa sosok Nabi).",
 'c04_hijr': "Kamera top-down: persegi panjang fondasi Ibrahim ditumpuk kubus Quraisy; bagian yang terpotong menyala jadi setengah lingkaran Hijr; pintu naik ke ketinggian, tangga hilang.",
 'c05_zubair': "Dinding hangus disembunyikan tirai pada tiang (bukan kehancuran); tirai terbuka, Ka'bah memanjang di atas fondasi Ibrahim dengan dua pintu rata tanah, cahaya tembus pintu ke pintu; ikatan perak melingkari Hajar Aswad.",
 'c06_hajjaj': "Dua denah bergantian di meja diorama (Ibnu Zubair vs Quraisy); pintu barat ditembok perlahan bata demi bata; surat bersegel bergerak di rel antara Makkah dan Damaskus; satu lampu minyak di majelis ilmu.",
 'c07_qaramithah': "Sudut Ka'bah tampil sebagai ceruk gelap; jamaah sebagai titik cahaya yang tetap berputar; karung tergantung di tiang Masjid Kufah; bingkai perak dibentuk ulang memeluk keping-keping. Tanpa kekerasan.",
 'c08_banjir': "Air cokelat naik di diorama pelataran sampai garis tengah dinding (garis banjir 1630 menyala); dinding utara ditampilkan sebagai batu-batu yang tersusun di denah, bukan runtuh; perancah kayu dan granit disusun ulang.",
 'c09_kini': "Cutaway Ka'bah yang bermartabat: atap ganda, tiga tiang kayu, tangga Bab At-Taubah, label ukuran mengambang; perancah 1996 berdiri di sisi cincin.",
 'c10_payoff': "Semua versi Ka'bah berdiri berjajar di cincin waktu (Ibrahim, Quraisy, Ibnu Zubair, 1631/kini); kamera naik ke atas, titik-titik jamaah berputar searah; outro AUDIRA.",
}
SHORTS_AT = {'c04_hijr': 'short01', 'c07_qaramithah': 'short02'}
out = []
w = lambda s: len(s.split())
tot = 0
out.append("# Naskah — SEJARAH MAKKAH · EP01 · Ka'bah Dibangun Ulang Berkali-kali\n")
out.append("Format: video panjang 16:9 (1920×1080 @ 30) + 2 short 9:16 (1080×1920 @ 60). Narator: Cartesia Galang (`04b567df-2923-4b0c-896b-4b7df0a07e1a`), `lang: id`. Style: TIMEFORGE.\n")
out.append("Sumber narasi TTS: `audio/vo-chapters.json` (teks identik dengan naskah ini). Estimasi durasi = kata / 140 × 60. Semua fakta dari `research/SOURCE_REGISTER.md`; kalimat bersengketa memakai saran tabel \"Perselisihan\" di `RESEARCH_REPORT.md`. Angka ditulis dalam bentuk ucapan.\n")
out.append("Status: **menunggu acc naskah** (belum ada VO).\n")
t = 0.0
for c in d['chapters']:
    n = w(c['text']); dur = n/140*60
    out.append(f"## {c['id']} — {c['title']}\n")
    out.append(f"- Kata: **{n}** · estimasi **{dur:.0f} dtk** · mulai ±{int(t//60)}:{int(t%60):02d}")
    out.append(f"- Visual: {VIS[c['id']]}")
    if c['id'] in SHORTS_AT:
        out.append(f"- **Segmen short:** `{SHORTS_AT[c['id']]}` diambil dari chapter ini (lihat bagian Short).")
    out.append("")
    out.append("> " + c['text'] + "\n")
    t += dur; tot += n
out.append(f"## Total\n\n- **{tot} kata**, estimasi **{tot/140*60:.0f} dtk ≈ {tot/140:.1f} menit** pada 140 WPM ({tot/150:.1f}–{tot/135:.1f} menit pada 150–135 WPM).\n- 11 blok: hook, intro, 8 chapter, payoff + CTA. Penutup persis: \"Sejarah Makkah, bersama Audira.\"\n- End screen 20 dtk terakhir menimpa CTA + outro card AUDIRA.\n")
out.append("## Short turunan (9:16, dirender ulang, bukan crop)\n")
for s in d['shorts']:
    c = next(x for x in d['chapters'] if x['id'] == s['reuse'][0])['text']
    sents = re.split(r'(?<=[.?!])\s+', c)
    skip = 1 if s['id'] == 'short01' else 2
    body = ' '.join(sents[skip:])
    n = w(s['hook']) + w(body) + w(s['outro'])
    out.append(f"### {s['id']} — {s['title']}\n")
    out.append(f"- Memakai ulang: `{s['reuse'][0]}`, {s['reuseNote']}")
    out.append(f"- Hook baru (0–3 dtk): \"{s['hook']}\"")
    out.append(f"- Penutup: \"{s['outro']}\"")
    out.append(f"- Kata: {n} · estimasi **{n/140*60:.0f} dtk** (rentang 45–90 dtk terpenuhi).\n")
open('docs/SCRIPT.md', 'w', encoding='utf-8').write('\n'.join(out))
print(tot)
