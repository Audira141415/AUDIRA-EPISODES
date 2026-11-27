# Asset Candidates — Cara Kerja Trafo Tiang Listrik di Depan Rumah

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya tiang listrik, rumah, lampu jalan, dan kabinet gardu. Tidak ada GLB trafo tiang, kumparan/inti trafo, sekring cut-out, atau penangkap petir: itu dibuat procedural/2D (cutaway).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Halaman rumah, tiang listrik dengan tangki trafo, HUD 20.000 V → 230 V | `two-storey-family-house-c63c4a` / building, `utility-pole-574130` / prop, `timber-utility-pole-a93693` / prop | Tangki trafo procedural (silinder/kotak bersirip) dipasang di tiang; tanpa logo/pelat merek |
| c01_intro | Kabel atas dilacak ke gardu; perbandingan tegangan tinggi vs rendah | `utility-pole-574130` / prop, `telegraph-pole-line-95e382` / prop, `utility-substation-cabinet-1c903b` / prop | Rugi panas kabel = shader merah; HUD "JTM 20 kV" |
| c02 | Cutaway tangki: inti laminasi, dua gulungan kawat | — | Tidak ada GLB; inti dari tumpukan pelat + tabung gulungan procedural, atau cutaway 2D |
| c03 | Arus bolak-balik, medan magnet berdenyut di inti | — | Panah arus + garis medan (overlay 2D/shader, bukan partikel sebagai visual utama); HUD "50 Hz" |
| c04 | Rasio lilitan, voltmeter 20.000 → 400 → 230 | `townhouse-row-unit-b9544b` / building | Voltmeter & diagram fasa–netral 2D; label "hitungan sendiri" |
| c05 | Minyak mengisi tangki, panas ke sirip; deret ukuran kVA | — | Cairan + sirip procedural; deret tangki kecil–besar sebagai infografis |
| c06 | Sekring putus, penangkap petir menyalurkan petir ke tanah | `utility-pole-574130` / prop, `street-lamp-29f365` / prop | Sekring/arrester procedural; ikon lucide Zap, ShieldCheck |
| c07_payoff | Lampu rumah menyala, kampung menyala, panel keselamatan, outro | `two-storey-family-house-c63c4a` / building, `townhouse-row-unit-b9544b` / building, `street-lamp-136745` / prop | Panel larangan memanjat + "PLN Mobile / 123" teks saja, tanpa logo; outro card `audira-outro-card.svg` |

Saran engine: hybrid — lingkungan 3D (rumah, tiang, kampung) tersedia di katalog, tetapi isi trafo (inti, gulungan, medan magnet, minyak) tidak ada sebagai GLB dan lebih jelas sebagai cutaway; bila harus satu engine, 2D (CIRCUITFORGE/BONGKAR) lebih aman, atau 3D INNERWORKS dengan trafo dimodel procedural.
