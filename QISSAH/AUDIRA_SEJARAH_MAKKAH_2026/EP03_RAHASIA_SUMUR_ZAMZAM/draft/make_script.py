import json
j=json.load(open('audio/vo-chapters.json',encoding='utf-8'))
vis={
'c00_hook':"Kamera turun dari Ka'bah kecil di kejauhan menembus lantai mataf marmer; potongan tanah terbuka memperlihatkan poros sumur menyala biru di bawah kaki titik-titik jemaah.",
'c01_intro':"Cutaway berputar perlahan: label lapisan muncul satu per satu (marmer, basement lama, pasir, batu lapuk, diorit), lalu pipa ke pabrik menyala sebagai janji episode.",
'c02_lembah':"Diorama lembah pasir kosong dengan dua bukit (Shafa, Marwah), jejak langkah berulang tujuh kali, genangan kecil berkilau dibendung tepian pasir, burung sebagai titik berputar. Tanpa sosok manusia, nabi, atau malaikat.",
'c03_hilang':"Potongan tanah yang menimbun sumur, lapisan pasir tersingkap lapis demi lapis, dua kijang emas berkilau di dalam timbunan, cangkul tanpa tangan, pintu Ka'bah berlapis emas kecil sebagai payoff.",
'c04_timba':"Timeline cross-section: sumur terbuka dengan katrol dan timba, kubah naik lalu digantikan secara abstrak (garis rencana), sangkar besi, tangki seng berkeran, lantai mataf menelan bangunan, tangga turun ke basement, lalu lempeng beton menutup (2003).",
'c05_anatomi':"Hero cutaway sumur 30 m dengan skala: aluvium pasir, garis kuning lapisan lapuk 0,5 m yang meneteskan air, diorit gelap; bukaan 45x30 cm menyala; HUD sensor muka air dan ambang pompa; hujan meresap ke wadi.",
'c06_perjalanan':"Follow-cam setetes air: pompa, pipa baja menuju Kudai, tangki 5.000 m3, filter pasir dan kartrid, cahaya UV biru, tangki 10.000 m3, kembali ke Masjidil Haram; garis peta Makkah-Madinah dengan truk tangki.",
'c07_sains':"Meja laboratorium bersih: tabung sampel, stempel tahun 1883 dan 2011, layar split dua laporan, grafik batang parameter vs batas WHO. Label 'tergantung asal sampel'.",
'c08_ekspor':"Peta dunia dengan garis 'tidak diekspor', koper di mesin X-ray dengan siluet botol, galon 5 L di asrama haji, lalu gelas kecil berlipat menjadi lautan dua juta gelas.",
'c09_penutup':"Kembali ke hero cutaway dari hook, kamera naik melewati lapisan ke lantai mataf; titik-titik jemaah mengalir di atas; outro card AUDIRA.",
}
wc=lambda t:len(t.split())
L=["# Naskah — EP03 RAHASIA SUMUR ZAMZAM (video panjang 16:9)","",
"Seri: SEJARAH MAKKAH · EP03 · slug `zamzam` · Style: INNERWORKS · Narator: Galang (Cartesia, `id`) · Tanggal: 2026-11-10","",
"Sumber narasi untuk TTS: `audio/vo-chapters.json` (teks identik). Estimasi durasi = kata / 140 x 60. Semua fakta dari `research/SOURCE_REGISTER.md`; angka yang diperselisihkan memakai rumusan tabel Disputes di `research/RESEARCH_REPORT.md`. Status: menunggu acc naskah.",""]
tot=0
for c in j['chapters']:
    w=wc(c['text']); tot+=w; s=round(w/140*60)
    L+= [f"## {c['title']} (`{c['id']}`)","",f"**Kata:** {w} · **Estimasi:** {s} dtk ({s//60}:{s%60:02d})","",f"**Visual:** {vis[c['id']]}","",c['text'],""]
    if c['id']=='c04_timba': L+=["> **[SHORT 01 dimulai di sini]** dari \"Selama berabad-abad, air ditimba dengan tali.\" sampai akhir bab.",""]
    if c['id']=='c07_sains': L+=["> **[SHORT 02, bagian 2]** dari \"Tahun dua ribu sebelas, investigasi BBC London...\" sampai \"...terutama tergantung asal sampelnya.\", lalu \"Studi tahun dua ribu dua puluh satu...\" sampai \"...arsenik tidak terdeteksi.\"",""]
    if c['id']=='c08_ekspor': L+=["> **[SHORT 02, bagian 1 dan 3]** dari \"Jemaah haji dan umrah hanya boleh...\" sampai \"...berizin mengimpor air Zamzam.\", dan \"Untuk jemaah Indonesia, aturannya jelas.\" sampai \"...setibanya di tanah air.\"",""]
s=round(tot/140*60)
L+=["## Total","",f"**{tot} kata · estimasi {s//60}:{s%60:02d} pada 140 WPM** ({round(tot/150*60)//60}:{round(tot/150*60)%60:02d} pada 150 WPM). Ditambah end screen 20 dtk, film sekitar 11 menit.","",
"## Dua short turunan (9:16, 1080x1920 @ 60)",""]
for sh in j['shorts']:
    L+=[f"### {sh['id']} — {sh['title']}","",f"- **Hook baru (0–3 dtk):** \"{sh['hook']}\""]
    if 'reuseFrom' in sh: L+=[f"- **Memakai narasi:** `{sh['reuse'][0]}`, dari \"{sh['reuseFrom']}\" sampai \"{sh['reuseTo']}\""]
    else: L+=["- **Memakai narasi (berurutan):**"]+[f"  - {x}" for x in sh['reuseLines']]
    if 'note' in sh: L+=[f"- **Catatan:** {sh['note']}"]
    L+=[f"- **Penutup:** \"{sh['outro']}\"",f"- **Estimasi:** {sh['estWords']} kata, sekitar {sh['estSeconds']} dtk",""]
L+=["## Catatan kepatuhan","",
"- Tidak ada nabi, malaikat, atau Allah yang digambarkan; kisah Hajar dan Abdul Muthalib hanya lewat tempat, pasir, air, cahaya, dan benda.",
"- Debit ditulis \"sekitar sebelas sampai delapan belas setengah liter per detik, menurut laporan yang dikutip media Saudi\"; angka 360 m3/jam tidak dipakai.",
"- Tahun pemindahan ke basement ditulis \"awal tahun 1960-an\", kedalaman \"sekitar dua setengah meter\"; proyek Raja Abdullah \"sekitar 2010\"; jarak Kudai \"empat sampai lima kilometer\"; kemasan \"kini lima liter\".",
"- Arsenik/nitrat disajikan sebagai \"hasil berbeda-beda, tergantung asal sampel\". Tidak ada klaim \"menyembuhkan\", \"100% murni\", \"komposisi tak berubah\", atau \"ilmuwan tak bisa menjelaskan\".",
"- Angka konsumsi selalu disertai musim/tahun (musim haji 1447 H).",
"- \"Audira\" ditulis huruf biasa agar tidak dieja TTS.",""]
open('docs/SCRIPT.md','w',encoding='utf-8').write("\n".join(L))
print(tot)
