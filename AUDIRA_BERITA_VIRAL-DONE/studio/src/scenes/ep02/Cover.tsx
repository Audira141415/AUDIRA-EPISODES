// EP02 cover (MARBLEMUSEUM): night hall of 19 new National Heroes (Keppres 93/TK/2026).
// Two rows of engraved marble stelae recede down the aisle; in front, a lectern with the hero
// plaque of Jenderal Pol. Hoegeng Iman Santoso, the Keppres sheet, a medal on a Merah Putih
// ribbon and the "GALERI AUDIRA" brass tag. No faces of real people anywhere.
// Kit WITHOUT Finish: uses the MARBLEMUSEUM post chain (MarbleCameraRig + MarblePost).
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cinzel";
import { MarbleCameraRig, MarblePost, type MarbleShot } from "../../kits/marblemuseum/lib/post";
import { makeEnvironment, makeFloorTexture, makeGiltMaterial, makeMarbleMaterial, makeBeamTexture } from "../../kits/marblemuseum/lib/materials";
import { MARBLE_PALETTE } from "../../kits/marblemuseum/lib/palette";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { galleryTag, heroText, keppresTexture, plaqueText, ribbonTexture } from "./coverTextures.ts";

const { fontFamily: CINZEL, waitUntilDone } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

type V3 = [number, number, number];
const BG = "#0B0605";

// Keppres order (Kompas [1]); #1 Hoegeng is the hero plaque. Lines only from HIGH rows.
const HEROES: [string, string, string][] = [
  ["R.M. MARGONO DJOJOHADIKUSUMO", "JAWA TENGAH", "PENDIRI BNI"],
  ["MR. ALI SASTROAMIDJOJO", "JAWA TIMUR", "PERDANA MENTERI · KAA 1955"],
  ["ABDOEL MOETHALIB SANGADJI", "MALUKU", "TOKOH PERGERAKAN NASIONAL"],
  ["DRS. FRANS SEDA", "NUSA TENGGARA TIMUR", "MENTERI ERA SOEKARNO & SOEHARTO"],
  ["SUTAN TAKDIR ALISJAHBANA", "DKI JAKARTA", "SASTRAWAN PUJANGGA BARU"],
  ["JENDERAL KKO ALI SADIKIN", "DKI JAKARTA", "GUBERNUR DKI 1966–1977"],
  ["SULTAN MUHAMMAD ALI ABDUL JALIL MUAZZAM SYAH", "RIAU", "MARHUM PEKAN"],
  ["JENDERAL TNI MARADEN PANGGABEAN", "SUMATERA UTARA", "MANTAN PANGLIMA ABRI"],
  ["MAYJEN TNI SOENGKONO", "JAWA TIMUR", "PERTEMPURAN SURABAYA 1945"],
  ["MARSEKAL R. SURYADI SURYADARMA", "JAWA BARAT", "KSAU PERTAMA"],
  ["K.H. M. YUSUF HASYIM", "JAWA TIMUR", "ULAMA"],
  ["K.H. WASYID", "BANTEN", "GEGER CILEGON 1888"],
  ["KIAI MODJO", "SULAWESI UTARA", "PENASIHAT DIPONEGORO"],
  ["MOHAMAD ROEM", "DKI JAKARTA", "PERUNDINGAN ROEM-ROIJEN 1949"],
  ["K.H. ABBAS ABDUL JAMIL", "JAWA BARAT", "ULAMA BUNTET CIREBON"],
  ["JENDERAL TNI M. JUSUF", "SULAWESI SELATAN", "PANGLIMA ABRI"],
  ["SULTAN IBRAHIM CHALILUDDIN", "KALIMANTAN TIMUR", "TOKOH PERLAWANAN"],
  ["LETKOL MOCH. SROEDJI", "JAWA TIMUR", "PEJUANG JEMBER–BESUKI"],
];

