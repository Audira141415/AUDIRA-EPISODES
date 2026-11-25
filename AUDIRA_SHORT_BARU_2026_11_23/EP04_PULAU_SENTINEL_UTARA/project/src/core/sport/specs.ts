// Sport registry: real playing-area dimensions (metres, from the governing bodies' rules) and the
// look of each surface. Fields lie on y = 0, centred on the origin, length along z, width along x.
//
// Scale: M world units per metre, chosen so a ToyPerson (1.05 units) stands about 1.75 m tall.
// Use m(x) to convert, and place players with courtPos(x, z) in metres.

export const M = 0.6;
export const m = (metres: number) => metres * M;
export const courtPos = (xMetres: number, zMetres: number, yMetres = 0): [number, number, number] => [xMetres * M, yMetres * M, zMetres * M];

export type SportId = "football" | "futsal" | "basketball" | "volleyball" | "badminton" | "tennis" | "track";
export type BallKind = "football" | "futsal" | "basketball" | "volleyball" | "tennis" | "shuttlecock";

export type SportSpec = {
  id: SportId;
  /** Indonesian name, for HUD labels. */
  name: string;
  /** Playing area in metres: width along x, length along z. */
  width: number;
  length: number;
  /** Painted run-off around the playing area (metres). */
  margin: number;
  indoor: boolean;
  /** Line width in metres. */
  line: number;
  colors: { field: string; alt: string; out: string; line: string; accent: string };
  ball: BallKind;
  /** Ball diameter in metres. */
  ballSize: number;
  rule: string;
};

export const SPORTS: Record<SportId, SportSpec> = {
  football: {
    id: "football", name: "Sepak Bola", width: 68, length: 105, margin: 5, indoor: false, line: 0.12,
    colors: { field: "#3f8f3a", alt: "#4a9c43", out: "#3a8636", line: "#f4f6ef", accent: "#ffffff" },
    ball: "football", ballSize: 0.22, rule: "IFAB Laws of the Game, Law 1",
  },
  futsal: {
    id: "futsal", name: "Futsal", width: 20, length: 40, margin: 2, indoor: true, line: 0.08,
    colors: { field: "#2f74c0", alt: "#2a6bb3", out: "#e2722c", line: "#ffffff", accent: "#ffd23f" },
    ball: "futsal", ballSize: 0.2, rule: "FIFA Futsal Laws of the Game, Law 1",
  },
  basketball: {
    id: "basketball", name: "Bola Basket", width: 15, length: 28, margin: 2, indoor: true, line: 0.05,
    colors: { field: "#d9a46a", alt: "#cf9a5f", out: "#25344d", line: "#ffffff", accent: "#c8442f" },
    ball: "basketball", ballSize: 0.24, rule: "FIBA Official Basketball Rules, Art. 2",
  },
  volleyball: {
    id: "volleyball", name: "Bola Voli", width: 9, length: 18, margin: 3, indoor: true, line: 0.05,
    colors: { field: "#e8823a", alt: "#e07a33", out: "#2b6cb5", line: "#ffffff", accent: "#ffd23f" },
    ball: "volleyball", ballSize: 0.21, rule: "FIVB Official Volleyball Rules, Rule 1",
  },
  badminton: {
    id: "badminton", name: "Bulu Tangkis", width: 6.1, length: 13.4, margin: 2, indoor: true, line: 0.04,
    colors: { field: "#2f8a5a", alt: "#2b8253", out: "#24324a", line: "#ffffff", accent: "#ffd23f" },
    ball: "shuttlecock", ballSize: 0.068, rule: "BWF Laws of Badminton, Law 1",
  },
  tennis: {
    id: "tennis", name: "Tenis", width: 10.97, length: 23.77, margin: 5, indoor: false, line: 0.05,
    colors: { field: "#2f63a8", alt: "#2c5d9f", out: "#3f8a5c", line: "#ffffff", accent: "#d7f04a" },
    ball: "tennis", ballSize: 0.067, rule: "ITF Rules of Tennis, Rule 1",
  },
  track: {
    // A standard 400 m track: 84.39 m straights, 36.5 m inner radius, 8 lanes of 1.22 m.
    id: "track", name: "Atletik", width: 92.52, length: 176.91, margin: 4, indoor: false, line: 0.05,
    colors: { field: "#c4462f", alt: "#b94029", out: "#3f8f3a", line: "#ffffff", accent: "#ffd23f" },
    ball: "football", ballSize: 0.22, rule: "World Athletics Track and Field Facilities Manual",
  },
};

export const TRACK = { straight: 84.39, radius: 36.5, lanes: 8, lane: 1.22 } as const;

/** Full painted area in world units (playing area plus margin). */
export const fieldExtent = (sport: SportId) => {
  const s = SPORTS[sport];
  return { w: m(s.width + s.margin * 2), d: m(s.length + s.margin * 2) };
};

/** Fictional teams only: never real clubs, crests or players. */
export type Team = { name: string; top: string; bottom: string; socks: string; shoes: string; keeper: string };
export const TEAMS = {
  harbour: { name: "HARBOUR FC", top: "#ff5a3c", bottom: "#f4f1ea", socks: "#ff5a3c", shoes: "#1b1d22", keeper: "#ffd23f" },
  valley: { name: "VALLEY UNITED", top: "#2f7bff", bottom: "#14213d", socks: "#f4f1ea", shoes: "#f4f1ea", keeper: "#1fa67a" },
  garuda: { name: "GARUDA MUDA", top: "#d7263d", bottom: "#ffffff", socks: "#d7263d", shoes: "#ffffff", keeper: "#14b2c4" },
  nusantara: { name: "NUSANTARA SC", top: "#f4f1ea", bottom: "#1fa67a", socks: "#1fa67a", shoes: "#262b33", keeper: "#ff8a00" },
} satisfies Record<string, Team>;
