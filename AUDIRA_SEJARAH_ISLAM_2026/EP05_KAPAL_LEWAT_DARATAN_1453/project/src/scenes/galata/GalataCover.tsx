// EP05 cover + hook key image: "KAPAL LEWAT BUKIT" (HISTORYMAP). Paper map of Constantinople on a dark
// map table: the iron chain on log floats locks the Golden Horn, while light galleys on wooden cradles
// cross the ridge behind Galata on a greased timber track. Neutral, non-graphic; no people on the cover.
import React from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import {
  GalataTowerModel, HarborChain, LandRoute, PaperMap, ShipAfloat, ShipOnRoute, Table, Tag, Town, Walls,
} from "./parts.tsx";
import { COVER } from "./framing.ts";
import { CHAIN_CITY, CHAIN_GALATA, GALATA_TOWER, PAL, ROUTE, ROUTE_WATER, wx, wz } from "./world.ts";


export { COVER };

export const CameraRig: React.FC<{ frame: number; push?: number }> = ({ frame, push = 0.004 }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const c = COVER;
  const d = c.d - frame * push;
  const t = new THREE.Vector3(wx(c.target[0]), c.targetY, wz(c.target[1]));
  const yaw = c.yaw + frame * 0.0006;
  cam.fov = c.fov;
  cam.near = 0.05;
  cam.far = 80;
  cam.position.set(t.x + d * Math.cos(c.pitch) * Math.sin(yaw), t.y + d * Math.sin(c.pitch), t.z + d * Math.cos(c.pitch) * Math.cos(yaw));
  cam.lookAt(t);
  cam.updateProjectionMatrix();
  return null;
};

const ROUTE_SHIPS = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 0.93];

export const GalataWorld: React.FC<{ frame: number; routeProgress?: number }> = ({ frame, routeProgress = 1 }) => (
  <>
    <ambientLight intensity={0.32} color="#ffe9cf" />
    <hemisphereLight args={["#fff1dc", "#2a2018", 0.4]} />
    <directionalLight
      position={[-7, 5.5, 1.5]}
      intensity={2.8}
      color="#ffe2bd"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={6}
      shadow-camera-bottom={-6}
    />
    <directionalLight position={[6, 3, -3]} intensity={0.5} color="#9fb8d6" />
    <Table />
    <PaperMap />
    <Walls />
    <Town seed={11} center={[-1.9, -0.75]} rx={2.2} ry={0.8} rot={0.3} n={380} />
    <Town seed={12} center={[-0.3, 0.9]} rx={0.36} ry={0.26} rot={0.6} n={55} />
    <Town seed={13} center={[3.9, -1.2]} rx={0.5} ry={1.4} n={40} />
    <GalataTowerModel at={GALATA_TOWER} />
    <HarborChain frame={frame} scale={2.3} />
    <LandRoute pts={ROUTE} progress={routeProgress} frame={frame} />
    <LandRoute pts={ROUTE_WATER} progress={routeProgress} frame={frame} />
    {ROUTE_SHIPS.map((t, i) => (
      <ShipOnRoute key={i} pts={ROUTE} t={t} frame={frame} seed={i * 3 + 1} L={0.52} />
    ))}
    {/* Ottoman fleet held outside, at Double Columns on the Bosporus (register #17, #18) */}
    <ShipAfloat at={[1.75, 1.35]} deg={200} frame={frame} seed={21} />
    <ShipAfloat at={[1.45, 1.0]} deg={205} frame={frame} seed={22} />
    <ShipAfloat at={[1.15, 0.72]} deg={210} frame={frame} seed={23} />
    {/* first galleys already sliding into the Golden Horn */}
    <ShipAfloat at={[-1.98, 0.9]} deg={250} frame={frame} seed={24} sail={0.9} />
    {/* defenders behind the chain (register #15) */}
    <ShipAfloat at={[-0.35, 0.3]} deg={20} frame={frame} seed={25} L={0.22} sail={0.3} />
    <ShipAfloat at={[-0.85, 0.5]} deg={30} frame={frame} seed={26} L={0.22} sail={0.3} />
    <Tag at={[(CHAIN_CITY[0] + CHAIN_GALATA[0]) / 2, (CHAIN_CITY[1] + CHAIN_GALATA[1]) / 2]} off={[-0.05, 0.42]} lift={0.42} title="RANTAI BESI" sub="MENGUNCI TELUK" w={0.82} tilt={0.55} water />
    <Tag at={[0.95, 2.62]} off={[0.55, -0.55]} lift={0.55} title="BUKIT GALATA" sub="± 60 M" w={0.8} tilt={0.5} accent="#8a5a1c" />
    <Tag at={GALATA_TOWER} off={[-0.55, -0.15]} lift={0.4} title="GALATA" w={0.56} tilt={0.55} />
  </>
);

const Overlay: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 760,
        background: "linear-gradient(180deg, rgba(13,11,9,0.93) 0%, rgba(13,11,9,0.84) 62%, rgba(13,11,9,0) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, top: 196, color: "#f0a24b", fontSize: 30, fontWeight: 600, letterSpacing: 7 }}>
      SEJARAH ISLAM · EP05
    </div>
    <div style={{ position: "absolute", left: 66, top: 252, color: "#f4ead2", fontSize: 140, fontWeight: 600, lineHeight: 1.0, letterSpacing: 2, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
      KAPAL LEWAT
      <br />
      BUKIT
    </div>
    <div style={{ position: "absolute", left: 72, top: 548, width: 900, color: "#d9cdb4", fontSize: 34, fontWeight: 500, lineHeight: 1.3 }}>
      Konstantinopel, 1453: rantai besi mengunci pelabuhan, jadi ±70 kapal ditarik lewat darat
    </div>
  </div>
);

export const GalataCover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage3D background={PAL.table} overlay={() => <Overlay />}>
      <CameraRig frame={frame} />
      <GalataWorld frame={frame} />
      <Finish frame={frame} background={PAL.table} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao={false} />
    </Stage3D>
  );
};


