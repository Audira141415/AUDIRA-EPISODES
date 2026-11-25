# TEMPLATE_EPISODE — cara pakai (tema apa pun)

Folder template episode lengkap, reusable. Isinya **harga mati** untuk video skor bagus: ikuti `_GATE.md`.

## Pakai
1. **Scaffold resmi (disarankan):** `audira_project_layout add_episode` buat folder episode di seri. Lalu salin file template yang belum ada dari sini ke episode itu (`_GATE.md`, docs/, style/, research/, SOCIAL_CAPTIONS.md).
2. **Manual:** copy seluruh `TEMPLATE_EPISODE/` → `AUDIRA_CARA_KERJA_VIRAL_2026/EP106_DEPENDENCY_INJECTION_BUKAN_HANYA_UNTUK_J/`.
3. Ganti semua `<...>` di `_GATE.md` (topik, seri, channel) — nilai itu dipakai semua file.
4. Kerjakan `_GATE.md` urut 1→11. Berhenti di tiap ✅ minta acc. Centang + `audira_episode_status update`.

## Isi
```
_GATE.md              ⛔ inti harga mati: 3 aturan + 11 tahap + jebakan
README.md             file ini
STATUS.json           progres (audira_episode_status)
NOTES.md              pelajaran + pasca-tayang
SOCIAL_CAPTIONS.md    6 platform + jadwal WIB + label AI
research/SOURCE_REGISTER.md   fakta+URL (⛔ via subagent)
docs/SCRIPT.md        naskah 6 tahap
docs/STORYBOARD.md    beat + kamera
style/STYLE_DECISION.md  style + cover (quality-bar)
audio/  project/  draft/   diisi saat pipeline (lihat .gitkeep)
```

> Starter render (Remotion/HyperFrames) + brand (`AudiraSignature`, `AudiraOutro`) TIDAK di template ini — disalin dari starter kit ke `project/` saat tahap 5. Template ini = kerangka dokumen + gate, engine-agnostik.
