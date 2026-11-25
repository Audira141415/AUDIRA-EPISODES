// c03 "Sumur yang hilang dan digali kembali": an earth column cut open at the well. Jurhum's fill
// drops in and buries two gold gazelles; generations pass (night); the fill is lifted out again and
// the finds rise: gazelles, swords, armour, the arrow lottery, the gilded door, the water jars.
// No person is shown: the shovel works by itself, tools and objects carry the story.

import React, { useMemo } from "react";
import * as THREE from "three";
import { at, chapter, prog, smooth, easeOut, window01 } from "./time.ts";
import { Gazelle, Jar, Plinth } from "./kit.tsx";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";

const C = "c03_hilang";
export const T3 = {
  start: chapter(C).start,
  bury: at(C, "mereka menimbun Zamzam"),
  gazelles: at(C, "dua patung kijang"),
  forgot: at(C, "Lokasi sumur itu"),
  later: at(C, "Lama kemudian"),
  nights: at(C, "Empat malam"),
  clues: at(C, "Petunjuknya aneh"),
  dig: at(C, "Abdul Muthalib menggali"),
  found: at(C, "Dan ia menemukannya"),
  finds: at(C, "Bersama air"),
  quraisy: at(C, "Kaum Quraisy"),
  arrows: at(C, "undian anak panah"),
  door: at(C, "pedang-pedang itu"),
  jars: at(C, "Sejak itu"),
  end: chapter(C).end,
};

/** Strata bands and pebbles embedded in the earth column's cut face. */
const Strata: React.FC = () => {
  const { pebbles } = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 10, 8);
    const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.85, color: "#ffffff" });
    const N = 700;
    const im = new THREE.InstancedMesh(geo, mat, N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
    let seed = 7;
    const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let k = 0;
    while (k < N) {
      const x = -44 + r() * 88, y = -11.5 + r() * 11, sz = 0.08 + Math.pow(r(), 2.2) * 0.35;
      if (Math.abs(x) < 2.2) continue;
      e.set(r() * 3, r() * 3, r() * 3); q.setFromEuler(e);
      m4.compose(new THREE.Vector3(x, y, -sz * 0.3), q, new THREE.Vector3(sz * 1.3, sz * 0.8, sz));
      im.setMatrixAt(k, m4);
      col.setHSL(0.07 + r() * 0.05, 0.25 + r() * 0.2, 0.4 + r() * 0.3);
      im.setColorAt(k, col);
      k++;
    }
    im.castShadow = true;
    return { pebbles: im };
  }, []);
  const bands = [-2.2, -4.6, -7.4, -9.8];
  return (
    <group>
      <primitive object={pebbles} />
      {bands.map((y, i) =>
        [-23, 23].map((x) => (
          <mesh key={`${i}${x}`} position={[x, y, 0.02]}>
            <planeGeometry args={[43, 0.35 + (i % 2) * 0.25]} />
            <meshStandardMaterial color={i % 2 ? "#b88f5c" : "#c79c66"} roughness={1} />
          </mesh>
        )),
      )}
    </group>
  );
};

/** Night between "Lama kemudian" and the clues (dim the key light). */
export const nightAt = (t: number) => window01(t, T3.later, T3.clues + 1.5, 1.4);

const SAND = ["#d7b27c", "#c9a06a", "#ddbd8b", "#bf975f", "#d2ab74", "#c4a070"];
const FILL_N = 6;
const FILL_TOP = 0, FILL_BOT = -14;

