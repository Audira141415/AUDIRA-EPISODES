// EP21 "Bug Y2K" — AUDIRA TECH (@AudiraTECH). Style TERMINAL (kit from audira-2d-motion, copied to src/m2d).
// 1080×1920, 87.6 s = VO 84.44 s (locked, public/audio/vo.wav) + 3 s AUDIRA outro. Scene cuts follow the VO words
// (docs/SHOTLIST.md). No <Audio> here: render:final mixes --vo and --sfx.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, HEAD, MONO, glow, Typed, Win, HexRain, CRT, Glitch} from '../m2d/styles/terminal/kit';
import {p, pb, lerp, rnd} from '../m2d/styles/shared';
import {buildPages, CaptionPage} from '../m2d/components/WordCaptions';
import {AudiraSignature} from '../brand/AudiraSignature';
import {AudiraOutro} from '../brand/AudiraOutro';
import voWords from '../vo-words.json';

export const Y2K_SECONDS = 87.6;
const OUTRO_AT = 84.6;

// ---------- fonts ('Term Head' = VT323, 'Term Mono' = JetBrains Mono) ----------
let fontsReady: Promise<void> | null = null;
const loadFonts = () => {
  if (!fontsReady) {
    const faces = [
      new FontFace('Term Head', `url(${staticFile('fonts/VT323-Regular.ttf')})`),
      new FontFace('Term Mono', `url(${staticFile('fonts/JetBrainsMono-Var.ttf')})`, {weight: '100 900'}),
    ];
    fontsReady = Promise.all(faces.map((f) => f.load().then((ff) => { (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff); }))).then(() => undefined);
  }
  return fontsReady;
};
const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => { loadFonts().then(() => continueRender(handle)).catch(() => continueRender(handle)); }, [handle]);
};

// ---------- timing ----------
type VW = {id: string; text: string; start: number; end: number};
const WORDS = (voWords as VW[]).map((w, i) => ({i, word: w.text, start: w.start, end: w.end}));
const PAGES: CaptionPage[] = buildPages(WORDS, 4, 22, 0.45);

const SCENES = [0, 8.0, 16.4, 23.3, 36.7, 46.6, 62.9, 76.7, OUTRO_AT];
const SCENE_DY = [60, 100, 0, 0, 0, 0, 70, 0];
const CUTS = [2.8, 8.0, 13.8, 16.4, 20.0, 23.3, 28.3, 29.4, 32.3, 36.7, 40.3, 44.1, 46.6, 47.1, 50.0, 57.0, 60.3, 62.9, 64.7, 68.9, 74.6, 76.7, 80.6];
const IMPACTS = [2.8, 3.5, 28.3, 32.4, 33.5, 35.1, 42.6, 45.9, 47.1, 60.4, 74.6];

const shakeAt = (t: number, amp = 14, dur = 0.32) => {
  let x = 0, y = 0;
  for (const s of IMPACTS) {
    const k = t - s;
    if (k < 0 || k > dur) continue;
    const a = amp * (1 - k / dur);
    x += Math.sin(k * 90) * a;
    y += Math.cos(k * 73) * a * 0.6;
  }
  return {x, y};
};

/** Continuous camera per scene: even scenes push in, odd scenes pull back, all pan slowly. */
const Cam: React.FC<{t: number; a: number; b: number; i: number; fy?: number; dy?: number; children: React.ReactNode}> = ({t, a, b, i, fy = 30, dy = 0, children}) => {
  if (t < a || t >= b) return null;
  const k = (t - a) / (b - a);
  // G13 (final gate): drift was too slow (medianSpeed 0.017) -> wider push + continuous sway
  const z = (i % 2 === 0 ? lerp(0.98, 1.05, k) : lerp(1.05, 0.98, k)) + Math.sin(t * 2.4) * 0.03;
  const px = (i % 3 === 0 ? 1 : -1) * lerp(-20, 20, k) + Math.sin(t * 2.4 + i) * 40;
  const py = lerp(24, -24, k) + Math.cos(t * 2.0 + i) * 26;
  const sh = shakeAt(t);
  return (
    <AbsoluteFill style={{transformOrigin: `50% ${fy}%`, transform: `translate(${px + sh.x}px, ${py + dy + sh.y}px) scale(${z})`, filter: 'drop-shadow(0 22px 26px rgba(0,0,0,.95))'}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- small building blocks ----------
const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 200, color = T.white, style}) => (
  <div style={{fontFamily: HEAD, fontSize: size, lineHeight: 0.9, color, textShadow: glow(color === T.white ? T.g : color), ...style}}>{children}</div>
);

/** Kinetic data callout: bordered card that drops in with a back-ease. */
const Callout: React.FC<{t: number; at: number; y: number; title: string; value: React.ReactNode; color?: string; x?: number; w?: number; size?: number; out?: number}> = ({
  t, at, y, title, value, color = T.amber, x = 90, w = 900, size = 130, out = 1e9,
}) => {
  const q = pb(t, at, at + 0.35);
  const o = 1 - p(t, out, out + 0.25);
  if (q <= 0 || o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: Math.min(1, q * 1.6) * o, transform: `translateY(${(1 - q) * -60}px) scale(${0.85 + 0.15 * q})`,
      border: `3px solid ${color}`, background: `${T.bg}f0`, boxShadow: `0 0 30px ${color}55, inset 0 0 30px ${color}22`, padding: '18px 28px'}}>
      <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: 2, color, textShadow: glow(color)}}>{title}</div>
      <div style={{fontFamily: HEAD, fontSize: size, lineHeight: 1, color, textShadow: glow(color), marginTop: 6}}>{value}</div>
    </div>
  );
};

