# AUDIO PLAN — EP10

- **Suara:** Cartesia sonic-3 (id), `vo.wav` -16 LUFS. Risa = narator, Cinta, Kegembiraan, Kecantikan; Galang = Kekayaan, Waktu; Andi = Kesedihan, penduduk pulau.
- **Musik (`mix.py`, numpy):** organ alang (drone) + lonceng "glass harmonica" FM, 66 BPM. Progresi Dm–C–Bb–Am (D Dorian) selama pulau dan badai; tremolo cello D rendah di bawah badai; pindah ke D mayor (D–G–Bm–A) saat Waktu datang dengan garis lonceng naik; akor mayor penuh di s10e. Lonceng lebih jarang saat ada ucapan.
- **Ambience:** ombak (noise band 80–900 Hz berdenyut), angin, hujan, semuanya mengikuti kurva badai; guntur di setiap kilat (sama dengan `flashAt` di film).
- **SFX:** ping kaca saat panel menyala (hook, kilas balik, tiap baris hikmah), chime judul/s8b/s9g/outro, impact saat langit gelap, whoosh panel perahu masuk/keluar, riser sebelum s8a, whoosh-cinematic saat kilas balik dan perahu melaju, sparkle di "Sang Waktu" dan s10e.
- **Level:** bed ~-24 LUFS, peak -4.9 dBFS, ducking -5 dB di bawah ucapan dari waktu klip. Lead menggabung dengan `scripts/combine-vo.sh ep10`.
