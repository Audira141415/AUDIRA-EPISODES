// EP01 QRIS scenes S1–S11 (BONGKAR look). Each gets global film time t (s) and local lt (s since scene start).
// Event times below are film seconds (VO word time + 0.3). Design space 1080 × 1920.
import React from "react";
import {
  C, FONT, Defs, Contact, Label, Header, isoP, topMatrix, Box, Bank, Rack, Hub, QR, Stand, Phone, PayScreen, SuccessScreen,
  Check, Packet, Route, along, Warung, Person, Shop, Indonesia, hash, ramp, ease, easeOut, lerp, pop, mix, clamp01, type Iso,
} from "./pieces";

export type SceneProps = { t: number; lt: number };

/** Studio backdrop with a key light from the upper left, cool shadow side lower right. */
const Frame: React.FC<{ children: React.ReactNode; id: string; zoom?: number; ox?: number; oy?: number; header?: React.ReactNode }> = ({ children, id, zoom = 1, ox = 540, oy = 900, header }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <defs>
      <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.bgTop} /><stop offset="1" stopColor={C.bgBot} />
      </linearGradient>
      <radialGradient id={`key-${id}`} cx="0.18" cy="0.14" r="0.8">
        <stop offset="0" stopColor="#fff6e6" stopOpacity="0.95" /><stop offset="0.4" stopColor="#fff6e6" stopOpacity="0.3" /><stop offset="1" stopColor="#fff6e6" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`floor-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#cfcac0" /><stop offset="0.08" stopColor="#bfb9ae" /><stop offset="1" stopColor="#8e8a83" />
      </linearGradient>
      <linearGradient id={`wall-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000000" stopOpacity="0" /><stop offset="1" stopColor="#000000" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id={`cool-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0.4" stopColor="#3c4656" stopOpacity="0" /><stop offset="1" stopColor="#3c4656" stopOpacity="0.42" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#bg-${id})`} />
    <rect width={1080} height={1920} fill={`url(#key-${id})`} />
    <rect width={1080} height={1920} fill={`url(#cool-${id})`} />
    {/* wall darkens toward the floor; floor plane fills the lower third and falls off to the front */}
    <rect y={700} width={1080} height={560} fill={`url(#wall-${id})`} />
    <rect y={1240} width={1080} height={680} fill={`url(#floor-${id})`} opacity={0.75} />
    <rect y={1238} width={1080} height={3} fill="#ffffff" opacity={0.55} />
    <g transform={`translate(${ox},${oy}) scale(${zoom}) translate(${-ox},${-oy})`}>{children}</g>
    {header}
  </svg>
);

const P = (o: Iso, x: number, y: number, z: number) => isoP(o, x, y, z);

// ── S1 Hook: scan, type amount, pay → merchant phone "berhasil" ─────────────────────────
const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const stage = t < 1.45 ? ramp(t, 0.35, 1.4) : t < 2.6 ? 1 + ramp(t, 1.5, 1.9) : 2 + ramp(t, 2.6, 3.1);
  const split = ease(ramp(t, 4.4, 5.3));
  const merchIn = easeOut(ramp(t, 4.7, 5.5));
  const ok = ramp(t, 6.9, 7.45);
  const ring = ramp(t, 5.9, 7.9);
  const sent = ramp(t, 2.8, 4.6);
  return (
    <Frame id="s1" zoom={1 + lt * 0.008} oy={1000} header={<Header kicker="AUDIRA EXPLAINED" title="Cara Kerja QRIS" />}>
      <g opacity={0.9}>
        <Warung x={540} y={980} s={0.86}>
          <Stand x={-250} y={-30} s={0.55} scan={t < 1.4 ? ramp(t, 0.35, 1.4) : -1} />
        </Warung>
      </g>
      <Phone id="buy1" x={lerp(720, 300, split)} y={lerp(960, 1000, split)} s={lerp(0.6, 0.46, split)} screen={<PayScreen stage={stage} />} glow={t > 2.6 && t < 3.4 ? 0.8 : 0} />
      {sent > 0 && sent < 1 ? <Packet x={lerp(720, 1100, sent)} y={lerp(800, 620, sent)} s={1} /> : null}
      {merchIn > 0 ? (
        <g transform={`translate(${lerp(1200, 0, merchIn)},0)`}>
          <Phone id="mer1" x={790} y={1000} s={0.5} screen={<SuccessScreen k={ok} />} glow={ok * 0.9} glowCol={C.green} />
          {ring > 0 && ring < 1
            ? [0, 1, 2].map((i) => {
                const r = ((ring * 3 + i / 3) % 1);
                return <path key={i} d={`M${940 + r * 60},${780 - r * 30} q${30 + r * 20},${60} 0,${130 + r * 40}`} fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" opacity={1 - r} />;
              })
            : null}
          <Label x={1000} y={600} ax={850} ay={760} text="HP pedagang" size={34} k={easeOut(ramp(t, 5.2, 5.6))} side="r" />
        </g>
      ) : null}
      <Label x={90} y={600} ax={lerp(560, 230, split)} ay={lerp(700, 790, split)} text="HP pembeli" size={34} k={easeOut(ramp(t, 0.6, 1.0))} side="l" />
    </Frame>
  );
};

