# Art Direction — EP02 MAP VIRAL 90 HARI

**Style:** DATAPHYSICAL (kit `studio/src/kits/dataphysical`): museum-grade data sculptures in brushed aluminium, brass, walnut, teal acrylic and burnt orange.

**Idea:** the numbers are physical objects you can walk around. The blocky avatar is the visitor, and also the "median creator" who stands on a flat brass coin next to a tower worth US$65,7 juta. The bars of sculpture A are built to true scale against each other: 0.1826 world units per US$1 juta, so the top 10 bar is 12 units tall, the top 100 bar 1.97, the top 1.000 bar 0.26, and the median a flat coin.

## Palette

| Token | Hex | Use |
|---|---|---|
| studio greige | #141518 / #1E1F22 | Background, floor |
| walnut | #2A1B14 | Plinths, tray |
| machined aluminium | #C8CCD1 | Bars, cells, posts |
| brass | #D2B07A / plaques #C9A66C | Caps, rings, coins, engraved labels |
| focal orange | #D4521C / glow #FF6A1A | Hero bar, new-game cells, active caption word |
| teal acrylic | #9FD3D6 / glow #7FE0DC | Pegboard slab, columns, 83% cells |

## Light

- Warm gallery key spot (front-right) per station, with shadows.
- Cool rim (back-left), a warm halo on the wall behind each station, and a soft fill.
- Finish: APPLE_STUDIO_CLEAN, exposure 1, envIntensity 0.55, hdri studio, AO on. These are the style memory's best parameters.
- Depth of field focuses on the camera-to-target distance (aperture 0.0009).

## Materials

- Polish `RoundedBoxGeo` on every hero object.
- Seeded surface grain on metal (`useSurfaceGrain`).
- Clearcoat walnut.
- Toy-plastic avatar from `_shared/BlockAvatar`.

## Type

- Anton (bundled `public/fonts`) for headlines and engraved numbers.
- Space Grotesk for captions and sublines.
- Engraved plaques are canvas textures (dark ink with a light lower lip).

## Depth layers

| Layer | Content |
|---|---|
| BG | Gallery wall with halos, dim plinths |
| MG | Station sculptures |
| FG | Loose cubes, brass rule, tags near the lens |
| HUD | Brass rail |
| Captions | Karaoke plate |

## Brand

- AUDIRA is engraved on the brass plaque of the main plinth. It is visible in the hook, the payoff and the outro.
- The moving signature is on top.
- The outro card closes the film.
