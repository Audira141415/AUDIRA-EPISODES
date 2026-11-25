// Props shared by EP05-EP09 sketch films: phones, posts, calendars, stamps, buildings, chains. Same jittered-graphite look as lib.mjs.
import { line, shape, rect, text, g, mark, circleP, person, nameTag, doc, INK } from "./lib.mjs";

export const calendar = (x, y, day, mon, lab, red = "#9C3B24") => rect(x, y, 300, 330, { wash: "#FBF6E8", op: 1, w: 3.4 }) + rect(x, y, 300, 76, { wash: red, op: .9, w: 3 }) + text(x + 150, y + 54, mon, 38, { fill: "#FBF6E8" }) + text(x + 150, y + 210, day, 130, { font: "Playfair Display", weight: 800 }) + text(x + 150, y + 298, lab, 30);
export const phone = (x, y, w, h, inner = "") => rect(x, y, w, h, { wash: "#26272A", op: 1, w: 4 }) + rect(x + w * .07, y + h * .07, w * .86, h * .82, { wash: "#F4F1EA", op: 1, w: 2.4 }) + `<g>${inner}</g>` + shape(circleP(x + w / 2, y + h * .945, w * .06).slice(0, 25), { wash: "#555", op: 1, w: 2 });
/** Social post: avatar, handle, a few text lines and a document thumbnail. */
export const post = (x, y, w, handle, { thumb = true, color = "#1F6F8B" } = {}) => {
  let o = rect(x, y, w, thumb ? w * 1.15 : w * .5, { wash: "#FFFFFF", op: 1, w: 3 });
  o += shape(circleP(x + w * .13, y + w * .12, w * .07).slice(0, 25), { wash: color, op: .9, w: 2.4 });
  o += text(x + w * .25, y + w * .145, handle, w * .075, { anchor: "start" });
  for (let i = 0; i < 2; i++) o += line([[x + w * .08, y + w * (.27 + i * .07)], [x + w * (i ? .6 : .9), y + w * (.27 + i * .07)]], 3, "#8A8378");
  if (thumb) o += doc(x + w * .2, y + w * .44, w * .6, w * .64, "IJAZAH");
  return o;
};
export const stamp = (x, y, word, color = "#B3261E", rot = -8, size = 92) => {
  const w = word.length * size * .66 + 70;
  return `<g transform="rotate(${rot} ${x} ${y})">` + rect(x - w / 2, y - size * .85, w, size * 1.3, { wash: "#FBF6E8", op: .55, w: 9, ink: color }) + text(x, y + size * .3, word, size, { fill: color, font: "Oswald", weight: 700 }) + `</g>`;
};
export const building = (x, y, w, h, label, sub = "", wash = "#D9C39A") => {
  let o = rect(x, y, w, h, { wash, op: .7, w: 3.4, hatch: true, gap: 26, ang: 1.5 });
  o += shape([[x - 30, y], [x + w / 2, y - h * .35], [x + w + 30, y]], { wash: "#8C6A4A", op: .8, hatch: true, gap: 14, w: 3.4 });
  for (let i = 0; i < 5; i++) o += rect(x + w * (.1 + i * .17), y + h * .2, w * .07, h * .8, { wash: "#F2EADB", op: 1, w: 2.4 });
  o += text(x + w / 2, y + h + 64, label, 50) + (sub ? text(x + w / 2, y + h + 112, sub, 32, { weight: 500 }) : "");
  return o;
};
/** Witness standing at a station: figure plus large tag. look = {robe, hair}. */
export const witness = (id, x, y, s, name, role, look = {}, poses = {}) => person({ id, x, y, s, robe: look.robe || "shirt", hair: look.hair || "neutral", poses }) + nameTag(x, y + 210 * s, name, role);
export const node = (x, y, w, h, title, sub, wash = "#FBF6E8") => rect(x - w / 2, y - h / 2, w, h, { wash, op: 1, w: 4 }) + text(x, y - 6, title, 52, { font: "Playfair Display", weight: 800 }) + text(x, y + 52, sub, 32, { weight: 500 });
export const arrow = (id, p, c = "#B3261E", w = 9) => {
  const [a, b] = [p[p.length - 2], p[p.length - 1]], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const h = (s) => [b[0] - Math.cos(ang + s) * 46, b[1] - Math.sin(ang + s) * 46];
  return `<g id="${id}">` + mark(`${id}L`, p, c, w) + mark(`${id}H`, [h(.5), b, h(-.5)], c, w) + `</g>`;
};
export const crowd = (x0, y0, cols, rows, gap, s = 1, hi = []) => {
  let o = "";
  for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) {
    const x = x0 + i * gap, y = y0 + r * gap * 1.25, k = r * cols + i, on = hi.includes(k);
    o += shape(circleP(x, y, 22 * s, 25 * s).slice(0, 25), { wash: on ? "#B3261E" : "#3B3530", op: .85, w: 2 }) + shape([[x - 40 * s, y + 62 * s], [x - 34 * s, y + 28 * s], [x + 34 * s, y + 28 * s], [x + 40 * s, y + 62 * s]], { wash: on ? "#E8A090" : "#8F8778", op: .75, w: 2 });
  }
  return o;
};
export const tv = (x, y, w, h, inner = "") => rect(x, y, w, h, { wash: "#26272A", op: 1, w: 4 }) + rect(x + 16, y + 16, w - 32, h - 32, { wash: "#E9EEF0", op: 1, w: 2 }) + inner + line([[x + w / 2, y + h], [x + w / 2, y + h + 50]], 8);
export const ballot = (x, y, yr, lab) => rect(x, y, 200, 180, { wash: "#C7A77A", op: .7, w: 3.4, hatch: true, gap: 22 }) + rect(x + 40, y - 8, 120, 16, { wash: INK, op: 1, w: 2 }) + text(x + 100, y + 112, yr, 58, { font: "Playfair Display", weight: 800 }) + text(x + 100, y + 232, lab, 30);
export const big = (x, y, s, size, o = {}) => text(x, y, s, size, { font: "Playfair Display", weight: 800, ...o });
export const ALL_COURT = ["jokowi", "hakim", "h2", "h3", "jaksa", "jaksa2", "refly", "roy"];
export { line, shape, rect, text, g, mark, circleP, person, nameTag, doc, INK };
// EP10+: larger type for phone screens. Same look, bigger labels.
export const tag2 = (x, y, name, role, wash = "#F7F1E2") => `<g>${rect(x - 270, y, 540, 140, { wash, op: 1, w: 3.4 })}${text(x, y + 62, name, 54, { weight: 700 })}${text(x, y + 112, role, 36, { weight: 500, op: 0.85 })}</g>`;
export const wit2 = (id, x, y, s, name, role, look = {}) => person({ id, x, y, s, robe: look.robe || "shirt", hair: look.hair || "neutral" }) + tag2(x, y + 205 * s, name, role);
export const node2 = (x, y, w, h, title, sub, wash = "#FBF6E8", font = "Playfair Display") => rect(x - w / 2, y - h / 2, w, h, { wash, op: 1, w: 4.5 }) + text(x, y - 4, title, 72, { font, weight: 800 }) + text(x, y + 66, sub, 44, { weight: 600 });
export const bld2 = (x, y, w, h, label, sub = "", wash = "#D9C39A") => building(x, y, w, h, "", "", wash) + text(x + w / 2, y + h + 84, label, 66) + (sub ? text(x + w / 2, y + h + 142, sub, 42, { weight: 600 }) : "");