const Stamp: React.FC<{t: number; at: number; text: string; color?: string; x: number; y: number; size?: number; rot?: number}> = ({t, at, text, color = T.g, x, y, size = 96, rot = -7}) => {
  const q = p(t, at, at + 0.22);
  if (q <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${lerp(2.2, 1, q)})`, opacity: q, border: `8px solid ${color}`, padding: '8px 26px',
      fontFamily: HEAD, fontSize: size, lineHeight: 1, color, textShadow: glow(color), boxShadow: `0 0 40px ${color}66`, background: `${T.bg}cc`, whiteSpace: 'nowrap'}}>{text}</div>
  );
};

/** Slide-in wrapper: from the right in, to the left out. */
const Slide: React.FC<{t: number; a: number; b: number; children: React.ReactNode}> = ({t, a, b, children}) => {
  const i = p(t, a, a + 0.4), o = p(t, b - 0.3, b);
  if (t < a || t >= b) return null;
  return <AbsoluteFill style={{transform: `translateX(${(1 - i) * 1100 - o * 1100}px)`, opacity: 1 - o * 0.6}}>{children}</AbsoluteFill>;
};

const Box: React.FC<{ch: string; x: number; y: number; w?: number; h?: number; color?: string; size?: number; style?: React.CSSProperties}> = ({ch, x, y, w = 200, h = 260, color = T.g, size = 240, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, border: `4px solid ${color}`, background: `${T.bg}ee`, boxShadow: `0 0 26px ${color}55, inset 0 0 26px ${color}22`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: size, color, textShadow: glow(color), ...style}}>{ch}</div>
);

const Label: React.FC<{x: number; y: number; children: React.ReactNode; color?: string; size?: number; w?: number; center?: boolean; o?: number}> = ({x, y, children, color = T.g, size = 40, w, center, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: center ? 'center' : 'left', fontFamily: MONO, fontWeight: 800, fontSize: size, color, textShadow: glow(color), opacity: o, letterSpacing: 1}}>{children}</div>
);

const fmtInt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------- S1 hook 0–8 ----------
const S1: React.FC<{t: number}> = ({t}) => {
  const flipped = t >= 2.8;
  const sec = Math.min(59, 57 + Math.floor(t / 0.8));
  const blink = Math.floor(t * 6) % 2 === 0;
  return (
    <>
      <Win x={90} y={250} w={900} h={500} title="SYSTEM_CLOCK" q={p(t, 0, 0.5)} color={flipped ? T.alert : T.g}>
        <div style={{textAlign: 'center', marginTop: 20}}>
          <Big size={150} color={flipped ? T.alert : T.white}>{flipped ? '01.01.1900' : '31.12.1999'}</Big>
          <Big size={190} color={flipped ? T.alert : T.g} style={{marginTop: 14}}>{flipped ? '00:00:00' : `23:59:${sec}`}</Big>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 36, color: flipped ? T.amber : T.g, marginTop: 18, opacity: flipped && !blink ? 0.8 : 1}}>
            {flipped ? 'EXPECTED: 01.01.2000  ✗ MISMATCH' : 'sys.date --watch'}
          </div>
        </div>
      </Win>
      {t >= 3.4 && t < 6.5 && (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', transform: `scale(${lerp(1.6, 1, pb(t, 3.4, 3.8))})`, opacity: p(t, 3.4, 3.6) * (1 - p(t, 6.2, 6.5))}}>
            <Big size={400} color={T.alert}>00</Big>
          </div>
          <Callout t={t} at={5.2} y={1110} title="> PENYEBABNYA" value="DUA ANGKA NOL" color={T.amber} size={96} out={6.2} />
        </>
      )}
      {t >= 6.4 && (
        <Win x={90} y={820} w={900} h={330} title="boot.log" q={p(t, 6.4, 6.8)}>
          <div><Typed text="> boot AUDIRA TECH" t={t} start={6.6} cps={34} cursor={false} /></div>
          <div><Typed text="> load y2k.sh ........ " t={t} start={7.1} cps={40} cursor={false} />{t > 7.6 && <span style={{color: T.bg, background: T.g, padding: '0 8px'}}>OK</span>}</div>
        </Win>
      )}
    </>
  );
};

// ---------- S2 expensive memory 8–16.4 ----------
const CoreGrid: React.FC<{t: number}> = ({t}) => {
  const cols = 16, rows = 10, gx = 52, gy = 50;
  return (
    <svg width={cols * gx + 40} height={rows * gy + 40} style={{display: 'block', margin: '0 auto'}}>
      {Array.from({length: rows}).map((_, r) => <line key={`h${r}`} x1={10} x2={cols * gx + 30} y1={30 + r * gy} y2={30 + r * gy} stroke={T.dim} strokeWidth={2} />)}
      {Array.from({length: cols}).map((_, c) => <line key={`v${c}`} y1={10} y2={rows * gy + 30} x1={30 + c * gx} x2={30 + c * gx} stroke={T.dim} strokeWidth={2} />)}
      {Array.from({length: rows * cols}).map((_, n) => {
        const r = Math.floor(n / cols), c = n % cols;
        const lit = p(t, 8.3 + r * 0.32 + c * 0.012, 8.5 + r * 0.32 + c * 0.012);
        const on = lit > 0.5 && rnd(n + Math.floor(t * 3)) > 0.45;
        const col = on ? T.g : T.faint;
        return <ellipse key={n} cx={30 + c * gx} cy={30 + r * gy} rx={15} ry={9} transform={`rotate(45 ${30 + c * gx} ${30 + r * gy})`} fill="none" stroke={lit > 0 ? col : T.faint}
          strokeWidth={6} style={{filter: on ? `drop-shadow(0 0 6px ${T.g})` : undefined}} />;
      })}
    </svg>
  );
};

const S2: React.FC<{t: number}> = ({t}) => {
  const out = p(t, 13.6, 14.0);
  return (
    <>
      {t < 14.1 && (
        <AbsoluteFill style={{transform: `translateY(${-out * 1300}px)`}}>
          <Win x={60} y={240} w={960} h={700} title="CORE_MEMORY · 1965" q={p(t, 8.0, 8.4)}>
            <CoreGrid t={t} />
            <div style={{fontFamily: MONO, fontSize: 36, color: T.g, marginTop: 6}}>1 cincin = 1 bit · 160 bit</div>
          </Win>
          <Label x={90} y={910} o={p(t, 9.7, 10.1)} color={T.amber} size={44}>MEMORI KOMPUTER 1960-AN: MAHAL</Label>
          <Callout t={t} at={11.7} y={990} title="> HARGA SEKITAR" value="1 BIT ≈ US$1" size={140} />
        </AbsoluteFill>
      )}
      {t >= 13.8 && (
        <>
          <Win x={60} y={260} w={960} h={600} title="PAYROLL.CBL" q={p(t, 13.8, 14.2)}>
            <div style={{fontSize: 40, lineHeight: 1.5}}>
              <div><Typed text="01 TANGGAL." t={t} start={14.0} cps={60} cursor={false} /></div>
              <div><Typed text="   05 HARI   PIC 99." t={t} start={14.25} cps={60} cursor={false} /></div>
              <div><Typed text="   05 BULAN  PIC 99." t={t} start={14.6} cps={60} cursor={false} /></div>
              <div style={{background: t > 15.3 ? `${T.amber}33` : 'transparent'}}><Typed text="   05 TAHUN  PIC 99." t={t} start={14.95} cps={60} color={T.amber} /></div>
            </div>
            <div style={{fontFamily: MONO, fontSize: 36, color: T.g, marginTop: 20}}>* tahun cukup 2 digit: 1999 → 99</div>
          </Win>
          <Callout t={t} at={15.6} y={940} title="> PROGRAMMER BERHEMAT" value={<span>HEMAT <span style={{color: T.g}}>2 DIGIT</span></span>} size={130} />
        </>
      )}
    </>
  );
};

// ---------- S3 two digits 16.4–23.3 ----------
const Drum: React.FC<{x: number; y: number; v: number}> = ({x, y, v}) => {
  // v: 9 → 10 (shows 9 rolling to 0)
  const h = 260;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 220, height: h, overflow: 'hidden', border: `4px solid ${T.g}`, background: T.bg, boxShadow: `0 0 26px ${T.g}55, inset 0 0 40px #000`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: -(v - 8) * h}}>
        {[8, 9, 0, 1].map((d, i) => Math.abs(i - (v - 8)) >= 1 ? null : (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: i * h, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: 250, color: d === 0 ? T.alert : T.g, textShadow: glow(d === 0 ? T.alert : T.g)}}>{d}</div>
        ))}
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#000c, transparent 30%, transparent 70%, #000c)'}} />
    </div>
  );
};