// ── S2 Where does the money go? ─────────────────────────────────────────────────────────
const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const route: [number, number][] = [[210, 760], [210, 640], [380, 640], [540, 640], [700, 640], [870, 640], [870, 760]];
  const k = ramp(t, 8.4, 9.3);
  const pk = Math.min(ramp(t, 8.6, 9.9), 0.45);
  return (
    <Frame id="s2" zoom={1.02 + lt * 0.012} oy={860} header={<Header kicker="TAPI…" title="Uangmu lewat mana?" />}>
      <Route pts={route} k={k} dash />
      {[380, 540, 700].map((x, i) => {
        const p = pop(t, 8.8 + i * 0.22);
        return (
          <g key={x} transform={`translate(${x},640) scale(${p})`}>
            <rect x={-70} y={-70} width={140} height={140} rx={20} fill="rgba(30,25,20,.22)" filter="url(#blur8)" transform="translate(10,14)" />
            <rect x={-70} y={-70} width={140} height={140} rx={20} fill="#6b7078" />
            <rect x={-70} y={-70} width={140} height={40} rx={20} fill="#ffffff" opacity={0.25} />
            <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={96} fill="#ffffff">?</text>
          </g>
        );
      })}
      <Phone id="buy2" x={210} y={1010} s={0.4} screen={<PayScreen stage={3} />} />
      <Phone id="mer2" x={870} y={1010} s={0.4} screen={<SuccessScreen k={1} />} glow={0.5} glowCol={C.green} />
      {pk > 0 ? (() => { const [x, y] = along(route, pk); return <Packet x={x} y={y} />; })() : null}
      <Label x={540} y={880} ax={540} ay={720} text="jalur tersembunyi" size={36} k={easeOut(ramp(t, 9.5, 9.9))} side="r" />
    </Frame>
  );
};

