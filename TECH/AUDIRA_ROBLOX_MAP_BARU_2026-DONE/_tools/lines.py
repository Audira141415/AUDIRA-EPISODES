# VO lines (display text with digits; _tools/vo.mjs turns digits/acronyms into spoken words).
# Source: approved scripts (_tools/scripts.py, acc 2026-11-11 "Setuju, buat VO").
# python _tools/lines.py -> EPxx/audio/vo-lines.json
import os, glob, json

L = {
"EP01": [
("hook", "Lebih dari 70.000 game baru lahir di Roblox, dan semuanya berawal dari satu kalimat yang diketik di HP."),
("context", "Namanya Build, fitur AI baru di aplikasi Roblox. Kamu tulis ide game, AI yang merakitnya."),
("context", "Uji cobanya dimulai Juli 2026 di Selandia Baru."),
("context", "Sampai awal September, sekitar 9.000 game sudah terbit, dan 71% pembuatnya belum pernah membuka Roblox Studio."),
("main", "Lalu angkanya meledak."),
("main", "Menurut surat investor Roblox kuartal ketiga, lebih dari 500.000 orang sudah memakai Build dan menerbitkan lebih dari 70.000 game."),
("main", "Unggahan aset harian ke Roblox bahkan naik tiga kali lipat dalam sebulan. Roblox sendiri menyebutnya ledakan konten."),
("explain", "Dan bukan cuma pemula. Lebih dari 80% dari 100 game teratas sudah memakai alat AI."),
("explain", "Dua game yang hampir seluruhnya dibuat dengan AI, Break and Steal an Egg dan Huss Valley, bahkan tembus 20 besar."),
("explain", "Hasil AI-nya juga makin rapi: hasil yang meleset turun dari 18% jadi 3%."),
("payoff", "Tapi ada sisi gelapnya. Makin mudah bikin game, makin mudah juga menjiplak."),
("payoff", "Klon game viral bermunculan di Roblox, kadang sebelum game aslinya rilis."),
("payoff", "Sekarang, bikin map itu gampang. Bikin map yang beda, itu yang langka."),
("outro", "Episode berikutnya, kita bongkar kenapa map baru bisa viral dalam 90 hari. Ikuti Audira."),
],
"EP02": [
("hook", "Hampir sepertiga game paling ramai di Roblox, umurnya belum genap tiga bulan."),
("context", "Data Agustus 2026: 28% dari 100 game teratas baru diluncurkan dalam 90 hari terakhir."),
("context", "Artinya, puncak Roblox bukan cuma milik game lama. Map baru bisa menyalip, seperti Ninety Nine Nights in the Forest yang disebut Roblox sebagai game breakout."),
("main", "Dan puncaknya gila. Grow a Garden dan Steal a Brainrot pernah dimainkan lebih dari 20 juta orang sekaligus."),
("main", "Uangnya juga nyata. Dalam 12 bulan sampai Juni 2026, kreator menerima sekitar 1,7 miliar dolar lewat DevEx, program penukaran Robux ke uang."),
("main", "Sejak 2013, totalnya sudah lebih dari 5 miliar dolar."),
("explain", "Tapi lihat pembagiannya. 10 kreator teratas rata-rata dapat 65,7 juta dolar."),
("explain", "100 teratas, 10,8 juta. 1.000 teratas, 1,4 juta."),
("explain", "Sementara median dari lebih dari 42.000 kreator DevEx, cuma sekitar 1.500 dolar setahun."),
("payoff", "Jadi peluangnya terbuka, tapi timpang."),
("payoff", "Kabar baiknya, 83% kreator Amerika yang disurvei adalah perorangan, bukan studio besar."),
("payoff", "Yang membedakan bukan modal, tapi cara map itu dirancang supaya pemain betah."),
("outro", "Soal betah, algoritma Roblox punya ukurannya sendiri. Kita bahas di episode berikutnya. Ini Audira."),
],
"EP03": [
("hook", "Map barumu dinilai dalam 60 detik pertama. Kalau pemain kabur sebelum itu, algoritma Roblox mencatatnya sebagai tanda buruk."),
("context", "Roblox menjelaskan sinyal ini di dokumen resmi untuk kreator."),
("context", "Ada beberapa ukuran yang paling menentukan, apakah gamemu muncul di Rekomendasi Untukmu."),
("main", "Pertama, play through rate: dari semua yang melihat gamemu, berapa yang benar-benar masuk bermain."),
("main", "Kedua, first play bounce rate: berapa pemain baru yang keluar di bawah 60 detik, atau sebelum tiga menit. Ini sinyal negatif."),
("main", "Ketiga, berapa hari pemain kembali: hari pertama, hari kedua sampai ketujuh, dan hari kedelapan sampai kedua puluh delapan."),
("main", "Keempat, lama bermain, dihitung maksimal 60 menit per pemain per hari."),
("main", "Ada juga sinyal tambahan: berapa hari pemain main bareng teman, dan berapa hari mereka belanja di dalam game."),
("explain", "Cara kerjanya bertahap. Setelah kamu update, Roblox bisa mengirim gelombang pemain baru untuk menguji."),
("explain", "Kalau kelompok itu betah, jangkauannya diperluas."),
("explain", "Sejak RDC 2026, penilaiannya juga melihat sampai 28 hari, bukan cuma minggu pertama."),
("explain", "Selera juga beda: pemain muda cenderung suka game pendek, pemain lebih tua suka game yang dalam."),
("payoff", "Jadi tipsnya sederhana. Ajarkan inti permainan secepatnya. Langsung bawa pemain ke bagian seru, jangan ke menu panjang."),
("payoff", "Buat level awal gampang naik, dan sisakan rasa penasaran supaya mereka kembali besok."),
("outro", "Tapi pemain tidak akan masuk kalau thumbnail-mu tenggelam. Itu episode berikutnya. Ikuti Audira."),
],
"EP04": [
("hook", "Tanpa satu gambar ini, map barumu tidak akan pernah muncul di beranda Roblox."),
("context", "Gambar itu adalah thumbnail."),
("context", "Menurut dokumen resmi Roblox, game wajib punya thumbnail buatan sendiri supaya bisa direkomendasikan di beranda. Thumbnail bawaan tidak memenuhi syarat."),
("main", "Formatnya 16:9, idealnya 1920×1080 piksel, maksimal 3 megabyte."),
("main", "Lalu ada senjata rahasianya: personalisasi thumbnail. Aktifkan 2 sampai 5 thumbnail, dan Roblox memilih yang paling cocok untuk tiap pemain."),
("main", "Dalam uji cobanya, rata-rata pemain yang klik lalu benar-benar bermain naik 8,5%. Ada game yang naik sampai 50%."),
("explain", "Mau pakai video? Boleh, asal gameplay asli, tanpa suara narasi, dan maksimal tiga kali unggah sebulan."),
("explain", "Hati-hati juga dengan judul umpan. Judul seperti Robux gratis, main sekarang, justru tidak diprioritaskan."),
("explain", "Judul atau gambar yang tidak sesuai isi game juga makin jarang ditampilkan."),
("explain", "Satu lagi, ada tab Moments, tempat video gameplay bisa langsung diklik untuk main. Untuk sekarang, fitur ini baru penuh di Amerika."),
("payoff", "Jadi resepnya: ikut tren boleh, tapi beri sentuhanmu sendiri."),
("payoff", "Tunjukkan momen paling seru dari mapmu, buat beberapa versi, lalu biarkan data memilih pemenangnya."),
("outro", "Episode terakhir, kita bikin map pakai prompt, dengan cara yang benar. Ini Audira."),
],
"EP05": [
("hook", "Sekarang kamu bisa bikin game Roblox cuma dengan mengetik. Tapi prompt asal-asalan, hasilnya juga asal-asalan."),
("context", "Ada dua jalur. Build di aplikasi Roblox, untuk game dua dimensi dan dua setengah dimensi: clicker, arcade, kumpulkan poin, side-scroller, dan puzzle."),
("context", "Lalu Assistant di Roblox Studio, untuk yang mau kontrol penuh."),
("main", "Di Build, satu pesan sama dengan satu prompt. Ada jatah gratis harian, dan kalau habis, kreditnya dibeli dengan Robux. Jadi jangan boros."),
("main", "Data Roblox, sekitar 14% sesi prompt berakhir dengan game yang diterbitkan."),
("main", "Ada satu jebakan penting: kalau game Build kamu edit di Studio, statusnya berubah permanen jadi game Studio biasa."),
("explain", "Untuk Assistant, dokumentasi Roblox memberi tiga kunci. Satu, tulis spesifik."),
("explain", "Dua, pilih dulu objeknya, supaya Assistant tahu yang kamu maksud. Tiga, pecah jadi beberapa langkah."),
("explain", "Contoh resminya: buat NPC yang berpatroli, lalu mengejar pemain kalau jaraknya dalam 10 stud. Jelas siapa, melakukan apa, dan kapan."),
("payoff", "Ingat, Roblox menilai game Build lewat empat pemeriksaan, termasuk uji main dan tampilan visual. Game harus terasa jadi, bukan prototipe."),
("payoff", "Roblox juga sudah mengumumkan Scene Generator: prompt ditambah gambar referensi, jadi tata letak map yang tinggal kamu rapikan di Studio."),
("outro", "Alatnya sama untuk semua orang. Yang membedakan, cara kamu menulis perintahnya. Ini Audira, selamat membangun."),
],
}

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
for ep, lines in L.items():
    folder = glob.glob(f"{ep}_*")[0]
    os.makedirs(f"{folder}/audio", exist_ok=True)
    out = {"lines": [{"id": f"l{i+1:02d}", "part": p, "text": t} for i, (p, t) in enumerate(lines)]}
    json.dump(out, open(f"{folder}/audio/vo-lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(ep, len(lines), "lines")
