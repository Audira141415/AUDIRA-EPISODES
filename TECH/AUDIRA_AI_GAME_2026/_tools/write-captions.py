"""Writes each episode's SOCIAL_CAPTIONS.md. Chapters come from timeline.json so they match the voiced film.
Run from AUDIRA_AI_GAME_2026 after the voice exists: python _tools/write-captions.py"""
import json
from pathlib import Path

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#AIBikinGame #Roblox #AudiraGaming"

E = {
    "EP01_BUILD_HP": dict(
        title="Satu Kalimat di HP Jadi Game? Ini Cara Kerja Roblox Build", cover="1 KALIMAT, 1 GAME", tags="#RobloxBuild #BikinGame",
        hook="Satu kalimat di HP, dan kamu punya game. Tapi ada batasnya.",
        tiktok="Roblox Build mengubah teks jadi game dasar langsung di aplikasi HP. Tanpa komputer, tanpa coding. Tapi alpha-nya baru di empat negara, dan Indonesia belum disebut.",
        pin="Sumber: Roblox Newsroom 16 Jul dan 8 Okt 2026, surat pemegang saham Q3 2026, IGN. Ketersediaan bisa berubah.",
        ig="AI bisa memulai gamenya, tapi ide serunya tetap dari kamu. Kalau cuma boleh satu kalimat, game apa yang kamu minta?",
        points=["Build adalah tab pembuatan game di aplikasi Roblox.", "AI menulis rencana dulu, baru membuat kode, dunia, karakter, tampilan, dan suara.", "Hasilnya bisa dimainkan, diubah, lalu diuji lagi di HP yang sama.", "71% pengguna alpha awal belum pernah memakai Roblox Studio.", "Alpha di Selandia Baru, Singapura, Serbia, dan Thailand; game terbit untuk usia 16+."],
        audio="Petikan riang dan klik bata mainan di atas meja kayu.",
        alts=["Bikin Game Roblox Tanpa Coding, Cuma dari HP", "Roblox Build: AI Mengubah Teks Jadi Game", "71% Pengguna Build Belum Pernah Pakai Studio"],
        desc="Cara kerja Roblox Build, dari satu prompt sampai game dasar yang bisa dimainkan, plus batasannya.",
        src="Roblox Newsroom, surat pemegang saham Roblox Q3 2026, IGN.",
        ch=["Hook", "Apa itu Build", "Contoh prompt", "Cara AI bekerja", "Main dan ubah", "Siapa yang mencoba", "Batasnya", "Pertanyaan"],
        ytags="roblox build, roblox ai, bikin game dari hp, buat game tanpa coding, ai game maker, game roblox, prompt to game, roblox studio, audira gaming, ai bikin game",
        thumb="HP di meja kayu dengan dunia bata tumbuh dari layar, teks 1 KALIMAT, 1 GAME.",
        fb="Bayangkan menulis pesan ke teman: tolong buatkan game petualangan di hutan. Lalu balasannya adalah game yang bisa dimainkan. Kira-kira begitu Roblox Build. Tapi seperti kerangka rumah, ini baru titik awal. Dindingnya mungkin berdiri, tapi yang membuat orang betah tetap idemu.",
        q="Kalau cuma boleh satu kalimat, game apa yang kamu minta?",
        single="Roblox Build: satu prompt di HP jadi game dasar. 71% pengguna alpha awal belum pernah pakai Studio. Tapi baru di 4 negara, Indonesia belum disebut. Game apa yang kamu minta? #RobloxBuild #AIBikinGame",
        thread=["Satu kalimat di HP, dan kamu punya game. Begini cara kerja Roblox Build. #RobloxBuild", "AI tidak langsung membuat game. Dia menulis rencana dulu, baru kode, dunia, karakter, tampilan, dan suara.", "71% pengguna alpha awal belum pernah memakai Roblox Studio. Hambatannya turun jauh.", "Tapi Roblox sendiri menyebut hasilnya game dasar. Alpha di 4 negara, Indonesia belum disebut. Ide serunya tetap dari kamu. #AIBikinGame"],
    ),
    "EP02_MOBIL_4D": dict(
        title="Ketik Mobil, Lalu Setir Mobilnya: Cara Kerja AI 4D Roblox", cover="KETIK MOBIL. LALU SETIR.", tags="#Roblox4D #GameAI",
        hook="Ketik: mobil. Lalu kamu masuk, dan menyetirnya.",
        tiktok="Ini bukan gambar. 4D generation dari Roblox memecah mobil jadi lima bagian bernama, lalu memasang skrip supaya rodanya berputar dan berbelok.",
        pin="Sumber: Roblox Newsroom 4 Feb 2026, TechCrunch 4 Feb 2026. Angka Wish Master dari Roblox dan developer-nya. Visual video adalah ilustrasi.",
        ig="Yang baru bukan bentuk mobilnya, tapi perilakunya. Kalau bisa meminta apa saja di dalam game, apa yang kamu buat pertama?",
        points=["Model 3D biasa itu satu bongkah, rodanya tidak bisa berputar.", "Schema Car-5 mewajibkan 5 bagian: bodi dan 4 roda bernama.", "Skrip disesuaikan dengan ukuran tiap mobil baru.", "Wish Master: 160.000+ objek saat akses awal.", "Roblox menargetkan schema untuk ribuan jenis benda."],
        audio="Synth gelap yang berubah jadi beat berkendara saat mobil melaju.",
        alts=["Kenapa Mobil Buatan AI Biasanya Tidak Bisa Jalan", "Car-5: Rahasia Mobil AI yang Bisa Disetir", "Dimensi Keempat di Roblox Itu Apa?"],
        desc="Cara kerja 4D generation Roblox: schema Car-5, lima bagian bernama, dan skrip yang menyesuaikan ukuran.",
        src="Roblox Newsroom, TechCrunch.",
        ch=["Hook", "4D generation", "Masalah satu bongkah", "Schema Car-5", "Skrip perilaku", "Bisa dikendarai", "Wish Master", "Pertanyaan"],
        ytags="roblox 4d, roblox cube, ai mobil, car-5, schema roblox, wish master roblox, generative ai game, game ai, audira gaming, ai bikin game",
        thumb="Mobil merah terurai jadi bodi dan empat roda di atas cetak biru, teks KETIK MOBIL.",
        fb="Bayangkan mainan mobil dari satu cetakan plastik. Bentuknya bagus, tapi rodanya menyatu dengan bodi. Sebagus apa pun, itu pajangan. AI 4D Roblox membuatnya seperti mainan rakitan: bodi dan empat roda terpisah, masing-masing punya nama dan tugas. Karena itu mobilnya benar-benar bisa dikendarai.",
        q="Kalau bisa meminta apa saja di dalam game, apa yang kamu buat pertama?",
        single="Mobil AI biasanya satu bongkah, rodanya tidak berputar. Schema Car-5 Roblox memecahnya jadi 5 bagian bernama lalu memasang skrip. Hasilnya bisa disetir. Kamu mau buat apa? #Roblox4D #AIBikinGame",
        thread=["Ketik: mobil. Lalu masuk dan setir. Begini cara kerja 4D generation di Roblox. #Roblox4D", "Model 3D biasa itu satu bongkah. Rodanya menyatu dengan bodi, jadi tidak bisa berputar.", "Schema Car-5 mewajibkan 5 bagian bernama: bodi dan 4 roda. Skrip lalu disesuaikan dengan ukuran mobil barunya.", "Wish Master mencatat 160.000+ objek saat akses awal. Awalnya baru 2 schema, targetnya ribuan jenis benda. #AIBikinGame"],
    ),
    "EP03_NPC_OTAK": dict(
        title="NPC Ini Bisa Ditipu Karena Punya Otak AI", cover="NPC-NYA PERCAYA!", tags="#NPC #GameAI",
        hook="Pemain ini cuma mengetik satu kalimat, dan NPC-nya percaya.",
        tiktok="NPC baru tidak membaca naskah. Dia menyusun jawabannya sendiri lewat LLM. Karena itu dia bisa diajak bicara, dan juga bisa dibohongi.",
        pin="Sumber: IGN 1 Des 2025, GamingBolt 21 Nov 2025, dokumentasi Roblox TextGenerator, NVIDIA 16 Jun 2026, surat Roblox Q3 2026.",
        ig="NPC lama itu daftar pilihan. NPC baru bisa menjawab, membantu, dan salah. Kalau suatu hari NPC bisa mengingatmu, kamu mau berteman atau menipunya?",
        points=["NPC lama hanya mengeluarkan baris yang sudah ditulis.", "NPC baru memakai LLM, kepribadiannya ditulis sebagai instruksi.", "Total War: Pharaoh menguji penasihat yang membaca 1.200+ tabel data.", "PUBG Ally berjalan di komputer pemain.", "Otak ini bisa dibohongi dan bisa salah."],
        audio="Pizzicato jahil dan taiko, dengan stinger komik di tiap panel.",
        alts=["Pemain Ini Menipu NPC dengan Satu Kalimat", "Beda NPC Lama dan NPC dengan Otak AI", "NPC Sekarang Bisa Berpikir? Begini Cara Kerjanya"],
        desc="Cara kerja NPC ber-LLM, contoh di Where Winds Meet, Roblox, Total War: Pharaoh, dan PUBG Ally, serta kelemahannya.",
        src="IGN, GamingBolt, Roblox Creator Docs, NVIDIA, surat pemegang saham Roblox Q3 2026.",
        ch=["Hook", "Tanpa naskah", "NPC lama", "Otak LLM", "Cara menjawab", "Diberi tangan", "Bisa dibohongi", "Pertanyaan"],
        ytags="npc ai, npc llm, where winds meet, roblox textgenerator, pubg ally, nvidia ace, total war pharaoh, game ai, audira gaming, ai bikin game",
        thumb="Kepala NPC manga terbuka dengan otak merah, teks NPC-NYA PERCAYA!",
        fb="NPC lama seperti mesin penjawab telepon: tekan satu, dengar rekaman satu. NPC baru lebih mirip orang di balik telepon. Dia bisa menjawab apa saja, tapi seperti orang sungguhan, dia juga bisa percaya pada omong kosong. Di Where Winds Meet, ada pemain yang menipu NPC hanya dengan menulis bahwa dia sudah memberi jawaban yang benar.",
        q="Kalau suatu hari NPC bisa mengingatmu, kamu mau berteman, atau menipunya?",
        single="Pemain Where Winds Meet menulis \"(tells him the correct answer)\" dan NPC-nya percaya. NPC ber-LLM menyusun jawaban sendiri, jadi juga bisa dibohongi. Kamu mau berteman atau menipunya? #NPC #AIBikinGame",
        thread=["Satu kalimat cukup untuk menipu NPC ini. Kenapa bisa begitu? #NPC", "NPC lama itu daftar pilihan. NPC baru memakai LLM: kepribadian ditulis sebagai instruksi, jawabannya disusun saat itu juga.", "Otak itu lalu diberi tangan. PUBG Ally bisa diajak bicara, ikut bertarung, dan ikut mencari barang, di komputer pemain.", "Tapi otak ini bisa dibohongi dan bisa salah. Roblox kini melatih model NPC dari data permainan manusia. #AIBikinGame"],
    ),
    "EP04_AI_DEVELOPER": dict(
        title="AI Bikin Game Lolos Semua Tes, Tapi Nilai Desainnya 31", cover="9/9 LOLOS. DESAIN 31.", tags="#AgenAI #RobloxStudio",
        hook="Game ini lolos semua tes. Tapi nilai desainnya cuma 31.",
        tiktok="Skyforge Ascent, contoh resmi Roblox Build: spesifikasi 91, teknik 98, playtest 100, visual 86. Desainnya 31, karena tidak ada alasan untuk main dua kali.",
        pin="Sumber: Roblox Newsroom 8 Okt dan 15 Apr 2026, surat Roblox Q3 2026. Skor dari evaluator internal Roblox pada satu contoh, bukan rata-rata semua game.",
        ig="AI sudah bisa menulis dan menguji game. Yang belum tentu: membuatnya seru. Kalau begitu, apa tugas developer ke depan?",
        points=["Rencana: spesifikasi lintasan dan rintangan, skor 91.", "Bangun: kode dan aset, skor teknik 98.", "Tes: agen bermain dengan input seperti pemain, skor 100.", "44% dari 1.000 kreator teratas sudah memakai AI (April 2026).", "Desain 31: progres, main ulang, pilihan, dan daya tarik unik bernilai nol."],
        audio="Sequencer mesin 7/8 dengan tik relay dan chirp saat tes lolos.",
        alts=["Kenapa Game Buatan AI Ini Nilai Desainnya Rendah", "Rencana, Bangun, Tes: Cara Agen AI Membuat Game", "AI Developer Bisa Apa dan Belum Bisa Apa"],
        desc="Bedah Skyforge Ascent: cara agen AI merencanakan, membangun, dan menguji game, dan kenapa nilai desainnya tetap 31.",
        src="Roblox Newsroom, surat pemegang saham Roblox Q3 2026.",
        ch=["Hook", "Skyforge Ascent", "Rencana", "Bangun", "Tes", "Dipakai kreator", "Kenapa 31", "Pertanyaan"],
        ytags="agen ai, ai developer, roblox studio, roblox build, skyforge ascent, mcp roblox, playtest ai, game development ai, audira gaming, ai bikin game",
        thumb="Papan skor 98, 100, 86 hijau dan 31 merah di atas papan sirkuit.",
        fb="Bayangkan murid yang menjawab semua soal dengan benar, tulisannya rapi, tanpa salah ketik, tapi karangannya membosankan. Nilai tekniknya sempurna, dan tidak ada yang mau membacanya dua kali. Itulah Skyforge Ascent. Kode 98, tes 100, desain 31.",
        q="Kalau AI sudah bisa menulis dan menguji game, apa tugas developer ke depan?",
        single="Skyforge Ascent buatan agen AI Roblox: teknik 98, playtest 100, visual 86. Desain? 31. Nol di progres, main ulang, pilihan, dan daya tarik unik. Apa tugas developer ke depan? #AgenAI #AIBikinGame",
        thread=["Game buatan AI ini lolos semua tes, 9 dari 9. Tapi nilai desainnya cuma 31. #AgenAI", "Rencana 91. Teknik 98, temuannya cuma dua fungsi tak terpakai. Playtest 100, dengan input seperti pemain sungguhan.", "Alur ini juga dipakai kreator. April lalu, 44% dari 1.000 kreator teratas Roblox sudah memakai AI. Pengguna harian MCP naik hampir 5x.", "Desainnya 31 karena tidak ada alasan main dua kali. AI bisa menulis dan menguji. Serunya belum tentu. #AIBikinGame"],
    ),
    "EP05_TOP_20": dict(
        title="Dua Game Buatan AI Masuk Top 20 Roblox: Baca Datanya", cover="DUA GAME AI TEMBUS TOP 20", tags="#HussValley #BreakAndStealAnEgg",
        hook="Dua game yang hampir seluruhnya dibuat AI masuk Top 20 Roblox.",
        tiktok="Break and Steal an Egg dan Huss Valley, menurut surat resmi Roblox Q3 2026. Tapi Top 20 dan Top 100 memakai ukuran berbeda, dan peran manusianya tidak dirinci.",
        pin="Sumber: surat pemegang saham Roblox Q3 2026, GosuGamers, PC Gamer, XenoSpectrum, Mobilegamer.biz. Bukan saran investasi.",
        ig="AI bisa membawa game ke papan atas, tapi yang menentukan tetap pemain. Kalau tahu gamenya buatan AI, kamu masih mau main?",
        points=["2 game hampir seluruhnya AI masuk Top 20 pemain bersamaan, klaim Roblox.", "80%+ dari Top 100 memakai alat AI, bukan seluruhnya dibuat AI.", "Build: 500.000+ pengguna dan 70.000+ game terbit.", "Peran manusia dan alat yang dipakai tidak dirinci.", "Pendapatan +16%, bookings -12%, saham turun sekitar 19% after hours."],
        audio="Piano newsroom yang menipis saat bagian kehati-hatian.",
        alts=["80% Game Top Roblox Pakai AI, Apa Artinya?", "Break and Steal an Egg: Game AI di Top 20", "70.000 Game dari Build, Berapa yang Sukses?"],
        desc="Penutup seri: klaim Top 20 dari surat pemegang saham Roblox, cara membaca angkanya, dan kondisi bisnisnya. Bukan saran investasi.",
        src="Surat pemegang saham Roblox Q3 2026, GosuGamers, PC Gamer, XenoSpectrum, Mobilegamer.biz.",
        ch=["Hook", "Dua game", "Skala", "Bukan cuma dua", "Baca hati-hati", "Yang tidak dirinci", "Bisnisnya", "Pertanyaan"],
        ytags="roblox top 20, game ai, break and steal an egg, huss valley, roblox q3 2026, roblox build, game buatan ai, berita game, audira gaming, ai bikin game",
        thumb="Dua menara oranye menembus garis TOP 20 di kota maket putih.",
        fb="Kalau restoran bilang 80 persen menu terlarisnya memakai mesin dapur, itu tidak berarti mesin yang memasak semuanya. Begitu juga angka Roblox: lebih dari 80 persen dari 100 game teratas memakai alat AI. Yang lebih menarik, dua game hampir seluruhnya dibuat AI masuk 20 besar. Tapi berapa besar peran manusianya, suratnya tidak merinci.",
        q="Kalau tahu gamenya buatan AI, kamu masih mau main?",
        single="Roblox: Break and Steal an Egg dan Huss Valley, hampir seluruhnya dibuat AI, masuk Top 20. 80%+ Top 100 pakai alat AI. Tapi peran manusia tidak dirinci. Masih mau main? #Roblox #AIBikinGame",
        thread=["Dua game yang hampir seluruhnya dibuat AI masuk Top 20 Roblox. Klaim ini dari surat resmi Q3 2026. Baca angkanya pelan-pelan. #Roblox", "Top 20 dihitung dari pemain bersamaan. Top 100 dihitung dari jam main. Memakai AI tidak berarti seluruhnya dibuat AI.", "Surat itu tidak merinci peran manusia dan tidak menyebut kedua game dibuat dengan Build. Sumbernya data internal.", "Pendapatan +16%, bookings -12%, saham turun sekitar 19% after hours. Yang menentukan tetap pemain. #AIBikinGame"],
    ),
}

