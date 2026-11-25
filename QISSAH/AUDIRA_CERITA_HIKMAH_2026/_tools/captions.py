# SOCIAL_CAPTIONS.md per episode (6 platforms), chapters from the real voice timeline.
# usage (from series root): python _tools/captions.py
import json

def mmss(t):
    t = int(t); return f"{t // 60}:{t % 60:02}"

EPS = {
 "ep02": dict(folder="EP02_TEMPAYAN_RETAK", title="Tempayan Retak", style="tanah liat berurat emas (kintsugi)",
  hook="Tempayan ini retak dan selalu bocor. Tapi lihat apa yang tumbuh di jalannya.",
  cover="RETAK TAPI BERGUNA",
  logline="Seorang tukang air di India memikul dua tempayan. Yang satu retak dan hanya sampai dengan air setengah. Dua tahun ia malu, sampai tukang air menunjukkan bunga-bunga yang tumbuh hanya di sisi jalannya.",
  points=["Tempayan retak selalu tiba dengan air setengah", "Dua tahun ia malu pada dirinya sendiri", "Tukang air sudah tahu soal retakan itu", "Ia menanam benih di sisi jalan tempayan retak", "Air yang bocor justru menyiram bunga setiap hari"],
  moral="Kita semua adalah tempayan retak. Jangan takut pada retakanmu, mungkin dari sanalah bunga-bunga tumbuh.",
  analogy="Seperti pot bocor yang tanpa sadar menyiram taman di sepanjang jalan, kekurangan kita bisa jadi berkah buat orang lain.",
  question="Kekurangan apa dalam dirimu yang ternyata pernah jadi berkah?",
  tags=["#CeritaHikmah", "#TempayanRetak", "#KisahInspiratif", "#Renungan", "#Motivasi", "#AUDIRA"],
  chapters=["Pembuka", "Tukang air dan dua tempayan", "Air yang selalu bocor", "Tempayan retak meminta maaf", "Bunga di sepanjang jalan", "Rahasia tukang air", "Hikmah"],
  kw=["Tempayan Retak", "tukang air", "bunga"]),
 "ep03": dict(folder="EP03_ANJING_KECIL", title="Anjing Kecil", style="animasi plastisin (claymation)",
  hook="Semua hewan di peternakan bilang anjing kecil ini tidak berguna. Lalu malam itu terjadi sesuatu.",
  cover="DIBILANG TAK BERGUNA",
  logline="Seekor anjing kecil yatim piatu diejek kuda, sapi, domba, ayam, dan kucing karena tidak bisa memberi apa-apa. Seekor anjing tua lalu memberinya nasihat, dan malam itu ia menyambut pemilik ladang yang kelelahan.",
  points=["Kuda bangga bisa mengangkut barang berat", "Sapi, domba, ayam, dan kucing ikut mengejek", "Anjing kecil menangis sendirian di tepi kolam", "Anjing tua: pakai kemampuan yang kamu punya", "Sambutan hangatnya menghapus lelah sang pemilik"],
  moral="Kerjakan apa yang kita mampu dengan sebaik-baiknya. Kadang hadiah terbesar kita adalah kehadiran yang membawa bahagia.",
  analogy="Tidak semua orang harus jadi kuda yang kuat atau sapi yang menghasilkan susu. Ada yang tugasnya membuat orang lain tersenyum, dan itu sama berharganya.",
  question="Siapa orang yang kehadirannya selalu bikin lelahmu hilang?",
  tags=["#CeritaHikmah", "#AnjingKecil", "#KisahInspiratif", "#Claymation", "#Motivasi", "#AUDIRA"],
  chapters=["Pembuka", "Kuda yang sombong", "Sapi ikut mengejek", "Domba menyela", "Semua hewan mengejek", "Menangis di tepi kolam", "Nasihat anjing tua", "Pemilik ladang pulang", "Hikmah"],
  kw=["Anjing Kecil", "anjing tua", "pemilik ladang"]),
 "ep04": dict(folder="EP04_PERSAUDARAAN", title="Persaudaraan", style="diorama kertas (papercraft)",
  hook="Setiap malam, sekarung padi hilang dari lumbung ini. Tapi jumlahnya tidak pernah berkurang.",
  cover="PADI YANG TAK PERNAH BERKURANG",
  logline="Dua bersaudara selalu membagi hasil panen sama rata. Diam-diam, masing-masing memindahkan sekarung padi ke lumbung saudaranya setiap malam. Bertahun-tahun, sampai suatu malam mereka bertemu di tengah jalan.",
  points=["Hasil panen selalu dibagi sama rata", "Adik merasa kakak lebih butuh karena keluarganya besar", "Kakak merasa adik lebih butuh karena hidup sendiri", "Bertahun-tahun isi lumbung tidak pernah berubah", "Mereka bertemu di bawah bulan purnama"],
  moral="Saudara sejati tidak menghitung apa yang sudah ia beri. Cinta yang diberikan dalam diam adalah perekat yang paling kuat.",
  analogy="Dua orang yang sama-sama menuang air ke gelas satu sama lain: gelasnya tetap penuh, tapi hatinya yang bertambah.",
  question="Pernah tahu belakangan kalau saudaramu diam-diam membantumu?",
  tags=["#CeritaHikmah", "#Persaudaraan", "#KisahInspiratif", "#Keluarga", "#Renungan", "#AUDIRA"],
  chapters=["Pembuka", "Dua bersaudara dan sawah keluarga", "Malam sang adik", "Malam sang kakak", "Bertahun-tahun berlalu", "Bertemu di bawah purnama", "Hikmah"],
  kw=["Persaudaraan", "lumbung", "padi"]),
 "ep05": dict(folder="EP05_KURA_KALAJENGKING", title="Kura-kura dan Kalajengking", style="lukisan tinta (ink wash)",
  hook="Kalajengking ini berjanji tidak akan menyengat. Logikanya masuk akal. Lalu kenapa ia tetap melakukannya?",
  cover="JANJI vs TABIAT",
  logline="Seekor kalajengking yang tidak bisa berenang minta diseberangkan kura-kura. Logikanya meyakinkan: kalau ia menyengat, mereka berdua tenggelam. Di tengah sungai, ia tetap menyengat.",
  points=["Kalajengking tidak bisa berenang", "Kura-kura menolak karena takut disengat", "Logika kalajengking terdengar masuk akal", "Di tengah sungai, ia tetap menyengat", "Alasannya: itu sudah tabiatku"],
  moral="Janji bisa diucapkan siapa saja, tapi tabiat tidak bisa disembunyikan. Kenali dulu karakter seseorang sebelum menjadikannya teman.",
  analogy="Teman itu seperti tombol lift: ia bisa membawamu naik, atau membawamu turun.",
  question="Pernah percaya janji seseorang padahal tabiatnya sudah kelihatan?",
  tags=["#CeritaHikmah", "#KuraKura", "#Kalajengking", "#KisahInspiratif", "#Pertemanan", "#AUDIRA"],
  chapters=["Pembuka", "Di tepi sungai", "Kura-kura menolak", "Logika kalajengking", "Kura-kura setuju", "Menyeberang", "Sengatan", "Tenggelam bersama", "Hikmah"],
  kw=["Kura-kura", "Kalajengking", "tabiat"]),
 "ep06": dict(folder="EP06_JESSICA", title="Jessica", style="buku cerita cat air (watercolor)",
  hook="Kapan terakhir kali kamu bilang \"lain kali saja\" kepada orang yang kamu sayangi?",
  cover="LAIN KALI, PAPA?",
  logline="Jessica ingin ayahnya, Budi, membacakan buku peri kecil yang baru. Budi selalu sibuk dan berkata lain kali. Dua minggu kemudian, lain kali itu tidak pernah datang.",
  points=["Budi sibuk menyiapkan rapat penting", "Jessica meminta dibacakan buku peri kecil", "Jawabannya selalu: lain kali", "Dua minggu, buku itu tak pernah dibacakan", "Budi akhirnya membaca, tapi Jessica sudah pergi"],
  moral="Pekerjaan bisa menunggu, tapi bersama orang yang kita sayangi tidak selalu ada lain kali. Jangan tunggu lain kali.",
  analogy="Laporan kantor bisa dikerjakan ulang besok. Momen membacakan cerita untuk anak tidak bisa diulang.",
  question="Siapa yang hari ini sedang menunggu sedikit waktumu?",
  tags=["#CeritaHikmah", "#Jessica", "#KisahInspiratif", "#Keluarga", "#Renungan", "#AUDIRA"],
  chapters=["Pembuka", "Budi dan buku baru Jessica", "Lain kali", "Dua minggu berlalu", "Sore itu", "Hikmah"],
  kw=["Jessica", "Budi", "lain kali"]),
}

