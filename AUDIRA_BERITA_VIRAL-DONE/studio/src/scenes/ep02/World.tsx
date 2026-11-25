// EP02 film world: the approved cover hall, extended. Hook exhibits (speed bump, police statue),
// 18 engraved steles + the Hoegeng lectern, the nomination ladder at the end of the hall,
// and the guest-book vitrine. Everything is driven by t (seconds) from the Audio Master Clock.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { makeEnvironment, makeFloorTexture, makeGiltMaterial, makeMarbleMaterial, makeBeamTexture } from "../../kits/marblemuseum/lib/materials";
import { MARBLE_PALETTE } from "../../kits/marblemuseum/lib/palette";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { galleryTag, heroText, keppresTexture, plaqueText, ribbonTexture } from "./coverTextures.ts";
import { bumpTexture, exhibitLabel, guestBookPage, stepLabel, BOOK_COLS } from "./filmTextures.ts";
import { T, STEP_T, SEC, seg, win } from "./timing.ts";

export type V3 = [number, number, number];
export const BG = "#0B0605";

// ---------- layout ----------
export const ROW_X = 1.3;
export const ROW_Z0 = 0.4;
export const ROW_DZ = 1.9;
export const ROW_YAW = 0.5;
export const PL = { w: 0.9, h: 1.25, d: 0.12, base: 0.5 };
export const HERO_Z = 2.75;
export const LECT = { w: 1.9, h: 0.74, d: 0.78 };
const TILT = 1.0;
const LIFT = Math.sin(TILT) * 0.45 + 0.02;
/** World centre of the Hoegeng plaque and the Keppres sheet on the lectern desk. */
export const HERO_PLAQUE: V3 = [-0.27, LECT.h + LIFT - 0.08 * 0, HERO_Z - 0.08];
export const KEPPRES_SHEET: V3 = [0.62, LECT.h + LIFT, HERO_Z - 0.08];
export const BUMP_POS: V3 = [-0.62, 0, 4.45];
export const STATUE_POS: V3 = [0.68, 0, 4.5];
export const STAIR = { z0: -17.0, depth: 0.65, rise: 0.4, w: 2.3, n: 5 };
export const HALL_END = -21.6;
export const BOOK_POS: V3 = [-1.4, 0, -16.1];
const BOOK_TOP = 1.02;

// Film order along the aisle (slot -> [name, province, line]). Lines only from HIGH research rows.
export const SLOTS: [string, string, string][] = [
  ["JENDERAL KKO ALI SADIKIN", "DKI JAKARTA", "GUBERNUR DKI 1966–1977"],
  ["MOHAMAD ROEM", "DKI JAKARTA", "PERUNDINGAN ROEM-ROIJEN 1949"],
  ["MR. ALI SASTROAMIDJOJO", "JAWA TIMUR", "PERDANA MENTERI · KAA 1955"],
  ["SUTAN TAKDIR ALISJAHBANA", "DKI JAKARTA", "SASTRAWAN PUJANGGA BARU"],
  ["K.H. WASYID", "BANTEN", "GEGER CILEGON 1888"],
  ["K.H. M. YUSUF HASYIM", "JAWA TIMUR", "ULAMA"],
  ["ABDOEL MOETHALIB SANGADJI", "MALUKU", "TOKOH PERGERAKAN NASIONAL"],
  ["DRS. FRANS SEDA", "NUSA TENGGARA TIMUR", "MENTERI ERA SOEKARNO & SOEHARTO"],
  ["SULTAN MUHAMMAD ALI ABDUL JALIL MUAZZAM SYAH", "RIAU", "MARHUM PEKAN"],
  ["JENDERAL TNI MARADEN PANGGABEAN", "SUMATERA UTARA", "MANTAN PANGLIMA ABRI"],
  ["MAYJEN TNI SOENGKONO", "JAWA TIMUR", "PERTEMPURAN SURABAYA 1945"],
  ["MARSEKAL R. SURYADI SURYADARMA", "JAWA BARAT", "KSAU PERTAMA"],
  ["KIAI MODJO", "SULAWESI UTARA", "PENASIHAT DIPONEGORO"],
  ["K.H. ABBAS ABDUL JAMIL", "JAWA BARAT", "ULAMA BUNTET CIREBON"],
  ["JENDERAL TNI M. JUSUF", "SULAWESI SELATAN", "PANGLIMA ABRI"],
  ["SULTAN IBRAHIM CHALILUDDIN", "KALIMANTAN TIMUR", "TOKOH PERLAWANAN"],
  ["LETKOL MOCH. SROEDJI", "JAWA TIMUR", "PEJUANG JEMBER–BESUKI"],
  ["R.M. MARGONO DJOJOHADIKUSUMO", "JAWA TENGAH", "PENDIRI BNI"],
];
export const MARGONO_SLOT = 17;

