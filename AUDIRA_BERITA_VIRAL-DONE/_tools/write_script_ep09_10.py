"""write_script_ep09_10.py: writes docs/SCRIPT.md + docs/script-lines.json for EP09 and EP10 and prints word counts.
Same markup as write_scripts.py ({display|spoken}; captions use display, TTS uses spoken).
Facts only from each episode's research/SOURCE_REGISTER.md (verified 2026-11-12).
Run: python _tools/write_script_ep09_10.py [09|10]"""
import io, json, re, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
SERIES = Path(__file__).resolve().parent.parent
STAGES = ["Hook (0–3 dtk)", "Context (4–15 dtk)", "Main Development (16–45 dtk)", "Explanation (46–70 dtk)", "Visual Payoff (71–85 dtk)", "Outro (86–90 dtk)"]
IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]
STATUS = "disetujui pengguna 2026-11-12 (\"Acc semua\")"

EPS = {
 "09": ("EP09_HAK_PENSIUN_WAPRES_MUNDUR", "TOYDIORAMA", [
  "Kalau wakil presiden mundur atas kemauan sendiri, apakah pensiun dan fasilitas negaranya hilang? Ini {AUDIRA|Audira}.",
  "Kamis, {12 November|dua belas November}, Wapres Gibran mendatangi {MPR|Majelis Permusyawaratan Rakyat} untuk menyerahkan surat pengunduran diri. Menurut pakar, surat itu baru sah setelah dibacakan di sidang {MPR|Majelis}. Lalu, apa yang tetap ia terima?",
  "Aturannya {Undang-Undang Nomor 7 Tahun 1978|Undang-Undang Nomor tujuh Tahun sembilan belas tujuh puluh delapan}. Pasal {6|enam}: wakil presiden yang berhenti dengan hormat berhak atas pensiun, besarnya seratus persen gaji pokok terakhir. Gaji pokok wapres empat kali gaji pokok tertinggi pejabat negara, yaitu {Rp20,16 juta|dua puluh koma enam belas juta rupiah} per bulan. Pensiun ini dibayar sampai ia wafat.",
  "Pasal {7|tujuh} menanggung biaya kesehatan dirinya dan keluarga, juga tagihan air, listrik, dan telepon. Pasal {8|delapan} memberi sebuah rumah yang layak beserta perlengkapannya, dan kendaraan milik negara dengan pengemudinya. Menurut {Perpres 52 Tahun 2014|Peraturan Presiden lima puluh dua Tahun dua ribu empat belas}, rumah itu hanya diberikan satu kali, dan pajaknya ditanggung negara.",
  "Pengamanan pun tetap. {PP 59 Tahun 2013|Peraturan Pemerintah lima puluh sembilan Tahun dua ribu tiga belas} memberi kawalan Paspampres seumur hidup bagi mantan wapres dan pasangannya. Kata kuncinya hanya satu: berhenti dengan hormat. Undang-undang tidak merinci artinya, tapi Mahfud {MD|Emde} menilai hak orang yang mundur dan yang dimakzulkan sama saja.",
  "Jadi, mundur tidak otomatis menghapus hak. Menurutmu, aturan ini adil atau terlalu mahal? Ikuti terus di {AUDIRA|Audira}.",
 ]),
 "10": ("EP10_SEJARAH_DUNIA_WAPRES_MUNDUR", "COLLAGE", [
  "Wakil presiden yang mundur saat menjabat itu langka. Dua yang tercatat: Jakarta {1956|sembilan belas lima puluh enam} dan Washington {1973|sembilan belas tujuh puluh tiga}. Ini {AUDIRA|Audira}.",
  "Kamis ini, Wapres Gibran menyerahkan surat pengunduran diri ke {MPR|Majelis Permusyawaratan Rakyat}. Indonesia dan Amerika pernah melewati momen yang sama. Bagaimana akhir ceritanya?",
  "{20 Juli 1956|Dua puluh Juli sembilan belas lima puluh enam}, Bung Hatta menyurati Ketua {DPR|Dewan Perwakilan Rakyat}, Sartono. Alasannya: {DPR|Dewan} dan Konstituante hasil pemilu sudah terbentuk, dan jalannya kian berbeda dengan Soekarno. Parlemen menyetujui, dan pada {1 Desember 1956|satu Desember sembilan belas lima puluh enam} ia resmi berhenti. Kursi wapres lalu kosong lebih dari enam belas tahun.",
  "Di Amerika, {10 Oktober 1973|sepuluh Oktober sembilan belas tujuh puluh tiga}, Wapres {Spiro Agnew|Spiro Egnyu} mundur. Ia tidak membantah dakwaan penggelapan pajak, di tengah penyelidikan suap. Untuk pertama kalinya Amandemen {ke-25|kedua puluh lima} dipakai: Presiden Nixon menunjuk Gerald Ford, lalu Senat dan {DPR|Dewan Perwakilan} Amerika menyetujuinya, {92 lawan 3|sembilan puluh dua lawan tiga} dan {387 lawan 35|tiga ratus delapan puluh tujuh lawan tiga puluh lima}.",
  "Dua kisah ini berbeda. Hatta mundur karena prinsip, Agnew karena skandal. Amerika punya wapres baru dalam delapan minggu, Indonesia menunggu enam belas tahun. Kini Undang-Undang Dasar memberi batas: kursi yang kosong wajib diisi {MPR|Majelis} paling lambat enam puluh hari.",
  "Sejarah mencatat bukan hanya siapa yang pergi, tapi juga alasannya. Ikuti terus kisahnya di {AUDIRA|Audira}.",
 ]),
}

GROUP = re.compile(r"\{([^|}]*)\|([^}]*)\}")
PUNCT = re.compile(r"\{([^|}]*)\|([^}]*)\}([.,:;?!]+)")
disp = lambda t: GROUP.sub(lambda m: m.group(1), t)
spok = lambda t: GROUP.sub(lambda m: m.group(2), t)
count = lambda t: len(spok(t).split())

for key in (sys.argv[1:] or list(EPS)):
    EP, STYLE, TEXTS = EPS[key]
    n = sum(count(t) for t in TEXTS)
    lo, hi = round(n / 150 * 60), round(n / 135 * 60)
    out = [f"# SCRIPT — {EP}", "", f"- Style: {STYLE} · format short 9:16 · VO Cartesia (Galang, id)",
           f"- Kata terucap: **{n}** → estimasi **{lo}–{hi} dtk** (150–135 WPM)",
           "- Markup `{tampil|ucap}`: teks kiri untuk caption, teks kanan untuk TTS (ejaan fonetik).",
           f"- Status: {STATUS}. Fakta hanya dari research/SOURCE_REGISTER.md (diverifikasi 12 Nov 2026). Naskah riset awal: research/SCRIPT_RISET_AWAL.md.", ""]
    for st, t in zip(STAGES, TEXTS):
        out += [f"## {st} · {count(t)} kata", "", disp(t), "", f"<sub>TTS: {spok(t)}</sub>", ""]
    d = SERIES / EP / "docs"
    d.mkdir(parents=True, exist_ok=True)
    (d / "SCRIPT.md").write_text("\n".join(out), encoding="utf8")
    lines = [{"id": i, "text": PUNCT.sub(lambda m: "{%s%s|%s%s}" % (m.group(1), m.group(3), m.group(2), m.group(3)), t)} for i, t in zip(IDS, TEXTS)]
    (d / "script-lines.json").write_text(json.dumps(lines, ensure_ascii=False, indent=1), encoding="utf8")
    print(EP, "spoken words", n, f"-> {lo}-{hi} s", [count(t) for t in TEXTS])
