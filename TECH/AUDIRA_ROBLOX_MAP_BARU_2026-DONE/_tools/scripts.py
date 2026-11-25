# Naskah 5 short AUDIRA_ROBLOX_MAP_BARU_2026 (spoken text: angka ditulis dengan kata, "Audira" huruf biasa agar TTS tidak mengeja).
# Jalankan dari mana saja: python _tools/scripts.py  -> menulis EPxx/docs/SCRIPT.md, EPxx/docs/script.json, SCRIPTS_DRAFT.md
import os, glob, json

STAGES = ["Hook (0–3 dtk)", "Context (4–15 dtk)", "Main Development (16–45 dtk)", "Explanation (46–70 dtk)", "Visual Payoff (71–85 dtk)", "Outro (86–90 dtk)"]
S = {
"EP01": ("70.000 Game dari AI", [
"Lebih dari tujuh puluh ribu game baru lahir di Roblox, dan semuanya berawal dari satu kalimat yang diketik di HP.",
"Namanya Build, fitur AI baru di aplikasi Roblox. Kamu tulis ide game, AI yang merakitnya. Uji cobanya dimulai Juli dua ribu dua puluh enam di Selandia Baru. Sampai awal September, sekitar sembilan ribu game sudah terbit, dan tujuh puluh satu persen pembuatnya belum pernah membuka Roblox Studio.",
"Lalu angkanya meledak. Menurut surat investor Roblox kuartal ketiga, lebih dari lima ratus ribu orang sudah memakai Build dan menerbitkan lebih dari tujuh puluh ribu game. Unggahan aset harian ke Roblox bahkan naik tiga kali lipat dalam sebulan. Roblox sendiri menyebutnya ledakan konten.",
"Dan bukan cuma pemula. Lebih dari delapan puluh persen dari seratus game teratas sudah memakai alat AI. Dua game yang hampir seluruhnya dibuat dengan AI, Break and Steal an Egg dan Huss Valley, bahkan tembus dua puluh besar. Hasil AI-nya juga makin rapi: hasil yang meleset turun dari delapan belas persen jadi tiga persen.",
"Tapi ada sisi gelapnya. Makin mudah bikin game, makin mudah juga menjiplak. Klon game viral bermunculan di Roblox, kadang sebelum game aslinya rilis. Sekarang, bikin map itu gampang. Bikin map yang beda, itu yang langka.",
"Episode berikutnya, kita bongkar kenapa map baru bisa viral dalam sembilan puluh hari. Ikuti Audira.",
]),
"EP02": ("Map Viral 90 Hari", [
"Hampir sepertiga game paling ramai di Roblox, umurnya belum genap tiga bulan.",
"Data Agustus dua ribu dua puluh enam: dua puluh delapan persen dari seratus game teratas baru diluncurkan dalam sembilan puluh hari terakhir. Artinya, puncak Roblox bukan cuma milik game lama. Map baru bisa menyalip, seperti Ninety Nine Nights in the Forest yang disebut Roblox sebagai game breakout.",
"Dan puncaknya gila. Grow a Garden dan Steal a Brainrot pernah dimainkan lebih dari dua puluh juta orang sekaligus. Uangnya juga nyata. Dalam dua belas bulan sampai Juni dua ribu dua puluh enam, kreator menerima sekitar satu koma tujuh miliar dolar lewat DevEx, program penukaran Robux ke uang. Sejak dua ribu tiga belas, totalnya sudah lebih dari lima miliar dolar.",
"Tapi lihat pembagiannya. Sepuluh kreator teratas rata-rata dapat enam puluh lima koma tujuh juta dolar. Seratus teratas, sepuluh koma delapan juta. Seribu teratas, satu koma empat juta. Sementara median dari lebih dari empat puluh dua ribu kreator DevEx, cuma sekitar seribu lima ratus dolar setahun.",
"Jadi peluangnya terbuka, tapi timpang. Kabar baiknya, delapan puluh tiga persen kreator Amerika yang disurvei adalah perorangan, bukan studio besar. Yang membedakan bukan modal, tapi cara map itu dirancang supaya pemain betah.",
"Soal betah, algoritma Roblox punya ukurannya sendiri. Kita bahas di episode berikutnya. Ini Audira.",
]),
"EP03": ("Algoritma 60 Detik", [
"Map barumu dinilai dalam enam puluh detik pertama. Kalau pemain kabur sebelum itu, algoritma Roblox mencatatnya sebagai tanda buruk.",
"Roblox menjelaskan sinyal ini di dokumen resmi untuk kreator. Ada beberapa ukuran yang paling menentukan, apakah gamemu muncul di Rekomendasi Untukmu.",
"Pertama, play through rate: dari semua yang melihat gamemu, berapa yang benar-benar masuk bermain. Kedua, first play bounce rate: berapa pemain baru yang keluar di bawah enam puluh detik, atau sebelum tiga menit. Ini sinyal negatif. Ketiga, berapa hari pemain kembali: hari pertama, hari kedua sampai ketujuh, dan hari kedelapan sampai kedua puluh delapan. Keempat, lama bermain, dihitung maksimal enam puluh menit per pemain per hari. Ada juga sinyal tambahan: berapa hari pemain main bareng teman, dan berapa hari mereka belanja di dalam game.",
"Cara kerjanya bertahap. Setelah kamu update, Roblox bisa mengirim gelombang pemain baru untuk menguji. Kalau kelompok itu betah, jangkauannya diperluas. Sejak RDC dua ribu dua puluh enam, penilaiannya juga melihat sampai dua puluh delapan hari, bukan cuma minggu pertama. Selera juga beda: pemain muda cenderung suka game pendek, pemain lebih tua suka game yang dalam.",
"Jadi tipsnya sederhana. Ajarkan inti permainan secepatnya. Langsung bawa pemain ke bagian seru, jangan ke menu panjang. Buat level awal gampang naik, dan sisakan rasa penasaran supaya mereka kembali besok.",
"Tapi pemain tidak akan masuk kalau thumbnail-mu tenggelam. Itu episode berikutnya. Ikuti Audira.",
]),
"EP04": ("Thumbnail Anti Tenggelam", [
"Tanpa satu gambar ini, map barumu tidak akan pernah muncul di beranda Roblox.",
"Gambar itu adalah thumbnail. Menurut dokumen resmi Roblox, game wajib punya thumbnail buatan sendiri supaya bisa direkomendasikan di beranda. Thumbnail bawaan tidak memenuhi syarat.",
"Formatnya enam belas banding sembilan, idealnya seribu sembilan ratus dua puluh kali seribu delapan puluh piksel, maksimal tiga megabyte. Lalu ada senjata rahasianya: personalisasi thumbnail. Aktifkan dua sampai lima thumbnail, dan Roblox memilih yang paling cocok untuk tiap pemain. Dalam uji cobanya, rata-rata pemain yang klik lalu benar-benar bermain naik delapan koma lima persen. Ada game yang naik sampai lima puluh persen.",
"Mau pakai video? Boleh, asal gameplay asli, tanpa suara narasi, dan maksimal tiga kali unggah sebulan. Hati-hati juga dengan judul umpan. Judul seperti Robux gratis, main sekarang, justru tidak diprioritaskan. Judul atau gambar yang tidak sesuai isi game juga makin jarang ditampilkan. Satu lagi, ada tab Moments, tempat video gameplay bisa langsung diklik untuk main. Untuk sekarang, fitur ini baru penuh di Amerika.",
"Jadi resepnya: ikut tren boleh, tapi beri sentuhanmu sendiri. Tunjukkan momen paling seru dari mapmu, buat beberapa versi, lalu biarkan data memilih pemenangnya.",
"Episode terakhir, kita bikin map pakai prompt, dengan cara yang benar. Ini Audira.",
]),
"EP05": ("Bikin Map Pakai Prompt", [
"Sekarang kamu bisa bikin game Roblox cuma dengan mengetik. Tapi prompt asal-asalan, hasilnya juga asal-asalan.",
"Ada dua jalur. Build di aplikasi Roblox, untuk game dua dimensi dan dua setengah dimensi: clicker, arcade, kumpulkan poin, side-scroller, dan puzzle. Lalu Assistant di Roblox Studio, untuk yang mau kontrol penuh.",
"Di Build, satu pesan sama dengan satu prompt. Ada jatah gratis harian, dan kalau habis, kreditnya dibeli dengan Robux. Jadi jangan boros. Data Roblox, sekitar empat belas persen sesi prompt berakhir dengan game yang diterbitkan. Ada satu jebakan penting: kalau game Build kamu edit di Studio, statusnya berubah permanen jadi game Studio biasa.",
"Untuk Assistant, dokumentasi Roblox memberi tiga kunci. Satu, tulis spesifik. Dua, pilih dulu objeknya, supaya Assistant tahu yang kamu maksud. Tiga, pecah jadi beberapa langkah. Contoh resminya: buat NPC yang berpatroli, lalu mengejar pemain kalau jaraknya dalam sepuluh stud. Jelas siapa, melakukan apa, dan kapan.",
"Ingat, Roblox menilai game Build lewat empat pemeriksaan, termasuk uji main dan tampilan visual. Game harus terasa jadi, bukan prototipe. Roblox juga sudah mengumumkan Scene Generator: prompt ditambah gambar referensi, jadi tata letak map yang tinggal kamu rapikan di Studio.",
"Alatnya sama untuk semua orang. Yang membedakan, cara kamu menulis perintahnya. Ini Audira, selamat membangun.",
]),
}

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
out = ["# NASKAH 5 SHORT — Roblox Map Baru (draf untuk acc, 2026-11-11)\n",
       "Estimasi durasi = kata ÷ 135–150 WPM. Angka ditulis dengan kata (teks yang dibacakan VO). Fakta: `EPxx/research/FACTS.md`.\n"]
summary = {}
for ep, (title, parts) in S.items():
    folder = glob.glob(f"{ep}_*")[0]
    n = sum(len(p.split()) for p in parts)
    lo, hi = n / 150 * 60, n / 135 * 60
    summary[ep] = (n, round(lo), round(hi))
    body = [f"# Naskah — {folder}\n", f"Judul: **{title}** · {n} kata · estimasi {lo:.0f}–{hi:.0f} dtk (135–150 WPM)\n"]
    for st, p in zip(STAGES, parts):
        body.append(f"### {st}\n{p}\n")
    body.append("AUDIRA. Created by Agus Dwi R.\n")
    open(f"{folder}/docs/SCRIPT.md", "w", encoding="utf-8").write("\n".join(body))
    json.dump({"title": title, "parts": parts, "words": n}, open(f"{folder}/docs/script.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    out.append(f"\n## {ep} — {title} ({n} kata ≈ {lo:.0f}–{hi:.0f} dtk)\n")
    for st, p in zip(STAGES, parts):
        out.append(f"**{st.split(' (')[0]}:** {p}\n")
open("SCRIPTS_DRAFT.md", "w", encoding="utf-8").write("\n".join(out))
print(summary)
