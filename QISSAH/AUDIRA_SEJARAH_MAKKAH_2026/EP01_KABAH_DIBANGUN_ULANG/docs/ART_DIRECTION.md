# Art Direction — SEJARAH MAKKAH · EP01 (TIMEFORGE)

## Idea
"One object through its eras." TIMEFORGE normally morphs a hand-held product. Here, the object is shown as the same parametric study model (`KabahModel` in `core.tsx`). It changes length, height, doors, roof and dress across the eras, on a bright museum-like stage. The Ka'bah of today stays whole and dignified at the centre. Every historical change happens on a separate study model at an era station.

## Look
- **Stage:** a warm pearl cyclorama (#ece3d4 / fog #e8dfcf) with an endless floor fading into fog. There is never a set edge, which matters in 16:9.
- **Floors and stations:** a white marble mataf with concentric hairlines, a travertine era ring with brass rails and tick marks, and round travertine plinths with a brass rim for each station.
- **Lighting:** a warm key that follows the camera target (for contact shadows at every station), hemisphere fill, and a cool rim. The rig is `<Finish>` with the warmStudio HDRI, envIntensity 0.5, exposure 0.87 and the DOCUMENTARY_WARM grade.
- **Light by chapter:** night in c03 (lamps), amber haze in the sieges, a cool dim light in the Qaramithah chapter, and grey storm light in c08.
- **Palette:** black kiswah, gold (#c9a046 / door #e4bf68), brass (#b8903f), sandstone (#b8a68c family), granite greys for 1631, and cyan (#3fb8c9) only for routes and the flood line.

## Materials
- **Kiswah:** real draped geometry. Each face is a plane whose folds deepen toward the hem, vanish at the corners and are pulled tight under the gold band. It carries a woven damask lattice map and bump with a sheen layer, and the hem is tied to brass rings on the shadharwan (the Stage A weak spot, now fixed).
- **Gold band:** an embossed cartouche texture (ornament, no imitation script) with clearcoat and bump. The door has two gold leaves on a deep-gold frame.
- **Study models:** dry-stone courses built from instanced bevelled blocks with varied tone, buildable course by course. They have roof planks, ground or raised doors, bricked infill, brass belts and soot tint.
- **Close-up detail:**
  - hump foundation stones;
  - the ship wreck with planks and a mast;
  - the cloth with a stone and tribal banners;
  - a curtain on poles;
  - a map table (parchment texture, coastlines, graticule, city labels);
  - a reading desk with a rihal, an open book and a flickering oil lamp, in front of a book niche wall;
  - marble plan tablets;
  - the Kufah colonnade with arches, a sack and a letter;
  - coin stacks;
  - a flood tank with floating lamps and books;
  - a glass study model with pillars, a double roof, a stair room and ten marble inscriptions.

## Typography (Manrope, bundled)
- **Chapter card:** "BAB N · year" in gold caps, letter-spaced, with the title in 58 px semibold.
- **Callouts:** a cream card with a brass hairline and 40 px titles; quotes are italic.
- **Captions:** 16:9 at 40 px, 1–2 lines on a dark translucent band. 9:16 karaoke at 64 px, active word gold, scale ≤ 1.04, word gap 0.42 em.

## Depiction rules (applied)
- No prophet, angel, figure, hand or shadow anywhere. People appear only as cream points (the tawaf crowd).
- Today's Ka'bah is never shown damaged. The empty Hajar Aswad niche in c07 is a dark disc inside the intact silver frame.
- Collapse appears only on study models, as stones laid out on plan.
- Controversies (Ibn Zubair vs Al-Hajjaj, the Qaramithah raid, the ransom) are stated neutrally with the research hedges; nothing is graphic.
- AUDIRA appears once in the 3D world, on the brass plaque on the era ring. It never appears on the Ka'bah or on Quranic text.
