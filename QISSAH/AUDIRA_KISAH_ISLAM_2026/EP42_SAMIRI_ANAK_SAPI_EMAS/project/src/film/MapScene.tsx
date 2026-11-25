import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import { ShotCanvas } from "../kits/chronicle/ShotCanvas.tsx";
import { MAPROOM } from "../kits/chronicle/looks.ts";
import type { Look } from "../kits/chronicle/Stage.tsx";
import { ReliefMap, Ring } from "../kits/chronicle/Relief.tsx";
import { buildRelief, type Relief } from "../kits/chronicle/relief.ts";
import { AshColumn } from "../kits/chronicle/fx.tsx";
import { camAt, handheld, lin, project, sm, type V3 } from "../kits/chronicle/cam.ts";
import { Frame, MapPin, RouteLine, AMBER } from "../kits/chronicle/Overlay.tsx";
import { VOLCANOES } from "../director/gazetteer.ts";
import type { PlanScene, Region } from "../director/types.ts";
import { qaNoOverlay } from "../core/qa/scene-qa.tsx";

const TILT = 1.12; // camera elevation for fitted (north-up) views

export const useRegionRelief = (region: Region): Relief =>
  useMemo(() => buildRelief({ key: region.key, lon0: region.lon0, lon1: region.lon1, lat0: region.lat0, lat1: region.lat1, cell: region.cell, vex: 5, volcanoes: VOLCANOES }), [region]);

const mapLook = (at: V3, D: number): Look => ({
  ...MAPROOM,
  far: Math.max(4000, D * 3),
  near: Math.max(0.5, D * 0.01),
  key: { ...MAPROOM.key, shadow: { box: Math.min(420, Math.max(50, D * 0.45)), at, far: 2400, bias: -0.0006 } },
  fog: { ...MAPROOM.fog, density: Math.min(0.0014, 0.32 / D) },
});

/** Camera distance that fits world points (x, z) in the 9:16 frame from a north-up oblique view. */
const fitD = (pts: [number, number][], aspect: number, fov: number) => {
  const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  const w = (Math.max(...xs) - Math.min(...xs)) * 1.55 + 80;
  const h = (Math.max(...zs) - Math.min(...zs)) * 1.5 + 80;
  const vf = Math.tan((fov * Math.PI) / 360), hf = vf * aspect;
  return Math.max(w / (2 * hf), (h * Math.sin(TILT)) / (2 * vf), 110);
};

