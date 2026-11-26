# Research Report — VS Code Extension yang Mengubah Cara Aku Coding

## Sumber utama

- Stack Overflow Developer Survey 2025 (#1) — pangsa pakai VS Code.
- Dokumentasi resmi VS Code Extension API: Extension Host (#2, #3) dan Activation Events (#4).
- Language Server Protocol Overview, Microsoft (#5).
- Visual Studio Marketplace + README GitHub untuk Error Lens, Prettier, GitLens (#6–#9).
- Microsoft Learn — status Live Share (#10). Wikipedia untuk sejarah singkat VS Code (#11).

## Fakta terverifikasi

1. 75,9% responden Stack Overflow Survey 2025 memakai VS Code, tertinggi di kategori IDE (#1).
2. Extension tidak berjalan di proses UI editor, melainkan di Extension Host (Node.js lokal/remote, WebWorker di web) (#2).
3. Extension Host mencegah extension memperlambat startup dan UI; extension dimuat malas lewat Activation Events (#3).
4. `onLanguage:python` = extension aktif saat file Python dibuka; `onStartupFinished` tidak memperlambat startup (#4).
5. Language server = proses terpisah, bicara dengan editor lewat JSON-RPC; mengirim diagnostik error/warning saat dokumen berubah (#5).
6. Error Lens menyorot seluruh baris berdiagnostik dan mencetak pesan error inline di ujung baris (#6).
7. Error Lens terbit 18 Mei 2019, ±10,38 juta install per 2026-11-25 (#7).
8. Prettier ±73,17 juta install per 2026-11-25 (#8).
9. GitLens menampilkan anotasi Git blame (siapa mengubah baris, kapan, commit apa); ±54,11 juta install (#9).

## Perselisihan / Kontroversi

- **Hook "bukan yang populer"**: akurat bila dibandingkan Prettier (73 juta) vs Error Lens (10 juta). GitLens (54 juta) tetap tergolong populer, jadi naskah hanya memakai kontras Error Lens vs Prettier untuk klaim "kalah populer".
- **Judul memakai "aku"**: ini sudut pandang personal narator AUDIRA. Klaim "mengubah workflow" adalah opini, bukan fakta terukur; naskah membingkainya sebagai pengalaman, angka tetap dari register.
- **Live Share** sempat jadi kandidat, tapi kini maintenance mode tanpa fitur baru (#10). Tidak direkomendasikan di video; dikeluarkan dari naskah.
- **Angka install** berubah tiap hari. Di layar tulis "per Nov 2026" dan bulatkan ("10 juta+", "73 juta+").
- **Rule 15 (EXPLAINED)**: jangan tampilkan logo VS Code, Microsoft, Git, GitHub, Prettier, atau ikon extension asli. Pakai editor generik buatan sendiri dan name plate teks.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 75,9% | Developer pakai VS Code (SO Survey 2025) | 1 |
| 10 juta+ | Install Error Lens, per Nov 2026 | 7 |
| 73 juta+ | Install Prettier, per Nov 2026 | 8 |
| 2019 | Error Lens terbit di Marketplace | 7 |
| Extension Host | Proses terpisah tempat extension berjalan | 2, 3 |
| onLanguage:python | Contoh activation event | 4 |
| JSON-RPC | Bahasa pesan editor ↔ language server | 5 |
| Git blame | Fitur inti GitLens | 9 |

## Poin kunci

- Extension paling berdampak tidak selalu yang paling banyak diinstal: Error Lens (10 juta) vs Prettier (73 juta).
- Error Lens memangkas satu langkah: pesan error langsung terbaca tanpa hover.
- GitLens menjawab "siapa dan kapan" tiap baris lewat Git blame.
- Kenapa puluhan extension tidak bikin editor lemot: Extension Host terpisah + aktivasi malas.
- Asal tanda error: language server (proses terpisah, JSON-RPC); Error Lens hanya menampilkannya lebih jelas.
