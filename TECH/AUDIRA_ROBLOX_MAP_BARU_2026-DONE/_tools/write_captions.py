# SOCIAL_CAPTIONS.md (6 platform + jadwal + label AI) dan SUBTITLES.srt untuk 5 short Roblox Map Baru.
# Jalankan: python _tools/write_captions.py   (path dihitung dari lokasi file ini, rule 08)
import os, glob, json

SERIES = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHANNEL = "AUDIRA TECH (@AudiraTECH)"
PLAYLIST = "AUDIRA TECH · Roblox Map Baru"
LAYERED = "#Roblox #RobloxIndonesia #MapRoblox #RobloxStudio #AUDIRA"
SRC = ("Sumber: Roblox Creator Docs (Build, Discovery, Thumbnails, Assistant), Roblox Newsroom (RDC 2026, "
       "How Roblox Evaluates Build, Global Impact of Creation), surat investor Roblox Q3 2026 via PC Gamer & MediaPost, "
       "TweakTown (angka DevEx RDC 2026), Plagiarism Today (klon). Daftar lengkap: research/SOURCE_REGISTER.md.")

EP = {
"EP01": dict(
  title="70.000 Game Roblox Lahir dari AI dalam Beberapa Bulan",
  alts=["Cuma Ngetik 1 Kalimat, Jadi Game Roblox? Ini Build", "Ledakan Map Roblox Baru: 70.000 Game dari AI", "80% Game Top Roblox Sudah Pakai AI"],
  cover="70.000 GAME DARI AI", day="Rabu, 25 November 2026",
  hook="Lebih dari 70.000 game Roblox baru lahir dari satu kalimat yang diketik di HP.",
  cap="Fitur AI bernama Build bikin game dari prompt. Uji cobanya mulai Juli 2026 di Selandia Baru, dan surat investor Q3 menyebut lebih dari 500.000 orang sudah memakainya dan menerbitkan lebih dari 70.000 game. Tapi ada sisi gelapnya: klon game viral ikut membanjir.",
  points=["Build = fitur AI di aplikasi Roblox: tulis ide, AI merakit game (uji coba Juli 2026, Selandia Baru).",
          "Per awal September ±9.000 game terbit; 71% pembuatnya belum pernah membuka Roblox Studio.",
          "Surat investor Q3 2026: >500.000 pengguna Build, >70.000 game terbit.",
          ">80% dari 100 game teratas memakai alat AI; hasil meleset turun dari 18% ke 3%.",
          "Sisi gelap: klon game viral muncul, kadang sebelum game aslinya rilis."],
  cue="Dengarkan bunyi balok yang menyusun menara map saat angka 70.000 muncul.",
  desc="Roblox punya fitur AI baru bernama Build: tulis ide game dalam satu kalimat, AI yang merakitnya. Video ini membahas ledakan map baru di Roblox 2026: dari uji coba di Selandia Baru, 500.000 pengguna dan 70.000 game, 80% game teratas yang memakai AI, sampai sisi gelapnya, yaitu banjir game klon.",
  tags="Roblox, Roblox Build, AI Roblox, map Roblox baru, bikin game Roblox, Roblox Studio, game AI, Break and Steal an Egg, Huss Valley, klon game Roblox, Roblox 2026, AUDIRA TECH",
  thumb="Menara mini-map dari balok mainan yang tersusun dari prompt di tablet, avatar balok bersorak, teks 70.000 GAME DARI AI.",
  fb="Bayangkan kamu cukup mengetik 'bikin obby lava dan arena balap', lalu game-nya jadi. Itu yang terjadi di Roblox sekarang lewat fitur AI bernama Build. Lebih dari 70.000 game sudah terbit dengan cara ini. Ibarat pabrik balok yang tiba-tiba bisa merakit sendiri. Masalahnya, makin gampang bikin game, makin gampang juga menjiplak.",
  ask="Menurutmu, game buatan AI bakal menenggelamkan kreator manusia atau malah membantu?",
  single="Roblox Build: ketik 1 kalimat, jadi game. >500.000 pengguna, >70.000 game terbit, >80% game top 100 pakai AI. Sisi gelapnya: klon ikut banjir. #Roblox #AUDIRA",
  thread=["1/ Lebih dari 70.000 game Roblox baru lahir dari prompt teks. Ini fitur AI bernama Build. #Roblox",
          "2/ Uji coba mulai Juli 2026 di Selandia Baru. Per awal September ±9.000 game terbit, 71% pembuatnya belum pernah buka Roblox Studio.",
          "3/ Surat investor Q3: >500.000 orang pakai Build, >70.000 game terbit. Roblox sendiri menyebutnya ledakan konten.",
          "4/ Sisi gelap: klon game viral bermunculan, kadang sebelum game aslinya rilis. Bikin map gampang, bikin map yang beda itu langka. #RobloxStudio #AUDIRA"],
  threads=["Lebih dari 70.000 game Roblox baru lahir dari satu kalimat yang diketik di HP. Namanya Build. #Roblox",
           "Surat investor Q3 2026: lebih dari 500.000 orang sudah memakai Build, dan lebih dari 80% dari 100 game teratas memakai alat AI. Hasil AI yang meleset turun dari 18% jadi 3%.",
           "Tapi klon game viral ikut banjir, kadang sebelum game aslinya rilis. Sekarang bikin map gampang. Bikin map yang beda, itu yang langka. Kamu tim AI atau tim bikin manual?"],
  prev="Episode pertama seri ini."),
"EP02": dict(
  title="28% Game Top Roblox Umurnya Belum 90 Hari, Tapi Cuannya Timpang",
  alts=["Map Roblox Baru Bisa Viral dalam 90 Hari", "Top 10 Kreator Roblox Rata-rata US$65,7 Juta, Median Cuma US$1.500", "Grow a Garden & Steal a Brainrot: Map Baru Menyalip"],
  cover="MAP BARU, CUAN TIMPANG", day="Kamis, 26 November 2026",
  hook="Hampir sepertiga game paling ramai di Roblox umurnya belum genap tiga bulan.",
  cap="Agustus 2026: 28% dari 100 game teratas Roblox baru diluncurkan dalam 90 hari. Grow a Garden dan Steal a Brainrot pernah dimainkan lebih dari 20 juta orang sekaligus. Tapi cuannya timpang: top 10 kreator rata-rata US$65,7 juta, median cuma ±US$1.500 setahun.",
  points=["28% dari 100 game teratas (Agu 2026) diluncurkan dalam 90 hari terakhir.",
          "Grow a Garden dan Steal a Brainrot pernah tembus >20 juta pemain serentak.",
          "Kreator dapat ±US$1,7 miliar lewat DevEx dalam 12 bulan sampai Juni 2026; >US$5 miliar sejak 2013.",
          "Top 10 rata-rata US$65,7 juta, top 100 US$10,8 juta, top 1.000 US$1,4 juta.",
          "Median >42.000 kreator DevEx cuma ±US$1.500/tahun; 83% kreator AS yang disurvei adalah perorangan."],
  cue="Dengarkan denting koin saat batang pendapatan tumbuh ke US$65,7 juta.",
  desc="Map Roblox baru bisa menyalip game lama dengan cepat: 28% dari 100 game teratas Agustus 2026 berumur kurang dari 90 hari. Tapi pembagian uangnya sangat timpang. Video ini memperlihatkan angka DevEx dari RDC 2026 sebagai patung data 3D: top 10, top 100, top 1.000, dan median kreator.",
  tags="Roblox, DevEx, penghasilan kreator Roblox, map Roblox viral, Grow a Garden, Steal a Brainrot, 99 Nights in the Forest, RDC 2026, game Roblox baru, Robux ke uang, AUDIRA TECH",
  thumb="Patung data kuningan dan aluminium: menara oranye US$65,7 juta di samping koin median kecil, avatar balok melambai, teks MAP BARU, CUAN TIMPANG.",
  fb="Di Roblox, map baru bisa menyalip game lama dalam hitungan bulan. Agustus lalu, hampir sepertiga dari 100 game teratas baru berumur kurang dari 90 hari. Uangnya juga nyata: sekitar US$1,7 miliar dibayar ke kreator dalam setahun. Tapi coba lihat pembagiannya. Sepuluh kreator teratas rata-rata dapat US$65,7 juta, sementara kreator di tengah cuma sekitar US$1.500 setahun. Ibarat satu lapangan, tapi tribunnya beda kelas.",
  ask="Kalau kamu bikin map Roblox, mana yang lebih penting: viral cepat atau pemain betah lama?",
  single="28% game top 100 Roblox umurnya <90 hari. Tapi top 10 kreator rata-rata US$65,7 juta, median ±US$1.500/tahun. Peluang terbuka, tapi timpang. #Roblox #AUDIRA",
  thread=["1/ Hampir sepertiga game paling ramai di Roblox umurnya belum 3 bulan. #Roblox",
          "2/ Agustus 2026: 28% dari 100 game teratas diluncurkan dalam 90 hari. Grow a Garden & Steal a Brainrot pernah >20 juta pemain serentak.",
          "3/ DevEx: ±US$1,7 miliar ke kreator dalam 12 bulan s.d. Juni 2026. Top 10 rata-rata US$65,7 juta, top 100 US$10,8 juta, top 1.000 US$1,4 juta.",
          "4/ Median dari >42.000 kreator: ±US$1.500/tahun. Yang membedakan bukan modal, tapi map yang bikin pemain betah. #RobloxIndonesia #AUDIRA"],
  threads=["Hampir sepertiga game paling ramai di Roblox umurnya belum genap tiga bulan. #Roblox",
           "Agustus 2026, 28% dari 100 game teratas baru berumur kurang dari 90 hari. Kreator menerima sekitar US$1,7 miliar lewat DevEx dalam setahun.",
           "Tapi top 10 kreator rata-rata US$65,7 juta, sementara median lebih dari 42.000 kreator cuma sekitar US$1.500 setahun. Kabar baiknya, 83% kreator AS yang disurvei adalah perorangan. Kamu pilih bikin map cepat viral atau map yang bikin betah?"],
  prev="Episode sebelumnya: EP01 70.000 Game dari AI."),
"EP03": dict(
  title="Map Roblox Barumu Dinilai dalam 60 Detik Pertama",
  alts=["Cara Kerja Algoritma Rekomendasi Roblox", "Kenapa Map Roblox Barumu Sepi? Ini Sinyal Algoritmanya", "4 Sinyal yang Bikin Map Roblox Masuk Rekomendasi"],
  cover="60 DETIK PENENTU MAPMU", day="Jumat, 27 November 2026",
  hook="Map barumu dinilai dalam 60 detik pertama. Kalau pemain kabur sebelum itu, algoritma mencatatnya.",
  cap="Menurut dokumen resmi Roblox, sinyal terpenting untuk Rekomendasi: play through rate, first play bounce rate (keluar <60 detik itu sinyal negatif), berapa hari pemain kembali (D1, D2–7, D8–28), dan lama main (maks 60 menit/hari). Tipsnya: langsung bawa pemain ke bagian seru.",
  points=["Play through rate: dari yang melihat gamemu, berapa yang benar-benar masuk main.",
          "First play bounce rate: pemain baru yang keluar <60 detik atau <3 menit = sinyal negatif.",
          "Play days: hari pertama, hari 2–7, dan hari 8–28.",
          "Lama main dihitung maksimal 60 menit per pemain per hari; ada juga main bareng teman dan belanja.",
          "Tips onboarding: ajarkan inti permainan cepat, langsung ke bagian seru, level awal gampang naik."],
  cue="Dengarkan detak jam saat pemain jatuh lewat pintu jebakan sebelum 60 detik.",
  desc="Kenapa map Roblox baru ada yang langsung naik dan ada yang tenggelam? Video ini menjelaskan sinyal resmi algoritma Rekomendasi Roblox (Creator Docs: Discovery) sebagai mesin isometrik: play through rate, first play bounce rate, play days, lama main, fase uji gelombang pemain baru, serta tips onboarding dari dokumentasi Roblox.",
  tags="algoritma Roblox, rekomendasi Roblox, Roblox discovery, play through rate, bounce rate, retensi pemain, onboarding Roblox, tips map Roblox, RDC 2026, Roblox Studio, AUDIRA TECH",
  thumb="Mesin isometrik bergaya komik dengan jam 60 detik raksasa, avatar berlari ke zona SERU, pipa ke REKOMENDASI, teks 60 DETIK PENENTU MAPMU.",
  fb="Pernah bikin map Roblox tapi sepi? Bisa jadi masalahnya ada di menit pertama. Roblox menilai game dari berapa orang yang klik lalu benar-benar main, dan berapa yang langsung keluar sebelum 60 detik. Ibarat warung baru: kalau pembeli pertama langsung pergi, orang lain ikut ragu masuk. Kabar baiknya, ini bisa diperbaiki: ajarkan inti permainan cepat, langsung ke bagian seru, dan sisakan rasa penasaran supaya mereka kembali besok.",
  ask="Bagian apa yang paling bikin kamu betah di 60 detik pertama sebuah game?",
  single="Roblox menilai map barumu dari 60 detik pertama: play through rate, bounce <60 dtk (sinyal negatif), hari kembali D1/D2–7/D8–28, lama main maks 60 mnt/hari. #Roblox #AUDIRA",
  thread=["1/ Map Roblox barumu dinilai dalam 60 detik pertama. Ini sinyal resminya. #Roblox",
          "2/ Play through rate: berapa yang melihat lalu benar-benar masuk. First play bounce: keluar <60 detik atau <3 menit = negatif.",
          "3/ Play days: D1, D2–7, D8–28. Lama main dihitung maks 60 menit/pemain/hari. Sejak RDC 2026, penilaian melihat sampai 28 hari.",
          "4/ Tips: ajarkan inti permainan cepat, langsung ke bagian seru, level awal gampang naik, sisakan rasa penasaran. #RobloxStudio #AUDIRA"],
  threads=["Map Roblox barumu dinilai dalam 60 detik pertama. Kalau pemain kabur sebelum itu, algoritma mencatatnya sebagai tanda buruk. #Roblox",
           "Sinyal resminya: play through rate, first play bounce rate (<60 detik), hari pemain kembali (D1, D2–7, D8–28), dan lama main maksimal 60 menit per hari.",
           "Tipsnya: ajarkan inti permainan secepatnya, langsung ke bagian seru, buat level awal gampang naik, dan sisakan rasa penasaran. Game apa yang menurutmu paling jago di menit pertama?"],
  prev="Episode sebelumnya: EP02 Map Viral 90 Hari."),
"EP04": dict(
  title="Tanpa Ini, Map Roblox Barumu Tidak Muncul di Beranda",
  alts=["Rahasia Thumbnail Roblox: Naik 8,5% Rata-rata", "Thumbnail Roblox yang Benar (Ukuran & Personalisasi)", "Jangan Pakai Judul 'Robux Gratis' di Map Roblox"],
  cover="THUMBNAIL ANTI TENGGELAM", day="Sabtu, 28 November 2026",
  hook="Tanpa satu gambar ini, map barumu tidak akan pernah muncul di beranda Roblox.",
  cap="Menurut dokumen resmi Roblox, thumbnail buatan sendiri wajib agar game bisa direkomendasikan di beranda. Format 16:9, ideal 1920×1080, maks 3 MB. Aktifkan 2–5 thumbnail: dalam uji cobanya rata-rata naik 8,5%, ada game yang naik sampai 50%. Judul 'Robux gratis' justru tidak diprioritaskan.",
  points=["Thumbnail kustom wajib untuk impresi dari rekomendasi beranda; thumbnail bawaan tidak memenuhi syarat.",
          "Format 16:9, ideal 1920×1080 piksel, maksimal 3 MB.",
          "Personalisasi 2–5 thumbnail: rata-rata +8,5%, sebagian game sampai +50%.",
          "Video thumbnail: gameplay asli, tanpa narasi, maks 3 unggahan per bulan.",
          "Judul umpan seperti 'Robux gratis' tidak diprioritaskan; metadata tak sesuai isi makin jarang tampil."],
  cue="Dengarkan dengung CRT dan cipratan air saat thumbnail ROBUX! tenggelam.",
  desc="Thumbnail menentukan apakah map Roblox barumu muncul di beranda. Video ini merangkum aturan resmi Roblox Creator Docs: thumbnail kustom yang wajib, ukuran 16:9 1920×1080 maks 3 MB, personalisasi 2–5 thumbnail (+8,5% rata-rata), aturan video thumbnail, larangan judul umpan, dan tab Moments.",
  tags="thumbnail Roblox, ukuran thumbnail Roblox, personalisasi thumbnail, Roblox beranda, tips map Roblox, Roblox Moments, judul game Roblox, Roblox Creator Docs, Roblox Studio, AUDIRA TECH",
  thumb="Dinding layar CRT neon, avatar balok berlari keluar dari layar utama, TV ROBUX! tenggelam di air, teks THUMBNAIL ANTI TENGGELAM.",
  fb="Kamu bisa bikin map Roblox paling seru sedunia, tapi kalau thumbnail-nya masih bawaan, game-mu tidak akan direkomendasikan di beranda. Itu aturan resmi Roblox. Kabar baiknya, kamu bisa memasang 2 sampai 5 thumbnail sekaligus dan biarkan Roblox memilih yang paling cocok untuk tiap pemain. Ibarat etalase toko yang bisa ganti tampilan sesuai siapa yang lewat. Hasil uji cobanya rata-rata naik 8,5%.",
  ask="Thumbnail game Roblox mana yang paling bikin kamu pengin klik?",
  single="Map Roblox tanpa thumbnail kustom tidak muncul di rekomendasi beranda. Pasang 2–5 thumbnail: rata-rata +8,5%, ada yang +50%. Judul 'Robux gratis' malah tidak diprioritaskan. #Roblox #AUDIRA",
  thread=["1/ Tanpa satu gambar ini, map Roblox barumu tidak muncul di beranda: thumbnail kustom. #Roblox",
          "2/ Format 16:9, ideal 1920×1080, maks 3 MB. Thumbnail bawaan tidak memenuhi syarat rekomendasi beranda.",
          "3/ Personalisasi: aktifkan 2–5 thumbnail. Uji coba Roblox: rata-rata +8,5%, sebagian game +50%.",
          "4/ Video thumbnail: gameplay asli, tanpa narasi, maks 3×/bulan. Judul 'Robux gratis' tidak diprioritaskan. #RobloxStudio #AUDIRA"],
  threads=["Tanpa satu gambar ini, map barumu tidak akan pernah muncul di beranda Roblox. #Roblox",
           "Thumbnail kustom wajib untuk rekomendasi beranda. Formatnya 16:9, ideal 1920×1080, maksimal 3 MB. Aktifkan 2 sampai 5 thumbnail: rata-rata naik 8,5%, ada game yang naik sampai 50%.",
           "Hindari judul umpan seperti 'Robux gratis', karena justru tidak diprioritaskan. Ikut tren boleh, tapi beri sentuhanmu sendiri dan biarkan data memilih pemenangnya. Kamu pernah A/B test thumbnail?"],
  prev="Episode sebelumnya: EP03 Algoritma 60 Detik."),
"EP05": dict(
  title="Cara Bikin Map Roblox Pakai Prompt (yang Benar)",
  alts=["Roblox Build vs Assistant: Bikin Game Cuma Ngetik", "Jebakan Roblox Build yang Jarang Orang Tahu", "Contoh Prompt Resmi Roblox: NPC Patroli 10 Stud"],
  cover="BIKIN MAP PAKAI PROMPT", day="Minggu, 29 November 2026",
  hook="Sekarang kamu bisa bikin game Roblox cuma dengan mengetik. Tapi prompt asal-asalan, hasilnya juga asal-asalan.",
  cap="Build di aplikasi Roblox untuk game 2D/2.5D (clicker, arcade, side-scroller, puzzle): 1 pesan = 1 prompt, ada jatah gratis harian. Jebakannya: game Build yang diedit di Studio berubah permanen jadi game Studio biasa. Untuk Assistant di Studio: tulis spesifik, pilih objeknya, pecah jadi beberapa langkah.",
  points=["Build: game 2D/2.5D (clicker, arcade, kumpulkan poin, side-scroller, puzzle).",
          "1 pesan = 1 prompt; ada jatah gratis harian, kredit tambahan dibeli dengan Robux.",
          "Jebakan: game Build yang diedit di Studio berubah permanen jadi game Studio biasa.",
          "Assistant: tulis spesifik, pilih objek dulu, pecah jadi beberapa langkah (contoh resmi: NPC patroli, kejar pemain dalam 10 stud).",
          "Roblox menilai game Build lewat 4 pemeriksaan; Scene Generator sudah diumumkan di RDC 2026."],
  cue="Dengarkan ketikan keyboard saat prompt berubah jadi platform map.",
  desc="Panduan singkat membuat map Roblox dengan prompt, berdasarkan Roblox Creator Docs: jalur Build di aplikasi Roblox (game 2D/2.5D, 1 pesan = 1 prompt, jebakan edit di Studio) dan Assistant di Roblox Studio (prompt spesifik, pilih objek, multi-langkah, contoh resmi NPC patroli 10 stud), plus cara Roblox menilai game Build dan Scene Generator.",
  tags="Roblox Build, Roblox Assistant, prompt Roblox, bikin map Roblox, AI Roblox Studio, cara bikin game Roblox, NPC Roblox, Scene Generator, prompt engineering, Roblox Studio, AUDIRA TECH",
  thumb="Panel IDE neon bertab AUDIRA_Map.prompt berisi prompt NPC patroli, avatar balok melompat dikejar NPC di atas platform, teks BIKIN MAP PAKAI PROMPT.",
  fb="Bikin game Roblox sekarang bisa cuma dengan mengetik. Tapi coba bandingkan dua perintah ini: 'buat musuh' dan 'buat NPC yang berpatroli, lalu mengejar pemain kalau jaraknya dalam 10 stud'. Yang kedua adalah contoh resmi dari Roblox, dan hasilnya jauh lebih jelas. Ibarat memesan makanan: makin spesifik pesanannya, makin pas yang datang. Satu jebakan penting: game Build yang kamu edit di Studio berubah permanen jadi game Studio biasa.",
  ask="Prompt pertama apa yang mau kamu coba di Roblox Build?",
  single="Bikin map Roblox pakai prompt: Build = 1 pesan 1 prompt (ada jatah gratis harian). Jebakan: diedit di Studio = permanen jadi game Studio. Assistant: spesifik, pilih objek, multi-langkah. #Roblox #AUDIRA",
  thread=["1/ Bikin game Roblox cuma dengan mengetik itu nyata. Tapi prompt asal-asalan, hasilnya asal-asalan. #Roblox",
          "2/ Build (aplikasi Roblox): game 2D/2.5D. 1 pesan = 1 prompt, ada jatah gratis harian, kredit tambahan pakai Robux.",
          "3/ Jebakan: game Build yang diedit di Studio berubah permanen jadi game Studio biasa.",
          "4/ Assistant (Studio): spesifik, pilih objek, pecah langkah. Contoh resmi: NPC patroli, kejar pemain dalam 10 stud. #RobloxStudio #AUDIRA"],
  threads=["Sekarang kamu bisa bikin game Roblox cuma dengan mengetik. Tapi prompt asal-asalan, hasilnya juga asal-asalan. #Roblox",
           "Build di aplikasi Roblox untuk game 2D/2.5D: 1 pesan sama dengan 1 prompt, ada jatah gratis harian. Jebakannya: game Build yang diedit di Studio berubah permanen jadi game Studio biasa.",
           "Untuk Assistant di Studio: tulis spesifik, pilih objek dulu, pecah jadi beberapa langkah. Contoh resminya: NPC yang berpatroli lalu mengejar pemain dalam 10 stud. Prompt apa yang mau kamu coba?"],
  prev="Episode sebelumnya: EP04 Thumbnail Anti Tenggelam. Episode terakhir seri ini."),
}

