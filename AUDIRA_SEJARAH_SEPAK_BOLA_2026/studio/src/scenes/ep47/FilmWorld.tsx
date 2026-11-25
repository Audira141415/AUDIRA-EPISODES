// EP47 film sets (WORLDFORGE). The cover world (Superga, Turin plain, memorial, mist) plus:
// - Pitch: raised Filadelfia-style ground on the plain right of Superga — catalog turf tiles
//   (instanced) and goals, five scudetto shields, the 1947 lineup (10 granata + 1 keeper),
//   at dusk the two junior lines and the champions board.
// - Avenue: a Turin street with portici facades and a sea of dark-coated mourners.
// - Map table: relief map of Italy–France–Iberia (Natural Earth 50m) with the Turin → Lisbon arc.
// Respectful: no aircraft, fire or wreckage anywhere.
import React, { useLayoutEffect, useMemo } from "react";
import {
  CanvasTexture,
  CapsuleGeometry,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  QuadraticBezierCurve3,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  Shape,
  TubeGeometry,
  Vector3,
} from "three";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { box, cyl, sphere } from "../../kits/worldforge/geo.ts";
import { fbm, mulberry32 } from "../../kits/worldforge/noise.ts";
import { LAND } from "../ep01/worldData.ts";
import { CREAM, GOLD, GRANATA } from "./Cover.tsx";
import { GlbInstanced, GlbLive } from "./GlbLive.tsx";
import {
  AVENUE,
  BOARD,
  KEEPER,
  LINEUP_X,
  LISBON,
  MAP_CX,
  MAP_CZ,
  MAP_D,
  MAP_LAT,
  MAP_LON,
  MAP_W,
  MAZZOLA,
  P,
  PITCH_YAW,
  SHIELD_X,
  SHIELD_YEARS,
  SHIELD_Z,
  TURIN,
} from "./set.ts";
import { T, seg, smooth } from "./timing.ts";

const S = { castShadow: true, receiveShadow: true } as const;
const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};
const tex = (c: HTMLCanvasElement) => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// ── Pitch ground ─────────────────────────────────────────────────────────────
const linesTexture = () => {
  const [c, g] = canvas(1024, 1580); // 68 × 105 m
  const k = 1024 / 68;
  g.strokeStyle = "rgba(246,242,232,0.92)";
  g.lineWidth = 0.14 * k;
  const X = (x: number) => (x + 34) * k, Z = (z: number) => (z + 52.5) * k;
  g.strokeRect(X(-33), Z(-51.5), 66 * k, 103 * k);
  g.beginPath();
  g.moveTo(X(-33), Z(0));
  g.lineTo(X(33), Z(0));
  g.stroke();
  g.beginPath();
  g.arc(X(0), Z(0), 9.15 * k, 0, Math.PI * 2);
  g.stroke();
  for (const s of [-1, 1]) {
    const zl = s * 51.5;
    g.strokeRect(X(-20.16), Math.min(Z(zl), Z(zl - s * 16.5)), 40.32 * k, 16.5 * k);
    g.strokeRect(X(-9.16), Math.min(Z(zl), Z(zl - s * 5.5)), 18.32 * k, 5.5 * k);
    g.beginPath();
    g.arc(X(0), Z(zl - s * 11), 9.15 * k, s < 0 ? 0.29 * Math.PI : 1.29 * Math.PI, s < 0 ? 0.71 * Math.PI : 1.71 * Math.PI);
    g.stroke();
  }
  g.fillStyle = "rgba(246,242,232,0.92)";
  g.beginPath();
  g.arc(X(0), Z(0), 0.3 * k, 0, Math.PI * 2);
  g.fill();
  return tex(c);
};

