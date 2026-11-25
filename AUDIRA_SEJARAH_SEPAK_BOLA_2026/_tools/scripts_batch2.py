# Writes docs/SCRIPT.md for EP06-10 (batch 2) and prints word counts.
# Run from the series folder: python -X utf8 _tools/scripts_batch2.py
# Facts: HIGH rows of each episode's research/RESEARCH_REPORT.md (see its "JANGAN diklaim" list).
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TC = ["Hook (0–3 dtk)", "Context (4–15 dtk)", "Main Development (16–45 dtk)",
      "Explanation (46–70 dtk)", "Visual Payoff (71–85 dtk)", "Outro (86–90 dtk)"]
STATUS = "disetujui pengguna 2026-11-12 (Setuju semua)"

EPS = {
"EP06_LAHIRNYA_SEPAK_BOLA_1863": ("Lahirnya Sepak Bola Modern 1863", "VINTAGEFORGE", [
"Tahun 1863, menendang tulang kering lawan masih dianggap bagian dari permainan.",
"Waktu itu, tiap sekolah di Inggris punya aturan sendiri. Di Rugby, bola boleh dibawa lari. Di Eton, tangan hampir dilarang. Begitu alumninya bertemu, mereka bingung harus main yang mana.",
"Dua puluh enam Oktober 1863, wakil dua belas klub dan sekolah London berkumpul di Freemasons' Tavern. Penggagasnya Ebenezer Morley, kapten klub Barnes. Malam itu lahir The Football Association. Lalu debat panjang dimulai: bolehkah menendang kaki lawan, dan bolehkah bola dibawa lari? Kubu tendang kaki sempat unggul. Morley membalas dengan aturan Cambridge yang melarang keduanya. Akhirnya, dua-duanya resmi dilarang. Blackheath keluar dari rapat, dan tahun 1871 kubu rugby mendirikan federasi sendiri.",
"Hasilnya tiga belas hukum, dan isinya aneh. Gawang tanpa mistar, jadi bola setinggi apa pun tetap gol. Tim bertukar sisi setiap kali gol. Bola boleh ditangkap. Tidak ada kiper, tidak ada wasit.",
"Tapi dua angka dari malam itu masih hidup. Lebar gawang delapan yard, tujuh koma tiga dua meter. Jarak lawan saat sepak mula, sepuluh yard, sembilan koma satu lima meter. Tiga belas baris itu kini jadi tujuh belas hukum yang dimainkan di seluruh dunia.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: Piala Dunia pertama, Uruguay 1930."]),
"EP07_PIALA_DUNIA_PERTAMA_1930": ("Piala Dunia Pertama, Uruguay 1930", "PAPERWORLD", [
"Final Piala Dunia pertama dimainkan dengan dua bola berbeda.",
"Tahun 1930, Uruguay jadi tuan rumah. Alasannya dua: Uruguay juara sepak bola Olimpiade 1924 dan 1928, dan tahun itu negaranya merayakan seratus tahun konstitusi pertama.",
"Masalahnya, dua bulan sebelum turnamen, belum satu pun tim Eropa mendaftar. Perjalanan laut ke Montevideo makan waktu sekitar dua minggu. Akhirnya hanya empat tim Eropa yang datang. Prancis, Belgia, dan Rumania naik kapal yang sama, Conte Verde, bersama presiden FIFA Jules Rimet dan trofinya. Totalnya cuma tiga belas tim, tanpa babak kualifikasi.",
"Tiga belas Juli 1930, Lucien Laurent dari Prancis mencetak gol pertama Piala Dunia, menit sembilan belas melawan Meksiko. Stadion utamanya, Centenario, telat selesai karena hujan, dan baru dipakai lima hari kemudian, tepat seratus tahun konstitusi.",
"Final, tiga puluh Juli: Uruguay lawan Argentina. Kedua tim ngotot memakai bola sendiri. Jalan tengahnya, babak pertama pakai bola Argentina, dan Argentina unggul dua-satu. Babak kedua pakai bola Uruguay, dan Uruguay membalik skor jadi empat-dua. Juara dunia pertama, dan besoknya seluruh Uruguay libur nasional.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: Maracanazo, kekalahan yang mengubah warna baju Brasil."]),
"EP08_MARACANAZO_1950": ("Maracanazo 1950", "FILMNOIR", [
"Piala Dunia 1950 tidak punya final. Tapi satu laga membuat hampir dua ratus ribu orang terdiam.",
"Juaranya ditentukan grup empat tim. Laga terakhir, enam belas Juli 1950 di Maracanã: Brasil empat poin, Uruguay tiga. Brasil cukup seri untuk juara. Mereka baru saja menghajar Swedia tujuh-satu dan Spanyol enam-satu.",
"Tiket resmi terjual seratus tujuh puluh tiga ribu, dan penonton yang hadir diperkirakan hampir dua ratus ribu orang. Babak pertama, nol-nol. Menit empat puluh tujuh, Friaça membawa Brasil unggul. Menit enam puluh enam, Schiaffino menyamakan. Satu-satu, masih cukup untuk Brasil. Lalu menit tujuh puluh sembilan, Ghiggia menembak rendah ke tiang dekat. Kiper Barbosa menduga umpan silang. Gol.",
"Uruguay menang dua-satu dan juara dunia untuk kedua kalinya. Stadion raksasa itu hening. Ghiggia pernah berkata, hanya tiga orang yang pernah membungkam Maracanã: Frank Sinatra, Paus, dan dirinya.",
"Lukanya panjang. Barbosa jadi kambing hitam seumur hidup. Hukuman maksimal di Brasil tiga puluh tahun, katanya, tapi ia dihukum lima puluh tahun. Baju putih Brasil dicap tidak patriotik. Tahun 1953 sebuah koran menggelar lomba desain, dan pemenangnya remaja sembilan belas tahun, pendukung Uruguay. Dari kekalahan itulah lahir kaus kuning Brasil.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: gol Tangan Tuhan, Maradona 1986."]),
"EP09_GOL_TANGAN_TUHAN_1986": ("Gol Tangan Tuhan 1986", "COMICFORGE", [
"Dua gol. Empat menit. Satu curang, satu terindah sepanjang sejarah.",
"Dua puluh dua Juni 1986, perempat final Piala Dunia di Stadion Azteca, Meksiko. Argentina lawan Inggris, empat tahun setelah kedua negara berperang memperebutkan Kepulauan Falklands, atau Malvinas, perang yang dimenangkan Inggris.",
"Babak pertama nol-nol. Menit lima puluh satu, pemain Inggris salah menyapu bola, dan bola melambung ke arah kiper Peter Shilton. Maradona, yang jauh lebih pendek, melompat dan menyentuh bola dengan kepalan tangan kiri. Gol. Wasit Ali Bin Nasser dari Tunisia mengesahkannya, dan hakim garisnya diam. Belum ada tayangan ulang untuk wasit, apalagi VAR.",
"Empat menit kemudian, menit lima puluh lima, Maradona menerima bola di separuh lapangan sendiri. Sekitar sepuluh detik kemudian, ia sudah melewati lima pemain Inggris, termasuk Shilton, dan mencetak gol. Lineker sempat membalas di menit delapan puluh satu. Argentina menang dua-satu.",
"Usai laga, Maradona bilang gol pertama dicetak sedikit dengan kepalanya, dan sedikit dengan tangan Tuhan. Baru tahun 2005 ia mengaku memakai tangan. Gol keduanya kelak menang polling online FIFA tahun 2002 sebagai Gol Abad Ini. Dan seminggu kemudian, Argentina juara dunia, menang tiga-dua atas Jerman Barat.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: malam Brasil dihajar tujuh-satu."]),
"EP10_JERMAN_7_1_BRASIL": ("Jerman 7–1 Brasil 2014", "CHAINREACTION", [
"Empat gol. Enam menit. Di kandang sendiri.",
"Semifinal Piala Dunia, delapan Juli 2014, Belo Horizonte. Tuan rumah Brasil tampil tanpa Neymar yang cedera tulang belakang, dan tanpa kapten Thiago Silva yang terkena akumulasi kartu kuning.",
"Menit sebelas, Thomas Müller membuka skor. Menit dua puluh tiga, Miroslav Klose: gol Piala Dunia keenam belas, rekor sepanjang masa. Menit dua puluh empat dan dua puluh enam, Toni Kroos dua kali, hanya berselang kurang dari tujuh puluh detik. Menit dua puluh sembilan, Sami Khedira. Lima-nol, belum setengah jam. Empat gol dalam enam menit, tercepat dalam sejarah Piala Dunia.",
"Babak kedua, pemain pengganti André Schürrle menambah dua gol. Oscar membalas di menit sembilan puluh. Tujuh-satu. Anehnya, Brasil justru lebih banyak menguasai bola, lima puluh dua persen, dan menembak lebih sering, delapan belas lawan empat belas.",
"Kekalahan itu memutus enam puluh dua laga kandang resmi Brasil tanpa kalah sejak 1975. Orang menyebutnya Mineirazo, luka baru setelah Maracanazo. Lima hari kemudian, Jerman juara dunia, satu-nol atas Argentina, lewat gol Mario Götze di menit seratus tiga belas.",
"Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: sepak bola kuno, cuju dari Tiongkok."]),
}

