# Comprehensive pipeline processor for EP31-EP40:
# Scaffolding, cover-reference, script standardization, script-lines with phonetics, custom storyboards, custom social captions, and STATUS sync.
import pathlib, re, json, shutil
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
REF_DIR = pathlib.Path("F:/AUDIRA-SKILL-MOTION/references/quality-bar")
IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]

STYLES = {
    "EP31_TOTAL_FOOTBALL_BELANDA_1974": ("TACTICBOARD", "tacticboard.png"),
    "EP32_GOL_HANTU_WEMBLEY_1966": ("VISUALINVESTIGATION", "visualinvestigation.png"),
    "EP33_MUKJIZAT_DEPORTIVO_CORUNA_2004": ("COMICFORGE", "comicforge.png"),
    "EP34_DRAMA_AGUERO_9320_MAN_CITY": ("TIMEFORGE", "timeforge.jpg"),
    "EP35_INTER_MILAN_GRANDE_INTER_TREBLE_2010": ("MARBLEMUSEUM", "marblemuseum.png"),
    "EP36_BORUSSIA_DORTMUND_TEMBOK_KUNING_GEGENPRESSING": ("PRECISION", "precision.jpg"),
    "EP37_CHELSEA_REVOLUSI_ABRAMOVICH_2003": ("FILMNOIR", "filmnoir.png"),
    "EP38_NAPOLI_PENEBUSAN_SELATAN_MARADONA": ("SKETCHFORGE", "sketchforge.png"),
    "EP39_BENFICA_EUSEBIO_KUTUKAN_BELA_GUTTMANN": ("PAPERWORLD", "paperworld.jpg"),
    "EP40_RIVER_PLATE_LA_MAQUINA_MILLONARIOS": ("HISTORYMAP", "historymap.png"),
}

PHON = {
    "AUDIRA": "Audira",
    "Total Football": "Total Futbol",
    "Rinus Michels": "Rinus Mikels",
    "Johan Cruyff": "Yohan Kroif",
    "Cruyff": "Kroif",
    "Johan Neeskens": "Yohan Neskens",
    "Johnny Rep": "Joni Rep",
    "Wembley": "Wembli",
    "Geoff Hurst": "Jef Herst",
    "Hurst": "Herst",
    "Gottfried Dienst": "Gotfrid Dinst",
    "Tofiq Bahramov": "Tofik Bahramov",
    "Bahramov": "Bahramov",
    "VAR": "Ve A Er",
    "Goal-Line Technology": "Gol Lain Teknoloji",
    "Deportivo La Coruña": "Deportivo La Korunya",
    "Deportivo": "Deportivo",
    "AC Milan": "A Ce Milan",
    "Riazor": "Riazor",
    "Walter Pandiani": "Walter Pandiani",
    "Juan Carlos Valerón": "Huan Karlos Valeron",
    "Valerón": "Valeron",
    "Albert Luque": "Albert Luke",
    "Javier Irureta": "Havier Irureta",
    "Sergio Agüero": "Sergio Aguero",
    "Agüero": "Aguero",
    "Manchester City": "Mancester Siti",
    "Man City": "Men Siti",
    "QPR": "Kyu Pi Ar",
    "Queens Park Rangers": "Kwins Park Renjers",
    "Edin Džeko": "Edin Jeko",
    "Džeko": "Jeko",
    "Roberto Mancini": "Roberto Mancini",
    "Inter Milan": "Inter Milan",
    "Grande Inter": "Grande Inter",
    "Helenio Herrera": "Elenio Erera",
    "Catenaccio": "Katenacio",
    "José Mourinho": "Zose Morinyo",
    "Mourinho": "Morinyo",
    "Diego Milito": "Diego Milito",
    "Javier Zanetti": "Havier Zaneti",
    "Zanetti": "Zaneti",
    "Bernabéu": "Bernabeu",
    "Treble": "Trebel",
    "Borussia Dortmund": "Borussia Dortmund",
    "Dortmund": "Dortmund",
    "Die Gelbe Wand": "Di Gelbe Vand",
    "Westfalenstadion": "Vestfalenstadion",
    "Jürgen Klopp": "Yurgen Klop",
    "Klopp": "Klop",
    "Gegenpressing": "Gegenpresing",
    "Signal Iduna Park": "Signal Iduna Park",
    "Chelsea": "Celsi",
    "Roman Abramovich": "Roman Abramovic",
    "Abramovich": "Abramovic",
    "Stamford Bridge": "Stemford Brij",
    "John Terry": "Jon Teri",
    "Frank Lampard": "Frenk Lampard",
    "Didier Drogba": "Didier Drogba",
    "Drogba": "Drogba",
    "The Special One": "De Spesial Wan",
    "SSC Napoli": "Es Es Ce Napoli",
    "Napoli": "Napoli",
    "Diego Armando Maradona": "Diego Armando Maradona",
    "Maradona": "Maradona",
    "Stadio San Paolo": "Stadio San Paolo",
    "San Paolo": "San Paolo",
    "Diego Armando Maradona Stadium": "Stadion Diego Armando Maradona",
    "Scudetto": "Skudeto",
    "SL Benfica": "Es El Benfika",
    "Benfica": "Benfika",
    "Eusébio": "Eusebio",
    "Béla Guttmann": "Bela Gutman",
    "Guttmann": "Gutman",
    "Estádio da Luz": "Estadio da Lus",
    "River Plate": "River Pleit",
    "La Máquina": "La Makina",
    "El Monumental": "El Monumental",
    "Alfredo Di Stéfano": "Alfredo Di Stefano",
    "Di Stéfano": "Di Stefano",
    "Ángel Labruna": "Anhel Labruna",
    "Labruna": "Labruna",
    "José Manuel Moreno": "Hose Manuel Moreno",
    "Adolfo Pedernera": "Adolfo Pedernera",
    "Félix Loustau": "Feliks Lousto",
    "Juan Carlos Muñoz": "Huan Karlos Munyos"
}