export const slotPose = (i: number): { pos: V3; yaw: number; center: V3; normal: V3 } => {
  const left = i % 2 === 0;
  const k = Math.floor(i / 2);
  const pos: V3 = [left ? -ROW_X : ROW_X, 0, ROW_Z0 - k * ROW_DZ];
  const yaw = left ? ROW_YAW : -ROW_YAW;
  return { pos, yaw, center: [pos[0], PL.base + PL.h * 0.52, pos[2]], normal: [Math.sin(yaw), 0, Math.cos(yaw)] };
};

/** When each stele is named (slot -> [on, off]). */
const FOCUS: Record<number, [number, number]> = {
  0: [T.sadikin - 0.1, T.roem - 0.2],
  1: [T.roem - 0.1, T.sastro - 0.2],
  2: [T.sastro - 0.1, T.takdir - 0.2],
  3: [T.takdir - 0.1, T.wasyid - 0.2],
  4: [T.wasyid - 0.1, SEC.PENJELASAN[0] + 0.6],
  17: [T.margono - 0.2, T.cucu - 0.3],
};
const outroGlow = (t: number) => seg(t, T.sembilan - 0.2, T.sembilan + 1.2);

/** Lettering glow: the 19 light up on "19 tokoh", the named one burns brighter. */
const steleGlow = (t: number, i: number) => {
  const order = i + 1;
  const count = seg(t, T.sembilanBelas + order * 0.045, T.sembilanBelas + order * 0.045 + 0.25);
  const f = FOCUS[i];
  const focus = f ? win(t, f[0], f[1], 0.3, 0.4) : 0;
  return 0.28 * count + 0.75 * focus + 0.35 * outroGlow(t);
};
export const heroGlow = (t: number) =>
  0.95 * seg(t, T.hoegeng - 0.05, T.hoegeng + 0.45) * (1 - 0.5 * seg(t, SEC.KONTEKS[0], SEC.KONTEKS[0] + 1.5)) +
  0.5 * win(t, T.hoegeng2 - 0.1, T.sadikin - 0.4, 0.3, 0.5) +
  0.3 * outroGlow(t);

