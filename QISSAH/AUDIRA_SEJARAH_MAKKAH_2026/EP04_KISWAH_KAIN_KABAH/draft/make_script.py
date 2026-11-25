import json
d=json.load(open('audio/vo-chapters.json',encoding='utf-8'))
TLJ=json.load(open('audio/timeline.json',encoding='utf-8'))
REAL={c['id']:c for c in TLJ['chapters']}
fmt=lambda x: f'{int(x//60):02d}:{x%60:04.1f}'
vis={
'c00_hook':"Makro kain hitam raksasa di pemidangan; jarum menarik benang emas di pita ornamen; kilau menyapu; deret swatch benang putih-merah-hijau-hitam di tepi.",
'c01_intro':"Kamera mundur dari sulaman: balok Ka'bah gaya maket berselubung kain linen hitam di tengah meja kerja penyulam; judul episode tersulam.",
'c02_tubba':"Diorama gurun Yaman dari kain felt dan linen; tiga gulungan bergantian (anyaman pelepah, kain Ma'afir, kain garis Yaman) membungkus balok maket; siluet unta tanpa penunggang di kejauhan. Tanpa sosok raja.",
'c03_jahiliah':"Cutaway lapisan kain bertumpuk seperti strata batuan; kalender bulan tersulam berputar ke 'Asyura; asap dupa dari benang abu-abu dan nyala kecil di ujung kain; kain Yaman bergaris turun menggantikannya. Hanya kain, cahaya, arsitektur.",
'c04_warna':"Balok maket berputar pelan; kainnya berganti warna mengikuti garis waktu tersulam di lantai linen: putih, merah, putih, hijau, hitam; tumpukan era Al-Mahdi menekan dinding (indikator beban benang tegang), lalu dilepas.",
'c05_mesir':"Peta delta Nil disulam di linen; titik desa wakaf berupa French knot menyala satu per satu; benang emas mengalir dari ladang ke bengkel Kairo, lalu ke kafilah unta kecil menuju Hijaz; mahmal sebagai objek tandu berhias, tanpa orang.",
'c06_1927':"Kalender Hijriah 1345 tersulam dengan hitung mundur ke 10 Dzulhijjah; kain wol hitam dibentangkan cepat di meja kerja; peti kayu 'India' terbuka berisi 12 alat tenun miniatur; kafilah benang berhenti di batas peta. Bentrokan 1926 hanya sebagai tanggal dan garis terputus, tanpa kekerasan.",
'c07_pabrik':"Makro: gulungan sutra putih dicelup hitam; benang lungsin jacquard turun seperti hujan vertikal; pita ornamen geometris timbul diisi katun kuning lalu dibalut kawat perak-emas; balok bahan berlabel (825 kg sutra, 410 kg katun, 120 kg perak bersepuh emas, 60 kg perak); 47 panel jatuh menyusun balok Ka'bah. Ornamen abstrak, bukan huruf tiruan.",
'c08_ganti':"Time-lapse arsitektural maket: empat sisi kain hitam naik seperti layar, kain lama meluncur turun di bawahnya; kalender bergeser dari 9 Dzulhijjah ke 1 Muharram; pita putih 2 m melingkari dasar; tangan tanpa wajah memotong kain lama; potongan bersulam dalam kotak kaca.",
'c09_payoff':"Kamera mundur memperlihatkan seluruh garis waktu tersulam: swatch pelepah, linen putih, merah, hijau, hitam berjajar; kilau emas terakhir menyapu pita ornamen; judul penutup + outro AUDIRA.",
}
L=["# Naskah — SEJARAH MAKKAH · EP04 · Kiswah, Kain Penutup Ka'bah","",
"Format: video panjang 16:9 (1920×1080 @ 30) + 2 short 9:16 turunan. Narator tunggal: Cartesia, suara Galang, bahasa Indonesia. Style: SULAMFORGE.",
"Estimasi durasi = kata / 140 × 60. Sumber angka: `research/SOURCE_REGISTER.md`; frasa angka yang berbeda antar sumber mengikuti tabel Sengketa di `research/RESEARCH_REPORT.md`.",
"Teks narasi di bawah identik dengan `audio/vo-chapters.json`. Angka dan tahun ditulis dalam bentuk ucapan.",""]
T=0;t=0.0
for c in d['chapters']:
  n=len(c['text'].split()); s=n/140*60; T+=n
  L+=[f"## {c['id']} — {c['title']}",f"- Kata: **{n}** · estimasi **{s:.0f} dtk** · VO terkunci: **{fmt(REAL[c['id']]['start'])} → {fmt(REAL[c['id']]['end'])}** ({REAL[c['id']]['end']-REAL[c['id']]['start']:.0f} dtk)",f"- Visual: {vis[c['id']]}","",c['text'],""]
  t+=s
L+=["---",f"**VO terkunci (audio/timeline.json): narasi berakhir {fmt(TLJ['voEnd'])}, film {fmt(TLJ['total'])} termasuk end screen 20 dtk.**","",f"**Total: {T} kata ≈ {T/140*60:.0f} dtk ≈ {T/140:.1f} menit** (140 WPM; pada 135–150 WPM: {T/150:.1f}–{T/135:.1f} menit).","",
"Chapter isi (c02–c08) masing-masing 60–93 dtk dan dibuka dengan kalimat re-hook (pertanyaan atau janji). Hook 0–26 dtk, intro sampai ±41 dtk menyebut Audira sekali. End screen memakai 20 dtk terakhir (CTA + penutup).","",
"## Segmen short (9:16)",""]
for s in d['shorts']:
  ch=[c for c in d['chapters'] if c['id']==s['reuse'][0]][0]
  a=ch['text'].index(s['reuseFrom']); b=ch['text'].index(s['reuseTo'])+len(s['reuseTo'])
  body=ch['text'][a:b]; n=len(s['hook'].split())+len(body.split())+len(s['outro'].split())
  L+=[f"### {s['id']} — {s['title']}",f"- Memakai narasi `{ch['id']}` dari \"{s['reuseFrom']}\" sampai \"{s['reuseTo']}\".",
      f"- Hook baru (0–3 dtk): \"{s['hook']}\"",f"- Penutup: \"{s['outro']}\"",f"- Estimasi: {n} kata ≈ **{n/140*60:.0f} dtk**",""]
L+=["## Catatan kepekaan","- Tidak ada sosok nabi, malaikat, atau sahabat dalam bentuk apa pun; kehadiran hanya lewat tempat, kain, dan cahaya.",
"- Ka'bah tampil hanya sebagai balok hitam bermartabat dengan sabuk emas, pintu, dan sudut Hajar Aswad; tidak pernah rusak.",
"- Pita kaligrafi pada kiswah digambarkan sebagai ornamen geometris abstrak, bukan huruf Arab tiruan. Bila teks Arab dipakai di Stage B, harus teks persis dari file ayat dengan rujukan.",
"- Insiden 1926 dan penolakan 1962 disampaikan netral sebagai fakta, tanpa adegan kekerasan.",
"- Angka yang berubah per tahun selalu disertai tahun datanya (2025 bahan, 2026 pengrajin dan waktu)."]
open('docs/SCRIPT.md','w',encoding='utf-8').write("\n".join(L)+"\n")
