# Batch 8 addendum (EP36–EP40)

Read these first, in order, and follow all of them: `_research/BRIEF_COMMON_B3.md`, `_research/BRIEF_COMMON_B4.md`, `_research/BRIEF_COMMON_B5.md`, `_research/BRIEF_COMMON_B6.md`. The newest finished reference implementations are EP26–EP30 (for example EP28_PERANG_COD_ISLANDIA and EP30_UTANG_HAITI).

- Facts for this batch are in `_research/FACTS_B8.md`, not `FACTS.md`. Every on-screen number must match it.
- Storyboard, palette, fonts and concept: `_tools/epdata8.py`.
- Another session is working on EP31–EP35 in the same root. Never read from or write to those folders.
- Your folder already has the libs in `PROJECT/HyperFrames_Remotion/assets/lib`, `AUDIO/sfx`, `script-lines.json` and an estimated `timeline.json`.

## Finishing per style
- **HISTORYMAP (EP36):** DOCUMENTARY_WARM look, exposure 1.0, envIntensity 0.55, no AO (from motion memory).
  - City and country labels must be 3D paper tags raised above the map, tilted to camera, with a cream halo. Never paint labels flat on the map where pins cover them.
  - Relief comes from seeded gaussian bumps. Periodic sin relief makes diagonal stripes that look like shadow acne.
  - Put hero props (archive folder, microphone, vote board) at the map edge, not on top of the city.
  - People are name cards and faceless silhouettes only. Never draw Lee Kuan Yew's face.
  - Flags: Singapore red over white with a white crescent and five stars; Malaysia 14 red/white stripes with a blue canton, yellow crescent and 14-point star.
- **Y2KCHROME (EP37):** no memory yet. Start with APPLE_STUDIO_CLEAN, exposure 0.9, envIntensity 1.0, AO on.
  - Chrome only reads as chrome when it reflects something. Use the RoomEnvironment plus a gradient sky texture, with high metalness and low roughness.
  - The aqua sky is a gradient CanvasTexture, never a flat white or cream `scene.background`.
  - Keep bloom tight, so chrome highlights do not blow out to white.
  - Company names (Twitch, GoDaddy, Verisign) appear as plain text only. No logos.
  - The atoll needs real sea: a coloured lagoon, a reef ring and a deep-blue ocean. Never a flat blue plane.
- **SULAMFORGE (EP38):** no memory yet. Start with DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.25, AO on.
  - Fabric needs a woven texture from a seeded canvas (warp and weft).
  - Stitches are raised geometry: dashed running-stitch threads that catch a low grazing key light.
  - The nesting (India inside Bangladesh inside India inside Bangladesh) must be readable at a glance. Use 4 nested patches in alternating thread colours with clear labels.
  - Indian flag: saffron, white and green with a navy 24-spoke wheel. Bangladesh flag: a red disc slightly left of centre on green.
- **FOODFORGE (EP39):** no memory yet. Start with DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.45, AO on.
  - Food must look edible, not plastic. Use a crumb or flake texture, sheen or clearcoat on glazes, sugar sparkle, and soft steam.
  - Use a macro feel: a shallow depth-of-field look and warm side light.
  - War props are made of food (chocolate ships, a layer-cake fortress). Show no injury; Santa Anna's leg is represented only by a single boot on a cushion.
  - Name cards only, no portraits.
- **VOXELVERSE (EP40):** no memory yet. Start with DOCUMENTARY_WARM, exposure 1.0, envIntensity 0.4, AO on.
  - Use InstancedMesh for the human chain (thousands of figures). Each figure has a separate head (skin tone) and a body in a different clothing colour; the arms reach to the neighbours.
  - Use a tilt-shift look and warm dusk light.
  - Flags: Estonia blue, black and white; Latvia carmine, white and carmine; Lithuania yellow, green and red.

## Known traps
- A white or cream `scene.background` renders grey under tone mapping. Use a gradient CanvasTexture instead.
- Flat props lying on the floor get foreshortened and cropped at 9:16. Raise them on a tilted board or desk.
- Counters must reach their value by the word anchor where the narrator says the number.
- Dark scenes go murky. Light the hero prop with a strong key and give silhouettes a rim light.