const S3: React.FC<{t: number}> = ({t}) => {
  const fall = p(t, 18.4, 19.1);
  const slide = p(t, 18.9, 19.5);
  const roll = t < 20 ? 9 : lerp(9, 10, p(t, 21.6, 22.6));
  return (
    <>
      <Label x={0} w={1080} center y={440} size={48} o={p(t, 16.5, 16.9)}>TAHUN = 1999 · DISIMPAN = ?</Label>
      {t < 20.0 ? (
        <>
          {['1', '9', '9', '9'].map((c, i) => {
            const dropped = i < 2;
            const baseX = 95 + i * 230;
            const x = dropped ? baseX : lerp(baseX, 95 + (i - 2) * 230 + 230 * 1.0 + 0, slide);
            const y = dropped ? 640 + fall * fall * 1400 : 640;
            const rot = dropped ? fall * (i === 0 ? -35 : 25) : 0;
            return <Box key={i} ch={c} x={x} y={y} color={dropped && fall > 0 ? T.alert : T.g} style={{transform: `rotate(${rot}deg)`, opacity: pb(t, 16.5 + i * 0.12, 16.9 + i * 0.12)}} />;
          })}
          <Callout t={t} at={18.9} y={900} title="> CUKUP DITULIS" value="1999 → 99" size={150} />
        </>
      ) : (
        <>
          <Drum x={300} y={420} v={roll} />
          <Drum x={560} y={420} v={roll} />
          <Label x={0} w={1080} center y={730} size={40} color={T.dim} o={p(t, 20.1, 20.4)}>setelah 99 datang ...</Label>
          <Callout t={t} at={22.4} y={840} title="> PERGANTIAN ABAD" value={<span>99 → <span style={{color: T.alert}}>00</span></span>} size={170} color={T.alert} />
        </>
      )}
    </>
  );
};

