// EP01 HUD (1080x1920 space, scaled by the Film): briefing chips, name cards, projected map
// labels, chart labels and the karaoke caption. Times come from clock.ts (timeline.json).
import React from "react";
import { FONT } from "../../core/type/fonts.ts";
import { TIMIKA, MERAUKE, pathAt } from "./world.ts";
import {
  T, SEC, CLIPS, OUTRO_AT, camAt, projW, projG, seg, win, lerp, chartWorld, SMOKE_WEEK, TOWER, type Word,
} from "./clock.ts";
import { AMBER, FIRE, GHOST, reveal26, reveal25, chartOpacity, planeScreenPos, SLAB_DY, ISPA_SLAB } from "./World3D.tsx";
import { SCHOOL } from "./world.ts";

const MONO = "Consolas, 'JetBrains Mono', 'Courier New', monospace";
const WHITE = "#F2F5F6";
const CLEAR = "#7FE0B0";
const PANEL = "rgba(7,11,14,0.84)";

const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ---------------------------------------------------------------- icons (simple line glyphs)
const Icon: React.FC<{ kind: "mic" | "podium" | "mask" | "cross" | "plane" | "school"; color: string; size?: number }> = ({ kind, color, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    {kind === "mic" && (
      <>
        <rect x="22" y="6" width="20" height="32" rx="10" />
        <path d="M14 30c0 10 8 18 18 18s18-8 18-18M32 48v10M22 58h20" />
      </>
    )}
    {kind === "podium" && (
      <>
        <path d="M14 26h36l-5 32H19z" />
        <path d="M32 26V12M26 12h12" />
        <circle cx="32" cy="40" r="4" />
      </>
    )}
    {kind === "mask" && (
      <>
        <path d="M12 24c8-4 32-4 40 0v14c-6 10-34 10-40 0z" />
        <path d="M12 28H5M52 28h7M12 34H6M52 34h6M20 30h24M20 37h24" />
      </>
    )}
    {kind === "cross" && (
      <>
        <rect x="6" y="6" width="52" height="52" rx="10" />
        <path d="M32 18v28M18 32h28" />
      </>
    )}
    {kind === "plane" && <path d="M8 36l20-4 10-20h6l-4 20 16 2 4-6h4l-2 10 2 10h-4l-4-6-16 2 4 20h-6L28 44 8 40z" />}
    {kind === "school" && (
      <>
        <path d="M6 28L32 12l26 16M12 26v28h40V26M26 54V40h12v14" />
      </>
    )}
  </svg>
);

const NameCard: React.FC<{ top: number; op: number; icon: "mic" | "podium"; name: string; role: string }> = ({ top, op, icon, name, role }) => (
  <div
    style={{
      position: "absolute", left: 60, top, opacity: op, transform: `translateX(${(1 - op) * -40}px)`,
      display: "flex", alignItems: "center", gap: 22, background: PANEL, borderLeft: `6px solid ${AMBER}`, padding: "18px 28px 18px 22px",
    }}
  >
    <div style={{ width: 84, height: 84, borderRadius: 42, border: `2px solid rgba(255,190,85,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,190,85,0.08)" }}>
      <Icon kind={icon} color={AMBER} size={52} />
    </div>
    <div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: WHITE, lineHeight: 1.05 }}>{name}</div>
      <div style={{ fontFamily: MONO, fontSize: 26, color: AMBER, marginTop: 8, letterSpacing: 1 }}>{role}</div>
    </div>
  </div>
);

const MapTag: React.FC<{ x: number; y: number; op: number; title: string; sub?: string; color: string; align?: "left" | "right"; big?: boolean }> = ({
  x, y, op, title, sub, color, align = "left", big,
}) => {
  if (op <= 0.001) return null;
  const cx = Math.max(70, Math.min(1010, x));
  return (
    <div
      style={{
        position: "absolute", left: align === "left" ? cx : undefined, right: align === "right" ? 1080 - cx : undefined, top: y, opacity: op,
        background: "rgba(7,11,14,0.84)", padding: "10px 16px", textAlign: align,
        borderLeft: align === "left" ? `5px solid ${color}` : undefined, borderRight: align === "right" ? `5px solid ${color}` : undefined,
        maxWidth: 640,
      }}
    >
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: big ? 46 : 38, letterSpacing: 1, color: WHITE, lineHeight: 1.05 }}>{title}</div>
      {sub ? <div style={{ fontFamily: MONO, fontSize: 26, color, marginTop: 8, letterSpacing: 1, whiteSpace: "pre-line", lineHeight: 1.35 }}>{sub}</div> : null}
    </div>
  );
};

const Chip: React.FC<{ x: number; y: number; op: number; text: string; color: string; fill?: boolean; size?: number }> = ({ x, y, op, text, color, fill, size = 30 }) =>
  op <= 0.001 ? null : (
    <div
      style={{
        position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * op})`, opacity: op,
        fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 2, color: fill ? "#0b0f12" : color,
        background: fill ? color : "rgba(7,11,14,0.86)", border: `2px solid ${color}`, padding: "8px 16px", whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );

// ---------------------------------------------------------------- captions (karaoke)
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Word[][] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    const groups: Word[][] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const last = i === c.words.length - 1;
      const stop = /[.:?!]$/.test(w.w);
      const comma = /,$/.test(w.w);
      const glued = /^\d/.test(w.w) && !last && /^ribu/i.test(c.words[i + 1].w);
      if (!glued && (last || (stop && cur.length >= 2) || (comma && cur.length >= 3) || cur.length >= 6)) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) groups.push(cur);
    // never leave one word alone
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length === 1) {
        if (i > 0 && groups[i - 1].length <= 6) {
          groups[i - 1].push(...groups[i]);
          groups.splice(i, 1);
          i--;
        } else if (i + 1 < groups.length) {
          groups[i + 1].unshift(...groups[i]);
          groups.splice(i, 1);
          i--;
        }
      }
    }
    out.push(...groups);
  }
  return out.map((words, i, all) => {
    const a = words[0].s - 0.08;
    const next = all[i + 1];
    const end = words[words.length - 1].e + 0.35;
    const b = next ? Math.min(Math.max(end, next[0].s - 0.08), next[0].s - 0.08 > end + 0.8 ? end : next[0].s - 0.08) : end;
    return { words, a, b };
  });
})();