const PitchGround: React.FC = React.memo(() => {
  const p = useMemo(() => {
    const m4 = new Matrix4(), q = new Quaternion(), one = new Vector3(1, 1, 1);
    const mats: Matrix4[] = [], cols: Color[] = [];
    const light = new Color("#4f8a3a"), dark = new Color("#447c33");
    for (let i = 0; i < 17; i++)
      for (let j = 0; j < 27; j++) {
        mats.push(m4.clone().compose(new Vector3(-32 + i * 4, 0, -52 + j * 4), q, one));
        cols.push(((j >> 0) & 1 ? light : dark).clone().offsetHSL(0, 0, (((i * 7 + j * 13) % 5) - 2) * 0.004));
      }
    return {
      mats,
      cols,
      turf: new MeshStandardMaterial({ color: "#ffffff", roughness: 0.96 }),
      lines: new MeshBasicMaterial({ map: linesTexture(), transparent: true, depthWrite: false, toneMapped: true }),
      earth: new MeshStandardMaterial({ color: "#5f6b38", roughness: 0.95 }),
      bank: new MeshStandardMaterial({ color: "#8e7d5e", roughness: 0.95 }),
      concrete: new MeshStandardMaterial({ color: "#cbbfa6", roughness: 0.9 }),
      wood: new MeshStandardMaterial({ color: "#7a5636", roughness: 0.8 }),
      post: new MeshStandardMaterial({ color: "#f3efe6", roughness: 0.5 }),
    };
  }, []);
  return (
    <group position={P(0, 0, 0)} rotation={[0, PITCH_YAW, 0]}>
      {/* raised ground over the plain, grass surround, earth bank */}
      <mesh geometry={box(140, 8, 132, 0.4)} material={p.bank} position={[0, -4.02, 4]} receiveShadow />
      <mesh geometry={box(136, 0.1, 128, 0.04)} material={p.earth} position={[0, -0.04, 4]} receiveShadow />
      <GlbInstanced id="turf-pitch-tile-aca1ef" matrices={p.mats} colors={p.cols} material={p.turf} />
      <mesh material={p.lines} position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[68, 105]} />
      </mesh>
      {/* goals (catalog GLB, real size) */}
      <GlbLive id="match-goal-a98b60" position={[0, 0, -52.6]} rotation={[0, 0, 0]} height={2.56} />
      <GlbLive id="match-goal-a98b60" position={[0, 0, 52.6]} rotation={[0, Math.PI, 0]} height={2.56} />
      {/* terraces on both long sides, a timber roof on the main stand */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 44, 0, 0]}>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} geometry={box(3.2, 0.9 + k * 0.9, 84, 0.06)} material={p.concrete} position={[sd * (k * 3.0), (0.9 + k * 0.9) / 2, 0]} {...S} />
          ))}
          {sd < 0 && (
            <>
              <mesh geometry={box(17, 0.5, 86, 0.08)} material={p.wood} position={[sd * 6, 8.6, 0]} rotation={[0, 0, sd * -0.08]} {...S} />
              {[-40, -20, 0, 20, 40].map((z) => (
                <mesh key={z} geometry={cyl(0.22, 0.22, 8.4, 10)} material={p.post} position={[sd * -1.4, 4.2, z]} {...S} />
              ))}
            </>
          )}
        </group>
      ))}
    </group>
  );
});