// ---------- helpers ----------
const Spot: React.FC<{ pos: V3; at: V3; intensity: number; angle: number; color?: string; shadow?: boolean; distance?: number }> = ({ pos, at, intensity, angle, color = "#FFE7C4", shadow, distance = 12 }) => {
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
        distance={distance}
        decay={1.5}
        color={color}
        castShadow={shadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
    </>
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

const Contact: React.FC<{ w: number; d: number; o?: number }> = ({ w, d, o = 0.4 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial color="#000" transparent opacity={o} depthWrite={false} />
  </mesh>
);

/** Gold lettering plane with emissive glow driven by `glow`. */
const Lettering: React.FC<{ tex: THREE.Texture; size: [number, number]; glow: number }> = ({ tex, size, glow }) => (
  <mesh>
    <planeGeometry args={size} />
    <meshStandardMaterial
      map={tex}
      emissiveMap={tex}
      emissive="#FFC864"
      emissiveIntensity={glow}
      transparent
      alphaTest={0.02}
      roughness={0.42}
      metalness={0.35}
      depthWrite={false}
      polygonOffset
      polygonOffsetFactor={-2}
    />
  </mesh>
);

// ---------- steles ----------
const Stele: React.FC<{ i: number; t: number; font: string; marble: THREE.Material; dark: THREE.Material }> = ({ i, t, font, marble, dark }) => {
  const { pos, yaw } = slotPose(i);
  const [name, prov, line] = SLOTS[i];
  const tex = plaqueText(font, name, prov, line);
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <mesh material={dark} position={[0, PL.base / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PL.w + 0.16, PL.base, PL.d + 0.26]} radius={0.03} />
      </mesh>
      <mesh material={marble} position={[0, PL.base + PL.h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PL.w, PL.h, PL.d]} radius={0.03} />
      </mesh>
      <group position={[0, PL.base + PL.h / 2, PL.d / 2 + 0.002]}>
        <Lettering tex={tex} size={[PL.w * 0.96, PL.h * 0.96]} glow={steleGlow(t, i)} />
      </group>
      <Contact w={PL.w + 0.6} d={PL.d + 0.7} />
    </group>
  );
};

// ---------- hook exhibits ----------
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
      <mesh position={[0, 0.17, 0.004]}>
        <planeGeometry args={[0.13, 0.34]} />
        <meshPhysicalMaterial {...POLISH.fabric} map={ribbon} />
      </mesh>
      <mesh geometry={star} material={gilt} position={[0, -0.12, 0.02]} />
      <mesh position={[0, -0.12, 0.03]}>
        <circleGeometry args={[0.035, 32]} />
        <meshStandardMaterial color="#9C1A16" roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
};

const Lectern: React.FC<{ t: number; font: string; marble: THREE.Material; dark: THREE.Material; gilt: THREE.Material }> = ({ t, font, marble, dark, gilt }) => {
  const topY = LECT.h;
  return (
    <group position={[0, 0, HERO_Z]}>
      <mesh material={dark} position={[0, LECT.h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[LECT.w, LECT.h, LECT.d]} radius={0.04} />
      </mesh>
      <mesh material={gilt} position={[0, topY - 0.05, LECT.d / 2 + 0.012]}>
        <RoundedBoxGeo args={[LECT.w - 0.04, 0.035, 0.03]} radius={0.01} />
      </mesh>
      <group position={[0, topY + LIFT, -0.08]} rotation={[TILT, 0, 0]}>
        <mesh material={dark} position={[0, -0.065, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[LECT.w - 0.02, 0.07, 0.92]} radius={0.025} />
        </mesh>
        <mesh material={marble} position={[-0.27, 0.0, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.25, 0.06, 0.82]} radius={0.025} />
        </mesh>
        <group position={[-0.27, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Lettering tex={heroText(font)} size={[1.21, 0.79]} glow={heroGlow(t)} />
        </group>
        <mesh material={dark} position={[0.62, 0.0, 0.0]}>
          <RoundedBoxGeo args={[0.5, 0.04, 0.72]} radius={0.015} />
        </mesh>
        <mesh position={[0.62, 0.022, 0.0]} rotation={[-Math.PI / 2, 0, -0.03]}>
          <planeGeometry args={[0.44, 0.6]} />
          <meshPhysicalMaterial {...POLISH.paper} map={keppresTexture(font)} emissiveMap={keppresTexture(font)} emissive="#FFF2DC" emissiveIntensity={0.25 * win(t, T.keppres - 0.3, T.fadli + 1, 0.3, 0.6)} />
        </mesh>
      </group>
      <mesh position={[0.42, 0.5, LECT.d / 2 + 0.006]}>
        <planeGeometry args={[0.62, 0.12]} />
        <meshStandardMaterial map={galleryTag(font)} roughness={0.35} metalness={0.75} />
      </mesh>
      <Medal pos={[-0.52, topY - 0.42, LECT.d / 2 + 0.004]} gilt={gilt} />
      <Contact w={LECT.w + 0.7} d={LECT.d + 0.7} o={0.5} />
    </group>
  );
};

const STONE = "#5E4C37"; // weathered bronze
const STATUE_LOOK = { skin: STONE, hair: STONE, top: "#54432F", bottom: "#4C3D2B", cap: "#3F3324", hairStyle: 2 as const, build: 1.05, height: 1.0 };

const Exhibits: React.FC<{ font: string; dark: THREE.Material }> = ({ font, dark }) => {
  const bump = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.16, 0.16, 0.86, 48, 1, false, -Math.PI / 2, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.scale(1, 0.62, 1);
    return g;
  }, []);
  const bumpTex = bumpTexture();
  return (
    <>
      {/* 1 · polisi tidur: a speed bump displayed as an exhibit */}
      <group position={BUMP_POS}>
        <mesh material={dark} position={[0, 0.16, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.0, 0.32, 0.7]} radius={0.03} />
        </mesh>
        <mesh geometry={bump} position={[0, 0.32, 0]} castShadow>
          <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.75} clearcoat={0.05} map={bumpTex} />
        </mesh>
        <mesh position={[0, 0.17, 0.352]}>
          <planeGeometry args={[0.62, 0.21]} />
          <meshStandardMaterial map={exhibitLabel(font, "1", "POLISI TIDUR")} roughness={0.8} />
        </mesh>
        <Contact w={1.5} d={1.1} />
      </group>
      {/* 2 · patung polisi: a generic stone traffic-officer statue (no real person) */}
      <group position={STATUE_POS}>
        {/* tall grey-stone plinth with a moulded cap */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.5, 0.8, 0.5]} radius={0.03} />
          <meshPhysicalMaterial {...POLISH.stone} color="#6E6A63" />
        </mesh>
        <mesh position={[0, 0.83, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.58, 0.06, 0.58]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.stone} color="#77736B" />
        </mesh>
        <ToyPerson f={0} seed={11} pose="wave" outfit="casual" look={STATUE_LOOK} position={[0, 0.86, 0]} heading={-1.15} scale={0.55} />
        <mesh position={[0, 0.3, 0.252]}>
          <planeGeometry args={[0.46, 0.158]} />
          <meshStandardMaterial map={exhibitLabel(font, "2", "PATUNG POLISI")} roughness={0.8} />
        </mesh>
        <Contact w={1.1} d={1.1} />
      </group>
    </>
  );
};

// ---------- nomination ladder ----------
const LADDER = ["TIM PENELITI KAB/KOTA", "PROVINSI", "KEMENTERIAN SOSIAL", "DEWAN GELAR", "PRESIDEN"];
export const stepTop = (j: number): V3 => [0, STAIR.rise * (j + 1), STAIR.z0 - STAIR.depth * (j + 0.5)];

const tokenPos = (t: number): V3 => {
  const start: V3 = [0, 0.06, STAIR.z0 + 0.45];
  let p = start;
  for (let j = 0; j < STEP_T.length; j++) {
    const a = STEP_T[j] - 0.5;
    const b = STEP_T[j];
    const to = stepTop(j);
    const to2: V3 = [to[0], to[1] + 0.06, to[2]];
    if (t < a) return p;
    if (t < b) {
      const k = seg(t, a, b);
      return [p[0] + (to2[0] - p[0]) * k, p[1] + (to2[1] - p[1]) * k + Math.sin(k * Math.PI) * 0.35, p[2] + (to2[2] - p[2]) * k];
    }
    p = to2;
  }
  return p;
};

const Ladder: React.FC<{ t: number; font: string; marble: THREE.Material; gilt: THREE.Material }> = ({ t, font, marble, gilt }) => {
  const tp = tokenPos(t);
  const tokenOn = seg(t, T.usulan - 0.2, T.usulan + 0.4);
  return (
    <group>
      {LADDER.map((label, j) => {
        const h = STAIR.rise * (j + 1);
        const zc = STAIR.z0 - STAIR.depth * j - (STAIR.depth * (STAIR.n - j)) / 2;
        const len = STAIR.depth * (STAIR.n - j) + 1.4;
        const lit = seg(t, STEP_T[j] - 0.05, STEP_T[j] + 0.3);
        return (
          <group key={j}>
            <mesh material={marble} position={[0, h / 2, zc - 0.7]} castShadow receiveShadow>
              <RoundedBoxGeo args={[STAIR.w, h, len]} radius={0.02} />
            </mesh>
            <group position={[0, STAIR.rise * j + STAIR.rise / 2, STAIR.z0 - STAIR.depth * j + 0.003]}>
              <Lettering tex={stepLabel(font, j + 1, label)} size={[STAIR.w * 0.8, STAIR.w * 0.8 * (160 / 1024)]} glow={0.1 + 0.9 * lit} />
            </group>
          </group>
        );
      })}
      {/* the nomination: a sealed scroll that climbs step by step */}
      <group position={tp} scale={tokenOn}>
        <mesh material={gilt} rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.36, 24]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.3, 24]} />
          <meshPhysicalMaterial {...POLISH.paper} color="#EDE3CC" />
        </mesh>
        <mesh position={[0, 0.05, 0.048]}>
          <circleGeometry args={[0.03, 24]} />
          <meshStandardMaterial color="#9C1A16" roughness={0.4} emissive="#9C1A16" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- guest-book vitrine ----------
