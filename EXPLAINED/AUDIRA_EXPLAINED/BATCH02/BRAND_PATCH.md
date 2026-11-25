# Patch branding sebelum render final (aturan baru CLAUDE.md)

Draf sudah DISETUJUI pengguna. Sebelum final, tambahkan satu hal di film-mu saja (`studio/src/scenes/<ep>/`):

1. **Nama AUDIRA di dalam adegan** minimal sekali, sebagai bagian dunia (bukan overlay datar): mis. tulisan "AUDIRA" pada papan/plang/label HUD di objek 3D, lambung/kontainer, layar di dunia, sticker di diorama, atau label bendung. Kecil-sedang, tampil ≥2 dtk, di dalam safe zone, tidak di 380 px bawah. Pakai teks "AUDIRA" atau "AUDIRA EXPLAINED" (font style-mu). Jangan bikin logo baru.
2. **Timeline berubah sedikit**: VO kini punya kalimat penutup baru "Ini AUDIRA Explained." di section OUTRO, jadi `timeline.json` total dan `sections.OUTRO` bertambah ±2 dtk. Film-mu membaca timeline, jadi cek bahwa: caption kalimat baru tampil, `<Outro>` mulai setelah kalimat itu, dan tidak ada shot yang berhenti/kosong di detik tambahan (perpanjang shot terakhir bila perlu).
3. **Jangan** ubah Root.tsx (sudah ada tanda tangan `AudiraSignature` dari lead), core, kits, _shared, atau episode lain.

Verifikasi: render 2 still saja (frame label AUDIRA + frame 1 dtk sebelum Outro) ke `../<EPFOLDER>/draft/brandcheck/`, lihat versi kecil. JANGAN render film. Lapor 2 baris (detik label AUDIRA muncul + konfirmasi outro).