_A = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"]

def _say(x):
    if x < 12: return _A[x]
    if x < 20: return _A[x - 10] + " belas"
    if x < 100: return _A[x // 10] + " puluh " + _say(x % 10)
    if x < 200: return "seratus " + _say(x - 100)
    if x < 1000: return _A[x // 100] + " ratus " + _say(x % 100)
    if x < 2000: return "seribu " + _say(x - 1000)
    return _A[x // 1000] + " ribu " + _say(x % 1000)

def words(t):
    # spoken words: a year like 1966 counts as the words the narrator says
    return sum(len(_say(int(w)).split()) if w.isdigit() else 1 for w in re.findall(r"[\wÀ-ÿ'’]+", t))

if __name__ == "__main__":
    for folder, (title, style, parts) in EPS.items():
        n = sum(words(p) for p in parts)
        lo, hi = n / 150 * 60, n / 135 * 60
        body = [f"# Naskah — {title}", "",
                f"Seri: Sejarah Sepak Bola (AUDIRA) · Style: {style} · Format: short 9:16 · Fakta dari `research/RESEARCH_REPORT.md` (HIGH).",
                f"Jumlah kata terucap (tahun dihitung sebagai kata yang dibaca): **{n}** → estimasi **{lo:.0f}–{hi:.0f} dtk** (135–150 WPM). Status: {STATUS}.", ""]
        for tc, p in zip(TC, parts):
            body += [f"### {tc}", p, ""]
        body += ["---",
                 "Catatan VO: tahun dibaca normal; nama asing (Friaça, Ghiggia, Schiaffino, Müller, Schürrle, Götze), VAR dan AUDIRA dieja fonetik di `docs/script-lines.json` saat VO dibuat. Naskah ini tetap ejaan normal untuk subtitle."]
        d = ROOT / folder / "docs"
        d.mkdir(exist_ok=True)
        (d / "SCRIPT.md").write_text("\n".join(body) + "\n", encoding="utf-8")
        print(f"{folder}: {n} kata, {lo:.0f}-{hi:.0f} dtk")