// ---------- S4 misread 23.3–36.7 ----------
const IconBank = ({c}: {c: string}) => (
  <svg width={120} height={120} viewBox="0 0 12 12" shapeRendering="crispEdges"><path d="M6 1 L11 4 L1 4 Z" fill={c} /><rect x={1} y={10} width={10} height={1} fill={c} />
    {[2, 5, 8].map((x) => <rect key={x} x={x} y={5} width={1.4} height={4.5} fill={c} />)}</svg>
);
const IconPlane = ({c}: {c: string}) => (
  <svg width={120} height={120} viewBox="0 0 12 12" shapeRendering="crispEdges"><rect x={1} y={5} width={10} height={2} fill={c} /><rect x={5} y={1} width={2} height={10} fill={c} transform="skewX(-20) translate(2 0)" />
    <rect x={1} y={3} width={1.5} height={6} fill={c} /></svg>
);
const IconBolt = ({c}: {c: string}) => (
  <svg width={120} height={120} viewBox="0 0 12 12"><path d="M7 0 L2 7 L5.5 7 L4 12 L10 4.5 L6.5 4.5 Z" fill={c} /></svg>
);

const S4: React.FC<{t: number}> = ({t}) => {
  if (t < 29.4) {
    const attach = pb(t, 24.5, 25.3);
    return (
      <>
        <Label x={0} w={1080} center y={250} size={36} o={p(t, 23.4, 23.8)}>KOMPUTER MENEMPELKAN “19” DI DEPAN</Label>
        <Box ch="1" x={lerp(-500, 95, attach)} y={380} color={T.amber} />
        <Box ch="9" x={lerp(-270, 325, attach)} y={380} color={T.amber} />
        <Box ch="0" x={555} y={380} color={T.alert} style={{opacity: pb(t, 23.4, 23.8)}} />
        <Box ch="0" x={785} y={380} color={T.alert} style={{opacity: pb(t, 23.5, 23.9)}} />
        <Label x={95} y={660} size={36} color={T.amber} o={p(t, 25.0, 25.4)}>▲ AWALAN OTOMATIS</Label>
        <Label x={555} y={660} size={36} color={T.alert} o={p(t, 25.0, 25.4)}>▲ DATA: 00</Label>
        {t >= 28.0 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', transform: `scale(${lerp(1.5, 1, pb(t, 28.0, 28.4))})`}}>
            <Big size={300} color={T.alert}>= 1900</Big>
          </div>
        )}
        {t >= 28.6 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center', opacity: p(t, 28.6, 28.8)}}>
            <span style={{position: 'relative', display: 'inline-block'}}>
              <Big size={170} color={T.dim}>BUKAN 2000</Big>
              <span style={{position: 'absolute', left: 0, top: '48%', height: 10, width: `${p(t, 28.7, 29.1) * 100}%`, background: T.alert, boxShadow: glow(T.alert)}} />
            </span>
          </div>
        )}
      </>
    );
  }
  if (t < 32.3) {
    const yr = Math.round(lerp(2000, 1900, p(t, 30.4, 31.6)));
    return (
      <>
        <Win x={60} y={250} w={960} h={620} title="BANK_INTEREST.EXE" q={p(t, 29.4, 29.8)} color={T.amber}>
          <div style={{display: 'flex', gap: 28, alignItems: 'center'}}>
            <IconBank c={T.amber} />
            <div style={{fontSize: 38, lineHeight: 1.6}}>
              <div style={{color: T.g}}>MULAI SIMPAN : 1999</div>
              <div style={{color: T.alert}}>HARI INI     : {yr}</div>
            </div>
          </div>
          <div style={{marginTop: 26, fontFamily: HEAD, fontSize: 120, color: T.alert, textShadow: glow(T.alert)}}>LAMA = {yr - 1999} THN</div>
        </Win>
        <Callout t={t} at={31.2} y={930} title="> BUNGA DIHITUNG MUNDUR" value="−100 TAHUN" color={T.alert} size={170} />
      </>
    );
  }
  const alerts = [
    {at: 32.4, title: 'TAGIHAN BANK', icon: IconBank, y: 300, x: 60},
    {at: 33.5, title: 'JADWAL PESAWAT', icon: IconPlane, y: 620, x: 120},
    {at: 35.1, title: 'JARINGAN LISTRIK', icon: IconBolt, y: 940, x: 80},
  ];
  return (
    <>
      {alerts.map((a, i) => {
        const q = p(t, a.at, a.at + 0.25);
        const blink = Math.floor((t - a.at) * 5) % 2 === 0;
        return (
          <Win key={i} x={a.x} y={a.y} w={880} h={290} title={`ALERT #${i + 1}`} q={q} color={T.alert} shake={t - a.at < 0.4 ? Math.sin(t * 120) * 10 : 0}>
            <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
              <a.icon c={T.alert} />
              <div>
                <div style={{fontFamily: HEAD, fontSize: 82, lineHeight: 1, color: T.white, textShadow: glow(T.alert)}}>{a.title}</div>
                <div style={{color: T.alert, opacity: blink ? 1 : 0.7, fontSize: 38}}>✗ ERROR · TGL 01.01.1900</div>
              </div>
            </div>
          </Win>
        );
      })}
    </>
  );
};