const Caption: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = Math.ceil(n / 2);
  if (cut < n && /^\d/.test(ch.words[cut - 1].w) && /^ribu/i.test(ch.words[cut].w)) cut = cut + 1 < n ? cut + 1 : cut - 1;
  const lines = n <= 4 ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const op = Math.min(seg(t, ch.a, ch.a + 0.12), 1 - seg(t, ch.b - 0.1, ch.b));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", opacity: op }}>
      <div style={{ background: "rgba(7,11,14,0.8)", borderTop: `3px solid ${AMBER}`, padding: "16px 30px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {ln.map((w, i) => {
              const active = t >= w.s - 0.03 && t < w.e + 0.05;
              const spoken = t >= w.s - 0.03;
              const pop = active ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT, fontWeight: 800, fontSize: 54, lineHeight: 1.12, letterSpacing: 0.5,
                    color: active ? AMBER : spoken ? WHITE : "rgba(242,245,246,0.55)",
                    transform: `scale(${pop})`, display: "inline-block", transformOrigin: "50% 60%",
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the HUD
export const Hud: React.FC<{ t: number }> = ({ t }) => {
  const { cam } = camAt(t);
  const tk = projG(cam, ...TIMIKA, 0.72);
  const tkG = projG(cam, ...TIMIKA, 0.05);
  const mk = projG(cam, ...MERAUKE, 0.05);

  // section visibility
  const inChart = win(t, T.angka - 0.5, SEC.PENJELASAN[0] + 0.6, 0.6, 0.6);
  const inTower = win(t, T.kata - 0.8, SEC.PAYOFF[0] + 0.4, 0.6, 0.5);
  const illus = 1 - Math.max(inChart, inTower);

  // date chip text
  const date =
    t < SEC.KONTEKS[0] ? "1 JAN–30 OKT 2026" :
    t < SEC.PENGEMBANGAN[0] ? "SEJAK AKHIR SEP 2026" :
    t < T.awalNov - 0.3 ? "" : t < OUTRO_AT ? "AWAL NOV 2026" : "";

  // hook headline
  const hookShrink = seg(t, T.tapiH - 0.15, T.tapiH + 0.45);
  const hookOp = 1 - seg(t, SEC.HOOK[1] - 0.3, SEC.HOOK[1] + 0.2);

  // konteks wind arrow along the plume
  const arrowOp = win(t, T.papuaS - 0.3, T.pesawat + 0.4, 0.5, 0.5) + win(t, T.selama - 0.2, SEC.OUTRO[0] + 0.8, 0.5, 0.5);
  const arrowEnd = t > SEC.PAYOFF[0] ? 0.25 + 0.5 * seg(t, T.selama - 0.2, T.selama + 1.6) : 0.92;
  const arrowPts = Array.from({ length: 9 }, (_, i) => {
    const p = pathAt(0.08 + (arrowEnd - 0.08) * (i / 8));
    return projG(cam, p.lon - p.nx * 0.9, p.lat - p.ny * 0.9, 0.05);
  });
  const ad = arrowPts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const aA = arrowPts[arrowPts.length - 1], aB = arrowPts[arrowPts.length - 2];
  const ang = Math.atan2(aA.y - aB.y, aA.x - aB.x);
  const head = [ang + 2.6, ang - 2.6].map((r) => `${(aA.x + Math.cos(r) * 28).toFixed(1)},${(aA.y + Math.sin(r) * 28).toFixed(1)}`);
  const arrowMid = arrowPts[4];

  // chart labels
  const cOp = chartOpacity(t);
  const r26 = reveal26(t), r25 = reveal25(t);
  const tipV = r26 <= 35 ? (63856 * r26) / 35 : 63856 + ((81355 - 63856) * (r26 - 35)) / 8.3;
  const tip = projW(cam, ...chartWorld(r26, tipV));
  const pAug = projW(cam, ...chartWorld(35, 63856));
  const pOct = projW(cam, ...chartWorld(43.3, 81355));
  const p25 = projW(cam, ...chartWorld(35, 61758));
  const p0 = projW(cam, ...chartWorld(0, 0));
  const pBand = projW(cam, ...chartWorld(SMOKE_WEEK, 14000));
  const months = ([["JAN", 0], ["APR", 3], ["JUL", 6], ["OKT", 9]] as [string, number][]).map(([m, i]) => ({ m, p: projW(cam, ...chartWorld((i * 30.4 + 15) / 7, 0)) }));
  const yTicks = [20000, 40000, 60000, 80000].map((v) => ({ v, p: projW(cam, ...chartWorld(0, v)) }));
  const drawing = r26 > 0.3 && (r26 < 34.9 || (r26 > 35.1 && r26 < 43.2));

  // tower anchors
  const tw = (dx: number, y: number, dz = 0.25) => projW(cam, TOWER.x + dx, TOWER.y + y, TOWER.z + dz);
  const ispaP = tw(0.5, 0.08 + ISPA_SLAB * SLAB_DY, 0.1);
  const topP = tw(0, 1.32, 0);
  const sick = 1 - seg(t, T.jadi - 0.3, T.jadi + 0.3);


  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" }}>
      {/* readability scrims */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 640, background: "linear-gradient(180deg, rgba(7,11,14,0.9) 0%, rgba(7,11,14,0.62) 55%, rgba(7,11,14,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 720, background: "linear-gradient(0deg, rgba(7,11,14,0.97) 0%, rgba(7,11,14,0.86) 52%, rgba(7,11,14,0) 100%)" }} />

      {/* kicker + illustration / date chips */}
      <div style={{ position: "absolute", left: 60, top: 266, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: AMBER }}>● AUDIRA OSINT // 01 · MIMIKA</div>
      <div style={{ position: "absolute", right: 56, top: 262, opacity: illus, border: "2px solid rgba(242,245,246,0.7)", padding: "4px 12px", fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: WHITE, background: "rgba(7,11,14,0.7)" }}>
        ILUSTRASI
      </div>
      {date ? (
        <div style={{ position: "absolute", right: 56, top: 312, opacity: illus, fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: AMBER, background: "rgba(7,11,14,0.7)", padding: "4px 12px" }}>
          ◷ {date}
        </div>
      ) : null}

      {/* ---------------- HOOK ---------------- */}
      {hookOp > 0.001 ? (
        <div style={{ position: "absolute", left: 60, top: 312, opacity: hookOp, transformOrigin: "0 0", transform: `scale(${lerp(1, 0.56, hookShrink)})`, fontFamily: FONT, color: WHITE, lineHeight: 0.98, letterSpacing: -2 }}>
          <div style={{ fontSize: 176, fontWeight: 700 }}>
            81.<span style={{ color: AMBER }}>355</span>
          </div>
          <div style={{ fontSize: 112, fontWeight: 700 }}>KASUS ISPA</div>
          <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: 0, marginTop: 20, color: "#D9DEE2" }}>di Mimika · dihitung sejak Januari</div>
        </div>
      ) : null}
      {hookOp > 0.001 ? (
        <>
          <NameCard top={560} op={win(t, T.dinas - 0.1, SEC.HOOK[1] + 0.1, 0.35, 0.35)} icon="mic" name="Marselino Mameyao" role="PLT KADINKES MIMIKA" />
          <div style={{ position: "absolute", left: 60, top: 712, opacity: seg(t, T.bukanH - 0.15, T.bukanH + 0.25) * hookOp, background: AMBER, color: "#0b0f12", fontFamily: FONT, fontWeight: 800, fontSize: 52, padding: "10px 22px" }}>
            BUKAN CUMA SOAL ASAP
          </div>
        </>
      ) : null}
      <MapTag x={tk.x + 36} y={tk.y - 46} op={win(t, -1, T.apinya + 0.9, 0.3, 0.5) * (tk.z < 1 ? 1 : 0) * (1 - hookShrink * 0.0)} title="MIMIKA" sub={t < SEC.KONTEKS[0] ? "TIMIKA · PAPUA TENGAH" : t < T.apinya ? "TIMIKA · BERSELIMUT ASAP" : "TITIK PANAS: MINIM"} color={AMBER} />

      {/* ---------------- KONTEKS ---------------- */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, arrowOp) }}>
        <path d={ad} fill="none" stroke={AMBER} strokeWidth={6} strokeDasharray="20 12" strokeDashoffset={-t * 45} strokeLinecap="round" />
        <polyline points={`${head[0]} ${aA.x.toFixed(1)},${aA.y.toFixed(1)} ${head[1]}`} fill="none" stroke={AMBER} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Chip x={arrowMid.x} y={arrowMid.y - 50} op={Math.min(1, arrowOp)} text={t > SEC.PAYOFF[0] ? "ASAP BISA DATANG LAGI" : "ARAH ASAP →  TIMIKA"} color={AMBER} size={26} />
      <MapTag
        x={mk.x - 40} y={mk.y + 26} align="right"
        op={win(t, T.papuaS - 0.2, T.pesawat + 0.3, 0.35, 0.4) * (mk.z < 1 ? 1 : 0)}
        title="PAPUA SELATAN" sub={"MERAUKE · SUMBER API"} color={FIRE} big
      />
      {(() => {
        const pp = projW(cam, ...planeScreenPos(t));
        const op = win(t, T.pesawat - 0.1, T.sekolah - 0.25, 0.35, 0.35);
        return (
          <>
            <MapTag x={60} y={560} op={op} title="PESAWAT BERPUTAR" sub={"TAK BISA MENDARAT\nJARAK PANDANG TERTUTUP ASAP"} color={AMBER} big />
            {op > 0.01 && pp.z < 1 ? (
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: op }}>
                <circle cx={pp.x} cy={pp.y} r={34} fill="none" stroke={AMBER} strokeWidth={3} strokeDasharray="8 6" />
              </svg>
            ) : null}
          </>
        );
      })()}
      {(() => {
        const sp = projW(cam, SCHOOL.x, 0.06, SCHOOL.z);
        const op = win(t, T.sekolah - 0.1, SEC.KONTEKS[1] + 0.5, 0.35, 0.35);
        return (
          <>
            <MapTag x={60} y={560} op={op} title="SEKOLAH LIBUR TATAP MUKA" sub="BELAJAR DARI RUMAH" color={AMBER} big />
            {op > 0.01 && sp.z < 1 ? (
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: op }}>
                <line x1={sp.x} y1={sp.y} x2={200} y2={700} stroke={AMBER} strokeWidth={3} />
                <circle cx={sp.x} cy={sp.y} r={12} fill="none" stroke={AMBER} strokeWidth={3} />
              </svg>
            ) : null}
          </>
        );
      })()}

      {/* ---------------- PENGEMBANGAN (chart) ---------------- */}
      {cOp > 0.01 ? (
        <div style={{ position: "absolute", inset: 0, opacity: cOp }}>
          <div style={{ position: "absolute", left: 60, top: 318, fontFamily: FONT, fontWeight: 700, fontSize: 50, color: WHITE, lineHeight: 1.1 }}>
            Kasus ISPA kumulatif, Mimika
          </div>
          <div style={{ position: "absolute", left: 60, top: 382, fontFamily: MONO, fontSize: 26, letterSpacing: 1, color: "rgba(242,245,246,0.7)" }}>DATA: DINKES MIMIKA · DIHITUNG SEJAK 1 JAN</div>
          <div style={{ position: "absolute", left: 60, top: 420, display: "flex", gap: 28, fontFamily: MONO, fontSize: 26, color: WHITE }}>
            <span><span style={{ color: AMBER }}>━━</span> 2026</span>
            <span style={{ opacity: seg(t, T.tahunLalu - 0.2, T.tahunLalu + 0.3) }}><span style={{ color: GHOST }}>╍╍</span> 2025</span>
          </div>
          {months.map(({ m, p }) => (
            <div key={m} style={{ position: "absolute", left: p.x, top: p.y + 12, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 26, color: "rgba(242,245,246,0.8)" }}>{m}</div>
          ))}
          {yTicks.map(({ v, p }) => (
            <div key={v} style={{ position: "absolute", left: p.x + 10, top: p.y - 26, fontFamily: MONO, fontSize: 26, color: "rgba(159,195,230,0.8)" }}>{v / 1000}rb</div>
          ))}
          {/* live counter on the drawing tip */}
          {drawing ? (
            <div style={{ position: "absolute", left: tip.x - 20, top: tip.y - 70, transform: "translateX(-100%)", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: AMBER }}>{fmt(tipV)}</div>
          ) : null}
          {/* end of August */}
          {r26 >= 34.9 ? (
            <div style={{ position: "absolute", left: pAug.x + 22, top: pAug.y + 26, textAlign: "left", background: "rgba(7,11,14,0.78)", padding: "4px 12px", opacity: seg(t, T.agu1 + 1.2, T.agu1 + 1.6) }}>
              <div style={{ fontFamily: MONO, fontSize: 26, color: "rgba(242,245,246,0.85)", letterSpacing: 1 }}>akhir Agu 2026</div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: WHITE, lineHeight: 1.05 }}>63.856</div>
            </div>
          ) : null}
          <div style={{ position: "absolute", left: pAug.x - 24, top: pAug.y - 70, transform: "translateX(-100%)", opacity: win(t, T.asapBelum - 0.2, SEC.PENJELASAN[0] + 1, 0.3, 0.5), background: "#E9EEF0", color: "#0b0f12", fontFamily: MONO, fontWeight: 700, fontSize: 26, padding: "6px 12px", whiteSpace: "nowrap" }}>
            ASAP BELUM DATANG
          </div>
          <div style={{ position: "absolute", left: pBand.x + 10, top: pBand.y, opacity: seg(t, T.asapBelum - 0.3, T.asapBelum + 0.4), fontFamily: MONO, fontSize: 26, color: "#d7dde0", lineHeight: 1.3 }}>
            ASAP<br />±AKHIR SEP →
          </div>
          {r26 >= 43.2 ? (
            <div style={{ position: "absolute", left: pOct.x - 50, top: pOct.y - 172, transform: "translateX(-100%)", textAlign: "right", opacity: seg(t, T.okt + 1.6, T.okt + 2.0) }}>
              <div style={{ fontFamily: MONO, fontSize: 26, color: "rgba(242,245,246,0.8)", letterSpacing: 1 }}>30 OKT 2026</div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: AMBER, lineHeight: 1 }}>81.355</div>
            </div>
          ) : null}
          {r26 >= 43.2 ? (
            <div style={{ position: "absolute", left: pOct.x - 50, top: pOct.y - 50, transform: "translateX(-100%)", opacity: seg(t, T.okt + 1.6, T.okt + 2.0), background: "rgba(7,11,14,0.86)", padding: "4px 12px", fontFamily: FONT, fontWeight: 700, fontSize: 32, color: WHITE, whiteSpace: "nowrap" }}>
              kasus, bukan orang
            </div>
          ) : null}
          <div style={{ position: "absolute", left: p0.x + 14, top: p0.y - 64, opacity: win(t, T.sejakJan - 0.2, T.tapiP + 0.3, 0.3, 0.4), fontFamily: MONO, fontWeight: 700, fontSize: 26, color: "#0b0f12", background: AMBER, padding: "6px 12px" }}>
            ◀ MULAI 1 JANUARI
          </div>
          {r25 >= 34.8 ? (
            <div style={{ position: "absolute", left: p25.x - 26, top: p25.y + 22, transform: "translateX(-100%)", opacity: seg(t, T.tahunLalu + 1.4, T.tahunLalu + 1.8), background: "rgba(7,11,14,0.86)", borderLeft: `5px solid ${GHOST}`, padding: "6px 12px" }}>
              <div style={{ fontFamily: MONO, fontSize: 26, color: GHOST }}>2025 · periode sama</div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: WHITE }}>61.758</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ---------------- PENJELASAN (tower) ---------------- */}
      {inTower > 0.01 ? (
        <div style={{ position: "absolute", inset: 0, opacity: inTower }}>
          <NameCard top={318} op={win(t, T.kata - 0.15, T.sepuluh - 0.15, 0.35, 0.3)} icon="mic" name="Marselino Mameyao" role="PLT KEPALA DINKES MIMIKA" />
          <Chip x={topP.x} y={topP.y - 40} op={win(t, T.sepuluh - 0.1, T.jadi, 0.35, 0.4)} text="10 BESAR PENYAKIT · MIMIKA" color={WHITE} size={26} />
          {ispaP.z < 1 ? (
            <div style={{ position: "absolute", left: ispaP.x + 14, top: ispaP.y - 36, opacity: win(t, T.sepuluh - 0.2, T.jadi, 0.4, 0.4), background: AMBER, color: "#0b0f12", padding: "6px 14px" }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>ISPA</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26 }}>SELALU MASUK</div>
            </div>
          ) : null}
          {(() => {
            const b = tw(-0.72, 1.05), f = tw(-0.78, 0.72), d = tw(-0.7, 0.38);
            const a = tw(0.72, 0.62), tb = tw(0.75, 0.36), pn = tw(0.66, 0.12);
            const calm = 1 - 0.55 * seg(t, T.asapD, T.asapD + 0.5);
            return (
              <>
                <Chip x={b.x} y={b.y} op={win(t, T.batuk - 0.1, T.jadi, 0.3, 0.4) * calm} text="BATUK" color={WHITE} />
                <Chip x={f.x} y={f.y} op={win(t, T.flu - 0.1, T.jadi, 0.3, 0.4) * calm} text="FLU BIASA" color={WHITE} />
                <Chip x={d.x} y={d.y} op={win(t, T.debu - 0.1, T.jadi, 0.3, 0.4) * calm} text="DEBU KEMARAU" color="#d8c49a" />
                <Chip x={a.x} y={a.y - 90} op={win(t, T.memperberat - 0.1, T.jadi, 0.3, 0.4) * sick} text="▲ DIPERBERAT ASAP" color={FIRE} size={26} />
                <Chip x={a.x} y={a.y} op={win(t, T.asma - 0.1, T.jadi, 0.3, 0.4)} text="ASMA" color={FIRE} fill />
                <Chip x={tb.x} y={tb.y} op={win(t, T.tbc - 0.1, T.jadi, 0.3, 0.4)} text="TBC" color={FIRE} fill />
                <Chip x={pn.x} y={pn.y} op={win(t, T.pneu - 0.1, T.jadi, 0.3, 0.4)} text="PNEUMONIA" color={FIRE} fill />
              </>
            );
          })()}
          <div style={{ position: "absolute", left: 60, right: 60, top: 318, opacity: seg(t, T.jadi - 0.1, T.jadi + 0.35), background: PANEL, borderLeft: `6px solid ${AMBER}`, padding: "22px 28px" }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, color: WHITE, lineHeight: 1 }}>
              81.355 <span style={{ color: AMBER }}>KASUS</span>
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, color: WHITE, marginTop: 14, opacity: seg(t, T.bukanO - 0.1, T.bukanO + 0.3) }}>
              ≠ 81.355 <span style={{ textDecoration: "line-through", textDecorationColor: FIRE, textDecorationThickness: 6 }}>orang</span>
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#0b0f12", background: "#E9EEF0", display: "inline-block", padding: "6px 14px", marginTop: 18, opacity: seg(t, T.tidak - 0.1, T.tidak + 0.3) }}>
              TIDAK SEMUANYA KARENA ASAP
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------------- PAYOFF ---------------- */}
      {(() => {
        const op = win(t, T.bupati - 0.15, T.awalNov - 0.2, 0.35, 0.45);
        if (op <= 0.001) return null;
        return (
          <>
            <NameCard top={318} op={op} icon="podium" name="Johannes Rettob" role="BUPATI MIMIKA" />
            <div style={{ position: "absolute", left: 60, right: 60, top: 476, opacity: op * seg(t, T.meminta - 0.15, T.meminta + 0.3), background: PANEL, padding: "16px 24px" }}>
              <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: AMBER }}>PERMINTAAN KE PUSAT</div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: WHITE, marginTop: 10 }}>① Padamkan sumber api di Papua Selatan</div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: WHITE, marginTop: 8, opacity: seg(t, T.memperhatikan - 0.15, T.memperhatikan + 0.3) }}>② Perhatikan Papua setara Kalimantan</div>
            </div>
          </>
        );
      })()}
      <MapTag x={mk.x - 40} y={mk.y + 30} align="right" op={win(t, T.meminta + 0.4, T.awalNov - 0.2, 0.4, 0.4) * (mk.z < 1 ? 1 : 0)} title="SUMBER API" sub="PAPUA SELATAN · MERAUKE" color={FIRE} />
      <MapTag
        x={tkG.x + 30} y={tkG.y - 150}
        op={win(t, T.membaik - 0.4, T.tapiT + 0.6, 0.35, 0.4) * (tkG.z < 1 ? 1 : 0)}
        title="UDARA TIMIKA MEMBAIK" sub="AWAL NOV 2026" color={CLEAR} big
      />
      <MapTag
        x={mk.x - 30} y={mk.y - 190} align="right"
        op={win(t, T.naik - 0.9, SEC.PAYOFF[1] + 0.3, 0.35, 0.4) * (mk.z < 1 ? 1 : 0)}
        title="▲ TITIK PANAS NAIK LAGI" sub="PAPUA SELATAN" color={FIRE} big
      />

      {/* ---------------- OUTRO ---------------- */}
      {(() => {
        const a = win(t, T.pakai - 0.15, OUTRO_AT + 0.3, 0.35, 0.3);
        const b = win(t, T.segera - 0.15, OUTRO_AT + 0.3, 0.35, 0.3);
        if (a <= 0.001) return null;
        const row = (op: number, icon: "mask" | "cross", title: string, sub: string, top: number) => (
          <div style={{ position: "absolute", left: 60, right: 60, top, opacity: op, transform: `translateY(${(1 - op) * 30}px)`, display: "flex", gap: 24, alignItems: "center", background: PANEL, borderLeft: `6px solid ${CLEAR}`, padding: "18px 24px" }}>
            <Icon kind={icon} color={CLEAR} size={84} />
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: WHITE, lineHeight: 1.05 }}>{title}</div>
              <div style={{ fontFamily: MONO, fontSize: 26, color: CLEAR, marginTop: 6 }}>{sub}</div>
            </div>
          </div>
        );
        return (
          <>
            {row(a, "mask", "Pakai masker", "SAAT UDARA BERASAP", 330)}
            {row(b, "cross", "Sesak? Ke puskesmas", "SEGERA PERIKSAKAN", 480)}
          </>
        );
      })()}

      <Caption t={t} />
    </div>
  );
};
