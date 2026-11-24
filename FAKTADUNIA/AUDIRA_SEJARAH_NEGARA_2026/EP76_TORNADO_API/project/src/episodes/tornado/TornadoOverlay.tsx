// EP76 HUD: kinetic callouts (≥36 px) inside the 9:16 safe zone. Chapter tag at top 262 (clear of the
// AudiraSignature top slot), at most one card visible per moment, cards at top ~330. Layout px = 1080×1920.
import React from "react";
import { DISASTER_PALETTE as P } from "../../kits/disastersim/lib/palette";
import { seg } from "../../kits/disastersim/core/motion";
import { BEAT, SC } from "./timeline";

const inOut = (T: number, a: number, b: number) => seg(T, a, a + 0.35) * (1 - seg(T, b - 0.3, b));
const pop = (T: number, a: number) => 0.9 + 0.1 * seg(T, a, a + 0.25);

const Card: React.FC<{ T: number; a: number; b: number; accent: string; big: string; small?: string; top?: number }> = ({ T, a, b, accent, big, small, top = 330 }) => {
  const o = inOut(T, a, b);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, opacity: o, transform: `scale(${pop(T, a)})`, transformOrigin: "left center" }}>
      <div style={{ display: "inline-block", background: "rgba(14,10,8,0.84)", borderLeft: `12px solid ${accent}`, borderRadius: 18, padding: "18px 30px", boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>
        <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, color: "#FFFFFF", letterSpacing: -1 }}>{big}</div>
        {small && <div style={{ fontSize: 40, fontWeight: 700, marginTop: 10, color: P.hud }}>{small}</div>}
      </div>
    </div>
  );
};

const FIRE = "#FF7A2E";
const HOT = "#FFC14E";

export const TornadoOverlay: React.FC<{ T: number }> = ({ T }) => {
  const chapter =
    T < SC.s2 ? "TORNADO API" : T < SC.s3 ? "REDDING 2018" : T < SC.s4a ? "PUSARAN RAKSASA" : T < SC.s4b ? "FISIKA PUSARAN" : T < SC.s5a ? "EFEK PENARI ES" : T < SC.s5b ? "TOKYO 1923" : T < SC.s6 ? "LAPANGAN MAUT" : "CUACA DARI API";
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: P.hud }}>
      {T < BEAT.outro && (
        <div style={{ position: "absolute", top: 262, left: 60, fontSize: 36, fontWeight: 800, letterSpacing: 3, color: HOT, whiteSpace: "nowrap", background: "rgba(14,10,8,0.78)", padding: "6px 18px", borderRadius: 12 }}>
          ● AUDIRA FAKTA DUNIA // {chapter}
        </div>
      )}
      {/* S1 */}
      <Card T={T} a={0.4} b={SC.s2} accent={FIRE} big="TORNADO API" small="pusaran yang terbuat dari api" />
      {/* S2 */}
      <Card T={T} a={BEAT.tanggal} b={SC.s3} accent={P.lvlAdvisory} big="26 JULI 2018" small="Redding, California · Kebakaran Carr" />
      {/* S3 */}
      <Card T={T} a={BEAT.melebar} b={BEAT.menjulang} accent={FIRE} big="270 m" small="lebar pusaran" />
      <Card T={T} a={BEAT.menjulang} b={BEAT.angin} accent={FIRE} big="± 5,5 km" small="tinggi kolom pusaran" />
      <Card T={T} a={BEAT.angin} b={BEAT.empat} accent={P.lvlEvac} big="230 km/jam" small="setara tornado EF3" />
      <Card T={T} a={BEAT.empat} b={SC.s4a} accent={P.lvlEvac} big="4 jiwa" small="tewas dalam peristiwa ini" />
      {/* S4a */}
      <Card T={T} a={BEAT.panasNaik} b={BEAT.tersedot} accent={FIRE} big="Udara panas naik" small="api memanaskan udara di atasnya" />
      <Card T={T} a={BEAT.tersedot} b={BEAT.tertarik} accent={P.lvlInfo} big="Udara tersedot" small="udara sekitar mengalir masuk" />
      <Card T={T} a={BEAT.tertarik} b={SC.s4b} accent={P.lvlInfo} big="Ditarik & menyempit" small="putaran ditarik ke atas" />
      {/* S4b */}
      <Card T={T} a={BEAT.penari} b={BEAT.lahirlah} accent={P.lvlInfo} big="Makin sempit" small="makin kencang berputar" />
      <Card T={T} a={BEAT.lahirlah} b={BEAT.seribu} accent={FIRE} big="Pusaran api lahir" small="dari udara panas yang berputar" />
      <Card T={T} a={BEAT.seribu} b={SC.s5a} accent={P.lvlEvac} big="> 1.000 °C" small="panas inti pusaran" />
      {/* S5a */}
      <Card T={T} a={BEAT.y1923} b={BEAT.mengungsi} accent={P.lvlAdvisory} big="1923" small="Gempa Besar Kanto, Tokyo" />
      <Card T={T} a={BEAT.mengungsi} b={SC.s5b} accent={P.lvlAdvisory} big="Puluhan ribu" small="mengungsi ke lapangan bekas depot" />
      {/* S5b */}
      <Card T={T} a={BEAT.k40} b={SC.s6} accent={P.lvlEvac} big="≈ 40.000 jiwa" small="tewas dalam hitungan menit" />
      {/* S6 */}
      <Card T={T} a={BEAT.kebanyakan} b={BEAT.besar} accent={HOT} big="Setinggi gedung" small="biasanya hilang dalam beberapa menit" />
      <Card T={T} a={BEAT.besar} b={BEAT.outro} accent={HOT} big="Cuaca dari api" small="api besar menciptakan cuacanya sendiri" />
    </div>
  );
};