NAMES = ["Hook", "Konteks", "Pengembangan", "Penjelasan", "Payoff", "Penutup"]

def mmss(s):
    s = int(s); return f"{s//60}:{s%60:02d}"

def srt_time(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

for ep, c in EP.items():
    folder = glob.glob(os.path.join(SERIES, f"{ep}_*"))[0]
    tl = json.load(open(os.path.join(folder, "audio", "timeline.json"), encoding="utf-8"))
    chap = ["0:00 Hook"] + [f"{mmss(p['start'])} {n}" for p, n in zip(tl["parts"][1:], NAMES[1:])] + [f"{mmss(tl['voEnd'] + 0.6)} Created by Agus Dwi R."]
    n = int(ep[2:])
    pin = f"{ep} seri Roblox Map Baru ({CHANNEL}, playlist {PLAYLIST}). {SRC} {c['prev']}"
    times = ["19.00", "19.15", "19.30", "19.45", "20.00", "20.15"]
    plats = ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook Reels", "X/Twitter", "Threads"]
    md = f"""# SOCIAL CAPTIONS: {c['title']}

Seri AUDIRA TECH · Roblox Map Baru EP0{n} (5 episode). Channel: {CHANNEL}. Created by Agus Dwi R. Thumbnail: `style/cover-topic.png`. Video: `FINAL_EP0{n}.mp4`.

## TikTok

**Hook:** {c['hook']}

**Cover Text:** {c['cover']}

**Caption:** {c['cap']}

**Pinned Comment:** {pin}

**Hashtags:** {LAYERED}

## Instagram Reels

**5-Point Value Breakdown:**

""" + "\n".join(f"{i+1}. {p}" for i, p in enumerate(c["points"])) + f"""

**Caption:** {c['hook']} Simpan video ini sebelum bikin map berikutnya, lalu tulis di komentar: {c['ask'][0].lower() + c['ask'][1:]}

**Audio Cue:** {c['cue']}

**Hashtags:** {LAYERED}

## YouTube Shorts

**Judul:** {c['title']}

**Alternatif Judul:**
""" + "\n".join(f"- {a}" for a in c["alts"]) + f"""

**Deskripsi:**

{c['desc']}

Chapters:
""" + "\n".join(chap) + f"""

Created by Agus Dwi R. · {CHANNEL}.

{LAYERED}

**Tags:** {c['tags']}

**Pinned Comment:** {pin}

**Thumbnail:** {c['thumb']}

## Facebook Reels

**Caption:** {c['fb']}

**Discussion Trigger:** {c['ask']}

**Hashtags:** {LAYERED}

## X/Twitter

**Cuitan tunggal:** {c['single']}

**Viral Hook Thread:**

""" + "\n".join(c["thread"]) + """

## Threads

**Post pembuka + utas:**

""" + "\n\n".join(c["threads"]) + f"""

## Jadwal Upload (WIB)

Satu episode per hari, 25–29 November 2026, slot malam utama 19.00–20.15 WIB (setelah seri TECH lain yang tayang 15–24 Nov). Default awal pola penonton Indonesia, bukan data akun; ganti dengan jam aktif follower dari TikTok Analytics, Instagram Insights, dan YouTube Studio setelah 2–4 minggu.

""" + "\n".join(f"- {p}: {c['day']}, {t} WIB" for p, t in zip(plats, times)) + f"""

## Label Konten AI

Centang label AI di tiap platform karena VO (Cartesia) dan visual dibuat dengan AI:
- TikTok: AI-generated content
- YouTube: Altered or synthetic content
- Meta (Facebook dan Instagram): AI info

## Catatan Upload

- Teks cover (3–5 kata) semua platform: {c['cover']}
- Upload `SUBTITLES.srt` ke YouTube Shorts dan Facebook.
- Seri: AUDIRA TECH · Roblox Map Baru EP0{n}, playlist {PLAYLIST}. {c['prev']} Tambahkan tautan episode sebelumnya di komentar pin setelah tayang.
- Musik: bed prosedural buatan sendiri (numpy, bebas lisensi), SFX dari pustaka AUDIRA `shared/assets/sfx` (dicatat di research/SOURCE_REGISTER.md).
- Tidak memakai logo atau UI asli Roblox; avatar balok dan game di layar adalah buatan sendiri.
"""
    open(os.path.join(folder, "SOCIAL_CAPTIONS.md"), "w", encoding="utf-8").write(md)
    # SRT: one cue per VO line (display text)
    out = []
    for i, l in enumerate(tl["lines"], 1):
        out.append(f"{i}\n{srt_time(l['start'])} --> {srt_time(l['end'])}\n{l['display']}\n")
    open(os.path.join(folder, "SUBTITLES.srt"), "w", encoding="utf-8").write("\n".join(out))
    for t in c["thread"] + [c["single"]]:
        assert len(t) <= 280, (ep, len(t), t)
    for t in c["threads"]:
        assert len(t) <= 500, (ep, len(t))
    print(ep, "ok", chap[1:3])