// ---------- S5 the world moves 36.7–46.6 ----------
const CODE = ['MOVE TGL-LAHIR TO WS-TGL.', 'COMPUTE UMUR = THN - LAHIR.', '05 THN-TAGIH   PIC 99.', 'IF THN-JATUH < THN-INI', 'ADD 1 TO WS-BULAN.', '05 THN-POLIS   PIC 99.', 'PERFORM HITUNG-BUNGA.', 'MOVE 19 TO ABAD.', '05 THN-GAJI    PIC 99.', 'WRITE REKAP-RECORD.', 'GO TO SELESAI.'];
const S5: React.FC<{t: number}> = ({t}) => {
  if (t < 40.3) {
    return (
      <>
        <Win x={60} y={250} w={960} h={500} title="memo_1958.txt" q={p(t, 36.7, 37.1)} color={T.amber}>
          <div style={{fontSize: 38, lineHeight: 1.6}}>
            <div><Typed text="DARI   : Bob Bemer" t={t} start={37.0} cps={45} color={T.amber} cursor={false} /></div>
            <div><Typed text="TAHUN  : 1958" t={t} start={37.5} cps={45} color={T.amber} cursor={false} /></div>
            <div><Typed text="PERIHAL: tahun 2 digit =" t={t} start={37.9} cps={45} color={T.amber} cursor={false} /></div>
            <div><Typed text="         bom waktu di 2000" t={t} start={38.5} cps={45} color={T.alert} /></div>
          </div>
        </Win>
        <Callout t={t} at={39.0} y={820} title="> PERINGATAN PERTAMA SEJAK" value="1958" size={240} />
      </>
    );
  }
  if (t < 44.1) {
    const scan = ((t - 40.4) / 1.3) % 1;
    const lines = Math.round(lerp(0, 1000000, p(t, 41.8, 43.9)));
    return (
      <>
        <Win x={60} y={240} w={960} h={760} title="AUDIT_KODE_LAMA" q={p(t, 40.3, 40.7)}>
          <div style={{position: 'relative', fontSize: 36, lineHeight: 1.45}}>
            {CODE.map((l, i) => {
              const bad = l.includes('PIC 99');
              const fixed = bad && t > 41.2 + i * 0.15;
              return (
                <div key={i} style={{color: fixed ? T.g : bad ? T.amber : T.dim, whiteSpace: 'nowrap'}}>
                  {String(i + 1).padStart(3, '0')} {fixed ? l.replace('PIC 99.', 'PIC 9999. ✓') : l}
                </div>
              );
            })}
            <div style={{position: 'absolute', left: -22, right: -22, top: `${scan * 100}%`, height: 8, background: T.g, boxShadow: `0 0 24px ${T.g}`, opacity: t > 40.5 ? 0.85 : 0}} />
          </div>
        </Win>
        <Stamp t={t} at={42.6} text="✓ PATCHED" x={520} y={760} size={90} />
        <Label x={90} y={1060} size={44} o={p(t, 41.8, 42.1)} color={T.amber}>BARIS DIPERIKSA:</Label>
        <Big size={150} color={T.white} style={{position: 'absolute', left: 90, top: 1110, opacity: p(t, 41.8, 42.1)}}>{fmtInt(lines)}+</Big>
      </>
    );
  }
  const fill = p(t, 44.2, 45.9);
  return (
    <>
      <Label x={0} w={1080} center y={300} size={46} o={p(t, 44.1, 44.4)}>BIAYA PERBAIKAN GLOBAL</Label>
      <div style={{position: 'absolute', left: 90, top: 400, width: 900, height: 140, border: `4px solid ${T.amber}`, padding: 12, display: 'flex', gap: 8, boxShadow: `0 0 26px ${T.amber}44`}}>
        {Array.from({length: 15}).map((_, i) => (
          <div key={i} style={{flex: 1, background: i < fill * 15 ? T.amber : T.faint, boxShadow: i < fill * 15 ? `0 0 12px ${T.amber}` : 'none'}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center'}}>
        <Big size={190} color={T.amber}>US${Math.round(fill * 300)}</Big>
        <Big size={150} color={T.amber} style={{opacity: p(t, 45.6, 45.9)}}>MILIAR+</Big>
      </div>
      <Label x={0} w={1080} center y={1050} size={28} color={T.dim} o={p(t, 45.9, 46.2)}>sumber: BBC · IDC (± US$308 miliar)</Label>
    </>
  );
};

// ---------- S6 midnight 46.6–62.9 ----------
const Skyline: React.FC<{t: number}> = ({t}) => {
  const b = [[0, 260], [110, 380], [250, 300], [360, 460], [500, 340], [620, 420], [760, 280], [870, 400], [980, 320]];
  return (
    <svg width={1080} height={480} style={{position: 'absolute', left: 0, top: 760}}>
      {b.map(([x, h], i) => (
        <g key={i}>
          <rect x={x} y={480 - h} width={100} height={h} fill={T.bg} stroke={T.dim} strokeWidth={3} />
          {Array.from({length: Math.floor(h / 40) * 3}).map((_, k) => {
            const cx = x + 14 + (k % 3) * 28, cy = 480 - h + 16 + Math.floor(k / 3) * 40;
            const on = rnd(i * 50 + k) > 0.3;
            return <rect key={k} x={cx} y={cy} width={16} height={20} fill={on ? (rnd(k + i) > 0.7 ? T.amber : T.g) : T.faint} opacity={on ? 0.7 + 0.3 * rnd(k + Math.floor(t * 2)) : 1} />;
          })}
        </g>
      ))}
    </svg>
  );
};

const S6: React.FC<{t: number}> = ({t}) => {
  if (t < 50.0) {
    const done = t >= 47.1;
    const ring = (t - 47.1);
    return (
      <>
        <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center'}}>
          <Big size={130} color={done ? T.g : T.white}>{done ? '01.01.2000' : '31.12.1999'}</Big>
          <Big size={200} color={done ? T.g : T.amber}>{done ? '00:00:00' : '23:59:59'}</Big>
        </div>
        {done && [0, 0.35, 0.7].map((d, i) => {
          const k = Math.max(0, ring - d);
          return k > 0 && k < 1.4 ? <div key={i} style={{position: 'absolute', left: 540 - 300 * (0.5 + k), top: 400 - 140 * (0.5 + k), width: 600 * (0.5 + k), height: 280 * (0.5 + k), borderRadius: '50%', border: `4px solid ${T.g}`, opacity: (1.4 - k) / 1.4 * 0.7}} /> : null;
        })}
        <Skyline t={t} />
        <Label x={0} w={1080} center y={660} size={44} o={p(t, 48.4, 48.8)}>✓ LAMPU DUNIA TETAP MENYALA</Label>
      </>
    );
  }
  if (t >= 60.3) {
    return (
      <>
        <Label x={0} w={1080} center y={300} size={40} color={T.dim}>status: 01.01.2000 · sistem normal</Label>
        <Stamp t={t} at={60.4} text="KIAMAT DIBATALKAN" x={70} y={520} size={118} rot={-6} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: p(t, 61.8, 62.1)}}>
          <Big size={110} color={T.amber}>KARENA DIPERBAIKI</Big>
        </div>
      </>
    );
  }
  return (
    <>
      <div style={{position: 'absolute', left: 90, top: 250, fontFamily: MONO, fontWeight: 800, fontSize: 52}}><Typed text="YANG RUSAK: HAL KECIL" t={t} start={50.0} cps={30} /></div>
      <Slide t={t} a={51.6} b={54.45}>
        <Win x={60} y={360} w={960} h={760} title="INSIDEN #1 · JEPANG" q={1} color={T.amber}>
          <svg width={300} height={300} viewBox="-50 -50 100 100" style={{display: 'block', margin: '10px auto'}}>
            <circle r={46} fill="none" stroke={T.amber} strokeWidth={4} />
            {[0, 120, 240].map((a) => <path key={a} d="M0 0 L-14 -38 A40 40 0 0 1 14 -38 Z" fill={T.amber} transform={`rotate(${a + 60})`} />)}
            <circle r={8} fill={T.amber} />
          </svg>
          <div style={{fontFamily: HEAD, fontSize: 96, color: T.white, textShadow: glow(T.amber), textAlign: 'center'}}>PLTN SHIKA</div>
          <div style={{textAlign: 'center', fontSize: 36, color: T.amber}}>monitor radiasi sempat mati</div>
          <div style={{textAlign: 'center', fontSize: 36, color: T.g, marginTop: 8}}>cepat dipulihkan · tanpa bahaya</div>
        </Win>
      </Slide>
      <Slide t={t} a={54.45} b={56.95}>
        <Win x={60} y={360} w={960} h={760} title="INSIDEN #2 · DELAWARE, AS" q={1} color={T.amber}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 8, padding: '6px 4px'}}>
            {Array.from({length: 150}).map((_, i) => {
              const off = t > 55.3 + rnd(i) * 0.7;
              return <div key={i} style={{height: 30, border: `2px solid ${off ? T.alert : T.g}`, background: off ? `${T.alert}33` : `${T.g}44`}} />;
            })}
          </div>
          <div style={{fontFamily: HEAD, fontSize: 104, color: T.white, textShadow: glow(T.amber), textAlign: 'center', marginTop: 20}}>150 MESIN SLOT</div>
          <div style={{textAlign: 'center', fontSize: 36, color: T.alert}}>berhenti</div>
        </Win>
      </Slide>
      <Slide t={t} a={56.95} b={60.35}>
        <Win x={60} y={360} w={960} h={760} title="SITUS RESMI AS · usno.navy.mil" q={1}>
          <div style={{border: `2px solid ${T.dim}`, padding: '10px 18px', fontSize: 36, color: T.g}}>usno.navy.mil/time</div>
          <div style={{marginTop: 50, fontSize: 40, color: T.g}}>Tanggal hari ini:</div>
          <div style={{fontFamily: HEAD, fontSize: 190, color: T.alert, textShadow: glow(T.alert), opacity: Math.floor(t * 4) % 2 === 0 || t < 58.8 ? 1 : 0.35}}>
            1 Jan {t < 58.6 ? '2000' : '19100'}
          </div>
          <div style={{fontSize: 40, color: T.amber, marginTop: 10}}>“19” + “100” → 19100</div>
        </Win>
      </Slide>
    </>
  );
};

