# STYLE DECISION — EP01 PENGGANTI GIBRAN WAPRES

**Tanggal:** 2026-11-21  
**approved:** yes  

---

## Style Terpilih

**BROADCASTFORGE** (Style #82)  
Engine: Remotion + R3F  

**Alasan:** Topik ini adalah breaking news politik — berita TV 3D virtual studio cocok untuk memberi kesan berita profesional yang otoritatif. Anchor desk, BREAKING NEWS lower third, dan ticker tape memperkuat urgency. Visual language-nya langsung terbaca penonton sebagai "berita resmi", bukan spekulasi media sosial.

---

## Alternatif yang Ditolak

| Style | Alasan ditolak |
|-------|---------------|
| SATELLITEBRIEFING | Pernah gagal untuk topik analisis kandidat wapres (jury 3.5). Risiko depth ceiling. |
| BONGKAR | Terlalu exposé/sensasi, kurang netral untuk konten fact-check |

---

## Parameter Finish

```json
{
  "finishProfile": "CYBER_NEON_VOID",
  "exposure": 1.0,
  "envIntensity": 0.45,
  "hdri": "studio",
  "ao": true,
  "background": "#070A0F"
}
```

---

## File Output

- `cover-reference.jpg` → F:/AUDIRA-ALL-SKILL/assets/style-covers/broadcastforge.jpg
- `cover-topic.png` → render setelah scaffold (tahap 5)