for ep, d in EPS.items():
    tl = json.load(open(f"studio/src/scenes/{ep}/timeline.json", encoding="utf-8"))
    starts = {}
    for c in tl["clips"]:
        scene = c["id"][:2] if c["id"][2].isalpha() else c["id"][:3]
        starts.setdefault(scene, c["start"])
    scenes = list(starts.values()); scenes[0] = 0
    chap = "\n".join(f"{mmss(t)} {name}" for t, name in zip(scenes, d["chapters"]))
    dur = mmss(tl["total"]); T = d["title"]; tags = " ".join(d["tags"][:5])
    pts = "\n".join(f"{i}. {p}" for i, p in enumerate(d["points"], 1))
    single = f"{d['hook']} {d['moral'].split('.')[0]}. {d['tags'][0]} {d['tags'][1]}"
    if len(single) > 280: single = f"{d['hook']} {d['tags'][0]} {d['tags'][1]}"
    md = f"""# SOCIAL CAPTIONS: Cerita Hikmah, {T}

Video: `FINAL_VIDEO.mp4` (1080x1920, {dur}). Gaya: {d['style']}. Kisah dituturkan ulang dari cerita hikmah populer, narasi suara AI (Cartesia).

## TikTok
**Hook:** {d['hook']}
**Teks sampul:** {d['cover']}
**Caption:** {d['logline']} {d['moral']} Tonton sampai akhir.
{tags} #fyp
**Komentar pin:** Cerita ini dituturkan ulang dari kisah hikmah yang populer di Indonesia. Animasi dan narasi dibuat oleh AUDIRA. {d['question']}

## Instagram Reels
**Caption:**
{d['hook']}

{pts}

{d['moral']}

**Audio cue:** pakai suara asli video, musik pelan dengan narasi di depan.
**CTA:** {d['question']} Tulis di kolom komentar.
{tags} #reels

## YouTube Shorts
**Judul:** {T}: {d['cover'].capitalize()} | Cerita Hikmah
**Alternatif judul:** {d['hook'][:90]}
**Deskripsi:**
{d['logline']}

{d['moral']}

Chapters:
{chap}

Animasi: AUDIRA. Narasi: suara AI.
{tags} #shorts
**Tags:** cerita hikmah, {T.lower()}, kisah inspiratif, renungan, cerita motivasi, animasi cerita, dongeng hikmah, audira
**Komentar pin:** {d['question']}
**Thumbnail:** frame terkuat dari film dengan teks "{d['cover']}" besar di tengah atas, judul "{T}" di bawahnya.

## Facebook
{d['hook']}

{d['logline']}

{d['analogy']}

{d['moral']}

{d['question']} Ceritakan di komentar, siapa tahu bisa jadi pengingat buat yang lain.
{tags}

## X (Twitter)
**Cuitan tunggal:**
{single}

**Utas:**
1/ {d['hook']} {d['tags'][0]}
2/ {d['logline'][:270]}
3/ {d['analogy'][:270]}
4/ {d['moral'][:250]} {d['tags'][1]}

## Threads
**Post pembuka:**
{d['hook']} Ini kisahnya, dalam {dur} animasi. {d['tags'][0]}

**Utas:**
{d['logline']}
{d['moral']}
{d['question']}
"""
    open(f"{d['folder']}/SOCIAL_CAPTIONS.md", "w", encoding="utf-8").write(md)
    print(d["folder"], "ok", "single", len(single))
