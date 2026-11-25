// PIXEL ACRE: true low-resolution art. Everything is painted into a 270x480 buffer and scaled 4x with no smoothing, side-scrolling left to right from morning to night.
// No WebGL in this episode. Sprites and palette are original; no Pixels assets. Every value is a function of t.
import { mulberry, ramp, clamp01, track } from "./lib3d.js";

const W = 270, H = 480, GY = 300;
const mix = (a, b, u) => { const p = (s) => (s[0] === "#" ? [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)] : s.match(/\d+/g).map(Number)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * u)).join(",")})`; };

export function create(canvas, K, AT) {
  const main = canvas.getContext("2d");
  const buf = document.createElement("canvas"); buf.width = W; buf.height = H;
  const g = buf.getContext("2d");
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const rnd = mulberry(1024);

  const ST = { farm: 130, town: 460, craft: 790, land: 1130, market: 1500, leak: 1840, board: 2170, camp: 2500 };
  const clouds = []; for (let i = 0; i < 14; i++) clouds.push([rnd() * 900, 172 + rnd() * 60, 12 + rnd() * 18]);
  const stars = []; for (let i = 0; i < 90; i++) stars.push([rnd() * W, 160 + rnd() * 110, rnd()]);
  const tufts = []; for (let i = 0; i < 700; i++) tufts.push([rnd() * 3000 - 100, GY + 4 + rnd() * 170, rnd()]);
  const hillA = []; for (let i = 0; i < 40; i++) hillA.push([i * 42 + rnd() * 18, 20 + rnd() * 26]);
  const hillB = []; for (let i = 0; i < 60; i++) hillB.push([i * 30 + rnd() * 12, 14 + rnd() * 20]);
  const fx = []; for (let i = 0; i < 160; i++) fx.push([rnd(), rnd(), rnd()]);

  const P = { hero: { skin: "#f2c39a", hair: "#6b3d22", shirt: "#d94f4f", pants: "#3b4a7a", hat: "#e8c15a" }, a: { skin: "#d9a074", hair: "#2b1d3a", shirt: "#3f9d6b", pants: "#5b3a2a" }, b: { skin: "#f2c39a", hair: "#c8603a", shirt: "#4a7fd6", pants: "#44364f" }, c: { skin: "#a86f4d", hair: "#1e1826", shirt: "#e0a23a", pants: "#3b4a7a" }, d: { skin: "#f0d0b0", hair: "#8f5bd0", shirt: "#d65fa8", pants: "#2f5d6a" }, taker: { skin: "#c9a58a", hair: "#2a2433", shirt: "#55506a", pants: "#2a2433" } };
  // chibi: big head, short legs. x,y are feet centre. walk selects the leg frame, tool draws a hoe arm.
  const char = (x, y, p, walk = 0, dir = 1, tool = -1, sit = false) => {
    x = Math.round(x); y = Math.round(y);
    R(x - 8, y - 1, 16, 2, "rgba(40,30,50,.35)");
    const lf = walk === 1 ? 2 : 0, rf = walk === 2 ? 2 : 0;
    if (!sit) { R(x - 5, y - 7 + lf, 4, 7 - lf, p.pants); R(x + 1, y - 7 + rf, 4, 7 - rf, p.pants); R(x - 6, y - 2 + lf, 5, 2, "#2b1d3a"); R(x + 1, y - 2 + rf, 5, 2, "#2b1d3a"); }
    else { R(x - 5, y - 4, 10, 4, p.pants); }
    const by = sit ? y - 12 : y - 15;
    R(x - 6, by, 12, 9, p.shirt); R(x - 6, by + 7, 12, 1, "rgba(0,0,0,.2)");
    R(x - 8, by + 1, 2, 6, p.skin); R(x + 6, by + 1, 2, 6, p.skin);
    const hy = by - 13;
    R(x - 8, hy, 16, 13, p.skin);
    R(x - 8, hy, 16, 4, p.hair); R(x - 8, hy, 2, 8, p.hair); R(x + 6, hy, 2, 6, p.hair);
    R(x + dir * 2 - 1, hy + 7, 2, 3, "#2b1d3a"); R(x + dir * 5 - 1, hy + 7, 2, 3, "#2b1d3a");
    R(x + dir * 3 - 2, hy + 11, 3, 1, "#b0604a");
    if (p.hat) { R(x - 11, hy + 1, 22, 2, p.hat); R(x - 7, hy - 4, 14, 5, p.hat); R(x - 7, hy - 1, 14, 1, "#b8452f"); }
    if (tool >= 0) { const a = tool; const hx = x + dir * (7 + Math.round(a * 7)), hyy = by + 3 - Math.round((1 - a) * 12) + Math.round(a * 9); R(Math.min(x + dir * 6, hx), hyy + 1, Math.abs(hx - (x + dir * 6)) + 1, 2, "#7b4f2a"); R(hx, hyy - 2, 2, 12, "#7b4f2a"); R(hx - dir * 1, hyy + 8, 5, 3, "#c9d2dc"); }
  };
  // crop stage 0..4 with a little sway
  const crop = (x, y, s, kind = 0, t = 0) => { x = Math.round(x); y = Math.round(y); const sw = Math.round(Math.sin(t * 2 + x) * 0.6); if (s > 0.1) { R(x, y - 3, 2, 3, "#3f9d3f"); } if (s > 0.35) { R(x - 2 + sw, y - 6, 2, 3, "#57b84a"); R(x + 2 + sw, y - 7, 2, 4, "#57b84a"); R(x + sw, y - 9, 2, 6, "#3f9d3f"); } if (s > 0.7) { R(x - 4 + sw, y - 10, 4, 3, "#6fce52"); R(x + 2 + sw, y - 12, 4, 3, "#6fce52"); } if (s > 0.95) { const c = ["#ff6fa0", "#ffb020", "#e0485a"][kind % 3]; R(x - 2 + sw, y - 16, 6, 6, c); R(x - 1 + sw, y - 15, 2, 2, "rgba(255,255,255,.65)"); } };
  const soil = (x, y, w, h) => { R(x, y, w, h, "#7a5230"); for (let i = 0; i < h; i += 6) R(x, y + i, w, 1, "#5f3f25"); R(x, y, w, 1, "#94683f"); };
  const house = (x, y, wall, roof, w = 62, h = 34) => { R(x, y - h, w, h, wall); R(x, y - 2, w, 2, "rgba(0,0,0,.2)"); for (let i = 0; i < 14; i++) R(x - 5 + i * 2, y - h - i * 2, w + 10 - i * 4 > 0 ? w + 10 - i * 4 : 0, 2, i % 2 ? roof : mix(roof, "#000000", 0.14)); R(x + w / 2 - 6, y - 16, 12, 16, "#6b3d22"); R(x + w / 2 + 3, y - 9, 2, 2, "#e8c15a"); R(x + 7, y - 24, 11, 10, "#bde4f4"); R(x + 12, y - 24, 1, 10, "#6b3d22"); R(x + w - 18, y - 24, 11, 10, "#bde4f4"); R(x + w - 13, y - 24, 1, 10, "#6b3d22"); };
  const tree = (x, y, sc = 1) => { R(x - 3, y - 18 * sc, 6, 18 * sc, "#6b3d22"); const l = (dx, dy, w, h, c) => R(x + dx * sc, y + dy * sc, w * sc, h * sc, c); l(-15, -44, 30, 26, "#3f8a4a"); l(-11, -52, 22, 10, "#4ea552"); l(-18, -36, 36, 14, "#3f8a4a"); l(-9, -46, 10, 6, "#6fbd5c"); };
  const fence = (x, y, w) => { for (let i = 0; i <= w; i += 12) { R(x + i, y - 12, 3, 12, "#b98a55"); R(x + i, y - 12, 3, 1, "#d8b07a"); } R(x, y - 9, w, 2, "#a07440"); R(x, y - 4, w, 2, "#a07440"); };
  const coin = (x, y, s = 1, p = 0) => { const w = Math.max(2, Math.round((8 * s) * Math.abs(Math.cos(p)))); R(x - w / 2, y - 4 * s, w, 8 * s, "#f2b632"); R(x - w / 2, y - 4 * s, Math.max(1, w / 3), 8 * s, "#ffe08a"); R(x - w / 2, y + 3 * s, w, 1, "#b87f18"); };
  const gem = (x, y, s = 1) => { x = Math.round(x); y = Math.round(y); const c1 = "#ff5fa8", c2 = "#ffb0d4", c3 = "#b82f78"; const row = (dy, w, c) => R(x - w * s / 2, y + dy * s, w * s, s, c); row(-5, 4, c2); row(-4, 8, c2); row(-3, 12, c1); row(-2, 14, c1); row(-1, 14, c1); row(0, 12, c1); row(1, 10, c3); row(2, 8, c3); row(3, 6, c3); row(4, 4, c3); row(5, 2, c3); };
  const bar = (x, y, w, v, c) => { R(x - 1, y - 1, w + 2, 6, "#2b1d3a"); R(x, y, w, 4, "#54405f"); R(x, y, Math.round(w * clamp01(v)), 4, c); R(x, y, Math.round(w * clamp01(v)), 1, "rgba(255,255,255,.5)"); };
  const stall = (x, y, c) => { R(x, y - 26, 3, 26, "#7b4f2a"); R(x + 48, y - 26, 3, 26, "#7b4f2a"); for (let i = 0; i < 9; i++) R(x - 3 + i * 7, y - 34, 7, 10, i % 2 ? c : "#fff4dc"); R(x, y - 12, 51, 12, "#a07440"); R(x, y - 12, 51, 2, "#c9a06a"); };

  const hk = AT["s1:kripto"], sp = AT["s4:Speck"], nft = AT["s4:NFT"], crp = AT["s4:sharecropper"], koin = AT["s5:Koin"], pix = AT["s5:PIXEL"], ron = AT["s5:Ronin"], chp = AT["s6:Chapter"], taker = AT["s6:mengambil"], hg = AT["s7:Harga"], tetap = AT["s7:tetap"], tanam = AT["s3:Tanam"], panen = AT["s3:panen"], masak = AT["s3:masak"], ener = AT["s3:energi"], town = AT["s2:sepuluh"];
  const camX = track([
    [0, ST.farm, 0], [K.s1e, ST.farm + 18, 0],
    [K.s2 + 1, ST.town - 30, 0], [K.s2e - 0.2, ST.town + 40, 0],
    [K.s3 + 1, ST.craft - 40, 0], [K.s3e - 0.2, ST.craft + 40, 0],
    [K.s4 + 1, ST.land - 60, 0], [K.s4e - 0.3, ST.land + 90, 0],
    [K.s5 + 1, ST.market - 20, 0], [K.s5e - 0.2, ST.market + 30, 0],
    [K.s6 + 1, ST.leak - 30, 0], [K.s6e - 0.2, ST.leak + 30, 0],
    [K.s7 + 1, ST.board - 20, 0], [K.s7e - 0.2, ST.board + 20, 0],
    [K.s8 + 1, ST.camp - 16, 0], [K.dur, ST.camp + 10, 0],
  ]);
  const heroX = (t) => { const c = camX(t + 0.25)[0]; return c - 52 + Math.sin(t * 0.4) * 3; };

  return (t) => {
    const cx = Math.round(camX(t)[0] - W / 2 + 6);
    const dusk = ramp(t, K.s5e, K.s7 + 2), night = ramp(t, K.s7 + 4, K.s8 + 1.5);
    // sky bands, deliberately stepped
    const top = night > 0 ? mix(mix("#4aa8e8", "#e8785a", dusk), "#141a3c", night) : mix("#4aa8e8", "#e8785a", dusk);
    const bot = night > 0 ? mix(mix("#bfe8f4", "#ffc56a", dusk), "#2a2c5a", night) : mix("#bfe8f4", "#ffc56a", dusk);
    for (let i = 0; i < 12; i++) { const u = i / 11; const y = 160 + i * 12; const a = top.match(/\d+/g).map(Number), b = bot.match(/\d+/g).map(Number); R(0, y, W, 13, `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * u)).join(",")})`); }
    if (night > 0.05) for (const s of stars) { if ((s[2] + Math.floor(t * 2) * 0.13) % 1 > 0.2) R(s[0], s[1], 1, 1, `rgba(255,255,255,${night})`); }
    // sun sinks, moon rises
    const sy = 182 + 92 * dusk, sx = 188 - 26 * dusk;
    if (night < 0.9) { R(sx - 12, sy - 12, 24, 24, mix("#fff2b0", "#ff9a4a", dusk)); R(sx - 16, sy - 6, 32, 12, mix("#fff2b0", "#ff9a4a", dusk)); R(sx - 6, sy - 16, 12, 32, mix("#fff2b0", "#ff9a4a", dusk)); }
    if (night > 0) { const my = 214 - 26 * night; R(62, my, 18, 18, "#f4efd8"); R(66, my + 3, 4, 4, "#cfc9ae"); R(72, my + 10, 3, 3, "#cfc9ae"); }
    for (const c of clouds) { const x = ((c[0] - cx * 0.14 + t * 2.4) % 620 + 620) % 620 - 120; const col = mix(mix("#ffffff", "#ffd2a8", dusk), "#3a3c6c", night); R(x, c[1], c[2] * 2, 5, col); R(x + 6, c[1] - 4, c[2], 5, col); }
    // two hill layers parallax
    const hA = mix(mix("#79b98a", "#a86a6a", dusk), "#1e2348", night), hB = mix(mix("#5ba56a", "#7a4f5a", dusk), "#161a38", night);
    for (const h of hillA) { const x = h[0] * 1.8 - cx * 0.3; for (let i = 0; i < h[1]; i += 3) R(x - (h[1] - i) * 1.5, GY - 40 - i * 1.2, (h[1] - i) * 3, 4, hA); }
    R(0, GY - 40, W, 40, hA);
    for (const h of hillB) { const x = h[0] * 2 - cx * 0.55; for (let i = 0; i < h[1]; i += 3) R(x - (h[1] - i) * 1.3, GY - 18 - i, (h[1] - i) * 2.6, 3, hB); }
    R(0, GY - 18, W, 18, hB);
    // ground
    const gr = mix(mix("#6fbd5c", "#b98a5a", dusk * 0.6), "#26394a", night), gr2 = mix(mix("#62ad50", "#a07a50", dusk * 0.6), "#20313f", night);
    R(0, GY, W, H - GY, gr);
    for (let y = GY; y < H; y += 12) for (let x = -((cx % 24 + 24) % 24); x < W; x += 24) R(x + ((y / 12) % 2) * 12, y, 12, 12, gr2);
    for (const f of tufts) { const x = f[0] - cx; if (x > -4 && x < W + 4) { R(x, f[1], 1, 2, mix("#3f8a4a", "#1a2a38", night)); R(x + 2, f[1] + 1, 1, 1, mix("#3f8a4a", "#1a2a38", night)); if (f[2] > 0.9) { R(x - 1, f[1] - 2, 2, 2, night > 0.5 ? "#6a6a90" : "#fff4a0"); } } }
    // dirt path across the whole world
    R(0, GY + 44, W, 14, mix(mix("#c9a06a", "#a87850", dusk), "#2c3448", night)); R(0, GY + 44, W, 1, "rgba(0,0,0,.14)");
    const px = (x) => x - cx;

    // === farm ===
    if (px(ST.farm) > -240 && px(ST.farm) < W + 240) {
      tree(px(ST.farm - 120), GY + 2, 1.2); house(px(ST.farm + 74), GY + 4, "#e9dcc0", "#c4543a");
      soil(px(ST.farm - 90), GY + 8, 150, 30);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 11; i++) { const gs = clamp01((t + 0.3 - i * 0.08 - r * 0.2 + 0.5) / 2.4); crop(px(ST.farm - 84 + i * 13), GY + 14 + r * 10, t > K.s2 ? 1 : gs, r, t); }
    }
    // === town: many villagers, a crowd reads the player count ===
    if (px(ST.town) > -260 && px(ST.town) < W + 260) {
      house(px(ST.town - 170), GY + 2, "#e9dcc0", "#3b6e8f"); house(px(ST.town - 90), GY + 4, "#d9c6a0", "#c4543a", 70, 40); house(px(ST.town + 10), GY + 2, "#e9dcc0", "#6a9a4a"); house(px(ST.town + 90), GY + 4, "#d9c6a0", "#8a5ab0", 66, 36); tree(px(ST.town + 180), GY + 2);
      const crowd = ramp(t, town - 0.4, town + 1.6);
      const pals = [P.a, P.b, P.c, P.d];
      for (let i = 0; i < 26; i++) { if (i / 26 > crowd) continue; const baseX = ST.town - 160 + (i * 53) % 320 + Math.sin(t * 0.7 + i) * 8; const yy = GY + 26 + (i * 17) % 48; const w = Math.floor(t * 5 + i) % 3; char(px(baseX), yy, pals[i % 4], w, Math.sin(t * 0.7 + i) > 0 ? 1 : -1); }
    }
    // === craft: pot, table, chest ===
    if (px(ST.craft) > -240 && px(ST.craft) < W + 240) {
      soil(px(ST.craft - 110), GY + 8, 80, 24);
      for (let i = 0; i < 6; i++) for (let r = 0; r < 2; r++) { const sg = ramp(t, tanam + i * 0.15, panen - 0.1) * (1 - ramp(t, panen + i * 0.1, panen + i * 0.1 + 0.2)); crop(px(ST.craft - 104 + i * 13), GY + 14 + r * 10, sg, r, t); }
      // pot on a fire
      const pX = px(ST.craft + 2), pY = GY + 36;
      R(pX - 12, pY - 16, 24, 14, "#2b2436"); R(pX - 14, pY - 18, 28, 3, "#463c55"); R(pX - 8, pY - 2, 16, 3, "#7b4f2a");
      const cook = ramp(t, masak - 0.2, masak + 0.2);
      if (cook > 0.5) { for (let i = 0; i < 4; i++) R(pX - 8 + i * 5, pY - (Math.floor(t * 10 + i * 2) % 3), 3, 4, i % 2 ? "#ff9a30" : "#ffd65a"); for (let i = 0; i < 5; i++) { const u = (t * 0.6 + i * 0.2) % 1; R(pX - 6 + i * 3 + Math.sin(t * 2 + i) * 2, pY - 20 - u * 24, 3, 3, `rgba(255,255,255,${0.7 * (1 - u)})`); } }
      R(px(ST.craft + 54), GY + 16, 54, 6, "#a07440"); R(px(ST.craft + 58), GY + 22, 4, 18, "#7b4f2a"); R(px(ST.craft + 100), GY + 22, 4, 18, "#7b4f2a"); R(px(ST.craft + 66), GY + 6, 12, 10, "#c9d2dc"); R(px(ST.craft + 84), GY + 10, 14, 6, "#e0a23a");
    }
    // === land: small Speck vs big NFT plot ===
    if (px(ST.land) > -260 && px(ST.land) < W + 300) {
      const sX = ST.land - 118;
      const spIn = ramp(t, sp - 0.3, sp + 0.1);
      soil(px(sX), GY + 18, 44, 22); fence(px(sX - 4), GY + 18, 52); fence(px(sX - 4), GY + 44, 52);
      for (let i = 0; i < 3; i++) crop(px(sX + 8 + i * 14), GY + 34, spIn, i, t);
      const nX = ST.land + 20;
      const nIn = ramp(t, nft - 0.3, nft + 0.2);
      house(px(nX + 60), GY + 2, "#fff4dc", "#d65fa8", 82, 46);
      soil(px(nX), GY + 8, 150, 40); fence(px(nX - 6), GY + 8, 164); fence(px(nX - 6), GY + 54, 164);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 11; i++) crop(px(nX + 6 + i * 13), GY + 16 + r * 10, nIn, r + i, t);
      if (nIn > 0.5) { const ly = GY + 4 + Math.sin(t * 3) * 2; R(px(nX + 24), ly - 22, 16, 16, "#ff5fa8"); R(px(nX + 26), ly - 20, 12, 12, "#ffb0d4"); R(px(nX + 31), ly - 6, 2, 10, "#7b4f2a"); }
      const crIn = ramp(t, crp - 0.3, crp + 0.3);
      if (crIn > 0.1) { char(px(nX + 56 + Math.sin(t * 0.7) * 14), GY + 58, P.c, Math.floor(t * 6) % 3, Math.cos(t * 0.7) > 0 ? 1 : -1, ((t * 1.8) % 1)); char(px(nX + 108 + Math.sin(t * 0.5 + 2) * 12), GY + 58, P.b, Math.floor(t * 6 + 1) % 3, 1, ((t * 1.8 + 0.5) % 1)); }
    }
    // === market: coin vs PIXEL gem ===
    if (px(ST.market) > -240 && px(ST.market) < W + 240) {
      stall(px(ST.market - 106), GY + 34, "#e0485a"); stall(px(ST.market + 54), GY + 34, "#8f5bd0");
      const cIn = ramp(t, koin - 0.2, koin + 0.15), gIn = ramp(t, pix - 0.2, pix + 0.2);
      for (let i = 0; i < 5; i++) if (cIn > 0.4) coin(px(ST.market - 88 + i * 8), GY + 14 - (i % 2) * 4 + Math.sin(t * 3 + i) * 2, 1.2, t * 3 + i);
      if (gIn > 0.4) { gem(px(ST.market + 80), GY - 8 + Math.sin(t * 2.2) * 3, 3); for (let i = 0; i < 6; i++) { const a = t * 2 + i; R(px(ST.market + 80) + Math.cos(a) * 34, GY - 8 + Math.sin(a) * 26, 2, 2, "#fff"); } }
      // Ronin link: a chain of small squares heading off to the right
      const rIn = ramp(t, ron - 0.2, ron + 0.6);
      for (let i = 0; i < 12; i++) if (i / 12 < rIn) { R(px(ST.market + 92 + i * 12), GY + 44 - i * 5, 8, 8, i % 2 ? "#3a7fd6" : "#7ab8ff"); R(px(ST.market + 100 + i * 12), GY + 47 - i * 5, 4, 2, "#2b1d3a"); }
    }
    // === leak: a chest raining coins. The rain thins at Chapter 2.5; a cloaked figure carries a sack away. ===
    if (px(ST.leak) > -240 && px(ST.leak) < W + 240) {
      const cX = px(ST.leak - 24), cY = GY + 34;
      R(cX - 26, cY - 20, 52, 20, "#7b4f2a"); R(cX - 28, cY - 28, 56, 10, "#a07440"); R(cX - 4, cY - 22, 8, 8, "#f2b632"); R(cX - 28, cY - 18, 56, 2, "#5f3f25");
      const rate = 1 - 0.84 * ramp(t, chp + 0.3, chp + 2.4);
      for (let i = 0; i < 90; i++) { if (i / 90 > rate) continue; const u = (fx[i][0] + t * (0.5 + fx[i][1] * 0.3)) % 1; const a = fx[i][2] * 3.1416; coin(cX + Math.cos(a) * 80 * u, cY - 28 - Math.sin(a) * 90 * u + 120 * u * u, 1, t * 5 + i); }
      const tIn = ramp(t, taker - 1.8, taker - 0.8);
      if (tIn > 0) { for (let i = 0; i < 3; i++) { const tx = px(ST.leak + 30 + i * 28) + (t - taker) * 10; char(tx, GY + 58 + (i % 2) * 6, P.taker, Math.floor(t * 7 + i) % 3, 1); R(tx - 14, GY + 34 + (i % 2) * 6, 10, 12, "#c9a06a"); R(tx - 12, GY + 32 + (i % 2) * 6, 6, 3, "#a07440"); } }
    }
    // === board: stepped falling chart on a signboard. Two sourced endpoints, steps between are illustration. ===
    if (px(ST.board) > -240 && px(ST.board) < W + 240) {
      const bx = px(ST.board - 66), by = GY - 62;
      R(bx + 12, by + 96, 6, 44, "#7b4f2a"); R(bx + 114, by + 96, 6, 44, "#7b4f2a"); R(bx - 4, by - 4, 140, 104, "#7b4f2a"); R(bx, by, 132, 96, "#1f2e36");
      for (let i = 0; i < 4; i++) R(bx + 4, by + 12 + i * 22, 124, 1, "#34505c");
      const prog = clamp01((t - hg) / 2.4);
      const n = 44; const steps = [];
      for (let i = 0; i < n; i++) { const u = i / (n - 1); const v = Math.exp(-u * 5.2); const jitter = Math.sin(i * 7.3) * 4 * (1 - u); steps.push(by + 90 - (v * 74 + 2 + jitter * v)); }
      for (let i = 0; i < n * prog; i++) { R(bx + 6 + i * 2.8, steps[i], 3, 3, "#ff5fa8"); R(bx + 6 + i * 2.8, steps[i] + 3, 3, by + 92 - steps[i] - 3 > 0 ? by + 92 - steps[i] - 3 : 0, "rgba(255,95,168,.16)"); }
      soil(px(ST.board - 110), GY + 30, 60, 18); for (let i = 0; i < 4; i++) crop(px(ST.board - 104 + i * 14), GY + 42, 1, i, t);
    }
    // === camp: night. The game is still running. ===
    if (px(ST.camp) > -240 && px(ST.camp) < W + 240) {
      house(px(ST.camp + 46), GY + 2, "#7c7a8a", "#4a3a5a", 70, 38); R(px(ST.camp + 56), GY - 22, 11, 10, "#ffd65a"); R(px(ST.camp + 91), GY - 22, 11, 10, "#ffd65a");
      tree(px(ST.camp - 112), GY + 2, 1.1);
      soil(px(ST.camp - 80), GY + 8, 74, 22); for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) crop(px(ST.camp - 74 + i * 12), GY + 14 + r * 10, 1, r, t);
      const fxp = px(ST.camp - 4), fy = GY + 40;
      for (let i = 0; i < 6; i++) { const h = 4 + (Math.floor(t * 12 + i * 3) % 5) * 2; R(fxp - 9 + i * 3, fy - h, 3, h, i % 2 ? "#ffd65a" : "#ff8a30"); }
      R(fxp - 11, fy, 22, 3, "#5f3f25");
      gem(fxp + 42, fy - 40 + Math.sin(t * 1.6) * 2, 1.6);
      for (let i = 0; i < 30; i++) { const f = fx[i + 90]; const fx1 = px(ST.camp - 110 + f[0] * 240) + Math.sin(t * (0.6 + f[1]) + i) * 8, fy1 = GY - 10 + f[1] * 70 + Math.cos(t * (0.5 + f[2]) + i) * 6; if (Math.sin(t * 2 + i) > 0) R(fx1, fy1, 2, 2, "#e8f07a"); }
    }

    // hero walks with the camera, works while standing
    const hx = heroX(t), moving = Math.abs(heroX(t + 0.1) - hx) > 0.5;
    const hy = GY + 62;
    const work = !moving && t > K.s3 && t < K.s4 - 0.3 ? ((t * 1.9) % 1) : !moving && t < K.s2 - 0.2 ? ((t * 1.9) % 1) : !moving && t > K.s7 && t < K.s7e ? ((t * 1.4) % 1) : -1;
    const sitN = t > K.s8 + 1.2;
    char(hx - cx, hy, P.hero, moving ? Math.floor(t * 9) % 3 : 0, 1, sitN ? -1 : work, sitN);
    // energy meter: visible while farming is explained
    const enShow = t > K.s3 - 0.2 && t < K.s4 - 0.2;
    if (enShow) { const dr = ramp(t, tanam, ener + 0.4); const refill = ramp(t, AT["s3:lima"], AT["s3:makanan"]); const v = 1 - dr * 0.86 + refill * 0.66; const bx = hx - cx - 22; bar(bx, hy - 44, 44, v, v < 0.3 ? "#e0485a" : "#ffd65a"); R(bx - 8, hy - 45, 5, 6, "#ffd65a"); }
    // the hook: a gem hovers over the field with a question beat
    if (t < K.s2 - 0.1) { const hkA = ramp(t, hk - 0.3, hk); if (hkA > 0.5) gem(ST.farm + 34 - cx, GY - 26 + Math.sin(t * 2.6) * 3, 2.4); }

    // night overlay on everything below the sky
    if (dusk > 0 || night > 0) { g.fillStyle = `rgba(20,16,60,${0.12 * dusk + 0.34 * night})`; g.fillRect(0, GY - 60, W, H - GY + 60); }

    main.imageSmoothingEnabled = false;
    main.drawImage(buf, 45, 160, 180, 320, 0, 0, 1080, 1920); // crop so one art pixel is 6 output pixels
  };
}
