# Research Report — Python Virtual Environment: Kenapa Kamu Harus Berhenti Pakai System Python

## Sumber utama

- PEP 668 (2021, Final) — dasar "kenapa system Python berbahaya" dan asal error externally-managed (#1, #2).
- PEP 405 (2011, Python 3.3) — spesifikasi resmi virtual environment (#3).
- Dokumentasi resmi `venv` (#4) dan Python Packaging User Guide (#6) — cara pakai dan aturan praktik.
- Debian 12 Release Notes (#5) — bukti distro besar menerapkan blokir PEP 668.
- PyPI virtualenv (#7), Wikipedia pip (#8) — konteks sejarah dan definisi (MEDIUM).

## Fakta terverifikasi

1. Memasang versi paket yang tidak kompatibel dengan pip ke Python bawaan bisa merusak software bawaan distro (#1).
2. Contoh nyata di PEP 668: `pip install` bisa merusak perintah `dnf` Fedora dan sulit dipulihkan (#1).
3. PEP 668 menambahkan penanda externally managed dan opsi `--break-system-packages` (#2).
4. Debian 12 menandai python3.11 bawaan sebagai externally-managed; pip menolak install kecuali dengan flag tersebut (#5).
5. Debian menyarankan pipx untuk aplikasi dan virtualenv untuk library (#5).
6. virtualenv buatan Ian Bicking, rilis PyPI paling awal 0.8 pada 14 September 2007 (#7).
7. PEP 405 oleh Carl Meyer menjadikan virtual environment bagian Python 3.3 (modul `venv`) (#3, #4).
8. Tiap venv punya set paket independen; dibuat dengan `python -m venv` (#4, #6).
9. venv tidak dimasukkan ke Git, dianggap sekali pakai: hapus lalu buat ulang (#4).
10. pip mengambil paket dari PyPI (#8).

## Perselisihan / Kontroversi

- **Hook TOPIC.md tidak akurat (judul tidak diubah):** "Satu perintah pip install bisa merusak *semua* project kamu" berlebihan. Yang tercatat di sumber: pip install ke Python bawaan bisa merusak project lain yang memakai interpreter yang sama dan alat sistem operasi (contoh `dnf` Fedora, #1). Tidak otomatis "semua project". Naskah memakai versi akurat: "bisa bikin project lain dan alat sistem operasi rusak".
- **Konteks per 2026-11-25:** di Debian 12+ (dan distro lain yang mengikuti PEP 668), perintah tersebut kini **ditolak** secara default kecuali memakai `--break-system-packages` (#5). Jadi risiko terbesar sekarang ada pada pengguna yang memaksa flag itu, distro lama, `sudo pip install`, atau Python Windows/macOS hasil installer (tidak diklaim di VO, tidak ada sumber).
- "Berhenti pakai system Python" sebaiknya dibaca "berhenti memasang paket ke system Python". Interpreter bawaan tetap dipakai untuk membuat venv.
- Klaim Ubuntu 23.04 juga menerapkan PEP 668 tidak terverifikasi (halaman rilis tidak memuat), jadi tidak dipakai di VO.
- Tahun rilis Python 3.3 tidak ada di register; VO hanya menyebut "Python 3.3".

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| `pip install` | perintah pemicu masalah | #1, #8 |
| `dnf` (Fedora) | alat sistem yang bisa rusak | #1 |
| PEP 668 | aturan "externally managed" | #1, #2 |
| Debian 12 | distro yang memblokir pip di Python bawaan | #5 |
| `--break-system-packages` | flag pemaksa | #2, #5 |
| 2007 · Ian Bicking | virtualenv versi 0.8 | #7 |
| Python 3.3 · `venv` | venv jadi bawaan | #3, #4 |
| `python -m venv` | perintah membuat env | #4 |

## Poin kunci

- Satu interpreter bawaan = satu "lemari" paket untuk semua project dan alat OS; konflik versi tak terhindarkan.
- Distro modern sekarang memblokir, nama flag pemaksanya sendiri sudah peringatan.
- Solusi: satu project, satu venv; venv sekali pakai, tidak masuk Git.
