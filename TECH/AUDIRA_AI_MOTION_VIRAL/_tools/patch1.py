"""One-off: lengthen scripts with sourced practical points, repoint copied tools at this series. Run from AUDIRA_AI_MOTION_VIRAL."""
from pathlib import Path
p = Path("_tools/write-scripts.py"); s = p.read_text(encoding="utf8")
R = [
 ("karena semua gerak berangkat dari situ.\"", "karena semua gerak berangkat dari situ. Contohnya, seseorang di atas bukit dengan layangan.\""),
 ("misalnya kamera mendekat, supaya kamu tahu mana yang berhasil.", "misalnya kamera mendekat, supaya kamu tahu mana yang berhasil. Tulis apa yang harus terjadi, bukan yang dilarang."),
 ("Tiga detik pembuka kamu bentuk di sini.", "Teks otomatisnya sudah tersedia, jadi tidak perlu mengetik. Tiga detik pembuka kamu bentuk di sini."),
 ("{KL} sendiri menyebutnya digital puppetry.", "{KL} sendiri menyebutnya digital puppetry. Bedanya dengan generate biasa: hasilnya tidak untung-untungan, karena gerakannya kamu yang tentukan."),
 ("Prompt menentukan suasana, cahaya, dan latar. Gerakan tidak perlu ditulis lagi.", "Prompt menentukan suasana, cahaya, dan latar, misalnya kota neon saat malam. Gerakan tidak perlu ditulis lagi."),
 ("kepala dan badan terlihat. {KL} menerima", "kepala dan badan terlihat. Panduan {RW} menyarankan mulai dengan telapak tangan menghadap kamera. {KL} menerima"),
 ("Yang berubah cuma mobilnya.", "Yang berubah cuma mobilnya. {KL} sendiri menyarankan memilih dua gambar yang mirip dari hasil generate."),
 ("hasilnya bisa pindah shot. Jadi jangan loncat.", "hasilnya bisa pindah shot. Transisi paling halus di bawah lima detik. Jadi jangan loncat."),
 ("dan bass saat bentuk baru mendarat.", "dan bass saat bentuk baru mendarat. Tanpa bobot suara, transformasi terasa ringan."),
 ("Cepat, cocok untuk ngobrol.", "Hedra menyebut satu kali generate bisa sampai sepuluh menit. Cocok untuk ngobrol."),
 ("Panduannya menyebut karakter bukan manusia bisa.", "Butuh paket Standard ke atas, dan panduannya menyebut karakter bukan manusia bisa."),
 ("Tanda baca itu jeda, dan jeda itu akting.", "Tanda baca itu jeda, dan jeda itu akting. Kalimat pendek lebih hidup."),
 ("Dan tiap gerak terikat ke kata yang diucapkan.", "Dan tiap gerak terikat ke kata yang diucapkan. Tiga hal ini tidak butuh aplikasi mahal."),
 ("dan apa yang terjadi di tiap kalimat.", "dan apa yang terjadi di tiap kalimat. Semakin spesifik arahannya, semakin sedikit revisi."),
 ("render ulang hasilnya sama. Lisensinya Apache dua.", "render ulang hasilnya sama. File-nya bisa langsung dipreview tanpa langkah build. Lisensinya Apache dua."),
 ("Ganti kalimat, render ulang, semua ikut bergeser.", "Angka muncul tepat saat angkanya terucap, bukan setengah detik sebelumnya. Ganti kalimat, render ulang, semua ikut bergeser."),
]
for a, b in R:
    assert a in s, a
    s = s.replace(a, b)
p.write_text(s, encoding="utf8")

p = Path("_tools/shell.mjs"); s = p.read_text(encoding="utf8")
s = s.replace("MMORPG: MAIN GAME BISA JADI UANG? &middot; EP ${o.ep}", "AI MOTION TANPA RIBET &middot; EP ${o.ep}")
s = s.replace('o.chip||"ILUSTRASI, BUKAN CUPLIKAN GAME"', 'o.chip||"ILUSTRASI, BUKAN HASIL AI"')
p.write_text(s, encoding="utf8")

p = Path("_tools/vo.py"); s = p.read_text(encoding="utf8")
s = s.replace("AUDIRA_GAMING_MMRORPG", "AUDIRA_AI_MOTION_VIRAL")
p.write_text(s, encoding="utf8")

Path("_tools/render.sh").write_text("""#!/usr/bin/env bash
# bash _tools/render.sh <EP> [workers] : build, mix, render, master. Without AUDIO/VO_MASTER.wav it writes PREVIEW.mp4 only and never FINAL_VIDEO.mp4.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL
EP=$1; W=${2:-4}
mkdir -p /f/hf-render-tmp
cd "$ROOT/$EP"
node build-video.mjs
python mix.py
python ../_tools/build-srt.py
cd PROJECT/HyperFrames_Remotion
export TEMP='F:\\\\hf-render-tmp' TMP='F:\\\\hf-render-tmp'
npx hyperframes render -o ../raw.mp4 -f 30 -q standard -w "$W" > ../render.log 2>&1
cd "$ROOT/$EP"
OUT=PREVIEW.mp4
[ -f AUDIO/VO_MASTER.wav ] && OUT=FINAL_VIDEO.mp4
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw.mp4 "$OUT"
ls -la "$OUT"
""", encoding="utf8")
Path("_tools/snap.sh").write_text("""#!/usr/bin/env bash
# bash _tools/snap.sh <EP> <times>: rebuilds and prints the contact sheet paths.
cd /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL/$1 && node build-video.mjs && cd PROJECT/HyperFrames_Remotion && export TEMP='F:\\\\hf-render-tmp' TMP='F:\\\\hf-render-tmp'; npx hyperframes snapshot --no-end --at "$2" 2>&1 | grep -E "contact-sheet|rror" | cut -c1-220
""", encoding="utf8")
Path("_tools/finish.sh").write_text("""#!/usr/bin/env bash
# Run after the script is approved: bash _tools/finish.sh [EP folders]. Voice, word lock, render, QC and docs for every episode.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL
EPS=${@:-EP01_SATU_FOTO EP02_MOTION_TRANSFER EP03_MOBIL_TRANSFORM EP04_HEWAN_BICARA EP05_MOTION_GRAPHICS}
for e in $EPS; do
  cd /f/AUDIRA-VIDEO-MOTION
  python AUDIRA_AI_MOTION_VIRAL/_tools/vo.py "$e" tts --speed 1.0
  python AUDIRA_AI_MOTION_VIRAL/_tools/vo.py "$e" build --tempo 1.0
  cd "$ROOT"
  bash _tools/render.sh "$e" 4
  (cd "$e" && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py)
done
cd "$ROOT"
python _tools/write-docs.py
node _tools/validate-captions.mjs
""", encoding="utf8")
