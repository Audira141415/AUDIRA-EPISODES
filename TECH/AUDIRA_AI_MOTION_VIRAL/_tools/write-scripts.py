"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and in subtitles, spoken goes to Cartesia.
Run from AUDIRA_AI_MOTION_VIRAL: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

AI = "{AI|Ei Ai}"
KL = "Kling"
RW = "{Runway|Ranwei}"
CC = "{CapCut|Kep Kat}"
MC = "{Motion Control|Mosyen Kontrol}"
AT2 = "{Act-Two|Ekt Tu}"
HF = "{HyperFrames|Haiper Freims}"
RM = "{Remotion|Rimosyen}"
CL = "{Claude|Klod}"

S = {
    "EP01_SATU_FOTO": [
        f"Ini satu foto. Tanpa keyframe, tanpa belajar animasi, foto ini bisa bergerak.",
        f"Alurnya tiga. Image {AI} membuat gambar. Video {AI} menggerakkannya. {CC} merapikannya. Yang menentukan hasil bukan alatnya, tapi cara kamu memberi perintah.",
        f"Langkah satu, gambar. Pakai format sembilan banding enam belas, satu subjek jelas, dan latar yang punya depan, tengah, belakang. Panduan {RW} minta gambar yang bersih dari cacat, karena semua gerak berangkat dari situ. Contohnya, seseorang di atas bukit dengan layangan.",
        f"Langkah dua, gerak. Unggah ke {KL} atau {RW}. Kesalahan terbesar: menjelaskan ulang isi foto. Foto sudah bicara. Tulis gerakannya saja. Rumus {KL}: subjek plus gerakan, latar plus gerakan. Syalnya tertiup angin, awan bergeser pelan.",
        f"Mulai sesederhana itu. Lalu tambah satu unsur tiap percobaan, misalnya kamera mendekat, supaya kamu tahu mana yang berhasil. Tulis apa yang harus terjadi, bukan yang dilarang. Klipnya pendek, lima atau sepuluh detik. Jadi jangan berharap sekali klik langsung jadi film.",
        f"Langkah tiga, {CC}. Susun beberapa klip, potong tepat di awal gerakan, lalu tambah teks dan suara. Teks otomatisnya sudah tersedia, jadi tidak perlu mengetik. Tiga detik pembuka kamu bentuk di sini.",
        f"Viral tidak bisa dijamin siapa pun. Yang bisa kamu kendalikan: gambar bersih, gerak jelas, potongan rapi. Foto apa yang pertama kamu hidupkan?",
    ],
    "EP02_MOTION_TRANSFER": [
        f"Kamu yang bergerak. Yang tampil di layar, karakter buatanmu.",
        f"Namanya motion transfer. Bayangkan dalang: videomu jadi tali, gambar karakter jadi wayangnya. {KL} sendiri menyebutnya digital puppetry. Bedanya dengan generate biasa: hasilnya tidak untung-untungan, karena gerakannya kamu yang tentukan.",
        f"Bahannya tiga. Video menentukan gerak dan timing. Gambar menentukan siapa yang tampil. Prompt menentukan suasana, cahaya, dan latar, misalnya kota neon saat malam. Gerakan tidak perlu ditulis lagi.",
        f"Aturan terpenting: proporsi harus sama. Video seluruh badan, gambarnya juga seluruh badan. Video joget penuh dengan gambar wajah saja, hasilnya bisa rusak.",
        f"Saat merekam, pakai satu orang, kontras dengan latar, kepala dan badan terlihat. Panduan {RW} menyarankan mulai dengan telapak tangan menghadap kamera. {KL} menerima video tiga sampai tiga puluh detik. Lalu pilih orientasi karakter: ikut video, atau ikut gambar.",
        f"Pilihan alatnya: {KL} {MC}. {RW} {AT2}, lima kredit per detik, maksimal tiga puluh detik, dan menurut panduannya bagus untuk karakter bukan manusia. Mau jalan di komputer sendiri? {{Wan 2.2 Animate|Wan Dua Koma Dua Animet}} punya bobot model terbuka, tapi butuh {{GPU|Ji Pi Yu}} kuat.",
        f"Satu batas: pakai rekamanmu sendiri, atau yang sudah memberi izin. Tubuh dan wajah orang lain bukan bahan bebas. Karakter pertama yang kamu gerakkan, siapa?",
    ],
    "EP03_MOBIL_TRANSFORM": [
        f"Sedan tua ini berubah jadi mobil balap dalam satu tarikan. Kuncinya bukan prompt panjang.",
        f"Kuncinya dua gambar: frame awal dan frame akhir. {AI} mengisi gerakan di antaranya. Fitur ini ada di {KL} sebagai {{Start and End Frames|Start en En Freims}}, dan di {{Veo|Vi O}} sebagai first and last frame.",
        f"Buat dulu gambar pertama. Lalu pakai sebagai referensi untuk gambar kedua: sudut kamera sama, posisi sama, cahaya sama. Yang berubah cuma mobilnya. {KL} sendiri menyarankan memilih dua gambar yang mirip dari hasil generate.",
        f"Panduan {KL} jelas: dua gambar harus semirip mungkin. Kalau terlalu beda, hasilnya bisa pindah shot. Transisi paling halus di bawah lima detik. Jadi jangan loncat. Naikkan bertahap: sedan, rangka terbuka, mobil balap. Tiap langkah satu klip.",
        f"Di prompt, tulis prosesnya. Panel bodi terbuka, rangka bergeser, roda melebar, kamera diam. Satu kalimat cukup. Gambarnya sudah mengurus bentuk.",
        f"Sinematiknya lahir saat compositing. Frame akhir klip satu jadi frame awal klip dua, supaya sambungannya tidak terlihat. Lalu tambah percikan api, bayangan di lantai, dan bass saat bentuk baru mendarat. Tanpa bobot suara, transformasi terasa ringan.",
        f"Kalau hasilnya realistis dan seolah kejadian nyata, YouTube mewajibkan label {AI} saat unggah. Dan hindari logo merek orang. Mobil apa yang kamu ubah duluan?",
    ],
    "EP04_HEWAN_BICARA": [
        f"Aku kucing. Aku tidak bisa bicara. Tapi mulutku mengikuti suara ini.",
        f"Bagiannya tiga: karakter, suara, lip sync. Urutannya jangan dibalik. Suara dulu, baru wajah, karena rekaman itu yang jadi patokan mulut.",
        f"Karakter. Buat gambarku dengan image {AI}: wajah menghadap depan, mulut terlihat, cahaya rata. Punya taring? Taringnya harus kelihatan di gambar. Itu saran panduan {RW}.",
        f"Suara. Tulis naskah pendek, lalu pakai {{TTS|Ti Ti Es}} seperti {{Cartesia.|Kartesia.}} Tanda baca itu jeda, dan jeda itu akting. Kalimat pendek lebih hidup. Dengarkan dulu sampai pas, karena mengubah suara berarti mengulang lip sync.",
        f"Lip sync punya dua jalur. Jalur suara: {{Hedra|Hedra}}. Satu gambar dan satu rekaman masuk, keluar wajah yang bicara sepanjang rekaman itu. Hedra menyebut satu kali generate bisa sampai sepuluh menit. Cocok untuk ngobrol.",
        f"Jalur akting: {RW} {AT2}. Kamu rekam dirimu berakting, lalu ekspresi dan gerak pindah ke karakter. Butuh paket Standard ke atas, dan panduannya menyebut karakter bukan manusia bisa. Di sinilah hewan terasa seperti aktor, karena tatapan dan jedanya berasal dari manusia.",
        f"Kalau hewannya tampak nyata dan adegannya seolah sungguhan, beri label {AI}. Kartun seperti aku tidak wajib di YouTube. Rahasiaku? Aku boneka kode, digerakkan waktu tiap kata. Hewan apa yang kamu buat bicara?",
    ],
    "EP05_MOTION_GRAPHICS": [
        f"Video yang kamu tonton ini tidak digambar di aplikasi animasi. Seluruhnya kode.",
        f"Bedanya dengan slideshow ada tiga. Kamera terus bergerak. Lapisan punya kedalaman. Dan tiap gerak terikat ke kata yang diucapkan. Tiga hal ini tidak butuh aplikasi mahal.",
        f"{CL} menulis kodenya. Tugasmu mengarahkan. Bukan buatkan video keren, tapi angka: durasi, warna, posisi, dan apa yang terjadi di tiap kalimat. Semakin spesifik arahannya, semakin sedikit revisi.",
        f"{HF} merender {{HTML|Eic Ti Em El}} jadi {{MP4.|Em Pi Empat.}} Tiap elemen punya waktu mulai dan durasi, geraknya memakai {{GSAP|Ji Sep}} atau {{Three.js.|Tri Jei Es.}} Karena tiap frame dihitung dari waktu, render ulang hasilnya sama. File-nya bisa langsung dipreview tanpa langkah build. Lisensinya Apache dua.",
        f"{RM} jalannya lain. Kamu diberi nomor frame dan kanvas kosong, lalu menggambar dengan React. Panel ini dirender {RM} sungguhan. Gratis untuk individu dan perusahaan sampai tiga karyawan. Lebih besar dari itu perlu lisensi.",
        f"Yang membuatnya terasa mahal: suara dulu. Waktu tiap kata menjadi jam untuk semua animasi. Angka muncul tepat saat angkanya terucap, bukan setengah detik sebelumnya. Ganti kalimat, render ulang, semua ikut bergeser.",
        f"Terakhir, periksa frame demi frame, jangan percaya satu tangkapan layar. Slide menjelaskan, motion menunjukkan. Menurut kamu, topik apa yang paling cocok dibuat begini?",
    ],
}
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
for ep, lines in S.items():
    d = Path(ep)
    (d / "AUDIO/work").mkdir(parents=True, exist_ok=True)
    (d / "SUBTITLES").mkdir(exist_ok=True)
    (d / "PROJECT/HyperFrames_Remotion/compositions").mkdir(parents=True, exist_ok=True)
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([.,:;?!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i+1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in out) + "\n]\n", encoding="utf8")
    n = sum(len(TOK.sub(lambda m: m.group(2), t).split()) for t in lines)
    print(ep, "spoken words", n, "at 145 WPM =", round(n / 145 * 60, 1), "s")
