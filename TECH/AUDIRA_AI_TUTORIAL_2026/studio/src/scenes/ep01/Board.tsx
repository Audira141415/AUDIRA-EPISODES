// EP01 tutorial board: a standing cardstock "app" panel (generic, no real product UI). Each step is
// a printed sheet on a flip-chart; when the step ends its sheet flips up over the top edge and the
// next sheet is underneath. A cut-paper cursor moves between paper buttons and presses them.
// Board-local coordinates: origin at the board centre, face toward +z, sheet area x ±4.5, y ±6.3.

import React from "react";
import { Cut, Hinge, Print, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { clamp, ease, foldEase, mix, popEase, remap } from "../../kits/paperworld/motion/easing.ts";
import { Cursor, Ripple, SlideCard, Sheet, Tag, Txt, TypeTxt, type Kind } from "./parts.tsx";

export const BOARD_W = 10, BOARD_H = 13.8;
const PW = 9.0, PH = 12.6;

const pressDip = (t: number, at?: number) => {
  if (at === undefined) return 0;
  const d = t - at;
  return d >= -0.05 && d < 0.35 ? Math.sin(clamp((d + 0.05) / 0.4) * Math.PI) : 0;
};
const pop = (t: number, at: number, dur = 0.45) => popEase(remap(t, at, at + dur));

// ── Paper button ─────────────────────────────────────────────────────────────

type BtnP = { x: number; y: number; w: number; h: number; label?: string; size?: number; color?: string; fg?: string; t: number; at?: number; selColor?: string; selFg?: string; sel?: boolean; children?: React.ReactNode; appear?: number };
const Btn: React.FC<BtnP> = ({ x, y, w, h, label, size = 0.5, color = "coral", fg = "ivoryLight", t, at, selColor, selFg, sel, children, appear }) => {
  const p = pressDip(t, at);
  const on = sel || (at !== undefined && t >= at + 0.08);
  const c = on && selColor ? selColor : color;
  const f = on && selFg ? selFg : fg;
  const hover = at !== undefined && t > at - 0.7 && t < at + 0.6 ? popEase(remap(t, at - 0.7, at - 0.35)) : 0;
  const s = appear !== undefined ? pop(t, appear) : 1;
  if (s <= 0.001) return null;
  return (
    <group position={[x, y, 0.05]} scale={[s, s, 1]}>
      {hover > 0.01 && <Cut shape={S.rectC(w + 0.34, h + 0.34, (h + 0.34) * 0.3)} color="gold" depth={0.06} position={[0, 0, -0.03]} scale={[1, 1, 1]} cast={false} />}
      <Cut shape={S.rectC(w + 0.06, h + 0.06, h * 0.3)} color="brownLight" depth={0.06} cast={false} />
      <group position={[0, -p * 0.05, 0.06 - p * 0.08]}>
        <Cut shape={S.rectC(w, h, h * 0.3)} color={c} depth={0.14} />
        {label && <Txt text={label} w={w * 0.94} h={h * 0.92} size={size} color={f} weight={900} position={[0, 0, 0.16]} />}
        <group position={[0, 0, 0.16]}>{children}</group>
      </group>
    </group>
  );
};

const Head: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => (
  <group position={[0, 5.25, 0.05]}>
    <Txt text={text} w={6.4} h={0.9} size={0.62} color="ink" weight={900} align="left" position={[-1.15, 0, 0]} />
    {sub && <Txt text={sub} w={6.4} h={0.5} size={0.34} color="brown" weight={600} align="left" position={[-1.15, -0.62, 0]} />}
    <Print shape={S.rectC(8.4, 0.05, 0.02)} color="ivoryShade" position={[0, -1.05, 0]} />
  </group>
);

const Lines: React.FC<{ x: number; y: number; w: number; n: number; gap?: number; color?: string }> = ({ x, y, w, n, gap = 0.36, color = "ivoryShade" }) => (
  <group position={[x, y, 0.06]}>
    {Array.from({ length: n }, (_, i) => (
      <Print key={i} shape={S.rectC(w * (i === n - 1 ? 0.6 : 1 - (i % 2) * 0.12), 0.13, 0.05)} color={color} position={[-(w - w * (i === n - 1 ? 0.6 : 1 - (i % 2) * 0.12)) / 2, -i * gap, 0]} />
    ))}
  </group>
);

const Check: React.FC<{ position: V3; s?: number; color?: string }> = ({ position, s = 1, color = "mintDeep" }) => (
  <group position={position} scale={s}>
    <Cut shape={S.circle(0.32)} color={color} depth={0.08} />
    <Cut shape={S.poly("ep01-check", [[-0.17, 0.0], [-0.07, -0.12], [0.18, 0.14], [0.13, 0.19], [-0.07, -0.02], [-0.12, 0.05]])} color="ivoryLight" depth={0.03} position={[0, 0, 0.08]} />
  </group>
);

// ── Screens ──────────────────────────────────────────────────────────────────

type Screen = { in: number; out: number; color?: string; draw: (t: number) => React.ReactNode };

const typed = (full: string, t: number, a: number, b: number) => full.slice(0, Math.round(clamp((t - a) / (b - a)) * full.length));
const caret = (t: number, a: number, b: number) => (t >= a - 0.4 && t <= b + 0.6 && Math.floor(t * 2.4) % 2 === 0 ? "|" : "");

const PROMPT = "Buat untuk pemula, gayanya tegas, fokus pada langkah-langkah.";
const CHAT = "Buatkan slide deck tentang topik ini";

const SCREENS: Screen[] = [
  {
    // 1 — new notebook
    in: 23.0, out: 27.89,
    draw: (t) => (
      <>
        <Head text="Notebook kamu" sub="Belum ada notebook untuk tugas ini" />
        {[-2.1, 2.1].map((x, i) => (
          <group key={x} position={[x, 1.7, 0.05]}>
            <Cut shape={S.rectC(3.8, 3.0, 0.25)} color={i ? "mintLight" : "goldLight"} depth={0.08} />
            <Lines x={0} y={0.8} w={2.8} n={3} color="ivoryLight" />
          </group>
        ))}
        <Btn x={0} y={-1.7} w={7.8} h={1.55} label="+ Buat notebook baru" size={0.6} t={t} at={26.69} selColor="coralDeep" />
        {t > 26.95 && (
          <group position={[0, -4.25, 0.05]} scale={[pop(t, 26.95), pop(t, 26.95), 1]}>
            <Cut shape={S.rectC(7.8, 2.0, 0.25)} color="cobaltLight" depth={0.1} />
            <Txt text="Notebook baru" w={5} h={0.8} size={0.52} color="ink" weight={900} align="left" position={[-0.9, 0.2, 0.12]} />
            <Txt text="0 sumber" w={5} h={0.5} size={0.34} color="cobaltDeep" weight={700} align="left" position={[-0.9, -0.45, 0.12]} />
          </group>
        )}
      </>
    ),
  },
  {
    // 2 — upload the PDF as a source
    in: 27.89, out: 30.335,
    draw: (t) => {
      const fly = ease.glide(remap(t, 28.6, 29.45));
      return (
        <>
          <Head text="Tambah sumber" sub="Unggah file dari perangkatmu" />
          <group position={[0, 1.55, 0.05]}>
            <Cut shape={S.rectC(8.2, 4.6, 0.35)} color="mintLight" depth={0.06} />
            <Cut shape={S.rectC(7.6, 4.0, 0.3)} color="ivoryLight" depth={0.03} position={[0, 0, 0.06]} />
            {fly < 0.98 && <Txt text="Taruh file di sini" w={6} h={0.7} size={0.42} color="mintDeep" weight={700} position={[0, -1.4, 0.12]} />}
            {t > 28.6 && <Sheet pdf scale={0.48} position={[mix(-7.5, 0, fly), mix(5, 0.2, fly), 0.12 + (1 - fly) * 3]} rotation={[0, (1 - fly) * 0.6, (1 - fly) * -0.7]} />}
          </group>
          <Btn x={0} y={-2.1} w={6} h={1.35} label="Unggah file" size={0.56} color="cobalt" t={t} at={28.48} selColor="cobaltDeep" />
          {t > 29.6 && (
            <group position={[0, -4.3, 0.05]} scale={[pop(t, 29.6), pop(t, 29.6), 1]}>
              <Cut shape={S.rectC(8.2, 1.5, 0.25)} color="ivoryShade" depth={0.08} />
              <Tag text="PDF" w={1.3} h={0.7} size={0.44} bg="coral" fg="ivoryLight" position={[-3.2, 0, 0.1]} />
              <Txt text="Materi kuliah · 50 halaman" w={5.6} h={0.6} size={0.4} color="ink" weight={700} align="left" position={[0.5, 0, 0.1]} />
              {t > 29.76 && <Check position={[3.5, 0, 0.1]} s={pop(t, 29.76)} />}
            </group>
          )}
        </>
      );
    },
  },
  {
    // 3 — Studio panel → Slide Deck
    in: 30.335, out: 33.274,
    draw: (t) => {
      const tiles: { x: number; y: number; c: string; deck?: boolean; icon: number }[] = [
        { x: -2.1, y: 1.5, c: "ivoryShade", icon: 0 },
        { x: 2.1, y: 1.5, c: "ivoryShade", icon: 1 },
        { x: -2.1, y: -1.75, c: "ivoryShade", icon: 2 },
        { x: 2.1, y: -1.75, c: "coralLight", deck: true, icon: 3 },
      ];
      return (
        <>
          {[["Sumber", -2.95], ["Chat", 0], ["Studio", 2.95]].map(([l, x]) => (
            <Btn key={l as string} x={x as number} y={5.1} w={2.7} h={1.05} label={l as string} size={0.46} color="ivoryShade" fg="brown"
              t={t} at={l === "Studio" ? 31.63 : undefined} selColor="gold" selFg="ink" />
          ))}
          <Print shape={S.rectC(8.4, 0.05, 0.02)} color="ivoryShade" position={[0, 4.25, 0.05]} />
          {tiles.map((k, i) => {
            const s = pop(t, 31.8 + i * 0.09);
            if (s <= 0.001) return null;
            return k.deck ? (
              <Btn key={i} x={k.x} y={k.y} w={3.9} h={2.9} color="coral" t={t} at={32.67} selColor="coralDeep" appear={31.8 + i * 0.09}>
                <group position={[0, -0.55, 0.02]} scale={0.36}>
                  <SlideCard kind="title" color="goldLight" accent="coral" brand={false} position={[0.6, -1.6, 0]} />
                  <SlideCard kind="plain" color="ivoryLight" accent="coral" position={[-0.6, -1.1, -0.4]} />
                </group>
                <Txt text="Slide Deck" w={3.6} h={0.75} size={0.5} color="ivoryLight" weight={900} position={[0, 0.95, 0.06]} />
              </Btn>
            ) : (
              <group key={i} position={[k.x, k.y, 0.05]} scale={[s, s, 1]}>
                <Cut shape={S.rectC(3.9, 2.9, 0.3)} color={k.c} depth={0.1} />
                <Cut shape={[S.circle(0.55), S.star(0.6), S.rectC(1.2, 0.9, 0.2), S.circle(0.5)][k.icon]} color={["mint", "gold", "cobaltLight", "gold"][k.icon]} depth={0.1} position={[0, 0.35, 0.1]} />
                <Print shape={S.rectC(2.2, 0.2, 0.06)} color="ivoryLight" position={[0, -0.8, 0.11]} />
              </group>
            );
          })}
          <Txt text="Pilih jenis hasil" w={6} h={0.6} size={0.38} color="brown" weight={700} position={[0, -4.3, 0.06]} />
        </>
      );
    },
  },
  {
    // 4 — settings: format, language, length, sources
    in: 33.274, out: 39.683,
    draw: (t) => {
      const rows: { l: string; y: number; at: number; kind: "chips" | "lang" | "src" }[] = [
        { l: "Format", y: 3.3, at: 35.0, kind: "chips" },
        { l: "Bahasa", y: 1.3, at: 35.98, kind: "lang" },
        { l: "Panjang", y: -0.7, at: 36.98, kind: "chips" },
        { l: "Sumber", y: -2.7, at: 38.38, kind: "src" },
      ];
      const active = rows.reduce((a, r, i) => (t >= r.at - 0.5 ? i : a), -1);
      const hy = active < 0 ? 3.3 : rows[active].y;
      return (
        <>
          <Head text="Slide Deck" sub="Atur dulu sebelum dibuat" />
          {active >= 0 && <Cut shape={S.rectC(8.6, 1.6, 0.3)} color="goldLight" depth={0.04} position={[0, hy, 0.05]} cast={false} />}
          {rows.map((r) => (
            <group key={r.l}>
              <Txt text={r.l} w={3.2} h={0.75} size={0.5} color="ink" weight={900} align="left" position={[-2.7, r.y, 0.12]} />
              {r.kind === "chips" && [0.75, 2.2, 3.65].map((x, j) => {
                const sel = t >= r.at + 0.08 ? j === 1 : j === 0;
                return <Btn key={j} x={x} y={r.y} w={1.25} h={0.8} t={t} color={sel ? "cobalt" : "ivoryShade"} at={j === 1 ? r.at : undefined}>
                  <Print shape={S.rectC(0.7, 0.14, 0.05)} color={sel ? "ivoryLight" : "brownLight"} position={[0, 0, 0.01]} />
                </Btn>;
              })}
              {r.kind === "lang" && <Btn x={2.2} y={r.y} w={4.2} h={0.85} label="Indonesia ▾" size={0.42} color="cobalt" t={t} at={r.at} selColor="cobaltDeep" />}
              {r.kind === "src" && (
                <>
                  <Btn x={1.55} y={r.y} w={2.9} h={0.85} label="PDF ✓" size={0.42} color="mint" fg="ink" t={t} at={r.at} selColor="mintDeep" />
                  <Btn x={3.75} y={r.y} w={1.25} h={0.8} color="ivoryShade" t={t} />
                </>
              )}
            </group>
          ))}
          <Txt text="format · bahasa · panjang · sumber" w={8} h={0.55} size={0.34} color="brown" weight={700} position={[0, -4.6, 0.06]} />
        </>
      );
    },
  },
  {
    // 5 — write a short brief, then Generate
    in: 39.683, out: 46.604,
    draw: (t) => {
      const txt = typed(PROMPT, t, 41.25, 44.6);
      return (
        <>
          <Head text="Arahan singkat" sub="Opsional, tapi bikin hasil lebih pas" />
          <group position={[0, 1.4, 0.05]}>
            <Cut shape={S.rectC(8.4, 4.8, 0.35)} color="brownLight" depth={0.05} />
            <Cut shape={S.rectC(8.1, 4.5, 0.3)} color="ivoryLight" depth={0.04} position={[0, 0, 0.05]} />
            <TypeTxt text={txt ? txt + caret(t, 41.25, 44.6) : "Tulis arahan…" + caret(t, 40.6, 41.25)} w={7.5} h={4.0} size={0.56} color={txt ? "ink" : "brownLight"} weight={700} align="left" lineH={1.32} position={[0, 0, 0.12]} />
          </group>
          <Btn x={0} y={-3.7} w={6.4} h={1.6} label="Generate ✦" size={0.66} t={t} at={45.9} selColor="coralDeep" />
          {[0, 1, 2, 3, 4].map((i) => {
            const d = t - 45.95 - i * 0.03;
            if (d < 0 || d > 0.7) return null;
            const a = (i / 5) * Math.PI * 2 + 0.4;
            const rr = 1.2 + d * 4.5;
            return <Cut key={i} shape={S.star(0.32)} color={i % 2 ? "gold" : "coralLight"} depth={0.06} position={[Math.cos(a) * rr * 1.6, -3.7 + Math.sin(a) * rr * 0.7, 0.5]} rotation={[0, 0, d * 6]} scale={1 - d} />;
          })}
        </>
      );
    },
  },
  {
    // 6 — generating (a few minutes)
    in: 46.604, out: 51.091,
    draw: (t) => {
      const prog = 0.08 + 0.8 * ease.out(remap(t, 46.7, 50.9));
      const spin = (t - 46.6) * 2.4;
      return (
        <>
          <Head text="Sedang dibuat…" sub="Bisa beberapa menit" />
          <group position={[0, 1.4, 0.05]}>
            <Cut shape={S.circle(2.5)} color="goldLight" depth={0.12} />
            <Cut shape={S.ring(2.2, 2.5)} color="goldDeep" depth={0.2} />
            {Array.from({ length: 12 }, (_, i) => (
              <Print key={i} shape={S.rectC(0.12, i % 3 ? 0.25 : 0.45, 0.04)} color="brown" position={[Math.sin((i / 12) * Math.PI * 2) * 1.85, Math.cos((i / 12) * Math.PI * 2) * 1.85, 0.13]} rotation={[0, 0, -(i / 12) * Math.PI * 2]} />
            ))}
            <group position={[0, 0, 0.18]} rotation={[0, 0, -spin]}>
              <Cut shape={S.rect(0.16, 1.7, 0.06)} color="ink" depth={0.05} position={[0, 0, 0]} />
            </group>
            <group position={[0, 0, 0.24]} rotation={[0, 0, -spin / 12 - 1]}>
              <Cut shape={S.rect(0.22, 1.1, 0.08)} color="coralDeep" depth={0.05} />
            </group>
            <Cut shape={S.circle(0.2)} color="ink" depth={0.1} position={[0, 0, 0.3]} />
          </group>
          <group position={[0, -2.6, 0.05]}>
            <Cut shape={S.rectC(7.6, 0.7, 0.35)} color="ivoryShade" depth={0.06} />
            <Cut shape={S.rectC(7.4 * prog, 0.5, 0.25)} color="coral" depth={0.1} position={[-3.7 + (7.4 * prog) / 2, 0, 0.04]} />
          </group>
          <Txt text="Boleh lanjut kerja sambil menunggu" w={8} h={0.6} size={0.4} color="brown" weight={700} position={[0, -3.7, 0.06]} />
        </>
      );
    },
  },
  {
    // optional — review the outline first
    in: 51.091, out: 55.778,
    draw: (t) => {
      const on = foldEase(remap(t, 52.13, 52.45));
      return (
        <>
          <Head text="Opsi: tinjau outline" sub="Cek kerangka sebelum slide dibuat" />
          <group position={[0, 3.55, 0.05]}>
            <Cut shape={S.rectC(8.4, 1.4, 0.3)} color="ivoryShade" depth={0.05} />
            <Txt text="Tinjau outline" w={4.6} h={0.75} size={0.5} color="ink" weight={900} align="left" position={[-1.6, 0, 0.08]} />
            <group position={[2.9, 0, 0.08]}>
              <Cut shape={S.rectC(1.9, 0.9, 0.45)} color={on > 0.5 ? "mintDeep" : "brownLight"} depth={0.08} />
              <Cut shape={S.circle(0.36)} color="ivoryLight" depth={0.16} position={[mix(-0.48, 0.48, on), 0, 0.04]} />
            </group>
          </group>
          {[0, 1, 2, 3].map((i) => {
            const at = 53.0 + i * 0.32;
            const s = pop(t, at);
            if (s <= 0.001) return null;
            return (
              <group key={i} position={[0, 1.6 - i * 1.45, 0.05]} scale={[s, s, 1]}>
                <Cut shape={S.rectC(8.0, 1.15, 0.25)} color="ivoryLight" depth={0.06} />
                <Txt text={String(i + 1)} w={0.7} h={0.7} size={0.5} color="coralDeep" weight={900} position={[-3.45, 0, 0.08]} />
                <Print shape={S.rectC([4.6, 3.8, 5.0, 3.2][i], 0.2, 0.06)} color="ivoryShade" position={[-2.85 + [4.6, 3.8, 5.0, 3.2][i] / 2, 0, 0.07]} />
                {t > 54.3 + i * 0.12 && <Check position={[3.4, 0, 0.08]} s={0.9 * pop(t, 54.3 + i * 0.12)} />}
              </group>
            );
          })}
        </>
      );
    },
  },
  {
    // alternative — ask in chat, then adjust via the card that appears
    in: 55.778, out: 61.324,
    draw: (t) => {
      const txt = typed(CHAT, t, 56.93, 58.9);
      const sent = t >= 59.1;
      const bub = pop(t, 59.1);
      return (
        <>
          <Head text="Cara lain: lewat chat" sub="Ketik permintaanmu" />
          {sent && (
            <group position={[0.7, 3.4, 0.05]} scale={[bub, bub, 1]}>
              <Cut shape={S.rectC(7.2, 1.4, 0.5)} color="cobalt" depth={0.08} />
              <Txt text={CHAT} w={6.8} h={1.2} size={0.4} color="ivoryLight" weight={700} position={[0, 0, 0.1]} />
            </group>
          )}
          {t > 59.98 && (
            <group position={[-0.3, 0.05, 0.05]} scale={[pop(t, 59.98), pop(t, 59.98), 1]}>
              <Cut shape={S.rectC(7.8, 3.6, 0.3)} color="goldLight" depth={0.08} />
              <Txt text="Slide Deck" w={4} h={0.7} size={0.5} color="ink" weight={900} align="left" position={[-1.7, 1.15, 0.1]} />
              {[0, 1, 2].map((i) => (
                <group key={i} position={[-2.6 + i * 2.3, 0.0, 0.1]}>
                  <Cut shape={S.rectC(2.0, 0.75, 0.3)} color={i === 0 ? "cobalt" : "ivoryLight"} depth={0.06} />
                  <Print shape={S.rectC(1.1, 0.14, 0.05)} color={i === 0 ? "ivoryLight" : "brownLight"} position={[0, 0, 0.07]} />
                </group>
              ))}
              <Txt text="atur pilihan di kartu ini" w={6} h={0.55} size={0.34} color="brown" weight={700} align="left" position={[-0.6, -1.15, 0.1]} />
            </group>
          )}
          <group position={[0, -4.4, 0.05]}>
            <Cut shape={S.rectC(8.4, 1.6, 0.5)} color="brownLight" depth={0.05} />
            <Cut shape={S.rectC(8.1, 1.3, 0.45)} color="ivoryLight" depth={0.04} position={[0, 0, 0.05]} />
            <TypeTxt text={!sent && txt ? txt + caret(t, 56.93, 58.9) : "Tanya apa saja…"} w={6.6} h={1.1} size={0.42} color={!sent && txt ? "ink" : "brownLight"} weight={700} align="left" position={[-0.55, 0, 0.12]} />
            <Cut shape={S.circle(0.48)} color={t > 58.9 && !sent ? "coralDeep" : "coral"} depth={0.12} position={[3.45, 0, 0.1]} />
            <Cut shape={S.poly("ep01-send", [[-0.2, -0.24], [0.26, 0], [-0.2, 0.24], [-0.1, 0]])} color="ivoryLight" depth={0.04} position={[3.47, 0, 0.22]} />
          </group>
        </>
      );
    },
  },
  {
    // 7 — done: three-dot menu → download PowerPoint (.pptx) or PDF
    in: 61.324, out: 66.042,
    draw: (t) => {
      const menu = pop(t, 62.78, 0.35);
      const hl = t >= 65.4 ? 2.0 : 3.1;
      return (
        <>
          <Head text="Slide Deck siap ✓" sub="Dibuat dari PDF-mu" />
          <Btn x={3.75} y={5.2} w={1.0} h={1.0} color="ivoryShade" t={t} at={62.62} selColor="gold">
            {[0.27, 0, -0.27].map((y) => <Cut key={y} shape={S.circle(0.09)} color="ink" depth={0.04} position={[0, y, 0]} />)}
          </Btn>
          {(["title", "chart", "points", "plain"] as Kind[]).map((k, i) => (
            <SlideCard key={k} kind={k} color={["coral", "cobalt", "mint", "goldLight"][i]} accent={["ivoryLight", "gold", "coral", "goldDeep"][i]}
              position={[i % 2 ? 2.05 : -2.05, i < 2 ? 1.25 : -1.95, 0.08]} scale={0.66} />
          ))}
          {menu > 0.001 && (
            <group position={[0.85, 2.55, 0.9]} scale={[menu, menu, 1]}>
              <Cut shape={S.rectC(6.9, 2.7, 0.25)} color="brownLight" depth={0.05} position={[0.08, -0.08, -0.06]} />
              <Cut shape={S.rectC(6.9, 2.7, 0.25)} color="ivoryLight" depth={0.1} />
              {t > 64.3 && <Cut shape={S.rectC(6.6, 1.05, 0.2)} color="goldLight" depth={0.03} position={[0, hl - 2.55, 0.1]} cast={false} />}
              <Txt text="Unduh PowerPoint (.pptx)" w={6.4} h={0.7} size={0.4} color="ink" weight={900} align="left" position={[0, 0.55, 0.15]} />
              <Txt text="Unduh PDF" w={6.4} h={0.7} size={0.4} color="ink" weight={900} align="left" position={[0, -0.55, 0.15]} />
            </group>
          )}
        </>
      );
    },
  },
  {
    // 8 — present full screen or share a link
    in: 66.042, out: 999,
    draw: (t) => {
      const full = ease.inOut(remap(t, 67.25, 67.9)) * (1 - ease.inOut(remap(t, 69.1, 69.6)));
      const link = pop(t, 69.9);
      return (
        <>
          <Head text="Presentasi / bagikan" sub="Langsung dari Slide Deck" />
          {full > 0.001 && <Cut shape={S.rectC(9.0, 12.6, 0.2)} color="ink" depth={0.06} position={[0, 0, 0.05]} scale={[full, full, 1]} cast={false} />}
          <SlideCard kind="title" color="coral" accent="ivoryLight" position={[0, mix(-0.9, -2.45, full), mix(0.2, 0.4, full)]} scale={mix(1.35, 1.55, full)} />
          {full < 0.5 && (
            <>
              <Btn x={-2.15} y={-4.7} w={4.1} h={1.3} label="Presentasi ⛶" size={0.44} color="cobalt" t={t} at={67.17} selColor="cobaltDeep" />
              <Btn x={2.15} y={-4.7} w={4.1} h={1.3} label="Bagikan tautan" size={0.44} color="mint" fg="ink" t={t} at={69.76} selColor="mintDeep" />
            </>
          )}
          {link > 0.001 && (
            <group position={[0, -2.6, 0.7]} scale={[link, link, 1]}>
              <Cut shape={S.rectC(6.2, 1.05, 0.5)} color="ink" depth={0.08} />
              <Txt text="Tautan disalin ✓" w={5.6} h={0.75} size={0.42} color="ivoryLight" weight={900} position={[0, 0, 0.1]} />
            </group>
          )}
        </>
      );
    },
  },
];

// ── Cursor path (board-local) ────────────────────────────────────────────────

const CK: [number, number, number][] = [
  [23.4, 4.8, -8.0], [25.2, 3.0, -4.2], [26.45, 0.9, -1.85], [27.4, 1.6, -3.3], [28.25, 0.7, -2.3], [29.6, 2.6, -4.0],
  [31.35, 3.05, 5.0], [32.4, 2.3, -2.2], [33.6, 3.0, -3.6], [34.75, 2.3, 3.2], [35.75, 2.3, 1.2], [36.75, 2.3, -0.8],
  [38.15, 1.7, -2.8], [39.5, 3.6, -5.0], [44.9, 3.4, -5.5], [45.65, 0.6, -3.85], [46.6, 3.8, -6.6], [51.85, 3.0, 3.4],
  [54.2, 1.6, -1.2], [55.5, 3.0, -5.6], [58.9, 3.2, -5.3], [59.9, 1.2, -0.5], [61.0, 3.6, -6.0], [62.4, 3.8, 5.0],
  [64.45, 1.2, 3.0], [65.35, 1.2, 1.9], [66.5, 3.4, -5.8], [66.95, -1.9, -4.95], [69.5, 2.3, -4.95], [70.9, 4.8, -8.5],
];
const PRESSES = [26.69, 28.48, 31.63, 32.67, 35.0, 35.98, 36.98, 38.38, 45.9, 52.13, 62.62, 64.66, 65.54, 67.17, 69.76];

export const cursorAt = (t: number): [number, number] => {
  if (t <= CK[0][0]) return [CK[0][1], CK[0][2]];
  for (let i = 0; i < CK.length - 1; i++) {
    const a = CK[i], b = CK[i + 1];
    if (t <= b[0]) {
      const u = ease.inOut(remap(t, a[0], b[0]));
      return [mix(a[1], b[1], u), mix(a[2], b[2], u)];
    }
  }
  const l = CK[CK.length - 1];
  return [l[1], l[2]];
};

// ── Board ────────────────────────────────────────────────────────────────────

export const Board: React.FC<{ t: number }> = ({ t }) => {
  const visible = SCREENS.map((s, i) => ({ s, i })).filter(({ s }) => t >= s.in - 0.05 && t <= s.out + 0.75);
  const [cx, cy] = cursorAt(t);
  const press = PRESSES.reduce((a, p) => Math.max(a, pressDip(t, p)), 0);
  const showCursor = t > 24.2 && t < 71;
  return (
    <group>
      {/* easel board */}
      <Cut shape={S.rectC(BOARD_W, BOARD_H, 0.45)} color="brownLight" depth={0.3} position={[0, 0, -0.32]} />
      <Cut shape={S.rectC(BOARD_W - 0.4, BOARD_H - 0.4, 0.35)} color="ivoryShade" depth={0.05} position={[0, 0, -0.02]} />
      <group position={[0, -BOARD_H / 2 + 0.3, -1.6]} rotation={[0.35, 0, 0]}>
        <Cut shape={S.rect(1.2, 6.6, 0.2)} color="brown" depth={0.2} position={[-3.2, -6.0, 0]} />
        <Cut shape={S.rect(1.2, 6.6, 0.2)} color="brown" depth={0.2} position={[3.2, -6.0, 0]} />
      </group>
      {/* AUDIRA sticker on the board's top edge */}
      <Tag text="AUDIRA" w={2.6} h={0.9} size={0.56} bg="ink" fg="ivoryLight" position={[-3.25, BOARD_H / 2 + 0.05, 0.35]} rotation={[0, 0, 0.05]} depth={0.06} />
      {/* step sheets (flip-chart: earlier sheets sit in front and flip up over the top) */}
      {visible.map(({ s, i }) => {
        const flip = foldEase(remap(t, s.out, s.out + 0.7));
        const z = 0.06 + (SCREENS.length - i) * 0.035;
        return (
          <group key={i} position={[0, flip * flip * 18, z + flip * 2.5]} visible={flip < 0.98}>
            <Hinge at={[0, PH / 2, 0]} axis="x" angle={-flip * Math.PI * 0.55}>
              <Cut shape={S.rectC(PW, PH, 0.2)} color={s.color ?? "ivoryLight"} depth={0.03} />
              {(i === 0 || t >= s.in + 0.28) && <group position={[0, 0, 0.03]}>{s.draw(t)}</group>}
            </Hinge>
          </group>
        );
      })}
      {/* binder rings at the top of the flip chart */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} position={[x, PH / 2 - 0.05, 0.6]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.32, 0.06, 8, 20]} />
          <meshPhysicalMaterial color="#bfb6aa" roughness={0.35} metalness={0.8} />
        </mesh>
      ))}
      {showCursor && (
        <>
          <Cursor position={[cx, cy, 1.6 - press * 1.1]} press={press} scale={0.9} />
          {PRESSES.map((p) => <Ripple key={p} t={t - p} position={[cx, cy, 0.9]} />)}
        </>
      )}
    </group>
  );
};

export const BOARD_SCREENS = SCREENS.length;
export const boardTilt = -0.05;
// re-export for the film's foreground cards
export { mix };