export const MapScene: React.FC<{ scene: PlanScene; region: Region; s: number; frame: number }> = ({ scene, region, s, frame }) => {
  const { width, height } = useVideoConfig();
  const aspect = width / height;
  const relief = useRegionRelief(region);
  const M = scene.map!;
  const dur = scene.b - scene.a;
  const pts = M.points.map((p) => {
    const [x, z] = relief.toWorld(p.lon, p.lat);
    return { ...p, x, z, y: relief.heightAt(p.lon, p.lat) + 0.6 };
  });
  if (!pts.length) pts.push({ name: "", lon: 0, lat: 0, x: 0, z: 0, y: 0 });
  const xy: [number, number][] = pts.map((p) => [p.x, p.z]);
  const cx = (Math.min(...xy.map((p) => p[0])) + Math.max(...xy.map((p) => p[0]))) / 2;
  const cz = (Math.min(...xy.map((p) => p[1])) + Math.max(...xy.map((p) => p[1]))) / 2;
  const fov = 32;
  let keys;
  let D: number;
  if (M.mode === "close" && !M.rings) {
    const p = pts[0];
    D = 120;
    keys = [
      { t: 0, pos: [p.x - 10, 70, p.z + 120] as V3, target: [p.x, 2, p.z + 6] as V3, fov },
      { t: dur, pos: [p.x - 6, 46, p.z + 84] as V3, target: [p.x, 2, p.z + 4] as V3, fov },
    ];
  } else {
    D = fitD(xy, aspect, fov);
    const at = (d: number, dz = 0): V3 => [cx, d * Math.sin(TILT), cz + 18 + dz + d * Math.cos(TILT)];
    if (M.rings) {
      const p = pts[0];
      keys = [
        { t: 0, pos: [p.x - 8, 30, p.z + 64] as V3, target: [p.x, 4, p.z] as V3, fov: 30 },
        { t: Math.min(1.4, dur * 0.25), pos: [p.x - 7, 28, p.z + 56] as V3, target: [p.x, 4, p.z] as V3, fov: 30 },
        { t: Math.min(dur * 0.7, 3.8), pos: at(D * 1.04), target: [cx, 0, cz + 18] as V3, fov },
        { t: dur, pos: at(D), target: [cx, 0, cz + 16] as V3, fov },
      ];
    } else {
      keys = [
        { t: 0, pos: at(D * 1.12), target: [cx, 0, cz + 18] as V3, fov },
        { t: dur, pos: at(D * 0.98), target: [cx, 0, cz + 16] as V3, fov },
      ];
    }
  }
  // route: one polyline through the points, lifted in arcs, drawn over the scene
  const segs: V3[][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const L = Math.hypot(b.x - a.x, b.z - a.z);
    segs.push(Array.from({ length: 20 }, (_, k) => {
      const u = k / 19;
      return [a.x + (b.x - a.x) * u, 2 + Math.sin(Math.PI * u) * L * 0.08, a.z + (b.z - a.z) * u] as V3;
    }));
  }
  const flat = segs.flatMap((sg, i) => (i ? sg.slice(1) : sg));
  const segLen = segs.map((sg) => sg.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - sg[i - 1][0], p[2] - sg[i - 1][2]) : 0), 0));
  const tot = segLen.reduce((a, b) => a + b, 0) || 1;
  const p0 = 0.15 * dur, p1 = 0.85 * dur;
  const prog = M.route ? sm(lin(s, p0, p1)) : M.mode === "fit" && pts.length > 1 ? sm(lin(s, p0, p1)) : 0;
  const reachT = (i: number) => {
    if (i === 0) return 0.25;
    const f = segLen.slice(0, i).reduce((a, b) => a + b, 0) / tot;
    // inverse of smoothstep, near enough: sample
    for (let k = 0; k <= 60; k++) { const t = p0 + ((p1 - p0) * k) / 60; if (sm(lin(t, p0, p1)) >= f) return t; }
    return p1;
  };

  // a route camera travels with the head of the line (north stays up), easing out to show the whole trip at the end
  let shotRaw = camAt(keys, s);
  if (M.route && flat.length > 1) {
    const cum = [0];
    for (let q = 1; q < flat.length; q++) cum.push(cum[q - 1] + Math.hypot(flat[q][0] - flat[q - 1][0], flat[q][2] - flat[q - 1][2]));
    const headAt = (u: number): [number, number] => {
      const want = cum[cum.length - 1] * Math.min(1, Math.max(0, u));
      let q = 1;
      while (q < cum.length - 1 && cum[q] < want) q++;
      const f = (want - cum[q - 1]) / Math.max(1e-6, cum[q] - cum[q - 1]);
      return [flat[q - 1][0] + (flat[q][0] - flat[q - 1][0]) * f, flat[q - 1][2] + (flat[q][2] - flat[q - 1][2]) * f];
    };
    const Dr = Math.min(Math.max(D * 0.5, 380), 1100);
    const u = sm(lin(s, p0 - 0.4, p1 + 0.2));
    const [hx, hz] = headAt(u);
    const pull = sm(lin(s, p1 - 0.3, dur));
    const tx = hx + (cx - hx) * (0.12 + 0.88 * pull), tz = hz + (cz - hz) * (0.12 + 0.88 * pull) + 18;
    const Dn = Dr + (D - Dr) * pull;
    shotRaw = { pos: [tx, Dn * Math.sin(TILT), tz + Dn * Math.cos(TILT)], target: [tx, 0, tz], fov };
  }
  const shot = handheld(shotRaw, s, { drift: 0.0015, seed: 4 });
  const camD = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  const look = mapLook([shot.target[0], 0, shot.target[2]], camD);

  // rings
  const rings = M.rings ? [0.6, 1.05, 1.5].map((t0) => {
    const far = pts.length > 1 ? Math.max(...pts.slice(1).map((p) => Math.hypot(p.x - pts[0].x, p.z - pts[0].z))) : 300;
    const speed = far / Math.max(2.0, dur * 0.6);
    const r = (s - t0) * speed;
    return { r, o: r > 0 ? Math.max(0, 1 - r / (far * 1.25)) * sm(lin(s, t0, t0 + 0.35)) : 0 };
  }) : [];
  const volc = pts.find((p) => p.volcano);
  const vy = volc ? (VOLCANOES.find((v) => Math.abs(v.lon - volc.lon) < 0.2 && Math.abs(v.lat - volc.lat) < 0.2)?.km ?? 2.5) * relief.yPerKm : 0;

  return (
    <>
      <ShotCanvas shot={shot} look={look} frame={frame}>
        <ReliefMap relief={relief} />
        {rings.map((g, i) => <Ring key={i} at={[pts[0].x, pts[0].z]} r={g.r} opacity={g.o * 0.75} width={0.5 + g.r * 0.008} y={Math.max(0.1, camD * 0.0012)} />)}
        {volc && (M.erupt || M.rings) && (
          <AshColumn t={s} base={[volc.x, vy, volc.z]} height={34} width={9} count={70} life={4} amount={sm(lin(s, 0.2, 1.2))} wind={[-0.25, 0.05]} dark="#3d3a3a" lit="#8a5b45" hot="#ff9d55" density={0.95} />
        )}
      </ShotCanvas>
      {/* pins, labels and the route are 2D: the QA pass scans the 3D alone */}
      {qaNoOverlay() ? null : <MapOverlay s={s} pts={pts} shot={shot} aspect={aspect} flat={flat} prog={prog} route={M.route || (M.mode === "fit" && pts.length > 1)} reachT={reachT} width={width} />}
    </>
  );
};

const MapOverlay: React.FC<{ s: number; pts: { name: string; x: number; y: number; z: number }[]; shot: ReturnType<typeof handheld>; aspect: number; flat: V3[]; prog: number; route: boolean; reachT: (i: number) => number; width: number }> = ({
  s, pts, shot, aspect, flat, prog, route, reachT, width,
}) => {
  const line = flat.map((p) => project(shot, aspect, p, 0.5, 5000));
  return (
    <Frame width={width} height={Math.round(width / aspect)}>
      {route && <RouteLine pts={line} progress={prog} color={AMBER} dash width={5} opacity={0.95} />}
      {pts.map((p, i) => {
        if (!p.name) return null;
        const q = project(shot, aspect, [p.x, p.y + 1, p.z], 0.5, 5000);
        if (!q.vis || q.x < -0.1 || q.x > 1.1) return null;
        const a = route ? reachT(i) : 0.3 + i * 0.45;
        return <MapPin key={i} s={s} a={a} x={q.x} y={q.y} name={p.name} color={i === pts.length - 1 && route ? "#ff4b3a" : AMBER} side={q.x > 0.6 ? "l" : "r"} pulse={i === pts.length - 1 ? 1 : 0} />;
      })}
    </Frame>
  );
};
