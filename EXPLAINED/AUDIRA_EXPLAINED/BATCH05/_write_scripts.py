import re, pathlib
STATUS = "DISETUJUI pengguna 2026-11-08 (Setuju, lanjut)"
S = {
"EP056-revolusi-industri": ("AE-056 Bagaimana Revolusi Industri Mengubah Dunia?", [
 ("HOOK", "Selama ribuan tahun, tenaga terkuat manusia hanya otot, air, dan angin. Lalu dalam sekitar satu abad, semuanya berubah."),
 ("KONTEKS", "Dulu kain dipintal di rumah. Tahun seribu tujuh ratus tujuh puluh satu, di Cromford, Inggris, mesin pintal dikumpulkan di satu gedung dan digerakkan roda air. Kini pekerja yang datang ke mesin."),
 ("MEKANISME", "Mesin uap sudah ada sejak awal seribu tujuh ratusan untuk memompa air tambang. James Watt tidak menemukannya, tapi membuatnya jauh lebih hemat batu bara, lalu bisa memutar roda. Pabrik tak perlu lagi di tepi sungai."),
 ("REVEAL", "Uap lalu naik ke rel. Tahun seribu delapan ratus tiga puluh, kereta uap menghubungkan Liverpool dan Manchester."),
 ("PAYOFF", "Perubahan paling terasa ada di hidup sehari-hari. Orang pindah ke kota, jam kerja ditentukan mesin, dan anak-anak ikut bekerja sampai aturan pabrik dibuat."),
 ("OUTRO", "Dunia modern dimulai dari roda air. Ini AUDIRA Explained."),
]),
"EP057-bata-ringan": ("AE-057 Mengapa Bata Ringan Lebih Ringan dari Bata Merah?", [
 ("HOOK", "Ukurannya sama, tapi bata ringan bisa sekitar sepertiga berat bata merah. Rahasianya, isinya kebanyakan udara."),
 ("KONTEKS", "Bata merah adalah tanah liat padat yang dibakar di tungku. Bata ringan dibuat dengan cara yang sangat berbeda."),
 ("MEKANISME", "Pasir halus dicampur semen, kapur, air, dan sedikit sekali bubuk aluminium. Di adonan yang basa, aluminium bereaksi dan melepas gas hidrogen. Jutaan gelembung kecil membuat adonan mengembang seperti roti. Lalu gasnya keluar, dan rongganya terisi udara."),
 ("REVEAL", "Adonan yang setengah keras dipotong kawat baja, lalu dimasak uap panas bertekanan, bukan dibakar. Pasir dan kapur membentuk kristal yang memberinya kekuatan."),
 ("PAYOFF", "Hasilnya, lebih dari separuh isinya udara. Udara diam itu juga menghambat panas. Tapi bata ringan menyerap air, jadi dinding luarnya tetap perlu diplester."),
 ("OUTRO", "Jadi bata ringan adalah batu berisi udara. Ini AUDIRA Explained."),
]),
"EP058-gedung-dirobohkan": ("AE-058 Bagaimana Gedung Lama Dirobohkan dengan Aman di Tengah Kota?", [
 ("HOOK", "Gedung tinggi di tengah kota jarang diledakkan. Kebanyakan justru dibongkar pelan-pelan, dari atas."),
 ("KONTEKS", "Di Indonesia, pembongkaran butuh persetujuan pemda dan rencana teknis, dan warga sekitar wajib diberi tahu."),
 ("MEKANISME", "Insinyur memetakan struktur dan mencari bahan berbahaya seperti asbes. Listrik, air, dan gas diputus, isi gedung dikosongkan, lalu gedung dibungkus jaring dan terpal. Alat berat kecil dinaikkan ke lantai teratas dan meremukkan beton lantai demi lantai. Air disemprotkan agar debu tidak terbang, dan getaran ke gedung tetangga dipantau."),
 ("REVEAL", "Di Jepang ada cara lain. Lantai teratas dijadikan topi tertutup yang diturunkan tiap satu lantai selesai. Dari luar, gedungnya seperti menyusut."),
 ("PAYOFF", "Kalau ada ruang, implosi bisa dipakai. Muatan kecil memutus kolom tertentu dengan jeda sepersekian detik, dan berat gedung sendiri yang merobohkannya."),
 ("OUTRO", "Merobohkan gedung itu soal kendali, bukan ledakan. Ini AUDIRA Explained."),
]),
"EP059-pelabuhan-ombak-besar": ("AE-059 Bagaimana Pelabuhan Menahan Kapal Saat Ombak Besar?", [
 ("HOOK", "Di luar, ombak badai mengamuk. Di dalam pelabuhan, kapal raksasa tetap tertambat. Apa yang menahannya?"),
 ("KONTEKS", "Pertahanan pertama ada jauh sebelum dermaga, yaitu breakwater. Tumpukan batu dan blok beton seperti tetrapod memecah ombak, jadi air di baliknya jauh lebih tenang."),
 ("MEKANISME", "Di dermaga, kapal diikat banyak tali ke bollard, dan tiap tali punya tugas. Tali haluan dan buritan menahan ujung kapal. Breast line menahan kapal agar tidak menjauh, dan spring line menahan kapal maju mundur. Di antara lambung dan dermaga, fender karet menyerap benturan."),
 ("REVEAL", "Tapi tali tidak dipasang lalu ditinggal. Saat air pasang surut dan muatan dibongkar, kapal naik turun, jadi tali terus disetel ulang."),
 ("PAYOFF", "Saat badai, tali ditambah dan kapal tunda disiagakan. Kalau terlalu berbahaya, kapal bisa diminta keluar ke laut. Sebab tali yang putus bisa melecut dan mematikan."),
 ("OUTRO", "Kapal aman karena dijaga berlapis. Ini AUDIRA Explained."),
]),
"EP062-stadion-aman": ("AE-062 Bagaimana Stadion Menampung Puluhan Ribu Penonton dengan Aman?", [
 ("HOOK", "Puluhan ribu orang di satu stadion, dan mereka hanya punya delapan menit untuk keluar dari tribun."),
 ("KONTEKS", "Batas itu dari Green Guide, pedoman keselamatan stadion Inggris. Delapan menit dihitung sampai jalur keluar yang lancar, bukan sampai luar stadion."),
 ("MEKANISME", "Lebar jalan diubah jadi angka. Tiap satu meter tangga dihitung mengalirkan enam puluh enam orang per menit, dan delapan puluh dua di jalan datar. Kalikan delapan menit, dan ketemu kapasitas sektor itu."),
 ("REVEAL", "Kuncinya, yang dihitung adalah titik tersempit, bukan gerbang terbesar. Lorong satu setengah meter menuju gerbang tiga meter tetap dihitung satu setengah meter."),
 ("PAYOFF", "Terlalu padat justru makin lambat. Di atas sekitar lima orang per meter persegi, risiko terhimpit naik tajam. Di Indonesia, aturan polisi sejak dua ribu dua puluh dua mewajibkan pintu dibuka lima belas menit sebelum laga berakhir."),
 ("OUTRO", "Stadion aman dihitung dari titik paling sempit. Ini AUDIRA Explained."),
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
