/**
 * Topic → asset keyword mapping for automatic model selection.
 * When a scene describes a topic (e.g. "airport", "medieval battle"),
 * this maps it to search terms that find the right Polyfork models.
 */

interface TopicEntry {
  keywords: string[];
  types?: string[];
  kits?: string[];
}

const TOPIC_MAP: Record<string, TopicEntry> = {
  // Transportation
  airport: { keywords: ["airplane", "terminal", "luggage", "runway"], kits: ["airport"] },
  aviation: { keywords: ["airplane", "jet", "pilot", "cockpit"], types: ["vehicle"] },
  traffic: { keywords: ["car", "truck", "road", "traffic light"], types: ["vehicle", "prop"] },
  shipping: { keywords: ["ship", "cargo", "container", "port", "crane"], types: ["vehicle", "building"] },
  train: { keywords: ["train", "railway", "station", "locomotive"], types: ["vehicle", "building"] },

  // Military & conflict
  war: { keywords: ["soldier", "tank", "weapon", "military"], kits: ["military"] },
  medieval: { keywords: ["knight", "castle", "sword", "shield"], kits: ["castle", "medieval"] },
  battle: { keywords: ["soldier", "weapon", "armor", "fortress"], types: ["character", "building"] },

  // Nature & environment
  ocean: { keywords: ["fish", "coral", "submarine", "whale"], kits: ["underwater"] },
  farm: { keywords: ["cow", "chicken", "tractor", "barn"], kits: ["farm"] },
  forest: { keywords: ["tree", "deer", "cabin", "campfire"], kits: ["campground"] },
  space: { keywords: ["rocket", "astronaut", "satellite", "planet"], kits: ["space"] },
  mountain: { keywords: ["mountain", "rock", "tent", "hiker"], types: ["terrain", "prop"] },

  // Urban & civilization
  city: { keywords: ["building", "skyscraper", "street", "car"], kits: ["city"] },
  hospital: { keywords: ["doctor", "nurse", "ambulance", "bed"], kits: ["hospital"] },
  school: { keywords: ["desk", "book", "student", "teacher"], types: ["prop", "character"] },
  factory: { keywords: ["machine", "conveyor", "worker", "chimney"], types: ["building", "prop"] },
  restaurant: { keywords: ["food", "table", "chef", "plate"], types: ["prop", "character"] },

  // Sports & entertainment
  stadium: { keywords: ["stadium", "player", "ball", "goal"], kits: ["stadium"] },
  football: { keywords: ["player", "ball", "goal", "pitch"], kits: ["stadium"] },
  concert: { keywords: ["stage", "microphone", "speaker", "crowd"], types: ["prop", "character"] },

  // Economy & business
  market: { keywords: ["shop", "market", "stall", "money"], types: ["building", "prop"] },
  office: { keywords: ["desk", "computer", "chair", "building"], types: ["prop", "building"] },
  construction: { keywords: ["crane", "worker", "brick", "scaffold"], types: ["vehicle", "prop"] },

  // History
  pirate: { keywords: ["ship", "pirate", "treasure", "island"], kits: ["pirate"] },
  ancient: { keywords: ["temple", "column", "statue", "pyramid"], types: ["building", "prop"] },
  colonial: { keywords: ["ship", "fort", "cannon", "soldier"], types: ["vehicle", "building"] },

  // Science & tech
  laboratory: { keywords: ["flask", "microscope", "scientist", "table"], types: ["prop", "character"] },
  robot: { keywords: ["robot", "machine", "computer", "circuit"], types: ["character", "prop"] },
  energy: { keywords: ["windmill", "solar", "power", "turbine"], types: ["building", "prop"] },

  // Geology & natural disasters
  volcano: { keywords: ["lava", "rock", "obsidian", "mountain", "fire", "eruption"], kits: ["easter-island-rapa-nui-368e86", "dragons-lair-dark-dragon-782570", "prehistoric-valley-8638dc"] },
  gunung: { keywords: ["lava", "rock", "obsidian", "mountain", "fire", "eruption"], kits: ["easter-island-rapa-nui-368e86", "dragons-lair-dark-dragon-782570", "prehistoric-valley-8638dc"] },

  // Economy & finance
  economy: { keywords: ["gold", "coin", "money", "bank", "building", "skyscraper"], kits: ["loot-lode-kit-63191e", "casino-3dd029", "nyc-city-kit-fbca88"] },
  ekonomi: { keywords: ["gold", "coin", "money", "bank", "building", "skyscraper"], kits: ["loot-lode-kit-63191e", "casino-3dd029", "nyc-city-kit-fbca88"] },

  // Politics & government
  politics: { keywords: ["building", "podium", "flag", "statue", "column"], kits: ["nyc-city-kit-fbca88"], types: ["building"] },
  politik: { keywords: ["building", "podium", "flag", "statue", "column"], kits: ["nyc-city-kit-fbca88"], types: ["building"] },

  // Technology & gadgets
  technology: { keywords: ["computer", "smartphone", "screen", "server", "headphones", "circuit"], kits: ["3d-ui-kit-5635f7", "office-794453", "chrome-arcology-transit-kit-87a0e1"] },
  teknologi: { keywords: ["computer", "smartphone", "screen", "server", "headphones", "circuit"], kits: ["3d-ui-kit-5635f7", "office-794453", "chrome-arcology-transit-kit-87a0e1"] },

  // Music & performance
  music: { keywords: ["piano", "drum", "stage", "microphone", "music stand", "speaker"], kits: ["symphony-stagecraft-kit-bf2de0"] },
  musik: { keywords: ["piano", "drum", "stage", "microphone", "music stand", "speaker"], kits: ["symphony-stagecraft-kit-bf2de0"] },

  // Education
  education: { keywords: ["book", "desk", "student", "projection", "lecture", "campus"], kits: ["university-959b66"] },
  pendidikan: { keywords: ["book", "desk", "student", "projection", "lecture", "campus"], kits: ["university-959b66"] },

  // Science & research
  science: { keywords: ["flask", "microscope", "scientist", "hazard", "specimen", "lab"], kits: ["research-lab-9b9b5d"] },
  sains: { keywords: ["flask", "microscope", "scientist", "hazard", "specimen", "lab"], kits: ["research-lab-9b9b5d"] },

  // Beach & coast
  beach: { keywords: ["sand", "wave", "surfboard", "palm", "boardwalk", "lighthouse"], kits: ["coast-and-boardwalk-d883fd"] },
  pantai: { keywords: ["sand", "wave", "surfboard", "palm", "boardwalk", "lighthouse"], kits: ["coast-and-boardwalk-d883fd"] },

  // Racing & automotive
  racing: { keywords: ["car", "race", "tire", "barrel", "ramp"], kits: ["racing-cars-kit-660d53"] },
  balap: { keywords: ["car", "race", "tire", "barrel", "ramp"], kits: ["racing-cars-kit-660d53"] },

  // Japan
  japan: { keywords: ["torii", "samurai", "shrine", "pagoda", "bamboo"], kits: ["medieval-japan-cb01ad", "japanese-suburban-city-street-baa482"] },
  jepang: { keywords: ["torii", "samurai", "shrine", "pagoda", "bamboo"], kits: ["medieval-japan-cb01ad", "japanese-suburban-city-street-baa482"] },

  // Insect & micro world
  insect: { keywords: ["insect", "butterfly", "ant", "bee", "spider"], kits: ["insect-world-e44b9f"] },
  serangga: { keywords: ["insect", "butterfly", "ant", "bee", "spider"], kits: ["insect-world-e44b9f"] },

  // Futuristic & cyber
  futuristic: { keywords: ["neon", "hologram", "transit", "arcology", "pod"], kits: ["chrome-arcology-transit-kit-87a0e1", "space-base-kit-cf65de"] },
  cyber: { keywords: ["neon", "hologram", "transit", "arcology", "pod"], kits: ["chrome-arcology-transit-kit-87a0e1", "space-base-kit-cf65de"] },

  // Camping & outdoor
  camping: { keywords: ["tent", "campfire", "canoe", "fishing", "lake"], kits: ["campground-lake-ad32b0"] },
  kemah: { keywords: ["tent", "campfire", "canoe", "fishing", "lake"], kits: ["campground-lake-ad32b0"] },

  // Horror & halloween
  horror: { keywords: ["ghost", "pumpkin", "grave", "skeleton", "witch"], kits: ["halloween-night-46ade4", "dungeon-crypt-c27d93"] },
  horor: { keywords: ["ghost", "pumpkin", "grave", "skeleton", "witch"], kits: ["halloween-night-46ade4", "dungeon-crypt-c27d93"] },

  // Christmas & winter
  christmas: { keywords: ["tree", "gift", "snowman", "sleigh", "ornament"], kits: ["christmas-village-fbc27a", "alpine-and-snow-092f66"] },
  natal: { keywords: ["tree", "gift", "snowman", "sleigh", "ornament"], kits: ["christmas-village-fbc27a", "alpine-and-snow-092f66"] },

  // Prehistoric & dinosaur
  dinosaur: { keywords: ["dinosaur", "bone", "fossil", "cave", "primitive"], kits: ["prehistoric-valley-8638dc"] },
  dinosaurus: { keywords: ["dinosaur", "bone", "fossil", "cave", "primitive"], kits: ["prehistoric-valley-8638dc"] },

  // Gaming & UI
  gaming: { keywords: ["button", "joystick", "screen", "controller", "UI"], kits: ["3d-ui-kit-5635f7"] },

  // Gambling & casino
  casino: { keywords: ["slot", "poker", "roulette", "card", "chip", "dice"], kits: ["casino-3dd029"] },
};

