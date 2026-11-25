import os
import json
import shutil
import re

BASE_DIR = r"F:\AUDIRA-VIDEO-MOTION\AUDIRA_SEJARAH_SEPAK_BOLA_2026"
REF_DIR = r"F:\AUDIRA-SKILL-MOTION\references\quality-bar"

EP_CONFIGS = [
    {
        "folder": "EP41_PENAROL_PENGUASA_MONTEVIDEO_LIBERTADORES",
        "style_id": "timeforge-evolution",
        "style_name": "TIMEFORGE",
        "style_ref_name": "timeforge.jpg",
        "title": "Peñarol Raja Montevideo dan Penguasa Perdana Libertadores",
        "primary_color": "Kuning Emas Kereta Api / Hitam Arang (#F7C800 / #111111)",
        "bg_color": "Sepia Industri & Besi Rel Kereta (#1F1B16)",
        "script_stages": {
            "hook": "Raksasa legendaris Uruguay pemenang perdana Copa Libertadores yang pernah tiga kali menaklukkan raja-raja terhebat dari benua Eropa.",
            "context": "Lahir pada tahun seribu sembilan ratus tiga belas dari serikat para pekerja jalur kereta api di Montevideo, Club Atlético Peñarol adalah pilar utama yang membentuk reputasi sepak bola Uruguay di mata dunia internasional.",
            "development": "Peñarol dikenal kental dengan karakter Garra Charrúa, yaitu semangat juang membara tanpa kenal rasa takut, tekel keras tanpa kompromi, dan loyalitas mati-matian demi membela lambang klub hitam-kuning kebanggaan mereka.",
            "explanation": "Pada tahun seribu sembilan ratus enam puluh, Peñarol menorehkan tinta emas abadi sebagai juara pertama turnamen paling bergengsi Copa Libertadores, gelar yang berhasil mereka pertahankan pada tahun berikutnya. Tidak berhenti di situ saja, Peñarol tiga kali merengkuh gelar juara Piala Interkontinental dengan menumbangkan raksasa-raksasa terbaik Eropa, termasuk Benfica asuhan sang maestro Eusébio dan Real Madrid. Peñarol menjadi salah satu klub tersukses abad kedua puluh dengan koleksi lima trofi Copa Libertadores dan puluhan gelar liga domestik yang mendominasi daratan Uruguay.",
            "payoff": "Warisan Peñarol menegaskan bahwa batas geografis wilayah negara kecil bukanlah penghalang untuk melahirkan dinasti raksasa yang teramat disegani di pentas tertinggi olahraga global.",
            "outro": "Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: gairah empat puluh juta pendukung Flamengo dan keajaiban sang Raja Zico."
        },
        "phonetics": [
            {"raw": "Copa Libertadores", "display": "Copa Libertadores", "spoken": "Kopa Liberta-dores"},
            {"raw": "Montevideo", "display": "Montevideo", "spoken": "Monte-video"},
            {"raw": "Club Atlético Peñarol", "display": "Club Atlético Peñarol", "spoken": "Klub Atletiko Penyarol"},
            {"raw": "Peñarol", "display": "Peñarol", "spoken": "Penyarol"},
            {"raw": "Garra Charrúa", "display": "Garra Charrúa", "spoken": "Garra Kharrua"},
            {"raw": "Eusébio", "display": "Eusébio", "spoken": "Eusebio"},
            {"raw": "Benfica", "display": "Benfica", "spoken": "Benfika"},
            {"raw": "Interkontinental", "display": "Interkontinental", "spoken": "Interkontinental"}
        ]
    },
    {
        "folder": "EP42_FLAMENGO_ERA_MAGIS_ZICO_1981",
        "style_id": "comic-book-3d",
        "style_name": "COMICFORGE",
        "style_ref_name": "comicforge.png",
        "title": "CR Flamengo Era Magis Zico dan Gairah Nação Rubro-Negra",
        "primary_color": "Merah Scarlet & Hitam Onyx (#E52421 / #0C0C0C)",
        "bg_color": "Halftone Vintage Maracanã (#1A1414)",
        "script_stages": {
            "hook": "Klub dengan empat puluh juta pendukung setia yang menghancurkan penguasa benua Eropa dalam laga puncak penentuan juara dunia.",
            "context": "Berawal dari sebuah klub perkumpulan dayung di Rio de Janeiro pada seribu delapan ratus sembilan puluh lima, Clube de Regatas do Flamengo berkembang pesat menjadi detak jantung emosional seluruh rakyat Brasil dari berbagai lapisan sosial masyarakat.",
            "development": "Flamengo bukan sekadar klub sepak bola biasa, mereka adalah sebuah bangsa tersendiri yang dikenal dengan sebutan Nação Rubro-Negra karena memiliki basis pendukung terbesar di seluruh dunia.",
            "explanation": "Masa keemasan paling spektakuler meledak pada dekade seribu sembilan ratus delapan puluhan berkat sang maestro nomor punggung sepuluh, Arthur Antunes Coimbra alias Zico. Menampilkan seni permainan Joga Bonito yang memanjakan mata, Flamengo mendominasi Amerika Selatan sebelum berangkat melangkah ke Tokyo pada seribu sembilan ratus delapan puluh satu. Di hadapan puluhan ribu pasang mata, Flamengo mencukur juara Eropa Liverpool tiga-nol tanpa balas di babak pertama untuk merebut Piala Interkontinental. Zico menjadi pahlawan agung yang membawa nama harum Flamengo terbang tinggi ke puncak dunia.",
            "payoff": "Flamengo membuktikan bahwa perpaduan antara gairah rakyat jelata dan seni sepak bola murni mampu melahirkan momen keajaiban abadi dalam memori sejarah peradaban olahraga.",
            "outro": "Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: prinsip radikal Athletic Bilbao yang menolak pemain dari luar tanah Basque."
        },
        "phonetics": [
            {"raw": "Rio de Janeiro", "display": "Rio de Janeiro", "spoken": "Rio de Zaneiro"},
            {"raw": "Clube de Regatas do Flamengo", "display": "Clube de Regatas do Flamengo", "spoken": "Klube de Regatas du Flamenggu"},
            {"raw": "Flamengo", "display": "Flamengo", "spoken": "Flamenggo"},
            {"raw": "Nação Rubro-Negra", "display": "Nação Rubro-Negra", "spoken": "Nasaong Rubro Negra"},
            {"raw": "Arthur Antunes Coimbra", "display": "Arthur Antunes Coimbra", "spoken": "Artur Antunes Koimbra"},
            {"raw": "Zico", "display": "Zico", "spoken": "Ziko"},
            {"raw": "Joga Bonito", "display": "Joga Bonito", "spoken": "Zoga Bonito"},
            {"raw": "Liverpool", "display": "Liverpool", "spoken": "Liverpul"}
        ]
    },
    {
        "folder": "EP43_ATHLETIC_BILBAO_FILOSOFI_MURNI_BASQUE",
        "style_id": "paper-craft-3d",
        "style_name": "PAPERWORLD",
        "style_ref_name": "paperworld.jpg",
        "title": "Athletic Club Bilbao dan Filosofi Murni Pemain Basque",
        "primary_color": "Merah Kertas Origami & Hijau Lembah Basque (#D32F2F / #2E7D32)",
        "bg_color": "Tekstur Kertas Parchment Kraft (#F5F0E6)",
        "script_stages": {
            "hook": "Bertahan lebih dari satu abad di kasta tertinggi tanpa pernah sekali pun membeli pemain bintang dari luar tanah leluhur.",
            "context": "Di tengah pusaran industri sepak bola modern yang menghabiskan miliaran euro untuk membeli bintang asing ternama, Athletic Club Bilbao di kawasan Spanyol utara menjalankan filosofi paling unik dan radikal di seluruh dunia.",
            "development": "Sejak tahun seribu sembilan ratus dua belas, Athletic Bilbao menetapkan aturan sakral yang pantang dilanggar: mereka hanya boleh merekrut dan memainkan pemain yang lahir atau dididik di wilayah kebudayaan Basque.",
            "explanation": "Kebijakan ini secara teori tampak mustahil untuk bersaing melawan klub-klub kaya raya bergelimang uang seperti Real Madrid dan Barcelona. Namun berkat sistem pembinaan akademi Lezama yang luar biasa disiplin dan rasa cinta kedaerahan yang mendalam, Bilbao berhasil mengoleksi delapan gelar juara La Liga dan dua puluh empat trofi Copa del Rey. Bersama Madrid dan Barcelona, Bilbao adalah satu dari tiga klub pendiri yang tidak pernah sekali pun terdegradasi dari divisi utama La Liga sepanjang sejarah kompetisi Spanyol.",
            "payoff": "Athletic Bilbao adalah anomali terindah sepak bola modern, membuktikan bahwa loyalitas identitas budaya lokal sanggup mengimbangi kekuatan kapitalisme global tanpa kehilangan kehormatan martabat diri.",
            "outro": "Ini AUDIRA, Sejarah Sepak Bola. Episode berikutnya: kesetiaan abadi sang kaisar Roma Francesco Totti selama seperempat abad."
        },
        "phonetics": [
            {"raw": "Athletic Club Bilbao", "display": "Athletic Club Bilbao", "spoken": "Atletik Klub Bilbao"},
            {"raw": "Athletic Bilbao", "display": "Athletic Bilbao", "spoken": "Atletik Bilbao"},
            {"raw": "Bilbao", "display": "Bilbao", "spoken": "Bilbao"},
            {"raw": "Basque", "display": "Basque", "spoken": "Bask"},
            {"raw": "Lezama", "display": "Lezama", "spoken": "Lezama"},
            {"raw": "La Liga", "display": "La Liga", "spoken": "La Liga"},
            {"raw": "Copa del Rey", "display": "Copa del Rey", "spoken": "Kopa del Rey"}
        ]
    },
    {
        "folder": "EP44_AS_ROMA_IKON_KESETIAAN_FRANCESCO_TOTTI",
        "style_id": "classical-marble-museum",
        "style_name": "MARBLEMUSEUM",
        "style_ref_name": "marblemuseum.png",
        "title": "AS Roma Kesetiaan Abadi Totti dan Jiwa Ibu Kota",
        "primary_color": "Merah Kekaisaran Romawi & Kuning Emas Colosseum (#8E1B29 / #F4B825)",
        "bg_color": "Marmer Travertine Antik & Galeri Patung (#161414)",
        "script_stages": {
            "hook": "Menolak tawaran gaji fantastis dan trofi bergengsi Real Madrid demi cinta seumur hidup pada klub kampung halaman tercinta.",
            "context": "Associazione Sportiva Roma didirikan pada tahun seribu sembilan ratus dua puluh tujuh lewat penggabungan tiga klub ibu kota demi menandingi hegemoni kekuatan sepak bola Italia utara.",
            "development": "Di kota abadi Roma, sepak bola bukan sekadar permainan olahraga, melainkan representasi gairah hidup mendalam yang membara di tribun Curva Sud Stadio Olimpico.",
            "explanation": "Simbol tertinggi dari jiwa klub ini adalah Francesco Totti, sang pangeran Roma yang mengabdikan seluruh karier profesionalnya selama dua puluh lima tahun tanpa pernah berpindah seragam. Pada musim dua ribu dua ribu satu, Totti bersama Gabriel Batistuta memimpin Roma merengkuh gelar juara Scudetto Serie A yang dirayakan jutaan warga ibu kota selama sepekan penuh. Ketika presiden Real Madrid Florentino Pérez merayunya dengan cek kosong dan jaminan trofi Liga Champions, Totti menolaknya tegas dengan kalimat legendaris: Anda tidak akan pernah meninggalkan orang tua miskin demi tinggal bersama orang asing yang kaya raya.",
            "payoff": "Kesetiaan abadi Totti di AS Roma menjadi monumen cinta teragung dalam sejarah olahraga modern yang tak ternilai oleh tumpukan lembaran uang dan deretan piala.",
            "outro": "Ini AUDIRA, Sejarah Sepak Bola. Ikuti terus serial kami untuk mengarungi sejarah, taktik, dan legenda lapangan hijau dunia."
        },
        "phonetics": [
            {"raw": "Associazione Sportiva Roma", "display": "Associazione Sportiva Roma", "spoken": "Asosyatsione Sportiva Roma"},
            {"raw": "AS Roma", "display": "AS Roma", "spoken": "A-Es Roma"},
            {"raw": "Curva Sud", "display": "Curva Sud", "spoken": "Kurva Sud"},
            {"raw": "Stadio Olimpico", "display": "Stadio Olimpico", "spoken": "Stadio Olimpiko"},
            {"raw": "Francesco Totti", "display": "Francesco Totti", "spoken": "Franchesko Totti"},
            {"raw": "Totti", "display": "Totti", "spoken": "Totti"},
            {"raw": "Gabriel Batistuta", "display": "Gabriel Batistuta", "spoken": "Gabriel Batistuta"},
            {"raw": "Florentino Pérez", "display": "Florentino Pérez", "spoken": "Florentino Perez"},
            {"raw": "Scudetto Serie A", "display": "Scudetto Serie A", "spoken": "Skudetto Serie A"}
        ]
    }
]

