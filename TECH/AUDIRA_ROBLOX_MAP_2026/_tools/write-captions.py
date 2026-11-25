"""Writes each episode's SOCIAL_CAPTIONS.md (6 platforms, upload schedule, AI label). Chapters come from timeline.json.
Run from AUDIRA_ROBLOX_MAP_2026 after the voice exists: python _tools/write-captions.py"""
import json
from pathlib import Path

fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
BASE = "#Roblox #RobloxStudio #AUDIRA"
SRC = "Roblox Creator Documentation (dibaca 8 Nov 2026)"

E = {
    "EP01_FREE_MODEL_VIRUS": dict(
        day="Minggu, 15 November 2026",
        title="Free Model Roblox Bisa Bawa Virus? Cek Ini Dulu", cover="FREE MODEL BAWA VIRUS?", tags="#FreeModel #TipsRoblox",
        hook="Model gratis di Toolbox Roblox bisa diam-diam memuat virus saat game berjalan.",
        tiktok="Menurut dokumentasi resmi Roblox, aset yang terlihat berguna bisa memuat aset virus lain saat game berjalan. Cek jumlah script, pakai Disable Scripts, dan saring kreator terverifikasi. Kamu pernah nemu script aneh?",
        pin="RAHASIA MAP ROBLOX · EP 01. Sumber: Roblox Creator Docs, halaman Creator Store dan Toolbox. Visual ilustrasi, bukan cuplikan Roblox.",
        ig="Free model boleh dipakai, asal dicek dulu. Kamu pernah menemukan script aneh di model gratis? Ceritakan di komentar.",
        points=["Toolbox dan Creator Store berisi jutaan aset gratis maupun berbayar.", "Model bisa membawa script, dan ada yang memanggil aset lain saat game berjalan.", "Creator Store melarang require dengan nomor aset, loadstring, dan kode yang diacak.", "Halaman aset menampilkan jumlah segitiga, vertex, dan script.", "Klik kanan di Explorer lalu Disable Scripts, atau saring kreator terverifikasi."],
        audio="Bed elektronik bersih yang rusak glitch saat script tersembunyi bangun.",
        alts=["Cara Aman Pakai Free Model Roblox", "Script Tersembunyi di Model Gratis Roblox", "Kenapa Creator Store Melarang loadstring?"],
        desc="Free model di Toolbox Roblox bisa membawa script tersembunyi. Ini aturan resmi Creator Store dan cara aman memakainya.",
        src=SRC,
        ch=["Hook", "Jutaan aset", "Script di dalam model", "Larangan Creator Store", "Kode diacak", "Cek halaman aset", "Disable Scripts", "Pertanyaan"],
        ytags="free model roblox, virus roblox, script roblox, toolbox roblox, creator store, roblox studio, tips roblox, bikin map roblox, keamanan roblox, audira",
        thumb="Studio putih, pohon gratis glitch dengan tag script, teks FREE MODEL BAWA VIRUS? (style/cover-topic.png).",
        fb="Pernah dapat barang gratis yang ternyata ada titipannya? Free model di Roblox bisa begitu. Dokumentasi resmi Roblox sendiri memperingatkan ada aset yang diam-diam memuat aset lain saat game berjalan. Untungnya ada cara mengeceknya.",
        q="Kamu pernah menemukan script aneh di free model?",
        single="Free model Roblox bisa diam-diam memuat aset lain saat game jalan. Creator Store melarang require(assetId), loadstring, dan kode diacak. Pakai Disable Scripts sebelum pakai. #FreeModel #Roblox",
        thread=["Free model di Toolbox Roblox bisa membawa virus. Ini kata dokumentasi resminya. #Roblox", "Model bisa membawa script. Ada yang wajar, ada yang menunggu game jalan lalu memanggil aset lain dari luar.", "Creator Store melarang require dengan nomor aset, loadstring, dan kode yang diacak supaya tidak terbaca.", "Cek jumlah script di halaman aset, klik kanan lalu Disable Scripts, dan saring kreator terverifikasi. #FreeModel"],
        th_open="Free model di Roblox bisa diam-diam memuat aset lain saat game berjalan. Dokumentasi resminya sendiri yang bilang. #Roblox",
        th=["Cek jumlah script di halaman aset, lalu klik kanan di Explorer dan pilih Disable Scripts. Modelnya tetap bisa dipakai, script-nya tidak jalan.", "Kamu pernah nemu script aneh? #FreeModel"],
    ),
    "EP02_GREYBOX": dict(
        day="Senin, 16 November 2026",
        title="Rahasia Map Roblox Keren: Mulai dari Kotak Abu-abu", cover="MULAI DARI KOTAK ABU-ABU", tags="#Greybox #LevelDesign",
        hook="Map Roblox yang keren tidak langsung dibuat cantik. Langkah pertamanya justru kotak abu-abu.",
        tiktok="Greyboxing: susun kotak sederhana dulu, uji rasanya, baru dipoles. Di tutorial resmi Roblox, lorong minimal 10 stud dan dinding minimal 10 stud. Kamu langsung menghias atau greybox dulu?",
        pin="RAHASIA MAP ROBLOX · EP 02. Sumber: Roblox Creator Docs, tutorial Greybox your environment. Visual ilustrasi, bukan cuplikan Roblox.",
        ig="Map yang seru lahir dari kotak polos. Kamu biasanya langsung menghias, atau greybox dulu? Tulis di komentar.",
        points=["Greyboxing atau blocking: susun bentuk sederhana untuk menguji gameplay sebelum memoles aset.", "Masalah seperti area susah dilewati dan titik pandang tidak adil cepat ketahuan.", "Contoh resmi: map laser tag tiga jalur, interior, tengah, eksterior.", "Persimpangan jalur tengah dan jalur silang disebut combat pocket.", "Lorong dan pintu minimal 10 stud lebar, dinding minimal 10 stud tinggi."],
        audio="Marimba dan piano tenang dengan bunyi balok dipasang.",
        alts=["Cara Developer Bikin Map Roblox", "Apa Itu Greybox di Roblox?", "Kenapa Map Shooter Seru di Tengah"],
        desc="Rahasia map Roblox yang seru: greyboxing, tata letak tiga jalur, combat pocket, dan ukuran lorong 10 stud dari tutorial resmi Roblox.",
        src=SRC,
        ch=["Hook", "Apa itu greybox", "Masalah cepat ketahuan", "Tiga jalur", "Combat pocket", "Ukuran 10 stud", "Ganti aset", "Pertanyaan"],
        ytags="greybox roblox, level design roblox, bikin map roblox, roblox studio, tutorial roblox, map laser tag, combat pocket, tips developer roblox, desain map, audira",
        thumb="Maket laser tag setengah berwarna setengah abu-abu, teks MULAI DARI KOTAK ABU-ABU (style/cover-topic.png).",
        fb="Arsitek tidak langsung memasang ubin dan cat. Dia bikin maket dulu. Developer map Roblox juga begitu: kotak abu-abu polos disusun dan diuji, baru setelah terasa pas, map dihias. Di tutorial resmi Roblox, ukurannya pun dihitung sampai lebar lorong.",
        q="Kamu biasanya langsung menghias, atau greybox dulu?",
        single="Map Roblox yang seru dimulai dari kotak abu-abu. Tutorial resmi Roblox: lorong minimal 10 stud, dinding minimal 10 stud, dan pertempuran dirancang di combat pocket. #Greybox #Roblox",
        thread=["Map Roblox yang keren tidak langsung dibuat cantik. Langkah pertamanya kotak abu-abu. #Roblox", "Namanya greyboxing. Bentuk sederhana dipakai untuk menguji rasanya bermain sebelum memoles aset.", "Contoh resmi: map laser tag tiga jalur. Persimpangan jalur tengah dan jalur silang disebut combat pocket.", "Lorong minimal 10 stud supaya dua pemain lewat, dinding minimal 10 stud supaya tidak dilompati. #Greybox"],
        th_open="Map Roblox yang seru justru dimulai dari kotak abu-abu polos. Namanya greyboxing. #Roblox",
        th=["Di tutorial resmi Roblox, lorong dibuat minimal 10 stud dan dinding minimal 10 stud. Setelah terasa pas, baru kotaknya diganti aset yang dipoles.", "Kamu greybox dulu atau langsung menghias? #Greybox"],
    ),
    "EP03_HEIGHTMAP": dict(
        day="Selasa, 17 November 2026",
        title="Satu Gambar Hitam-Putih Jadi Pulau 4,6 km di Roblox", cover="1 GAMBAR JADI PULAU", tags="#Heightmap #TerrainRoblox",
        hook="Satu gambar hitam-putih bisa jadi pulau selebar sekitar 4,6 km di Roblox.",
        tiktok="Terrain Roblox tersusun dari voxel 4x4x4 stud. Heightmap: terang jadi gunung, gelap jadi lembah. 1 piksel = 4 stud, maksimal 4096x4096. Hitungan kami, sekitar 4,6 km per sisi. Mau bikin pulau apa?",
        pin="RAHASIA MAP ROBLOX · EP 03. Sumber: Roblox Creator Docs, halaman Environmental terrain dan Roblox units. Angka 4,6 km adalah hitungan AUDIRA.",
        ig="Sebelum memahat satu per satu, coba gambar dulu petanya. Kamu mau bikin pulau seperti apa? Tulis di komentar.",
        points=["Terrain tersusun dari voxel berukuran 4x4x4 stud dengan satu material.", "Ada 22 material bawaan di luar udara.", "Heightmap: area terang jadi tinggi, area gelap jadi rendah; colormap mengatur material.", "1 piksel heightmap = 4 stud, maksimal 4096x4096 piksel.", "4096 x 4 = 16.384 stud per sisi, sekitar 4,6 km (hitungan kami)."],
        audio="Drone survei ambient dengan sapuan laser dan dentuman saat pulau naik.",
        alts=["Cara Bikin Pulau Roblox dari Gambar", "Heightmap Roblox Dijelaskan", "Terrain Roblox Ternyata Kotak-kotak"],
        desc="Terrain Roblox tersusun dari voxel 4 stud, dan satu heightmap hitam-putih bisa jadi pulau sekitar 4,6 km per sisi.",
        src=SRC,
        ch=["Hook", "Voxel 4 stud", "22 material", "Heightmap", "Colormap", "1 piksel = 4 stud", "Hitungan 4,6 km", "Pertanyaan"],
        ytags="heightmap roblox, terrain roblox, bikin pulau roblox, roblox studio, voxel roblox, colormap, tutorial terrain, bikin map roblox, tips roblox, audira",
        thumb="Pulau titik-titik bercahaya naik dari gambar hitam-putih, teks JADI PULAU ≈ 4,6 KM (style/cover-topic.png).",
        fb="Seperti peta kontur di pelajaran geografi: makin terang, makin tinggi. Roblox bisa membaca gambar seperti itu dan mengubahnya jadi daratan. Satu piksel sama dengan empat stud, jadi satu gambar besar bisa jadi pulau berkilometer-kilometer.",
        q="Kalau bisa bikin pulau dari satu gambar, kamu mau bikin pulau seperti apa?",
        single="Terrain Roblox = voxel 4x4x4 stud. Heightmap: terang jadi gunung, gelap jadi lembah. 1 piksel = 4 stud, maks 4096x4096. Hitungan kami: pulau sekitar 4,6 km per sisi. #Heightmap #Roblox",
        thread=["Satu gambar hitam-putih bisa jadi pulau sekitar 4,6 km di Roblox. #Roblox", "Terrain tersusun dari voxel 4x4x4 stud dengan satu material. Ada 22 material bawaan di luar udara.", "Heightmap: terang jadi tinggi, gelap jadi rendah. Colormap mengatur materialnya. 1 piksel = 4 stud.", "Maksimal 4096x4096 piksel. 4096 x 4 = 16.384 stud, sekitar 4,6 km. #Heightmap"],
        th_open="Di Roblox, satu gambar hitam-putih bisa berubah jadi pulau. Namanya heightmap. #Roblox",
        th=["Satu piksel sama dengan empat stud, dan ukuran maksimalnya 4096 x 4096 piksel. Hitungan kami, itu sekitar 4,6 km per sisi.", "Mau bikin pulau seperti apa? #Heightmap"],
    ),
    "EP04_BATAS_MESH": dict(
        day="Rabu, 18 November 2026",
        title="Kenapa Karakter Roblox Kadang Nabrak Udara?", cover="NABRAK UDARA DI ROBLOX?", tags="#Mesh3D #TipsRoblox",
        hook="Model 3D sebagus apa pun ditolak Roblox kalau segitiganya lebih dari 20 ribu.",
        tiktok="Satu mesh maksimal 20.000 segitiga, tekstur maksimal 4096x4096. Detail turun di 250 dan 500 stud. Dan bentuk tabrakan tidak pernah persis sama dengan tampilannya. Kamu pernah nabrak udara?",
        pin="RAHASIA MAP ROBLOX · EP 04. Sumber: Roblox Creator Docs, halaman General specifications, Texture specifications, dan Meshes. Visual ilustrasi, bukan cuplikan Roblox.",
        ig="Model yang bagus di game bukan yang paling detail, tapi yang paling pas. Kamu pernah nabrak udara di Roblox? Tulis di komentar.",
        points=["Satu mesh maksimal 20.000 segitiga.", "Tekstur maksimal 4096x4096; objek 5 stud cukup 256 px, objek 20 stud 1024 px.", "Detail otomatis turun: di bawah 250 stud tertinggi, 250-500 sedang, di atas 500 terendah.", "Bentuk tabrakan: Box, Hull, Default, PreciseConvexDecomposition, Tunable.", "Yang paling presisi pun tidak sama persis dengan tampilan."],
        audio="Pulse minimal ala ruang gambar dengan goresan pena dan bunyi buzzer DITOLAK.",
        alts=["Batas 20.000 Segitiga di Roblox", "Collision Fidelity Roblox Dijelaskan", "Rahasia Model 3D di Roblox"],
        desc="Batas mesh Roblox: 20.000 segitiga, tekstur 4096 px, level detail berdasarkan jarak, dan collision fidelity yang membuat karakter terasa menabrak udara.",
        src=SRC,
        ch=["Hook", "Batas segitiga", "Batas tekstur", "Detail sesuai jarak", "Bentuk tabrakan", "Lima pilihan", "Nabrak udara", "Pertanyaan"],
        ytags="mesh roblox, batas segitiga roblox, collision fidelity, roblox studio, import 3d roblox, tekstur roblox, level of detail, bikin map roblox, tips roblox, audira",
        thumb="Batu wireframe merah dengan angka > 20.000 dan stempel DITOLAK (style/cover-topic.png).",
        fb="Pernah merasa karakter Roblox menabrak sesuatu yang tidak kelihatan? Itu karena mesin fisika tidak memakai bentuk yang kamu lihat, tapi bentuk tabrakan yang lebih sederhana. Ditambah batas 20.000 segitiga per model, developer harus pintar memilih detail.",
        q="Kamu pernah menabrak udara di Roblox?",
        single="Batas model 3D Roblox: 20.000 segitiga per mesh, tekstur maks 4096x4096. Bentuk tabrakan tidak pernah persis sama dengan tampilannya, makanya kadang terasa nabrak udara. #Mesh3D #Roblox",
        thread=["Model 3D sebagus apa pun ditolak Roblox kalau segitiganya lebih dari 20.000. #Roblox", "Tekstur maksimal 4096x4096. Disarankan 256 px untuk objek 5 stud dan 1024 px untuk objek 20 stud.", "Detail turun otomatis: tertinggi di bawah 250 stud, sedang 250-500, terendah di atas 500 stud.", "Bentuk tabrakan, bahkan yang paling presisi, tidak sama persis dengan tampilannya. Itulah nabrak udara. #Mesh3D"],
        th_open="Kenapa karakter Roblox kadang terasa menabrak udara? Jawabannya ada di bentuk tabrakan. #Roblox",
        th=["Mesin fisika memakai bentuk tabrakan (Box, Hull, Default, PreciseConvexDecomposition, Tunable), dan tidak ada yang sama persis dengan tampilan model.", "Kamu pernah nabrak udara? #Mesh3D"],
    ),
    "EP05_CAHAYA_LINTANG": dict(
        day="Kamis, 19 November 2026",
        title="Map Roblox Bisa Pakai Matahari Jakarta? Rahasia Lighting", cover="MATAHARI JAKARTA DI ROBLOX", tags="#LightingRoblox #TipsRoblox",
        hook="Benda kecil di Roblox bisa kehilangan bayangan, karena bayangan dihitung pakai kotak 4 stud.",
        tiktok="Di cahaya voxel, bayangan dihitung per kotak 4x4x4 stud. Technology kini usang, diganti LightingStyle Soft atau Realistic. Dan GeographicLatitude bisa bikin jalur matahari mirip Jakarta. Kamu suka map realistis atau bergaya?",
        pin="RAHASIA MAP ROBLOX · EP 05. Sumber: Roblox Creator Docs, halaman Global lighting, kelas Lighting, dan enum Technology. Jakarta hanya contoh pemakaian.",
        ig="Cahaya bukan cuma soal terang dan gelap, tapi soal suasana. Kamu suka map yang realistis atau bergaya? Tulis di komentar.",
        points=["Cahaya voxel memakai kotak 4x4x4 stud; benda lebih kecil tidak punya bayangan realistis.", "Pilihan lama: Voxel, ShadowMap, Future.", "Technology kini usang, diganti LightingStyle Soft atau Realistic.", "PrioritizeLightingQuality memilih mana yang turun duluan di perangkat lemah.", "GeographicLatitude dan ClockTime mengatur jalur dan jam matahari."],
        audio="Kotak musik hangat, detak jam, dan suara jangkrik saat senja.",
        alts=["Rahasia Lighting Map Roblox", "Kenapa Benda Kecil di Roblox Tidak Punya Bayangan", "GeographicLatitude Roblox Dijelaskan"],
        desc="Rahasia cahaya Roblox: bayangan voxel 4 stud, LightingStyle pengganti Technology, dan GeographicLatitude untuk jalur matahari seperti di dunia nyata.",
        src=SRC,
        ch=["Hook", "Kotak cahaya 4 stud", "Voxel, ShadowMap, Future", "LightingStyle", "Prioritas kualitas", "GeographicLatitude", "Contoh Jakarta", "Pertanyaan"],
        ytags="lighting roblox, bayangan roblox, geographiclatitude, lightingstyle, roblox studio, shadowmap, future lighting, bikin map roblox, tips roblox, audira",
        thumb="Kota diorama piksel saat senja dengan label ADA BAYANGAN dan TANPA BAYANGAN (style/cover-topic.png).",
        fb="Pernah perhatikan bayangan di game? Di Roblox, bayangan bisa dihitung per kotak empat stud, jadi benda kecil kadang tidak punya bayangan. Dan ada pengaturan yang jarang dipakai: lintang geografis, yang bisa membuat matahari di map bergerak seperti di Jakarta.",
        q="Kamu suka map Roblox yang realistis, atau yang bergaya?",
        single="Di Roblox, cahaya voxel menghitung bayangan per kotak 4x4x4 stud. Technology kini usang, diganti LightingStyle. GeographicLatitude bisa bikin jalur matahari mirip Jakarta. #LightingRoblox #Roblox",
        thread=["Benda kecil di Roblox bisa kehilangan bayangan. Penyebabnya kotak cahaya 4 stud. #Roblox", "Pilihan lama: Voxel, ShadowMap, Future. Sekarang Technology usang, diganti LightingStyle Soft atau Realistic.", "PrioritizeLightingQuality memilih mana yang turun duluan di perangkat lemah: bayangan dekat atau jarak pandang.", "GeographicLatitude menggeser jalur matahari. Contoh: Jakarta, sekitar 6 derajat di selatan khatulistiwa. #LightingRoblox"],
        th_open="Tahu nggak, map Roblox bisa diatur supaya jalur mataharinya mirip Jakarta? #Roblox",
        th=["Pengaturannya GeographicLatitude, lintang geografis map. Ditambah ClockTime, suasana pagi atau senja bisa terasa seperti dunia nyata.", "Kamu suka map realistis atau bergaya? #LightingRoblox"],
    ),
}

