import React from "react";
import { seg, ease } from "../../kits/circuitforge/core/motion";
import { CIRCUIT_PALETTE } from "../../kits/circuitforge/lib/palette";

interface Props {
  f: number;
}

const FS = {
  hook: 0, context: 390, main1: 1270, main2: 2408,
  explain: 3344, payoff: 4246, outro: 4744, end: 5100,
};

const SCENE_LABELS: [number, number, string][] = [
  [FS.hook, FS.context, "PACKET ORIGIN // USER DEVICE"],
  [FS.context, FS.main1, "DNS RESOLUTION // DOMAIN LOOKUP"],
  [FS.main1, FS.main2, "ROUTER HOP SEQUENCE // 10–20 HOPS"],
  [FS.main2, FS.explain, "SUBMARINE FIBER // 550+ CABLES"],
  [FS.explain, FS.payoff, "TCP REASSEMBLY // DATA CENTER"],
  [FS.payoff, FS.outro, "FULL CIRCUIT // ALL TRACES ACTIVE"],
  [FS.outro, FS.end, "AUDIRA"],
];

export const InternetOverlay: React.FC<Props> = ({ f }) => {
  const introFade = seg(f, 0, 40, ease.smooth);
  const scene = SCENE_LABELS.find(([s, e]) => f >= s && f < e);
  const label = scene ? scene[2] : "";
  const hopCount = f >= FS.main1 ? Math.min(18, Math.floor(seg(f, FS.main1, FS.main2, ease.smooth) * 18)) : 0;
  const latencyMs = f >= FS.explain ? Math.floor(seg(f, FS.explain, FS.payoff, ease.smooth) * 42 + 8) : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "'Share Tech Mono', 'SF Mono', Consolas, monospace",
        color: "#ffffff",
        padding: "196px 32px 540px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: introFade,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: CIRCUIT_PALETTE.clockCyan, fontSize: 38, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            AUDIRA CIRCUITFORGE // NET-31
          </div>
          <div style={{ fontSize: 38, fontWeight: 400, marginTop: 4 }}>{label}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 38, color: "rgba(255,255,255,0.65)" }}>
          <div>MTU: 1500 B // TCP/IP v4</div>
          {f >= FS.main1 && (
            <div style={{ color: CIRCUIT_PALETTE.electronAmber }}>HOPS: {hopCount} / 18</div>
          )}
        </div>
      </div>

      {f >= FS.main2 - 30 && f < FS.payoff && (
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 420,
            background: "rgba(6, 23, 15, 0.8)",
            border: `1px solid ${CIRCUIT_PALETTE.copperTraceBevel}`,
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 38,
            opacity:
              seg(f, FS.main2 - 30, FS.main2, ease.smooth) *
              (f < FS.payoff - 60 ? 1 : 1 - seg(f, FS.payoff - 60, FS.payoff, ease.smooth)),
          }}
        >
          <div style={{ color: CIRCUIT_PALETTE.enigGold, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            [ SUBMARINE FIBER OPTIC ]
          </div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>SPEED: 200,000 km/s // 1.4M km TOTAL</div>
        </div>
      )}

      {latencyMs > 0 && (
        <div style={{ fontSize: 38, color: "rgba(255,255,255,0.5)", textAlign: "right" }}>
          RTT: {latencyMs}ms
        </div>
      )}
    </div>
  );
};
