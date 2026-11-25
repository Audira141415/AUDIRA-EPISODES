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
  // Aviation & Airports
  airport: { keywords: ["airplane", "terminal", "luggage", "runway", "pesawat", "bandara", "landasan"], kits: ["airport"] },
  aviation: { keywords: ["airplane", "jet", "pilot", "cockpit", "pesawat", "terbang", "pilot"], types: ["vehicle"] },
  pesawat: { keywords: ["airplane", "jet", "runway", "cockpit", "pesawat", "terbang", "aviasi"], kits: ["airport"], types: ["vehicle"] },
  bandara: { keywords: ["airplane", "terminal", "luggage", "runway", "bandara", "pesawat"], kits: ["airport"] },

  // Traffic & Vehicles
  traffic: { keywords: ["car", "truck", "road", "traffic light", "mobil", "jalan", "lampu lalu lintas"], types: ["vehicle", "prop"] },
  mobil: { keywords: ["car", "sports car", "coupe", "sedan", "tire", "mobil", "kendaraan"], kits: ["racing-cars-kit-660d53"], types: ["vehicle"] },
  kendaraan: { keywords: ["car", "truck", "vehicle", "bus", "motorcycle", "kendaraan", "mobil", "truk"], types: ["vehicle"] },
  truk: { keywords: ["truck", "cargo truck", "delivery truck", "truk", "muatan"], types: ["vehicle"] },

  // Maritime & Shipping
  shipping: { keywords: ["ship", "cargo", "container", "port", "crane", "kapal", "kontainer", "pelabuhan"], types: ["vehicle", "building"] },
  kapal: { keywords: ["ship", "boat", "cargo ship", "submarine", "ferry", "kapal", "perahu", "pelabuhan"], kits: ["underwater", "pirate"], types: ["vehicle"] },
  laut: { keywords: ["ship", "boat", "fish", "coral", "ocean", "submarine", "laut", "samudera", "kapal"], kits: ["underwater", "coast-and-boardwalk-d883fd"] },
  maritim: { keywords: ["ship", "port", "cargo", "ocean", "harbor", "maritim", "pelabuhan", "kapal"], types: ["vehicle", "building"] },

  // Rail & Trains
  train: { keywords: ["train", "railway", "station", "locomotive", "kereta", "rel", "stasiun"], types: ["vehicle", "building"] },
  kereta: { keywords: ["train", "railway", "station", "locomotive", "kereta api", "stasiun", "gerbong"], types: ["vehicle", "building"] },
  stasiun: { keywords: ["station", "platform", "train", "ticket", "stasiun", "kereta"], types: ["building", "prop"] },

  // War & Military
  war: { keywords: ["soldier", "tank", "weapon", "military", "perang", "militer", "tentara", "senjata"], kits: ["military"] },
  perang: { keywords: ["soldier", "tank", "weapon", "military", "cannon", "fortress", "perang", "tentara", "senjata", "meriam"], kits: ["military"], types: ["vehicle", "prop", "character"] },
  militer: { keywords: ["soldier", "tank", "weapon", "military", "tentara", "pasukan", "markas"], kits: ["military"] },
  tentara: { keywords: ["soldier", "military", "helmet", "rifle", "tentara", "prajurit"], kits: ["military"], types: ["character"] },
  senjata: { keywords: ["weapon", "sword", "shield", "cannon", "gun", "senjata", "pedang", "meriam"], types: ["prop"] },

  // Medieval & History
  medieval: { keywords: ["knight", "castle", "sword", "shield", "kerajaan", "kastil", "pedang", "ksatria"], kits: ["castle", "medieval"] },
  battle: { keywords: ["soldier", "weapon", "armor", "fortress"], types: ["character", "building"] },
  sejarah: { keywords: ["castle", "temple", "ancient", "statue", "scroll", "artefak", "sejarah", "candi", "kerajaan"], kits: ["castle", "medieval"], types: ["building", "prop"] },
  kerajaan: { keywords: ["castle", "throne", "crown", "knight", "fortress", "kerajaan", "istana", "mahkota"], kits: ["castle", "medieval"], types: ["building", "prop"] },
  istana: { keywords: ["palace", "castle", "throne", "column", "istana", "megah"], kits: ["castle"], types: ["building"] },
  candi: { keywords: ["temple", "column", "ruins", "statue", "pyramid", "candi", "piramida", "kuil"], types: ["building", "prop"] },

  // Ocean & Aquatic
  ocean: { keywords: ["fish", "coral", "submarine", "whale"], kits: ["underwater"] },

  // Agriculture & Farm
  farm: { keywords: ["cow", "chicken", "tractor", "barn", "peternakan", "sapi", "ayam"], kits: ["farm"] },
  pertanian: { keywords: ["tractor", "barn", "crop", "wheat", "sawah", "ladang", "traktor"], kits: ["farm"], types: ["vehicle", "building"] },

  // Nature & Forestry
  forest: { keywords: ["tree", "deer", "cabin", "campfire", "hutan", "pohon", "rusa"], kits: ["campground"] },
  hutan: { keywords: ["tree", "cabin", "campfire", "wood", "river", "hutan", "pohon", "alam"], kits: ["campground", "prehistoric-valley-8638dc"] },

  // Space & Cosmos
  space: { keywords: ["rocket", "astronaut", "satellite", "planet"], kits: ["space"] },
  angkasa: { keywords: ["rocket", "astronaut", "satellite", "planet", "spacesuit", "roket", "astronot", "satelit", "antariksa"], kits: ["space", "space-base-kit-cf65de"] },
  antariksa: { keywords: ["rocket", "astronaut", "satellite", "planet", "spacesuit", "antariksa", "bintang"], kits: ["space", "space-base-kit-cf65de"] },

  // Mountain & Geology
  mountain: { keywords: ["mountain", "rock", "tent", "hiker", "gunung", "batu"], types: ["terrain", "prop"] },
  gunung: { keywords: ["lava", "rock", "obsidian", "mountain", "fire", "eruption", "gunung", "puncak", "kawah"], kits: ["easter-island-rapa-nui-368e86", "dragons-lair-dark-dragon-782570", "prehistoric-valley-8638dc"] },
  volcano: { keywords: ["lava", "rock", "obsidian", "mountain", "fire", "eruption"], kits: ["easter-island-rapa-nui-368e86", "dragons-lair-dark-dragon-782570", "prehistoric-valley-8638dc"] },

  // City & Urban
  city: { keywords: ["building", "skyscraper", "street", "car", "gedung", "kota", "jalan"], kits: ["city", "nyc-city-kit-fbca88"] },
  kota: { keywords: ["building", "skyscraper", "street", "car", "gedung", "perkotaan", "jalan"], kits: ["city", "nyc-city-kit-fbca88"] },
  gedung: { keywords: ["building", "skyscraper", "tower", "office", "gedung", "menara"], kits: ["city", "nyc-city-kit-fbca88"], types: ["building"] },

  // Health & Medicine
  hospital: { keywords: ["doctor", "nurse", "ambulance", "bed", "rumah sakit", "dokter", "ambulans"], kits: ["hospital"] },
  medis: { keywords: ["doctor", "nurse", "ambulance", "bed", "medicine", "dokter", "perawat", "obat", "medis"], kits: ["hospital"] },
  kesehatan: { keywords: ["doctor", "nurse", "ambulance", "bed", "rumah sakit", "kesehatan"], kits: ["hospital"] },

  // Education
  school: { keywords: ["desk", "book", "student", "teacher"], types: ["prop", "character"] },
  education: { keywords: ["book", "desk", "student", "projection", "lecture", "campus"], kits: ["university-959b66"] },
  pendidikan: { keywords: ["book", "desk", "student", "projection", "lecture", "campus", "sekolah", "buku", "kuliah", "kampus"], kits: ["university-959b66"] },
  sekolah: { keywords: ["desk", "book", "student", "teacher", "blackboard", "sekolah", "kursi", "meja"], kits: ["university-959b66"], types: ["building", "prop"] },

  // Industry & Factory
  factory: { keywords: ["machine", "conveyor", "worker", "chimney"], types: ["building", "prop"] },
  pabrik: { keywords: ["machine", "conveyor", "worker", "chimney", "forklift", "pabrik", "mesin", "industri"], types: ["building", "prop"] },
  industri: { keywords: ["machine", "conveyor", "worker", "chimney", "generator", "industri"], types: ["building", "prop"] },

  // Food & Restaurant
  restaurant: { keywords: ["food", "table", "chef", "plate"], types: ["prop", "character"] },
  makanan: { keywords: ["food", "plate", "fruit", "drink", "table", "makanan", "buah", "minuman"], types: ["prop"] },

  // Sports
  stadium: { keywords: ["stadium", "player", "ball", "goal"], kits: ["stadium"] },
  football: { keywords: ["player", "ball", "goal", "pitch"], kits: ["stadium"] },
  sepakbola: { keywords: ["player", "ball", "goal", "pitch", "stadium", "bola", "lapangan", "gawang"], kits: ["stadium"] },
  olahraga: { keywords: ["player", "ball", "stadium", "trophy", "olahraga", "piala"], kits: ["stadium"] },

  // Concert & Music
  concert: { keywords: ["stage", "microphone", "speaker", "crowd"], types: ["prop", "character"] },
  music: { keywords: ["piano", "drum", "stage", "microphone", "music stand", "speaker"], kits: ["symphony-stagecraft-kit-bf2de0"] },
  musik: { keywords: ["piano", "drum", "stage", "microphone", "music stand", "speaker", "gitar", "musik"], kits: ["symphony-stagecraft-kit-bf2de0"] },

  // Economy & Finance
  economy: { keywords: ["gold", "coin", "money", "bank", "building", "skyscraper"], kits: ["loot-lode-kit-63191e", "casino-3dd029", "nyc-city-kit-fbca88"] },
  ekonomi: { keywords: ["gold", "coin", "money", "bank", "building", "skyscraper", "uang", "koin", "bank", "finansial"], kits: ["loot-lode-kit-63191e", "casino-3dd029", "nyc-city-kit-fbca88"] },
  uang: { keywords: ["gold", "coin", "money", "cash", "bank", "safe", "uang", "koin", "brankas"], kits: ["loot-lode-kit-63191e"] },
  emas: { keywords: ["gold", "coin", "ingot", "treasure", "emas", "harta", "tambang"], kits: ["loot-lode-kit-63191e"] },
  tambang: { keywords: ["mine", "rock", "gem", "cart", "pickaxe", "gold", "tambang", "batu bara", "emas"], kits: ["loot-lode-kit-63191e"] },

  // Politics & Government
  politics: { keywords: ["building", "podium", "flag", "statue", "column"], kits: ["nyc-city-kit-fbca88"], types: ["building"] },
  politik: { keywords: ["building", "podium", "flag", "statue", "column", "gedung dewan", "bendera"], kits: ["nyc-city-kit-fbca88"], types: ["building"] },

  // Technology & Gadgets
  technology: { keywords: ["computer", "smartphone", "screen", "server", "headphones", "circuit"], kits: ["3d-ui-kit-5635f7", "office-794453", "chrome-arcology-transit-kit-87a0e1"] },
  teknologi: { keywords: ["computer", "smartphone", "screen", "server", "headphones", "circuit", "komputer", "layar", "server"], kits: ["3d-ui-kit-5635f7", "office-794453", "chrome-arcology-transit-kit-87a0e1"] },

  // Beach & Coast
  beach: { keywords: ["sand", "wave", "surfboard", "palm", "boardwalk", "lighthouse"], kits: ["coast-and-boardwalk-d883fd"] },
  pantai: { keywords: ["sand", "wave", "surfboard", "palm", "boardwalk", "lighthouse", "pantai", "ombak", "kelapa", "mercusuar"], kits: ["coast-and-boardwalk-d883fd"] },

  // Racing & Automotive
  racing: { keywords: ["car", "race", "tire", "barrel", "ramp"], kits: ["racing-cars-kit-660d53"] },
  balap: { keywords: ["car", "race", "tire", "barrel", "ramp", "mobil balap", "sirkuit"], kits: ["racing-cars-kit-660d53"] },

  // Japan & Asian Culture
  japan: { keywords: ["torii", "samurai", "shrine", "pagoda", "bamboo"], kits: ["medieval-japan-cb01ad", "japanese-suburban-city-street-baa482"] },
  jepang: { keywords: ["torii", "samurai", "shrine", "pagoda", "bamboo", "jepang", "samurai", "kuil"], kits: ["medieval-japan-cb01ad", "japanese-suburban-city-street-baa482"] },

  // Insects & Micro World
  insect: { keywords: ["insect", "butterfly", "ant", "bee", "spider"], kits: ["insect-world-e44b9f"] },
  serangga: { keywords: ["insect", "butterfly", "ant", "bee", "spider", "serangga", "kupu-kupu", "semut", "lebah"], kits: ["insect-world-e44b9f"] },

  // Futuristic & Cyber
  futuristic: { keywords: ["neon", "hologram", "transit", "arcology", "pod"], kits: ["chrome-arcology-transit-kit-87a0e1", "space-base-kit-cf65de"] },
  cyber: { keywords: ["neon", "hologram", "transit", "arcology", "pod"], kits: ["chrome-arcology-transit-kit-87a0e1", "space-base-kit-cf65de"] },

  // Camping & Outdoor
  camping: { keywords: ["tent", "campfire", "canoe", "fishing", "lake"], kits: ["campground-lake-ad32b0"] },
  kemah: { keywords: ["tent", "campfire", "canoe", "fishing", "lake", "tenda", "api unggun", "danau"], kits: ["campground-lake-ad32b0"] },

  // Horror & Halloween
  horror: { keywords: ["ghost", "pumpkin", "grave", "skeleton", "witch"], kits: ["halloween-night-46ade4", "dungeon-crypt-c27d93"] },
  horor: { keywords: ["ghost", "pumpkin", "grave", "skeleton", "witch", "hantu", "kuburan", "tengkorak"], kits: ["halloween-night-46ade4", "dungeon-crypt-c27d93"] },

  // Animals & Wildlife
  animal: { keywords: ["animal", "dog", "cat", "lion", "horse", "bear", "bird"], types: ["animal"] },
  hewan: { keywords: ["animal", "dog", "cat", "lion", "horse", "bear", "bird", "hewan", "binatang", "kuda", "burung"], types: ["animal"] },
  binatang: { keywords: ["animal", "dog", "cat", "lion", "horse", "bear", "bird", "binatang", "satwa"], types: ["animal"] },

  // Christmas & Winter
  christmas: { keywords: ["tree", "gift", "snowman", "sleigh", "ornament"], kits: ["christmas-village-fbc27a", "alpine-and-snow-092f66"] },
  natal: { keywords: ["tree", "gift", "snowman", "sleigh", "ornament"], kits: ["christmas-village-fbc27a", "alpine-and-snow-092f66"] },

  // Prehistoric & Dinosaur
  dinosaur: { keywords: ["dinosaur", "bone", "fossil", "cave", "primitive"], kits: ["prehistoric-valley-8638dc"] },
  dinosaurus: { keywords: ["dinosaur", "bone", "fossil", "cave", "primitive", "dinosaurus", "fosil"], kits: ["prehistoric-valley-8638dc"] },

  // Gaming & UI
  gaming: { keywords: ["button", "joystick", "screen", "controller", "UI"], kits: ["3d-ui-kit-5635f7"] },

  // Gambling & Casino
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