const GuestBook: React.FC<{ t: number; font: string; dark: THREE.Material }> = ({ t, font, dark }) => {
  const hiIn = win(t, T.jamDatang - 0.1, SEC.OUTRO[0] + 0.4, 0.25, 0.4);
  const hiOut = win(t, T.jamPulang - 0.1, SEC.OUTRO[0] + 0.4, 0.25, 0.4);
  const pageW = 0.36, pageH = 0.46;
  const col = (c: readonly [number, number], k: number) => (
    <mesh position={[((c[0] + c[1]) / 2 - 0.5) * pageW, -0.005 * 0, 0.002]}>
      <planeGeometry args={[(c[1] - c[0]) * pageW, pageH * 0.74]} />
      <meshBasicMaterial color="#F2B53C" transparent opacity={0.34 * k} depthWrite={false} toneMapped={false} />
    </mesh>
  );
  return (
    <group position={BOOK_POS} rotation={[0, 0.35, 0]}>
      <mesh material={dark} position={[0, 0.47, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.95, 0.94, 0.7]} radius={0.03} />
      </mesh>
      {/* book: two pages in a shallow V, tilted to the visitor */}
      <group position={[0, BOOK_TOP, 0.02]} rotation={[-Math.PI / 2 + 0.32, 0, 0]}>
        <mesh position={[0, 0, -0.012]}>
          <RoundedBoxGeo args={[pageW * 2 + 0.05, pageH + 0.04, 0.02]} radius={0.008} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#4A1712" />
        </mesh>
        <group position={[-pageW / 2, 0, 0.004]} rotation={[0, 0.06, 0]}>
          <mesh>
            <planeGeometry args={[pageW, pageH]} />
            <meshPhysicalMaterial {...POLISH.paper} map={guestBookPage(font, "L")} />
          </mesh>
        </group>
        <group position={[pageW / 2, 0, 0.004]} rotation={[0, -0.06, 0]}>
          <mesh>
            <planeGeometry args={[pageW, pageH]} />
            <meshPhysicalMaterial {...POLISH.paper} map={guestBookPage(font, "R")} />
          </mesh>
          <group position={[0, -0.04, 0]}>
            {col(BOOK_COLS.in, hiIn)}
            {col(BOOK_COLS.out, hiOut)}
          </group>
        </group>
      </group>
      <Contact w={1.4} d={1.2} />
    </group>
  );
};

