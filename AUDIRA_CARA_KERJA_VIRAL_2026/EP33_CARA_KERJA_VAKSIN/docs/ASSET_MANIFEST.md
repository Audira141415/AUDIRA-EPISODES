# ASSET_MANIFEST — Cara Kerja Vaksin (EP33)

Style: NANOFORGE

| Aset | Sumber | Lisensi |
|---|---|---|
| Virus, Antibodi, Sel B / sel memori, Sel tubuh, mRNA, Vial, Suntikan, Medium (solut + vesikel), grid kekebalan kelompok | Geometri prosedural R3F di `project/src/scenes/vaksin/Vaksin3D.tsx` (bentuk biologis, bukan partikel abstrak) | Milik AUDIRA |
| Palet, gerak Brownian, denyut membran, noise | Kit NANOFORGE `project/src/kits/nanoforge/` (AUDIRA-SKILL-MOTION) | Milik AUDIRA |
| Finish (HDRI studio, AO, tone mapping), kamera `shotPlan`, Subtitle | Starter AUDIRA-SKILL-MOTION `project/src/core/` | Milik AUDIRA |
| Font | `core/type/fonts.ts` starter (lokal) | SIL OFL |
| VO | Cartesia sonic, voice 04b567df (Galang), `audio/vo.wav` | Lisensi Cartesia akun AUDIRA |
| SFX | Prosedural, `F:/AUDIRA-2D-SKILL-MOTION/tools/ep/sfx_ep33.py` → `audio/sfx.wav` (−20 LUFS) | Milik AUDIRA |
| Outro + tanda tangan | `project/src/brand/AudiraOutro.tsx`, `AudiraSignature.tsx` | Milik AUDIRA |

Catatan: tidak ada GLB katalog yang cocok untuk skala molekul (virus/antibodi), jadi model dibangun prosedural dengan bentuk biologis nyata (kapsid + spike, antibodi Y, sel bermembran berinti).
