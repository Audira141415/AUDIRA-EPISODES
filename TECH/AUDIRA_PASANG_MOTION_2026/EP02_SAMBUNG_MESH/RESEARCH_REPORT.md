# EP 02: Sambungkan audira-skill-mesh ke Claude

Seri AUDIRA, PASANG AUDIRA. Created by Agus Dwi R. Riset 5 November 2026. Alat: Claude Code, audira-skill-mesh (MCP), Git, Node.js.

Judul di brief: Instalasi audira mesh ke Claude

## Temuan terverifikasi

1. Clone publik 142 MB dalam uji kami.
2. `npm install` wajib. Tanpa itu server gagal dengan ERR_MODULE_NOT_FOUND.
3. `npm ci` gagal karena lock file tidak sinkron, jadi video memakai `npm install`.
4. Di PowerShell, `-e` di tengah gagal: missing required argument 'commandOrUrl'. Di akhir berhasil.
5. `claude mcp list` menunjukkan Connected.
6. Status clone publik: 925 skill, ONLINE.

## Batasan dan keputusan editorial

Jumlah skill di repo publik 925, di mesin lokal 929. Video memakai 925 karena itu yang didapat penonton. Tool motion terbaru hanya ada di lokal, jadi tidak dipakai di naskah.
