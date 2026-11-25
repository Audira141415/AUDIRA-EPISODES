"""Writes SCRIPT.md, CREATIVE_BRIEF.md and SOURCE_REGISTER.md for EP02-EP04 from script-lines.json. Run from AUDIRA_IJAZAH_2026."""
import json, re
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
CNN1 = "[CNN Indonesia, uji ulang](https://www.cnnindonesia.com/nasional/20261105153623-12-1423727/jokowi-keberatan-ijazah-diuji-ulang-di-sidang-sudah-di-labfor-polri/amp)"
TIR1 = "[Tirto, uji ulang](https://tirto.id/jokowi-keberatan-apabila-ijazahnya-diuji-ulang-di-labfor-h1ex)"
MI = "[Media Indonesia](https://mediaindonesia.com/politik-dan-hukum/952763/jokowi-serahkan-ijazah-asli-sd-s1-di-sidang-pn-jaktim-tolak-uji-ulang)"
BS = "[BeritaSatu](https://www.beritasatu.com/nasional/3038997/keabsahan-ijazah-masih-jadi-pertanyaan-jokowi-masa-diuji-lagi)"
KTV = "[Kompas TV, Refly](https://www.kompas.tv/nasional/699916/kubu-roy-suryo-minta-ijazah-jokowi-yang-ditunjukkan-di-sidang-diuji-secara-memadai)"
ELA = "[Kompas TV, ELA](https://www.kompas.tv/info-publik/699833/mengenal-error-level-analysis-yang-dipakai-roy-suryo-analisis-ijazah-jokowi?page=all)"
DT1 = "[detikNews, Roy menolak](https://news.detik.com/berita/d-8740057/roy-suryo-tolak-semua-kesaksian-jokowi-di-sidang-kasus-ijazah)"
KB = "[Kompas, 22 Mei 2025](https://nasional.kompas.com/read/2025/05/22/16051491/ijazah-jokowi-asli-bareskrim-hentikan-penyelidikan-kasusnya)"
WE = "[Warta Ekonomi](https://wartaekonomi.co.id/read645872/roy-suryo-sebut-ijazah-yang-ditunjukkan-jokowi-hasil-cetakan-ulang)"
MT = "[Metro TV, tata tertib](https://www.metrotvnews.com/play/bzGC2JD4-kubu-roy-suryo-nilai-aksi-jokowi-pamer-ijazah-di-sidang-langgar-tata-tertib)"
BBC = "[BBC Indonesia](https://www.bbc.com/indonesia/articles/cm9dzwn4djyjo.amp)"
K1 = "[Kompas, reaksi Roy](https://megapolitan.kompas.com/read/2026/11/05/11335131/reaksi-roy-suryo-saat-jokowi-pamerkan-ijazah-di-sidang-wong-palsu-kok)"
KR = "[Kompas, 4 Nov](https://megapolitan.kompas.com/read/2026/11/05/05135391/jokowi-akan-jadi-saksi-di-sidang-roy-suryo-dan-dokter-tifa-hari-ini)"
SS = "[Suara Surabaya](https://www.suarasurabaya.net/kelanakota/2026/sidang-ijazah-jokowi-ungkap-riwayat-pendidikan-sd-hingga-kuliah-ugm-di-hadapan-hakim/)"
NTV = "[NTVNews, kelulusan](https://www.ntvnews.id/news/01124749/jokowi-uraikan-proses-kelulusan-s1-ugm-saat-bersaksi-di-sidang-roy-suryo)"
BSI = "[BSI News mengutip detik](https://bsinews.id/jokowi-tegaskan-tanggal-kelulusan-wisuda)"
INL = "[Inilah](https://www.inilah.com/jokowi-seret-ribuan-skripsi-lain-demi-jawab-kejanggalan-times-new-roman)"
CN2 = "[CNN, debat](https://www.cnnindonesia.com/nasional/20261105142404-12-1423674/refly-harun-dan-jaksa-debat-panas-saat-jokowi-bersaksi-suara-meninggi)"
OW = "[OWRITE, debat](https://www.owrite.id/hukum/2026/11/05/refly-harun-dan-jaksa-baku-debat-di-sidang-ijazah-jokowi/)"
AFU = "[AFU.id](https://afu.id/hukum-kriminal/sidang-ijazah-jokowi-memanas-jaksa-dan-pengacara-roy-suryo-adu-mulut-hakim-terpaksa-skors-sidang)"
DT2 = "[detikNews, telunjuk](https://news.detik.com/berita/d-8739780/hakim-tegur-pengacara-roy-suryo-tunjuk-tunjuk-jaksa-saat-jokowi-bersaksi/amp)"
TIR2 = "[Tirto, ditegur](https://tirto.id/sebut-roy-suryo-bukan-peneliti-jokowi-ditegur-hakim-saat-sidang-hWYf)"
KT2 = "[Kompas TV, ditegur](https://www.kompas.tv/nasional/699907/jokowi-ditegur-hakim-saat-sebut-roy-suryo-bukan-peneliti-di-sidang-kasus-ijazah-bukan-komentar)"
MTV = "[Metro TV, adu mulut](https://www.metrotvnews.com/play/K5nC1DG6-memanas-sidang-ijazah-jokowi-diwarnai-adu-mulut)"
K2 = "[Kompas, sesi Tifa](https://megapolitan.kompas.com/read/2026/11/05/17563231/momen-jokowi-diambil-sumpah-sebelum-bersaksi-di-sidang-dokter-tifa)"
D20 = "[20detik, salaman](https://20.detik.com/detikupdate/20261105-261105065/video-ekspresi-roy-suryo-saat-salaman-dengan-jokowi-di-akhir-sidang)"

