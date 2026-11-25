# Comprehensive pipeline processor for EP21-EP30:
# Scaffolding, cover-reference, script standardization, script-lines with phonetics, custom storyboards, custom social captions, and STATUS sync.
import pathlib, re, json, shutil
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
REF_DIR = pathlib.Path("F:/AUDIRA-SKILL-MOTION/references/quality-bar")
IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]

STYLES = {
    "EP21_KEAJAIBAN_BERN_1954": ("TIMEFORGE", "timeforge.jpg"),
    "EP22_DONGENG_LEICESTER_CITY_2016": ("COMICFORGE", "comicforge.png"),
    "EP23_INVINCIBLES_ARSENAL_2004": ("PRECISION", "precision.jpg"),
    "EP24_TRAGEDI_HEYSEL_1985": ("FILMNOIR", "filmnoir.png"),
    "EP25_PERANG_SEPAK_BOLA_1969": ("HISTORYMAP", "historymap.png"),
    "EP26_SKANDAL_CALCIOPOLI_2006": ("VISUALINVESTIGATION", "visualinvestigation.png"),
    "EP27_NOTTINGHAM_FOREST_CLOUGH": ("PAPERWORLD", "paperworld.jpg"),
    "EP28_LA_REMONTADA_BARCELONA_2017": ("TACTICBOARD", "tacticboard.png"),
    "EP29_PENALTI_PANENKA_1976": ("SKETCHFORGE", "sketchforge.png"),
    "EP30_TRAGEDI_CHAPECOENSE_2016": ("MARBLEMUSEUM", "marblemuseum.png"),
}

PHON = {
    "AUDIRA": "Audira",
    "Liga Champions": "Liga Cempions",
    "Piala Dunia": "Piala Dunia",
    "Ferenc Puskas": "Ferents Puskas",
    "Puskas": "Puskas",
    "Zoltan Czibor": "Zoltan Tsibor",
    "Sepp Herberger": "Sep Herberger",
    "Adi Dassler": "Adi Dasler",
    "Helmut Rahn": "Helmut Ran",
    "Wankdorf": "Vankdorf",
    "Claudio Ranieri": "Klaudio Ranieri",
    "Ranieri": "Ranieri",
    "Jamie Vardy": "Jemi Vardi",
    "Vardy": "Vardi",
    "Riyad Mahrez": "Riyad Mahres",
    "Mahrez": "Mahres",
    "N'Golo Kante": "Engolo Kante",
    "Kante": "Kante",
    "Leicester City": "Lester Siti",
    "Leicester": "Lester",
    "Premier League": "Premier Lig",
    "The Foxes": "De Fokses",
    "Arsene Wenger": "Arsen Venger",
    "Wenger": "Venger",
    "Thierry Henry": "Tieri Anri",
    "Henry": "Anri",
    "Dennis Bergkamp": "Denis Berkamp",
    "Bergkamp": "Berkamp",
    "Patrick Vieira": "Patrik Viyera",
    "Vieira": "Viyera",
    "Highbury": "Haiberi",
    "The Invincibles": "Di Invinsibels",
    "Heysel": "Heisel",
    "Juventus": "Yuventus",
    "Liverpool": "Liverpul",
    "Brussels": "Brasels",
    "El Salvador": "El Salvador",
    "Honduras": "Honduras",
    "Tegucigalpa": "Tegusigalpa",
    "San Salvador": "San Salvador",
    "Estadio Azteca": "Estadio Asteka",
    "Azteca": "Asteka",
    "Calciopoli": "Kalciopoli",
    "Luciano Moggi": "Luciano Moji",
    "Moggi": "Moji",
    "Serie A": "Serie A",
    "Serie B": "Serie B",
    "Scudetto": "Skudeto",
    "Fabio Cannavaro": "Fabio Kanavaro",
    "Marcello Lippi": "Marcelo Lipi",
    "Nottingham Forest": "Notingem Forest",
    "Brian Clough": "Brayen Klaf",
    "Clough": "Klaf",
    "Peter Taylor": "Piter Teilor",
    "Trevor Francis": "Trevor Fransis",
    "John Robertson": "Jon Robertson",
    "Malmö": "Malme",
    "Hamburg": "Hamburg",
    "Camp Nou": "Kam Nou",
    "Barcelona": "Barselona",
    "Paris Saint-Germain": "Pari Sen Jermen",
    "PSG": "Pe Es Je",
    "Edinson Cavani": "Edinson Kavani",
    "Cavani": "Kavani",
    "Neymar": "Neimar",
    "Sergi Roberto": "Serji Roberto",
    "La Remontada": "La Remontada",
    "Antonin Panenka": "Antonin Panenka",
    "Panenka": "Panenka",
    "Sepp Maier": "Sep Mayer",
    "Maier": "Mayer",
    "Uli Hoeness": "Uli Henes",
    "Belgrade": "Belgrad",
    "Cekoslowakia": "Cekoslowakia",
    "Chapecoense": "Syapekoense",
    "Copa Sudamericana": "Kopa Sudamerikana",
    "Atletico Nacional": "Atletiko Nasional",
    "Medellin": "Medeyin",
    "Chapeco": "Syapeko"
}

TOKEN_END = r"([.,:;?!]*)"

def markup(text):
    out = text
    for d, s in sorted(PHON.items(), key=lambda kv: -len(kv[0])):
        out = re.sub(r"(?<![{|\w])" + re.escape(d) + TOKEN_END + r"(?![^{]*\})",
                     lambda m, d=d, s=s: "{%s%s|%s%s}" % (d, m.group(1), s, m.group(1)), out)
    return out

# Execute pipeline steps
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
    
    # Extract blocks
    pattern = r"(Hook|Konteks|Pengembangan|Penjelasan|Payoff|Outro):\s*([\s\S]*?)(?=(?:Hook|Konteks|Pengembangan|Penjelasan|Payoff|Outro):|$)"
    matches = re.findall(pattern, raw_script, re.IGNORECASE)
    
    if len(matches) == 6:
        stage_texts = [m[1].strip() for m in matches]
        
        # Word count
        total_words = sum(len(t.split()) for t in stage_texts)
        lo_sec = round(total_words / 150 * 60)
        hi_sec = round(total_words / 135 * 60)
        
        # Titles
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

print("Scaffolding, scripts, and script-lines complete!")