// ── Scudetto shields ─────────────────────────────────────────────────────────
const shieldShape = () => {
  const s = new Shape();
  s.moveTo(-1, 1.2);
  s.lineTo(1, 1.2);
  s.lineTo(1, 0.3);
  s.quadraticCurveTo(1, -0.75, 0, -1.25);
  s.quadraticCurveTo(-1, -0.75, -1, 0.3);
  s.closePath();
  return s;
};
const shieldTexture = (year: string) => {
  const [c, g] = canvas(512, 620);
  g.fillStyle = GRANATA;
  g.fillRect(0, 0, 512, 620);
  g.fillStyle = "rgba(0,0,0,0.12)";
  for (let y = 0; y < 620; y += 6) g.fillRect(0, y, 512, 2);
  g.strokeStyle = GOLD;
  g.lineWidth = 22;
  g.strokeRect(26, 26, 460, 568);
  // tricolour scudetto band (generic, no club or federation mark)
  const band = ["#2f8f4e", "#f4efe2", "#c8323a"];
  band.forEach((col, i) => {
    g.fillStyle = col;
    g.fillRect(166 + i * 60, 70, 60, 120);
  });
  g.fillStyle = CREAM;
  g.textAlign = "center";
  g.font = "bold 150px Georgia, serif";
  g.fillText(year, 256, 380);
  g.font = "bold 46px Georgia, serif";
  g.fillStyle = GOLD;
  g.fillText("SCUDETTO", 256, 460);
  const t = tex(c);
  // ExtrudeGeometry caps use shape coordinates as UVs: map the shield's box [-1,1]×[-1.25,1.2] to 0..1
  t.repeat.set(1 / 2, 1 / 2.45);
  t.offset.set(0.5, 1.25 / 2.45);
  return t;
};
const Shields: React.FC<{ t: number }> = ({ t }) => {
  const p = useMemo(() => {
    const geo = new ExtrudeGeometry(shieldShape(), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 18 });
    geo.translate(0, 0, -0.11);
    return {
      geo,
      faces: SHIELD_YEARS.map((y) => new MeshStandardMaterial({ map: shieldTexture(y), roughness: 0.55, metalness: 0.05 })),
      rim: new MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 0.85 }),
      plinth: new MeshStandardMaterial({ color: "#d9cdb2", roughness: 0.85 }),
    };
  }, []);
  return (
    <group position={P(0, 0, SHIELD_Z)} rotation={[0, PITCH_YAW, 0]}>
      {SHIELD_X.map((x, i) => {
        const at = T.limaKali - 0.25 + i * 0.32;
        const k = seg(t, at, at + 0.55);
        const bounce = 1 + 0.08 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - at - 0.4) / 0.35)));
        const y = -2.6 + k * 4.6;
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh geometry={box(1.9, 0.7, 1.2, 0.08)} material={p.plinth} position={[0, 0.35, 0]} {...S} />
            {k > 0.001 && (
              <mesh geometry={p.geo} material={[p.faces[i], p.rim]} position={[0, y, 0]} rotation={[0, Math.sin(t * 0.7 + i) * 0.08, 0]} scale={[bounce * 1.05, bounce * 1.05, 1]} {...S} />
            )}
          </group>
        );
      })}
    </group>
  );
};

// ── Players ──────────────────────────────────────────────────────────────────
const TORINO = { top: GRANATA, bottom: "#f3efe6", hairStyle: 0 as const, outfit: "casual" as const };
const KEEPER_LOOK = { top: "#3a3e44", bottom: "#17171b", hairStyle: 0 as const, outfit: "casual" as const };
const AWAY = { top: "#f1ede4", bottom: "#1c1c22", hairStyle: 0 as const, outfit: "casual" as const };
const FIG = 1.75;

/** 1947: ten Torino starters pop up on the halfway line, then the keeper from Juventus. */
const Lineup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const halo = useMemo(() => new MeshBasicMaterial({ color: new Color(GOLD).multiplyScalar(1.6), transparent: true, opacity: 0.7, depthWrite: false }), []);
  let order = 0;
  return (
    <group position={P(0, 0.07, 0)} rotation={[0, PITCH_YAW, 0]}>
      {LINEUP_X.map((x, i) => {
        const keeper = i === KEEPER;
        const at = keeper ? T.kiper - 0.15 : T.sepuluh - 0.35 + 0.11 * order++;
        const k = seg(t, at, at + 0.35);
        if (k <= 0.001) return null;
        const pop = 1 + 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - at - 0.2) / 0.3)));
        return <ToyPerson key={i} f={f} seed={470 + i} pose="stand" look={keeper ? KEEPER_LOOK : TORINO} position={[x, 0, 0]} heading={0} scale={FIG * k * pop} />;
      })}
      {/* Mazzola's gold ring (No. 10), from his name on */}
      {t > T.mazzola - 0.3 && (
        <mesh material={halo} position={[LINEUP_X[MAZZOLA], 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={smooth((t - T.mazzola + 0.3) / 0.4)}>
          <ringGeometry args={[0.55, 0.75, 48]} />
        </mesh>
      )}
    </group>
  );
};

