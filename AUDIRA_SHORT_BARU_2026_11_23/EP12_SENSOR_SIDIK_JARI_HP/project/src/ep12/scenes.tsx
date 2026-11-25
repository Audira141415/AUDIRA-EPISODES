// EP12 scenes S1–S10 (BONGKAR look). Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
import React from "react";
import {
  C, FONT, Defs, Contact, Label, Header, Fingerprint, FingerPad, MINUTIAE, ridgeField, Slab, topMatrix, isoP, Phone, Lock, Thumb, Check, Cross,
  hash, ramp, ease, easeOut, lerp, pop, mix, circle, type Iso,
} from "./pieces";

export type SceneProps = { t: number; lt: number };

const Frame: React.FC<{ children: React.ReactNode; id: string; zoom?: number; ox?: number; oy?: number; header?: React.ReactNode }> = ({ children, id, zoom = 1, ox = 540, oy = 900, header }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <defs>
      <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.bgTop} /><stop offset="1" stopColor={C.bgBot} />
      </linearGradient>
      <radialGradient id={`spot-${id}`} cx="0.5" cy="0.42" r="0.55">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#bg-${id})`} />
    <rect width={1080} height={1920} fill={`url(#spot-${id})`} />
    <g transform={`translate(${ox},${oy}) scale(${zoom}) translate(${-ox},${-oy})`}>{children}</g>
    {header}
  </svg>
);

const WIDE: Iso = { cx: 640, cy: 1030, s: 0.8 };
const PW = 240, PD = 480; // phone plan size (iso stacks)

/** Fingertip hovering above an iso stack (drawn in the plane of the layers). */
const IsoFinger: React.FC<{ o: Iso; z: number; id: string; press?: number }> = ({ o, z, id, press = 0 }) => (
  <g transform={topMatrix(o, z - press * 30)}>
    <ellipse cx={20} cy={-40} rx={120} ry={150} fill="rgba(30,25,20,.25)" filter="url(#blur20)" transform="translate(30,60)" />
    <FingerPad x={0} y={-60} w={210} h={260} id={id} gap={14} />
  </g>
);

const flash = (t: number, a: number, d = 0.25) => (t < a || t > a + d ? 0 : 1 - (t - a) / d);

// ── S1 Hook: thumb touches, phone unlocks; "not a photo" ─────────────────────────────
export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const thumbIn = easeOut(ramp(lt, 0.1, 1.2));
  const thumbOut = ease(ramp(lt, 3.2, 4.0));
  const scan = ramp(lt, 1.2, 2.6);
  const open = easeOut(ramp(lt, 2.7, 3.2));
  const photo = pop(lt, 4.4);
  const cross = pop(lt, 5.4, 0.4);
  const screen = (
    <g>
      <rect x={-204} y={-434} width={408} height={868} fill={mix("#1c2a3e", "#f0a64e", open * 0.75)} opacity={0.25 + open * 0.75} />
      {open > 0 ? (
        <g opacity={open}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={-160 + (i % 4) * 85} y={-180 + Math.floor(i / 4) * 110} width={64} height={64} rx={16} fill={["#fff", "#ffe2b8", "#ffd08a", "#fff4e6"][i % 4]} opacity={0.85} transform={`translate(0,${(1 - open) * 40})`} />
          ))}
        </g>
      ) : null}
      <Lock x={0} y={-300} s={1} open={open} col={open > 0.5 ? C.white : "#cfd3da"} />
      <g opacity={1 - open}>
        <circle cx={0} cy={270} r={70 + scan * 40} fill="none" stroke={C.orange} strokeWidth={4} opacity={scan > 0 ? 1 - scan : 0} />
        <circle cx={0} cy={270} r={70 + ((scan * 2) % 1) * 40} fill="none" stroke={C.orange} strokeWidth={3} opacity={scan > 0 ? 0.7 * (1 - ((scan * 2) % 1)) : 0} />
        <Fingerprint x={0} y={270} s={0.9} n={6} gap={9} sw={3.5} color={scan > 0 ? C.orange : "#8f96a3"} />
      </g>
    </g>
  );
  return (
    <Frame id="s1" zoom={1 + lt * 0.012} oy={980} header={<Header kicker="AUDIRA EXPLAINED" title="Sensor Sidik Jari" />}>
      <g transform={`translate(${lerp(0, -170, ease(ramp(lt, 3.6, 4.6)))},0)`}>
        <Phone x={540} y={1000} s={0.78} screen={screen} glow={scan > 0 && open < 1 ? 0.6 * (1 - open) : 0} />
        <g transform={`translate(0,${lerp(900, 0, thumbIn) + thumbOut * 900})`}>
          <Thumb x={540} y={1000 + 270 * 0.78 + 30} s={0.85} rot={-4} />
        </g>
      </g>
      {photo > 0 ? (
        <g transform={`translate(800,1000) rotate(${6 - photo * 2}) scale(${photo})`} style={{ backgroundColor: "#ffffff" }}>
          <rect x={-170} y={-210} width={340} height={420} rx={10} fill="rgba(0,0,0,.2)" filter="url(#blur8)" transform="translate(10,16)" />
          <rect x={-170} y={-210} width={340} height={420} rx={10} fill={C.white} />
          <rect x={-146} y={-186} width={292} height={300} fill="#e7e2dc" />
          <Fingerprint x={0} y={-36} s={1} n={10} gap={13} sw={5} color="#7d6a5f" />
          <text x={0} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.ink} style={{ color: C.ink }}>foto_jari.jpg</text>
          {cross > 0 ? <Cross x={120} y={-170} s={cross * 1.2} /> : null}
        </g>
      ) : null}
    </Frame>
  );
};

