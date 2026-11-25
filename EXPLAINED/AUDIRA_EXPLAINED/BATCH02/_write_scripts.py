import re, pathlib
STATUS = "DISETUJUI pengguna 2026-11-07 (Setuju, lanjut)"
S = {
"EP042-banjir-kiriman": ("AE-042 Banjir Kiriman Bisa Diprediksi Sebelum Sampai ke Kota?", [
 ("HOOK", "Langit Jakarta masih cerah. Tapi di hulu, hujan deras sudah turun, dan airnya sedang menuju kota."),
 ("KONTEKS", "Inilah banjir kiriman. Air dari pegunungan mengalir lewat Sungai Ciliwung, butuh waktu berjam-jam untuk sampai."),
 ("MEKANISME", "Di sepanjang sungai ada pos pantau tinggi muka air. Yang paling terkenal Bendung Katulampa di Bogor, lalu Depok, lalu Pintu Air Manggarai. Tiap pos punya ambang Siaga empat sampai Siaga satu. Data dari hulu inilah yang dibaca lebih dulu."),
 ("REVEAL", "Begitu Katulampa naik, petugas memperkirakan air tiba di Manggarai sekitar enam sampai sembilan jam kemudian. Waktu itu dipakai untuk menyiapkan pompa, menyiagakan petugas, dan mengirim peringatan lewat sirene dan kanal resmi."),
 ("PAYOFF", "Tapi ingat, Katulampa hanya titik ukur, bukan keran banjir. Hujan di Jakarta sendiri juga bisa memicu genangan."),
 ("OUTRO", "Jadi banjir kiriman bisa diperkirakan, bukan dipastikan. Kamu biasa pantau tinggi air dari mana?"),
]),
"EP047-sinyal-hp-gedung": ("AE-047 Mengapa Sinyal HP Bisa Hilang di Dalam Gedung?", [
 ("HOOK", "Masuk lift, sinyal langsung ambruk. Padahal BTS-nya tidak ke mana-mana."),
 ("KONTEKS", "Sinyal HP adalah gelombang radio. Ia bisa menembus dinding, tapi setiap lapisan membuatnya melemah."),
 ("MEKANISME", "Beton bertulang meredam sinyal cukup kuat, dan makin tinggi frekuensinya, redamannya makin besar. Kaca biasa hampir tidak mengganggu, tapi kaca hemat energi berlapis logam bisa memangkas sinyal ratusan kali lipat. Lift lebih parah lagi: kotak logam yang mengurung HP-mu."),
 ("REVEAL", "Di basement, sinyal dari luar bisa jatuh sampai setara derau. Jadi bukan HP-mu yang rusak, sinyalnya habis di perjalanan."),
 ("PAYOFF", "Solusinya membawa sinyal ke dalam. Gedung besar memasang antena kecil di plafon yang tersambung ke operator, disebut in-building system. Ada juga small cell, dan panggilan lewat Wi-Fi."),
 ("OUTRO", "Jadi sinyal tidak hilang, ia tertahan dinding. Di gedung mana sinyalmu paling sering hilang?"),
]),
"EP049-kapal-baja-mengapung": ("AE-049 Mengapa Kapal Raksasa dari Baja Tidak Tenggelam?", [
 ("HOOK", "Paku baja langsung tenggelam. Kapal baja seberat ribuan ton malah mengapung. Kok bisa?"),
 ("KONTEKS", "Baja hampir delapan kali lebih padat dari air laut. Jadi rahasianya bukan bahannya, tapi bentuknya."),
 ("MEKANISME", "Archimedes menemukan aturannya: benda di air didorong ke atas dengan gaya seberat air yang ia pindahkan. Paku kecil memindahkan sedikit air, jadi kalah. Lambung kapal adalah cangkang baja tipis yang mengurung ruang sangat besar, jadi ia memindahkan banyak sekali air."),
 ("REVEAL", "Kalau dihitung rata-rata, baja ditambah udara di dalam lambung lebih ringan dari air sebanyak volume itu. Itulah kenapa kapal bisa mengapung."),
 ("PAYOFF", "Karena itu muatan dibatasi garis muat di lambung, supaya kapal tidak terlalu dalam. Di dalamnya ada sekat kedap air yang membatasi bocor di satu ruang."),
 ("OUTRO", "Jadi kapal mengapung bukan karena ringan, tapi karena bentuknya. Mau coba buktikan dengan perahu kertas?"),
]),
"EP052-jelantah-avtur": ("AE-052 Minyak Jelantah Bisa Diubah Menjadi Bahan Bakar Pesawat?", [
 ("HOOK", "Minyak bekas menggoreng di dapurmu bisa berakhir di tangki pesawat. Bagaimana caranya?"),
 ("KONTEKS", "Jelantah dan avtur sama-sama tersusun dari rantai karbon panjang. Bedanya, jelantah masih membawa oksigen."),
 ("MEKANISME", "Pertama, jelantah disaring dari kotoran dan air. Lalu dipanaskan bersama hidrogen dan katalis. Oksigennya dilepas menjadi air, dan rantainya dipotong serta dibentuk ulang supaya mirip avtur. Terakhir, hasilnya dipisahkan lewat distilasi."),
 ("REVEAL", "Bahan bakarnya disebut SAF. Aturan internasional membatasi campurannya, paling banyak setengah untuk jalur ini. Pesawat tidak terbang dengan jelantah murni."),
 ("PAYOFF", "Di Indonesia, jelantah sudah diolah bersama minyak bumi di Kilang Cilacap, dan pesawat komersial pertama memakainya pada Agustus dua ribu dua puluh lima."),
 ("OUTRO", "Jadi jelantah bukan sampah, tapi bahan bakar masa depan. Jelantah di rumahmu biasanya dibuang ke mana?"),
]),
"EP053-lampu-merah-adaptif": ("AE-053 Lampu Merah Bisa Mengatur Ribuan Kendaraan Secara Otomatis?", [
 ("HOOK", "Lampu merah di perempatan yang sama bisa menyala lebih lama pagi ini, dan lebih singkat sore nanti. Siapa yang mengatur?"),
 ("KONTEKS", "Lampu lalu lintas lama memakai jadwal tetap. Hijau sekian detik, merah sekian detik, apa pun yang terjadi di jalan."),
 ("MEKANISME", "Lampu yang lebih pintar membaca jalan. Di aspal tertanam kawat yang mendeteksi logam kendaraan, ditambah kamera dan radar yang menghitung antrean. Komputer lalu menambah atau mengurangi waktu hijau, dan menyelaraskan simpang berikutnya."),
 ("REVEAL", "Hasilnya gelombang hijau: lampu menyala hijau berurutan mengikuti laju kendaraan, bukan serentak."),
 ("PAYOFF", "Tapi belum semua simpang begitu. Di Jakarta, awal dua ribu dua puluh enam, sistem adaptif baru terpasang di seratus lima belas dari tiga ratus dua puluh satu simpang. Petugas di pusat kendali tetap mengawasi."),
 ("OUTRO", "Jadi lampu merah bisa pintar, tapi tidak bisa sendirian. Simpang mana yang menurutmu paling butuh?"),
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
