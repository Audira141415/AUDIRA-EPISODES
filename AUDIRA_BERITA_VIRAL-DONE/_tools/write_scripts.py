"""write_scripts.py: writes <EP>/docs/SCRIPT.md for the 4 chosen episodes and prints spoken word counts.

Markup: {display|spoken}. Captions use display, TTS uses spoken. Word count = spoken words.
Paths resolve from this file's location (rule 08).
"""
import io, re, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
SERIES = Path(__file__).resolve().parent.parent

STAGES = ["Hook (0–3 dtk)", "Context (4–15 dtk)", "Main Development (16–45 dtk)", "Explanation (46–70 dtk)", "Visual Payoff (71–85 dtk)", "Outro (86–90 dtk)"]

EPS = {
    "EP01_GIBRAN_NIAT_MUNDUR": ("SKETCHFORGE", [
        "Istana bilang Wapres Gibran ingin mundur. Gibran bilang tetap berjuang. Jadi, mana yang benar? Ini {AUDIRA|Audira}.",
        "Selasa pagi, {10 November|sepuluh November}, Gibran bertemu Presiden Prabowo sekitar {2,5 jam|dua setengah jam}. Sore harinya, Mensesneg Prasetyo Hadi mengumumkan: Gibran menyatakan niat untuk mengundurkan diri.",
        "Pemicunya putusan Mahkamah Agung. Akhir Oktober, {MA|Mahkamah Agung} membatalkan surat penyetaraan ijazah {SMA|esema} Gibran, yang dipakai untuk mendaftar Pilpres {2024|dua ribu dua puluh empat}. Menurut pertimbangannya, dokumen luar negeri Gibran hanya menerangkan kehadiran, bukan kelulusan. Putusan ini menguatkan pertimbangan Mahkamah Konstitusi.",
        "Tapi niat belum berarti mundur. Istana menyebut Presiden tidak menolak, hanya memberi saran. Gibran sendiri tidak mengucapkan kata mundur. Ia bilang akan tetap fight di {PTUN|Peteun}, membawa dokumen dari {SD|es de} sampai {S1|es satu}. Kuasa hukumnya malah membantah ada rencana mundur. Di {DPR|de pe er}, usulan hak menyatakan pendapat sudah di meja pimpinan.",
        "Kalau kursi wapres benar-benar kosong, aturannya ada di Pasal {8|delapan} {UUD 1945|Undang-Undang Dasar sembilan belas empat puluh lima}. Presiden mengusulkan dua nama, lalu {MPR|Majelis Permusyawaratan Rakyat} memilih paling lambat {60|enam puluh} hari. Wapres pertama yang pernah mundur adalah Mohammad Hatta, tahun {1956|sembilan belas lima puluh enam}, lewat sepucuk surat.",
        "Jadi hari ini statusnya masih niat, belum surat. Kami pantau terus di {AUDIRA|Audira}. Menurutmu: mundur, atau bertahan?",
    ]),
    "EP02_19_PAHLAWAN_NASIONAL": ("MARBLEMUSEUM", [
        "Ada lelucon yang sering dikaitkan dengan Gus Dur: polisi jujur cuma tiga. Polisi tidur, patung polisi, dan Hoegeng. Hari ini, yang ketiga resmi jadi Pahlawan Nasional.",
        "Selasa, {10 November|sepuluh November}, di Istana Negara, Presiden Prabowo menganugerahkan gelar Pahlawan Nasional kepada {19|sembilan belas} tokoh dari {12|dua belas} provinsi, lewat Keppres nomor {93|sembilan puluh tiga}. Menurut Menteri Kebudayaan Fadli Zon, jumlah ini termasuk pemecah rekor.",
        "Siapa saja? Ada Hoegeng, Kapolri {1968–1971|sembilan belas enam puluh delapan sampai tujuh puluh satu}, yang dikenal menolak suap. Ali Sadikin, Gubernur Jakarta sebelas tahun. Mohamad Roem, diplomat perundingan Roem-Roijen. Ali Sastroamidjojo, perdana menteri saat Konferensi Asia Afrika. Sastrawan Sutan Takdir Alisjahbana. Sampai Kiai Wasyid, pemimpin Geger Cilegon {1888|delapan belas delapan puluh delapan}.",
        "Gelar ini tidak turun begitu saja. Usulan dimulai dari tim peneliti di kabupaten atau kota, naik ke provinsi, lalu ke Kementerian Sosial, dikaji Dewan Gelar, dan baru diputuskan Presiden.",
        "Satu nama memancing perdebatan: Margono Djojohadikusumo, pendiri {BNI|be en i}, sekaligus kakek Presiden Prabowo. Pemerintah menyebut ia memenuhi syarat dan melewati mekanisme. Sejumlah sejarawan sempat mengkritiknya sebagai konflik kepentingan. Sementara cucu Hoegeng bercerita: tamu di rumah sang jenderal wajib menulis buku mutasi. Jam datang, jam pulang.",
        "Sembilan belas nama, sembilan belas cerita. Tokoh mana yang paling kamu kenal? Tulis di komentar, dan ikuti {AUDIRA|Audira}.",
    ]),
    "EP03_SERANGAN_SIBER_BANK": ("CYBERFORGE", [
        "Dua juta serangan siber ke Indonesia dalam sehari. Kedengarannya horor. Tapi angka ini bukan jumlah bank yang jebol.",
        "Sejak Senin, tangkapan layar peta ancaman FortiGuard ramai dibagikan. Bank, keuangan, dan asuransi jadi sasaran nomor satu: lebih dari {1,2 juta|satu koma dua juta} upaya dalam {24 jam|dua puluh empat jam}.",
        "Lalu kenapa angkanya beda di tiap berita? {1,2 juta|Satu koma dua juta} itu khusus sektor keuangan, per Senin malam. {2,1 juta|Dua koma satu juta} adalah total seluruh Indonesia, per Selasa. {7,3 juta|Tujuh koma tiga juta} itu hitungan sepekan. Semuanya benar. Hanya periode dan cakupannya berbeda, dan dasbornya berubah setiap saat.",
        "Yang dicatat dasbor adalah upaya: lalu lintas mencurigakan yang tertangkap perangkat keamanan. Badan Siber dan Sandi Negara menegaskan, itu bukan jumlah pembobolan. Pakar Vaksincom, Alfons Tanujaya, menyebutnya singkat: upaya yang diblokir, bukan bank yang dibobol. Menurutnya, data setahun terakhir pun tidak menunjukkan lonjakan berarti.",
        "Meski begitu, regulator tidak santai. {OJK|o je ka} berkoordinasi dengan tim {IT|aiti} bank sejak Jumat, dan meminta transaksi tidak wajar ditunda untuk verifikasi. {BSSN|be es es en} menyiagakan {151|seratus lima puluh satu} tim tanggap insiden di perbankan.",
        "Bagian kita sederhana: jangan bagikan kode {OTP|o te pe}, dan jangan pasang aplikasi dari tautan asing. Simpan video ini, dan ikuti {AUDIRA|Audira}.",
    ]),
    "EP05_GTA_6_RILIS": ("CIRCUITFORGE", [
        "{212 gigabyte|Dua ratus dua belas gigabait}. Itu ukuran satu game. Dan sejak {10 November|sepuluh November}, pemain sudah boleh mengunduhnya.",
        "{GTA 6|Ji Ti Ei enam} dijadwalkan rilis Kamis, {19 November|sembilan belas November}, untuk {PS5|Pe Es lima} dan Xbox Series. Rockstar membuka pre-load sembilan hari lebih awal. File sudah bisa diunduh, tapi game baru bisa dimainkan saat hari rilis tiba.",
        "Kenapa harus diunduh duluan? {212 gigabyte|Dua ratus dua belas gigabait} itu lebih dari separuh ruang yang bisa dipakai di Xbox Series S. Kalau jutaan pemain mengunduh di hari yang sama, jaringan bisa tersendat. Pre-load membagi beban itu.",
        "Antusiasmenya juga terlihat dari uang. Firma riset Sensor Tower memperkirakan {7,71 juta|tujuh koma tujuh juta} pre-order digital, sekitar {US$751 juta|tujuh ratus lima puluh satu juta dolar}, lebih dari tiga belas triliun rupiah, sebelum game ini keluar. Tujuh puluh empat persen di PlayStation. Ingat, ini estimasi, bukan angka penjualan resmi. Tapi Take-Two, induk Rockstar, sendiri mengaku pesanan awalnya jauh di atas perkiraan internal mereka.",
        "Di PlayStation Store Indonesia, edisi standarnya {Rp1,19 juta|satu koma sembilan belas juta rupiah}. Versi fisiknya pun tanpa cakram: isinya kode unduhan. Dan versi {PC|pe ce}? Belum diumumkan.",
        "Kamu sudah siapkan ruang {212 gigabyte|dua ratus dua belas gigabait}? Tulis konsolmu di komentar, dan ikuti {AUDIRA|Audira} untuk berita game berikutnya.",
    ]),
}

