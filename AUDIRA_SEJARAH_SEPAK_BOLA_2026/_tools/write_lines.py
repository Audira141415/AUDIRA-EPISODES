"""Write <EP>/docs/script-lines.json ({display|spoken} markup) from the approved scripts in scripts_batch1.py.
Display = subtitle text (normal spelling). Spoken = what Cartesia reads: years as words, foreign names and
AUDIRA spelled phonetically. Trailing punctuation goes inside both sides so vo.py's matcher sees Cartesia tokens.
Run from the series folder: python -X utf8 _tools/write_lines.py"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import importlib  # noqa: E402
# batch module: python -X utf8 _tools/write_lines.py [scripts_batch2]  (default scripts_batch1)
S = importlib.import_module(sys.argv[1] if len(sys.argv) > 1 else "scripts_batch1")

IDS = ["hook", "konteks", "pengembangan", "penjelasan", "payoff", "outro"]

# display phrase -> spoken phrase (longest first). Names Cartesia (Galang, id) misreads.
PHON = {
    "Ballon d'Or": "Balon Dor",
    "Eintracht Frankfurt": "Aintrakh Frankfurt",
    "Johor Darul Ta'zim": "Johor Darul Takzim",
    "Lincoln Red Imps": "Linkoln Red Imps",
    "Liga Champions": "Liga Cempions",
    "Jules Rimet": "Jul Rime",
    "Di Stéfano": "Di Stefano",
    "AC Milan": "A Ce Milan",
    "AUDIRA": "Audira",
    "Maracanã": "Marakana",
    "Garrincha": "Garinsya",
    "Guinness": "Ginnes",
    "Pickles": "Pikels",
    "Puskás": "Puskas",
    "Wembley": "Wembli",
    "Linfield": "Linfild",
    "Celtic": "Seltik",
    "Rangers": "Renjers",
    "Glasgow": "Glasgo",
    "Bayern": "Baiern",
    "Pelé": "Pele",
    "Freemasons' Tavern": "Frimeisons Tavern",
    "The Football Association": "De Futbol Asosiesyen",
    "Ebenezer Morley": "Ebenezer Morli",
    "Blackheath": "Blekhit",
    "Cambridge": "Kembrij",
    "Barnes": "Barns",
    "Eton": "Iton",
    "Montevideo": "Montevideo",
    "Conte Verde": "Konte Verde",
    "Lucien Laurent": "Lusien Loran",
    "Centenario": "Sentenario",
    "Maracanazo": "Marakanaso",
    "Mineirazo": "Mineiraso",
    "Friaça": "Friasa",
    "Schiaffino": "Skiafino",
    "Ghiggia": "Gijia",
    "Frank Sinatra": "Frenk Sinatra",
    "Peter Shilton": "Piter Syilton",
    "Shilton": "Syilton",
    "Ali Bin Nasser": "Ali Bin Naser",
    "Lineker": "Lineker",
    "Azteca": "Asteka",
    "Falklands": "Folklens",
    "VAR": "Ve A Er",
    "Belo Horizonte": "Belo Orisonte",
    "Neymar": "Neimar",
    "Thiago Silva": "Tiago Silva",
    "Thomas Müller": "Tomas Myuler",
    "Miroslav Klose": "Miroslav Kloze",
    "Toni Kroos": "Toni Kros",
    "Sami Khedira": "Sami Kedira",
    "André Schürrle": "Andre Syurle",
    "Mario Götze": "Mario Getse",
    "PSG": "Pari Sen Jermen",
}
TOKEN_END = r"([.,:;?!]*)"


def say_year(y):
    return S._say(int(y)).replace("  ", " ").strip()


def markup(text):
    out = text
    for d, s in sorted(PHON.items(), key=lambda kv: -len(kv[0])):
        out = re.sub(r"(?<![{|\w])" + re.escape(d) + TOKEN_END + r"(?![^{]*\})",
                     lambda m, d=d, s=s: "{%s%s|%s%s}" % (d, m.group(1), s, m.group(1)), out)
    out = re.sub(r"(?<![{|\w])(1[89]\d\d|20\d\d)" + TOKEN_END + r"(?![^{]*\})",
                 lambda m: "{%s%s|%s%s}" % (m.group(1), m.group(2), say_year(m.group(1)).replace(" ", " "), m.group(2)), out)
    return out


for ep, (_title, _style, texts) in S.EPS.items():
    out = [{"id": i, "text": markup(t)} for i, t in zip(IDS, texts)]
    p = S.ROOT / ep / "docs" / "script-lines.json"
    p.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf8")
    print(ep, "lines", len(out))