// ── S3 This is QRIS ─────────────────────────────────────────────────────────────────────
const Plate: React.FC<{ x: number; y: number; title: string; sub: string; k: number }> = ({ x, y, title, sub, k }) => {
  if (k <= 0) return null;
  const w = 410;
  return (
    <g transform={`translate(${x},${y + (1 - k) * 30}) scale(${0.8 + 0.2 * k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2 + 8} y={-50} width={w} height={116} rx={16} fill="rgba(30,25,20,.22)" filter="url(#blur8)" />
      <rect x={-w / 2} y={-58} width={w} height={116} rx={16} fill={C.white} />
      <rect x={-w / 2} y={-58} width={w} height={116} rx={16} fill="none" stroke="#ffffff" strokeWidth={3} />
      <rect x={-w / 2} y={-58} width={12} height={116} rx={6} fill={C.red} />
      <text x={0} y={-4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill={C.ink}>{title}</text>
      <text x={0} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill="#45484d">{sub}</text>
    </g>
  );
};
const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const rise = easeOut(ramp(t, 10.9, 11.9));
  const bi = easeOut(ramp(t, 14.0, 14.5));
  const aspi = easeOut(ramp(t, 15.4, 15.9));
  return (
    <Frame id="s3" zoom={1 + lt * 0.006} oy={900} header={<Header kicker="INI QRIS" title="Standar QR nasional" />}>
      <g transform={`translate(0,${(1 - rise) * 120})`} opacity={rise}>
        <Stand x={540} y={880} s={0.92} scan={ramp(t, 11.4, 12.6) < 1 ? ramp(t, 11.4, 12.6) : -1} />
      </g>
      {bi > 0 ? <path d={`M290,500 L290,540 L420,600`} fill="none" stroke={C.chip} strokeWidth={3} strokeDasharray="8 8" opacity={bi} /> : null}
      {aspi > 0 ? <path d={`M790,500 L790,540 L660,600`} fill="none" stroke={C.chip} strokeWidth={3} strokeDasharray="8 8" opacity={aspi} /> : null}
      <Plate x={290} y={460} title="Bank Indonesia" sub="bank sentral" k={bi} />
      <Plate x={790} y={460} title="ASPI" sub="asosiasi pembayaran" k={aspi} />
      <Label x={70} y={1180} ax={360} ay={1050} text="satu kode, semua aplikasi" size={32} k={easeOut(ramp(t, 12.4, 12.9)) * (1 - ramp(t, 16.2, 16.4))} side="l" />
    </Frame>
  );
};

// ── S4 Before: many QR stickers → one QRIS ──────────────────────────────────────────────
const STICKERS = [
  { x: -300, y: -200, col: "#2f5d9e", name: "Aplikasi A" },
  { x: 0, y: -230, col: "#2e9e5b", name: "Aplikasi B" },
  { x: 300, y: -200, col: "#7a3fa0", name: "Aplikasi C" },
  { x: -300, y: 40, col: "#b5761a", name: "Aplikasi D" },
  { x: 0, y: 10, col: "#1aa0b8", name: "Aplikasi E" },
  { x: 300, y: 40, col: "#d0532e", name: "Aplikasi F" },
];
const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const merge = ease(ramp(t, 24.6, 25.4));
  const qris = easeOut(ramp(t, 25.0, 25.6));
  return (
    <Frame id="s4" zoom={1 + lt * 0.01} oy={980} header={<Header kicker="SEBELUMNYA" title={merge > 0.5 ? "Sekarang: satu QRIS" : "Tiap aplikasi, QR sendiri"} size={merge > 0.5 ? 74 : 66} />}>
      <Warung x={540} y={1000} s={0.9}>
        {STICKERS.map((st, i) => {
          const p = pop(t, 20.2 + i * 0.55, 0.5);
          if (p <= 0) return null;
          const x = lerp(st.x, 0, merge), y = lerp(st.y, -60, merge), s = lerp(1, 0.3, merge);
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${p * s}) rotate(${(hash(i) - 0.5) * 8 * (1 - merge)})`} opacity={1 - merge * 0.9}>
              <rect x={-92} y={-112} width={184} height={224} rx={12} fill="rgba(30,25,20,.25)" filter="url(#blur8)" transform="translate(8,10)" />
              <rect x={-92} y={-112} width={184} height={224} rx={12} fill={st.col} />
              <rect x={-92} y={-112} width={184} height={30} rx={12} fill="#ffffff" opacity={0.2} />
              <QR x={0} y={-6} size={150} seed={20 + i * 5} />
              <text x={0} y={98} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill="#ffffff">{st.name}</text>
            </g>
          );
        })}
        {qris > 0 ? (
          <g opacity={qris} transform={`translate(0,${(1 - qris) * 40})`}>
            <Stand x={0} y={-150} s={0.62} />
          </g>
        ) : null}
      </Warung>
      <Label x={1000} y={1380} ax={810} ay={1060} text="6 kode berbeda" size={34} k={easeOut(ramp(t, 23.6, 24.0)) * (1 - merge)} side="r" />
    </Frame>
  );
};

