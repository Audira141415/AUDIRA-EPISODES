"""Fetch source articles into plain text files under txt/."""
import html, os, re, urllib.request

URLS = {
    "cnn_lubang": "https://www.cnnindonesia.com/nasional/20261015140250-20-1415685/fenomena-lubang-api-bawah-tanah-di-palangkaraya-kalteng-ini-kata-bnpb",
    "viva_lubang": "https://www.viva.co.id/berita/nasional/1936451-viral-fenomena-lubang-api-di-kalteng-bnpb-ungkap-kenapa-karhutla-di-gambut-sulit-dipadamkan",
    "kompas_2019": "https://lestari.kompas.com/read/2026/11/04/155200886/karhutla-2026-lebih-parah-dari-2019-puncaknya-bulan-september-di-kalbar",
    "cnn_emisi": "https://www.cnnindonesia.com/teknologi/20261021133338-641-1417968/emisi-karhutla-ri-2026-catat-rekor-buruk-dalam-24-tahun-terakhir",
    "betahita_565": "https://www.betahita.id/berita/12596/kerugian-akibat-karhutla-2026-hingga-oktober-ditaksir-rp565-t",
    "katadata_565": "https://katadata.co.id/finansial/makro/6ae8849bc2297/kerugian-ekonomi-dan-biaya-kesehatan-akibat-karhutla-berpotensi-capai-rp-565-t",
    "suara_mendidih": "https://www.suara.com/news/2026/10/15/114004/viral-fenomena-aneh-tanah-gambut-mendidih-usai-disiram-air-saat-pemadaman-kebakaran-hutan",
    "antara_ombudsman": "https://www.antaranews.com/berita/5830875/ombudsman-investigasi-dampak-karhutla-bagi-pelayanan-publik-di-daerah",
    "bbc_prabowo": "https://www.bbc.com/indonesia/articles/cr1exgw4x2nwo",
    "bbc_korporasi": "https://www.bbc.com/indonesia/articles/cmgqwlyznw3po",
    "bbc_tn": "https://www.bbc.com/indonesia/articles/cr1ex97nvjppo",
    "bbc_ojol": "https://www.bbc.com/indonesia/articles/cmy0rl85yl99o",
    "bnpb_4nov": "https://www.bnpb.go.id/berita/perkembangan-situasi-dan-penanganan-bencana-di-tanah-air-4-november-2026",
    "kompas_202k": "https://www.kompas.com/tren/read/2026/10/15/161500465/karhutla-indonesia-capai-202.000-hektare-setara-6-kali-surabaya-dan-3-kali?page=all",
    "kemenhut_korporasi": "https://www.kehutanan.go.id/news/kemenhut-telusuri-pertanggungjawaban-karhutla-hingga-pemilik-manfaat-korporasi",
    "wiki_peat": "https://id.wikipedia.org/wiki/Gambut",
}
os.makedirs("txt", exist_ok=True)
for k, u in URLS.items():
    try:
        r = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130 Safari/537.36"})
        t = urllib.request.urlopen(r, timeout=25).read().decode("utf8", "ignore")
        t = re.sub(r"<(script|style|nav|footer)[^>]*>.*?</\1>", " ", t, flags=re.S)
        ps = re.findall(r"<p[^>]*>(.*?)</p>", t, re.S)
        body = "\n".join(re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", p))).strip() for p in ps)
        open(f"txt/{k}.txt", "w", encoding="utf8").write(body)
        print(k, len(body))
    except Exception as e:
        print(k, "ERR", e)