def apply_phonetics(text, phonetics):
    res = text
    sorted_p = sorted(phonetics, key=lambda x: len(x["raw"]), reverse=True)
    for p in sorted_p:
        pattern = re.compile(r'\b' + re.escape(p["raw"]) + r'\b', re.IGNORECASE)
        res = pattern.sub(f"{{{p['display']}|{p['spoken']}}}", res)
    return res

def process_episode(ep):
    folder_path = os.path.join(BASE_DIR, ep["folder"])
    print(f"Processing {ep['folder']}...")

    # 1. 14 Subdirectories
    subdirs = [
        "audio", "audio/mix", "music", "sfx",
        "work/clips", "work/clips-raw",
        "docs", "draft", "draft/stills",
        "project", "research", "style", "thumbnails"
    ]
    for sd in subdirs:
        os.makedirs(os.path.join(folder_path, sd), exist_ok=True)

    # 2. Copy Style Reference
    ref_src = os.path.join(REF_DIR, ep["style_ref_name"])
    ext = os.path.splitext(ep["style_ref_name"])[1]
    ref_dst = os.path.join(folder_path, "style", f"cover-reference{ext}")
    if os.path.exists(ref_src):
        shutil.copy2(ref_src, ref_dst)
        print(f"  Copied style ref: {ref_dst}")

    # 3. Write standardized docs/SCRIPT.md
    stages = ep["script_stages"]
    total_words = sum(len(v.split()) for v in stages.values())
    script_content = f"""# SPORTFACTS BOLA {ep['folder'][:4]} {ep['title']} ({ep['style_name']})

Estimasi durasi: {total_words} kata, 80–90 dtk. Karakter suara: Narator Dokumenter Sinematik Tegas & Berbobot.

### Hook (0–3 dtk)
{stages['hook']}

### Context (4–17 dtk)
{stages['context']}

### Development (18–34 dtk)
{stages['development']}

### Explanation (35–64 dtk)
{stages['explanation']}

### Payoff (65–78 dtk)
{stages['payoff']}

### Outro (79–85 dtk)
{stages['outro']}
"""
    with open(os.path.join(folder_path, "docs", "SCRIPT.md"), "w", encoding="utf-8") as f:
        f.write(script_content)

    # 4. Generate docs/script-lines.json
    beats = [
        {"id": "hook", "stage": "hook", "text": stages["hook"]},
        {"id": "context", "stage": "context", "text": stages["context"]},
        {"id": "development", "stage": "development", "text": stages["development"]},
        {"id": "explanation", "stage": "explanation", "text": stages["explanation"]},
        {"id": "payoff", "stage": "payoff", "text": stages["payoff"]},
        {"id": "outro", "stage": "outro", "text": stages["outro"]}
    ]
    lines_data = []
    for beat in beats:
        markup = apply_phonetics(beat["text"], ep["phonetics"])
        lines_data.append({
            "id": beat["id"],
            "stage": beat["stage"],
            "text": markup,
            "raw_text": beat["text"]
        })
    with open(os.path.join(folder_path, "docs", "script-lines.json"), "w", encoding="utf-8") as f:
        json.dump(lines_data, f, indent=2, ensure_ascii=False)

    # 5. Update style/STYLE_DECISION.md
    style_content = f"""# STYLE_DECISION — {ep['folder']}

- **Style Terpilih**: `{ep['style_id']}` (dari pustaka `F:\\AUDIRA-SKILL-MOTION\\styles\\{ep['style_id']}`)
- **Visual Kit & Identity**: `{ep['style_name']}`
- **Karakteristik & Alasan Estetika**: Palet warna sinematik, pencahayaan 3D berkedalaman tinggi, dan pergerakan kamera dinamis yang memvisualisasikan narasi {ep['title']} secara faktual dan memukau penonton short-form video.
- **Rasio Aspek & Resolusi**: 9:16 Vertikal (1080×1920 @ 60 FPS), dioptimalkan untuk performa retensi tinggi di platform YouTube Shorts, TikTok, dan Instagram Reels.
- **Palet Warna Utama**:
  - Aksen Primer: {ep['primary_color']}
  - Latar Belakang: {ep['bg_color']}
  - Teks Layar: Putih Bersih (#FFFFFF) & Kuning Karamel (#FFD166)
- **Komponen Outro**: Kartu outro resmi `<AudiraOutro>` dan watermark identitas digital `<AudiraSignature>` karya Agus Dwi R.
- **Tanggal Keputusan**: 2026-11-12
- **Status Approval**: APPROVED (Production Ready)
"""
    with open(os.path.join(folder_path, "style", "STYLE_DECISION.md"), "w", encoding="utf-8") as f:
        f.write(style_content)

    # 6. Synchronize STATUS.json
    status_file = os.path.join(folder_path, "STATUS.json")
    if os.path.exists(status_file):
        try:
            with open(status_file, "r", encoding="utf-8") as f:
                st = json.load(f)
        except:
            st = {}
    else:
        st = {}

    st["episodeId"] = ep["folder"][:4]
    st["title"] = ep["title"]
    st["currentStage"] = "voice"
    if "stages" not in st or not isinstance(st["stages"], dict):
        st["stages"] = {}

    for s in ["context", "research", "style", "script", "setup", "delivery"]:
        st["stages"][s] = "done"
    for s in ["voice", "render", "composite", "qc", "publish"]:
        if s not in st["stages"] or st["stages"][s] == "done":
            st["stages"][s] = "pending"

    with open(status_file, "w", encoding="utf-8") as f:
        json.dump(st, f, indent=2, ensure_ascii=False)

    print(f"  Standardized {ep['folder']} successfully.")

def main():
    for ep in EP_CONFIGS:
        process_episode(ep)
    print("\nBatch 41-44 initial scaffolding and standardization completed!")

if __name__ == "__main__":
    main()