/** May 1949: Torino's juniors (granata) and the opponents' juniors face each other across the halfway line. */
const Juniors: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <group position={P(0, 0.07, 0)} rotation={[0, PITCH_YAW, 0]}>
    {Array.from({ length: 11 }, (_, i) => {
      const z = -5.5 + i * 1.1;
      const a = seg(t, T.junior - 0.2 + i * 0.05, T.junior + 0.25 + i * 0.05);
      const b = seg(t, T.lawanJunior - 0.1 + i * 0.05, T.lawanJunior + 0.35 + i * 0.05);
      return (
        <React.Fragment key={i}>
          {a > 0.001 && <ToyPerson f={f} seed={510 + i} pose="stand" look={{ ...TORINO, height: 0.9 }} position={[-1.5, 0, z]} heading={Math.PI / 2} scale={FIG * a} />}
          {b > 0.001 && <ToyPerson f={f} seed={540 + i} pose="stand" look={{ ...AWAY, height: 0.9 }} position={[1.5, 0, z]} heading={-Math.PI / 2} scale={FIG * b} />}
        </React.Fragment>
      );
    })}
  </group>
);

const boardTexture = () => {
  const [c, g] = canvas(1600, 640);
  g.fillStyle = "#efe4cc";
  g.fillRect(0, 0, 1600, 640);
  for (let x = 0; x < 1600; x += 3) {
    g.fillStyle = `rgba(110,80,40,${0.03 + ((x * 17) % 11) * 0.004})`;
    g.fillRect(x, 0, 1, 640);
  }
  g.strokeStyle = GRANATA;
  g.lineWidth = 18;
  g.strokeRect(24, 24, 1552, 592);
  g.textAlign = "center";
  g.fillStyle = "#3a2a1a";
  g.font = "bold 64px Georgia, serif";
  g.fillText("SERIE A 1948–49", 800, 130);
  g.fillStyle = GRANATA;
  g.font = "bold 250px Georgia, serif";
  g.fillText("JUARA", 800, 380);
  g.fillStyle = "#3a2a1a";
  g.font = "bold 80px Georgia, serif";
  g.fillText("TORINO · 6 MEI 1949", 800, 520);
  return tex(c);
};
const ChampionsBoard: React.FC<{ t: number }> = ({ t }) => {
  const p = useMemo(() => ({ face: new MeshStandardMaterial({ map: boardTexture(), roughness: 0.75 }), wood: new MeshStandardMaterial({ color: "#5b3d24", roughness: 0.8 }) }), []);
  const k = seg(t, T.juara - 0.6, T.juara + 0.1);
  return (
    <group position={P(BOARD.x, 0, BOARD.z)} rotation={[0, PITCH_YAW, 0]}>
      {[-4.3, 4.3].map((x) => (
        <mesh key={x} geometry={cyl(0.16, 0.18, 6.6, 10)} material={p.wood} position={[x, 3.3, 0]} {...S} />
      ))}
      <group position={[0, 1.2 + 3.8 * k, 0]}>
        <mesh geometry={box(9.4, 3.9, 0.32, 0.05)} material={p.wood} position={[0, 0, -0.18]} {...S} />
        <mesh material={p.face} position={[0, 0, 0.0]} castShadow>
          <planeGeometry args={[9, 3.6]} />
        </mesh>
      </group>
    </group>
  );
};