// ── S2 What is matched? Exploded phone preview + brand ───────────────────────────────
const STACK2 = [
  { name: "Kaca", top: "url(#glassG)", side: "#9fbccb", z: 330 },
  { name: "Layar OLED", top: C.oled, side: "#05060a", z: 220 },
  { name: "Sensor", top: "#3a3d44", side: "#23252a", z: 110 },
  { name: "Papan sirkuit", top: "#2f6b4c", side: "#1d4430", z: 0 },
];
export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const spread = easeOut(ramp(lt, 0.0, 1.4));
  const brand = ramp(lt, 2.0, 2.4);
  return (
    <Frame id="s2" zoom={1.04 - lt * 0.01} oy={900} header={<Header kicker="AUDIRA EXPLAINED" title={brand > 0.5 ? "Bongkar: Sidik Jari" : "Apa yang dicocokkan?"} k={1} />}>
      <Contact x={640} y={1150} rx={330} ry={90} />
      {STACK2.slice().reverse().map((L, i) => {
        const z = lerp(i * 14, L.z, spread);
        return (
          <g key={L.name}>
            <Slab o={WIDE} w={PW} d={PD} h={12} z={z} top={L.top} side={L.side} />
            {L.name === "Sensor" ? (
              <g transform={topMatrix(WIDE, z + 12)}>
                <circle cx={0} cy={150} r={46} fill="none" stroke={C.orange} strokeWidth={6} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 3))} />
                <circle cx={0} cy={150} r={22} fill={C.orange} opacity={0.8} />
              </g>
            ) : null}
            {L.name === "Papan sirkuit" ? (
              <g transform={topMatrix(WIDE, z + 12)}>
                {[0, 1, 2, 3, 4].map((j) => <rect key={j} x={-90 + (j % 3) * 60} y={-180 + j * 50} width={44} height={30} fill="#141414" />)}
                <path d="M-100,-200 L-100,200 M100,-200 L100,200 M-100,0 L100,0" stroke="#c9a54a" strokeWidth={4} fill="none" opacity={0.8} />
              </g>
            ) : null}
          </g>
        );
      })}
      {STACK2.map((L, i) => {
        const [ax, ay] = isoP(WIDE, -PW / 2, PD / 2 - 40, L.z + 12);
        return <Label key={L.name} x={330} y={ay + 10} ax={ax + 10} ay={ay - 4} text={L.name} size={36} k={easeOut(ramp(lt, 0.8 + i * 0.25, 1.3 + i * 0.25))} />;
      })}
      <g transform={`translate(830,560) scale(${pop(lt, 0.9)})`} style={{ backgroundColor: C.chip }}>
        <circle r={78} fill={C.chip} />
        <text y={34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={100} fill={C.white} style={{ color: C.white }}>?</text>
        <circle cx={58} cy={-58} r={14} fill={C.red} />
      </g>
    </Frame>
  );
};

// ── S3 Ridges, valleys, minutiae ─────────────────────────────────────────────────────
export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const reveal = ramp(lt, 0.0, 1.6);
  const zoom = 1 + ease(ramp(lt, 3.0, 9.0)) * 0.1;
  const GAP = 22, cx = 540, cy = 900;
  const fy = cy + 820 * 0.04;
  const ridgeA = { x: cx + 7 * GAP * 0.8 * Math.cos(-0.5), y: fy + 7 * GAP * 1.08 * Math.sin(-0.5) };
  const valA = { x: cx + 9.5 * GAP * 0.8 * Math.cos(0.35), y: fy + 9.5 * GAP * 1.08 * Math.sin(0.35) };
  const mag = easeOut(ramp(lt, 3.1, 4.6));
  const magX = lerp(860, cx + MINUTIAE[1].x * GAP, mag), magY = lerp(1300, fy + MINUTIAE[1].y * GAP, mag);
  const title = lt > 6.3 ? "Minusia" : lt > 3.0 ? "Titik khas" : "Punggung & lembah";
  return (
    <Frame id="s3" zoom={zoom} oy={fy} header={<Header kicker="APA ITU SIDIK JARI?" title={title} />}>
      <FingerPad x={cx} y={cy} w={640} h={820} id="s3" reveal={reveal} gap={GAP} />
      {MINUTIAE.map((m, i) => {
        const k = pop(lt, 4.8 + i * 0.12, 0.4);
        if (k <= 0) return null;
        const px = cx + m.x * GAP, py = fy + m.y * GAP;
        const hi = (lt > 7.3 && m.kind === "end") || (lt > 8.8 && m.kind === "fork");
        return (
          <g key={i} transform={`translate(${px},${py}) scale(${k})`}>
            {m.kind === "end" ? <circle r={hi ? 22 : 16} fill="none" stroke={C.red} strokeWidth={6} /> : <rect x={-16} y={-16} width={32} height={32} fill="none" stroke={C.red} strokeWidth={6} transform="rotate(45)" />}
            <circle r={6} fill={C.red} />
          </g>
        );
      })}
      <Label x={250} y={560} ax={ridgeA.x} ay={ridgeA.y} text="Punggung" k={easeOut(ramp(lt, 1.3, 1.8))} />
      <Label x={830} y={1240} ax={valA.x} ay={valA.y} text="Lembah" k={easeOut(ramp(lt, 2.0, 2.5)) * (1 - ramp(lt, 6.8, 7.1))} />
      <Label x={250} y={1260} ax={cx + MINUTIAE[0].x * GAP} ay={fy + MINUTIAE[0].y * GAP} text="Ujung garis" k={easeOut(ramp(lt, 7.4, 7.9))} />
      <Label x={830} y={560} ax={cx + MINUTIAE[1].x * GAP} ay={fy + MINUTIAE[1].y * GAP} text="Percabangan" k={easeOut(ramp(lt, 8.9, 9.4))} />
      {mag > 0 && lt < 6.6 ? (
        <g opacity={1 - ramp(lt, 6.2, 6.6)}>
          <circle cx={magX} cy={magY} r={110} fill="#ffffff" opacity={0.18} />
          <circle cx={magX} cy={magY} r={110} fill="none" stroke={C.chip} strokeWidth={14} />
          <path d={`M${magX + 78},${magY + 78} L${magX + 170},${magY + 170}`} stroke={C.chip} strokeWidth={26} strokeLinecap="round" />
        </g>
      ) : null}
    </Frame>
  );
};