// ── S5 QR taken apart: four layers ──────────────────────────────────────────────────────
const O5: Iso = { cx: 470, cy: 1060, s: 0.8 };
const LAYERS5 = [
  { name: "NMID", col: "#c0141c", at: 31.0 },
  { name: "Data pedagang", col: "#e0a43c", at: 29.4 },
  { name: "Format EMVCo", col: "#2f5d9e", at: 27.9 },
  { name: "Pola QR", col: "#f2f2f0", at: 25.9 },
];
const EMV = ["00 02 01", "01 02 12", "26 .. ID.CO.QRIS", "52 04 5812", "53 03 360", "58 02 ID", "59 13 WARUNG BU SRI", "60 07 JAKARTA", "63 04 7A1C"];
const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const spread = easeOut(ramp(t, 25.7, 27.2));
  const W = 360;
  return (
    <Frame id="s5" zoom={1.0 + lt * 0.006} oy={960} header={<Header kicker="BONGKAR KODENYA" title="Isinya teks, bukan gambar" size={66} />}>
      <Contact x={470} y={1120} rx={300} ry={80} o={0.25} />
      {LAYERS5.map((L, i) => {
        const z = lerp(i * 16, i * 120, spread);
        const lit = t >= L.at && t < L.at + 1.8 ? 1 - ramp(t, L.at + 1.2, L.at + 1.8) : 0;
        const nmidPulse = L.name === "NMID" && t > 32.2 ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
        return (
          <g key={L.name}>
            <Box o={O5} w={W} d={W} h={16} z={z} col={L.name === "Pola QR" ? "#d9dadc" : mix(L.col, "#000000", 0.1)} topCol={L.col} glow={Math.max(lit, nmidPulse)} />
            <g transform={topMatrix(O5, z + 16)} opacity={L.name === "Pola QR" ? 1 : ramp(t, L.at - 0.2, L.at + 0.2) * (i === 0 ? 1 : 1 - ramp(t, LAYERS5[i - 1].at - 0.3, LAYERS5[i - 1].at))}>
              {/* text on a layer shows only while that layer is the one being explained, so stacked layers never print over each other */}
              {L.name === "Pola QR" ? <QR x={0} y={0} size={300} seed={7} /> : null}
              {L.name === "Format EMVCo"
                ? EMV.map((s, j) => <text key={j} x={-150} y={-130 + j * 32} fontFamily={FONT} fontWeight={700} fontSize={24} fill="#ffffff">{s}</text>)
                : null}
              {L.name === "Data pedagang" ? (
                <g>
                  <Shop x={-100} y={-40} s={2.6} col={C.ink} />
                  <text x={-20} y={-50} fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.ink}>WARUNG BU SRI</text>
                  <text x={-20} y={0} fontFamily={FONT} fontWeight={600} fontSize={28} fill={C.ink}>Jakarta · makanan</text>
                  <text x={-150} y={90} fontFamily={FONT} fontWeight={600} fontSize={26} fill={C.ink}>Rekening: bank pedagang</text>
                </g>
              ) : null}
              {L.name === "NMID" ? (
                <g>
                  <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill="#ffffff">NMID</text>
                </g>
              ) : null}
            </g>
          </g>
        );
      })}
      {LAYERS5.map((L, i) => {
        const z = lerp(i * 16, i * 120, spread);
        const [ax, ay] = P(O5, W / 2, -W / 2, z + 16);
        return <Label key={L.name} x={760} y={ay - 6} ax={ax - 6} ay={ay + 4} text={L.name} size={32} k={easeOut(ramp(t, L.at, L.at + 0.45))} side="r" />;
      })}
      {t > 33.0 ? (
        <g opacity={ramp(t, 33.0, 33.4)}>
          {["A", "B", "C"].map((n, i) => (
            <g key={n} transform={`translate(${180 + i * 120},${520})`}>
              <rect x={-44} y={-60} width={88} height={120} rx={16} fill={C.chip} />
              <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ffffff">{n}</text>
              <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={18} fill={C.orange}>NMID</text>
            </g>
          ))}
          <text x={560} y={530} fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.ink}>= sama</text>
        </g>
      ) : null}
    </Frame>
  );
};

