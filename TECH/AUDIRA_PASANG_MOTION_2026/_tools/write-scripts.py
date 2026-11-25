"""Writes each episode's script-lines.json. Markup {display|spoken}: display goes on screen and subtitles, spoken goes to Cartesia.
Run from AUDIRA_PASANG_MOTION_2026: python _tools/write-scripts.py"""
import json, re
from pathlib import Path

CL = "{Claude|Klod}"
CC = "{Claude Code|Klod Kod}"
AM = "{audira-motion|audira mosyen}"
NODE = "{Node.js|Nod Jei Es}"
FF = "{ffmpeg|ef ef em peg}"
SK = "{SKILL.md|skil em di}"
MCP = "{MCP|Em Si Pi}"
PS = "{PowerShell|Pawer Syel}"
CA = "{Cartesia|Kartesia}"
HF = "{HyperFrames|Haiper Freims}"
MESH = "{Mesh|Mesy}"

S = {
    "EP01_PASANG_SKILL": [
        f"Satu kalimat, jadi film tiga dimensi. Tapi {CL} belum bisa, sampai satu folder masuk ke tempat yang benar.",
        f"Folder itu skill {AM}. Isinya arahan sutradara, mesin gaya, dan kerangka proyek. Sekali pasang, {CC} tahu cara membuat film vertikal dan merendernya di komputermu. Harus {CC} ya, chat biasa di browser tidak bisa merender.",
        f"Siapkan dulu. Akses {CC}, yang butuh paket berbayar atau akun {{API|Ei Pi Ai}}. {NODE} versi dua puluh dua koma tiga belas ke atas. Lalu {FF}: di Windows, buka {PS} dan ketik {{winget install ffmpeg|win get instol ef ef em peg}}. Tutup jendelanya, buka lagi. Sisakan disk lima giga.",
        f"Sekarang ekstrak {{ZIP|zip}} paket skill-nya. Salin foldernya ke sini: folder penggunamu, titik {{claude,|klod,}} skills, {AM}. Kalau foldernya belum ada, buat sendiri.",
        f"Ini jebakan paling sering. {SK} harus tepat di dalam folder itu. Kalau hasil ekstrak membuat folder di dalam folder, {CL} tidak akan menemukannya. Buka foldernya, pastikan {SK} langsung terlihat.",
        f"Tutup {CC}, buka lagi. Ketik garis miring, {AM}. Muncul di daftar? Berarti skill terpasang. Tidak muncul? Hampir selalu soal letak {SK} tadi.",
        f"Di film pertama, {CL} minta izin membuat folder proyek. Lalu mengunduh paket dan browser render, sekitar lima ratus empat puluh mega, dan merender tes singkat. Panduannya menyebut dua sampai sepuluh menit. Proyek berikutnya lebih cepat, tinggal mengarahkan.",
        f"Skill sudah masuk. Di episode dua, kita sambungkan {CL} ke sembilan ratus lebih skill lainnya.",
    ],
    "EP02_SAMBUNG_MESH": [
        f"Sembilan ratus dua puluh lima skill. Kalau semuanya dibaca {CL} sekaligus, ingatannya penuh sebelum mulai kerja.",
        f"Jadi kita pakai {{audira-skill-mesh,|audira skil mesy,}} sebuah server {MCP}. {MCP} itu colokan standar, supaya {CL} bisa memanggil alat dari luar. {CL} tinggal mencari, lalu memuat skill yang dibutuhkan saja.",
        f"Mulai. Pastikan {{Git|Git}} dan {NODE} sudah ada. Buka {PS}, masuk ke folder pengguna, lalu {{clone|klon}} repositorinya dari {{GitHub.|Git Hab.}} Ukurannya sekitar seratus empat puluh mega.",
        f"Masuk ke folder {{mcp-server,|em si pi server,}} lalu jalankan {{npm install.|en pi em instol.}} Jangan dilewati. Tanpa langkah ini, servernya gagal menyala.",
        f"Sekarang daftarkan ke {CL}. Perintahnya satu baris: {{claude mcp add,|klod em si pi ed,}} lingkup user supaya berlaku di semua proyek, lalu nama server dan alamat file-nya.",
        f"Bagian minus e menyimpan kunci {CA}, khusus untuk membuat suara. Di {PS}, taruh paling belakang. Ditaruh di tengah, perintahnya gagal, dan itu sudah kami coba. Tidak butuh suara? Hapus bagian itu. Dan jangan perlihatkan kuncimu saat merekam layar.",
        f"Cek dengan {{claude mcp list.|klod em si pi lis.}} Harus tertulis {{connected.|konekted.}} Lalu buka sesi baru, dan minta: jalankan {{audira_status.|audira status.}} Kalau jawabannya {{online,|onlen,}} dengan sembilan ratus skill lebih, {{mesh-mu|mesy mu}} sudah hidup.",
        f"Dua-duanya sudah terpasang. Di episode tiga, kita pakai sampai jadi film.",
    ],
    "EP03_JADI_STUDIO": [
        f"Klip-klip ini dibuat dengan {AM}. Cara memulainya cukup satu kalimat biasa.",
        f"Ada tiga pemain. {CC} yang mengerjakan. {AM} yang menyutradarai film tiga dimensi. {MESH} yang mengambilkan alat dan membuat suara. Kamu? Jadi produsernya.",
        f"Buka {CC} di folder kosong. Ketik garis miring {AM}, lalu ceritakan: cara kerja kotak musik, casingnya terbuka, pinnya memetik sisir baja. Nama gaya tidak perlu dihafal. {CL} memilih dari dua puluh sembilan gaya, atau kamu tunjuk sendiri.",
        f"{CL} lalu bertanya soal suara. Sudah punya rekaman? Kirim file-nya. Belum? Minta: buat suara dari naskah ini dengan {{audira_generate_voiceover.|audira jeneret vois over.}} {MESH} menghasilkan file suara dan waktu tiap kata. Ini butuh kunci {CA} tadi.",
        f"Setujui ringkasan konsepnya, lalu tonton preview kecil. Revisi pakai bahasa sehari-hari: kameranya perlambat di detik lima. Warnanya lebih cerah. Biasanya butuh satu atau dua putaran.",
        f"Kalau sudah cocok, {CL} merender final. Seribu delapan puluh kali seribu sembilan ratus dua puluh, enam puluh frame per detik, suara sudah dimaster. Hasilnya ada di folder {{out.|aut.}}",
        f"Satu batas: {AM} khusus film tiga dimensi. Mau explainer datar atau teks bergerak? Minta {{audira_auto_orchestrate.|audira oto orkestret.}} {MESH} mencarikan skill yang pas, misalnya {HF}. Lalu minta {CL} memuatnya.",
        f"Video yang kamu tonton ini dibuat lewat jalur itu. Sekarang giliranmu. Film pertamamu tentang apa?",
    ],
}
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
for ep, lines in S.items():
    d = Path(ep)
    lines = [re.sub(r"\{([^|}]*)\|([^}]*)\}([.,:;?!])", r"{\1\3|\2\3}", t) for t in lines]
    out = [{"id": f"s{i+1}", "text": t} for i, t in enumerate(lines)]
    (d / "script-lines.json").write_text("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in out) + "\n]\n", encoding="utf8")
    n = sum(len(TOK.sub(lambda m: m.group(2), t).split()) for t in lines)
    print(ep, "spoken words", n, "at 145 WPM =", round(n / 145 * 60, 1), "s")
