# Source Register — VS Code Extension yang Mengubah Cara Aku Coding

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | 75,9% dari semua responden Stack Overflow Developer Survey 2025 memakai VS Code (Visual Studio 29%); IDE teratas tahun keempat berturut-turut | Stack Overflow Developer Survey 2025 — Technology, Stack Overflow, 2025 | https://survey.stackoverflow.co/2025/technology | 2026-11-25 | HIGH |
| 2 | Extension Host bertugas menjalankan extension; varian lokal/remote berjalan di runtime Node.js, varian web di WebWorker browser | Extension Host, VS Code Extension API docs, Microsoft, diperbarui 2026-11-18 | https://code.visualstudio.com/api/advanced-topics/extension-host | 2026-11-25 | HIGH |
| 3 | Extension Host mencegah extension memperlambat startup, memperlambat operasi UI, dan mengubah UI; extension dimuat malas lewat Activation Events (contoh: extension Markdown baru dimuat saat file Markdown dibuka) | Extension Host — Stability and Performance, VS Code Extension API docs, Microsoft, 2026 | https://code.visualstudio.com/api/advanced-topics/extension-host | 2026-11-25 | HIGH |
| 4 | Activation event `onLanguage` mengaktifkan extension saat file berbahasa tertentu (mis. `onLanguage:python`) dibuka; `onStartupFinished` aktif setelah startup tanpa memperlambatnya | Activation Events, VS Code Extension API reference, Microsoft, 2026 | https://code.visualstudio.com/api/references/activation-events | 2026-11-25 | HIGH |
| 5 | Language server berjalan sebagai proses terpisah; editor dan server berkomunikasi lewat JSON-RPC (`textDocument/didOpen`, `textDocument/didChange`), server menganalisis dan mengirim diagnostik (error/warning) | Language Server Protocol — Overview, Microsoft, 2026 | https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/ | 2026-11-25 | HIGH |
| 6 | Error Lens: menyorot seluruh baris yang punya diagnostik dan mencetak pesannya inline di ujung baris; lisensi MIT | usernamehw/vscode-error-lens README, Alexander (usernamehw), GitHub, 2026 | https://github.com/usernamehw/vscode-error-lens | 2026-11-25 | MEDIUM |
| 7 | Error Lens terbit di Marketplace 18 Mei 2019; ±10,38 juta install, rating 4,88 (per 2026-11-25) | Visual Studio Marketplace — Error Lens (API extensionquery), Microsoft, 2026 | https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens | 2026-11-25 | MEDIUM |
| 8 | Prettier – Code formatter: ±73,17 juta install (per 2026-11-25), terbit 10 Jan 2017 | Visual Studio Marketplace — Prettier (API extensionquery), Microsoft, 2026 | https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode | 2026-11-25 | MEDIUM |
| 9 | GitLens: menampilkan kepemilikan kode lewat anotasi Git blame dan CodeLens; ±54,11 juta install (per 2026-11-25), terbit 5 Sep 2016 | Visual Studio Marketplace — GitLens (API extensionquery), GitKraken/eamodio, 2026 | https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens | 2026-11-25 | MEDIUM |
| 10 | Live Share untuk VS Code kini dalam mode maintenance tanpa fitur baru; Visual Studio 2026 (18.12) tidak lagi menyertakannya | Visual Studio Live Share docs, Microsoft Learn, 2026 | https://learn.microsoft.com/en-us/visualstudio/liveshare/ | 2026-11-25 | HIGH |
| 11 | VS Code diumumkan 29 April 2015 di Build; Code – OSS dirilis lisensi MIT 18 Nov 2015; keluar dari preview 14 April 2016 | Visual Studio Code, Wikipedia (rev. 2026-11-23) | https://en.wikipedia.org/wiki/Visual_Studio_Code | 2026-11-25 | MEDIUM |

## Level
- HIGH: dokumentasi resmi Microsoft / survei primer Stack Overflow.
- MEDIUM: data Marketplace (angka install berubah tiap hari), README penulis extension, Wikipedia.
- Catatan: hitungan total extension Marketplace via API (`TotalCount` 159.175, filter target VS Code) tidak dicatat sebagai fakta karena metode hitung belum terverifikasi.