for name, e in E.items():
    T = json.load(open(f"{name}/timeline.json", encoding="utf8"))
    chapters = "\n".join(f"{fmt(0 if i == 0 else s['start'])} {c}" for i, (s, c) in enumerate(zip(T["scenes"], e["ch"])))
    pts = "\n".join(f"{i + 1}. {p}" for i, p in enumerate(e["points"]))
    alts = "\n".join(f"- {a}" for a in e["alts"])
    thread = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["thread"]))
    tags = f"{e['tags']} {BASE}"
    md = f"""# SOCIAL CAPTIONS, EP {name[2:4]}: {e['title']}

## TikTok

**Hook:** {e['hook']}

**Cover Text:** {e['cover']}

**Caption:** {e['tiktok']}

**Pinned Comment:** {e['pin']}

**Hashtags:** {tags}

## Instagram Reels

**Caption:** {e['ig']}

**5-Point Value Breakdown:**

{pts}

**Audio Cue:** {e['audio']}

**Hashtags:** {tags}

## YouTube Shorts

**Judul:** {e['title']}

**Alternatif Judul:**
{alts}

**Deskripsi:**

{e['desc']}

Chapters:
{chapters}

Sumber: {e['src']}

Created by Agus Dwi R. AUDIRA.

{tags}

**Tags:** {e['ytags']}

**Pinned Comment:** {e['pin']}

**Thumbnail:** {e['thumb']}

## Facebook Reels

**Caption:** {e['fb']}

**Discussion Trigger:** {e['q']}

**Hashtags:** {tags}

## X/Twitter

**Cuitan tunggal:** {e['single']}

**Viral Hook Thread:**

{thread}
"""
    Path(name, "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
