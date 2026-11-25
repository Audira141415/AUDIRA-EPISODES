# Script to process EP11-EP20: generate script-lines.json, update storyboards & captions, and add QA reports
import pathlib, re, json, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]

_A = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"]

def _say(x):
    if x < 12: return _A[x]
    if x < 20: return _A[x - 10] + " belas"
    if x < 100: return _A[x // 10] + " puluh " + _say(x % 10)
    if x < 200: return "seratus " + _say(x - 100)
    if x < 1000: return _A[x // 100] + " ratus " + _say(x % 100)
    if x < 2000: return "seribu " + _say(x - 1000)
    return _A[x // 1000] + " ribu " + _say(x % 1000)

def say_year(y):
    return _say(int(y)).replace("  ", " ").strip()

PHON = {
    "Ballon d'Or": "Balon Dor",
    "Liga Champions": "Liga Cempions",
    "AC Milan": "A Ce Milan",
    "AUDIRA": "Audira",
    "San Siro": "San Siro",
    "Arrigo Sacchi": "Arrigo Saki",
    "Sacchi": "Saki",
    "Van Basten": "Fan Basten",
    "Ruud Gullit": "Rud Qulit",
    "Gullit": "Qulit",
    "Rijkaard": "Raikaard",
    "Frank Rijkaard": "Frank Raikaard",
    "Fabio Capello": "Fabio Kapelo",
    "Capello": "Kapelo",
    "Carlo Ancelotti": "Karlo Anceloti",
    "Ancelotti": "Anceloti",
    "Paolo Maldini": "Paolo Maldini",
    "Maldini": "Maldini",
    "Andrea Pirlo": "Andrea Pirlo",
    "Pirlo": "Pirlo",
    "Kaka": "Kaka",
    "Filippo Inzaghi": "Filipo Inzagi",
    "Inzaghi": "Inzagi",
    "FC Barcelona": "Ef Se Barselona",
    "Barcelona": "Barselona",
    "Joan Gamper": "Zoan Gamper",
    "Camp Nou": "Kam Nou",
    "Johan Cruyff": "Yohan Kroif",
    "Cruyff": "Kroif",
    "La Masia": "La Masiya",
    "Pep Guardiola": "Pep Gwardiola",
    "Guardiola": "Gwardiola",
    "Lionel Messi": "Lionel Mesi",
    "Messi": "Mesi",
    "Xavi": "Savi",
    "Iniesta": "Iniesta",
    "tiki-taka": "tiki-taka",
    "sextuple": "sekstupel",
    "Manchester United": "Mancester Yunaitid",
    "Busby Babes": "Basbi Beibs",
    "Matt Busby": "Met Basbi",
    "Bobby Charlton": "Bobi Carl-ton",
    "Charlton": "Carl-ton",
    "George Best": "Jorj Best",
    "Alex Ferguson": "Aleks Fergasen",
    "Teddy Sheringham": "Tedi Syeringem",
    "Ole Gunnar Solskjaer": "Ole Gunar Solser",
    "Solskjaer": "Solser",
    "treble": "trebel",
    "Liverpool": "Liverpul",
    "Bill Shankly": "Bil Syenkli",
    "Shankly": "Syenkli",
    "Bob Paisley": "Bob Peisli",
    "Paisley": "Peisli",
    "The Boot Room": "De But Rum",
    "Anfield": "Anfild",
    "Istanbul": "Istanbul",
    "Steven Gerrard": "Stiven Jerard",
    "Gerrard": "Jerard",
    "Vladimir Smicer": "Vladimir Smitser",
    "Smicer": "Smitser",
    "Xabi Alonso": "Sabi Alonso",
    "Jerzy Dudek": "Yerzi Dudek",
    "Juventus": "Yuventus",
    "Turin": "Turin",
    "La Vecchia Signora": "La Vekia Sinyora",
    "Bianconeri": "Biankoneri",
    "Michel Platini": "Misiel Platini",
    "Platini": "Platini",
    "Alessandro Del Piero": "Alesandro Del Piero",
    "Del Piero": "Del Piero",
    "Gianluigi Buffon": "Janluiji Bufen",
    "Calciopoli": "Kalciopoli",
    "Scudetto": "Skudeto",
    "Bayern Munich": "Baiern Myunsen",
    "Bayern München": "Baiern Myunsen",
    "Bayern": "Baiern",
    "Franz John": "Frans Yon",
    "Mia san Mia": "Mia san Mia",
    "Franz Beckenbauer": "Frans Bekenbauer",
    "Beckenbauer": "Bekenbauer",
    "Gerd Müller": "Gerd Myuler",
    "Müller": "Myuler",
    "Sepp Maier": "Sep Mayer",
    "Uli Hoeness": "Uli Henes",
    "Karl-Heinz Rummenigge": "Karl-Hains Rumenige",
    "Jupp Heynckes": "Yup Hainkes",
    "Hansi Flick": "Hansi Flik",
    "Ajax Amsterdam": "Ayaks Amsterdam",
    "Ajax": "Ayaks",
    "Rinus Michels": "Rinus Mikels",
    "Total Football": "Total Futbol",
    "De Toekomst": "De Tukomst",
    "Louis van Gaal": "Lui fan Hal",
    "Clarence Seedorf": "Klerens Sidorwf",
    "Patrick Kluivert": "Patrik Kloivert",
    "Edgar Davids": "Edgar Davits",
    "Boca Juniors": "Boka Yuniyors",
    "La Bombonera": "La Bombonera",
    "Xeneizes": "Senaises",
    "Diego Armando Maradona": "Diego Armando Maradona",
    "Maradona": "Maradona",
    "Superclásico": "Superklasiko",
    "River Plate": "River Pleit",
    "Juan Román Riquelme": "Huan Roman Rikelme",
    "Riquelme": "Rikelme",
    "Carlos Bianchi": "Karlos Bianki",
    "Santos FC": "Santos Ef Se",
    "Santos": "Santos",
    "Pelé": "Pele",
    "Vila Belmiro": "Vila Belmiro",
    "Os Santásticos": "Os Santastikos",
    "Copa Libertadores": "Kopa Libertadores",
    "Piala Interkontinental": "Piala Interkontinental",
    "Eusébio": "Eusebio",
    "Benfica": "Benfika",
    "Nigeria": "Nigeria",
    "Celtic FC": "Seltik Ef Se",
    "Celtic": "Seltik",
    "The Lisbon Lions": "De Lisbon Layons",
    "Lisbon Lions": "Lisbon Layons",
    "Jock Stein": "Jok Stein",
    "Billy McNeill": "Bili Maknil",
    "Tommy Gemmell": "Tomi Gemel",
    "Stevie Chalmers": "Stivi Calmers",
    "Estádio Nacional": "Estadio Nasional",
    "Inter Milan": "Inter Milan",
    "Helenio Herrera": "Elenio Erera",
    "Catenaccio": "Katenacio"
}

TOKEN_END = r"([.,:;?!]*)"

def markup(text):
    out = text
    for d, s in sorted(PHON.items(), key=lambda kv: -len(kv[0])):
        out = re.sub(r"(?<![{|\w])" + re.escape(d) + TOKEN_END + r"(?![^{]*\})",
                     lambda m, d=d, s=s: "{%s%s|%s%s}" % (d, m.group(1), s, m.group(1)), out)
    out = re.sub(r"(?<![{|\w])(1[89]\d\d|20\d\d)" + TOKEN_END + r"(?![^{]*\})",
                 lambda m: "{%s%s|%s%s}" % (m.group(1), m.group(2), say_year(m.group(1)), m.group(2)), out)
    return out

# Process script-lines.json for all EP11-EP20
for i in range(11, 21):
    ep_prefix = f"EP{i:02d}"
    matches = list(ROOT.glob(f"{ep_prefix}*"))
    if not matches:
        continue
    ep_dir = matches[0]
    script_path = ep_dir / "docs" / "SCRIPT.md"
    text = script_path.read_text(encoding="utf-8")
    
    # Handle EP17-EP20 with markup sections or regular sections
    m_markup = re.search(r"## Markup lengkap \(untuk write-lines\)\r?\n([\s\S]+)$", text)
    if m_markup and i >= 17:
        raw_lines = [line.strip() for line in m_markup.group(1).strip().splitlines() if line.strip()]
        lines = []
        for l in raw_lines:
            clean = re.sub(r"^\d+\.\s*", "", l).strip()
            if clean:
                lines.append(clean)
        if len(lines) == 6:
            out = [{"id": IDS[idx], "text": lines[idx]} for idx in range(6)]
            target_json = ep_dir / "docs" / "script-lines.json"
            target_json.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
            print(f"{ep_prefix}: generated script-lines.json from Markup section ({len(out)} lines)")
            continue

    # Otherwise parse sections
    sections = re.findall(r"#{2,3}\s+(?:Hook|Context|Main Development|Explanation|Visual Payoff|Outro)[^\r\n]*\r?\n([^\r\n#]+)", text, re.IGNORECASE)
    if len(sections) == 6:
        out = []
        for idx, p in enumerate(sections):
            clean_p = p.strip()
            clean_p = re.sub(r"<sub>.*?</sub>", "", clean_p, flags=re.DOTALL).strip()
            out.append({"id": IDS[idx], "text": markup(clean_p)})
        target_json = ep_dir / "docs" / "script-lines.json"
        target_json.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{ep_prefix}: generated script-lines.json via regex markup ({len(out)} lines)")
    else:
        print(f"{ep_prefix}: Failed to parse 6 sections! Found: {len(sections)}")