// ── Disc (coaxial part of the Home button) ────────────────────────────────────────────
const Disc: React.FC<{ x: number; y: number; rx: number; h: number; top: string; side: string; children?: React.ReactNode; ring?: boolean }> = ({ x, y, rx, h, top, side, children, ring }) => {
  const ry = rx * 0.36;
  return (
    <g>
      <ellipse cx={x} cy={y + h} rx={rx} ry={ry} fill={side} />
      <rect x={x - rx} y={y} width={rx * 2} height={h} fill={side} />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={top} />
      {ring ? <ellipse cx={x} cy={y} rx={rx * 0.74} ry={ry * 0.74} fill={C.bgTop} /> : null}
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
      {children}
    </g>
  );
};

// ── S4 1/3 capacitive: Home button exploded ──────────────────────────────────────────
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const sp = easeOut(ramp(lt, 0.1, 1.6));
  const X = 560;
  const parts = [
    { name: "Lensa safir", y: 560, rx: 170, h: 18, top: "url(#glassG)", side: "#98b6c6" },
    { name: "Cincin baja", y: 700, rx: 190, h: 26, top: "url(#metal)", side: C.metalDk, ring: true },
    { name: "Sensor kapasitif", y: 850, rx: 165, h: 22, top: "#2b2e34", side: "#17191c" },
    { name: "Tombol & kabel", y: 1010, rx: 175, h: 34, top: "#f4f4f2", side: "#c9c9c6" },
  ];
  return (
    <Frame id="s4" zoom={1 + lt * 0.01} oy={850} header={<Header kicker="CARA PERTAMA" title="Kapasitif" n={1} />}>
      <Contact x={X} y={1150} rx={240} ry={60} />
      {parts.slice().reverse().map((p, ri) => {
        const i = parts.length - 1 - ri;
        const y = lerp(880 + i * 30, p.y, sp);
        return (
          <g key={p.name}>
            <Disc x={X} y={y} rx={p.rx} h={p.h} top={p.top} side={p.side} ring={p.ring}>
              {p.name === "Sensor kapasitif"
                ? Array.from({ length: 9 }).map((_, k) => (
                    <ellipse key={k} cx={X} cy={y} rx={p.rx * (0.18 + k * 0.09)} ry={p.rx * 0.36 * (0.18 + k * 0.09)} fill="none" stroke={C.orange} strokeWidth={2.5} opacity={0.35 + 0.65 * Math.max(0, Math.sin(t * 4 - k * 0.6))} />
                  ))
                : null}
            </Disc>
            {p.name === "Tombol & kabel" ? <path d={`M${X + 120},${y + 40} C${X + 220},${y + 120} ${X + 300},${y + 90} ${X + 380},${y + 160}`} stroke="#d8a94a" strokeWidth={22} fill="none" strokeLinecap="round" /> : null}
            <Label x={330} y={y - 10 + (i % 2) * 0} ax={X - p.rx + 20} ay={y} text={p.name} size={36} k={easeOut(ramp(lt, 1.0 + i * 0.35, 1.5 + i * 0.35))} />
          </g>
        );
      })}
    </Frame>
  );
};

