# SOCIAL_CAPTIONS.md for season 2 (16:9 long-form on YouTube, clips/teasers on the other platforms).
# 6 platforms + Jadwal Upload (WIB) + Label Konten AI. usage (from series root): python _tools/captions_s2.py
import json, re

def mmss(t):
    t = int(t); return f"{t // 60}:{t % 60:02}"

CHAP = {'ep07': ['Pembuka', 'Lampu kuning, lampu merah', 'Peluit polisi', 'Sahabat lama', 'Selembar kertas', 'Isi surat Bobby', 'Pulang perlahan', 'Hikmah'], 'ep08': ['Pembuka', 'Gadis tercantik di pesta', 'Ajakan minum kopi', 'Garam untuk kopi', 'Semua mata menoleh', 'Laut dan kampung halaman', 'Jatuh hati', 'Bertahun-tahun kopi asin', 'Kepergian sang suami', 'Surat terakhir', 'Rasanya manis', 'Hikmah'], 'ep09': ['Pembuka', 'Rumah sang guru', 'Pengakuan', 'Hukuman bantal', 'Bulu-bulu beterbangan', 'Baru separuh', 'Mencari di senja hari', 'Hikmah'], 'ep10': ['Pembuka', 'Pulau para perasaan', 'Badai datang', 'Kekayaan', 'Kegembiraan', 'Kecantikan', 'Kesedihan', 'Lelaki tua', 'Siapa dia?', 'Hikmah'], 'ep11': ['Pembuka', 'Pemuda yang putus asa', 'Semua keluh kesah', 'Segelas air garam', 'Berjalan ke telaga', 'Garam di telaga', 'Gelas atau telaga', 'Pulang']}
EPS = {
 "ep07": dict(folder="EP07_DUKA_DI_PERJALANAN", n=7, title="Duka di Perjalanan", style="film noir hitam-putih",
  hook="Ia hanya menerobos satu lampu merah. Lalu sahabat lamanya menyelipkan selembar kertas.",
  cover="SATU MENIT DI LAMPU MERAH",
  logline="Jack terburu-buru pulang di hari ulang tahun istrinya dan menerobos lampu merah. Polisi yang menghentikannya ternyata Bobby, sahabatnya semasa sekolah. Bobby menulis sesuatu dengan dingin, lalu pergi. Isi kertas itu mengubah cara Jack berkendara selamanya.",
  points=["Jack menerobos lampu merah karena terburu-buru", "Polisi yang menghentikannya adalah sahabat lamanya", "Bobby bersikap dingin dan tetap menulis", "Kertas itu bukan surat tilang", "Isinya kisah duka yang tak pernah Jack tahu"],
  moral="Apa yang sepele bagi kita belum tentu sepele bagi orang lain. Satu menit menunggu bisa menjaga seumur hidup orang lain.",
  analogy="Lampu merah itu seperti jeda satu menit yang kita anggap mengganggu, padahal bagi orang lain jeda itu adalah batas antara pulang dan tidak pernah pulang.",
  question="Pernah menerobos lampu merah karena terburu-buru? Apa yang membuatmu berhenti melakukannya?",
  tags=["#CeritaHikmah", "#DukaDiPerjalanan", "#LampuMerah", "#KisahInspiratif", "#AUDIRA"],
  kw=["Jack", "Bobby", "lampu merah"]),
 "ep08": dict(folder="EP08_KOPI_ASIN", n=8, title="Mata Cinta Kopi Asin", style="dunia kain flanel (feltcraft)",
  hook="Ia minum kopi asin selama puluhan tahun. Alasannya baru terungkap lewat sepucuk surat.",
  cover="KOPI ASIN SEUMUR HIDUP",
  logline="Seorang pria biasa mengajak gadis tercantik di pesta minum kopi. Karena gugup, ia meminta garam untuk kopinya, lalu bercerita tentang laut dan kampung halaman. Mereka menikah, dan setiap pagi sang istri membuatkannya kopi asin. Setelah ia tiada, istrinya menemukan suratnya.",
  points=["Pria biasa memberanikan diri mengajak gadis tercantik", "Karena gugup ia meminta garam, bukan gula", "Kisah laut dan kampung halaman membuat sang gadis jatuh hati", "Puluhan tahun ia minum kopi asin tanpa mengeluh", "Surat terakhirnya mengungkap pengorbanan kecil itu"],
  moral="Cinta sering hadir dalam pengorbanan kecil yang ditelan diam-diam setiap hari. Hargailah mereka, selagi kopinya masih hangat.",
  analogy="Seperti sesendok garam yang larut tanpa terlihat, pengorbanan kecil orang yang kita cintai sering tidak pernah kita sadari.",
  question="Pengorbanan kecil apa dari pasangan atau orang tuamu yang baru kamu sadari belakangan?",
  tags=["#CeritaHikmah", "#KopiAsin", "#KisahCinta", "#KisahInspiratif", "#AUDIRA"],
  kw=["kopi asin", "garam", "surat"]),
 "ep09": dict(folder="EP09_MEMAAFKAN", n=9, title="Memaafkan", style="kota low-poly pastel (polyverse)",
  hook="Seorang pria disuruh merobek bantal di alun-alun. Lalu disuruh mengumpulkan kembali semua bulunya.",
  cover="BISAKAH KATA DITARIK?",
  logline="Seorang pria yang sering memfitnah, berbohong, dan bergosip datang kepada seorang guru bijak untuk meminta maaf. Sang guru menyuruhnya merobek bantal di alun-alun hingga bulu-bulunya terbang. Setelah itu, ia diminta mengumpulkan semuanya kembali.",
  points=["Pria itu menyesal telah memfitnah dan bergosip", "Sang guru menyuruhnya merobek bantal di alun-alun", "Ribuan bulu terbang ke atap, sungai, dan bukit", "Ia baru menjalankan separuh hukumannya", "Mengumpulkan kembali semua bulu itu mustahil"],
  moral="Kata-kata seperti bulu yang tertiup angin: sekali terucap, tak bisa ditarik kembali. Jagalah lisanmu, sebelum kata-katamu terbang.",
  analogy="Minta maaf itu seperti menyapu halaman: halamannya bersih lagi, tapi bulu yang sudah terbang ke rumah tetangga tidak ikut kembali.",
  question="Pernah menyesali kata-kata yang terlanjur terucap? Bagaimana kamu memperbaikinya?",
  tags=["#CeritaHikmah", "#Memaafkan", "#JagaLisan", "#KisahInspiratif", "#AUDIRA"],
  kw=["bantal", "bulu", "guru"]),
 "ep10": dict(folder="EP10_CINTA_DAN_WAKTU", n=10, title="Cinta dan Waktu", style="jendela kaca patri (stained glass)",
  hook="Saat pulau tenggelam, Kekayaan, Kegembiraan, Kecantikan, dan Kesedihan menolak menolong Cinta. Lalu datang seorang lelaki tua.",
  cover="SIAPA YANG MENOLONG CINTA?",
  logline="Di sebuah pulau tinggal Cinta, Kekayaan, Kegembiraan, Kecantikan, dan Kesedihan. Badai datang dan pulau mulai tenggelam. Satu per satu mereka menolak membawa Cinta, sampai seorang lelaki tua menyelamatkannya lalu pergi tanpa menunggu terima kasih.",
  points=["Kekayaan menolak karena perahunya penuh harta", "Kegembiraan terlalu gembira untuk mendengar", "Kecantikan takut perahunya kotor", "Kesedihan ingin sendirian", "Yang menolong Cinta ternyata Sang Waktu"],
  moral="Hanya waktu yang tahu berapa nilai sesungguhnya dari cinta. Jagalah cinta, sebelum waktu yang mengajarkan harganya kepadamu.",
  analogy="Seperti barang yang baru terasa berharga setelah hilang, nilai cinta sering baru kita pahami setelah waktu berlalu.",
  question="Menurutmu, kenapa hanya Waktu yang mau menolong Cinta?",
  tags=["#CeritaHikmah", "#CintaDanWaktu", "#KisahCinta", "#KisahInspiratif", "#AUDIRA"],
  kw=["Cinta", "Waktu", "Kekayaan"]),
 "ep11": dict(folder="EP11_SEGENGGAM_GARAM", n=11, title="Kearifan Segenggam Garam", style="dunia dalam kaca (terrarium)",
  hook="Segenggam garam di dalam gelas terasa pahit. Segenggam garam yang sama di telaga tidak terasa sama sekali.",
  cover="GELAS ATAU TELAGA?",
  logline="Seorang pemuda yang hidupnya gagal datang kepada lelaki tua yang bijak. Lelaki tua itu melarutkan segenggam garam di gelas dan menyuruhnya minum. Lalu ia membawanya ke telaga dan menaburkan garam yang sama.",
  points=["Pemuda itu gagal dalam mimpi, karier, dan cinta", "Segenggam garam di gelas terasa sangat pahit", "Garam yang sama ditaburkan ke telaga", "Air telaga tetap segar tanpa rasa asin", "Rasa pahit tergantung luasnya wadah, yaitu hati"],
  moral="Kepahitan hidup itu seperti segenggam garam, jumlahnya selalu sama. Jangan jadikan hatimu seperti gelas, jadikanlah seperti telaga.",
  analogy="Masalah yang sama terasa ringan bagi orang berhati luas dan terasa berat bagi orang berhati sempit, seperti garam di telaga dan di gelas.",
  question="Saat ini hatimu lebih mirip gelas atau telaga?",
  tags=["#CeritaHikmah", "#SegenggamGaram", "#KesehatanMental", "#KisahInspiratif", "#AUDIRA"],
  kw=["garam", "telaga", "gelas"]),
}
SCHEDULE = ["Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

for i, (ep, d) in enumerate(EPS.items()):
    tl = json.load(open(f"studio_16x9/src/scenes/{ep}/timeline.json", encoding="utf-8"))
    starts = {}
    for c in tl["clips"]:
        starts.setdefault(re.match(r"s\d+", c["id"]).group(0), (c["start"], c["text"]))
    chap = []
    for (k, (t, text)), label in zip(starts.items(), CHAP[ep]):
        chap.append(f"{'0:00' if not chap else mmss(t)} {label}")
    assert len(starts) == len(CHAP[ep]), (ep, len(starts))
    chap = "\n".join(chap)
    dur = mmss(tl["total"]); T = d["title"]; tags = " ".join(d["tags"])
    pts = "\n".join(f"{j}. {p}" for j, p in enumerate(d["points"], 1))
    single = f"{d['hook']} Tonton kisah lengkapnya ({dur}) di YouTube. {d['tags'][0]} {d['tags'][1]}"
    if len(single) > 280: single = f"{d['hook']} {d['tags'][0]} {d['tags'][1]}"
    prev = f"Cerita Hikmah EP{d['n']-1:02}" if d["n"] > 7 else "Cerita Hikmah EP06 Jessica"
    day = SCHEDULE[i]
    md = f"""# SOCIAL CAPTIONS: Cerita Hikmah EP{d['n']:02}, {T}

Video utama: `FINAL_VIDEO.mp4`, 16:9 1920x1080 @ 60 fps, {dur}, untuk YouTube (video panjang, bukan Shorts). Gaya: {d['style']}. Kisah dituturkan ulang dari cerita hikmah populer; narasi suara AI (Cartesia). Platform lain: unggah video 16:9 apa adanya atau potongan teaser 60-90 detik dari bagian awal, dengan tautan ke YouTube.

## TikTok
**Hook:** {d['hook']}
**Teks sampul:** {d['cover']}
**Caption:** {d['logline']} {d['moral']} Kisah lengkapnya ada di YouTube AUDIRA.
{tags} #fyp
**Komentar pin:** Cerita Hikmah episode {d['n']}. Dituturkan ulang dari kisah hikmah yang populer di Indonesia; animasi dan narasi oleh AUDIRA. Episode sebelumnya: {prev}. {d['question']}

## Instagram Reels
**Teks sampul:** {d['cover']}
**Caption:**
{d['hook']}

{pts}

{d['moral']}

**Audio cue:** pakai suara asli video, narasi di depan dengan musik pelan.
**CTA:** {d['question']} Tulis di kolom komentar.
{tags} #reels

## YouTube (video panjang 16:9)
**Judul:** {T}: {d['cover'].capitalize()} | Cerita Hikmah EP{d['n']:02}
**Alternatif judul:** {d['hook'][:95]}
**Deskripsi:**
{d['logline']}

{d['moral']}

Chapters:
{chap}

Cerita Hikmah adalah seri animasi kisah penuh makna dari AUDIRA. Episode sebelumnya: {prev}. Tonton seluruh seri di playlist "Cerita Hikmah".
Animasi: AUDIRA. Narasi: suara AI.
{tags}
**Tags:** cerita hikmah, {T.lower()}, kisah inspiratif, renungan, cerita motivasi, animasi cerita, kisah penuh makna, audira
**Komentar pin:** Cerita Hikmah episode {d['n']}. {d['question']} Playlist lengkap Cerita Hikmah ada di channel AUDIRA.
**Thumbnail:** `style/cover-topic.png` (1920x1080, perkecil ke 1280x720), teks "{d['cover']}" bila perlu ditebalkan.
**Subtitle:** unggah `SUBTITLES.srt` (Bahasa Indonesia) ke YouTube Studio.
**End screen:** 20 detik terakhir sebelum outro, tautkan ke episode berikutnya dan playlist Cerita Hikmah.

## Facebook
**Teks sampul:** {d['cover']}
{d['hook']}

{d['logline']}

{d['analogy']}

{d['moral']}

{d['question']} Ceritakan di komentar, siapa tahu bisa jadi pengingat buat yang lain.
Unggah `SUBTITLES.srt` saat posting video.
{tags}

## X (Twitter)
**Cuitan tunggal:**
{single}

**Utas:**
1/ {d['hook']} {d['tags'][0]}
2/ {d['logline'][:270]}
3/ {d['analogy'][:270]}
4/ {d['moral'][:240]} {d['tags'][1]}

## Threads
**Post pembuka:**
{d['hook']} Kisah lengkapnya ({dur}) ada di YouTube AUDIRA. {d['tags'][0]}

**Utas:**
{d['logline']}
{d['moral']}
{d['question']}

## Jadwal Upload (WIB)
- YouTube: {day}, 19.00 WIB (video utama)
- TikTok: {day}, 19.20 WIB
- Instagram Reels: {day}, 19.40 WIB
- Facebook: {day}, 20.00 WIB
- X (Twitter): {day}, 20.20 WIB
- Threads: {day}, 20.40 WIB
Default awal dari pola umum penonton Indonesia (slot malam), bukan data akun. Setelah 2-4 minggu ganti dengan jam aktif dari YouTube Studio, TikTok Analytics, dan Instagram Insights, lalu catat di NOTES.md.

## Label Konten AI
- TikTok: aktifkan "AI-generated content".
- YouTube: centang "Altered or synthetic content" (narasi dan visual dibuat dengan AI).
- Facebook dan Instagram: label "AI info".
"""
    open(f"{d['folder']}/SOCIAL_CAPTIONS.md", "w", encoding="utf-8").write(md)
    print(d["folder"], "ok single", len(single))