// ── Turin avenue with mourners ───────────────────────────────────────────────
const facadeTexture = () => {
  const [c, g] = canvas(512, 768);
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 512, 768);
  // portici (arcade) at street level
  g.fillStyle = "#3a332c";
  for (let i = 0; i < 4; i++) {
    const x = 20 + i * 124;
    g.fillRect(x, 610, 96, 158);
    g.beginPath();
    g.arc(x + 48, 612, 48, Math.PI, 0);
    g.fill();
  }
  g.fillStyle = "rgba(0,0,0,0.12)";
  g.fillRect(0, 560, 512, 14);
  // four floors of shuttered windows
  for (let fl = 0; fl < 4; fl++)
    for (let i = 0; i < 4; i++) {
      const x = 34 + i * 124, y = 60 + fl * 128;
      g.fillStyle = "#2b2622";
      g.fillRect(x, y, 68, 92);
      g.fillStyle = "#5a3a2a";
      g.fillRect(x - 10, y, 10, 92);
      g.fillRect(x + 68, y, 10, 92);
      g.fillStyle = "rgba(0,0,0,0.18)";
      g.fillRect(x - 14, y + 92, 96, 8);
    }
  return tex(c);
};
const Avenue: React.FC<{ t: number }> = ({ t }) => {
  const p = useMemo(() => {
    const rnd = mulberry32(1949);
    const pave = new MeshStandardMaterial({ color: "#8f877b", roughness: 0.92 });
    const fac = new MeshStandardMaterial({ map: facadeTexture(), roughness: 0.88 });
    const roof = new MeshStandardMaterial({ color: "#7c5644", roughness: 0.85 });
    const m4 = new Matrix4(), q = new Quaternion(), up = new Vector3(0, 1, 0);
    // buildings: both sides of the avenue, facades facing the street
    const blocks = new InstancedMesh(box(1, 1, 1, 0.02), fac, 64);
    const roofs = new InstancedMesh(box(1, 1, 1, 0.02), roof, 64);
    const tones = ["#e8d6b4", "#dcc39b", "#e3cfae", "#d4b68e", "#efe0c4"].map((c) => new Color(c));
    let n = 0;
    for (const sd of [-1, 1])
      for (let z = AVENUE.z0; z < AVENUE.z1 && n < 64; ) {
        const w = 16 + rnd() * 8, h = 17 + rnd() * 7, d = 14;
        m4.compose(new Vector3(sd * (AVENUE.half + d / 2), h / 2, z + w / 2), q.setFromAxisAngle(up, sd * Math.PI / 2), new Vector3(w, h, d));
        blocks.setMatrixAt(n, m4);
        blocks.setColorAt(n, tones[Math.floor(rnd() * tones.length)]);
        m4.compose(new Vector3(sd * (AVENUE.half + d / 2), h + 0.5, z + w / 2), q, new Vector3(d + 0.8, 1, w + 0.2));
        roofs.setMatrixAt(n, m4);
        n++;
        z += w + 0.2;
      }
    blocks.count = roofs.count = n;
    blocks.castShadow = blocks.receiveShadow = roofs.castShadow = true;
    // mourners: dark coats, hats, a few granata scarves; denser in the middle of the street
    const N = 1500;
    const coatGeo = new CapsuleGeometry(0.27, 0.95, 4, 10);
    coatGeo.translate(0, 0.75, 0);
    const headGeo = sphere(0.13, 12, 8).clone();
    headGeo.translate(0, 1.56, 0);
    const hatGeo = cyl(0.17, 0.17, 0.12, 12).clone();
    hatGeo.translate(0, 1.7, 0);
    const coat = new InstancedMesh(coatGeo, new MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 }), N);
    const head = new InstancedMesh(headGeo, new MeshStandardMaterial({ color: "#ffffff", roughness: 0.7 }), N);
    const hat = new InstancedMesh(hatGeo, new MeshStandardMaterial({ color: "#1b1a1c", roughness: 0.8 }), N);
    const coats = ["#1d1c1f", "#26252a", "#2e2a27", "#1f232b", "#332d29", "#3a3632"].map((c) => new Color(c));
    const skins = ["#e0b58f", "#c99872", "#b98763"].map((c) => new Color(c));
    const people: { x: number; z: number; s: number; ph: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = (rnd() + rnd() + rnd() - 1.5) * (AVENUE.half - 0.8) * 0.66 * 2;
      const z = AVENUE.z0 + 6 + rnd() * (AVENUE.z1 - AVENUE.z0 - 12);
      people.push({ x: Math.max(-AVENUE.half + 0.6, Math.min(AVENUE.half - 0.6, x)), z, s: 0.92 + rnd() * 0.16, ph: rnd() * 6.28 });
      coat.setColorAt(i, i % 23 === 0 ? new Color(GRANATA) : coats[Math.floor(rnd() * coats.length)]);
      head.setColorAt(i, skins[Math.floor(rnd() * skins.length)]);
    }
    coat.castShadow = true;
    // black mourning drapes and granata banners on the facades
    const drape = new MeshStandardMaterial({ color: "#121113", roughness: 0.9, side: DoubleSide });
    const banner = new MeshStandardMaterial({ color: GRANATA, roughness: 0.85, side: DoubleSide });
    const banners: { x: number; z: number; sd: number; black: boolean }[] = [];
    for (let z = AVENUE.z0 + 14; z < AVENUE.z1 - 10; z += 26) for (const sd of [-1, 1]) banners.push({ x: sd * (AVENUE.half - 0.05), z: z + (sd > 0 ? 9 : 0), sd, black: (z / 26) % 2 < 1 });
    return { pave, blocks, roofs, coat, head, hat, people, drape, banner, banners };
  }, []);
  // a slow shuffle forward and a little sway: the procession is alive, never a frozen crowd
  useLayoutEffect(() => {
    const o = new Object3D();
    p.people.forEach((q, i) => {
      o.position.set(q.x + Math.sin(t * 0.6 + q.ph) * 0.04, 0, q.z - t * 0.12);
      o.rotation.set(0.05 * Math.sin(t * 1.3 + q.ph), Math.PI + 0.25 * Math.sin(q.ph), 0);
      o.scale.setScalar(q.s);
      o.updateMatrix();
      p.coat.setMatrixAt(i, o.matrix);
      p.head.setMatrixAt(i, o.matrix);
      p.hat.setMatrixAt(i, o.matrix);
    });
    p.coat.instanceMatrix.needsUpdate = p.head.instanceMatrix.needsUpdate = p.hat.instanceMatrix.needsUpdate = true;
  }, [p, t]);
  return (
    <group position={P(0, 0, 0)} rotation={[0, PITCH_YAW, 0]}>
      <mesh geometry={box(AVENUE.half * 2 + 40, 8, AVENUE.z1 - AVENUE.z0 + 20, 0.2)} material={p.pave} position={[0, -4.02, (AVENUE.z0 + AVENUE.z1) / 2]} receiveShadow />
      <primitive object={p.blocks} />
      <primitive object={p.roofs} />
      <primitive object={p.coat} />
      <primitive object={p.head} />
      <primitive object={p.hat} />
      {p.banners.map((b, i) => (
        <mesh key={i} material={b.black ? p.drape : p.banner} position={[b.x, 11.5, b.z]} rotation={[0, (b.sd * Math.PI) / 2, 0]} castShadow>
          <planeGeometry args={[2.2, 7]} />
        </mesh>
      ))}
    </group>
  );
};