export const Buried: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(
    () => ({
      sand: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#d9b783" }),
      sandCut: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#cfa874" }),
      rock: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#6f7772" }),
      gold: new THREE.MeshPhysicalMaterial({ color: "#d9ab45", metalness: 1, roughness: 0.25 }),
      steel: new THREE.MeshPhysicalMaterial({ color: "#c7cdd1", metalness: 1, roughness: 0.3 }),
      wood: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#7b5534" }),
      water: new THREE.MeshPhysicalMaterial({ color: "#3fb2d9", roughness: 0.08, emissive: "#0d5f80", emissiveIntensity: 0.3, transparent: true, opacity: 0.85 }),
      kaaba: new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: "#141414" }),
      marble: new THREE.MeshPhysicalMaterial({ color: "#f3efe8", roughness: 0.4 }),
      dark: new THREE.MeshStandardMaterial({ color: "#2e2622", roughness: 0.9 }),
      stain: new THREE.MeshStandardMaterial({ color: "#8c6a4a", roughness: 1 }),
      ant: new THREE.MeshStandardMaterial({ color: "#a37f55", roughness: 1 }),
    }),
    [],
  );
  const fillMats = useMemo(() => SAND.map((c) => new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: c })), []);

  // fill: drops in during the burial, lifted out layer by layer during the dig
  const bury = prog(t, T3.bury + 0.3, T3.bury + 4.5);
  const dig = prog(t, T3.dig, T3.found + 0.6);
  const lh = (FILL_TOP - FILL_BOT) / FILL_N;
  const layers = Array.from({ length: FILL_N }, (_, i) => {
    // i = 0 bottom
    const inP = smooth(prog(bury, i / FILL_N, (i + 1) / FILL_N));
    const outP = smooth(prog(dig, (FILL_N - 1 - i) / FILL_N, (FILL_N - i) / FILL_N));
    const y = FILL_BOT + lh * (i + 0.5) + (1 - inP) * 16;
    return { i, y, inP, outP };
  });
  const finds = easeOut(prog(t, T3.finds, T3.finds + 2.5));
  const arrows = smooth(prog(t, T3.arrows - 0.3, T3.arrows + 1.2));
  const door = smooth(prog(t, T3.door + 0.4, T3.door + 2.6));
  const jars = prog(t, T3.jars, T3.jars + 3);
  const clues = smooth(prog(t, T3.clues - 0.5, T3.clues + 1));
  const shovelOn = window01(t, T3.dig - 0.3, T3.found + 1.0, 0.5);

  const peck = Math.max(0, Math.sin(t * 6)) * 0.3;
  const shovelY = 1.5 - (Math.sin(t * 2.6) * 0.5 + 0.5) * 2.2 - dig * 6;

  return (
    <group>
      {/* earth column: left/right/back blocks around a square shaft open to the front */}
      <Plinth w={160} d={100} h={0.6} top="#dcbc8a" side="#c9a571" seed={21} />
      {[
        [-23, 3],
        [23, 3],
      ].map(([x], i) => (
        <group key={i}>
          <mesh position={[x, -6, -20]} material={m.sandCut} receiveShadow castShadow>
            <boxGeometry args={[43, 12, 40]} />
          </mesh>
          <mesh position={[x, -18, -20]} material={m.rock} receiveShadow castShadow>
            <boxGeometry args={[43, 12, 40]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -6, -21.5]} material={m.sandCut} receiveShadow>
        <boxGeometry args={[3.2, 12, 37]} />
      </mesh>
      <mesh position={[0, -18, -21.5]} material={m.rock} receiveShadow>
        <boxGeometry args={[3.2, 12, 37]} />
      </mesh>
      <mesh position={[0, -18.5, -1.5]} material={m.water}>
        <boxGeometry args={[3.0, 4.5, 2.9]} />
      </mesh>

      {/* strata and pebbles on the cut face */}
      <Strata />
      {/* fill layers inside the shaft */}
      {layers.map(({ i, y, inP, outP }) =>
        inP > 0.01 && outP < 0.99 ? (
          <mesh
            key={i}
            position={[outP * 7.5, y + outP * (10 - y) * 0.6 + Math.sin(outP * Math.PI) * 4, -1.5 - outP * 1]}
            scale={[1 - outP * 0.3, 1 - outP * 0.5, 1]}
            material={fillMats[i]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[3.0, lh, 2.9]} />
          </mesh>
        ) : null,
      )}
      {/* spoil heap growing beside the shaft while digging */}
      <mesh position={[8, 0, -4]} scale={[1, Math.max(0.01, dig), 1]} material={m.sand} castShadow>
        <coneGeometry args={[4.4, 3.4, 18]} />
      </mesh>

      {/* the two gold gazelles: buried in the fill, later standing on the surface */}
      {(() => {
        const inFill = smooth(prog(bury, 0.25, 0.6));
        const y0 = -9.2 + (1 - inFill) * 14;
        const risen = finds;
        const show = inFill > 0.01 || risen > 0.01;
        if (!show) return null;
        const p1: [number, number, number] = [-0.6 + risen * -3.4, y0 + risen * (0 - y0), -1.2 + risen * -1.6];
        const p2: [number, number, number] = [0.6 + risen * -1.0, y0 + 0.2 + risen * (0 - y0 - 0.2), -1.8 + risen * -1.4];
        return (
          <>
            <Gazelle p={p1} s={0.9} rotY={0.4} mat={m.gold} />
            <Gazelle p={p2} s={0.85} rotY={-0.3} mat={m.gold} />
          </>
        );
      })()}

      {/* swords and armour among the finds (swords become the door) */}
      {finds > 0.01 && door < 0.99
        ? [-0.4, 0, 0.4].map((dx, i) => (
            <mesh key={i} position={[2.2 + dx, 1.2 * finds, -2.4]} rotation={[0, 0, 0.12 * (i - 1)]} material={m.steel} scale={[1, finds * (1 - door), 1]} castShadow>
              <boxGeometry args={[0.12, 2.4, 0.04]} />
            </mesh>
          ))
        : null}
      {finds > 0.01 ? (
        <mesh position={[4.2, 0.8 * finds, -2.6]} scale={finds} castShadow>
          <RoundedBoxGeo args={[1.2, 1.5, 0.6]} radius={0.25} />
          <meshPhysicalMaterial color="#9aa3a8" metalness={0.9} roughness={0.35} />
        </mesh>
      ) : null}

      {/* arrow lottery stand */}
      {arrows > 0.01 ? (
        <group position={[-6.5, 0, -3]} scale={arrows}>
          <mesh position={[0, 0.3, 0]} material={m.wood}>
            <cylinderGeometry args={[0.6, 0.7, 0.6, 16]} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => {
            const lift = i === 2 ? smooth(prog(t, T3.arrows + 1.2, T3.arrows + 2.4)) * 1.2 : 0;
            return (
              <group key={i} position={[Math.cos(i) * 0.3, 1.6 + lift, Math.sin(i) * 0.3]} rotation={[Math.sin(i) * 0.12, 0, Math.cos(i) * 0.12]}>
                <mesh material={m.wood}>
                  <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
                </mesh>
                <mesh position={[0, 1.25, 0]} material={m.steel}>
                  <coneGeometry args={[0.07, 0.25, 6]} />
                </mesh>
                <mesh position={[0, -1.05, 0]} material={i === 2 ? m.gold : m.dark}>
                  <boxGeometry args={[0.02, 0.3, 0.16]} />
                </mesh>
              </group>
            );
          })}
        </group>
      ) : null}

      {/* the door made from the swords, gilded with the gazelles' gold (shown alone, on a stand) */}
      {door > 0.01 ? (
        <group position={[-2, 0, -3.4]} scale={door}>
          <mesh position={[0, 0.2, 0]} material={m.marble}>
            <boxGeometry args={[2.6, 0.4, 1.0]} />
          </mesh>
          <mesh position={[0, 2.3, 0]} material={m.gold} castShadow>
            <RoundedBoxGeo args={[1.8, 3.6, 0.16]} radius={0.05} />
          </mesh>
          {[0.9, -0.9].map((y) => (
            <mesh key={y} position={[0, 2.3 + y, 0.1]} material={m.dark}>
              <boxGeometry args={[1.3, 0.05, 0.02]} />
            </mesh>
          ))}
        </group>
      ) : null}

      {/* water jars of the siqayah */}
      {Array.from({ length: 5 }, (_, i) => {
        const s = smooth(prog(jars, i / 7, i / 7 + 0.3));
        return s > 0.01 ? <Jar key={i} p={[6 + i * 1.5, 0, -7 + (i % 2) * 0.8]} s={s * 1.1} /> : null;
      })}

      {/* clues around the spot: ant mound, darker trampled earth, a crow */}
      {clues > 0.01 ? (
        <group>
          <mesh position={[3.4, 0.25, -5]} scale={clues} material={m.ant}>
            <coneGeometry args={[0.9, 0.6, 14]} />
          </mesh>
          <mesh position={[0.8, 0.05, -6.5]} rotation={[-Math.PI / 2, 0, 0]} scale={clues} material={m.stain}>
            <circleGeometry args={[1.5, 20]} />
          </mesh>
          <group position={[-2.4, 0, -4.4]} scale={clues} rotation={[0, 0.6, 0]}>
            <mesh position={[0, 0.45, 0]} material={m.dark} castShadow>
              <capsuleGeometry args={[0.18, 0.4, 4, 10]} />
            </mesh>
            <mesh position={[0.32, 0.62 - peck, 0]} material={m.dark}>
              <sphereGeometry args={[0.14, 10, 8]} />
            </mesh>
            <mesh position={[0.5, 0.6 - peck, 0]} rotation={[0, 0, -Math.PI / 2 - peck]} material={m.dark}>
              <coneGeometry args={[0.05, 0.22, 6]} />
            </mesh>
          </group>
        </group>
      ) : null}

      {/* the shovel works by itself (no figure) */}
      {shovelOn > 0.01 ? (
        <group position={[1.0, Math.max(-12, shovelY), -1.4]} rotation={[0, 0, 0.25]} scale={shovelOn}>
          <mesh position={[0, 1.6, 0]} material={m.wood}>
            <cylinderGeometry args={[0.06, 0.06, 2.8, 8]} />
          </mesh>
          <mesh position={[0, 0.05, 0]} material={m.steel}>
            <boxGeometry args={[0.7, 0.6, 0.06]} />
          </mesh>
        </group>
      ) : null}

      {/* the Ka'bah with the Hijr wall, where the dream came (small, behind) */}
      <group position={[-58, 0, -62]}>
        <mesh position={[0, 6.7, 0]} material={m.kaaba} castShadow receiveShadow>
          <RoundedBoxGeo args={[11, 13, 12]} radius={0.15} />
        </mesh>
        <mesh position={[0, 9, 0]} material={m.gold}>
          <boxGeometry args={[11.06, 0.9, 12.06]} />
        </mesh>
        <mesh position={[-9, 0.6, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={m.marble} castShadow>
          <torusGeometry args={[6, 0.35, 8, 32, Math.PI]} />
        </mesh>
      </group>
    </group>
  );
};

/** dug: kept for clarity of the fill state in overlays */
export const fillOpen = (t: number) => {
  const bury = prog(t, T3.bury + 0.3, T3.bury + 4.5);
  const dig = prog(t, T3.dig, T3.found + 0.6);
  return 1 - bury + bury * dig;
};