// ---------- hall ----------
export const World: React.FC<{ t: number; font: string }> = ({ t, font }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => makeEnvironment(gl), [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog("#0E0706", 9, 34);
  }, [scene, env]);
  const grain = useSurfaceGrain(202, 0.3, 4);
  const floor = useMemo(() => {
    const tx = makeFloorTexture();
    tx.repeat.set(3, 16);
    return tx;
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

  const FRONT = 11;
  const hallLen = FRONT - HALL_END;
  const hallMid = (FRONT + HALL_END) / 2;

  const hookBeat = (a: number) => 0.55 + 0.45 * seg(t, a - 0.1, a + 0.35);
  const heroSpot = 3 + 8 * seg(t, T.hoegeng - 0.1, T.hoegeng + 0.5);
  const ladderOn = seg(t, T.gelar - 0.5, T.usulan);
  const bookOn = seg(t, T.cucu - 1.2, T.cucu);
  const focusSpot = (i: number) => {
    const f = FOCUS[i];
    return f ? 4 * win(t, f[0], f[1], 0.3, 0.4) : 0;
  };

  return (
    <group>
      <ambientLight intensity={0.05} color="#F3E2CC" />
      <hemisphereLight args={["#F7EBDD", "#1A0B09", 0.1]} />
      <directionalLight position={[-2, 4, -6]} intensity={0.45} color={MARBLE_PALETTE.rimWarm} />
      {/* aisle fill so far steles never go black */}
      <pointLight position={[0, 3.4, -6]} intensity={1.6} distance={9} decay={1.5} color="#FFD9A8" />
      <pointLight position={[0, 3.4, -12]} intensity={1.6} distance={9} decay={1.5} color="#FFD9A8" />

      {/* stele spots (narrow, grazing from above-front, ~30% under the kit key) */}
      {[0, 1, 2, 3, 4, 5, MARGONO_SLOT].map((i) => {
        const { center, normal } = slotPose(i);
        return (
          <Spot
            key={i}
            pos={[center[0] + normal[0] * 1.0, 4.6, center[2] + normal[2] * 1.0]}
            at={center}
            intensity={(i < 2 ? 11 : 13) + focusSpot(i) + (i === MARGONO_SLOT ? 4 * seg(t, T.margono - 0.3, T.margono + 0.4) : 0)}
            angle={0.2}
          />
        );
      })}
      {/* hero key: dim until "Hoegeng", then the plaque lights up */}
      <Spot pos={[-0.6, 4.4, HERO_Z + 2.5]} at={[-0.1, LECT.h, HERO_Z]} intensity={heroSpot} angle={0.26} shadow />
      {/* hook exhibits */}
      <Spot pos={[BUMP_POS[0] - 0.2, 3.8, BUMP_POS[2] + 1.8]} at={[BUMP_POS[0], 0.3, BUMP_POS[2]]} intensity={9 * hookBeat(T.tidur)} angle={0.24} />
      <Spot pos={[STATUE_POS[0] + 0.2, 4.0, STATUE_POS[2] + 1.8]} at={[STATUE_POS[0], 1.1, STATUE_POS[2]]} intensity={9 * hookBeat(T.patung)} angle={0.26} />
      {/* ladder + end wall */}
      <Spot pos={[0.8, 5.3, STAIR.z0 + 2.6]} at={[0, 1.0, STAIR.z0 - 1.6]} intensity={4 + 12 * ladderOn} angle={0.5} distance={14} />
      <Spot pos={[0, 5.3, HALL_END + 4.5]} at={[0, 3.6, HALL_END]} intensity={16} angle={0.3} color="#FFE2BA" distance={14} />
      <Spot pos={[0, 4.9, HALL_END + 2.2]} at={[0, 3.42, HALL_END]} intensity={5} angle={0.32} color="#FFF0DC" distance={8} />
      <Spot pos={[BOOK_POS[0] + 0.4, 3.6, BOOK_POS[2] + 1.2]} at={[BOOK_POS[0], BOOK_TOP, BOOK_POS[2]]} intensity={1.5 + 4.5 * bookOn} angle={0.24} />

      {/* floor + runner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, hallMid]} receiveShadow>
        <planeGeometry args={[6, hallLen]} />
        <meshStandardMaterial map={floor} roughness={0.18} metalness={0.05} color="#B9B0A2" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, (3.6 + STAIR.z0) / 2]}>
        <planeGeometry args={[1.05, 3.6 - STAIR.z0]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#4E0F0D" />
      </mesh>

      {/* walls */}
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

      {/* colonnade */}
      {Array.from({ length: 7 }, (_, k) => k).flatMap((k) =>
        [-1, 1].map((s) => (
          <group key={`${k}${s}`} position={[s * 2.35, 0, 3.5 - k * 3.6]}>
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

      {/* end wall: Merah Putih in a gilt frame + AUDIRA gallery tag */}
      <mesh position={[0, 3, HALL_END]}>
        <planeGeometry args={[6, 6]} />
        <meshPhysicalMaterial {...POLISH.stone} color={MARBLE_PALETTE.wallOxblood} bumpMap={grain} bumpScale={0.25} />
      </mesh>
      <group position={[0, 3.42, HALL_END + 0.05]}>
        <mesh position={[0, 0.5, 0.02]}>
          <planeGeometry args={[1.4, 1.0]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#C8102E" emissive="#C8102E" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.5, 0.02]}>
          <planeGeometry args={[1.4, 1.0]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#EEE8DC" emissive="#EEE8DC" emissiveIntensity={0.06} />
        </mesh>
        {/* cream mat + thin dark gap so the flag separates from the oxblood wall */}
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[1.48, 2.08]} />
          <meshBasicMaterial color="#1A0E0B" />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <planeGeometry args={[1.64, 2.24]} />
          <meshStandardMaterial color="#D9CBA8" roughness={0.8} />
        </mesh>
        {[
          [0, 1.08, 1.7, 0.16],
          [0, -1.08, 1.7, 0.16],
          [-0.78, 0, 0.16, 2.32],
          [0.78, 0, 0.16, 2.32],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} material={gilt} position={[x, y, 0.06]}>
            <RoundedBoxGeo args={[w, h, 0.1]} radius={0.03} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 2.1, HALL_END + 0.03]}>
        <planeGeometry args={[1.0, 0.19]} />
        <meshStandardMaterial map={galleryTag(font)} roughness={0.35} metalness={0.75} />
      </mesh>

      {SLOTS.map((_, i) => (
        <Stele key={i} i={i} t={t} font={font} marble={marble} dark={dark} />
      ))}
      <Lectern t={t} font={font} marble={marble} dark={dark} gilt={gilt} />
      <Exhibits font={font} dark={dark} />
      <Ladder t={t} font={font} marble={marble} gilt={gilt} />
      <GuestBook t={t} font={font} dark={dark} />

      {/* faint light shaft over the hero */}
      {[0, Math.PI / 2].map((ry) => (
        <mesh key={ry} position={[-0.35, 2.9, HERO_Z + 1.0]} rotation={[0.45, ry, 0.12]}>
          <planeGeometry args={[1.1, 4.2]} />
          <meshBasicMaterial map={beam} color={MARBLE_PALETTE.skylight} transparent opacity={0.035 * (0.3 + 0.7 * seg(t, T.hoegeng, T.hoegeng + 0.6))} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}
    </group>
  );
};
