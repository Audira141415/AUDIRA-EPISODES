"""Research helper. ex.py rss <file> | grep <file> <regex> [context chars] | txt"""
import glob, html, io, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")


def text(f):
    t = open(f, encoding="utf8", errors="ignore").read()
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", t, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t))


cmd = sys.argv[1]
if cmd == "rss":
    for f in sys.argv[2:]:
        t = open(f, encoding="utf8", errors="ignore").read()
        print("==", f)
        for m in re.findall(r"<title>(.*?)</title>.*?<pubDate>(.*?)</pubDate>", t, re.S)[:25]:
            print(html.unescape(m[0])[:130], "|", m[1][5:16])
elif cmd == "grep":
    f, rx = sys.argv[2], sys.argv[3]
    ctx = int(sys.argv[4]) if len(sys.argv) > 4 else 160
    t = text(f)
    seen = 0
    last = -1000
    for m in re.finditer(rx, t, re.I):
        if m.start() - last < ctx:
            continue
        last = m.start()
        print("..." + t[max(0, m.start() - ctx): m.end() + ctx] + "...\n")
        seen += 1
        if seen > 12:
            break
elif cmd == "head":
    t = text(sys.argv[2])
    a = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    b = int(sys.argv[4]) if len(sys.argv) > 4 else 3000
    print(t[a:b])