// ── S6 Phone → issuer ───────────────────────────────────────────────────────────────────
const O6: Iso = { cx: 540, cy: 1000, s: 0.9 };
const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const bankK = easeOut(ramp(t, 34.8, 35.9));
  const stage = 1 + ramp(t, 34.6, 34.9) + ramp(t, 35.5, 36.0);
  const [bx, by] = P(O6, 150, -160 + 85, 40);
  const route: [number, number][] = [[300, 790], [300, 700], [bx - 120, 700], [bx - 120, by], [bx, by]];
  const k = ramp(t, 36.1, 37.2);
  const pk = ramp(t, 36.3, 39.2);
  const arrive = ramp(t, 39.1, 39.5);
  return (
    <Frame id="s6" zoom={1 + lt * 0.009} oy={900} header={<Header kicker="LANGKAH 1" title="Perintah ke issuer" />}>
      <Bank o={O6} px={150} py={-160} col={C.issuer} sign="ISSUER" k={bankK} glow={arrive * (1 - ramp(t, 40.6, 41.2))} />
      <Route pts={route} k={k} />
      <Phone id="buy6" x={300} y={1040} s={0.4} screen={<PayScreen stage={stage} />} glow={t > 35.5 && t < 36.3 ? 0.8 : 0} />
      {pk > 0 && pk < 1 ? (() => { const [x, y] = along(route, pk); return <Packet x={x} y={y} />; })() : null}
      <Label x={1000} y={1160} ax={P(O6, 150, -160, 120)[0] + 40} ay={P(O6, 150, -160, 120)[1] + 60} text="bank / dompet digitalmu" size={32} k={easeOut(ramp(t, 37.9, 38.4))} side="r" />
      {/* the order the app sends */}
      <g opacity={ramp(t, 36.4, 36.8) * (1 - ramp(t, 39.2, 39.6))} transform="translate(60,470)">
        <rect x={0} y={0} width={360} height={150} rx={16} fill={C.white} />
        <rect x={0} y={0} width={10} height={150} rx={5} fill={C.orange} />
        <text x={30} y={46} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink}>Perintah bayar</text>
        <text x={30} y={90} fontFamily={FONT} fontWeight={600} fontSize={26} fill={C.grey}>ke: NMID warung</text>
        <text x={30} y={128} fontFamily={FONT} fontWeight={600} fontSize={26} fill={C.grey}>jumlah: Rp25.000</text>
      </g>
    </Frame>
  );
};

// ── S7 GPN hub + 4 switching racks ─────────────────────────────────────────────────────
const O7: Iso = { cx: 540, cy: 1000, s: 0.8 };
const RACKS = [
  { name: "Artajasa", px: -23, py: 323, at: 46.97 },
  { name: "Rintis", px: 106, py: 193, at: 47.7 },
  { name: "Jalin", px: 236, py: 63, at: 48.63 },
  { name: "Alto", px: 366, py: -66, at: 49.29 },
];
const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const hubK = easeOut(ramp(t, 42.6, 43.4));
  const [ix, iy] = P(O7, -598 + 110, -252, 30);
  const [hx, hy] = P(O7, -160, -189, 46);
  const r1: [number, number][] = [[ix, iy], [ix + 40, iy + 60], [hx - 60, hy], [hx, hy]];
  const sw = RACKS.map((r) => P(O7, r.px, r.py, 170));
  const jal = sw[2];
  const r2: [number, number][] = [[hx, hy], [jal[0], jal[1]], [1120, jal[1] - 40]];
  const p1 = ramp(t, 41.6, 43.2);
  const p2 = ramp(t, 48.55, 50.1);
  return (
    <Frame id="s7" zoom={1 + lt * 0.007} oy={900} header={<Header kicker="LANGKAH 2" title="Lewat jalur GPN" />}>
      <Bank o={O7} px={-598} py={-252} col={C.issuer} sign="ISSUER" w={180} h={190} />
      <Route pts={r1} k={ramp(t, 41.4, 42.4)} />
      {RACKS.map((r, i) => <Route key={r.name} pts={[[hx, hy], [sw[i][0], sw[i][1]]]} k={ramp(t, 45.6 + i * 0.15, 46.3 + i * 0.15)} />)}
      <Route pts={r2.slice(1)} k={ramp(t, 49.2, 49.6)} />
      <Hub o={O7} px={-160} py={-189} t={t} k={hubK} glow={ramp(t, 43.1, 43.4) * (1 - ramp(t, 45.4, 45.8)) + (p2 > 0 && p2 < 0.3 ? 0.8 : 0)} />
      {RACKS.map((r, i) => (
        <Rack key={r.name} o={O7} px={r.px} py={r.py} t={t} seed={i} k={easeOut(ramp(t, 44.2 + i * 0.2, 45.0 + i * 0.2))} active={t >= r.at && t < r.at + 0.8 ? 1 : i === 2 && p2 > 0.05 && p2 < 0.6 ? 1 : 0} />
      ))}
      {RACKS.map((r, i) => {
        const [ax, ay] = P(O7, r.px, r.py + 35, 0);
        return <Label key={r.name} x={ax + (i % 2 ? 30 : -30)} y={i % 2 ? 1250 : 1180} ax={ax} ay={ay + 6} text={r.name} size={32} k={easeOut(ramp(t, r.at, r.at + 0.4))} side={i % 2 ? "r" : "l"} />;
      })}
      <Label x={560} y={560} ax={hx + 40} ay={hy - 40} text="Gerbang Pembayaran Nasional" size={30} k={easeOut(ramp(t, 43.2, 43.7)) * (1 - ramp(t, 45.3, 45.5))} side="r" />
      {p1 > 0 && p1 < 1 ? (() => { const [x, y] = along(r1, p1); return <Packet x={x} y={y} s={0.85} />; })() : null}
      {t >= 43.2 && t < 48.55 ? <Packet x={hx} y={hy - 30 - 6 * Math.sin(t * 5)} s={0.85} /> : null}
      {p2 > 0 && p2 < 1 ? (() => { const [x, y] = along(r2, p2); return <Packet x={x} y={y} s={0.85} />; })() : null}
    </Frame>
  );
};