// ---------- layout ----------
const ROW_X = 1.3;
const ROW_Z0 = 0.4;
const ROW_DZ = 2.1;
const ROW_YAW = 0.5;
const PL = { w: 0.9, h: 1.25, d: 0.12, base: 0.5 };
const HALL_END = -19;

const SHOT: MarbleShot = { pos: [0.15, 2.45, 7.5], target: [0, 1.3, 0.6], fov: 44, exposure: 0.82 };

const plaquePose = (i: number): { pos: V3; yaw: number } => {
  const left = i % 2 === 0;
  const k = Math.floor(i / 2);
  return { pos: [left ? -ROW_X : ROW_X, 0, ROW_Z0 - k * ROW_DZ], yaw: left ? ROW_YAW : -ROW_YAW };
};

// ---------- spot helper (target lives in the scene graph) ----------
const Spot: React.FC<{ pos: V3; at: V3; intensity: number; angle: number; color?: string; shadow?: boolean }> = ({ pos, at, intensity, angle, color = "#FFE7C4", shadow }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <primitive object={target} position={at} />
      <spotLight
        position={pos}
        target={target}
        intensity={intensity}
        angle={angle}
        penumbra={0.65}
        distance={12}
        decay={1.5}
        color={color}
        castShadow={shadow}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />
    </>
  );
};

// ---------- one engraved stele on a dark plinth ----------
const Stele: React.FC<{ i: number; marble: THREE.Material; dark: THREE.Material }> = ({ i, marble, dark }) => {
  const { pos, yaw } = plaquePose(i);
  const [name, prov, line] = HEROES[i];
  const tex = plaqueText(CINZEL, name, prov, line);
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <mesh material={dark} position={[0, PL.base / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PL.w + 0.16, PL.base, PL.d + 0.26]} radius={0.03} />
      </mesh>
      <mesh material={marble} position={[0, PL.base + PL.h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PL.w, PL.h, PL.d]} radius={0.03} />
      </mesh>
      <mesh position={[0, PL.base + PL.h / 2, PL.d / 2 + 0.002]}>
        <planeGeometry args={[PL.w * 0.96, PL.h * 0.96]} />
        <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.42} metalness={0.35} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[PL.w + 0.6, PL.d + 0.7]} />
        <meshBasicMaterial color="#000" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
};

const flutedShaft = (r: number, h: number) => {
  const geo = new THREE.CylinderGeometry(r * 0.92, r, h, 64, 1, true);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const k = 1 - 0.05 * Math.pow(Math.abs(Math.cos(Math.atan2(z, x) * 10)), 0.6);
    p.setX(i, x * k);
    p.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  return geo;
};

// ---------- hero lectern: Hoegeng plaque + Keppres sheet + medal + AUDIRA tag ----------
const HERO_Z = 2.75;
const LECT = { w: 1.9, h: 0.74, d: 0.78 };
const TILT = 1.0;
const LIFT = Math.sin(TILT) * 0.45 + 0.02;

const Medal: React.FC<{ pos: V3; gilt: THREE.Material }> = ({ pos, gilt }) => {
  const star = useMemo(() => {
    const s = new THREE.Shape();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 === 0 ? 0.11 : 0.05;
      const a = Math.PI / 2 + (k * Math.PI) / 5;
      if (k === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2 });
    g.center();
    return g;
  }, []);
  const ribbon = ribbonTexture();
  return (
    <group position={pos}>
      {/* ribbon hangs from the lectern lip */}
      <mesh position={[0, 0.17, 0.004]}>
        <planeGeometry args={[0.13, 0.34]} />
        <meshPhysicalMaterial {...POLISH.fabric} map={ribbon} />
      </mesh>
      <mesh position={[0, 0.0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.022, 0.006, 10, 24]} />
        <primitive object={gilt} attach="material" />
      </mesh>
      <mesh geometry={star} material={gilt} position={[0, -0.12, 0.02]} />
      <mesh position={[0, -0.12, 0.03]}>
        <circleGeometry args={[0.035, 32]} />
        <meshStandardMaterial color="#9C1A16" roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
};