for name, e in E.items():
    T = json.load(open(f"{name}/timeline.json", encoding="utf8"))
    chapters = "\n".join(f"{fmt(0 if i == 0 else s['start'])} {c}" for i, (s, c) in enumerate(zip(T["scenes"], e["ch"])))
    pts = "\n".join(f"{i + 1}. {p}" for i, p in enumerate(e["points"]))
    alts = "\n".join(f"- {a}" for a in e["alts"])
    thread = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["thread"]))
    tags = f"{e['tags']} {BASE}"
    th = "\n\n".join(f"{i + 1}/ {t}" for i, t in enumerate(e["th"]))
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

## Threads

**Post pembuka:**

{e['th_open']}

**Utas:**

{th}

## Jadwal Upload (WIB)

Hari tayang: {e['day']}. Default awal pola umum penonton Indonesia (slot utama malam), bukan data akun; ganti dengan jam aktif follower dari analytics setelah 2-4 minggu.

- TikTok: {e['day']}, 19.00 WIB
- Instagram Reels: {e['day']}, 19.20 WIB
- YouTube Shorts: {e['day']}, 19.40 WIB
- Facebook Reels: {e['day']}, 20.00 WIB
- X/Twitter: {e['day']}, 20.20 WIB
- Threads: {e['day']}, 20.40 WIB

## Label Konten AI

Voice over dan visual dibuat dengan AI, jadi centang labelnya saat upload:

- TikTok: aktifkan "AI-generated content".
- YouTube: pilih "Altered or synthetic content" = Ya.
- Meta (Facebook dan Instagram): aktifkan label "AI info".

## Catatan Upload

- Teks cover 3-5 kata per platform: {e['cover']}
- Upload `SUBTITLES.srt` dari folder episode ke YouTube dan Facebook.
- Komentar pin: sebut nomor seri "RAHASIA MAP ROBLOX · EP {name[2:4]}", playlist "Rahasia Bikin Map Roblox", dan tautan episode sebelumnya.
- Musik dan SFX disintesis sendiri di `mix.py`, tanpa lisensi pihak ketiga.
"""
    Path(name, "SOCIAL_CAPTIONS.md").write_text(md, encoding="utf8")
    print(name, "threads", len(e["th_open"]), [len(t) for t in e["th"]], "title", len(e["title"]), "single", len(e["single"]), [len(f"{i + 1}/ {t}") for i, t in enumerate(e["thread"])])