// ── S5 capacitor cross-section → electric map ────────────────────────────────────────
export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const N = 12, cw = 66, x0 = 540 - (N * cw) / 2;
  const skinY = 640 + (1 - easeOut(ramp(lt, 0, 1.0))) * -120;
  const ridgeAt = (i: number) => i % 2 === 0; // ridge over even cells
  const mapK = ramp(lt, 5.4, 6.4);
  const up = ease(ramp(lt, 5.2, 6.2)) * 60;
  // skin bottom edge: bumps down over ridges
  let edge = `M${x0 - 30},${skinY}`;
  for (let i = 0; i < N; i++) {
    const cx = x0 + i * cw + cw / 2;
    const dy = ridgeAt(i) ? 150 : 70;
    edge += ` Q${cx - cw / 2},${skinY + 70} ${cx},${skinY + dy} T${cx + cw / 2},${skinY + 70}`;
  }
  edge += ` L${x0 + N * cw + 30},${skinY} L${x0 + N * cw + 30},${skinY - 150} L${x0 - 30},${skinY - 150}Z`;
  const cellY = 870;
  return (
    <Frame id="s5" header={<Header kicker="CARA PERTAMA" title={lt > 5.6 ? "Peta listrik" : "Ribuan kapasitor"} n={1} />}>
      <g transform={`translate(0,${-up})`}>
        <path d={edge} fill="rgba(30,25,20,.2)" transform="translate(10,16)" filter="url(#blur8)" />
        <path d={edge} fill="url(#skinG)" />
        <rect x={x0 - 40} y={cellY + 50} width={N * cw + 80} height={70} rx={8} fill="#3a3d44" />
        {Array.from({ length: N }).map((_, i) => {
          const on = ridgeAt(i) ? easeOut(ramp(lt, 1.6 + i * 0.08, 2.0 + i * 0.08)) : 0;
          const x = x0 + i * cw + 6;
          return (
            <g key={i}>
              {on > 0 ? <rect x={x - 6} y={cellY - 6} width={cw} height={62} rx={8} fill={C.orange} opacity={0.5 * on} filter="url(#glow)" /> : null}
              <rect x={x} y={cellY} width={cw - 12} height={50} rx={6} fill={mix("#80858b", C.orange, on)} />
              <rect x={x + 8} y={cellY + 10} width={cw - 28} height={8} rx={3} fill="#fff" opacity={0.35} />
              {on > 0 ? <path d={`M${x + (cw - 12) / 2},${cellY - 8} L${x + (cw - 12) / 2},${skinY + 152}`} stroke={C.orange} strokeWidth={4} strokeDasharray="8 8" strokeDashoffset={-t * 60} opacity={on} /> : null}
            </g>
          );
        })}
        <Label x={260} y={cellY + 190} ax={x0 + 3 * cw - 30} ay={cellY + 50} text="Kapasitor" size={36} k={easeOut(ramp(lt, 0.4, 0.9)) * (1 - ramp(lt, 5.4, 5.75))} />
        <Label x={720} y={skinY - 60} ax={x0 + 10 * cw + cw / 2} ay={skinY + 120} text="Punggung = kontak" size={36} k={easeOut(ramp(lt, 2.1, 2.6))} />
        <Label x={830} y={cellY + 190} ax={x0 + 7 * cw + cw / 2} ay={skinY + 100} text="Celah udara" size={36} k={easeOut(ramp(lt, 4.7, 5.2)) * (1 - ramp(lt, 5.4, 5.75))} />
      </g>
      {mapK > 0 ? (
        <g opacity={mapK} transform={`translate(540,1150) scale(${0.78 + 0.12 * easeOut(mapK)})`}>
          <rect x={-330} y={-230} width={660} height={460} rx={22} fill="rgba(0,0,0,.18)" filter="url(#blur8)" transform="translate(10,16)" />
          <rect x={-330} y={-230} width={660} height={460} rx={22} fill={C.oled} />
          {Array.from({ length: 22 * 15 }).map((_, k) => {
            const i = k % 22, j = Math.floor(k / 22);
            const dx = (i - 10.5) * 28, dy = (j - 7) * 28;
            const v = ridgeField(dx, dy, 46);
            const lit = v > 0.15 && ramp(lt, 5.6 + (i / 22) * 0.9, 5.8 + (i / 22) * 0.9) > 0;
            return <circle key={k} cx={dx} cy={dy} r={lit ? 9 : 5} fill={lit ? C.orange : "#3a3e47"} />;
          })}
        </g>
      ) : null}
    </Frame>
  );
};

// ── Iso stack used by optical and ultrasonic scenes ──────────────────────────────────
type Layer = { name: string; top: string; side: string; z: number };
const Stack: React.FC<{ layers: Layer[]; spread: number; lt: number; labelAt: number; labelOut?: number; o?: Iso; detail?: (name: string, z: number) => React.ReactNode }> = ({ layers, spread, lt, labelAt, labelOut = 99, o = WIDE, detail }) => (
  <g>
    <Contact x={o.cx} y={o.cy + 150} rx={330} ry={90} />
    {layers.slice().reverse().map((L, ri) => {
      const z = lerp(ri * 14, L.z, spread);
      return (
        <g key={L.name}>
          <Slab o={o} w={PW} d={PD} h={14} z={z} top={L.top} side={L.side} />
          {detail ? <g transform={topMatrix(o, z + 14)}>{detail(L.name, z + 14)}</g> : null}
        </g>
      );
    })}
    {layers.map((L, i) => {
      const [ax, ay] = isoP(o, -PW / 2, PD / 2 - 40, L.z + 14);
      return <Label key={L.name} x={340} y={ay + 14} ax={ax + 10} ay={ay - 4} text={L.name} size={36} k={easeOut(ramp(lt, labelAt + i * 0.3, labelAt + 0.5 + i * 0.3)) * (1 - ramp(lt, labelOut, labelOut + 0.3))} />;
    })}
  </g>
);

const FZ = 470; // finger height above stacks
const fingerPlan = { x: 10, y: -70 };