// ── Relief map table ─────────────────────────────────────────────────────────
const MOUNTAINS: [number, number, number, number][] = [
  // lon, lat, radius (deg), height — Alps, Pyrenees, Apennines, Massif Central, Iberian meseta
  [6.8, 45.2, 1.0, 6], [8.3, 46.2, 1.0, 6.5], [10.2, 46.5, 1.0, 6], [12.2, 46.6, 1.0, 5.5], [14.0, 46.8, 0.9, 4.5],
  [-1.0, 42.8, 0.7, 3.5], [0.8, 42.7, 0.7, 4], [2.2, 42.5, 0.6, 3],
  [9.6, 44.3, 0.6, 2.6], [11.5, 43.6, 0.6, 2.8], [13.3, 42.4, 0.7, 3.2], [14.8, 41.2, 0.6, 2.6], [15.9, 40.1, 0.6, 2.4], [16.2, 38.9, 0.5, 2],
  [3.0, 45.3, 1.0, 1.8], [-4.0, 40.2, 3.2, 1.4], [-3.5, 37.2, 0.9, 2.2],
];
const mountainAt = (lon: number, lat: number) => MOUNTAINS.reduce((h, [x, y, r, a]) => h + a * Math.exp(-(((lon - x) / r) ** 2 + ((lat - y) / r) ** 2)), 0);

