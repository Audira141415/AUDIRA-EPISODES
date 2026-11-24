# STYLE_DECISION — EP76 Tornado Api

Style: DISASTERSIM
- Engine: 3D Remotion + React Three Fiber (default sejak 2026-11-17).
- Alasan: fire whirl adalah fenomena fisika bencana. DISASTERSIM punya bahasa visual "simulasi bencana yang tenang dan jujur secara fisika": potongan lab di atas plinth untuk menjelaskan udara panas naik + putaran menyempit, lalu lingkungan nyata (hutan Redding, kota kayu Tokyo 1923) untuk dua kasus terverifikasi. Rekomendasi tool: skor topik tertinggi (66.2), juri rata-rata 3.65 (EP04 Gunung lolos 3.83).
- Alternatif ditolak:
  - WORLDFORGE: diorama dunia kuat untuk lanskap, tapi tidak punya mode "lab penjelas" untuk beat mekanisme pusaran.
  - PAPERWORLD (2D): api kertas tidak bisa menunjukkan kolom pusaran 3D yang berputar dan menyempit; payoff "pusaran lahir" hilang.
- Wajib dari motion memory DISASTERSIM: Finish DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO; tag bab HUD mulai y ≥ 262 (jangan tabrak slot AudiraSignature atas); maksimal satu kartu data per adegan; adegan tidak gelap abu-abu (rim light + foreground); kamera tanpa settle() di akhir rig (deadPct); label in-scene ≥ 60 px dari tepi dan ≥ 28 px; contact sheet draf memuat frame tiap adegan; adegan penutup punya hero subjek.
- Kit bukan jebakan lingkungan: plinth lab hanya untuk beat penjelasan; beat Redding = hutan pinus + rumah + menara/tiang listrik, beat Tokyo = kota kayu machiya + lapangan terbuka.
- Pusaran api = mesh prosedural (lathe/silinder berpilin dengan shader api emisif + kolom asap), bukan Points/LineSegments. Objek konkret di tiap adegan = GLB katalog.
- Dipilih AI sendiri tanpa acc (keputusan pengguna 2026-11-23). Gerbang render final sudah pre-approved (batch otonom 2026-11-25).
- Tanggal: 2026-11-25
- approved: yes (pilihan AI, dilaporkan satu baris)
- Cover referensi: style/cover-reference.png (style-covers/disastersim.png).
- Cover topik: style/cover-topic.png — dirender dari frame hook setelah adegan S1 dibangun (sesi B).