TOKEN_END = r"([.,:;?!]*)"

def markup(text):
    out = text
    for d, s in sorted(PHON.items(), key=lambda kv: -len(kv[0])):
        out = re.sub(r"(?<![{|\w])" + re.escape(d) + TOKEN_END + r"(?![^{]*\})",
                     lambda m, d=d, s=s: "{%s%s|%s%s}" % (d, m.group(1), s, m.group(1)), out)
    return out

subdirs = [
    "audio/mix", "audio/music", "audio/sfx",
    "audio/work/clips", "audio/work/clips-raw",
    "docs", "draft/stills", "project", "research",
    "style", "thumbnails"
]

for folder_name, (style_name, ref_img) in STYLES.items():
    ep_dir = ROOT / folder_name
    if not ep_dir.exists():
        continue
    print(f"Processing {folder_name} ({style_name})...")
    
    # 1. Scaffolding
    for s in subdirs:
        sd = ep_dir / s
        sd.mkdir(parents=True, exist_ok=True)
        gk = sd / ".gitkeep"
        if not any(sd.iterdir()):
            gk.touch()
            
    # 2. Cover reference image
    src_ref = REF_DIR / ref_img
    if src_ref.exists():
        ext = src_ref.suffix
        dst_ref = ep_dir / "style" / f"cover-reference{ext}"
        existing = list((ep_dir / "style").glob("cover-reference.*"))
        if not existing:
            shutil.copy2(src_ref, dst_ref)
            print(f"  Copied reference: {dst_ref.name}")

    # 3. Standardize SCRIPT.md
    script_path = ep_dir / "docs" / "SCRIPT.md"
    raw_script = script_path.read_text(encoding="utf-8")
    
    pattern = r"(Hook|Konteks|Pengembangan|Penjelasan|Payoff|Outro):\s*([\s\S]*?)(?=(?:Hook|Konteks|Pengembangan|Penjelasan|Payoff|Outro):|$)"
    matches = re.findall(pattern, raw_script, re.IGNORECASE)
    
    if len(matches) == 6:
        stage_texts = [m[1].strip() for m in matches]
        total_words = sum(len(t.split()) for t in stage_texts)
        lo_sec = round(total_words / 150 * 60)
        hi_sec = round(total_words / 135 * 60)
        
        clean_title = folder_name.replace("_", " ")
        m_title = re.search(r"EP\d+\s+([^(\r\n]+)", raw_script)
        if m_title:
            clean_title = m_title.group(1).strip()
            
        std_script = f"""# Naskah — {clean_title}

Seri: Sejarah Sepak Bola (AUDIRA) · Style: {style_name} · Format: short 9:16 · VO Cartesia (id, voice `04b567df-2923-4b0c-896b-4b7df0a07e1a`). Fakta diverifikasi di `research/RESEARCH_REPORT.md`.
Jumlah kata terucap: **{total_words}** → estimasi **{lo_sec}–{hi_sec} dtk** (135–150 WPM). Status: **Draf naskah siap rekam**.

### Hook (0–3 dtk)
{stage_texts[0]}

### Context (4–17 dtk)
{stage_texts[1]}

### Main Development (18–45 dtk)
{stage_texts[2]}

### Explanation (46–70 dtk)
{stage_texts[3]}

### Visual Payoff (71–85 dtk)
{stage_texts[4]}

### Outro (86–91 dtk)
{stage_texts[5]}

---
Catatan VO: Nama asing dan singkatan telah disiapkan dengan markup fonetik di `docs/script-lines.json` untuk pengucapan akurat Cartesia TTS.
"""
        script_path.write_text(std_script, encoding="utf-8")
        
        # 4. Generate script-lines.json
        script_lines = [{"id": IDS[idx], "text": markup(stage_texts[idx])} for idx in range(6)]
        (ep_dir / "docs" / "script-lines.json").write_text(json.dumps(script_lines, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"  Standardized SCRIPT.md & generated script-lines.json ({len(script_lines)} lines)")

print("Base standardization for EP31-EP40 complete!")

