"""write_script_ep06.py: writes EP06 docs/SCRIPT.md + docs/script-lines.json and prints word counts.
Same markup as write_scripts.py ({display|spoken}; captions use display, TTS uses spoken), kept in its
own file so the approved EP01-EP05 scripts are never rewritten. Run: python _tools/write_script_ep06.py"""
import io, json, re, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
SERIES = Path(__file__).resolve().parent.parent
EP = "EP06_JIKA_WAPRES_MUNDUR"
STYLE = "TIMEFORGE"
STATUS = "disetujui pengguna 2026-11-11"
STAGES = ["Hook (0–3 dtk)", "Context (4–15 dtk)", "Main Development (16–45 dtk)", "Explanation (46–70 dtk)", "Visual Payoff (71–85 dtk)", "Outro (86–90 dtk)"]
IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]

TEXTS = [
    "Wakil presiden ingin mundur. Indonesia pernah mengalaminya sekali, dan kursinya kosong enam belas tahun. Ini {AUDIRA|Audira}.",
    "Selasa, {10 November|sepuluh November}, Wapres Gibran menyampaikan niat mundur kepada Presiden Prabowo, di tengah putusan Mahkamah Konstitusi dan Mahkamah Agung soal ijazahnya. Statusnya masih niat, belum surat resmi.",
    "Kalau benar mundur, apa yang terjadi? Tidak ada pemilu ulang. Pasal {8|delapan} ayat {2|dua} Undang-Undang Dasar mengatur: Presiden mengusulkan dua nama, lalu {MPR|Majelis Permusyawaratan Rakyat} memilih salah satunya, paling lambat {60|enam puluh} hari. Wapres baru meneruskan masa jabatan sampai {2029|dua ribu dua puluh sembilan}.",
    "Ini berbeda dengan pemakzulan, yang harus lewat {DPR|Dewan Perwakilan Rakyat}, Mahkamah Konstitusi, lalu {MPR|Majelis}. Dan selama kursi wapres kosong, pemerintahan tetap berjalan, karena presiden tetap menjabat.",
    "Sejarah membuktikannya. Mohammad Hatta menyurati {DPR|Dewan} pada Juli {1956|sembilan belas lima puluh enam}, lalu resmi berhenti {1 Desember|satu Desember}, karena berbeda pandangan dengan Soekarno. Kursinya kosong lebih dari enam belas tahun, sampai Sri Sultan Hamengkubuwono {IX|Kesembilan} menjabat pada {1973|sembilan belas tujuh puluh tiga}. Tahun {1998|sembilan belas sembilan puluh delapan}, Habibie naik menjadi presiden dan memimpin tanpa wakil sama sekali. Baru pada {2001|dua ribu satu}, {MPR|Majelis} memilih wakil presiden di tengah masa jabatan: Hamzah Haz.",
    "Bedanya sekarang, ada batas enam puluh hari. Tapi semua itu baru berlaku setelah ada surat resmi. Menurutmu, kursi ini akan kosong lagi? Ikuti terus di {AUDIRA|Audira}.",
]

GROUP = re.compile(r"\{([^|}]*)\|([^}]*)\}")
PUNCT = re.compile(r"\{([^|}]*)\|([^}]*)\}([.,:;?!]+)")
disp = lambda t: GROUP.sub(lambda m: m.group(1), t)
spok = lambda t: GROUP.sub(lambda m: m.group(2), t)
count = lambda t: len(spok(t).split())

n = sum(count(t) for t in TEXTS)
lo, hi = round(n / 150 * 60), round(n / 135 * 60)
out = [f"# SCRIPT — {EP}", "", f"- Style: {STYLE} · format short 9:16 · VO Cartesia (Galang, id)",
       f"- Kata terucap: **{n}** → estimasi **{lo}–{hi} dtk** (150–135 WPM)",
       "- Markup `{tampil|ucap}`: teks kiri untuk caption, teks kanan untuk TTS (ejaan fonetik).",
       f"- Status: {STATUS}. Fakta dari research/RISET_JIKA_WAPRES_MUNDUR_2026-11-11.md (dicek 11 Nov 2026).", ""]
for st, t in zip(STAGES, TEXTS):
    out += [f"## {st} · {count(t)} kata", "", disp(t), "", f"<sub>TTS: {spok(t)}</sub>", ""]
d = SERIES / EP / "docs"
d.mkdir(parents=True, exist_ok=True)
(d / "SCRIPT.md").write_text("\n".join(out), encoding="utf8")
lines = [{"id": i, "text": PUNCT.sub(lambda m: "{%s%s|%s%s}" % (m.group(1), m.group(3), m.group(2), m.group(3)), t)} for i, t in zip(IDS, TEXTS)]
(d / "script-lines.json").write_text(json.dumps(lines, ensure_ascii=False, indent=1), encoding="utf8")
print(EP, "spoken words", n, f"→ {lo}-{hi} s", [count(t) for t in TEXTS])
