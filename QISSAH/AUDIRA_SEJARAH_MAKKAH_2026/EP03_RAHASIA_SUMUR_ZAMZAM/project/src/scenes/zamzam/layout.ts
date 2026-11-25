// EP03 "Rahasia sumur Zamzam": one shared layout for geometry, labels and camera.
// 1 scene unit = 1 metre. y = 0 is the mataf floor surface; the cut (section) plane is z = 0 and the
// set lies behind it (z < 0). The well axis sits on the section plane at x = 0, so the cut halves it.
//
// Depths follow the Saudi Geological Survey description (research S2): about 30.5 m hand-dug,
// 13.5 m alluvium, 0.5 m weathered rock (main water entry), 17.0 m diorite. The old basement level
// sits about 2.5 m under the mataf (Disputes #3). Dimensions are rounded for the diorama.

export const L = {
  /** Half width of the cut block (bleeds out of the 16:9 frame). */
  halfW: 110,
  /** Block depth behind the cut plane (the plaza on top carries the Ka'bah). */
  depth: 84,
  /** Block bottom, well under the frame so no edge shows. */
  bottom: -95,

  marbleTop: 0,
  marbleBottom: -0.45,
  /** Old basement room: ceiling slab bottom and floor top (about 2.5 m below the mataf). */
  roomCeil: -0.85,
  roomFloor: -2.95,
  basementBottom: -3.35,
  /** Room cavity in front of the well, open to the section plane. */
  roomHalfW: 5.2,
  roomDepth: 6.5,
  /** Service tunnel for the stainless pipes heading to Kudai (right side). */
  tunnelDepth: 1.6,

  /** Well: the mouth (concrete collar) sits on the basement floor. */
  wellR: 1.25,
  collarTop: -1.95,
  alluviumBottom: -13.5,
  weatheredBottom: -14.0,
  wellBottom: -30.5,
  waterLevel: -8.6,

  pumpY: -19.5,

  kaaba: { x: 11, z: -48, w: 11.0, d: 12.0, h: 13.0, rotY: -0.42 },
} as const;

export const PAL = {
  bg: "#efe9df",
  marble: "#f4f1ec",
  marbleCut: "#e3ddd3",
  concrete: "#b9b4ab",
  concreteCut: "#a29c92",
  seal: "#8d877d",
  sand: "#d9b98a",
  sandDark: "#c79f6a",
  masonry: "#c8b79c",
  weathered: "#f2a93b",
  diorite: "#626d69",
  dioriteDeep: "#4c5552",
  water: "#3fb2d9",
  waterCut: "#6fd0ee",
  steel: "#c9d0d4",
  pump: "#ef7a43",
  coral: "#ef7a43",
  kaaba: "#141414",
  gold: "#d6a842",
  ink: "#1d2326",
  pilgrim: "#fbf8f2",
} as const;
