import re, pathlib
STATUS = "Ditulis AI 2026-11-23 (tanpa gerbang naskah; acc hanya sebelum render final)"
S = {
"EP060-dermaga-di-laut": ("AE-060 Bagaimana Dermaga Dibangun di Atas Laut?", [
 ("HOOK", "Dermaga sepanjang lebih dari tiga kilometer ini tidak mengapung. Ia berdiri di atas barisan tiang yang menancap ke dasar laut."),
 ("KONTEKS", "Di Terminal Kijing, Kalimantan Barat, dermaganya dibuat menjorok tiga ribu tiga ratus tujuh puluh empat meter. Tujuannya mencapai laut sedalam tujuh belas meter, cukup untuk kapal besar."),
 ("MEKANISME", "Semuanya dikerjakan dari tongkang. Crane mengangkat tiang, menegakkannya, lalu tiang digetarkan masuk ke lumpur. Setelah itu palu raksasa memukulnya berulang kali."),
 ("REVEAL", "Kapan berhenti memukul? Setiap pukulan diukur. Di satu proyek, tiang dihentikan saat turunnya tinggal sekitar satu milimeter per pukulan, tanda ujungnya sudah menumpu tanah keras. Satu tiang besar bisa makan lima jam, jadi satu crane hanya memasang sekitar satu tiang sehari."),
 ("PAYOFF", "Setelah tiang berdiri, balok dan pelat beton dipasang di atasnya, membentuk jalan di atas laut. Dermaga apung pun tetap dikunci tiang, lalu naik turun mengikuti pasang surut."),
 ("OUTRO", "Jadi dermaga adalah hutan tiang yang tersembunyi. Ini AUDIRA Explained."),
]),
"EP063-atap-stadion-tanpa-tiang": ("AE-063 Bagaimana Atap Stadion Raksasa Bisa Membentang Tanpa Banyak Tiang?", [
 ("HOOK", "Atap stadion ini menaungi tribun keliling tanpa satu pun tiang di depan penonton. Rahasianya mirip roda sepeda."),
 ("KONTEKS", "Tiangnya tetap ada, tapi hanya di tepi luar. Masalahnya, atap yang menjorok jauh ke arah lapangan ingin melengkung jatuh ke bawah."),
 ("MEKANISME", "Di stadion Stuttgart, Jerman, atapnya dibentuk seperti roda. Di tengah ada cincin tarik. Di tepi luar ada cincin tekan dari baja. Empat puluh rangka kabel menghubungkan keduanya, seperti jari-jari sepeda."),
 ("REVEAL", "Kabel hanya kuat saat ditarik, dan cincin luar menahan dorongan. Tarikan dari semua sisi saling meniadakan, jadi atap seberat ribuan ton seimbang sendiri dan cukup ditopang di kelilingnya."),
 ("PAYOFF", "Ada juga cara lain. Atap stadion JIS di Jakarta memakai rangka baja ruang seberat tiga ribu sembilan ratus ton. Rangka itu dirakit di bawah, lalu diangkat sekaligus dari enam belas titik."),
 ("OUTRO", "Atap raksasa melayang karena gayanya seimbang. Ini AUDIRA Explained."),
]),
"EP064-bandara-lahan-lunak": ("AE-064 Bagaimana Bandara Dibangun di Atas Lahan Lunak?", [
 ("HOOK", "Landasan pacu harus rata, padahal tanah di bawahnya bisa selembek bubur. Bandara Kansai di Jepang sudah turun hampir empat belas meter sejak dibangun."),
 ("KONTEKS", "Lempung lunak itu penuh air. Saat ditimbun, air pelan-pelan terperas keluar dan tanah ambles. Secara alami, prosesnya bisa makan puluhan tahun."),
 ("MEKANISME", "Insinyur mempercepatnya. Tanah ditusuk ribuan drain vertikal, jalur keluar air yang pendek. Di atasnya ditimbun tanah yang lebih berat dari beban bandara nanti. Air terdorong keluar lewat drain, dan pelat ukur mencatat setiap sentimeter penurunan."),
 ("REVEAL", "Di Kansai, satu juta tiang pasir ditancapkan. Penurunan lapisan atas yang biasanya puluhan tahun selesai sekitar satu tahun. Tapi lempung yang jauh lebih dalam tidak bisa diperbaiki, jadi bandaranya masih turun, kini kurang dari sepuluh sentimeter setahun."),
 ("PAYOFF", "Karena itu pemantauan tidak pernah berhenti. Sembilan ratus kolom terminalnya diukur otomatis, dan kolom yang turun didongkrak lalu diganjal pelat baja."),
 ("OUTRO", "Tanah lunak tidak dibuat diam, tapi dikendalikan. Ini AUDIRA Explained."),
]),
"EP067-terowongan-air": ("AE-067 Bagaimana Terowongan Air Membawa Air Antarwilayah?", [
 ("HOOK", "Sekitar separuh air minum kota New York mengalir lewat satu terowongan sepanjang seratus tiga puluh tujuh kilometer."),
 ("KONTEKS", "Namanya Delaware Aqueduct, dibangun antara tahun seribu sembilan ratus tiga puluh sembilan dan seribu sembilan ratus empat puluh lima. Airnya diambil dari waduk di pegunungan, jauh di utara kota."),
 ("MEKANISME", "Kuncinya beda ketinggian. Waduk berada lebih tinggi dari kota, jadi air terus mengalir turun. Kalau terowongan terisi penuh, air bahkan bisa naik lagi, asal ujungnya tetap lebih rendah dari permukaan waduk. Dindingnya dilapisi beton supaya air tidak merembes."),
 ("REVEAL", "Hasilnya, sembilan puluh tujuh persen air New York sampai ke keran hanya dengan gravitasi. Tapi beton tetap bisa retak. Terowongan ini bocor sampai seratus tiga puluh enam juta liter sehari, sampai dibuatkan jalur pintas di bawah Sungai Hudson."),
 ("PAYOFF", "Di Indonesia, terowongan juga dipakai memindahkan air banjir. Sodetan Ciliwung mengalirkan sekitar enam puluh meter kubik per detik ke Kanal Banjir Timur."),
 ("OUTRO", "Air cukup turun, terowongan yang menunjukkan jalannya. Ini AUDIRA Explained."),
]),
"EP068-pipa-bawah-jalan": ("AE-068 Bagaimana Pipa Raksasa Dipasang di Bawah Jalan?", [
 ("HOOK", "Pipa selebar hampir dua meter ini lewat di bawah jalan raya, tanpa aspalnya dibongkar."),
 ("KONTEKS", "Di Jalan DI Panjaitan, Jakarta Timur, dari atas hanya terlihat beberapa lubang galian yang tampak diam. Padahal itu pintu masuk dan keluar pipa."),
 ("MEKANISME", "Teknik ini disebut pipe jacking. Di depan, mesin bor bulat mengikis tanah. Di lubang dorong, dongkrak hidrolik mendorong pipa beton di belakangnya, satu potong demi satu potong. Laser menjaga arah mesin agar tetap lurus menuju lubang terima."),
 ("REVEAL", "Di proyek itu, setiap potong pipa panjangnya dua koma empat tiga meter, dan seratus delapan puluh sembilan potong didorong bergiliran. Di Sodetan Ciliwung, pipa selebar empat meter didorong sejauh lima ratus sembilan puluh meter."),
 ("PAYOFF", "Ada juga pengeboran horizontal terarah. Lubang kecil dibor miring dari permukaan, diperbesar, lalu pipanya ditarik pulang melewati bawah jalan."),
 ("OUTRO", "Di atas lalu lintas jalan terus, di bawah pipa merayap pelan. Ini AUDIRA Explained."),
]),
}
if __name__ == "__main__":
    for ep, (title, parts) in S.items():
        n = sum(len(t.split()) for _, t in parts)
        body = "\n\n".join(f"## {sec}\n{txt}" for sec, txt in parts)
        src = "Sumber fakta: research/SOURCE_REGISTER.md (patuhi JANGAN DIKLAIM di research/RESEARCH_REPORT.md)."
        md = f"# {title}\n\nStatus: {STATUS}\nKata: {n} (estimasi {n/150*60:.0f}–{n/135*60:.0f} dtk di 135–150 WPM)\n{src}\n\n{body}\n"
        pathlib.Path(ep, "SCRIPT.md").write_text(md, encoding="utf-8")
        print(ep, n, "kata", f"{n/150*60:.0f}-{n/135*60:.0f}s")