// ---------- S7 2038 63–76.7 ----------
const Register: React.FC<{bits: string; cell?: number; per?: number; x?: number; y: number; sign?: boolean; grow?: number}> = ({bits, cell = 52, per = 16, x, y, sign = true, grow = 1}) => {
  const rows = Math.ceil(bits.length / per);
  const w = per * (cell + 4);
  return (
    <div style={{position: 'absolute', left: x ?? (1080 - w) / 2, top: y, width: w}}>
      {Array.from({length: rows}).map((_, r) => (
        <div key={r} style={{display: 'flex', gap: 4, marginBottom: 6, opacity: r === 0 ? 1 : Math.min(1, grow * rows - r)}}>
          {bits.slice(r * per, r * per + per).split('').map((b, i) => {
            const isSign = sign && r === 0 && i === 0;
            const c = isSign ? (b === '1' ? T.alert : T.amber) : b === '1' ? T.g : T.dim;
            return <div key={i} style={{width: cell, height: cell * 1.25, border: `2px solid ${isSign ? T.amber : T.dim}`, background: b === '1' ? `${c}33` : T.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: cell * 1.05, color: c, textShadow: b === '1' ? glow(c) : 'none'}}>{b}</div>;
          })}
        </div>
      ))}
    </div>
  );
};
const bin32 = (n: number) => (n >>> 0).toString(2).padStart(32, '0');

