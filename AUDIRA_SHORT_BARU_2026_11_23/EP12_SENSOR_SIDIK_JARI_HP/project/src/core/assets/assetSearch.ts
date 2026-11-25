/**
 * Search Polyfork catalog by keyword, type, or kit.
 * Catalog is loaded once and cached. Works at build time (Node) and in browser.
 */

export interface AssetEntry {
  id: string;
  title: string;
  type: string;
  kit: string;
  tri: number;
}

export interface AssetKit {
  id: string;
  title: string;
  parts: number;
  complete: boolean;
}

interface SlimCatalog {
  source: string;
  license: string;
  cdn: string;
  localRoot?: string;
  synced: string;
  kits: AssetKit[];
  assets: AssetEntry[];
}

let _catalog: SlimCatalog | null = null;

function getCatalog(): SlimCatalog {
  if (!_catalog) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _catalog = require("../../../../assets/polyfork/catalog.json") as SlimCatalog;
  }
  return _catalog;
}

export interface SearchOptions {
  type?: string;
  kit?: string;
  maxTri?: number;
  limit?: number;
}

/** Search assets by keyword match on title + type. Returns best matches first. */
export function searchAssets(query: string, opts: SearchOptions = {}): AssetEntry[] {
  const catalog = getCatalog();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  let results = catalog.assets;

  if (opts.type) {
    results = results.filter((a) => a.type === opts.type);
  }
  if (opts.kit) {
    results = results.filter((a) => a.kit === opts.kit);
  }
  if (opts.maxTri !== undefined) {
    const maxTri = opts.maxTri;
    results = results.filter((a) => a.tri <= maxTri);
  }

  if (terms.length > 0) {
    const scored = results.map((a) => {
      const haystack = `${a.title} ${a.type} ${a.kit}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (haystack.includes(t)) score++;
      }
      return { asset: a, score };
    });
    results = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.asset.tri - b.asset.tri)
      .map((s) => s.asset);
  }

  return results.slice(0, opts.limit ?? 50);
}

/** Search kits by keyword. */
export function searchKits(query: string): AssetKit[] {
  const catalog = getCatalog();
  const q = query.toLowerCase();
  if (!q) return catalog.kits;
  return catalog.kits.filter((k) => k.title.toLowerCase().includes(q) || k.id.includes(q));
}

/** Get all assets in a kit. */
export function getKitAssets(kitId: string): AssetEntry[] {
  return getCatalog().assets.filter((a) => a.kit === kitId);
}

/** Get URL for a Polyfork asset. Prefers local path when available. */
export function cdnUrl(assetId: string, assetType?: string): string {
  const c = getCatalog();
  if (c.localRoot && assetType) {
    const local = `${c.localRoot}/${assetType}/${assetId}.glb`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      if (require("fs").existsSync(local)) return local;
    } catch {}
  }
  return `${c.cdn}${assetId}.glb`;
}

/** Get catalog stats. */
export function catalogStats(): { assets: number; kits: number; synced: string; localRoot?: string } {
  const c = getCatalog();
  return { assets: c.assets.length, kits: c.kits.length, synced: c.synced, localRoot: c.localRoot };
}
