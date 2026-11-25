# EP 02: Sambungkan audira-skill-mesh ke Claude

Seri AUDIRA, PASANG AUDIRA. Created by Agus Dwi R. Riset 5 November 2026. Alat: Claude Code, audira-skill-mesh (MCP), Git, Node.js.

Judul di brief: Instalasi audira mesh ke Claude

Suara rencana: Cartesia sonic-3, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`, bahasa id. 204 kata terucap, ujaran 87.045 detik, film 90.05 detik.

**00:00.1 - 00:05.4** (s1)

Sembilan ratus dua puluh lima skill. Kalau semuanya dibaca Claude sekaligus, ingatannya penuh sebelum mulai kerja.

**00:05.6 - 00:19.1** (s2)

Jadi kita pakai audira-skill-mesh, sebuah server MCP. MCP itu colokan standar, supaya Claude bisa memanggil alat dari luar. Claude tinggal mencari, lalu memuat skill yang dibutuhkan saja.

**00:19.3 - 00:31.1** (s3)

Mulai. Pastikan Git dan Node.js sudah ada. Buka PowerShell, masuk ke folder pengguna, lalu clone repositorinya dari GitHub. Ukurannya sekitar seratus empat puluh mega.

**00:31.3 - 00:42.1** (s4)

Masuk ke folder mcp-server, lalu jalankan npm install. Jangan dilewati. Tanpa langkah ini, servernya gagal menyala.

**00:42.3 - 00:54.8** (s5)

Sekarang daftarkan ke Claude. Perintahnya satu baris: claude mcp add, lingkup user supaya berlaku di semua proyek, lalu nama server dan alamat file-nya.

**00:55.0 - 01:09.8** (s6)

Bagian minus e menyimpan kunci Cartesia, khusus untuk membuat suara. Di PowerShell, taruh paling belakang. Ditaruh di tengah, perintahnya gagal, dan itu sudah kami coba. Tidak butuh suara? Hapus bagian itu. Dan jangan perlihatkan kuncimu saat merekam layar.

**01:09.9 - 01:23.0** (s7)

Cek dengan claude mcp list. Harus tertulis connected. Lalu buka sesi baru, dan minta: jalankan audira_status. Kalau jawabannya online, dengan sembilan ratus skill lebih, mesh-mu sudah hidup.

**01:23.2 - 01:27.0** (s8)

Dua-duanya sudah terpasang. Di episode tiga, kita pakai sampai jadi film.