export interface TopicSuggestion {
  keywords: string[];
  types: string[];
  kits: string[];
}

/** Map a video topic to asset search parameters. Matches partial topic names. */
export function mapTopic(topic: string): TopicSuggestion {
  const t = topic.toLowerCase();
  const merged: TopicSuggestion = { keywords: [], types: [], kits: [] };

  for (const [key, entry] of Object.entries(TOPIC_MAP)) {
    if (t.includes(key) || key.includes(t)) {
      merged.keywords.push(...entry.keywords);
      if (entry.types) merged.types.push(...entry.types);
      if (entry.kits) merged.kits.push(...entry.kits);
    }
  }

  // Deduplicate
  merged.keywords = [...new Set(merged.keywords)];
  merged.types = [...new Set(merged.types)];
  merged.kits = [...new Set(merged.kits)];

  // Fallback: use the topic words directly as keywords
  if (merged.keywords.length === 0) {
    merged.keywords = t.split(/\s+/).filter((w) => w.length > 2);
  }

  return merged;
}

/** Convenience: get topic suggestion then search assets in one call. */
export function findAssetsForTopic(topic: string, limit = 20): import("./assetSearch").AssetEntry[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { searchAssets, getKitAssets } = require("./assetSearch") as typeof import("./assetSearch");
  const suggestion = mapTopic(topic);
  const results: import("./assetSearch").AssetEntry[] = [];

  // First: kit-based matches (most coherent)
  for (const kitId of suggestion.kits) {
    const kitAssets = getKitAssets(kitId);
    for (const a of kitAssets) {
      if (!results.some((r) => r.id === a.id)) results.push(a);
    }
  }

  // Then: keyword search
  const keywordResults = searchAssets(suggestion.keywords.join(" "), {
    type: suggestion.types.length === 1 ? suggestion.types[0] : undefined,
    limit: limit * 2,
  });
  for (const a of keywordResults) {
    if (!results.some((r) => r.id === a.id)) results.push(a);
  }

  return results.slice(0, limit);
}