// ── S8 Acquirer: merchant's bank, code 00, notification ────────────────────────────────
const O8: Iso = { cx: 540, cy: 1000, s: 0.85 };
const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const bankK = easeOut(ramp(t, 50.2, 51.1));
  const [rx, ry] = P(O8, -205, 230, 150);
  const [ex, ey] = P(O8, -100, -182 + 85, 40);
  const toBank: [number, number][] = [[rx, ry - 20], [rx + 60, ry - 80], [ex - 60, ey], [ex, ey]];
  const phone: [number, number] = [870, 1080];
  const toPhone: [number, number][] = [[ex + 30, ey + 40], [ex + 30, phone[1] - 200], [phone[0], phone[1] - 200]];
  const p1 = ramp(t, 50.3, 51.3);
  const code = pop(t, 53.6, 0.5);
  const p2 = ramp(t, 55.3, 56.2);
  const ok = ramp(t, 56.1, 56.5);
  return (
    <Frame id="s8" zoom={1 + lt * 0.008} oy={920} header={<Header kicker="LANGKAH 3" title="Ke acquirer" />}>
      <Rack o={O8} px={-205} py={230} t={t} seed={2} active={p1 < 1 ? 1 : 0} />
      <Label x={70} y={1240} ax={rx - 10} ay={ry + 140} text="Jalin" size={30} k={1} side="l" />
      <Route pts={toBank} k={ramp(t, 50.2, 50.8)} />
      <Bank o={O8} px={-100} py={-182} col={C.acq} sign="BANK PEDAGANG" k={bankK} glow={code > 0 ? 0.8 * (1 - ramp(t, 55.2, 55.6)) : 0} />
      <Label x={1010} y={560} ax={P(O8, -100, -182, 150)[0] + 90} ay={P(O8, -100, -182, 150)[1] + 30} text="ACQUIRER" size={38} k={easeOut(ramp(t, 51.1, 51.5))} side="r" />
      <Route pts={toPhone} k={ramp(t, 55.0, 55.5)} col={C.green} />
      {p1 > 0 && p1 < 1 ? (() => { const [x, y] = along(toBank, p1); return <Packet x={x} y={y} s={0.9} />; })() : null}
      {code > 0 && t < 55.4 ? <Packet x={ex + 120} y={ey - 360 - code * 20} s={1.3 * code} col={C.green} text="00" /> : null}
      {p2 > 0 && p2 < 1 ? (() => { const [x, y] = along(toPhone, p2); return <Packet x={x} y={y} s={0.9} col={C.green} text="00" />; })() : null}
      <Phone id="mer8" x={phone[0]} y={phone[1]} s={0.3} screen={<SuccessScreen k={ok} />} glow={ok} glowCol={C.green} />
      <Label x={1010} y={1290} ax={phone[0] - 30} ay={phone[1] + 100} text="notifikasi" size={30} k={easeOut(ramp(t, 56.2, 56.6))} side="r" />
    </Frame>
  );
};

