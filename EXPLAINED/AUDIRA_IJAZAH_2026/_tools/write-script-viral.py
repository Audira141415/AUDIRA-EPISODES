"""Writes script-lines.json and an estimated timeline.json for EP02-EP04 only. EP01 is finished and is never touched.
Markup {display|spoken}: display goes on screen, spoken goes to Cartesia. Punctuation stays inside the token.
Run from AUDIRA_IJAZAH_2026: python _tools/write-script-viral.py"""
import json, re, shutil
from pathlib import Path

PN = "{PN|Pengadilan Negeri}"
Y25 = "{2025,|dua ribu dua puluh lima,}"
FILE = "{file|fail}"
EPS = {
    "EP02_FAKTA_RUANG_SIDANG": [
        ("s1", f"Empat jenjang, dari SD sampai S1. Kamis, {{5|lima}} November, Jokowi mengangkat ijazahnya di {PN} Jakarta Timur. Hakim sempat bilang, nanti saja setelah sidang. Jokowi memohon, karena sudah berjanji."),
        ("s2", "Detail yang jarang dibahas: ijazah SMA dan S1 sudah di tangan jaksa sebagai barang bukti. SD dan SMP dibawa Jokowi sendiri."),
        ("s3", "Di bawah sumpah, ia menyebut urutannya. SD Negeri {111|seratus sebelas} Surakarta. SMP Negeri {1.|satu.} SMA Negeri {6.|enam.} Lalu Fakultas Kehutanan {UGM,|Ugem,} mulai {1980.|sembilan belas delapan puluh.} Katanya, fakultasnya tak punya jurusan, dan ia banyak mengambil mata kuliah teknologi kayu."),
        ("s4", "Lalu tiga tanggal. Ujian skripsi, {23|dua puluh tiga} Oktober {1985.|sembilan belas delapan lima.} Ijazah terbit, {5|lima} November. Wisuda, {19|sembilan belas} November, bersama {14|empat belas} orang dari fakultasnya."),
        ("s5", "Judul skripsinya, katanya, diajukan sampai tiga kali. Lalu ijazah itu ditunjukkan ke {KPU|Ka Pe U} sejak pilkada Solo {2005|dua ribu lima} sampai pilpres {2019.|dua ribu sembilan belas.}"),
        ("s6", "Kubu Roy Suryo membantah. Roy menyebut ijazah ini beda dengan yang ia lihat di Polda Metro, {15|lima belas} Desember: bagian bawah kertas, {watermark,|wotermak,} sampai fotonya."),
        ("s7", "Refly Harun menyebut aksi itu tanpa izin hakim. Sejumlah media menulis hakim mengizinkan. Soal izin pun masih diperdebatkan."),
        ("s8", "Yang pasti, Roy menolak keterangan Jokowi, dan hakim mencatatnya. Menunjukkan dokumen belum sama dengan putusan. Hakim belum memutus, dan Roy belum bisa disebut bersalah."),
    ],
    "EP03_UJI_LABFOR": [
        ("s1", "Satu pertanyaan di ruang sidang, dan jawaban Jokowi langsung jadi perdebatan: saya keberatan."),
        ("s2", f"Refly Harun, kuasa hukum Roy Suryo, bertanya. Apabila hakim memerintahkan, bersediakah ijazah fisik diuji ulang di labfor secara transparan, lalu dibandingkan dengan {FILE} digital yang dianalisis Roy?"),
        ("s3", "Alasan Jokowi ada dua. Ijazah itu sudah diuji Labfor Polri, Bareskrim. Dan itu dokumen pribadi, ia keberatan kalau ditenteng ke mana-mana."),
        ("s4", f"Kenapa kubu Roy mengejar ini? Analisis mereka bertumpu pada {FILE} digital. Salah satunya {{Error Level Analysis,|Eror Level Analisis,}} metode yang mencari beda kompresi pada gambar. Jokowi mengaku tak meneliti kesamaan ijazahnya dengan {FILE} yang beredar."),
        ("s5", "Refly lanjut: pernahkah ijazah fisik diperlihatkan ke terdakwa untuk dibuktikan? Jawabnya: tidak. Yang menuduh, katanya, yang harus membuktikan."),
        ("s6", f"Mei {Y25} Bareskrim menyatakan ijazahnya identik dengan tiga pembanding. Kertas, tinta, stempel, sampai tanda tangan diuji. Tapi Roy meragukannya, dan meminta uji independen, dengan alasan rezim kepolisian sudah berbeda."),
        ("s7", "Usai sidang, jawaban Jokowi lebih singkat: masa diuji-uji, sudah selesai. Masa mau diuji lagi, diuji mana lagi."),
        ("s8", "Perhatikan kata apabila. Dari berita yang kami baca, hakim belum memerintahkan uji ulang. Refly juga menduga ijazah di sidang berbeda dengan yang ditunjukkan di Polda Metro, Desember lalu, meski ia sendiri menyebut itu baru perasaan. Kubu Roy bilang akan terus meminta pengujian. Jadi pertanyaan berikutnya: apa sikap hakim?"),
    ],
    "EP04_SIDANG_MEMANAS": [
        ("s1", "Saksinya mantan presiden. Tapi yang ditegur hakim bukan cuma satu pihak."),
        ("s2", "Pertama, Jokowi. Saat menjawab jaksa, ia menyebut Roy Suryo bukan peneliti. Peneliti etikanya tidak seperti ini, katanya. Hakim memotong: mohon dijawab saja pertanyaannya."),
        ("s3", "Lalu giliran kubu Roy bertanya. Refly Harun menanyakan tindakan mana yang dianggap fitnah. Jokowi mengutip ucapan Roy di video April {2025.|dua ribu dua puluh lima.} Hakim menilai itu sudah dijawab. Refly meminta jaksa jangan mengganggu."),
        ("s4", "Jaksa keberatan: bicara lewat majelis. Suara naik. Refly meminta jaksa itu dikeluarkan saja. Jaksa balik meminta hakim memperingatkan nadanya."),
        ("s5", "Hakim memutuskan: skors. Suara jangan ditinggikan. Pelan saja, santai. Setelah reda, sidang dibuka lagi, dan tiap tim diminta menjaga anggotanya."),
        ("s6", "Momen lain, soal pasal. Jaksa memotong: saksi tak bisa dipaksa mengingat pasal. Refly berteriak: kami tidak pernah memotong. Hakim menegur: jangan pakai telunjuk, itu tidak sopan. Mau lanjut atau keluar? Unsur pasal, kata hakim, jangan ditanyakan ke saksi."),
        ("s7", "Di luar, ratusan pendukung bertahan sampai petang. Sidang Roy berjalan dari pukul sembilan pagi sampai setengah lima sore. Di akhir, hakim mencatat Roy menolak keterangan Jokowi."),
        ("s8", "Lalu pemandangan yang berbeda: Jokowi menyalami tim pengacara Roy, lalu bersalaman dengan Roy sendiri. Panasnya reda sebentar, perkaranya belum. Hakim belum memutus, dan Roy belum bisa disebut bersalah."),
    ],
}
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}|(\S+)")
SYL, LEAD, GAP, HOLD = 0.158, 0.1, 0.16, 3.0
syl = lambda w: max(1, len(re.findall(r"[aiueoAIUEO]+", w)))
OUT = Path("motion/src/scenes/ijazah/tl")
OUT.mkdir(parents=True, exist_ok=True)
for name, lines in EPS.items():
    d = Path(name)
    for sub in ("AUDIO", "SUBTITLES", "PROJECT/qc"):
        (d / sub).mkdir(parents=True, exist_ok=True)
    (d / "script-lines.json").write_text(json.dumps([{"id": a, "text": b} for a, b in lines], ensure_ascii=False, indent=1), encoding="utf8")
    t, scenes, words, spoken = LEAD, [], [], 0
    for sid, text in lines:
        start = t
        for a, b, c in TOK.findall(text):
            disp, sp = (a.split(), b.split()) if b else ([c], [c])
            spoken += len(sp)
            dur = sum(syl(x) for x in sp) * SYL
            total = sum(len(x) for x in disp)
            pos = t
            for x in disp:
                e = pos + dur * len(x) / total
                words.append({"text": x, "start": round(pos, 3), "end": round(e, 3), "scene": sid})
                pos = e
            t += dur
            last = sp[-1][-1]
            t += .3 if last in ".?!:" else .14 if last == "," else .025
        scenes.append({"id": sid, "start": round(start, 3), "end": round(t, 3)})
        t += GAP
    speech = round(t - GAP, 3)
    tl = {"duration": round(speech + HOLD, 2), "speech_end": speech, "estimated": True, "scenes": scenes, "words": words}
    (d / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=0), encoding="utf8")
    shutil.copy(d / "timeline.json", OUT / f"{name[:4].lower()}.json")
    print(name, "speech", speech, "film", tl["duration"], "spoken", spoken, "wpm", round(spoken / speech * 60))