// ── S6 2/3 optical ───────────────────────────────────────────────────────────────────
export const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const spread = easeOut(ramp(lt, 0.1, 1.5));
  const layers: Layer[] = [
    { name: "Kaca", top: "url(#glassG)", side: "#9fbccb", z: 300 },
    { name: "Layar OLED", top: C.oled, side: "#05060a", z: 160 },
    { name: "Sensor optik", top: "#3a3d44", side: "#23252a", z: 20 },
  ];
  const lightUp = ramp(lt, 2.5, 3.6);
  const lightDown = ramp(lt, 3.9, 4.9);
  const shot = flash(lt, 5.0, 0.35);
  const card = pop(lt, 5.3);
  const fake = easeOut(ramp(lt, 9.4, 9.9));
  const [fx, fy] = isoP(WIDE, fingerPlan.x, fingerPlan.y, FZ);
  const [ox_, oy_] = isoP(WIDE, fingerPlan.x, fingerPlan.y, 174);
  const [sx, sy] = isoP(WIDE, fingerPlan.x, fingerPlan.y, 34);
  const shift = ease(ramp(lt, 6.4, 7.4)) * -150;
  return (
    <Frame id="s6" zoom={1 + lt * 0.006} oy={900} header={<Header kicker="CARA KEDUA" title={lt > 6.6 ? "Gambar datar" : "Optik"} n={2} />}>
      <g transform={`translate(${shift},0)`}>
        <Stack layers={layers} spread={spread} lt={lt} labelAt={1.0} labelOut={6.1}
          detail={(name) =>
            name === "Layar OLED" ? (
              <g>{Array.from({ length: 40 }).map((_, k) => <rect key={k} x={-100 + (k % 8) * 26} y={-210 + Math.floor(k / 8) * 26} width={14} height={14} fill={C.pix} opacity={0.25 + 0.6 * lightUp * hash(k)} />)}</g>
            ) : name === "Sensor optik" ? (
              <g>
                {Array.from({ length: 20 }).map((_, k) => <circle key={k} cx={-80 + (k % 5) * 40 + fingerPlan.x} cy={-150 + Math.floor(k / 5) * 40 + fingerPlan.y + 80} r={11} fill="#14161a" stroke="#6c7280" strokeWidth={3} />)}
                <rect x={-110} y={-230} width={220} height={460} fill="#fff" opacity={shot} />
              </g>
            ) : null
          } />
        <IsoFinger o={WIDE} z={FZ} id="s6" />
        {lightUp > 0 ? (
          <g opacity={1 - ramp(lt, 6.0, 6.4)}>
            {[-40, 0, 40].map((d, i) => (
              <line key={i} x1={ox_ + d} y1={oy_} x2={lerp(ox_ + d, fx + d * 0.6, lightUp)} y2={lerp(oy_, fy + 40, lightUp)} stroke={C.orange} strokeWidth={8} strokeLinecap="round" opacity={0.9} />
            ))}
            {lightDown > 0
              ? [-30, 10, 50].map((d, i) => (
                  <line key={`d${i}`} x1={fx + d * 0.6} y1={fy + 40} x2={lerp(fx + d * 0.6, sx + d, lightDown)} y2={lerp(fy + 40, sy, lightDown)} stroke="#ffd18f" strokeWidth={6} strokeDasharray="14 10" strokeDashoffset={-t * 80} />
                ))
              : null}
          </g>
        ) : null}
      </g>
      {card > 0 ? (
        <g transform={`translate(${lerp(sx, 840, easeOut(ramp(lt, 5.3, 6.6)))},${lerp(sy, 760, easeOut(ramp(lt, 5.3, 6.6)))}) scale(${card * 0.9}) rotate(${-4})`} style={{ backgroundColor: "#ffffff" }}>
          <rect x={-150} y={-180} width={300} height={360} rx={10} fill="rgba(0,0,0,.2)" filter="url(#blur8)" transform="translate(10,14)" />
          <rect x={-150} y={-180} width={300} height={360} rx={10} fill={C.white} />
          <rect x={-130} y={-160} width={260} height={260} fill="#d9d9d9" />
          <Fingerprint x={0} y={-30} n={9} gap={13} sw={5} color="#555" />
          <text x={0} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.ink} style={{ color: C.ink }}>FOTO 2D</text>
        </g>
      ) : null}
      {fake > 0 ? (
        <g opacity={fake}>
          <g transform="translate(850,1010) rotate(8)">
            <ellipse cx={0} cy={0} rx={110} ry={70} fill="#d7a37f" stroke={C.red} strokeWidth={6} strokeDasharray="14 10" />
            <Fingerprint x={0} y={0} s={0.6} n={7} gap={14} sw={6} color="#9e6a4d" />
          </g>
          <Label x={700} y={1130} ax={830} ay={1060} text="Jari palsu lolos?" size={34} />
        </g>
      ) : null}
    </Frame>
  );
};