MARK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
spoken = lambda s: MARK.sub(lambda m: m.group(2), s)
display = lambda s: MARK.sub(lambda m: m.group(1), s)
words = lambda s: len(re.findall(r"[0-9A-Za-zÀ-ÿ]+(?:[-'][0-9A-Za-zÀ-ÿ]+)*", s))

report = []
for ep, (style, lines) in EPS.items():
    total = sum(words(spoken(l)) for l in lines)
    lo, hi = total / 150 * 60, total / 135 * 60
    md = [f"# SCRIPT — {ep}", "", f"- Style: {style} · format short 9:16 · VO Cartesia (Galang, id)",
          f"- Kata terucap: **{total}** → estimasi **{lo:.0f}–{hi:.0f} dtk** (150–135 WPM)",
          "- Markup `{tampil|ucap}`: teks kiri untuk caption, teks kanan untuk TTS (ejaan fonetik).",
          "- Status: draf, menunggu persetujuan pengguna. Fakta hanya dari baris HIGH di research/RESEARCH_REPORT.md.", ""]
    for st, l in zip(STAGES, lines):
        md += [f"## {st} · {words(spoken(l))} kata", "", display(l), "", f"<sub>TTS: {spoken(l)}</sub>", ""]
    md += ["## Markup lengkap (untuk write-lines)", ""] + [f"{i+1}. {l}" for i, l in enumerate(lines)] + [""]
    out = SERIES / ep / "docs" / "SCRIPT.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(md), encoding="utf8")
    report.append((ep, total, lo, hi))
for ep, t, lo, hi in report:
    print(f"{ep}: {t} kata ≈ {lo:.0f}–{hi:.0f} dtk")
