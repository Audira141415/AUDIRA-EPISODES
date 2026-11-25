import re, pathlib
STATUS = "DISETUJUI pengguna 2026-11-08 (Setuju, lanjut)"
S = {
"EP039-pipa-minyak-dasar-laut": ("AE-039 Bagaimana Minyak Bisa Mengalir Melalui Pipa di Dasar Laut?", [
 ("HOOK", "Minyak dari tengah laut menempuh pipa puluhan kilometer di dasar laut. Kenapa tidak tersumbat di jalan?"),
 ("KONTEKS", "Di platform, pompa mendorong minyak ke darat lewat pipa baja. Isinya sering campuran minyak, gas, dan air."),
 ("MEKANISME", "Masalahnya, laut dalam itu dingin, hanya sekitar nol sampai tiga derajat. Saat minyak mendingin, lilin di dalamnya mengkristal dan menempel di dinding pipa. Jadi pipa dibungkus insulasi, dan ada yang dipanaskan listrik lewat dinding bajanya sendiri."),
 ("REVEAL", "Lilin yang tetap menempel dibersihkan oleh pig. Alat ini dimasukkan ke pipa dan didorong aliran minyak itu sendiri, mengikis dinding tanpa menghentikan produksi. Ada juga pig pintar yang membawa sensor untuk mencari karat."),
 ("PAYOFF", "Di luar, pipa dilapisi anti karat, gelang anoda, dan beton pemberat supaya tidak mengapung."),
 ("OUTRO", "Jadi minyak tidak sekadar mengalir, tapi dijaga sepanjang jalan. Ini AUDIRA Explained."),
]),
"EP044-esim": ("AE-044 Bagaimana eSIM Menggantikan Kartu SIM Fisik?", [
 ("HOOK", "Kartu SIM sekarang bisa dipasang tanpa pernah membuka baki SIM."),
 ("KONTEKS", "Itulah eSIM. Chipnya sudah disolder di dalam ponsel sejak pabrik, tapi awalnya kosong, belum berisi nomor."),
 ("MEKANISME", "Saat kamu membeli eSIM, operator menyiapkan profil nomormu di server. QR code yang kamu pindai tidak berisi nomor, hanya alamat server dan kode pesanan. Ponsel lalu menjemput profil itu sendiri. Chip dan server saling memeriksa sertifikat, dan profil dikirim terenkripsi sampai masuk ke chip."),
 ("REVEAL", "Satu chip bisa menyimpan beberapa profil operator, tapi hanya satu atau dua yang aktif bersamaan."),
 ("PAYOFF", "Di Indonesia, pindah ke eSIM masih imbauan, belum wajib. Sejak Juli dua ribu dua puluh enam, pelanggan baru mendaftar dengan pindai wajah. Dan tidak semua ponsel mendukung eSIM."),
 ("OUTRO", "Jadi kartunya hilang, tapi nomormu tetap ada. Ini AUDIRA Explained."),
]),
"EP045-gps-tanpa-internet": ("AE-045 GPS Tetap Bisa Menunjukkan Lokasi Meski Tanpa Internet?", [
 ("HOOK", "Kuota habis, tapi titik biru di peta tetap tahu kamu di mana."),
 ("KONTEKS", "Karena GPS tidak memakai internet. Satelit GPS hanya menyiarkan sinyal, seperti mercusuar. HP-mu cuma mendengarkan, tidak mengirim apa pun."),
 ("MEKANISME", "Tiap satelit membawa jam atom dan menyiarkan waktu serta posisinya dari ketinggian sekitar dua puluh ribu kilometer. HP mengukur berapa lama sinyal itu tiba, lalu mengubahnya jadi jarak. Dengan jarak ke empat satelit, posisimu dihitung. Tiga untuk titik, satu lagi untuk membetulkan jam HP."),
 ("REVEAL", "Lalu internet buat apa? Untuk gambar peta, info macet, dan mempercepat kunci posisi pertama."),
 ("PAYOFF", "Jadi unduh peta offline sebelum berangkat. Titik biru tetap jalan, dan rute mobil tetap dipandu, meski tanpa info lalu lintas."),
 ("OUTRO", "GPS mendengar langit, bukan internet. Ini AUDIRA Explained."),
]),
"EP054-autobahn-tanpa-batas": ("AE-054 Mengapa Autobahn Jerman Memiliki Ruas Tanpa Batas Kecepatan?", [
 ("HOOK", "Di jalan tol Jerman ada ruas tanpa angka batas kecepatan. Tapi itu bukan berarti bebas ngebut."),
 ("KONTEKS", "Aturan Jerman membatasi jalan luar kota seratus kilometer per jam, tapi Autobahn dikecualikan. Untuk mobil, yang ada hanya anjuran seratus tiga puluh."),
 ("MEKANISME", "Anjuran ini lahir dari krisis minyak tahun tujuh puluhan. Batas wajib seratus sempat berlaku sekitar seratus hari, lalu diganti anjuran. Melaju di atas seratus tiga puluh memang tidak ditilang. Tapi kalau celaka, kamu bisa ikut menanggung kerugian, walau bukan penyebabnya."),
 ("REVEAL", "Aturan lain tetap ketat. Kecepatan wajib disesuaikan kondisi, truk maksimal delapan puluh, dan menyalip hanya dari kiri."),
 ("PAYOFF", "Menurut data resmi terakhir, tahun dua ribu lima belas, sekitar tujuh puluh persen ruas hanya punya anjuran. Sisanya dibatasi rambu atau papan elektronik."),
 ("OUTRO", "Jadi tanpa batas bukan berarti tanpa aturan. Ini AUDIRA Explained."),
]),
"EP055-komputer-pertama": ("AE-055 Bagaimana Komputer Pertama Bisa Melakukan Perhitungan?", [
 ("HOOK", "Salah satu komputer elektronik pertama tidak punya layar. Ia punya sekitar delapan belas ribu tabung yang menyala."),
 ("KONTEKS", "Namanya ENIAC, diumumkan tahun sembilan belas empat puluh enam. Beratnya sekitar dua puluh tujuh ton dan memenuhi satu ruangan."),
 ("MEKANISME", "Tiap tabung vakum bekerja sebagai saklar listrik tanpa bagian bergerak. Tabung dirangkai jadi penghitung sepuluh posisi, nol sampai sembilan. Jadi ENIAC menghitung desimal, bukan biner. Tiap pulsa listrik memajukan penghitung satu langkah, dan lewat sembilan, ia menyimpan satu ke digit berikutnya, seperti odometer."),
 ("REVEAL", "Lalu bagaimana memprogramnya? Dengan tangan. Programmer mencabut dan memasang kabel, lalu memutar ribuan saklar. Satu soal bisa butuh persiapan berhari-hari."),
 ("PAYOFF", "Programmer pertamanya enam perempuan, yang namanya sempat tidak disebut saat ENIAC diumumkan."),
 ("OUTRO", "Jadi program pertama dibuat dengan kabel, bukan ketikan. Ini AUDIRA Explained."),
]),
}
if __name__ == "__main__":
    for ep, (title, parts) in S.items():
        words = sum(len(re.findall(r"\S+", t)) for _, t in parts)
        lo, hi = words / 150 * 60, words / 135 * 60
        md = [f"# SCRIPT — {title}", "", f"Status: {STATUS}. Durasi target 60 dtk.",
              f"Jumlah kata: **{words}** → estimasi **{lo:.0f}–{hi:.0f} dtk** @135–150 WPM (+ outro AUDIRA ±3 dtk).", "",
              "Sumber klaim: `research/SOURCE_REGISTER.md`.", ""]
        for k, t in parts:
            md += [f"## {k}", t, ""]
        md += ["## Teks VO polos", "", " ".join(t for _, t in parts), ""]
        pathlib.Path(ep, "SCRIPT.md").write_text("\n".join(md), encoding="utf-8")
        print(ep, words, f"{lo:.0f}-{hi:.0f}s")
