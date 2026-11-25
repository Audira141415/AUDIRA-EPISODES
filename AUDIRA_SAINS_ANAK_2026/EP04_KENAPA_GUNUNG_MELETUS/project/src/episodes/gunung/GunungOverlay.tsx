// EP04 HUD: kinetic callouts (≥36 px) inside the 9:16 safe zone (top 180, bottom 380). Layout px = 1080×1920.
import React from "react";
import { DISASTER_PALETTE as P } from "../../kits/disastersim/lib/palette";
import { clamp, seg } from "../../kits/disastersim/core/motion";
import { BEAT, SC } from "./timeline";

const inOut = (T: number, a: number, b: number) => seg(T, a, a + 0.35) * (1 - seg(T, b - 0.3, b));
const pop = (T: number, a: number) => 0.9 + 0.1 * seg(T, a, a + 0.25);

const Card: React.FC<{ o: number; s: number; top: number; accent: string; big: string; small?: string; left?: number; sm?: boolean }> = ({ o, s, top, accent, big, small, left = 60, sm = false }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left, right: 60, top, opacity: o, transform: `scale(${s})`, transformOrigin: "left center" }}>
      <div style={{ display: "inline-block", background: "rgba(8,16,22,0.84)", borderLeft: `12px solid ${accent}`, borderRadius: 18, padding: sm ? "14px 26px" : "18px 30px", boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>
        <div style={{ fontSize: sm ? 72 : 92, fontWeight: 900, lineHeight: 1, color: "#FFFFFF", letterSpacing: -1 }}>{big}</div>
        {small && <div style={{ fontSize: sm ? 36 : 40, fontWeight: 700, marginTop: sm ? 8 : 10, color: P.hud }}>{small}</div>}
      </div>
    </div>
  );

const count = (T: number, a: number, dur: number, to: number) => Math.round(to * seg(T, a, a + dur));
const fmt = (n: number) => n.toLocaleString("id-ID");

const STATUS: [string, string, number][] = [
  ["NORMAL", "#3DDC97", BEAT.normal],
  ["WASPADA", P.lvlAdvisory, BEAT.waspada],
  ["SIAGA", P.lvlWarning, BEAT.siaga],
  ["AWAS", P.lvlEvac, BEAT.awas],
];

export const GunungOverlay: React.FC<{ T: number }> = ({ T }) => {
  const chapter =
    T < SC.s2 ? "KRAKATAU 1883" : T < SC.s3 ? "CINCIN API PASIFIK" : T < SC.s4a ? "LEMPENG → MAGMA" : T < SC.s4b ? "GAS DALAM MAGMA" : T < SC.s5a ? "ENCER vs KENTAL" : T < SC.s5b ? "DAMPAK KE DUNIA" : T < SC.s6 ? "PEMANTAUAN" : "TANAH VULKANIS";
  const showChapter = T < BEAT.outro;
  // seismograph trace (S5b)
  const seis = inOut(T, SC.s5b + 0.2, SC.s6);
  const amp = (x: number) => 6 + 40 * seg(T, BEAT.gempa, BEAT.gempa + 0.3) * (1 - seg(T, BEAT.gasPantau, BEAT.normal)) * Math.abs(Math.sin(x * 0.9 + T * 9));
  const path = Array.from({ length: 60 }, (_, i) => `${i ? "L" : "M"}${i * 16},${50 + amp(i) * Math.sin(i * 2.7 + T * 14)}`).join(" ");
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: P.hud }}>
      {showChapter && (
        <div style={{ position: "absolute", top: 190, left: 60, fontSize: 38, fontWeight: 800, letterSpacing: 3, color: P.lvlInfo, whiteSpace: "nowrap", background: "rgba(8,16,22,0.78)", padding: "6px 18px", borderRadius: 12 }}>
          ● AUDIRA SAINS // {chapter}
        </div>
      )}
      {/* S1 */}
      <Card o={inOut(T, BEAT.year1883, SC.s2)} s={pop(T, BEAT.year1883)} top={270} accent={P.lvlAdvisory} big="1883" small="Letusan Krakatau" />
      <Card o={inOut(T, BEAT.km5000, SC.s2)} s={pop(T, BEAT.km5000)} top={500} accent={P.ring} big={`≈ ${fmt(count(T, BEAT.km5000, 1.2, 5000))} km`} small="suaranya terdengar hampir sejauh ini" />
      {/* S2 */}
      <Card o={inOut(T, BEAT.km40000, SC.s3)} s={pop(T, BEAT.km40000)} top={262} sm accent="#FF7A2E" big={`± ${fmt(count(T, BEAT.km40000, 1, 40000))} km`} small="panjang Cincin Api Pasifik" />
      <Card o={inOut(T, BEAT.pct75, BEAT.n127)} s={pop(T, BEAT.pct75)} top={432} sm accent="#FF7A2E" big={`${count(T, BEAT.pct75, 0.8, 75)}%`} small="gunung api dunia ada di jalur ini" />
      <Card o={inOut(T, BEAT.n127, SC.s3)} s={pop(T, BEAT.n127)} top={432} sm accent="#FFC14E" big={`${count(T, BEAT.n127, 1, 127)}`} small={T > BEAT.terbanyak ? "gunung api aktif · salah satu terbanyak di dunia" : "gunung api aktif di Indonesia (PVMBG)"} />
      {/* S3 */}
      <Card o={inOut(T, BEAT.cm67, BEAT.air)} s={pop(T, BEAT.cm67)} top={270} accent={P.basalt} big="6–7 cm/tahun" small="lempeng menyusup ke bawah Eurasia" />
      <Card o={inOut(T, BEAT.meleleh, BEAT.magmaNaik)} s={pop(T, BEAT.meleleh)} top={270} accent="#5EC8FF" big="Air ↓ titik leleh" small="sebagian mantel meleleh jadi magma" />
      {/* S4a */}
      <Card o={inOut(T, BEAT.soda, BEAT.turun)} s={pop(T, BEAT.soda)} top={270} accent={P.lvlInfo} big="Gas = soda" small="uap air · CO₂ · SO₂ di dalam magma" />
      <Card o={inOut(T, BEAT.turun, SC.s4b)} s={pop(T, BEAT.turun)} top={270} accent={P.lvlAdvisory} big="Tekanan turun" small="gas memuai, mendorong magma keluar" />
      {/* S4b silica bars */}
      {inOut(T, BEAT.kekentalan, SC.s5a) > 0.01 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 262, opacity: inOut(T, BEAT.kekentalan, SC.s5a), background: "rgba(6,12,18,0.92)", border: "2px solid rgba(255,255,255,0.18)", borderRadius: 20, padding: "24px 32px", boxShadow: "0 12px 34px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 14, color: "#FFFFFF" }}>Kadar silika → kekentalan</div>
          {[["Hawaii · encer", "45–52%", 0.5, "#FF8A30", BEAT.encer], ["Merapi · kental", "52–63%", 0.82, P.lvlWarning, BEAT.kental]].map(([l, v, w, c, a]) => (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: 0.55 + 0.45 * seg(T, a as number, (a as number) + 0.3) }}>
              <div style={{ width: 330, fontSize: 44, fontWeight: 800, color: "#FFFFFF" }}>{l}</div>
              <div style={{ flex: 1, height: 52, background: "rgba(255,255,255,0.16)", borderRadius: 12 }}>
                <div style={{ width: `${100 * (w as number) * seg(T, a as number, (a as number) + 0.8)}%`, height: "100%", background: c as string, borderRadius: 12, boxShadow: `0 0 18px ${c as string}` }} />
              </div>
              <div style={{ width: 190, fontSize: 48, fontWeight: 900, textAlign: "right", color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {/* S5a */}
      <Card o={inOut(T, BEAT.y1815, BEAT.suhu)} s={pop(T, BEAT.y1815)} top={270} accent={P.lvlWarning} big="1815" small="Letusan Tambora, Sumbawa" />
      <Card o={inOut(T, BEAT.suhu, SC.s5b)} s={pop(T, BEAT.suhu)} top={270} accent={P.lvlInfo} big="Suhu dunia turun" small="± 0,4–0,7 °C" />
      <Card o={inOut(T, BEAT.salju, SC.s5b)} s={pop(T, BEAT.salju)} top={540} accent="#FFFFFF" big="Juni 1816" small="salju turun di New York" />
      {/* S5b */}
      {seis > 0.01 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 270, opacity: seis, background: "rgba(8,16,22,0.84)", borderRadius: 18, padding: "16px 24px" }}>
          <div style={{ fontSize: 38, fontWeight: 800 }}>PVMBG memantau: gempa · penggembungan · gas</div>
          <svg width="940" height="100" viewBox="0 0 944 100">
            <path d={path} stroke={P.ring} strokeWidth={4} fill="none" />
          </svg>
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            {STATUS.map(([n, c, a]) => {
              const on = seg(T, a, a + 0.25);
              return (
                <div key={n} style={{ flex: 1, textAlign: "center", fontSize: 38, fontWeight: 900, padding: "12px 0", borderRadius: 12, background: on > 0.01 ? c : "rgba(255,255,255,0.1)", color: on > 0.5 ? "#0B141C" : "rgba(255,255,255,0.5)", transform: `scale(${1 + 0.08 * on * (1 - clamp((T - a - 0.25) * 2))})` }}>
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* S6 */}
      <Card o={inOut(T, BEAT.subur, BEAT.kenali)} s={pop(T, BEAT.subur)} top={270} accent={P.route} big="Tanah subur" small="abu vulkanis menyuburkan sawah" />
      <Card o={inOut(T, BEAT.kenali, BEAT.outro)} s={pop(T, BEAT.kenali)} top={270} accent={P.route} big="Kenali statusnya" small="ikuti arahan resmi PVMBG & pemda" />
    </div>
  );
};
