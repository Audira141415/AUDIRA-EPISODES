"""Write docs/script-lines.json for each episode from the approved scripts (2026-11-10).
Markup {display|spoken}: captions show `display`, Cartesia reads `spoken` (numbers in words,
acronyms spelled the Indonesian way, "Audira" so the brand is not read letter by letter).
Run: python AUDIRA_ASAP_KARHUTLA_ISPA_2026/_tools/write-lines.py (from F:/AUDIRA-VIDEO-MOTION)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]

EPS = {
    "EP01_MIMIKA_81_RIBU_ISPA": [
        "Lebih dari {81|delapan puluh satu} ribu kasus {ISPA|Ispa} di Mimika. Tapi Dinas Kesehatannya sendiri bilang: ini bukan cuma soal asap.",
        "Sejak akhir September, Timika berselimut kabut asap. Apinya bukan di sini, tapi di Papua Selatan, terutama Merauke. Pesawat berputar-putar tak bisa mendarat, dan sekolah belajar dari rumah.",
        "Angka {ISPA-nya|Ispa-nya} memang besar. Akhir Agustus, hampir {64|enam puluh empat} ribu kasus. Akhir Oktober, lebih dari {81|delapan puluh satu} ribu, dihitung sejak Januari. Tapi lihat lagi: akhir Agustus, asap belum datang. Dan tahun lalu, di periode yang sama, angkanya sudah hampir {62|enam puluh dua} ribu.",
        "Kata Dinkes Mimika, {ISPA|Ispa} memang selalu masuk sepuluh besar penyakit di sana. Kebanyakan keluhannya batuk dan flu biasa, ditambah debu musim kemarau. Asap datang belakangan, lalu memperberat yang sudah sakit: asma, {TBC,|te be ce,} pneumonia. Jadi ini jumlah kasus, bukan jumlah orang, dan tidak semuanya karena asap.",
        "Bupati Mimika, Johannes Rettob, meminta pusat memadamkan sumber api di Papua Selatan, dan memperhatikan Papua setara Kalimantan. Awal November, udara Timika membaik. Tapi titik panas di Papua Selatan kembali naik. Selama apinya belum padam, asap bisa datang lagi.",
        "Pakai masker saat berasap, dan segera ke puskesmas bila sesak. Ini {AUDIRA.|Audira.}",
    ],
    "EP02_PAPUA_SELATAN_DIKEPUNG_API": [
        "{6.700|Enam ribu tujuh ratus} titik panas dalam satu hari. Bukan di Kalimantan, tapi di Papua Selatan.",
        "Itu catatan {BMKG|be em ka ge} pada {11|sebelas} Oktober. Kemarau panjang dan El Nino yang sangat kuat membuat Merauke seratus hari tanpa hujan. Api muncul di sepuluh distrik. Dulu, rawa menjadi sekat api alami. Tahun ini, rawanya kering.",
        "Yonas, warga Distrik Ilwayab, bilang kepada {BBC:|bi bi si:} masyarakat sampai setengah mati. Asapnya menyeberang laut sampai ke Maluku. Dinas Kesehatan mencatat {ISPA|Ispa} naik di empat kabupaten. Di satu puskesmas di Merauke, kasusnya naik sekitar {30|tiga puluh} persen dari Juli ke September, karena kemarau, debu, dan asap.",
        "Lalu kenapa luas kebakarannya simpang siur, dari {63|enam puluh tiga} sampai {25|dua puluh lima} ribu hektare? Karena yang diukur berbeda. {63|Enam puluh tiga} hektare adalah laporan awal dari sembilan lokasi. {25|Dua puluh lima} ribu hektare adalah total sepanjang kemarau, versi Pemkab Merauke. Dan titik panas belum tentu api: itu panas permukaan yang ditangkap satelit.",
        "{31|Tiga puluh satu} Oktober, Kepala {BNPB|be en pe be} dan Kepala {BMKG|be em ka ge} terbang di atas Merauke. Asap masih terlihat, dan titik api terbanyak di wilayah konsesi perusahaan. Penyebab pastinya belum ditetapkan. Lalu {6|enam} November, titik panas naik lagi {66|enam puluh enam} persen.",
        "Api belum padam, dan musim hujan membawa ancaman baru: banjir. Ikuti info {BMKG.|be em ka ge.} Ini {AUDIRA.|Audira.}",
    ],
    "EP03_PAPUA_TENGAH_POTENSI_TERTINGGI": [
        "{3,58|Tiga koma lima delapan} juta orang berpotensi kena {ISPA,|Ispa,} dan Papua Tengah paling tinggi. Tapi angka viral ini bukan hitungan pasien.",
        "Angkanya berasal dari laporan lembaga riset {CELIOS,|Selios,} {2|dua} November lalu, bukan dari Kemenkes atau {BNPB.|be en pe be.} Pembuat grafiknya pun menulis: ini estimasi, bukan kasus terkonfirmasi.",
        "Mari bedah rumusnya. Penduduk Papua Tengah, hampir {1,4|satu koma empat} juta. Dikali angka {ISPA|Ispa} dasarnya, hampir {19|sembilan belas} persen, menurut {CELIOS|Selios} dari survei Kemenkes {2023,|dua ribu dua puluh tiga,} tertinggi di negeri ini. Dikali lagi {1,78.|satu koma tujuh delapan.} Hasilnya: {463|empat ratus enam puluh tiga} ribu orang berpotensi. Pengali itu berasal dari lonjakan kasus sepekan di Kalimantan Tengah, lalu dipakai sama rata untuk semua provinsi.",
        "Akibatnya, peringkat ini lebih ditentukan oleh angka {ISPA|Ispa} lama, bukan oleh luas api. Papua Selatan terbakar paling luas, tapi potensinya hanya {37|tiga puluh tujuh} ribu. Kalau Papua Tengah memakai rata-rata nasional, hasilnya sekitar {54|lima puluh empat} ribu saja. Itu hitungan ilustrasi kami, bukan angka {CELIOS.|Selios.}",
        "Tapi asapnya nyata. El Nino sangat kuat membuat Papua yang biasanya basah mengering. {NASA|Nasa} mencatat emisi kebakaran Papua tahun ini tertinggi ketiga dalam hampir tiga dekade. Asap dari selatan terbawa ke Timika dan Wamena. Di Nabire saja, tercatat lebih dari {3|tiga} ribu kasus {ISPA.|Ispa.}",
        "Papua butuh data kasus nyata per kabupaten. Baca angkanya, bukan cuma judulnya. Ini {AUDIRA.|Audira.}",
    ],
    "EP04_BALITA_425_RIBU_ISPA": [
        "{425|Empat ratus dua puluh lima} ribu kasus {ISPA|Ispa} di wilayah karhutla. Hampir satu dari lima menimpa balita.",
        "Ini data Kementerian Kesehatan, dihitung sejak Agustus, di tujuh provinsi: Riau, Jambi, Sumatera Selatan, dan empat provinsi di Kalimantan. Satuannya kasus, bukan jumlah orang. Pada balita: hampir {96|sembilan puluh enam} ribu kasus.",
        "Pertengahan Oktober angkanya {283|dua ratus delapan puluh tiga} ribu. Tiga minggu kemudian, {425|empat ratus dua puluh lima} ribu. Pemerintah bilang kasus harian sudah turun, dari sepuluh ribuan menjadi sekitar tiga ribu. Itu benar. Tapi ribuan kasus baru tetap bertambah setiap hari. {BBC|Bi bi si} juga melaporkan anak-anak yang meninggal di tengah kepungan asap. Dokternya belum bisa memastikan asap sebagai penyebab.",
        "Kenapa balita paling rentan? Partikel asap {PM2.5|pe em dua koma lima} lebih dari dua puluh kali lebih kecil dari sehelai rambut. Ia masuk sampai ujung saluran napas. Balita bernapas lebih cepat, menghirup lebih banyak udara untuk berat badannya, dan paru-parunya masih tumbuh.",
        "Cara melindunginya. Orang dewasa pakai masker {N95|en sembilan puluh lima} yang rapat; masker kain tidak menyaring asap halus. Balita di bawah dua tahun tidak dianjurkan bermasker, jadi siapkan satu ruang bersih: jendela tertutup, penyaring udara, {AC|a ce} sirkulasi dalam. Bila anak sesak atau sulit menyusu, segera bawa ke fasilitas kesehatan.",
        "Kasusnya turun dari puncak, tapi belum selesai. Cek {ISPU|Ispu} daerahmu. Ini {AUDIRA.|Audira.}",
    ],
    "EP05_ASAP_LINTAS_NEGARA": [
        "{56|Lima puluh enam} hari Pekanbaru tertutup asap. Padahal sumber apinya bukan di Riau.",
        "{BMKG|Be em ka ge} menyebut asapnya kiriman dari Sumatera Selatan, Jambi, dan Bengkulu, terbawa angin ke barat laut. Pada {18|delapan belas} Oktober pagi, Riau nol titik panas, tapi Pekanbaru tetap berasap. Dinkes Pekanbaru mencatat hampir {14|empat belas} ribu warga kena {ISPA|Ispa} selama {56|lima puluh enam} hari itu.",
        "Asapnya terus bergerak. Batam sempat mencatat {ISPU|Ispu} {240,|dua ratus empat puluh,} sangat tidak sehat. Lalu asap dari Sumatra dan Kalimantan menyeberang ke Malaysia. Sekolah di Johor ditutup, dan kasus {ISPA|Ispa} di sana naik sekitar sepuluh persen dalam sepekan. Kepada {BBC,|bi bi si,} Nor Amira, warga Malaysia pengidap asma, bercerita tetap sulit bernapas, meski di kamar berpenyaring udara.",
        "Indonesia terikat perjanjian {ASEAN|Asean} soal asap lintas batas, yang diratifikasi tahun {2014.|dua ribu empat belas.} Malaysia membawa masalah ini ke pertemuan menteri luar negeri {ASEAN,|Asean,} dan Kemlu {RI|er i} menyatakan Indonesia berkomitmen menyelesaikannya. Di tengah itu, pernyataan pejabat bahwa Indonesia juga \"mengirim oksigen\" justru memicu sindiran warganet Malaysia.",
        "Di dalam negeri, Bareskrim menetapkan {20|dua puluh} korporasi tersangka. Empat di antaranya bermodal asing, dari Singapura, Malaysia, dan Korea Selatan. Nama lengkapnya belum dibuka. Walhi mengingatkan: isu asing jangan jadi alasan pemerintah lepas tangan.",
        "Asap tidak kenal batas negara. Pantau {ISPU|Ispu} dan pakai masker. Ini {AUDIRA.|Audira.}",
    ],
}

for ep, texts in EPS.items():
    out = [{"id": i, "text": t} for i, t in zip(IDS, texts)]
    p = ROOT / ep / "docs" / "script-lines.json"
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, "lines", len(out))
