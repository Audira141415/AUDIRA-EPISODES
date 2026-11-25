# Batch 6 addendum (EP26–EP30)

Read these first, in order, and follow all of them: `_research/BRIEF_COMMON_B3.md`, `_research/BRIEF_COMMON_B4.md`, `_research/BRIEF_COMMON_B5.md`. The newest finished reference implementations are EP21–EP25 (for example EP24_NEPAL_BENDERA and EP25_BANGKOK_NAMA_PANJANG).

Your episode folder already contains the three.js and post-processing libraries in `PROJECT/HyperFrames_Remotion/assets/lib`.

## Finishing per style (from motion memory)
- **TERRARIUM (EP26):** DOCUMENTARY_WARM look, exposure 1.0, envIntensity 0.55, AO on.
  - The glass jar needs real transmission or refraction and visible rim highlights, so it reads as glass.
  - Moss, water and the island must be rich and detailed, never a flat green blob.
  - The country switch must read clearly: Spain red and yellow, France blue, white and red.
- **SCALEFORGE (EP27):** APPLE_STUDIO_CLEAN look, exposure 1.0, envIntensity 0.55, no AO.
  - Sand needs real texture.
  - The 1899 line (red) and the 1902 line (blue) must always be distinguishable.
  - Size comparisons must be honest. Halaib is about 10 times larger than Bir Tawil.
- **TACTICBOARD (EP28):** APPLE_STUDIO_CLEAN look, exposure 1.0, envIntensity 0.55, AO on.
  - Bevelled board edges (radius about 0.04), and materials that vary by roughness.
  - Ships are tactical pieces (pucks or simplified hulls), not real replicas.
  - Zone rings grow at 4, 12, 50 and 200 nautical miles.
- **STAINEDGLASS (EP29):** no memory yet. Start with DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.3.
  - Light must actually pass through coloured glass: emissive or transmissive panes, dark lead cames, and light shafts on a stone floor.
  - No holy figures and no faces. Use geometric and floral patterns, plus simple symbols for the four evangelists (for example an eagle, an angel, a lion and an ox as simple shapes, or initials).
- **MARBLEMUSEUM (EP30):** APPLE_STUDIO_CLEAN look, exposure 0.82, envIntensity 0.35, AO on.
  - Bevelled plinths and frames, a stone material with veins, warm museum spotlights.
  - The topic is serious (slavery and colonial debt): no violence, no chains in close-up, no portraits.
  - The tone stays calm and dignified. The numbers are the story.

## Known traps
- A white or cream `scene.background` renders grey under tone mapping. Use a gradient CanvasTexture instead.
- Noir and dark scenes go murky. Light the hero prop with a strong key and give silhouettes a rim light.
- Flat props lying on the floor get foreshortened and cropped at 9:16. Raise them on a tilted board or desk.
- Counters must reach their value by the word anchor where the narrator says the number.
