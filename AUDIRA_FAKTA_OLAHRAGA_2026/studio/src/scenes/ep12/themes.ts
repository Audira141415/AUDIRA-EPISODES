// EP12 rink themes: one colour world per beat (hex dark to light).
import { theme } from "./stage.tsx";

/** A: Olympic final teaser, navy and cyan. */
export const NAVY = theme("navy", {
  sky: ["#040a1c", "#0a1c44", "#123a7c", "#2f6cc0"], seat: ["#0a1430", "#16306a", "#2a58a8", "#6aa0e0"],
  c1: ["#2a0a18", "#8a1c34", "#e04a58", "#ffb0a8"], c2: ["#1a2438", "#5a7094", "#c8d8ee", "#ffffff"], c3: ["#062a3a", "#0e6a88", "#28b4d8", "#a8f0ff"],
  pad1: ["#061a44", "#0e3a8c", "#2068d8", "#7ab4ff"], pad2: ["#24344c", "#6c84a8", "#d0e0f4", "#ffffff"],
  ice: ["#3c7fae", "#7cc0e0", "#bce8f6", "#f4feff"], board: "#1c50a8", fog: "#2f7cd0", shadow: "#081a40",
});
/** B: introduction, black and gold. */
export const GOLDBLACK = theme("goldblack", {
  sky: ["#050403", "#120d07", "#2a1e0c", "#5a4218"], seat: ["#080605", "#1c140a", "#3a2a12", "#7a5a24"],
  c1: ["#1a0e04", "#4a2e0a", "#94621a", "#e8b04a"], c2: ["#140f08", "#3a2c16", "#80663a", "#d8b878"], c3: ["#100c06", "#2e2210", "#6a5024", "#c09848"],
  pad1: ["#120c04", "#3a280c", "#7c5818", "#e0a83a"], pad2: ["#1a1610", "#463a24", "#94805a", "#f0dca8"],
  ice: ["#3a3020", "#80704c", "#c8b482", "#fff2cc"], board: "#6a4a14", lamp: ["#2a1c08", "#a87820", "#ffd870", "#fffbe0"],
  key: { dir: [0.1, -0.95, 0.35], amb: 0.24, key: 0.9, rim: "#FFD98A", rimAmt: 0.95 }, stands: 0.6, fog: "#8a6420", shadow: "#0c0804", vign: 0.9,
});
/** C1: the blade, deep crimson. */
export const CRIMSON = theme("crimson", {
  sky: ["#120308", "#34081a", "#701028", "#b8283c"], seat: ["#1c060c", "#48101c", "#8a2030", "#d85a58"],
  c1: ["#2a0a08", "#7c2416", "#d8582c", "#ffb878"], c2: ["#2c1418", "#7a444a", "#d09a98", "#fff0e8"], c3: ["#1e0a1c", "#54204c", "#a04888", "#f0a0d0"],
  pad1: ["#340810", "#80142a", "#d02c40", "#ff8c84"], pad2: ["#2e1a1c", "#82565a", "#e0b8b4", "#fff6f0"],
  ice: ["#7a3844", "#c07c80", "#ecbcb8", "#fff4f0"], board: "#8c1c30", key: { rim: "#FFC0A8", amb: 0.32 }, stands: 0.66, fog: "#b02840", shadow: "#20040c",
});
/** D1: closed training rink, violet night with sodium windows. */
export const VIOLETNIGHT = theme("violetnight", {
  sky: ["#0c0718", "#1e1238", "#3a2466", "#6a48a4"], seat: ["#100a20", "#241a44", "#443470", "#7a66b4"],
  c1: ["#180e2a", "#38245c", "#6a4c9c", "#b090e0"], c2: ["#1c1430", "#443460", "#8070a8", "#c8bce8"], c3: ["#140c28", "#2c2056", "#584890", "#a094d8"],
  pad1: ["#1c0a3c", "#44208a", "#7c44d0", "#c8a0ff"], pad2: ["#241a3c", "#5c4a86", "#b0a0d4", "#f4ecff"],
  ice: ["#463a78", "#8072b4", "#bcb0e0", "#f2ecff"], board: "#4a2a94", lamp: ["#3a1c04", "#b86810", "#ffb03c", "#ffe8a0"],
  key: { dir: [0.5, -0.6, 0.6], amb: 0.3, rim: "#FFC064", rimAmt: 0.9 }, stands: 0.55, fog: "#5a3a9c", shadow: "#0c0620",
});
/** F: quarter-final, royal blue and white. */
export const ROYAL = theme("royal", {
  sky: ["#0a1a5c", "#1c3ca8", "#3a6ce0", "#86b0ff"], seat: ["#102070", "#2044b4", "#4a78e8", "#a8c8ff"],
  c1: ["#7a1c08", "#d85414", "#ffa03c", "#ffe0a0"], c2: ["#4a5878", "#98a8c8", "#e8f0ff", "#ffffff"], c3: ["#0a4a3c", "#14946c", "#48d8a0", "#c0ffe4"],
  pad1: ["#8a1414", "#d02c2c", "#f45a50", "#ffb4a8"], pad2: ["#506080", "#a0b0d0", "#eef4ff", "#ffffff"],
  ice: ["#5c88d0", "#a0c4f4", "#d8ecff", "#ffffff"], board: "#b02c34", stands: 1, fog: "#6aa0ff", shadow: "#0a1a50",
});
/** H: semi-final, magenta. */
export const MAGENTA = theme("magenta", {
  sky: ["#1c0430", "#4a0c68", "#9420a0", "#e85ad0"], seat: ["#24083c", "#5a1878", "#a838ac", "#f484d8"],
  c1: ["#0c2a5c", "#1c64b4", "#48a8f0", "#b8e8ff"], c2: ["#3c1c4c", "#8c589c", "#e0b4e8", "#fff4ff"], c3: ["#5c1c04", "#c05a10", "#ffa838", "#ffe8a8"],
  pad1: ["#0c1464", "#2438c0", "#5074ff", "#b0c4ff"], pad2: ["#481048", "#a02c94", "#f070d0", "#ffd4f4"],
  ice: ["#7c4a9c", "#c08cd4", "#ecc8f4", "#fff4ff"], board: "#9c2c94", key: { rim: "#FFB0F0" }, fog: "#d040c0", shadow: "#180428",
});
/** I1: the gap, white and turquoise, high angle. */
export const TURQ = theme("turq", {
  sky: ["#0c5c64", "#1c98a0", "#58ccd0", "#b8f4f0"], seat: ["#0c5460", "#1c8c98", "#54c4cc", "#b8f0f0"],
  c1: ["#7c1c1c", "#d84444", "#ff8c78", "#ffd4c4"], c2: ["#58707c", "#a4bcc4", "#ecf8f8", "#ffffff"], c3: ["#5c4404", "#b88c14", "#ffd448", "#fff4b8"],
  pad1: ["#046070", "#0ca0ac", "#3cd8d8", "#b4fff8"], pad2: ["#587478", "#a8c4c4", "#f0fcfa", "#ffffff"],
  ice: ["#86c8cc", "#c0e8e8", "#e6f8f8", "#ffffff"], board: "#0c98a4", stands: 1, fog: "#a8f0ec", shadow: "#063c44", vign: 0.6,
});
/** I2: the pile-up, orange and yellow. */
export const BLAZE = theme("blaze", {
  sky: ["#3c0c04", "#8c2c08", "#e06814", "#ffb44c"], seat: ["#44140a", "#943814", "#e07828", "#ffc070"],
  c1: ["#08244c", "#145494", "#3c94e0", "#a8dcff"], c2: ["#54301c", "#a4704c", "#ecc49c", "#fff4e4"], c3: ["#4c0808", "#a41c1c", "#f04c3c", "#ffb4a0"],
  pad1: ["#7c2404", "#d4580c", "#ff9428", "#ffd48c"], pad2: ["#6c4804", "#c08c0c", "#ffd02c", "#fff4a4"],
  ice: ["#c07c4c", "#ecb880", "#ffe2b8", "#fffaf0"], board: "#e06c14", key: { rim: "#FFF0B0" }, stands: 0.92, fog: "#ffa83c", shadow: "#380c04", vign: 0.7,
});
/** I3: alone over the line, gold. */
export const GOLDRUN = theme("goldrun", {
  sky: ["#2c1c04", "#7c5408", "#d49c18", "#ffe06c"], seat: ["#342008", "#805a14", "#cc9c34", "#ffe094"],
  c1: ["#0c3c1c", "#148044", "#3cc878", "#b8ffd0"], c2: ["#4c3c1c", "#9c8448", "#ecd898", "#fffbe8"], c3: ["#4c1404", "#a43c0c", "#f48428", "#ffd094"],
  pad1: ["#04341c", "#0c7440", "#1cb468", "#8cf0b4"], pad2: ["#5c4004", "#ac8010", "#f8c830", "#fff4ac"],
  ice: ["#b09448", "#e4cc84", "#fff0c0", "#fffef4"], board: "#1c8c50", key: { rim: "#FFF4C0" }, stands: 1, fog: "#ffd860", shadow: "#2c1c04", vign: 0.6,
});
/** K: dawn practice, peach. */
export const DAWN = theme("dawn", {
  sky: ["#5c2c44", "#b46468", "#f4a488", "#ffe0c0"], seat: ["#4c2840", "#8c5868", "#cc9490", "#f4d0bc"],
  c1: ["#4c2840", "#8c5868", "#cc9490", "#f4d0bc"], c2: ["#5c3448", "#9c6870", "#dca89c", "#ffe4d0"], c3: ["#44243c", "#805060", "#c08c88", "#f0c8b4"],
  pad1: ["#443c6c", "#7c74a8", "#b8b0d8", "#eee8ff"], pad2: ["#6c4454", "#b08088", "#ecc4b8", "#fff4e8"],
  ice: ["#a87c88", "#dcb0ac", "#ffe0cc", "#fffaf0"], board: "#8c80b4", lamp: ["#7c3c20", "#e08c50", "#ffd8a0", "#fffbe8"],
  key: { dir: [0.7, -0.5, 0.45], rim: "#FFE0A0", rimAmt: 0.95 }, stands: 0.95, fog: "#ffc49c", shadow: "#3c1c34", vign: 0.55,
});