const mapAssets = () => {
  const TW = 2048, TH = Math.round((TW * MAP_D) / MAP_W);
  const u = (lon: number) => ((lon - MAP_LON[0]) / (MAP_LON[1] - MAP_LON[0])) * TW;
  const v = (lat: number) => ((MAP_LAT[1] - lat) / (MAP_LAT[1] - MAP_LAT[0])) * TH;
  const near = LAND.filter((r) => r.some(([lo, la]) => lo > MAP_LON[0] - 8 && lo < MAP_LON[1] + 8 && la > MAP_LAT[0] - 8 && la < MAP_LAT[1] + 8));
  const path = (g: CanvasRenderingContext2D) => {
    g.beginPath();
    for (const r of near) r.forEach(([lo, la], i) => (i ? g.lineTo(u(lo), v(la)) : g.moveTo(u(lo), v(la))));
  };
  // mask (for the relief) and colour map
  const [, mg] = canvas(TW, TH);
  mg.fillStyle = "#000";
  mg.fillRect(0, 0, TW, TH);
  mg.fillStyle = "#fff";
  path(mg);
  mg.fill("nonzero");
  const mask = mg.getImageData(0, 0, TW, TH).data;
  const [c, g] = canvas(TW, TH);
  const sea = g.createLinearGradient(0, 0, 0, TH);
  sea.addColorStop(0, "#3f6f86");
  sea.addColorStop(1, "#2e5a72");
  g.fillStyle = sea;
  g.fillRect(0, 0, TW, TH);
  g.strokeStyle = "rgba(220,235,240,0.08)";
  g.lineWidth = 2;
  for (let lo = -10; lo <= 20; lo += 5) {
    g.beginPath();
    g.moveTo(u(lo), 0);
    g.lineTo(u(lo), TH);
    g.stroke();
  }
  for (let la = 35; la <= 50; la += 5) {
    g.beginPath();
    g.moveTo(0, v(la));
    g.lineTo(TW, v(la));
    g.stroke();
  }
  g.fillStyle = "#d9c69c";
  path(g);
  g.fill("nonzero");
  g.save();
  path(g);
  g.clip("nonzero");
  for (const [lo, la, r] of MOUNTAINS) {
    const rr = (r / (MAP_LON[1] - MAP_LON[0])) * TW * 1.4;
    const gr = g.createRadialGradient(u(lo), v(la), 0, u(lo), v(la), rr);
    gr.addColorStop(0, "rgba(140,108,70,0.55)");
    gr.addColorStop(1, "rgba(140,108,70,0)");
    g.fillStyle = gr;
    g.fillRect(u(lo) - rr, v(la) - rr, rr * 2, rr * 2);
  }
  const rnd = mulberry32(47);
  for (let i = 0; i < 14000; i++) {
    g.fillStyle = rnd() > 0.5 ? "rgba(255,245,220,0.05)" : "rgba(90,70,40,0.06)";
    g.fillRect(rnd() * TW, rnd() * TH, 2 + rnd() * 4, 2 + rnd() * 3);
  }
  g.restore();
  g.strokeStyle = "rgba(92,70,44,0.55)";
  g.lineWidth = 2.2;
  path(g);
  g.stroke();
  g.strokeStyle = "rgba(240,248,250,0.35)";
  g.lineWidth = 1.2;
  path(g);
  g.stroke();
  // cartouche (in-world brand)
  g.fillStyle = "rgba(244,236,218,0.92)";
  g.fillRect(TW - 520, TH - 150, 470, 104);
  g.strokeStyle = GRANATA;
  g.lineWidth = 6;
  g.strokeRect(TW - 520, TH - 150, 470, 104);
  g.fillStyle = "#3a2a1a";
  g.textAlign = "center";
  g.font = "bold 50px Georgia, serif";
  g.fillText("AUDIRA · MEI 1949", TW - 285, TH - 82);
  // relief geometry: land lifted, mountains on top, sea flat
  const SX = 330, SZ = Math.round((SX * MAP_D) / MAP_W);
  const geo = new PlaneGeometry(MAP_W, MAP_D, SX, SZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(MAP_CX, 0, MAP_CZ);
  const pos = geo.attributes.position;
  const at = (px: number, py: number) => mask[(Math.min(TH - 1, Math.max(0, Math.round(py))) * TW + Math.min(TW - 1, Math.max(0, Math.round(px)))) * 4] / 255;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const lon = MAP_LON[0] + ((x - (MAP_CX - MAP_W / 2)) / MAP_W) * (MAP_LON[1] - MAP_LON[0]);
    const lat = MAP_LAT[1] - ((z - (MAP_CZ - MAP_D / 2)) / MAP_D) * (MAP_LAT[1] - MAP_LAT[0]);
    const px = u(lon), py = v(lat);
    let m = 0;
    for (const [dx, dy] of [[0, 0], [5, 0], [-5, 0], [0, 5], [0, -5], [4, 4], [-4, -4], [4, -4], [-4, 4]]) m += at(px + dx, py + dy);
    m /= 9;
    const h = smooth(m) * (0.9 + mountainAt(lon, lat) * (0.85 + 0.3 * fbm(lon * 1.7, lat * 1.7, 3)) + 0.25 * fbm(lon * 3, lat * 3, 3));
    pos.setY(i, h);
  }
  geo.computeVertexNormals();
  const t = tex(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return { geo, mat: new MeshStandardMaterial({ map: t, roughness: 0.82 }) };
};

const MapTable: React.FC<{ t: number }> = ({ t }) => {
  const p = useMemo(() => {
    const { geo, mat } = mapAssets();
    const a = new Vector3(TURIN[0], 1.6, TURIN[1]), b = new Vector3(LISBON[0], 1.2, LISBON[1]);
    const ctrl = a.clone().add(b).multiplyScalar(0.5).add(new Vector3(0, 34, 0));
    const curve = new QuadraticBezierCurve3(a, ctrl, b);
    const tube = new TubeGeometry(curve, 220, 0.6, 10, false);
    return {
      geo,
      mat,
      curve,
      tube,
      arc: new MeshBasicMaterial({ color: new Color(GOLD).multiplyScalar(2.2) }),
      frame: new MeshStandardMaterial({ color: "#5a3c24", roughness: 0.7 }),
      pinT: new MeshStandardMaterial({ color: GRANATA, roughness: 0.4 }),
      pinL: new MeshStandardMaterial({ color: "#c8323a", roughness: 0.4 }),
      post: new MeshStandardMaterial({ color: "#f1ebdf", roughness: 0.5 }),
    };
  }, []);
  const k = seg(t, T.terbang - 0.1, T.lisbon + 0.7);
  p.tube.setDrawRange(0, Math.floor(k * 220) * 10 * 6);
  const head = p.curve.getPoint(Math.max(0.001, k));
  const pinL = seg(t, T.lisbon - 0.1, T.lisbon + 0.3);
  return (
    <group>
      <mesh geometry={box(MAP_W + 8, 6, MAP_D + 8, 0.6)} material={p.frame} position={[MAP_CX, -3.05, MAP_CZ]} receiveShadow />
      <mesh geometry={p.geo} material={p.mat} {...S} />
      <mesh geometry={p.tube} material={p.arc} />
      {k > 0.01 && k < 0.999 && <mesh geometry={sphere(1.4, 20, 12)} material={p.arc} position={head} />}
      {[
        { xz: TURIN, m: p.pinT, s: 1 },
        { xz: LISBON, m: p.pinL, s: pinL },
      ].map(({ xz, m, s }, i) =>
        s > 0.001 ? (
          <group key={i} position={[xz[0], 1.2, xz[1]]} scale={s}>
            <mesh geometry={cyl(0.25, 0.25, 7, 10)} material={p.post} position={[0, 3.5, 0]} castShadow />
            <mesh geometry={sphere(1.6, 24, 14)} material={m} position={[0, 7.6, 0]} castShadow />
          </group>
        ) : null,
      )}
    </group>
  );
};

export { MapTable, Avenue, ChampionsBoard, Juniors, Lineup, Shields, PitchGround };
