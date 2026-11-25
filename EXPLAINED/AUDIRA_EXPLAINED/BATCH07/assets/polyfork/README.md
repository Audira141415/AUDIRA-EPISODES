# Polyfork Asset Bridge

Low-poly 3D model library adopted from [polyfork.dev](https://polyfork.dev).
3,289 models across 51 themed kits, all CC BY 4.0 (free commercial, no attribution required for GLB).

## Catalog

`catalog.json` — slim index (id, title, type, kit, triangle count).
Full catalog with thumbnails/URLs lives at `E:\ASET\ASSET-AUDIRA\catalog.json`.

### Asset Types

| Type | Count | Examples |
|------|-------|---------|
| prop | 2,093 | furniture, food, tools, signs, plants |
| building | 433 | houses, shops, factories, landmarks |
| character | 261 | people, workers, soldiers, fantasy |
| vehicle | 196 | cars, trucks, planes, boats |
| animal | 149 | pets, farm, wild, sea creatures |
| ultra | 86 | high-detail hero models |
| attachment | 48 | hats, tools held in hand |
| terrain | 21 | ground tiles, roads, paths |
| hand | 2 | gesture models |

### Kit Themes (51)

Airport, campground, castle, city, farm, hospital, medieval, pirate, space, stadium, underwater, etc.
Each kit is a coherent scene package (e.g. `airport-43b137` has terminal, planes, luggage, crew).

## Loading in R3F

```tsx
import { AssetModel } from "../core/assets/AssetModel";

// By Polyfork ID (CDN)
<AssetModel id="a-frame-cabin-6cb550" scale={0.5} />

// By local GLB path
<AssetModel src="/models/cabin.glb" scale={0.5} />
```

## Search

```ts
import { searchAssets } from "../core/assets/assetSearch";

// Find models by keyword
const jets = searchAssets("jet airplane");
// → [{id: "jet-airplane-abc123", title: "Jet Airplane", type: "vehicle", ...}]

// Filter by type
const animals = searchAssets("", { type: "animal" });

// Filter by kit
const airportKit = searchAssets("", { kit: "airport-43b137" });
```

## Sync

Update catalog from source:

```bash
npm run assets:sync
```

## Download Local Copies

For offline render or faster loading:

```powershell
cd E:\ASET\ASSET-AUDIRA
powershell -ExecutionPolicy Bypass -File download-assets.ps1 -Type vehicle -Limit 10
```

Downloaded GLBs go to `E:\ASET\ASSET-AUDIRA\downloads\glb\<type>\<id>.glb`.

## License

Index data: free to copy and build on.
GLB models: CC BY 4.0 (share with credit, commercial OK).
`.mjs` source and HD editions: no redistribution.