// ── S9 Inside Indonesia + scale ────────────────────────────────────────────────────────
const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const mapK = ramp(t, 57.6, 58.2);
  const late = ease(ramp(t, 61.4, 62.4));
  const my = lerp(640, 470, late), ms = lerp(1.0, 0.62, late), mx = lerp(40, 230, late);
  const nodes: [number, number][] = [[330, 290], [380, 262], [450, 250], [515, 268], [470, 312], [330, 290]];
  const loop = (t * 0.55) % 1;
  const people = Math.floor(20 * ramp(t, 63.6, 64.6));
  const shops = Math.floor(14 * ramp(t, 65.4, 66.2));
  return (
    <Frame id="s9" zoom={1 + lt * 0.006} oy={900} header={<Header kicker={late > 0.5 ? "PER OKTOBER 2026" : "HITUNGAN DETIK"} title={late > 0.5 ? "Dipakai di mana-mana" : "Tetap di dalam negeri"} />}>
      <g transform={`translate(${mx},${my}) scale(${ms})`}>
        <Indonesia x={0} y={0} k={mapK} />
        <path d={"M" + nodes.map((p) => p.join(",")).join("L")} fill="none" stroke={C.chip} strokeWidth={6} strokeLinejoin="round" opacity={mapK} />
        {nodes.slice(0, 5).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={11} fill={[C.ink, C.issuer, C.gpn, C.acq, C.green][i]} stroke="#fff" strokeWidth={3} opacity={mapK} />)}
        {mapK > 0 ? (() => { const [x, y] = along(nodes, loop); return <Packet x={x} y={y} s={0.55} />; })() : null}
        {/* red-white border ring */}
        <ellipse cx={495} cy={200} rx={470} ry={240} fill="none" stroke={C.red} strokeWidth={8} strokeDasharray="40 40" opacity={ramp(t, 59.9, 60.4)} />
        <ellipse cx={495} cy={200} rx={470} ry={240} fill="none" stroke="#ffffff" strokeWidth={8} strokeDasharray="40 40" strokeDashoffset={40} opacity={ramp(t, 59.9, 60.4)} />
      </g>
      <Label x={70} y={1080} ax={mx + 450 * ms} ay={my + 250 * ms} text="issuer · GPN · acquirer" size={36} k={easeOut(ramp(t, 58.4, 58.9)) * (1 - late)} side="l" />
      {people > 0
        ? Array.from({ length: people }).map((_, i) => <Person key={i} x={150 + (i % 10) * 86} y={850 + Math.floor(i / 10) * 92} s={1.5} col={i % 2 ? C.ink : "#3b3e44"} />)
        : null}
      {shops > 0
        ? Array.from({ length: shops }).map((_, i) => <Shop key={i} x={170 + (i % 7) * 120} y={1060 + Math.floor(i / 7) * 80} s={1.5} col={C.ink} />)
        : null}
    </Frame>
  );
};

