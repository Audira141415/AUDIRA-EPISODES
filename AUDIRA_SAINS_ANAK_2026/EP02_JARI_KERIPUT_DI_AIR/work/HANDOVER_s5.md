# EP02 Jari Keriput — handover s5 → s6 (2026-11-24)

Episode: F:/AUDIRA-EPISODES/AUDIRA_SAINS_ANAK_2026/EP02_JARI_KERIPUT_DI_AIR

## Selesai di s5
- Docs tahap 4 NANOFORGE: style/STYLE_DECISION.md, docs/ART_DIRECTION.md, docs/STORYBOARD.md, docs/ASSET_MANIFEST.md, docs/SCRIPT.md & SHOTLIST.md (baris Style: NANOFORGE; kolom objek shotlist diperbarui, timing tetap). style/cover-reference.png = nanoforge.png.
- project/src/episodes/jari/parts.tsx DITULIS ULANG (NANOFORGE). Export: SKIN, FAT, NERVE, BLOOD, CYAN, drift(t,ph,amp), NanoEnv({t,warm,vesicles}) (fog + 220 solut + 4 CellularVesicle kit), NanoLights({warm,ruby}), Water({t,y,radius,warm}), LabSign({position,width,rotation}), H2O({position,rotation,scale,opacity}), Ion({position,kind:'na'|'cl',scale}), membraneSkin(), Fingertip({wrinkle,nerve,broken,opacity,seed,ghost,vessel,t}), SkinCells({t,swell,reject}), NerveFibres({t,on,cut}), TissueSection({t,signal,narrow,deflate,fold}), SkinPatch({wrinkle,hair,glow,t}), WetRoad, Spray, Bowl, MatchRing. DIHAPUS: Lab, Plinth, SkinSlab, Drops (JariFilm.tsx masih mengimpor ini → belum typecheck).

## Belum
1. Tulis ulang JariFilm.tsx (masih ANATOMIX): import NANO_PALETTE dari ../../kits/nanoforge/lib/palette; FilmScene background N.microscopyVoid, profile COLOR_PROFILES.CINEMA_TEAL_ORANGE, exposure 1, envIntensity 0.55, ao true, hdri studio, fadeColor void; ganti KeyLight/ambient dengan <NanoLights warm/>; tiap scene pakai <NanoEnv t warm/>. Hand(): material kaca MeshPhysical #9be7ff transmission .75 ior 1.33 clearcoat 1 emissive cyan lemah (bukan skin). Subtitle activeColor N.thymineCyan.
   Rencana World per waktu (CUTS 0,9.2,16.4,31.3,42.1,54.9,70.8,79.4; SUBCUTS 3.42,19.5,62,76.9):
   - 0–3.42 hand kaca turun ke Water (push-in); 3.42–9.2 Fingertip wrinkle seg(3.6,7.6), nerve seg(6,7), + H2O memantul di sekitar pad.
   - 9.2–16.4 SkinCells swell=seg(9.6,13)*(1-seg(13.95,14.8)), reject=seg(13.95,14.6).
   - 16.4–19.5 NerveFibres on=seg(16.6,17.4) cut=seg(17.4,18.2); 19.5–31.3 dua Fingertip (kiri wrinkle seg(25,28.4) nerve; kanan broken t>=22.4) + LabSign.
   - 31.3–42.1 TissueSection (signal 31.4–32.2, narrow 33.6–35.6, deflate 36.5–38.6, fold 38.5–41).
   - 42.1–49 SkinPatch wrinkle naik + hujan H2O; salt 46.3+: Ion na/cl berjatuhan, H2O melambat; 49–54.9 dua SkinPatch: kiri hair (mulus), kanan glabrous wrinkle 1 glow.
   - 54.9–62 tire GLB (material karet clearcoat hitam roughness .3) + WetRoad + Spray; 62–70.8 Bowl x2 + marbles GLB + Fingertip wrinkle 1 melayang di atas (ganti Hand).
   - 70.8–76.9 Fingertip + ghost + MatchRing (seperti lama); 76.9–79.4 mikroskop GLB material chrome (#e2e8f0 metal .92 rough .18) + Fingertip + LabSign di dasar.
   - 79.4–88 Hand kaca + Water warm, NanoEnv warm, pull-back.
   Kamera cameraAt lama bisa dipakai ulang (pose sama), sesuaikan s2 sub 16.4–19.5 (serabut saraf tinggi 5.4: pos [0,0.5,8.5]).
2. Hud.tsx: ganti import ANATOMY_PALETTE → NANO_PALETTE (P.holo → N.thymineCyan), latar kartu rgba(2,5,15,0.82). Kartu "HANYA KULIT TANPA RAMBUT" tetap. Satu kartu besar per beat.
3. `npx tsc --noEmit`, lalu `npm run draft -- JariPreview --frames=2s,6s,14s,18s,25s,36s,48s,58s,66s,74s,78s,82s`, isi ulang draft/THEME_CHECK.md (subjek baru!), record_score self, juri buta (F:/AUDIRA-SKILL-MOTION/qa/jury.md, cover nanoforge). Maks 2 putaran.
4. Cover topik: render frame hook (mis. 6s) 1080×1920 → style/cover-topic.png (npm run cover / stills JariFinal).
5. Gerbang tahap 9: SendUserFile contact sheet, skor juri, durasi 88 s, G18c 13.0 LU. JANGAN render final tanpa acc.
