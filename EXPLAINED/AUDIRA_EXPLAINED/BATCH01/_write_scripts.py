import re, json, pathlib
S = {
"EP036-mrt-tidak-kebanjiran": ("AE-036 Terowongan MRT Tidak Kebanjiran Meski di Bawah Tanah?", [
 ("HOOK","Jakarta banjir, jalanan tergenang. Tapi puluhan meter di bawahnya, kereta MRT tetap melaju. Kok bisa?"),
 ("KONTEKS","Terowongan MRT Jakarta tidak kebal air. Ia dirancang berlapis, supaya air tidak sempat masuk."),
 ("MEKANISME","Lapisan pertama: saat mesin bor raksasa bernama Antareja menggali, cincin beton langsung dipasang di belakangnya, dan setiap sambungannya disegel. Lapisan kedua: satu-satunya jalan masuk air adalah pintu stasiun. Karena itu banyak pintu masuk dibuat lebih tinggi dari jalan, dan petugas bisa memasang panel penahan banjir dalam sekitar empat menit."),
 ("REVEAL","Lapisan ketiga jarang disadari: air yang lolos memang sudah diperhitungkan. Rembesan turun ke bak penampung di titik terendah, lalu pompa membuangnya ke saluran kota. Sensor di Kali Krukut juga memberi peringatan dini ke ruang kendali."),
 ("PAYOFF","Buktinya pada banjir awal Januari dua ribu dua puluh: jalan di atas tergenang, MRT tetap beroperasi normal."),
 ("OUTRO","Jadi rahasianya bukan kebal banjir, tapi tidak memberi air kesempatan. Menurutmu, stasiun mana yang paling rawan?"),
]),
"EP037-toilet-bus-akap": ("AE-037 Mengapa Toilet Bus AKAP Punya Aturan Pemakaian Khusus?", [
 ("HOOK","Pernah lihat tulisan ini di pintu toilet bus? Hanya untuk buang air kecil, dan hanya saat bus berjalan. Kenapa?"),
 ("KONTEKS","Jawabannya bergantung pada satu hal: ke mana buangannya pergi."),
 ("MEKANISME","Biliknya sempit, sekitar satu meter persegi, supaya penumpang tidak terbanting saat bus bergoyang. Air bilasnya dari tandon kecil yang terpisah. Nah, di kebanyakan bus AKAP, tidak ada tangki penampung. Saluran klosetnya tembus lantai, langsung ke jalan."),
 ("REVEAL","Saat bus melaju, cairan itu tersebar tipis di sepanjang jalan. Tapi saat bus berhenti di terminal atau SPBU, semuanya jatuh di satu titik dan meninggalkan genangan bau. Kotoran padat lebih parah, makanya umumnya dilarang."),
 ("PAYOFF","Kenapa tidak pakai tangki? Bisa, tapi butuh biaya, waktu menguras, dan ruang kolong yang sudah penuh bagasi, tangki solar, dan mesin. Sebagian PO memasang bio tank berisi bakteri pengurai, jadi toiletnya boleh dipakai lebih leluasa."),
 ("OUTRO","Jadi aturan itu bukan soal pelit. Itu soal pipa. Kamu pernah naik bus yang toiletnya bebas dipakai?"),
]),
"EP038-jakarta-turun-tanah": ("AE-038 Jakarta Terus Turun Tanah, Bagaimana Satelit Mengetahuinya?", [
 ("HOOK","Tanah Jakarta turun beberapa sentimeter tiap tahun. Alat yang paling teliti mengukurnya justru ada di luar angkasa."),
 ("KONTEKS","Penyebab utamanya air tanah yang disedot dari sumur dalam, sehingga lapisan lempung di bawah kota memadat. Tapi bagaimana mengukur penurunan sekecil itu di seluruh kota?"),
 ("MEKANISME","Jawabannya satelit radar seperti Sentinel-1. Ia menembakkan gelombang mikro miring ke bumi, menembus awan, siang dan malam, lalu mencatat fase gelombang yang memantul balik. Saat lewat lagi di jalur yang sama, ia memotret lagi."),
 ("REVEAL","Kalau tanah turun, jaraknya ke satelit bertambah sedikit, dan fase gelombangnya bergeser. Dua citra dibandingkan menjadi interferogram, pita warna pelangi. Satu putaran warna setara pergeseran hampir tiga sentimeter."),
 ("PAYOFF","Dengan menumpuk puluhan citra, komputer memilih ratusan ribu titik stabil, lalu menguncinya dengan GPS di darat. Petanya bercerita sama: pesisir utara dan barat paling cepat turun, umumnya tiga sampai sepuluh sentimeter per tahun."),
 ("OUTRO","Bukan tenggelam dalam semalam, tapi pelan dan terukur. Menurutmu, apa yang harus dihentikan lebih dulu?"),
]),
"EP040-etle-malam-hari": ("AE-040 Kamera ETLE Bisa Membaca Plat Nomor di Malam Hari?", [
 ("HOOK","Tengah malam, jalan gelap. Kamu kira kamera tilang tidak bisa melihat platmu? Justru platmu yang paling terang."),
 ("KONTEKS","Kamera ETLE membaca plat dengan teknologi pengenal plat otomatis. Kuncinya ada di plat itu sendiri."),
 ("MEKANISME","Kamera menyalakan cahayanya sendiri, tepat di sebelah lensa. Di beberapa lokasi berupa inframerah yang tak terlihat mata, di lokasi lain berupa kilatan lampu. Permukaan plat dibuat retroreflektif, memantulkan cahaya lurus kembali ke sumbernya. Latarnya menyala, hurufnya tetap gelap. Itu salah satu alasan plat diganti putih sejak dua ribu dua puluh dua: lebih kontras di kamera."),
 ("REVEAL","Shutter super cepat, sekitar seperseribu detik, membekukan mobil yang melaju. Software lalu mencari plat, meluruskannya, memotong per karakter, dan membacanya."),
 ("PAYOFF","Tapi kamera bukan hakim terakhir. Fotonya dicek petugas, dicocokkan dengan data kendaraan, baru surat konfirmasi dikirim ke pemilik."),
 ("OUTRO","Jadi gelap bukan tempat bersembunyi. Kamu pernah dapat surat konfirmasi ETLE?"),
]),
"EP043-air-pdam-keruh": ("AE-043 Mengapa Air PDAM Kadang Keruh Seperti Kopi Susu?", [
 ("HOOK","Keran dibuka, airnya cokelat seperti kopi susu. Padahal kemarin masih bening. Apa yang terjadi?"),
 ("KONTEKS","Ada dua tersangka utama: sungai di hulu, atau pipa di bawah jalanmu."),
 ("MEKANISME","Air PDAM berawal dari sungai. Di instalasi pengolahan, lumpur digumpalkan, diaduk pelan, diendapkan, disaring pasir, lalu diberi klor. Tapi saat sungai sangat keruh, sampai ribuan NTU, instalasi bisa kewalahan. Sebagian PDAM memilih mengurangi produksi daripada mengalirkan air keruh."),
 ("REVEAL","Tersangka kedua sering tak terduga. Air sudah jernih saat keluar instalasi, tapi di dinding pipa lama menempel endapan, kerak, dan lapisan lendir bakteri. Saat pipa diperbaiki, bocor, atau tekanannya berubah, endapan itu teraduk dan terbawa sampai ke keranmu."),
 ("PAYOFF","Padahal standar air minum harus di bawah tiga NTU. Kekeruhan mulai terlihat mata sekitar empat NTU."),
 ("OUTRO","Kalau air keruh, buka keran sebentar sampai jernih, jangan diminum dulu, dan lapor ke PDAM. Pernah mengalaminya di rumahmu?"),
]),
}
for ep,(title,parts) in S.items():
    words=sum(len(re.findall(r"\S+",t)) for _,t in parts)
    lo,hi=words/150*60,words/135*60
    md=[f"# SCRIPT — {title}","",f"Status: DISETUJUI pengguna 2026-11-07 (Setuju, lanjut). Durasi target 60 dtk.",
        f"Jumlah kata: **{words}** → estimasi **{lo:.0f}–{hi:.0f} dtk** @135–150 WPM (+ outro AUDIRA ±3 dtk).","",
        "Sumber klaim: `research/SOURCE_REGISTER.md`.",""]
    for k,t in parts: md+= [f"## {k}",t,""]
    md+=["## Teks VO polos","", " ".join(t for _,t in parts),""]
    pathlib.Path(ep,"SCRIPT.md").write_text("\n".join(md),encoding="utf-8")
    print(ep,words,f"{lo:.0f}-{hi:.0f}s")
