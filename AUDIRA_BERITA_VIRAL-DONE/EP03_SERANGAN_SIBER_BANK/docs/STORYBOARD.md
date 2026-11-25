# STORYBOARD — EP03_SERANGAN_SIBER_BANK (CYBERFORGE)

Composition: `Ep03Preview` / `Ep03Final`, 85.575 s (VO 81.575 s + 4 s outro). The film is one continuous camera over the approved cover's threat table: the Indonesian archipelago as a hologram, a cyan hexagonal firewall dome, red attack packets, and a generic green bank hologram (no logos). Every cut and beat is tied to word times in `studio/src/scenes/ep03/timeline.json`. Code: `studio/src/scenes/ep03/Film.tsx` (timeline, camera, HUD, captions) and `world.tsx` (3D).

Layers in every shot: BG (CyberGrid floor, telemetry rings, rising data particles) · MG (table, islands, dome, bank, bars) · FG (attack packets, shards, transaction cube, team tokens) · HUD (HTML panels, top-left kicker from y 262, "ILUSTRASI" chip) · captions (karaoke, top at about 1290 px, cyan active word).

| Time (s) | Section | Visual | Camera | On-screen text | SFX |
|---|---|---|---|---|---|
| 0.0–5.6 | HOOK | Cover frame: red packets arrive from the sky and shatter on the firewall dome over the archipelago. The bank sits safe under it. The AUDIRA // THREAT DESK bezel plaque is visible. | Slow push-in from the cover pose | "2 JUTA / SERANGAN / HARI", kicker "LIVE · PETA SERANGAN SIBER", chip ILUSTRASI | impact 0.4 |
| 5.65–7.5 | HOOK | The bank hologram glows green and its vault dial turns | Crane down to a bank close-up | "BUKAN BANK JEBOL" (JEBOL struck through at "jebol") | whoosh 5.65 |
| 7.6–12.5 | KONTEKS | The map reads as a dashboard screenshot. Three "↗ DIBAGIKAN" chips pop at "dibagikan". | Crane up to near top-down | Window bar "PETA ANCAMAN · FORTIGUARD · REAL-TIME", "TANGKAPAN LAYAR · TAMPILAN ULANG" (text only, no logo) | whoosh 7.6 |
| 12.6–20.5 | KONTEKS | Bank glows again. Sector chips appear on each word. The counter climbs to 1,2. | Dolly down toward the bank | "SASARAN NOMOR 1", "BANK · KEUANGAN · ASURANSI", "> 1,2 JUTA / 24 JAM", "UPAYA SERANGAN · SEKTOR KEUANGAN" | ping 12.61, click 17.55 |
| 20.7–34.4 | PENGEMBANGAN | Dome and arcs fade. Three hologram bars (DATAPHYSICAL-like, flat-shaded with a wire facet) rise on the words "1,2", "2,1" and "7,3". Height is proportional to the value. | Pull back to a low wide shot, then a slow orbit left to right | Bar labels: "1,2 JUTA · SEKTOR KEUANGAN · PER SENIN MALAM", "2,1 JUTA · SELURUH INDONESIA · PER SELASA", "7,3 JUTA · HITUNGAN SEPEKAN" | whoosh 20.7, pop 23.51, pop 32.27 |
| 34.5–41.0 | PENGEMBANGAN | Same bars, all labelled | Orbit continues | "SEMUANYA BENAR ✓", chips "PERIODE BEDA" / "CAKUPAN BEDA", blinking "DASBOR BERUBAH SETIAP SAAT" | — |
| 41.1–46.3 | PENJELASAN | The dome returns. Packets hit and break on the firewall. A live log panel fills with "UPAYA · DIBLOKIR" rows. | Swing to a dome close-up (east side) | "UPAYA ✓ TERCATAT", chip ILUSTRASI | whoosh 41.2 |
| 46.3–50.2 | PENJELASAN | The dome flashes on "pembobolan" | Slow orbit | Card "BSSN · Badan Siber dan Sandi Negara · Juru bicara: Prabaswari" (bust silhouette, no face). "PEMBOBOLAN" is struck through. | glitch 48.97 |
| 50.3–56.0 | PENJELASAN | Packets keep breaking on the dome | Drift back toward the west | Card "ALFONS TANUJAYA · Pakar keamanan siber, Vaksincom". Quote card: "Upaya yang diblokir, bukan bank yang dibobol." | — |
| 56.0–59.6 | PENJELASAN | A near-flat line draws across a chart panel (no values) | Drift continues | "SETAHUN TERAKHIR · TIDAK ADA LONJAKAN BERARTI" | — |
| 59.7–66.5 | PAYOFF | The bank glows. An amber "OJK" text node links to the bank with a moving pulse. | Push in to the bank | "REGULATOR TIDAK SANTAI". Card "OJK · Dian Ediana Rae · Kepala Eksekutif Pengawas Perbankan". "KOORDINASI DENGAN TIM IT BANK · SEJAK JUMAT". | whoosh 59.7 |
| 66.6–69.3 | PAYOFF | An amber transaction cube slides to the bank. It turns red on "wajar", stops on "ditunda" and gets a scanning ring on "verifikasi". | Truck right to follow the cube | Stepper: "1 TRANSAKSI TIDAK WAJAR · 2 DITUNDA · 3 VERIFIKASI" | ping 67.42 |
| 69.3–73.7 | PAYOFF | A cyan "BSSN" text node appears. 151 hex tokens (3 rings: 40 + 51 + 60) pop in around the bank on "151". | Crane up to see the rings | "BSSN MENYIAGAKAN · 151 TIM · TANGGAP INSIDEN · PERBANKAN" | — |
| 73.8–81.6 | OUTRO | Back to the cover-like wide shot with the AUDIRA // THREAT DESK plaque in frame | Pull back to the cover pose | "BAGIAN KITA". Tip cards "JANGAN BAGIKAN · KODE OTP" (phone icon, slash) and "JANGAN PASANG APLIKASI · DARI TAUTAN ASING" (link icon, slash). Chip "SIMPAN · IKUTI AUDIRA". | whoosh 73.8 |
| 81.775–85.575 | OUTRO | Shared AUDIRA outro card (`_shared/Outro.tsx`) | — | Outro card | chime 81.775 |

Notes
- Screen numbers come only from the script: 2 juta, 1,2 juta, 24 jam, 2,1 juta, 7,3 juta, 151. Every number appears with its scope and period.
- No logos: OJK, BSSN and FortiGuard appear as plain text. People appear as name cards with a generic silhouette only, never a face.
- The AudiraSignature wrapper is applied in Root.tsx. It is not added here.
