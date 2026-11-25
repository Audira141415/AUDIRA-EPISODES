// EP58 Mongolia — the ten sets of the film. One component per act, mounted only while its act is
// on screen (multi-scene director in World). Shared: the steppe terrain (with a snow uniform).

import React, { useMemo } from "react";
import { Mesh, MeshStandardMaterial, type WebGLProgramParametersWithUniforms } from "three";
import { gridGeometry } from "../../kits/worldforge/terrainMesh.ts";
import { inside } from "../../kits/worldforge/heightfield.ts";
import { makeTerrainMaterial } from "../../kits/worldforge/surface.ts";
import { COATS, Prop, RiggedHorse, type Models } from "./Horse.tsx";
import { AiragBowl, DustTrail, FinishBanner, Ger, Grass, Herder, Jockey, Snowfall, TetherLine, Warrior, type GrassSpec } from "./Props.tsx";
import { LOC, getSteppe, gy } from "./terrain.ts";
import {
  AIRAG, HOOK_HERD, PORTRAIT, RACERS, RIDGE_HERD, SWAP, VALLEY_HERD, WAR, hookZ, loneX, racerX, setAt, snowAt, ss, valleyX, vzAt, warLead, winterAt, type SetId,
} from "./timeline.ts";

type V3 = [number, number, number];
type P = { m: Models; t: number };
const coat = (c: string) => (COATS as Record<string, string>)[c] ?? c;
const at = (x: number, z: number, dy = 0): V3 => [x, gy(x, z) + dy, z];
const RIGHT = Math.PI / 2;

// ── Terrain (shared) with a snow cover uniform ───────────────────────────────────
const snowU = { value: 0 };
export const Terrain: React.FC<{ snow: number }> = React.memo(({ snow }) => {
  const meshes = useMemo(() => {
    const st = getSteppe();
    const { material } = makeTerrainMaterial();
    const base = material.onBeforeCompile;
    material.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms, r) => {
      base.call(material, sh, r);
      sh.uniforms.uSnow = snowU;
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uSnow;")
        .replace(
          "diffuseColor.rgb *= 1.0 - wfB.g * 0.06 * wfNear;",
          `diffuseColor.rgb *= 1.0 - wfB.g * 0.06 * wfNear;
          float ep58S = uSnow * smoothstep(0.25, 0.55, wfC.b * 0.5 + wfA.b * 0.3 + uSnow * 0.55);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.89, 0.93), ep58S);`,
        );
    };
    material.customProgramCacheKey = () => "ep58-terrain";
    const near = new Mesh(gridGeometry(st.near), material);
    const ng = st.near.grid;
    const far = new Mesh(gridGeometry({ ...st.far, skip: (x0, z0, x1, z1) => inside(ng, x0, z0, 2) && inside(ng, x1, z1, 2) }), material);
    for (const m of [near, far]) m.receiveShadow = true;
    return [near, far];
  }, []);
  snowU.value = snow;
  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
});

// ── S1–S2 Hook ──────────────────────────────────────────────────────────────────
const HOOK_GRASS: GrassSpec = { cx: 0, cz: 0, w: 64, d: 120, count: 26000, h: 0.9, seed: 11 };
const Hook: React.FC<P> = ({ m, t }) => (
  <>
    <Grass spec={HOOK_GRASS} t={t} tone="#a3a052" />
    {HOOK_HERD.map((h, i) => {
      const z = hookZ(h, t);
      return <RiggedHorse key={i} gltf={m[h.model]} clip="Run" t={t} rate={h.rate * 1.05} phase={h.phase} position={at(h.x, z)} scale={h.scale} tint={coat(h.coat)} />;
    })}
    <Ger position={at(-17, 22)} heading={RIGHT} />
    <Herder f={t * 60} seed={3} position={at(-12.6, 20.5)} heading={RIGHT} pose="wave" coat="#2f5aa8" />
    <Herder f={t * 60} seed={7} position={at(-12.9, 23.4)} heading={RIGHT} pose="stand" coat="#a8322c" child />
  </>
);