EP = {
    "EP02_FAKTA_RUANG_SIDANG": dict(
        title="JOKOWI AKHIRNYA TUNJUKKAN IJAZAH SD HINGGA S1! INI FAKTA DI RUANG SIDANG", kit="VINTAGEFORGE",
        idea="Berkas sidang digambar seperti ukiran tembaga di perkamen: empat lembar, peti barang bukti, jalan dari sekolah ke kampus, roda gigi tiga tanggal, tiang pemilu, kaca pembesar, papan penunjuk dua arah, dan buku dengan halaman putusan kosong.",
        rows=[("Jokowi meminta izin, hakim menyarankan setelah sidang, Jokowi memohon", f"CNN Indonesia, {BBC}", "Tinggi"), ("SMA dan S1 di tangan jaksa, SD dan SMP dibawa sendiri", f"{KR}, {MT}", "Tinggi"), ("SDN 111, SMPN 1, SMAN 6, Kehutanan UGM, tanpa jurusan, teknologi kayu", SS, "Tinggi sebagai keterangan saksi"), ("Mulai kuliah 1980", BBC, "Tinggi sebagai keterangan saksi"), ("Ujian 23 Okt, ijazah 5 Nov, wisuda 19 Nov 1985, 14 orang", f"{NTV}, {BSI}", "Tinggi sebagai keterangan saksi"), ("Judul skripsi diajukan tiga kali", INL, "Tinggi sebagai keterangan saksi"), ("Ditunjukkan ke KPU 2005 sampai 2019", BBC, "Tinggi sebagai keterangan saksi"), ("Roy: beda dengan 15 Des, bagian bawah, watermark, foto", WE, "Tinggi sebagai klaim Roy"), ("Refly: tanpa izin hakim", MT, "Tinggi sebagai klaim Refly"), ("Hakim mengizinkan", f"{BBC}, {K1}", "Sumber bertentangan, dua versi ditampilkan"), ("Roy menolak keterangan, hakim mencatat", DT1, "Tinggi")],
    ),
    "EP03_UJI_LABFOR": dict(
        title="JOKOWI TOLAK UJI IJAZAH ULANG DI LABFOR! APA ALASANNYA?", kit="DRAFTFORGE",
        idea="Pertanyaan digambar sebagai skema uji di cetak biru: lembar fisik melawan grid digital, mikroskop dan map terkunci, peta kompresi, balok bukti yang berpindah, dan kolom perintah hakim yang kosong.",
        rows=[("Pertanyaan bersyarat Refly dan kata 'apabila'", f"{TIR1}, {CNN1}", "Tinggi"), ("Keberatan: sudah diuji Labfor Polri, dokumen pribadi, ditenteng", f"{TIR1}, {CNN1}", "Tinggi"), ("Roy memakai Error Level Analysis, cara kerja ELA", ELA, "Sedang, satu sumber"), ("Jokowi tak meneliti kesamaan dengan file Dian Sandi", TIR1, "Tinggi"), ("Tak pernah menunjukkan ke terdakwa, yang menuduh yang membuktikan", CNN1, "Tinggi"), ("Bareskrim: identik dengan tiga pembanding", KB, "Tinggi"), ("Roy minta uji independen, rezim kepolisian berbeda", DT1, "Tinggi"), ("Masa diuji-uji", f"{MI}, {BS}", "Tinggi"), ("Refly menduga beda, 'baru perasaan', akan terus meminta", KTV, "Tinggi"), ("Hakim belum memerintahkan uji ulang", "Tidak ditemukan berita yang menyebut perintah itu", "Kesimpulan dari tiadanya laporan, per 5 Nov sekitar 18.35 WIB")],
    ),
    "EP04_SIDANG_MEMANAS": dict(
        title="SIDANG IJAZAH MEMANAS! HAKIM TEGUR JOKOWI, REFLY HARUN DEBAT DENGAN JAKSA", kit="BRUTALFORGE",
        idea="Benda yang berdebat, bukan orang: palu, gelembung bicara, meter suara, telunjuk dengan silang, jam sidang, dan dua sarung tangan yang bersalaman. Warna hanya berganti sekali per adegan, jadi tidak berkedip.",
        rows=[("Jokowi menyebut Roy bukan peneliti, hakim meminta menjawab saja", f"{TIR2}, {KT2}", "Tinggi. Pertanyaan pemicunya berbeda antarmedia, jadi naskah hanya menulis 'menjawab jaksa'"), ("Refly bertanya soal tindakan yang dianggap fitnah, hakim menilai sudah dijawab", f"{AFU}, {CN2}", "Tinggi"), ("Jaksa: lewat majelis. Refly: dikeluarkan saja. Jaksa: peringatkan", f"{CN2}, {OW}", "Tinggi"), ("Skors, suara jangan ditinggikan, sidang dibuka lagi", f"{CN2}, {AFU}", "Tinggi"), ("Debat soal pasal, teriakan, telunjuk, mau lanjut atau keluar, unsur jangan ditanyakan", DT2, "Tinggi, satu laporan rinci"), ("Pendukung bertahan sampai petang", MTV, "Sedang, satu sumber"), ("Sidang Roy pukul 09.00 sampai 16.30", K2, "Tinggi"), ("Roy menolak keterangan, hakim mencatat", DT1, "Tinggi"), ("Jokowi menyalami pengacara Roy dan Roy", D20, "Sedang, satu sumber video")],
    ),
}
for name, e in EP.items():
    d = Path(name)
    lines = json.loads((d / "script-lines.json").read_text(encoding="utf8"))
    tl = json.loads((d / "timeline.json").read_text(encoding="utf8"))
    start = {s["id"]: s["start"] for s in tl["scenes"]}
    rows = []
    for l in lines:
        m, s = divmod(int(start[l["id"]]), 60)
        rows.append(f"| {m}:{s:02d} | {TOK.sub(lambda x: x.group(1), l['text'])} |")
    spoken = sum(len(TOK.sub(lambda x: x.group(2), l["text"]).split()) for l in lines)
    (d / "SCRIPT.md").write_text(f"# Script: {e['title']}\n\nStatus: menunggu persetujuan. Suara belum dibuat. Timecode masih estimasi.\n\n| Waktu | Narasi |\n|---|---|\n" + "\n".join(rows) + f"\n\nJumlah kata terucap: {spoken}. Teks fonetik ada di `script-lines.json`.\n", encoding="utf8")
    (d / "CREATIVE_BRIEF.md").write_text(f"# Creative Brief\n\n**Judul:** {e['title']}\n\n**Style kit:** {e['kit']}\n\n**Ide visual:** {e['idea']}\n\n**Batas:** tanpa wajah asli, foto, cuplikan sidang, atau tiruan ijazah. Roy Suryo ditulis terdakwa, dan video menegaskan belum ada putusan.\n", encoding="utf8")
    t = "\n".join(f"| {a} | {b} | {c} |" for a, b, c in e["rows"])
    (d / "SOURCE_REGISTER.md").write_text(f"# Source Register: {e['title']}\n\nDibaca 5 November 2026, sampai sekitar 18.35 WIB. Sesi Dokter Tifa baru mulai sekitar 17.30 WIB dan belum tercakup.\n\n| Klaim | Sumber | Keyakinan |\n|---|---|---|\n{t}\n\nTeks artikel mentah ada di `../_research/`. ANTARA gagal dibaca skrip karena sertifikat TLS, jadi dilewati.\n", encoding="utf8")
    print(name, spoken)
