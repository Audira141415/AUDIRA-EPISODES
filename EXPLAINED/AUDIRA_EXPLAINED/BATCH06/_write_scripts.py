import re, pathlib
STATUS = "DISETUJUI pengguna 2026-11-10 (Setuju, lanjut)"
S = {
"EP065-jembatan-angkat": ("AE-065 Bagaimana Jembatan Bisa Diangkat agar Kapal Bisa Lewat?", [
 ("HOOK", "Jalan raya ini sebentar lagi berdiri hampir tegak. Mobil berhenti, dan kapal tinggi lewat di bawahnya."),
 ("KONTEKS", "Ini jembatan jungkit, atau bascule. Lampu berubah merah, palang turun, dan jalan dikosongkan. Lalu lintas bisa menunggu beberapa menit."),
 ("MEKANISME", "Tiap daun jembatan berputar pada poros di dalam pilar. Di belakang poros, ekor daun membawa pemberat besar. Motor memutar roda gigi kecil yang menggigit rak gigi lengkung. Pemberat berayun turun, dan ujung jalan terangkat."),
 ("REVEAL", "Kuncinya keseimbangan. Daun dan pemberat menjadi satu jungkat-jungkit yang hampir seimbang. Daun Tower Bridge di London beratnya lebih dari seribu ton, tapi motornya hanya melawan selisih kecil, gesekan, dan angin."),
 ("PAYOFF", "Ada juga jembatan yang deknya naik lurus seperti lift. Jembatan Ampera di Palembang dulu begitu, sampai berhenti diangkat sejak seribu sembilan ratus tujuh puluh."),
 ("OUTRO", "Jembatan berat bisa terangkat karena seimbang. Ini AUDIRA Explained."),
]),
"EP066-menara-atc": ("AE-066 Bagaimana Menara Pengawas Bandara Mengatur Pergerakan Pesawat?", [
 ("HOOK", "Pilot tidak bebas terbang atau mendarat sendiri. Setiap gerakan di bandara menunggu izin."),
 ("KONTEKS", "Di bandara sibuk, izin itu dibagi ke beberapa petugas. Delivery memberi izin rute. Ground mengatur pesawat di taxiway. Tower mengatur landasan."),
 ("MEKANISME", "Kata-katanya diatur ketat. Line up and wait artinya masuk landasan lalu diam. Pesawat baru boleh terbang setelah mendengar cleared for takeoff. Setelah mengudara, Approach memakai radar untuk menjaga jarak antarpesawat."),
 ("REVEAL", "Taxiway juga punya lampu lalu lintas sendiri. Tepinya biru, garis tengahnya hijau. Di bandara yang memasangnya, ada stop bar merah melintang. Selama merah menyala, pilot tidak boleh melintas, meski sudah diberi izin lisan."),
 ("PAYOFF", "Pesawat besar juga meninggalkan pusaran udara di belakangnya, jadi pesawat berikutnya diberi jarak lebih jauh. Di Indonesia, semua pemanduan ini dipegang satu lembaga, AirNav Indonesia."),
 ("OUTRO", "Langit ramai tetap tertib karena satu kata, izin. Ini AUDIRA Explained."),
]),
"EP069-pengolahan-limbah": ("AE-069 Bagaimana Sistem Sewerage Kota Mengolah Air Limbah?", [
 ("HOOK", "Air bekas mandimu bisa kembali ke sungai jauh lebih bersih. Syaratnya, rumahmu tersambung ke IPAL."),
 ("KONTEKS", "Kebanyakan rumah di kota masih memakai tangki septik. Di kawasan berpipa, air kamar mandi dan kloset mengalir ke pipa miring di bawah jalan."),
 ("MEKANISME", "Di IPAL, saringan batang menahan sampah, pasir diendapkan, lalu kotoran berat turun di bak yang tenang."),
 ("REVEAL", "Pekerja terpentingnya justru mikroba. Udara ditiupkan dari dasar bak, dan bakteri memakan kotoran yang terlarut. Di Jakarta, bakteri itu menempel di potongan plastik kecil yang terus berputar. Sebagian lumpur bakteri dikembalikan supaya pekerjanya tetap banyak."),
 ("PAYOFF", "Di IPAL Krukut, BOD, ukuran kotoran yang mencuri oksigen sungai, turun dari sekitar seratus lima puluh menjadi di bawah tiga puluh miligram per liter. Setelah didesinfeksi, air dialirkan ke sungai."),
 ("OUTRO", "Lebih bersih, tapi tetap bukan air minum. Ini AUDIRA Explained."),
]),
"EP071-gedung-tahan-api": ("AE-071 Bagaimana Gedung Dirancang Agar Tidak Mudah Terbakar?", [
 ("HOOK", "Api di satu ruangan bisa ditahan supaya tidak menjalar ke ruang sebelah. Setidaknya untuk waktu tertentu."),
 ("KONTEKS", "Caranya, gedung dibagi menjadi kotak-kotak yang disebut kompartemen. Dinding dan lantainya tahan api, dan ketahanannya diukur dalam menit, misalnya enam puluh menit."),
 ("MEKANISME", "Setiap lubang di dinding itu harus ditutup. Pipa dan kabel yang menembusnya disumbat bahan penyetop api. Di plafon, tiap kepala sprinkler punya bulb kaca kecil. Bulb pecah karena panas, jadi hanya kepala di atas api yang menyemprot."),
 ("REVEAL", "Bagian paling penting justru pintunya. Pintu tahan api wajib menutup sendiri. Pintu yang diganjal terbuka sama saja dengan melubangi dinding pemisah api."),
 ("PAYOFF", "Di gedung lebih tinggi dari dua puluh empat meter, tangga darurat diberi tekanan udara, supaya asap terdorong keluar. Semua ini membeli waktu untuk evakuasi."),
 ("OUTRO", "Jadi jangan pernah mengganjal pintu darurat. Ini AUDIRA Explained."),
]),
"EP073-rumah-3d-print": ("AE-073 Bagaimana Teknologi 3D Printing Bisa Membangun Rumah?", [
 ("HOOK", "Mesin sebesar truk ini tidak menyemprot beton. Ia memerasnya seperti pasta gigi, lapis demi lapis."),
 ("KONTEKS", "Semua dimulai dari model tiga dimensi. Software memotongnya menjadi lapisan tipis dan jalur gerak kepala cetak. Fondasinya tetap dicor dengan cara biasa."),
 ("MEKANISME", "Mortar khusus dicampur dan dipompa lewat selang. Nozzle memeras tali beton setebal satu sampai empat sentimeter, mengelilingi denah, lalu naik satu lapis. Rahasianya, adonan cair saat dipompa, tapi langsung kaku setelah keluar, sehingga kuat menahan lapisan di atasnya tanpa cetakan."),
 ("REVEAL", "Dindingnya sering dicetak berongga, dua kulit dengan penghubung zigzag. Rongga itu lalu diisi insulasi, besi, atau kabel."),
 ("PAYOFF", "Tapi jam cetak bukan rumah jadi. Di Beckum, Jerman, dindingnya dicetak seratus jam, sedangkan atap, jendela, dan instalasi tetap dipasang pekerja."),
 ("OUTRO", "Printernya mencetak dinding, bukan seluruh rumah. Ini AUDIRA Explained."),
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