// ── S3 Valley (aerial herd) ───────────────────────────────────────────────────────
const Valley: React.FC<P> = ({ m, t }) => (
  <>
    {VALLEY_HERD.map((h, i) => {
      const x = valleyX(h, t);
      return (
        <React.Fragment key={i}>
          <RiggedHorse gltf={m[h.model]} clip="Run" t={t} rate={h.rate * 0.85} phase={h.phase} position={at(x, vzAt(x) + h.dz)} heading={RIGHT + Math.sin(x / 180) * 0.12} scale={h.scale} tint={coat(h.coat)} />
          {i % 3 === 0 ? <DustTrail t={t} xAt={(tt) => valleyX(h, tt)} z={vzAt(x) + h.dz} seed={300 + i} /> : null}
        </React.Fragment>
      );
    })}
  </>
);

// ── S4 Camp ─────────────────────────────────────────────────────────────────────────
const CAMP_HORSES = Array.from({ length: 12 }, (_, i) => {
  const a = i * 2.39996, r = 11 + ((i * 7) % 9);
  return { x: LOC.camp.x + Math.cos(a) * r, z: LOC.camp.z + Math.sin(a) * r, heading: a * 1.7, clip: (i % 3 === 0 ? "Walk" : "Idle") as "Walk" | "Idle", coat: ["bay", "dun", "chestnut", "grey", "black", "white"][i % 6], model: (i % 2 ? "horse" : "wild") as "horse" | "wild" };
});
const Camp: React.FC<P> = ({ m, t }) => {
  const c = LOC.camp;
  return (
    <>
      <Ger position={at(c.x - 4, c.z - 3)} heading={0.5} />
      <Ger position={at(c.x + 5, c.z + 2)} heading={0.9} />
      <Ger position={at(c.x - 1, c.z + 9)} heading={0.2} scale={0.85} />
      <Herder f={t * 60} seed={21} position={at(c.x - 2.2, c.z + 1)} heading={0.6} pose="walk" coat="#2f5aa8" />
      <Herder f={t * 60} seed={22} position={at(c.x + 6.5, c.z + 5.4)} heading={0.9} pose="wave" coat="#7a2e6a" />
      <Herder f={t * 60} seed={23} position={at(c.x + 1.2, c.z + 3.2)} heading={0.3} pose="point" coat="#c06a1f" child />
      {CAMP_HORSES.map((h, i) => {
        const walk = h.clip === "Walk" ? (t - 12.4) * 1.1 : 0;
        const x = h.x + Math.sin(h.heading) * walk, z = h.z + Math.cos(h.heading) * walk;
        return <RiggedHorse key={i} gltf={m[h.model]} clip={h.clip} t={t} phase={i * 0.7} position={at(x, z)} heading={h.heading} tint={coat(h.coat)} />;
      })}
    </>
  );
};

// ── S5 Lone horse ────────────────────────────────────────────────────────────────
const Lone: React.FC<P> = ({ m, t }) => <RiggedHorse gltf={m.wild} clip="Walk" t={t} position={at(loneX(t), LOC.lone.z)} heading={RIGHT} tint={coat("dun")} />;

// ── S6–S7 Graze: summer to winter ──────────────────────────────────────────────────
const GRAZE_GRASS: GrassSpec = { cx: LOC.graze.x, cz: LOC.graze.z, w: 60, d: 34, count: 14000, h: 0.42, seed: 12 };
const GRAZERS = [
  { dx: 2, dz: -1, h: 1.9, coat: "bay", model: "horse" },
  { dx: -6, dz: -4, h: 1.2, coat: "dun", model: "wild" },
  { dx: -12, dz: 1, h: 2.4, coat: "grey", model: "horse" },
  { dx: 9, dz: -5, h: 0.9, coat: "chestnut", model: "wild" },
  { dx: 15, dz: 0, h: 2.0, coat: "black", model: "horse" },
  { dx: -18, dz: -6, h: 1.6, coat: "dun", model: "wild" },
] as const;
const Graze: React.FC<P> = ({ m, t }) => {
  const snow = snowAt(t);
  const winter = winterAt(t);
  const c = LOC.graze;
  return (
    <>
      <Grass spec={GRAZE_GRASS} t={t} tone="#94a04a" snow={snow * 0.92} />
      {GRAZERS.map((h, i) => (
        <RiggedHorse key={i} gltf={m[h.model]} clip="Idle" t={t} phase={i * 1.3} position={at(c.x + h.dx, c.z + h.dz)} heading={h.h} tint={coat(h.coat)} frost={winter ? 0.45 : snow * 0.3} />
      ))}
      {t > 33.6 ? <Snowfall t={t} center={[c.x + 2, gy(c.x, c.z) - 1, c.z + 3]} size={[30, 14, 24]} count={2600} density={ss(33.9, 35.6, t)} wind={1.4} /> : null}
    </>
  );
};

