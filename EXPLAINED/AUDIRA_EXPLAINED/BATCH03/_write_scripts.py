import re, pathlib
STATUS = "DISETUJUI pengguna 2026-11-07 (Setuju, lanjut)"
S = {
"EP046-kabel-internet-bawah-laut": ("AE-046 Kabel Internet Bawah Laut Bisa Menghubungkan Antarnegara?", [
 ("HOOK", "Video yang kamu tonton dari luar negeri tidak lewat angkasa. Ia merayap di dasar laut."),
 ("KONTEKS", "Lebih dari sembilan puluh lima persen komunikasi internasional lewat kabel bawah laut. Satelit hanya cadangan dan untuk daerah terpencil."),
 ("MEKANISME", "Di dalamnya ada serat optik setipis rambut yang membawa data sebagai kilatan cahaya. Di laut dalam, kabelnya cuma seukuran selang taman. Dekat pantai, kabel dibungkus baja dan dikubur supaya aman dari jangkar."),
 ("REVEAL", "Cahaya melemah setelah puluhan kilometer, jadi di sepanjang kabel ada repeater yang menguatkannya lagi. Listriknya dikirim dari stasiun di darat lewat kabel tembaga di dalam kabel itu sendiri."),
 ("PAYOFF", "Musuh terbesarnya bukan hiu, tapi jangkar kapal dan jaring pukat. Saat putus, kapal khusus mengangkat dan menyambungnya di tengah laut."),
 ("OUTRO", "Jadi internet kita benar-benar terhubung lewat dasar samudra. Ini AUDIRA Explained."),
]),
"EP041-limbah-gedung-tinggi": ("AE-041 Bagaimana Air dan Limbah dari Lantai 50 Bisa Turun?", [
 ("HOOK", "Kamu menyiram toilet di lantai lima puluh. Dua ratus meter di bawah, ke mana semuanya pergi?"),
 ("KONTEKS", "Gedung tinggi memakai gravitasi. Semua limbah masuk ke satu pipa tegak besar yang menembus setiap lantai."),
 ("MEKANISME", "Uniknya, limbah tidak terjun bebas. Ia meluncur sebagai cincin air yang menempel di dinding pipa, dengan inti udara di tengah. Kecepatannya cepat mentok, hanya beberapa meter per detik."),
 ("REVEAL", "Lalu kenapa toilet tidak bau? Setiap wastafel dan toilet punya leher berisi air yang menahan gas selokan. Pipa ven di samping pipa tegak menyamakan tekanan udara, supaya air penutup itu tidak tersedot."),
 ("PAYOFF", "Di bawah, limbah diolah dulu di instalasi pengolahan sebelum dibuang ke saluran kota. Yang lebih rendah dari saluran dipompa naik."),
 ("OUTRO", "Jadi gedung tinggi bukan cuma soal naik, tapi juga cara turun yang rapi. Ini AUDIRA Explained."),
]),
"EP050-koper-bandara": ("AE-050 Bagaimana Bandara Menjaga Koper Tidak Tertukar?", [
 ("HOOK", "Ribuan koper masuk ke lubang yang sama. Kenapa kopermu bisa ikut ke kota yang benar?"),
 ("KONTEKS", "Rahasianya ada di stiker kecil yang ditempel di check-in."),
 ("MEKANISME", "Tag bagasi berisi barcode dengan nomor sepuluh digit dan kode bandara tujuan. Nomor itu terhubung ke data penerbanganmu. Di balik dinding, konveyor membawa koper melewati gerbang pemindai otomatis yang membaca barcode itu."),
 ("REVEAL", "Setelah diperiksa mesin sinar-X, sorter mendorong tiap koper ke jalur penerbangannya. Koper juga hanya diterbangkan kalau pemiliknya benar-benar naik pesawat."),
 ("PAYOFF", "Tapi sistem ini tidak sempurna. Pada dua ribu dua puluh lima, sekitar dua puluh empat juta koper bermasalah di seluruh dunia, kebanyakan saat transit."),
 ("OUTRO", "Jadi simpan tanda terima bagasimu baik-baik. Ini AUDIRA Explained."),
]),
"EP051-kolam-renang-bersih": ("AE-051 Bagaimana Kolam Renang Umum Tetap Bersih Meski Dipakai Banyak Orang?", [
 ("HOOK", "Ratusan orang berenang di air yang sama. Kenapa airnya tetap jernih?"),
 ("KONTEKS", "Kolam umum tidak dikuras tiap hari. Airnya diputar dan dibersihkan terus-menerus."),
 ("MEKANISME", "Sebagian besar air diambil dari permukaan lewat skimmer, sisanya dari saluran di dasar. Pompa mendorongnya melewati filter pasir yang menahan kotoran halus, lalu klor dan penyeimbang pH ditambahkan sebelum air kembali ke kolam."),
 ("REVEAL", "Bau kaporit yang menyengat justru tanda klor sedang bereaksi dengan keringat dan urine, membentuk kloramin. Dan ada kuman yang bisa bertahan berhari-hari meski ada klor."),
 ("PAYOFF", "Di Indonesia, sisa klor bebas di kolam dijaga sekitar satu sampai satu setengah miligram per liter, dan pH tujuh sampai tujuh koma delapan."),
 ("OUTRO", "Jadi mandi dulu sebelum berenang. Ini AUDIRA Explained."),
]),
"EP048-pabrik-mobil": ("AE-048 Bagaimana Pabrik Mobil Bisa Memproduksi Ribuan Mobil?", [
 ("HOOK", "Di sebuah pabrik di Karawang, satu mobil keluar dari jalur kira-kira tiap seratus detik. Tapi membuat satu mobil butuh berjam-jam."),
 ("KONTEKS", "Kuncinya bukan kerja cepat, tapi banyak mobil dikerjakan bersamaan di satu jalur yang terus bergerak."),
 ("MEKANISME", "Pertama, lembaran baja dipres jadi panel. Robot lalu mengelas ribuan titik sampai jadi rangka bodi. Bodi dicelup cat antikarat bermuatan listrik, dilapisi cat warna, lalu dipanggang di oven."),
 ("REVEAL", "Di jalur perakitan, pintu dilepas dulu, lalu bodi disatukan dengan mesin dan suspensi. Pekerja dan robot memasang ribuan komponen yang datang tepat waktu."),
 ("PAYOFF", "Sebelum keluar, mobil disiram air untuk cek kebocoran dan diuji di atas roller. Kalau ada masalah, pekerja bisa menarik tali andon dan menghentikan lini."),
 ("OUTRO", "Jadi ribuan mobil lahir dari ritme, bukan terburu-buru. Ini AUDIRA Explained."),
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