const Lectern: React.FC<{ marble: THREE.Material; dark: THREE.Material; gilt: THREE.Material }> = ({ marble, dark, gilt }) => {
  const hero = heroText(CINZEL);
  const kep = keppresTexture(CINZEL);
  const tag = galleryTag(CINZEL);
  const topY = LECT.h;
  return (
    <group position={[0, 0, HERO_Z]}>
      <mesh material={dark} position={[0, LECT.h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[LECT.w, LECT.h, LECT.d]} radius={0.04} />
      </mesh>
      {/* gilt rail under the top */}
      <mesh material={gilt} position={[0, topY - 0.05, LECT.d / 2 + 0.012]}>
        <RoundedBoxGeo args={[LECT.w - 0.04, 0.035, 0.03]} radius={0.01} />
      </mesh>
      {/* slanted top: hero plaque (left) + Keppres sheet (right) */}
      <group position={[0, topY + LIFT, -0.08]} rotation={[TILT, 0, 0]}>
        {/* dark slanted mount (reads as the lectern's reading desk) */}
        <mesh material={dark} position={[0, -0.065, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[LECT.w - 0.02, 0.07, 0.92]} radius={0.025} />
        </mesh>
        <mesh material={marble} position={[-0.27, 0.0, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.25, 0.06, 0.82]} radius={0.025} />
        </mesh>
        <mesh position={[-0.27, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.21, 0.79]} />
          <meshStandardMaterial map={hero} transparent alphaTest={0.02} roughness={0.42} metalness={0.35} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
        {/* sheet under a thin glass on a dark mount */}
        <mesh material={dark} position={[0.62, 0.0, 0.0]}>
          <RoundedBoxGeo args={[0.5, 0.04, 0.72]} radius={0.015} />
        </mesh>
        <mesh position={[0.62, 0.022, 0.0]} rotation={[-Math.PI / 2, 0, -0.03]}>
          <planeGeometry args={[0.44, 0.6]} />
          <meshPhysicalMaterial {...POLISH.paper} map={kep} />
        </mesh>
      </group>
      {/* brass gallery tag on the front */}
      <mesh position={[0.42, 0.5, LECT.d / 2 + 0.006]}>
        <planeGeometry args={[0.62, 0.12]} />
        <meshStandardMaterial map={tag} roughness={0.35} metalness={0.75} />
      </mesh>
      <Medal pos={[-0.52, topY - 0.42, LECT.d / 2 + 0.004]} gilt={gilt} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[LECT.w + 0.7, LECT.d + 0.7]} />
        <meshBasicMaterial color="#000" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---------- hall ----------
const Hall: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => makeEnvironment(gl), [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog("#0E0706", 9, 36);
  }, [scene, env]);
  const grain = useSurfaceGrain(202, 0.3, 4);
  const floor = useMemo(() => {
    const t = makeFloorTexture();
    t.repeat.set(3, 12);
    return t;
  }, []);
  const marble = useMemo(() => {
    const m = makeMarbleMaterial({ color: "#CFC6B4", scale: 2.4, strength: 0.9, roughness: 0.34 });
    m.clearcoat = 0.1;
    m.emissiveIntensity = 0.02;
    return m;
  }, []);
  const colMat = useMemo(() => {
    const m = makeMarbleMaterial({ color: "#C9C0AE", scale: 0.7, strength: 0.4, roughness: 0.42 });
    m.clearcoat = 0.1;
    return m;
  }, []);
  const dark = useMemo(() => {
    const m = makeMarbleMaterial({ color: "#2B2622", scale: 1.2, strength: 0.35, roughness: 0.3 });
    m.clearcoat = 0.3;
    return m;
  }, []);
  const gilt = useMemo(() => makeGiltMaterial(), []);
  const shaft = useMemo(() => flutedShaft(0.3, 5.0), []);
  const beam = useMemo(() => makeBeamTexture(), []);

  const hallLen = 4 - HALL_END;
  const hallMid = (4 + HALL_END) / 2;
  return (
    <group>
      <ambientLight intensity={0.05} color="#F3E2CC" />
      <hemisphereLight args={["#F7EBDD", "#1A0B09", 0.1]} />

      {/* stele spots: ~30% dimmer than the kit key, narrow, grazing from above-front */}
      {HEROES.map((_, i) => {
        if (i > 9) return null;
        const { pos, yaw } = plaquePose(i);
        const fx = Math.sin(yaw), fz = Math.cos(yaw);
        const c: V3 = [pos[0], PL.base + PL.h * 0.55, pos[2]];
        return <Spot key={i} pos={[c[0] + fx * 1.0, 4.6, c[2] + fz * 1.0]} at={c} intensity={i < 2 ? 11 : 13} angle={0.2} />;
      })}
      {/* hero key: narrow, grazing from z≈2.5 in front of the lectern */}
      <Spot pos={[-0.6, 4.4, HERO_Z + 2.5]} at={[-0.1, LECT.h, HERO_Z]} intensity={10} angle={0.26} shadow />
      {/* warm rim from behind */}
      <directionalLight position={[-2, 4, -6]} intensity={0.45} color={MARBLE_PALETTE.rimWarm} />
      {/* end-wall banner light */}
      <Spot pos={[0, 5.2, HALL_END + 4.5]} at={[0, 2.35, HALL_END]} intensity={16} angle={0.3} color="#FFE2BA" />

      {/* polished floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, hallMid]} receiveShadow>
        <planeGeometry args={[6, hallLen]} />
        <meshStandardMaterial map={floor} roughness={0.18} metalness={0.05} envMapIntensity={0.7} color="#B9B0A2" />
      </mesh>
      {/* aisle runner: deep red carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, hallMid - 1]}>
        <planeGeometry args={[1.05, hallLen - 2]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#4E0F0D" />
      </mesh>

      {/* side walls: oxblood with dado + gilt rail */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.9, 3, hallMid]} rotation={[0, -s * (Math.PI / 2), 0]}>
          <mesh>
            <planeGeometry args={[hallLen, 6]} />
            <meshPhysicalMaterial {...POLISH.stone} color={MARBLE_PALETTE.wallOxblood} bumpMap={grain} bumpScale={0.25} />
          </mesh>
          <mesh position={[0, -2.3, 0.03]}>
            <RoundedBoxGeo args={[hallLen, 1.4, 0.06]} radius={0.03} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={MARBLE_PALETTE.wallDado} />
          </mesh>
          <mesh position={[0, -1.6, 0.07]}>
            <RoundedBoxGeo args={[hallLen, 0.07, 0.1]} radius={0.03} />
            <meshStandardMaterial color={MARBLE_PALETTE.giltDeep} roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* colonnade along both walls */}
      {Array.from({ length: 6 }, (_, k) => k).flatMap((k) =>
        [-1, 1].map((s) => (
          <group key={`${k}${s}`} position={[s * 2.35, 0, -0.7 - k * 4.2]}>
            <mesh material={colMat} position={[0, 0.12, 0]}>
              <RoundedBoxGeo args={[0.8, 0.24, 0.8]} radius={0.03} />
            </mesh>
            <mesh geometry={shaft} material={colMat} position={[0, 2.74, 0]} />
            <mesh material={colMat} position={[0, 5.3, 0]}>
              <cylinderGeometry args={[0.42, 0.29, 0.2, 40]} />
            </mesh>
            <mesh material={colMat} position={[0, 5.48, 0]}>
              <RoundedBoxGeo args={[0.86, 0.16, 0.86]} radius={0.03} />
            </mesh>
          </group>
        )),
      )}

      {/* ceiling */}
      <mesh position={[0, 5.6, hallMid]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, hallLen]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#24140F" side={THREE.DoubleSide} bumpMap={grain} bumpScale={0.2} />
      </mesh>

      {/* end wall + Merah Putih banner in a gilt frame */}
      <mesh position={[0, 3, HALL_END]}>
        <planeGeometry args={[6, 6]} />
        <meshPhysicalMaterial {...POLISH.stone} color={MARBLE_PALETTE.wallOxblood} bumpMap={grain} bumpScale={0.25} />
      </mesh>
      <group position={[0, 2.35, HALL_END + 0.05]}>
        <mesh position={[0, 0.55, 0.02]}>
          <planeGeometry args={[1.5, 1.1]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#B3161B" />
        </mesh>
        <mesh position={[0, -0.55, 0.02]}>
          <planeGeometry args={[1.5, 1.1]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#EEE8DC" />
        </mesh>
        {[
          [0, 1.18, 1.8, 0.16],
          [0, -1.18, 1.8, 0.16],
          [-0.83, 0, 0.16, 2.52],
          [0.83, 0, 0.16, 2.52],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} material={gilt} position={[x, y, 0.06]}>
            <RoundedBoxGeo args={[w, h, 0.1]} radius={0.03} />
          </mesh>
        ))}
      </group>

      {HEROES.map((_, i) => (
        <Stele key={i} i={i} marble={marble} dark={dark} />
      ))}
      <Lectern marble={marble} dark={dark} gilt={gilt} />

      {/* faint light shaft over the hero */}
      {[0, Math.PI / 2].map((ry) => (
        <mesh key={ry} position={[-0.35, 2.9, HERO_Z + 1.0]} rotation={[0.45, ry, 0.12]}>
          <planeGeometry args={[1.1, 4.2]} />
          <meshBasicMaterial map={beam} color={MARBLE_PALETTE.skylight} transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- HTML overlay ----------
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(11,6,5,0.9) 0%, rgba(11,6,5,0.72) 22%, rgba(11,6,5,0) 36%, rgba(11,6,5,0) 80%, rgba(11,6,5,0.5) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", color: "#F4ECDD", fontFamily: CINZEL }}>
      <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: 7, color: MARBLE_PALETTE.hudGilt }}>
        HARI PAHLAWAN · SELASA, 10 NOV 2026
      </div>
      <div style={{ fontWeight: 900, fontSize: 138, lineHeight: 1.0, whiteSpace: "nowrap", marginTop: 18, letterSpacing: 2, textShadow: "0 6px 28px rgba(0,0,0,0.7)" }}>
        19 PAHLAWAN
      </div>
      <div style={{ fontWeight: 700, fontSize: 82, lineHeight: 1.05, letterSpacing: 3, color: "#E9CF8C", textShadow: "0 4px 20px rgba(0,0,0,0.7)" }}>
        NASIONAL BARU
      </div>
      <div style={{ marginTop: 18, fontWeight: 400, fontSize: 34, letterSpacing: 2, color: "rgba(244,236,221,0.9)" }}>
        Keppres 93/TK/2026 · 12 provinsi
      </div>
    </div>
  </AbsoluteFill>
);

export const Ep02Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("cinzel"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => {
      setReady(true);
      continueRender(handle);
    };
    waitUntilDone()
      .then(() => Promise.all([document.fonts.load(`700 40px ${CINZEL}`), document.fonts.load(`900 40px ${CINZEL}`), document.fonts.load(`400 40px ${CINZEL}`)]))
      .then(done, done);
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} dpr={1} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: SHOT.pos, fov: SHOT.fov, near: 0.05, far: 60 }}>
          <MarbleCameraRig shot={SHOT} near={0.05} far={60} />
          <Hall />
          <MarblePost frame={frame} strength={0.18} radius={0.5} threshold={0.95} vignette={0.45} grain={0.02} />
        </ThreeCanvas>
      )}
      <Overlay />
    </AbsoluteFill>
  );
};

export const Cover = Ep02Cover;
