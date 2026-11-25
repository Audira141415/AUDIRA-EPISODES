// EP02 Khawarizmi: caption chunking. A chunk is a whole phrase (break at punctuation); long phrases
// are split into balanced pieces that never cut a noun phrase or number ("Baitul Hikmah", "empat
// puluh") and never leave a 1-word line. Lone lead-ins ("Lalu,", "Jadi,") join the next phrase.
export type CWord = { w: string; s: number; e: number };

const MAX = 34;
const NOBREAK = new Set(
  [
    "baitul hikmah", "asia tengah", "dixit algorizmi", "naskah latin", "papan pasir", "x kuadrat", "empat puluh", "puluh x",
    "delapan ratus", "ratus dua", "dua puluh", "sama dengan", "angka india", "angka arab", "kode program", "bahasa inggris",
    "ibn musa", "muhammad ibn", "khalifah al-ma'mun", "salinan latin", "buku aljabar", "sejarah islam",
    "lima x", "empat x", "tanda tambah", "cara berhitung", "abad kesembilan", "kata algoritma", "kata aljabar",
    "al-khawarizmi berkata", "bukan kata", "dan perpustakaan", "yang asalnya", "nama sarjana", "tidak ada", "ada x", "feed di", "di ponselmu", "di baghdad", "di komentar",
  ].map((s) => s),
);
const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
const len = (ws: CWord[]) => ws.reduce((n, x) => n + x.w.length + 1, 0) - 1;
const endsPunct = (w: string) => /[.,:;?!]$/.test(w);

/** Split one phrase into n balanced pieces (DP over allowed cut points). */
function split(ws: CWord[]): CWord[][] {
  if (len(ws) <= MAX || ws.length < 4) return [ws];
  const n = Math.ceil(len(ws) / MAX);
  const target = len(ws) / n;
  const N = ws.length;
  const canCut = (i: number) => !NOBREAK.has(`${bare(ws[i - 1].w)} ${bare(ws[i].w)}`);
  // best[k][i] = cost of splitting ws[0..i) into k pieces
  const best: number[][] = Array.from({ length: n + 1 }, () => Array(N + 1).fill(Infinity));
  const prev: number[][] = Array.from({ length: n + 1 }, () => Array(N + 1).fill(-1));
  best[0][0] = 0;
  for (let k = 1; k <= n; k++)
    for (let i = 1; i <= N; i++)
      for (let j = k - 1; j < i; j++) {
        if (best[k - 1][j] === Infinity) continue;
        if (i - j < 2) continue; // no 1-word piece
        if (i < N && !canCut(i)) continue;
        const piece = ws.slice(j, i);
        const over = Math.max(0, len(piece) - MAX - 6) * 50;
        const c = best[k - 1][j] + (len(piece) - target) ** 2 + over;
        if (c < best[k][i]) {
          best[k][i] = c;
          prev[k][i] = j;
        }
      }
  if (best[n][N] === Infinity) return [ws];
  const out: CWord[][] = [];
  let i = N;
  for (let k = n; k > 0; k--) {
    const j = prev[k][i];
    out.unshift(ws.slice(j, i));
    i = j;
  }
  return out;
}

export function chunkWords(words: CWord[]): CWord[][] {
  const phrases: CWord[][] = [];
  let cur: CWord[] = [];
  for (const w of words) {
    if (cur.length && w.s - cur[cur.length - 1].e > 0.7) {
      phrases.push(cur);
      cur = [];
    }
    cur.push(w);
    if (endsPunct(w.w)) {
      phrases.push(cur);
      cur = [];
    }
  }
  if (cur.length) phrases.push(cur);
  const out: CWord[][] = [];
  for (const p of phrases) out.push(...split(p));
  // lone words: join the next chunk (lead-ins) or the previous one
  for (let i = 0; i < out.length; i++) {
    if (out[i].length !== 1) continue;
    const next = out[i + 1];
    const prevC = out[i - 1];
    if (next && len(next) + out[i][0].w.length + 1 <= MAX + 8 && !/[.?!]$/.test(out[i][0].w)) {
      next.unshift(out[i][0]);
      out.splice(i--, 1);
    } else if (prevC && len(prevC) + out[i][0].w.length + 1 <= MAX + 8 && !/[.?!]$/.test(prevC[prevC.length - 1].w)) {
      prevC.push(out[i][0]);
      out.splice(i--, 1);
    }
  }
  return out;
}

/** Lay one chunk out as 1 or 2 lines: balanced, never cutting a noun phrase, never a 1-word line. */
export function toLines(ws: CWord[], oneLine = 24): CWord[][] {
  if (len(ws) <= oneLine || ws.length < 2) return [ws];
  let best = -1;
  let cost = Infinity;
  for (let i = 1; i <= ws.length - 1; i++) {
    // a line may hold one word only when that word is long enough to stand alone
    if (len(ws.slice(0, i)) < 9 || len(ws.slice(i)) < 9) continue;
    if (NOBREAK.has(`${bare(ws[i - 1].w)} ${bare(ws[i].w)}`)) continue;
    const c = Math.abs(len(ws.slice(0, i)) - len(ws.slice(i))) - (endsPunct(ws[i - 1].w) ? 6 : 0);
    if (c < cost) {
      cost = c;
      best = i;
    }
  }
  return best < 0 ? [ws] : [ws.slice(0, best), ws.slice(best)];
}