const Bomb: React.FC<{t: number; s: number; x: number; y: number}> = ({t, s, x, y}) => {
  const spark = 0.6 + 0.4 * rnd(Math.floor(t * 20));
  return (
    <svg width={420 * s} height={420 * s} viewBox="0 0 420 420" style={{position: 'absolute', left: x, top: y}}>
      <path d="M270 110 Q 320 40 370 60" fill="none" stroke={T.amber} strokeWidth={10} strokeDasharray="14 8" />
      <circle cx={372} cy={58} r={22 * spark} fill={T.amber} style={{filter: `drop-shadow(0 0 16px ${T.amber})`}} />
      <rect x={230} y={100} width={70} height={50} fill={T.dim} transform="rotate(35 265 125)" />
      <circle cx={200} cy={250} r={150} fill={T.bg} stroke={T.alert} strokeWidth={10} style={{filter: `drop-shadow(0 0 20px ${T.alert}88)`}} />
      <text x={200} y={290} textAnchor="middle" style={{fontFamily: HEAD, fontSize: 130, fill: T.alert, color: T.alert}}>2038</text>
    </svg>
  );
};

const S7: React.FC<{t: number}> = ({t}) => {
  const MAX = 2147483647;
  const bombS = t < 64.7 ? 1 : lerp(1, 0.36, p(t, 64.7, 65.3));
  const bombX = lerp(330, 800, p(t, 64.7, 65.3)), bombY = lerp(300, 150, p(t, 64.7, 65.3));
  let val: number;
  if (t < 69.5) val = Math.floor(lerp(9.46e8, 1.7e9, p(t, 65.0, 69.4, (x) => x))) + Math.floor(t * 60);
  else val = Math.floor(lerp(1.7e9, MAX, p(t, 69.5, 70.4)));
  const over = t >= 74.6;
  const bits = over ? '1' + '0'.repeat(31) : bin32(Math.min(MAX, val));
  return (
    <>
      <Bomb t={t} s={bombS} x={bombX} y={bombY} />
      {t < 64.7 && <Label x={0} w={1080} center y={800} size={50} color={T.alert} o={p(t, 63.2, 63.5)}>BOM WAKTU BERIKUTNYA</Label>}
      {t >= 64.7 && (
        <>
          <div style={{position: 'absolute', left: 90, top: 255, fontFamily: MONO, fontWeight: 800, fontSize: 48}}>
            <Typed text="time_t (32 bit)" t={t} start={64.8} cps={34} color={T.amber} cursor={false} />
          </div>
          <Label x={90} y={330} size={36} color={T.dim} o={p(t, 65.4, 65.7)}>= detik sejak 01.01.1970 00:00 UTC</Label>
          <Register bits={bits} y={440} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center'}}>
            <Big size={140} color={over ? T.alert : t > 70.3 ? T.amber : T.white}>{over ? '−2.147.483.648' : fmtInt(Math.min(MAX, val))}</Big>
          </div>
          {t >= 68.9 && !over && (
            <Callout t={t} at={71.1} y={830} title="> BATAS · HABIS PADA" value="19 JAN 2038" size={150} out={74.5} />
          )}
          {t >= 71.6 && !over && <Label x={0} w={1080} center y={1120} size={40} color={T.amber} o={p(t, 72.0, 72.3)}>03:14:07 UTC</Label>}
          {over && (
            <>
              <Label x={0} w={1080} center y={820} size={40} color={T.alert}>+1 DETIK → OVERFLOW</Label>
              <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', transform: `scale(${lerp(1.5, 1, pb(t, 74.6, 75.0))})`}}>
                <Big size={210} color={T.alert}>13 DES 1901</Big>
              </div>
              <Label x={0} w={1080} center y={1090} size={36} color={T.dim} o={p(t, 75.4, 75.7)}>20:45:52 UTC · jam melompat mundur</Label>
            </>
          )}
        </>
      )}
    </>
  );
};