// ── S8–S9 War column with spare horses ───────────────────────────────────────────
const SEAT_Y = 1.32;
const War: React.FC<P> = ({ m, t }) => {
  const L = warLead(t);
  const f = t * 60;
  const u = ss(SWAP.t0, SWAP.t1, t);
  const r0 = WAR.riders[0], s0 = WAR.spares[0];
  // rider 0 leaves its horse for the first spare (an arc between the saddles)
  const a: V3 = at(L + r0.dx, r0.z), b: V3 = at(L + s0.dx, s0.z);
  const jump: V3 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + SEAT_Y + Math.sin(u * Math.PI) * 0.7, a[2] + (b[2] - a[2]) * u];
  return (
    <>
      {WAR.riders.map((r, i) => (
        <RiggedHorse
          key={`r${i}`}
          gltf={i === 0 && u > 0.5 ? m.horse : m.saddled}
          clip="Run"
          t={t}
          rate={0.9}
          phase={r.phase}
          position={at(L + r.dx, r.z)}
          heading={RIGHT}
          tint={i === 0 && u > 0.5 ? coat("dun") : coat(["bay", "black", "chestnut", "dusk", "bay", "grey"][i])}
          rider={i === 0 ? undefined : <Warrior f={f} seed={40 + i} coat={r.coat} />}
        />
      ))}
      {WAR.spares.map((s, i) => (
        <RiggedHorse key={`s${i}`} gltf={i === 0 && u > 0.5 ? m.saddled : m[s.model]} clip="Run" t={t} rate={0.9 * s.rate} phase={s.phase} position={at(L + s.dx, s.z)} heading={RIGHT} scale={s.scale} tint={i === 0 && u > 0.5 ? coat("bay") : coat(s.coat)} />
      ))}
      <group position={jump} rotation={[0, RIGHT, 0]}>
        <Warrior f={f} seed={40} coat={r0.coat} />
      </group>
    </>
  );
};

// ── S10–S11 Airag ──────────────────────────────────────────────────────────────────
const stoolMat = new MeshStandardMaterial({ color: "#7a5236", roughness: 0.8 });
const Airag: React.FC<P> = ({ m, t }) => {
  const c = AIRAG.center, ta = AIRAG.tether.a, tb = AIRAG.tether.b;
  const fill = ss(57.6, 59.6, t);
  const mares = [0, 1, 2, 3, 4].map((i) => ({ x: ta[0] + 1.6 + i * 2.7, z: ta[2] + 1.6, coat: ["white", "grey", "dun", "bay", "chestnut"][i] }));
  return (
    <>
      <Ger position={at(c[0] - 3, c[2] - 10)} heading={0.15} />
      <Ger position={at(c[0] + 9, c[2] - 12)} heading={-0.3} scale={0.9} />
      <TetherLine a={at(ta[0], ta[2])} b={at(tb[0], tb[2])} />
      {mares.map((h, i) => (
        <RiggedHorse key={i} gltf={i % 2 ? m.horse : m.wild} clip="Idle" t={t} phase={i * 0.9} position={at(h.x, h.z)} heading={Math.PI + (i - 2) * 0.08} tint={coat(h.coat)} />
      ))}
      <RiggedHorse gltf={m.horse} clip="Walk" t={t} rate={1.2} phase={0.4} position={at(c[0] - 4 + (t - 50.9) * 0.5, c[2] + 4)} heading={RIGHT} scale={0.6} tint={coat("dun")} />
      <RiggedHorse gltf={m.wild} clip="Idle" t={t} phase={1.7} position={at(c[0] + 6, c[2] + 3.4)} heading={-0.6} scale={0.58} tint={coat("grey")} />
      <Herder f={t * 60} seed={31} position={at(c[0] + 1.3, c[2] + 1.2)} heading={Math.PI} pose="crouch" coat="#2f5aa8" />
      <Prop gltf={m.bucket} position={at(c[0] + 1.9, c[2] + 0.6)} scale={0.9} />
      <mesh material={stoolMat} position={[AIRAG.stool[0], AIRAG.stool[1] + 0.22, AIRAG.stool[2]]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.44, 20]} />
      </mesh>
      <AiragBowl position={AIRAG.bowl} fill={t < 57.2 ? 0.15 : 0.15 + fill * 0.85} scale={1.6} />
    </>
  );
};

