// EP04 tablet screen: a GENERIC chat-assistant interface (no real logos) redrawn every frame from
// the VO clock. Step 1 sign in, step 2 upload (Foto / Video / Audio), step 3 the typed question,
// then the two checks, the video result and the photo metadata. 1000x812 canvas.
import { drawLandscape } from "./textures.ts";
import { C, SEC, W, clamp01, easeOut, pop, ramp } from "./tl.ts";

export const SW = 1000, SH = 812;
const MONO = "'IBM Plex Mono', 'Courier New', monospace";
const ANTON = "'Anton', 'Impact', sans-serif";
const AMBER = "#FFBE55", RED = "#FF4A2E", GREEN = "#10B981", MINT = "#6effd6";

const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

let thumbCanvas: HTMLCanvasElement | null = null;
const thumb = () => {
  if (!thumbCanvas) {
    thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 250;
    thumbCanvas.height = 180;
    const g = thumbCanvas.getContext("2d")!;
    g.scale(0.25, 0.25);
    drawLandscape(g);
  }
  return thumbCanvas;
};

const cursor = (ctx: CanvasRenderingContext2D, x: number, y: number, press: number) => {
  // press: 0 none, >0 time since click (s) for ripple
  if (press > 0 && press < 0.6) {
    const k = press / 0.6;
    ctx.strokeStyle = `rgba(255,190,85,${1 - k})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, 18 + k * 70, 0, Math.PI * 2);
    ctx.stroke();
  }
  const s = press > 0 && press < 0.18 ? 0.86 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * 1.5, s * 1.5);
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 34);
  ctx.lineTo(9, 26);
  ctx.lineTo(16, 41);
  ctx.lineTo(22, 38);
  ctx.lineTo(15, 24);
  ctx.lineTo(27, 24);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const path = (t: number, t0: number, t1: number, from: [number, number], to: [number, number]): [number, number] => {
  const k = easeOut(ramp(t, t0, t1));
  return [lerp(from[0], to[0], k), lerp(from[1], to[1], k) - Math.sin(k * Math.PI) * 40];
};

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxW: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (ctx.measureText(next).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};

// beats (VO seconds)
const T = {
  s1: SEC.langkah[0],
  login: W("l06", "akunmu").s,
  s2: C("l07").start,
  plus: W("l07", "unggah").s + 0.35,
  foto: W("l07", "foto").s,
  video: W("l07", "video").s,
  audio: W("l07", "audio").s,
  pick: W("l07", "audio").e + 0.15,
  s3: C("l08").start,
  type0: W("l08", "apakah").s,
  send: C("l08").end + 0.12,
  check: C("l09").start,
  c1: C("l10").start,
  c1done: C("l10").end - 0.15,
  c2: W("l11", "content").s,
  c2done: W("l11", "paspor").s,
  res: C("l12").start,
  vid: C("l13").start,
  bagian: W("l13", "bagian").s,
  meta: C("l14").end,
  model: W("l15", "model").s,
  tanggal: W("l15", "tanggal").s,
};
const PROMPT = "Apakah ini dibuat atau diedit oleh AI Google?";

/** Characters of the prompt typed by time t, following the VO word timings. */
const typed = (t: number) => {
  const words = C("l08").words;
  const i0 = words.findIndex((w) => w.s >= T.type0 - 0.001);
  const ws = words.slice(i0);
  const target = PROMPT.split(" ");
  let out = "";
  ws.forEach((w, i) => {
    const k = clamp01((t - w.s) / Math.max(0.08, w.e - w.s));
    const word = target[i] ?? "";
    if (k <= 0) return;
    out += (i ? " " : "") + word.slice(0, Math.ceil(word.length * k));
  });
  return out;
};

const header = (ctx: CanvasRenderingContext2D, signedIn: number) => {
  ctx.fillStyle = "#15181d";
  ctx.fillRect(0, 0, SW, 96);
  ctx.fillStyle = "#2E3238";
  ctx.fillRect(0, 95, SW, 2);
  ctx.fillStyle = "#F3EFE6";
  ctx.font = `600 42px ${MONO}`;
  ctx.textAlign = "left";
  ctx.fillText("Gemini", 40, 62);
  ctx.fillStyle = "#7d8590";
  ctx.font = `500 24px ${MONO}`;
  ctx.fillText("asisten AI", 220, 60);
  // account avatar
  ctx.lineWidth = 4;
  ctx.strokeStyle = signedIn > 0 ? GREEN : "#7d8590";
  ctx.beginPath();
  ctx.arc(930, 48, 28, 0, Math.PI * 2);
  ctx.stroke();
  if (signedIn > 0) {
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.arc(930, 48, 22 * pop(signedIn), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1D1D1B";
    ctx.font = `400 28px ${ANTON}`;
    ctx.textAlign = "center";
    ctx.fillText("K", 930, 59);
    ctx.textAlign = "left";
  }
};

const promptBar = (ctx: CanvasRenderingContext2D, t: number, attach: number, text: string, sendPress: number) => {
  const top = attach > 0 ? 560 : 664;
  rr(ctx, 30, top, 940, 780 - top, 30);
  ctx.fillStyle = "#1c2027";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = text ? AMBER : "#3a404a";
  ctx.stroke();
  if (attach > 0) {
    ctx.save();
    ctx.globalAlpha = clamp01(attach * 2);
    const s = pop(attach);
    ctx.translate(60, 580);
    ctx.scale(s, s);
    rr(ctx, 0, 0, 125, 90, 12);
    ctx.save();
    ctx.clip();
    ctx.drawImage(thumb(), 0, 0, 125, 90);
    ctx.restore();
    ctx.fillStyle = "#cfd5dd";
    ctx.font = `600 28px ${MONO}`;
    ctx.fillText("foto_B.jpg", 145, 55);
    ctx.restore();
  }
  // + button with label
  ctx.fillStyle = "#2a3039";
  rr(ctx, 50, 690, 290, 70, 35);
  ctx.fill();
  ctx.fillStyle = "#F3EFE6";
  ctx.font = `400 50px ${ANTON}`;
  ctx.fillText("+", 74, 745);
  ctx.font = `600 30px ${MONO}`;
  ctx.fillText("Unggah file", 116, 736);
  // text / placeholder
  ctx.font = `500 34px ${MONO}`;
  if (text) {
    ctx.fillStyle = "#F3EFE6";
    const lines = wrap(ctx, text, 560);
    const shown = lines.slice(-2);
    shown.forEach((l, i) => ctx.fillText(l, 360, 708 - (shown.length - 1 - i) * 44 + (shown.length === 1 ? 26 : 26)));
    if (Math.floor(t * 2.5) % 2 === 0) {
      const last = shown[shown.length - 1];
      const w = ctx.measureText(last).width;
      ctx.fillRect(362 + w, 708, 4, 36);
    }
  } else {
    ctx.fillStyle = "#6b727c";
    ctx.fillText("Tanya apa saja", 360, 736);
  }
  // send button
  ctx.fillStyle = text ? AMBER : "#2a3039";
  ctx.beginPath();
  ctx.arc(915, 725, 36 * (sendPress > 0 && sendPress < 0.15 ? 0.88 : 1), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = text ? "#1D1D1B" : "#6b727c";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(915, 745);
  ctx.lineTo(915, 705);
  ctx.moveTo(898, 720);
  ctx.lineTo(915, 703);
  ctx.lineTo(932, 720);
  ctx.stroke();
};

/** Step 3: the prompt box fills the screen so the typed question reads at phone size. */
const bigPrompt = (ctx: CanvasRenderingContext2D, t: number, text: string, sendPress: number) => {
  rr(ctx, 30, 126, 940, 660, 30);
  ctx.fillStyle = "#1c2027";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = AMBER;
  ctx.stroke();
  rr(ctx, 64, 160, 190, 137, 14);
  ctx.save();
  ctx.clip();
  ctx.drawImage(thumb(), 64, 160, 190, 137);
  ctx.restore();
  ctx.fillStyle = "#cfd5dd";
  ctx.font = `600 34px ${MONO}`;
  ctx.fillText("foto_B.jpg", 280, 240);
  ctx.font = `600 54px ${MONO}`;
  ctx.fillStyle = "#F3EFE6";
  const lines = wrap(ctx, text, 860);
  lines.forEach((l, i) => ctx.fillText(l, 64, 400 + i * 72));
  if (Math.floor(t * 2.5) % 2 === 0) {
    const last = lines[lines.length - 1] ?? "";
    ctx.fillStyle = AMBER;
    ctx.fillRect(68 + ctx.measureText(last).width, 352 + Math.max(0, lines.length - 1) * 72, 6, 60);
  }
  ctx.fillStyle = "#2a3039";
  rr(ctx, 64, 690, 300, 70, 35);
  ctx.fill();
  ctx.fillStyle = "#F3EFE6";
  ctx.font = `400 50px ${ANTON}`;
  ctx.fillText("+", 88, 745);
  ctx.font = `600 30px ${MONO}`;
  ctx.fillText("Unggah file", 130, 736);
  const r = 46 * (sendPress > 0 && sendPress < 0.15 ? 0.86 : 1);
  ctx.fillStyle = AMBER;
  ctx.beginPath();
  ctx.arc(900, 722, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1D1D1B";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(900, 746);
  ctx.lineTo(900, 698);
  ctx.moveTo(880, 716);
  ctx.lineTo(900, 696);
  ctx.lineTo(920, 716);
  ctx.stroke();
};

const userBubble = (ctx: CanvasRenderingContext2D, y: number, a: number) => {
  ctx.save();
  ctx.globalAlpha = a;
  rr(ctx, 300, y, 670, 150, 26);
  ctx.fillStyle = "#2a3039";
  ctx.fill();
  rr(ctx, 320, y + 20, 150, 108, 12);
  ctx.save();
  ctx.clip();
  ctx.drawImage(thumb(), 320, y + 20, 150, 108);
  ctx.restore();
  ctx.fillStyle = "#F3EFE6";
  ctx.font = `500 27px ${MONO}`;
  wrap(ctx, PROMPT, 460).forEach((l, i) => ctx.fillText(l, 490, y + 50 + i * 34));
  ctx.restore();
};

const checkRow = (ctx: CanvasRenderingContext2D, t: number, y: number, n: string, label: string, on: number, done: number) => {
  const active = t >= on && t < done;
  const ok = t >= done;
  rr(ctx, 30, y, 940, 104, 18);
  ctx.fillStyle = active ? "rgba(255,190,85,0.12)" : "#1a1e24";
  ctx.fill();
  ctx.lineWidth = active ? 5 : 3;
  ctx.strokeStyle = ok ? GREEN : active ? AMBER : "#3a404a";
  ctx.stroke();
  ctx.fillStyle = ok ? GREEN : active ? AMBER : "#7d8590";
  ctx.font = `400 64px ${ANTON}`;
  ctx.fillText(n, 62, y + 78);
  ctx.fillStyle = "#F3EFE6";
  ctx.font = `600 40px ${MONO}`;
  ctx.fillText(label, 130, y + 66);
  // status glyph
  const cx = 910, cy = y + 52;
  if (ok) {
    const k = pop(ramp(t, done, done + 0.35));
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(cx - 22 * k, cy);
    ctx.lineTo(cx - 6 * k, cy + 16 * k);
    ctx.lineTo(cx + 24 * k, cy - 18 * k);
    ctx.stroke();
  } else if (active) {
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 7;
    ctx.beginPath();
    const a0 = t * 7;
    ctx.arc(cx, cy, 24, a0, a0 + 4.2);
    ctx.stroke();
  }
};

export function drawScreen(ctx: CanvasRenderingContext2D, t: number) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textAlign = "left";
  ctx.fillStyle = "#0f1216";
  ctx.fillRect(0, 0, SW, SH);
  // faint scanlines for the screen surface
  ctx.fillStyle = "rgba(255,255,255,0.018)";
  for (let y = 0; y < SH; y += 6) ctx.fillRect(0, y, SW, 2);

  if (t < T.s1 - 0.6) {
    ctx.fillStyle = "#7d8590";
    ctx.font = `600 40px ${MONO}`;
    ctx.textAlign = "center";
    ctx.fillText("TERMINAL PEMERIKSA", SW / 2, SH / 2);
    return;
  }
  header(ctx, t >= T.login + 0.15 ? ramp(t, T.login + 0.15, T.login + 0.5) : 0);

  if (t < T.s2) {
    // STEP 1: sign in
    ctx.textAlign = "center";
    ctx.fillStyle = "#F3EFE6";
    ctx.font = `400 76px ${ANTON}`;
    ctx.fillText("Masuk ke akunmu", SW / 2, 290);
    const done = t >= T.login + 0.15;
    rr(ctx, 270, 380, 460, 130, 65);
    ctx.fillStyle = done ? GREEN : AMBER;
    ctx.fill();
    ctx.fillStyle = "#1D1D1B";
    ctx.font = `400 66px ${ANTON}`;
    ctx.fillText(done ? "✓ Sudah masuk" : "Masuk", SW / 2, 468);
    ctx.textAlign = "left";
    const [x, y] = path(t, T.s1 + 0.2, T.login, [860, 760], [520, 450]);
    cursor(ctx, x, y, t >= T.login ? t - T.login : 0);
    return;
  }
  if (t < T.s3) {
    // STEP 2: upload
    ctx.textAlign = "center";
    ctx.fillStyle = "#59606b";
    ctx.font = `400 58px ${ANTON}`;
    ctx.fillText("Ada yang bisa dibantu?", SW / 2, 250);
    ctx.textAlign = "left";
    const attach = t >= T.pick ? ramp(t, T.pick + 0.1, T.pick + 0.5) : 0;
    promptBar(ctx, t, attach, "", 0);
    const menu = t >= T.plus && t < T.pick + 0.1 ? ramp(t, T.plus, T.plus + 0.25) : 0;
    if (menu > 0) {
      const items: [string, number][] = [["Foto", T.foto], ["Video", T.video], ["Audio", T.audio]];
      ctx.save();
      ctx.globalAlpha = clamp01(menu * 1.5);
      ctx.translate(0, (1 - easeOut(menu)) * 30);
      rr(ctx, 40, 300, 420, 370, 22);
      ctx.fillStyle = "#232831";
      ctx.fill();
      ctx.strokeStyle = "#3a404a";
      ctx.lineWidth = 3;
      ctx.stroke();
      items.forEach(([label, at], i) => {
        const y = 320 + i * 114;
        const hot = t >= at;
        rr(ctx, 56, y, 388, 100, 16);
        ctx.fillStyle = hot ? (i === 0 ? "rgba(255,190,85,0.28)" : "rgba(255,255,255,0.07)") : "transparent";
        ctx.fill();
        // icon
        ctx.strokeStyle = hot ? AMBER : "#9aa3ad";
        ctx.lineWidth = 5;
        if (i === 0) {
          ctx.strokeRect(80, y + 26, 56, 48);
          ctx.beginPath();
          ctx.moveTo(84, y + 70);
          ctx.lineTo(104, y + 48);
          ctx.lineTo(120, y + 62);
          ctx.lineTo(132, y + 52);
          ctx.stroke();
        } else if (i === 1) {
          ctx.strokeRect(80, y + 28, 44, 44);
          ctx.beginPath();
          ctx.moveTo(124, y + 44);
          ctx.lineTo(140, y + 32);
          ctx.lineTo(140, y + 68);
          ctx.lineTo(124, y + 56);
          ctx.stroke();
        } else {
          ctx.beginPath();
          for (let k = 0; k < 7; k++) {
            const h = [10, 26, 40, 18, 34, 22, 12][k];
            ctx.moveTo(82 + k * 9, y + 50 - h / 2);
            ctx.lineTo(82 + k * 9, y + 50 + h / 2);
          }
          ctx.stroke();
        }
        ctx.fillStyle = "#F3EFE6";
        ctx.font = `400 58px ${ANTON}`;
        ctx.fillText(label, 170, y + 72);
      });
      ctx.restore();
    }
    // cursor: to "+", then to "Foto"
    let pos: [number, number];
    if (t < T.plus) pos = path(t, T.s2, T.plus, [700, 420], [150, 725]);
    else pos = path(t, T.plus + 0.3, T.pick, [150, 725], [300, 380]);
    const press = t >= T.pick ? t - T.pick : t >= T.plus ? t - T.plus : 0;
    cursor(ctx, pos[0], pos[1], press);
    return;
  }
  if (t < T.check) {
    // STEP 3: ask
    const sent = t >= T.send + 0.1;
    if (!sent) {
      bigPrompt(ctx, t, typed(t), t >= T.send ? t - T.send : 0);
      const [x, y] = path(t, T.send - 0.9, T.send, [700, 560], [900, 728]);
      cursor(ctx, x, y, t >= T.send ? t - T.send : 0);
    } else {
      const k = easeOut(ramp(t, T.send + 0.1, T.send + 0.5));
      userBubble(ctx, lerp(560, 120, k), 1);
      promptBar(ctx, t, 0, "", 0);
    }
    return;
  }
  if (t < T.res) {
    // two checks
    userBubble(ctx, 120, 1);
    ctx.fillStyle = MINT;
    ctx.font = `400 60px ${ANTON}`;
    ctx.fillText("Memeriksa 2 hal", 40, 352);
    checkRow(ctx, t, 400, "1", "Tanda air SynthID", T.c1, T.c1done);
    checkRow(ctx, t, 528, "2", "Content Credentials", T.c2, T.c2done);
    ctx.globalAlpha = 0.6;
    promptBar(ctx, t, 0, "", 0);
    ctx.globalAlpha = 1;
    return;
  }
  if (t < T.meta) {
    // result: SynthID found; video segments
    ctx.fillStyle = RED;
    rr(ctx, 30, 120, 520, 76, 14);
    ctx.fill();
    ctx.fillStyle = "#FFF6EE";
    ctx.font = `400 50px ${ANTON}`;
    ctx.fillText("SynthID DITEMUKAN", 52, 178);
    ctx.fillStyle = "#F3EFE6";
    ctx.font = `600 36px ${MONO}`;
    ctx.fillText("Video: bagian yang terdeteksi", 40, 260);
    rr(ctx, 790, 214, 170, 60, 10);
    ctx.strokeStyle = "#9aa3ad";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#cfd5dd";
    ctx.font = `700 32px ${MONO}`;
    ctx.fillText("CONTOH", 812, 256);
    const a = ramp(t, T.vid - 0.2, T.vid + 0.4);
    ctx.save();
    ctx.globalAlpha = a;
    const fx = 40, fy = 300, fw = 112, fh = 150;
    ctx.fillStyle = "#08090b";
    ctx.fillRect(fx - 10, fy - 26, 8 * (fw + 4) + 16, fh + 52);
    for (let i = 0; i < 8; i++) {
      const x = fx + i * (fw + 4);
      ctx.save();
      rr(ctx, x, fy, fw, fh, 6);
      ctx.clip();
      ctx.drawImage(thumb(), 30 + i * 12, 10, 120, 160, x, fy, fw, fh);
      ctx.restore();
      ctx.fillStyle = "#d9dce2";
      for (let h = 0; h < 6; h++) {
        ctx.fillRect(x + 8 + h * 18, fy - 18, 9, 9);
        ctx.fillRect(x + 8 + h * 18, fy + fh + 9, 9, 9);
      }
      ctx.fillStyle = "#9aa3ad";
      ctx.font = `600 30px ${MONO}`;
      ctx.fillText(`0:${String(i * 2).padStart(2, "0")}`, x + 14, fy + fh + 64);
    }
    const b = ramp(t, T.bagian, T.bagian + 0.35);
    if (b > 0) {
      const x0 = fx + 2 * (fw + 4) - 6, x1 = fx + 5 * (fw + 4) - 4 + 6;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 8;
      ctx.globalAlpha = a * b;
      ctx.strokeRect(x0, fy - 34, x1 - x0, fh + 70);
      ctx.fillStyle = "rgba(255,74,46,0.22)";
      ctx.fillRect(x0, fy - 34, x1 - x0, fh + 70);
      ctx.fillStyle = RED;
      rr(ctx, x0, fy + fh + 90, x1 - x0, 76, 12);
      ctx.fill();
      ctx.fillStyle = "#FFF6EE";
      ctx.font = `400 46px ${ANTON}`;
      ctx.textAlign = "center";
      ctx.fillText("CONTOH: 0:04 – 0:10", (x0 + x1) / 2, fy + fh + 145, x1 - x0 - 24);
      ctx.textAlign = "left";
    }
    ctx.restore();
    return;
  }
  // photo metadata
  ctx.fillStyle = "#F3EFE6";
  ctx.font = `400 72px ${ANTON}`;
  ctx.fillText("Metadata foto", 40, 200);
  ctx.fillStyle = "#7d8590";
  ctx.font = `600 26px ${MONO}`;
  ctx.fillText("CONTOH", 560, 196);
  rr(ctx, 40, 240, 300, 216, 14);
  ctx.save();
  ctx.clip();
  ctx.drawImage(thumb(), 40, 240, 300, 216);
  ctx.restore();
  const rows: [string, string, number][] = [
    ["Model kamera", "KAMERA-X 12", T.model],
    ["Tanggal ambil", "14-08-2026 07.32", T.tanggal],
  ];
  rows.forEach(([k, v, at], i) => {
    const y = 520 + i * 130;
    const a = ramp(t, at - 0.1, at + 0.3);
    rr(ctx, 30, y, 940, 110, 16);
    ctx.fillStyle = a > 0 ? "rgba(255,190,85,0.12)" : "#1a1e24";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = a > 0 ? AMBER : "#3a404a";
    ctx.stroke();
    ctx.fillStyle = "#9aa3ad";
    ctx.font = `600 34px ${MONO}`;
    ctx.fillText(k, 60, y + 68);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "#F3EFE6";
    ctx.font = `400 56px ${ANTON}`;
    ctx.fillText(v, 440 + (1 - easeOut(a)) * 40, y + 78);
    ctx.restore();
  });
  // EXIF-style tag lines next to the thumbnail
  ctx.fillStyle = "#59606b";
  ctx.font = `500 26px ${MONO}`;
  ["ISO 200", "f/2.0", "1/250 s", "JPEG"].forEach((s, i) => ctx.fillText(s, 370, 280 + i * 46));
}