// ── S10 MDR 0% for micro business ───────────────────────────────────────────────────────
const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const slip = easeOut(ramp(t, 67.7, 68.9));
  const tag = pop(t, 69.2, 0.6);
  return (
    <Frame id="s10" zoom={1.02 + lt * 0.01} oy={900} header={<Header kicker="SEJAK OKTOBER 2026" title="Usaha mikro bebas MDR" size={68} />}>
      <Warung x={540} y={900} s={0.95}>
        <Stand x={-280} y={-20} s={0.5} />
      </Warung>
      {/* receipt sliding out of a small printer on the counter */}
      <g transform="translate(640,1000)">
        <rect x={-150} y={0} width={300} height={90} rx={14} fill="#2a2d33" />
        <rect x={-150} y={0} width={300} height={22} rx={10} fill="#ffffff" opacity={0.18} />
        <g transform={`translate(0,${-slip * 420})`}>
          <rect x={-120} y={0} width={240} height={420 * slip} fill={C.paper} />
          {slip > 0.6 ? (
            <g opacity={ramp(slip, 0.6, 1)}>
              <text x={0} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.ink}>WARUNG BU SRI</text>
              <text x={0} y={84} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={20} fill={C.grey}>usaha mikro</text>
              <line x1={-100} y1={110} x2={100} y2={110} stroke="#c9c9c9" strokeDasharray="6 6" strokeWidth={2} />
              <text x={-100} y={160} fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.ink}>Bayar</text>
              <text x={100} y={160} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.ink}>Rp25.000</text>
              <text x={-100} y={210} fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.ink}>Biaya MDR</text>
              <text x={100} y={210} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.green}>Rp0</text>
              <Check x={0} y={300} s={0.8} />
            </g>
          ) : null}
        </g>
      </g>
      {tag > 0 ? (
        <g transform={`translate(270,560) rotate(${-8 + Math.sin(t * 2) * 2}) scale(${tag})`}>
          <line x1={0} y1={-80} x2={0} y2={-40} stroke={C.chip} strokeWidth={4} />
          <rect x={-150} y={-44} width={300} height={110} rx={14} fill={C.red} />
          <circle cx={-118} cy={-12} r={9} fill="#ffffff" />
          <text x={10} y={4} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={26} fill="#ffffff">transaksi sampai</text>
          <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ffffff">Rp500.000</text>
        </g>
      ) : null}
      <Label x={1010} y={500} ax={760} ay={720} text="MDR = biaya bagi pedagang" size={28} k={easeOut(ramp(t, 70.6, 71.0))} side="r" />
    </Frame>
  );
};

// ── S11 Three parties + AUDIRA EXPLAINED board ─────────────────────────────────────────
const O11: Iso = { cx: 540, cy: 880, s: 0.62 };
const S11: React.FC<SceneProps> = ({ t, lt }) => {
  const I = P(O11, -367, 173, 30), G = P(O11, -193, -193, 46), A = P(O11, 173, -367, 30);
  const loop: [number, number][] = [I, G, A, [A[0], A[1] + 140], [I[0], I[1] + 140], I];
  const lit = (a: number) => (t >= a ? 0.4 + 0.5 * Math.abs(Math.sin((t - a) * 3)) : 0);
  const board = easeOut(ramp(t, 75.6, 76.3));
  return (
    <Frame id="s11" zoom={1.06 - lt * 0.008} oy={900} header={<Header kicker="SETIAP BUNYI BERHASIL" title="= kerja tiga pihak" />}>
      <Route pts={loop} k={ramp(t, 71.8, 72.8)} />
      <Bank o={O11} px={-367} py={173} col={C.issuer} sign="ISSUER" w={180} h={180} glow={lit(74.1)} />
      <Hub o={O11} px={-193} py={-193} t={t} glow={lit(74.3)} />
      <Bank o={O11} px={173} py={-367} col={C.acq} sign="ACQUIRER" w={180} h={180} glow={lit(74.5)} />
      {(() => { const [x, y] = along(loop, (t * 0.32) % 1); return t > 72.6 ? <Packet x={x} y={y} s={0.8} /> : null; })()}
      {[["1", I], ["2", G], ["3", A]].map(([n, p], i) => {
        const k = pop(t, 74.1 + i * 0.2, 0.5);
        const [x, y] = p as [number, number];
        return k > 0 ? (
          <g key={i} transform={`translate(${x},${y + 200}) scale(${k})`}>
            <circle r={36} fill={C.red} stroke="#fff" strokeWidth={4} />
            <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff">{n as string}</text>
          </g>
        ) : null;
      })}
      {board > 0 ? (
        <g transform={`translate(540,${1180 + (1 - board) * 80}) scale(${0.85 + 0.15 * board})`} opacity={board}>
          <rect x={-330} y={-80} width={660} height={190} rx={22} fill="rgba(30,25,20,.3)" filter="url(#blur8)" transform="translate(12,16)" />
          <rect x={-330} y={-80} width={660} height={190} rx={22} fill={C.chip} />
          <rect x={-330} y={-80} width={660} height={40} rx={22} fill="#ffffff" opacity={0.12} />
          <circle cx={-280} cy={-30} r={12} fill={C.red} />
          <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} letterSpacing={6} fill="#ffffff">AUDIRA</text>
          <text x={0} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} letterSpacing={10} fill="#ff4b4b">EXPLAINED</text>
        </g>
      ) : null}
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 };