// ── S12–S13 Naadam race ─────────────────────────────────────────────────────────────
const flagMat = new MeshStandardMaterial({ color: "#f2f0ea", roughness: 0.7 });
const Race: React.FC<P> = ({ m, t }) => {
  const f = t * 60;
  return (
    <>
      <FinishBanner position={at(LOC.finishX, LOC.race.z)} width={10} />
      <Prop gltf={m.flag} position={at(LOC.finishX + 0.6, LOC.race.z - 6)} scale={1.4} />
      <Prop gltf={m.flag} position={at(LOC.finishX + 0.6, LOC.race.z + 6)} scale={1.4} />
      {[-26, -16, 16, 26].map((dz) => (
        <mesh key={dz} material={flagMat} position={at(LOC.finishX - 40, LOC.race.z + dz, 0.6)} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
        </mesh>
      ))}
      {RACERS.map((r, i) => {
        const x = racerX(r, t);
        return (
          <React.Fragment key={i}>
            <RiggedHorse gltf={m.saddled} clip="Run" t={t} rate={1.25} phase={r.phase} position={at(x, r.lane)} heading={RIGHT} tint={coat(r.coat)} rider={<Jockey f={f} seed={60 + i} color={r.color} number={i + 1} />} />
            <DustTrail t={t} xAt={(tt) => racerX(r, tt)} z={r.lane} seed={70 + i} />
          </React.Fragment>
        );
      })}
      <Herder f={f} seed={81} position={at(LOC.finishX + 4, LOC.race.z - 13)} heading={-0.4} pose="wave" coat="#7a2e6a" />
      <Herder f={f} seed={82} position={at(LOC.finishX + 6, LOC.race.z - 14)} heading={-0.3} pose="stand" coat="#2f5aa8" />
      <Herder f={f} seed={83} position={at(LOC.finishX + 2, LOC.race.z - 15)} heading={-0.2} pose="wave" coat="#c06a1f" child />
    </>
  );
};

// ── S14 Portrait: three coats, brand marks ──────────────────────────────────────────
const brandMat = new MeshStandardMaterial({ color: "#2a1c14", roughness: 0.6 });
const Portrait: React.FC<P> = ({ m, t }) => (
  <>
    <Grass spec={PORTRAIT_GRASS} t={t} tone="#a3a052" />
    {PORTRAIT.map((h, i) => (
      <RiggedHorse key={i} gltf={i === 1 ? m.wild : m.horse} clip="Idle" t={t} phase={i * 1.1} position={at(h.x, h.z)} heading={RIGHT} tint={coat(h.coat)}>
        {/* the brand (cap) on the hindquarter, facing the camera side */}
        <group position={[-0.44, 1.3, -0.72]} rotation={[0, RIGHT, 0]}>
          <mesh material={brandMat}>
            <torusGeometry args={[0.11, 0.016, 8, 32]} />
          </mesh>
          <mesh material={brandMat} position={[0, -0.02, 0]}>
            <boxGeometry args={[0.03, 0.2, 0.02]} />
          </mesh>
        </group>
      </RiggedHorse>
    ))}
  </>
);
const PORTRAIT_GRASS: GrassSpec = { cx: LOC.portrait.x, cz: LOC.portrait.z + 3, w: 36, d: 18, count: 9000, h: 0.35, seed: 13 };

// ── S15 Ridge silhouettes ─────────────────────────────────────────────────────────────
const Ridge: React.FC<P> = ({ m, t }) => (
  <>
    {RIDGE_HERD.map((h, i) => {
      const x = h.x0 + h.v * (t - 78.9);
      return <RiggedHorse key={i} gltf={m[h.model]} clip="Walk" t={t} phase={h.phase} position={at(x, LOC.ridge.z + h.dz)} heading={RIGHT} scale={h.scale} tint={coat(h.coat)} />;
    })}
  </>
);

const BY_ID: Record<SetId, React.FC<P>> = { hook: Hook, valley: Valley, camp: Camp, lone: Lone, graze: Graze, war: War, airag: Airag, race: Race, portrait: Portrait, ridge: Ridge };

/** Multi-scene director: exactly one set is mounted at a time. */
export const Sets: React.FC<P> = ({ m, t }) => {
  const id = setAt(t);
  const Set = BY_ID[id];
  return <Set key={id} m={m} t={t} />;
};