// ── S7 3/3 ultrasonic + 3D relief ────────────────────────────────────────────────────
export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const spread = easeOut(ramp(lt, 0.1, 1.5));
  const layers: Layer[] = [
    { name: "Kaca", top: "url(#glassG)", side: "#9fbccb", z: 300 },
    { name: "Layar OLED", top: C.oled, side: "#05060a", z: 160 },
    { name: "Sensor ultrasonik", top: "url(#metal)", side: C.metalDk, z: 20 },
  ];
  const waves = lt > 5.8 && lt < 9.4;
  const relief = ease(ramp(lt, 8.9, 9.8));
  const wet = pop(lt, 12.2);
  const [, sy] = isoP(WIDE, fingerPlan.x, fingerPlan.y, 34);
  const [fx, fy] = isoP(WIDE, fingerPlan.x, fingerPlan.y, FZ);
  return (
    <Frame id="s7" zoom={1 + lt * 0.005} oy={900} header={<Header kicker="CARA KETIGA" title={relief > 0.5 ? "Peta 3D" : "Ultrasonik"} n={3} />}>
      <g opacity={1 - relief} transform={`translate(640,${1000 + relief * 80}) scale(${1 - relief * 0.1}) translate(-640,-1000)`}>
        <Stack layers={layers} spread={spread} lt={lt} labelAt={1.0}
          detail={(name) =>
            name === "Sensor ultrasonik" ? (
              <g>{Array.from({ length: 24 }).map((_, k) => <circle key={k} cx={-75 + (k % 4) * 50 + fingerPlan.x} cy={-170 + Math.floor(k / 4) * 46 + fingerPlan.y + 60} r={12} fill={C.orange} opacity={waves ? 0.5 + 0.5 * Math.abs(Math.sin(t * 6 + k)) : 0.35} />)}</g>
            ) : name === "Layar OLED" ? (
              <g>{Array.from({ length: 40 }).map((_, k) => <rect key={k} x={-100 + (k % 8) * 26} y={-210 + Math.floor(k / 8) * 26} width={14} height={14} fill={C.pix} opacity={0.2 + 0.2 * hash(k)} />)}</g>
            ) : null
          } />
        <IsoFinger o={WIDE} z={FZ} id="s7" />
        {waves
          ? [0, 1, 2, 3].map((i) => {
              const ph = ((lt - 5.8) * 1.2 + i * 0.25) % 1;
              const y = lerp(sy - 10, fy + 40, ph);
              return <ellipse key={i} cx={lerp(640, fx, ph)} cy={y} rx={60 + ph * 120} ry={(60 + ph * 120) * 0.45} fill="none" stroke={C.orange} strokeWidth={7 - ph * 4} opacity={1 - ph * 0.6} />;
            })
          : null}
        {lt > 7.6 && lt < 9.4
          ? [0, 1].map((i) => {
              const ph = ((lt - 7.6) * 1.2 + i * 0.5) % 1;
              return <ellipse key={`r${i}`} cx={lerp(fx, 640, ph)} cy={lerp(fy + 40, sy - 10, ph)} rx={180 - ph * 100} ry={(180 - ph * 100) * 0.45} fill="none" stroke="#ffd18f" strokeWidth={4} strokeDasharray="12 10" opacity={0.9} />;
            })
          : null}
      </g>
      {relief > 0 ? (
        <g opacity={relief} transform={`translate(540,880) scale(${0.8 + 0.2 * relief + (lt - 9) * 0.008}) translate(-540,-880)`}>
          <FingerPad x={540} y={880} w={600} h={740} id="s7r" gap={24} emboss pores />
          <Label x={250} y={560} ax={540 - 90} ay={760} text="Pori-pori" size={36} k={easeOut(ramp(lt, 11.0, 11.5))} />
          {wet > 0
            ? [0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(${420 + hash(i + 3) * 260},${700 + hash(i + 9) * 380}) scale(${wet * (0.7 + hash(i) * 0.6)})`}>
                  <path d="M0,-34 C18,-8 26,6 26,18 A26,26 0 0,1 -26,18 C-26,6 -18,-8 0,-34Z" fill="#bfe6ff" opacity={0.85} stroke="#fff" strokeWidth={3} />
                </g>
              ))
            : null}
          {wet > 0 ? <Check x={790} y={640} s={wet * 1.2} /> : null}
          <Label x={830} y={1230} ax={700} ay={1080} text="Jari basah tetap terbaca" size={34} k={easeOut(ramp(lt, 12.4, 12.9))} />
        </g>
      ) : null}
    </Frame>
  );
};

// ── S8 template → secure chip ───────────────────────────────────────────────────────
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const drop = ease(ramp(lt, 1.2, 1.9));
  const imgK = 1 - ramp(lt, 1.8, 2.0);
  const nums = pop(lt, 2.0);
  const enc = ramp(lt, 3.8, 4.3);
  const fly = easeOut(ramp(lt, 4.6, 5.6));
  const board = easeOut(ramp(lt, 4.2, 5.0));
  const cloud = pop(lt, 8.6);
  const noBack = pop(lt, 10.4);
  const BO: Iso = { cx: 540, cy: 1090, s: 1.0 };
  const hex = "9F 3A 7C E1 04 B8 5D 21";
  return (
    <Frame id="s8" header={<Header kicker="SETELAH DIPINDAI" title={lt > 8.6 ? "Tidak ke server" : lt > 2.3 ? "Peta matematis" : "Gambar dibuang"} />}>
      {/* trash bin */}
      <g transform={`translate(540,${1130}) scale(${1.7 * (1 - ramp(lt, 2.0, 2.4))})`}>
        <Contact x={0} y={110} rx={110} ry={26} />
        <path d="M-80,-60 L80,-60 L64,110 L-64,110Z" fill="#9aa0a8" />
        <rect x={-96} y={-86} width={192} height={28} rx={8} fill="#6d737b" />
        {[-40, 0, 40].map((x) => <line key={x} x1={x} y1={-30} x2={x * 0.85} y2={90} stroke="#6d737b" strokeWidth={8} />)}
      </g>
      {imgK > 0 ? (
        <g transform={`translate(540,${lerp(700, 1080, drop)}) scale(${lerp(1, 0.4, drop)}) rotate(${drop * 40})`} opacity={imgK} style={{ backgroundColor: "#ffffff" }}>
          <rect x={-170} y={-210} width={340} height={420} rx={10} fill={C.white} />
          <rect x={-146} y={-186} width={292} height={300} fill="#e7e2dc" />
          <Fingerprint x={0} y={-36} n={10} gap={13} sw={5} color="#7d6a5f" />
          <text x={0} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.ink} style={{ color: C.ink }}>gambar pindaian</text>
        </g>
      ) : null}
      {/* PCB board with chips */}
      {board > 0 ? (
        <g opacity={board} transform={`translate(0,${(1 - board) * 80})`}>
          <Slab o={BO} w={520} d={360} h={16} z={0} top="#2f6b4c" side="#1d4430" shadow />
          <g transform={topMatrix(BO, 16)}>
            <path d="M-240,-120 L240,-120 M-240,0 L-60,0 M60,0 L240,0 M-240,120 L240,120" stroke="#c9a54a" strokeWidth={5} opacity={0.75} fill="none" />
          </g>
          <Slab o={BO} w={150} d={150} h={30} z={16} top="#18191c" side="#0b0b0d" />
          <g transform={topMatrix(BO, 46)} style={{ backgroundColor: "#18191c" }}>
            <rect x={-60} y={-60} width={120} height={120} fill="none" stroke={C.orange} strokeWidth={4} opacity={0.4 + 0.6 * fly} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.orange} style={{ color: C.orange }}>SE</text>
          </g>
          <Label x={300} y={1350} ax={isoP(BO, -60, 60, 46)[0]} ay={isoP(BO, -60, 60, 46)[1]} text="Secure Enclave · iPhone" size={40} k={easeOut(ramp(lt, 5.4, 5.9))} />
          <Label x={800} y={820} ax={isoP(BO, 60, -60, 46)[0]} ay={isoP(BO, 60, -60, 46)[1]} text="TEE · Android" size={40} k={easeOut(ramp(lt, 7.4, 7.9))} />
        </g>
      ) : null}
      {/* minutiae → numbers card */}
      {nums > 0 ? (
        <g transform={`translate(${540},${lerp(700, 720, fly)}) scale(${nums * lerp(1, 0.84, fly)})`} opacity={1 - ramp(lt, 8.2, 8.5)} style={{ backgroundColor: C.chip }}>
          <rect x={-380} y={-150} width={760} height={300} rx={22} fill="rgba(0,0,0,.18)" filter="url(#blur8)" transform="translate(10,16)" />
          <rect x={-380} y={-150} width={760} height={300} rx={22} fill={C.chip} />
          {MINUTIAE.map((m, i) => <circle key={i} cx={-300 + i * 86} cy={-70} r={12} fill={C.red} />)}
          <text x={0} y={30} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={52} letterSpacing={2} fill={enc > 0.5 ? C.orange : C.white} style={{ color: enc > 0.5 ? C.orange : C.white }}>
            {enc > 0.5 ? hex.split("").map((c, i) => (c === " " ? " " : "•●◆▲■"[Math.floor(hash(i + Math.floor(t * 8)) * 5)])).join("") : hex}
          </text>
          <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={46} fill={C.metalLt} style={{ color: C.metalLt }}>{enc > 0.5 ? "terenkripsi" : "peta titik minusia"}</text>
          {enc > 0 ? <Lock x={330} y={-120} s={0.8 * enc} col={C.orange} /> : null}
        </g>
      ) : null}
      {/* cloud server crossed */}
      {cloud > 0 ? (
        <g transform={`translate(830,560) scale(${cloud})`} style={{ backgroundColor: "#ffffff" }}>
          <path d="M-110,40 a60,60 0 0,1 20,-110 a80,80 0 0,1 150,0 a55,55 0 0,1 50,110Z" fill="#fff" stroke="#9aa0a8" strokeWidth={6} />
          <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.grey} style={{ color: C.grey }}>SERVER</text>
          <path d="M-150,80 L150,-110" stroke={C.red} strokeWidth={14} strokeLinecap="round" />
        </g>
      ) : null}
      {noBack > 0 ? (
        <g transform={`translate(250,600) scale(${noBack})`} style={{ backgroundColor: "#ffffff" }}>
          <rect x={-150} y={-90} width={300} height={180} rx={18} fill={C.white} />
          <Fingerprint x={-70} y={0} n={5} gap={12} sw={5} color="#7d6a5f" />
          <text x={50} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.ink} style={{ color: C.ink }}>↛</text>
          <Cross x={110} y={-70} s={0.7} />
        </g>
      ) : null}
    </Frame>
  );
};

// ── S9 how safe: 1 in 50,000 · 5 fails → PIN · twins differ ──────────────────────────
export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const gridK = 1 - ramp(lt, 4.2, 4.5);
  const zoomOut = lerp(3.2, 1, easeOut(ramp(lt, 0.6, 3.0)));
  const phoneK = ramp(lt, 4.3, 4.6) * (1 - ramp(lt, 6.7, 7.0));
  const twinK = ramp(lt, 6.8, 7.2);
  const pin = ramp(lt, 5.6, 5.9);
  const title = lt > 6.9 ? "Kembar pun beda" : lt > 4.3 ? "Gagal 5×" : "Seberapa aman?";
  const COLS = 9, ROWS = 10, cell = 96;
  const gx0 = 540 - ((COLS - 1) * cell) / 2, gy0 = 860 - ((ROWS - 1) * cell) / 2;
  const red = { i: 4, j: 5 };
  const screen = (
    <g>
      <rect x={-204} y={-434} width={408} height={868} fill="#1b2230" />
      {pin < 1
        ? [0, 1, 2, 3, 4].map((i) => (pop(lt, 4.4 + i * 0.18, 0.3) > 0 ? <Cross key={i} x={-150 + i * 75} y={-120} s={0.6 * pop(lt, 4.4 + i * 0.18, 0.3)} /> : null))
        : null}
      {pin > 0 ? (
        <g opacity={pin}>
          <text x={0} y={-250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill="#fff" style={{ color: "#fff" }}>Masukkan PIN</text>
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-125 + i * 50} cy={-180} r={12} fill="none" stroke="#fff" strokeWidth={4} />)}
          {Array.from({ length: 12 }).map((_, k) => (
            <g key={k}>
              <circle cx={-110 + (k % 3) * 110} cy={-60 + Math.floor(k / 3) * 110} r={42} fill="#2d3646" />
              <text x={-110 + (k % 3) * 110} y={-60 + Math.floor(k / 3) * 110 + 14} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill="#fff" style={{ color: "#fff" }}>{["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""][k]}</text>
            </g>
          ))}
        </g>
      ) : null}
    </g>
  );
  return (
    <Frame id="s9" header={<Header kicker="SEBERAPA AMAN?" title={title} />}>
      {gridK > 0 ? (
        <g opacity={gridK} transform={`translate(${gx0 + red.i * cell},${gy0 + red.j * cell}) scale(${zoomOut}) translate(${-(gx0 + red.i * cell)},${-(gy0 + red.j * cell)})`}>
          {Array.from({ length: COLS * ROWS }).map((_, k) => {
            const i = k % COLS, j = Math.floor(k / COLS);
            const isRed = i === red.i && j === red.j;
            return (
              <g key={k}>
                <circle cx={gx0 + i * cell} cy={gy0 + j * cell} r={40} fill={isRed ? "#fde8e8" : "#f4f4f2"} stroke={isRed ? C.red : "#c9ccd1"} strokeWidth={isRed ? 6 : 3} />
                <Fingerprint x={gx0 + i * cell} y={gy0 + j * cell} n={4} gap={7} sw={3} color={isRed ? C.red : "#9aa0a8"} seed={12 + (k % 7)} />
              </g>
            );
          })}
        </g>
      ) : null}
      {phoneK > 0 ? <g opacity={phoneK}><Phone x={540} y={900} s={0.62} screen={screen} screenBg="#1b2230" /></g> : null}
      {twinK > 0 ? (
        <g opacity={twinK}>
          <g transform={`translate(${lerp(540, 0, easeOut(twinK))},0)`}>
            <FingerPad x={300} y={880} w={380} h={500} id="s9a" gap={17} seed={21} />
          </g>
          <g transform={`translate(${lerp(-540, 0, easeOut(twinK))},0)`}>
            <FingerPad x={780} y={880} w={380} h={500} id="s9b" gap={17} seed={47} />
          </g>
          <g transform={`translate(540,880) scale(${pop(lt, 7.6)})`} style={{ backgroundColor: C.chip }}>
            <circle r={58} fill={C.chip} />
            <text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill={C.white} style={{ color: C.white }}>≠</text>
          </g>
          <Label x={150} y={1230} ax={300} ay={1110} text="Kembar A" size={36} k={easeOut(ramp(lt, 7.3, 7.8))} />
          <Label x={930} y={1230} ax={780} ay={1110} text="Kembar B" size={36} k={easeOut(ramp(lt, 7.5, 8.0))} />
        </g>
      ) : null}
    </Frame>
  );
};

// ── S10 phone reassembles; brand on screen ───────────────────────────────────────────
export const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const merge = easeOut(ramp(lt, 0.1, 1.6));
  const lit = ramp(lt, 1.6, 2.1);
  const layers = [
    { off: -330, fill: "url(#glassG)" },
    { off: -110, fill: C.oled },
    { off: 110, fill: "#3a3d44" },
    { off: 330, fill: "#2f6b4c" },
  ];
  const screen = (
    <g opacity={lit}>
      <rect x={-204} y={-434} width={408} height={868} fill="#f2f2f0" />
      <circle cx={0} cy={-160} r={14} fill={C.red} />
      <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={78} fill={C.ink} style={{ color: C.ink }}>AUDIRA</text>
      <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} letterSpacing={6} fill={C.red} style={{ color: C.red }}>EXPLAINED</text>
      <Fingerprint x={0} y={200} n={6} gap={10} sw={4} color={C.orange} />
      <Check x={110} y={140} s={0.6} />
    </g>
  );
  return (
    <Frame id="s10" zoom={1.04 - lt * 0.006} oy={900} header={<Header kicker="JADI, YANG DICOCOKKAN" title={lt > 1.9 ? "Bukan foto, tapi rumus" : "Bukan foto…"} />}>
      {merge < 1
        ? layers.map((L, i) => (
            <g key={i} transform={`translate(540,${960 + L.off * (1 - merge)}) skewY(${-8 * (1 - merge)}) scale(${0.62})`} opacity={1 - merge * 0.6}>
              <rect x={-230} y={-460} width={460} height={920} rx={64} fill={L.fill} stroke="#fff" strokeOpacity={0.5} strokeWidth={3} />
            </g>
          ))
        : null}
      {merge > 0.85 ? <g opacity={ramp(merge, 0.85, 1)}><Phone x={540} y={960} s={0.62} screen={screen} glow={lit * 0.4} screenBg="#f2f2f0" /></g> : null}
      <Label x={250} y={1300} ax={470} ay={1180} text="Peta, bukan foto" size={36} k={easeOut(ramp(lt, 2.0, 2.5))} />
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10 };
// silence unused helper warnings
void circle;
