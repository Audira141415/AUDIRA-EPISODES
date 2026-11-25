// The generic CHRONICLE film: renders any Plan produced by the director from a script (naskah).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from "remotion";
import { chronicleFontsReady, F_CITE, F_LABEL, F_STAMP } from "../kits/chronicle/fonts.ts";
import { Captions, Cite, Counter, DateStamp, DIM, Frame, IVORY, CRIMSON, NameTag, useCanvas } from "../kits/chronicle/Overlay.tsx";
import { lin } from "../kits/chronicle/cam.ts";
import { MapScene } from "./MapScene.tsx";
import { PlaceScene } from "./PlaceScene.tsx";
import type { Overlay, Plan, PlanScene } from "../director/types.ts";
import { qaNoOverlay } from "../core/qa/scene-qa.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";

export type ChronicleProps = { plan: Plan };

const Local: React.FC<{ scene: PlanScene; plan: Plan }> = ({ scene, plan }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = f / fps;
  if (scene.kind === "map" && plan.region) return <MapScene scene={scene} region={scene.map?.region ?? plan.region} s={s} frame={f} />;
  if (scene.kind === "place") return <PlaceScene scene={scene} s={s} frame={f} />;
  // end card: the last map's place, far and dim, under the title — no pins, no route lines
  const lastMap = [...plan.scenes].reverse().find((x) => x.kind === "map" && x.map?.points.length);
  if (lastMap?.map) {
    const p0 = lastMap.map.points[lastMap.map.points.length - 1];
    const quiet: PlanScene = { ...scene, kind: "map", map: { points: [{ ...p0, name: "", volcano: false }], route: false, rings: false, erupt: false, mode: "close", region: lastMap.map.region } };
    return (
      <>
        <MapScene scene={quiet} region={lastMap.map.region ?? plan.region!} s={s} frame={f} />
        <AbsoluteFill style={{ background: "rgba(5,12,16,0.58)" }} />
      </>
    );
  }
  return <AbsoluteFill style={{ background: "#0b0f12" }} />;
};

const EndText: React.FC<{ s: number; o: Extract<Overlay, { kind: "end" }>; series?: string }> = ({ s, o, series }) => {
  const C = useCanvas();
  const v = lin(s, o.a, o.a + 0.6);
  if (v <= 0) return null;
  const [main, sub] = o.title.split(/\s+[—–-]\s+/);
  return (
    <div style={{ position: "absolute", left: C.land ? 300 : 80, right: C.land ? 300 : 80, top: C.land ? 200 : 560, textAlign: "center", opacity: v }}>
      {series && <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 38, letterSpacing: 8, color: DIM, textTransform: "uppercase" }}>{series}</div>}
      <div style={{ fontFamily: F_STAMP, fontSize: 132, lineHeight: 1.0, color: IVORY, textTransform: "uppercase", marginTop: 10 }}>{main}</div>
      {sub && <div style={{ fontFamily: F_LABEL, fontWeight: 600, fontSize: 44, letterSpacing: 6, color: IVORY, textTransform: "uppercase", marginTop: 10 }}>{sub}</div>}
      <div style={{ margin: "26px auto", width: 200, height: 6, background: CRIMSON }} />
      {o.sources.length > 0 && (
        <div style={{ marginTop: 40, opacity: lin(s, o.a + 0.5, o.a + 1.2) }}>
          <div style={{ fontFamily: F_LABEL, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: DIM }}>SUMBER</div>
          {o.sources.map((x, i) => <div key={i} style={{ fontFamily: F_CITE, fontStyle: "italic", fontSize: 34, color: IVORY, marginTop: 10 }}>{x}</div>)}
        </div>
      )}
    </div>
  );
};

/** Overlays laid out so they never stack: dates and counters on top, names in the lower third, citations top or mid. */
const Overlays: React.FC<{ s: number; list: Overlay[]; series?: string; maps?: [number, number][] }> = ({ s, list, series, maps = [] }) => {
  const C = useCanvas();
  // 16:9 maps: pins sit high in the wide frame, so a citation goes above the captions instead of the top
  const lowCite = (o: Overlay) => C.land && o.kind === "cite" && maps.some(([a, b]) => o.a >= a - 0.05 && o.a < b);
  const dateOn = list.some((o) => (o.kind === "date" || o.kind === "count") && s >= o.a && s <= o.b);
  return (
    <>
      {list.map((o, i) => {
        switch (o.kind) {
          case "date": return <DateStamp key={i} s={s} a={o.a} b={o.b} top={o.top} big={o.big} />;
          case "name": {
            const topBusy = list.some((x) => (x.kind === "date" || x.kind === "count" || (x.kind === "cite" && !lowCite(x))) && x.a < o.b && x.b > o.a);
            return <NameTag key={i} s={s} a={o.a} b={o.b} name={o.name} role={o.role} y={C.land ? (topBusy ? C.H - 330 : 90) : topBusy ? 1170 : 250} />;
          }
          case "count": return <Counter key={i} s={s} a={o.a} b={o.b} from={o.from} to={o.to} roll={o.roll} unit={o.unit} label={o.label} />;
          case "cite": return <Cite key={i} s={s} a={o.a} b={o.b} text={o.text || o.src} src={o.text ? o.src : ""} y={lowCite(o) ? C.H - 290 : C.land ? (dateOn ? 330 : 64) : dateOn ? 560 : 170} />;
          case "end": return <EndText key={i} s={s} o={o} series={series} />;
          default: return null;
        }
      })}
    </>
  );
};

export const ChronicleFilm: React.FC<ChronicleProps> = ({ plan }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const s = frame / fps;
  const [h] = useState(() => delayRender("chronicle fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => { chronicleFontsReady().then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return <AbsoluteFill style={{ background: "#000" }} />;
  const overlays = plan.scenes.flatMap((sc) => sc.overlays);
  const endA = plan.scenes.find((x) => x.kind === "end")?.a ?? Infinity;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {plan.audio && <Audio src={staticFile(plan.audio)} />}
      {plan.scenes.map((sc, i) => (
        // the last scene holds to the very last frame (no black tail)
        <Sequence key={i} from={Math.round(sc.a * fps)} durationInFrames={Math.max(1, (i === plan.scenes.length - 1 ? durationInFrames : Math.round(sc.b * fps)) - Math.round(sc.a * fps))}>
          <Local scene={sc} plan={plan} />
        </Sequence>
      ))}
      {/* the QA pass scans the 3D alone */}
      {qaNoOverlay() ? null : <Frame width={width} height={height}>
        <Overlays s={s} list={overlays} series={plan.series} maps={plan.scenes.filter((x) => x.kind === "map").map((x) => [x.a, x.b] as [number, number])} />
        {s < endA && <Captions s={s} words={plan.words} end={endA} />}
      </Frame>}
      {qaNoOverlay() ? null : <AudiraSignature seed="samiri-anak-sapi-emas" handle="@AUDIRAQISSAH" />}
    </AbsoluteFill>
  );
};

export const chronicleMetadata: CalculateMetadataFunction<ChronicleProps> = ({ props, compositionId }) => {
  const fps = compositionId.includes("Final") ? 60 : 30;
  return { durationInFrames: Math.max(1, Math.ceil(props.plan.duration * fps)), fps };
};