// ---------- S8 cure + CTA 76.7–84.6 ----------
const S8: React.FC<{t: number}> = ({t}) => {
  if (t < 80.6) {
    const grow = p(t, 77.0, 78.0);
    const bits = '0'.repeat(1) + '0'.repeat(30) + '1'.repeat(33);
    return (
      <>
        <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center'}}>
          <Big size={170} color={T.g}>{grow < 0.5 ? '32' : '64'} BIT</Big>
        </div>
        <Register bits={bits} y={450} cell={50} grow={0.25 + 0.75 * grow} />
        <Callout t={t} at={78.9} y={880} title="> CUKUP UNTUK" value="± 292 MILIAR TAHUN" color={T.g} size={112} />
        <Label x={0} w={1080} center y={1150} size={28} color={T.dim} o={p(t, 79.4, 79.7)}>sudah dipakai: Linux 5.6 (2020) · glibc 2.34 (2021)</Label>
      </>
    );
  }
  return (
    <>
      <div style={{position: 'absolute', left: 90, right: 90, top: 400, fontFamily: HEAD, fontSize: 150, lineHeight: 0.95, color: T.white, textShadow: glow()}}>
        <Typed text="PERANGKATMU SUDAH SIAP?" t={t} start={80.6} cps={22} color={T.white} />
      </div>
      <Win x={90} y={860} w={900} h={250} title="audira@tech" q={p(t, 81.9, 82.2)}>
        <div style={{fontSize: 46}}><Typed text="> ikuti AUDIRA TECH" t={t} start={82.1} cps={26} /></div>
        <div style={{fontSize: 36, color: T.amber, marginTop: 10, opacity: p(t, 83.2, 83.5)}}>@AudiraTECH · cerita teknologi berikutnya</div>
      </Win>
      <Label x={0} w={1080} center y={1170} size={38} color={T.amber} o={p(t, 81.2, 81.5)}>[✓] time_t 64 bit · [✓] update OS</Label>
    </>
  );
};

// ---------- HUD + captions ----------
const Rail: React.FC<{t: number}> = ({t}) => {
  const n = Math.max(1, SCENES.filter((s) => t >= s).length);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 182, height: 50, borderBottom: `2px solid ${T.dim}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: MONO, fontWeight: 700, fontSize: 36, color: T.g, textShadow: glow()}}>
      <span>audira@tech:~$ ./y2k.sh</span>
      <span style={{color: T.amber, textShadow: glow(T.amber)}}>[{String(Math.min(8, n)).padStart(2, '0')}/08]</span>
    </div>
  );
};

const disp = (w: string) => w.replace(/[.,;:]+(["')\]]*)$/, '$1');
const Captions: React.FC<{t: number}> = ({t}) => {
  const pg = PAGES.find((x) => t >= x.start - 0.08 && t < x.end);
  if (!pg || t >= OUTRO_AT) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1300, minHeight: 150, border: `2px solid ${T.dim}`, background: `${T.bg}f2`, padding: '18px 24px',
      fontFamily: MONO, fontWeight: 800, fontSize: 54, lineHeight: 1.35, display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '0.45em'}}>
      <span style={{color: T.dim}}>&gt;</span>
      {pg.words.map((w, i) => {
        const on = t >= w.start - 0.04 && t < w.end + 0.08;
        const said = t >= w.start - 0.04;
        return (
          <span key={i} style={{background: on ? T.g : 'transparent', color: on ? T.bg : said ? T.g : T.white, opacity: said || on ? 1 : 0.8, textShadow: on ? 'none' : glow(said ? T.g : T.dim),
            padding: '0 6px', transform: on ? 'scale(1.03)' : undefined}}>{disp(w.word).toUpperCase()}</span>
        );
      })}
    </div>
  );
};

// ---------- film ----------
export const Y2K: React.FC<{coverAt?: number}> = ({coverAt}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = coverAt ?? frame / fps;
  const gFrame = Math.floor(t * 30);
  const red = (t >= 3.2 && t < 6.5) || (t >= 28.0 && t < 36.7) || (t >= 73.4 && t < 76.7);
  const phos = red ? T.alert : T.g;
  const glitch = CUTS.some((c) => t >= c && t < c + 0.15);
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8];
  return (
    <AbsoluteFill style={{background: T.bg, fontFamily: MONO, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(1.45) translateY(${-(t * 6) % 44}px)`, filter: 'blur(3px)'}} data-layout-ignore><HexRain t={t * 0.5 + 40} opacity={0.38} /></AbsoluteFill>
      <AbsoluteFill data-layout-ignore><HexRain t={t} opacity={0.5} /></AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 45% at 50% 38%, ${phos}3a, transparent 70%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.0) 0%, rgba(0,0,0,.35) 70%, rgba(0,0,0,.55) 100%)'}} />
      {t < OUTRO_AT && scenes.map((S, i) => (
        <Cam key={i} t={t} a={SCENES[i]} b={SCENES[i + 1]} i={i} dy={SCENE_DY[i]}>
          <S t={t} />
        </Cam>
      ))}
      {t < OUTRO_AT && <Rail t={t} />}
      {!coverAt && <Captions t={t} />}
      {coverAt !== undefined && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 1240, textAlign: 'center'}}>
          <Big size={230} color={T.g}>BUG Y2K</Big>
          <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 56, color: T.amber, textShadow: glow(T.amber), marginTop: 18}}>TAHUN 2000 DIBACA 1900</div>
        </div>
      )}
      <Glitch frame={gFrame} active={glitch && t < OUTRO_AT} />
      <CRT frame={gFrame} />
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.38) 0 3px, transparent 3px 8px)', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: ((t * 260) % 2400) - 300, height: 220, background: `linear-gradient(180deg, transparent, ${phos}14, transparent)`, pointerEvents: 'none'}} />
      <AbsoluteFill style={{borderRadius: 48, boxShadow: `inset 0 0 0 10px #030603, inset 0 0 140px rgba(0,0,0,.85), inset 0 0 40px ${phos}22`, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'linear-gradient(125deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 100%)', pointerEvents: 'none'}} />
      {!coverAt && <AudiraOutro seconds={3} />}
      {!coverAt && <AudiraSignature seed="y2k-ep21" />}
    </AbsoluteFill>
  );
};
