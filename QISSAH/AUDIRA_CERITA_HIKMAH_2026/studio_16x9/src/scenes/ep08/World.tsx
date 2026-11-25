// EP08 3D world: one felt set per shot, the puppets acting out the narration at that moment.
import React from "react";
import * as THREE from "three";
import { clamp01, lerp, smooth, stepT, win } from "../../kits/feltcraft/core/motion";
import { CafeSet, FeltCup, SaltShaker, SaltStream, TABLE_TOP } from "./Cafe.tsx";
import { DEFAULT_POSE, FeltPuppet, type PuppetLook, type PuppetPose } from "./Puppet.tsx";
import { KitchenSet, LetterCloth, MemoryHoop, PartySet, SeaSet } from "./Sets2.tsx";
import { E, LETTER, T, mouthOf, type Shot, type V3 } from "./story.ts";

// ---- cast ----
const MAN: PuppetLook = { skin: "#D9A47A", hair: "#2B1C14", top: "#8A8F5A", topTrim: "#F1E3C6", bottom: "#4B3A2C", shoe: "#2E211A", cheek: "#E8796E", hairStyle: "short" };
const WOMAN: PuppetLook = { skin: "#EBC09A", hair: "#1E1410", top: "#B8394A", topTrim: "#FFE3D6", bottom: "#8E2A3A", shoe: "#5A1E26", cheek: "#F29AA0", hairStyle: "long", flower: "#F7D7DE" };
const WAITER: PuppetLook = { skin: "#C98F66", hair: "#1B1411", top: "#F4F1EA", topTrim: "#2E3B32", bottom: "#262B33", shoe: "#1B1411", cheek: "#E39A86", hairStyle: "short" };
const SUITORS: PuppetLook[] = [
  { skin: "#E6B28C", hair: "#432A1B", top: "#2F6F9E", topTrim: "#F1E3C6", bottom: "#2B2F3A", shoe: "#1B1411", cheek: "#E8968A", hairStyle: "short" },
  { skin: "#B47A52", hair: "#1B1411", top: "#7B4FD6", topTrim: "#FFE3D6", bottom: "#3A2E44", shoe: "#1B1411", cheek: "#D98575", hairStyle: "short" },
  { skin: "#F3CFB3", hair: "#6E4426", top: "#1FA67A", topTrim: "#F1E3C6", bottom: "#2E3B32", shoe: "#2E211A", cheek: "#F0A39A", hairStyle: "short" },
];
const PATRONS: PuppetLook[] = [
  { skin: "#D09A6C", hair: "#2A1C14", top: "#E3B23C", topTrim: "#FFF4DE", bottom: "#5A4632", shoe: "#2E211A", cheek: "#E39A86", hairStyle: "long" },
  { skin: "#91603F", hair: "#1B1411", top: "#3E7C74", topTrim: "#FFF4DE", bottom: "#2E3B32", shoe: "#1B1411", cheek: "#C9806E", hairStyle: "short" },
];
const CHILD: PuppetLook = { skin: "#D9A47A", hair: "#2B1C14", top: "#E8796E", topTrim: "#FFF4DE", bottom: "#3F7BA8", shoe: "#D9A47A", cheek: "#E8796E", hairStyle: "short" };
const FATHER: PuppetLook = { skin: "#C98F66", hair: "#3A2A20", top: "#3F7BA8", topTrim: "#F1E3C6", bottom: "#5A4632", shoe: "#2E211A", cheek: "#D98575", hairStyle: "short" };
const MOTHER: PuppetLook = { skin: "#D9A47A", hair: "#2A1C14", top: "#E3B23C", topTrim: "#B5532F", bottom: "#B5532F", shoe: "#5A1E26", cheek: "#E8968A", hairStyle: "long" };
const VISITOR: PuppetLook = { skin: "#E6B28C", hair: "#432A1B", top: "#3E9C95", topTrim: "#FFF4DE", bottom: "#2F5B5A", shoe: "#2E211A", cheek: "#F29AA0", hairStyle: "long", flower: "#F2B53B" };

/** Age the couple in 4 steps (material caches stay small): hair greys, clothes soften, glasses. */
const AGE_STEPS = 4;
const mix = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
const aged = (look: PuppetLook, age: number, oldHair: string, oldTop: string): PuppetLook => {
  const k = Math.round(clamp01(age) * (AGE_STEPS - 1)) / (AGE_STEPS - 1);
  return { ...look, hair: mix(look.hair, oldHair, k), top: mix(look.top, oldTop, k * 0.8), glasses: look.hairStyle === "short" ? k > 0.5 : undefined, flower: look.flower && k < 0.9 ? look.flower : undefined };
};
const manAt = (age: number) => aged(MAN, age, "#C9C2B6", "#7A6A4E");
const womanAt = (age: number) => aged(WOMAN, age, "#D8D2C8", "#8A4656");

const MAN_POS: V3 = [-0.86, 0, 0.04];
const MAN_YAW = 1.02;
const WOMAN_POS: V3 = [0.86, 0, 0.04];
const WOMAN_YAW = -1.08;
const toWorld = (pos: V3, yaw: number, local: V3) => new THREE.Vector3(...local).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).add(new THREE.Vector3(...pos));
const P = (p: Partial<PuppetPose>): PuppetPose => ({ ...DEFAULT_POSE, ...p });
const arr = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];

const MAN_CUP = toWorld(MAN_POS, MAN_YAW, [0.02, TABLE_TOP, 0.46]);
const WOMAN_CUP = toWorld(WOMAN_POS, WOMAN_YAW, [-0.02, TABLE_TOP, 0.46]);

// ---- lights per set ----
const Lights: React.FC<{ set: Shot["set"]; dim: number }> = ({ set, dim }) => {
  const wide = set === "party" || set === "sea";
  const key =
    set === "sea" ? { pos: [2.5, 5, 4] as V3, col: "#FFF1D8", i: 2.4 } : set === "party" ? { pos: [-2.0, 4.5, 3.5] as V3, col: "#FFD9A8", i: 1.9 * (1 - dim * 0.55) } : set === "kitchen" ? { pos: [-1.8, 4.2, 3.2] as V3, col: "#FFEBCB", i: 2.0 * (1 - dim * 0.4) } : { pos: [2.2, 4.2, 3.6] as V3, col: "#FFE4BC", i: 1.9 };
  const hemi: [string, string, number] = set === "sea" ? ["#E4F1FF", "#E8CF9A", 1.0] : set === "party" ? ["#FFD9B8", "#3F5B3A", 0.8 * (1 - dim * 0.4)] : set === "kitchen" ? ["#FFF1DA", "#8A5E3E", 0.9 * (1 - dim * 0.35)] : ["#FFE3C2", "#6B3E26", 0.85];
  const ext = wide ? 5 : 3;
  return (
    <>
      <hemisphereLight args={hemi} />
      <directionalLight
        position={key.pos}
        intensity={key.i}
        color={key.col}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-ext}
        shadow-camera-right={ext}
        shadow-camera-top={ext}
        shadow-camera-bottom={-1.5}
        shadow-bias={-0.0005}
        shadow-radius={6}
      />
      <directionalLight position={[-2.5, 2.6, -1.2]} intensity={set === "sea" ? 0.6 : 1.0} color="#FFC48A" />
      {(set === "cafe" || set === "kitchen") && <pointLight position={[0, 2.0, 0.3]} intensity={(set === "cafe" ? 3.2 : 1.8) * (1 - dim * 0.5)} distance={4} decay={1.4} color="#FFC27A" />}
      {set === "cafe" && <pointLight position={[0, 1.7, -1.1]} intensity={1.2} distance={3} decay={1.5} color="#FFB070" />}
      {set === "party" && <pointLight position={[-0.6, 2.4, 0.6]} intensity={2.4 * (1 - dim * 0.5)} distance={5} decay={1.4} color="#FFC27A" />}
    </>
  );
};

// ---- scenes ----
const Party: React.FC<{ t: number }> = ({ t }) => {
  const ts = stepT(t);
  const leave = smooth(win(ts, T.s3a, T.s3a + 2.6)); // guests drift out after the party
  const walk = win(ts, T.s3b - 0.4, T.s3c - 0.3); // he crosses to her
  const manX = lerp(1.7, 0.12, smooth(walk));
  const walking = walk > 0 && walk < 1;
  const surprised = ts >= T.s3c && ts < T.s3d;
  const nod = ts >= T.s3d && ts < E.s3d ? Math.sin((ts - T.s3d) * 8) * 0.12 : 0;
  const her = mouthOf("gadis", t);
  const suitorPos: [number, number, number, number][] = [
    [-1.42, 0, -0.1, 1.1],
    [0.02, 0, -0.05, -1.2],
    [-0.25, 0, -0.85, -0.5],
  ];
  const dim = smooth(win(ts, T.s3a, T.s3a + 2));
  return (
    <>
      <Lights set="party" dim={dim} />
      <PartySet t={t} dim={dim} />
      <FeltPuppet
        look={WOMAN}
        pose={P({ seated: false, headYaw: walk > 0.6 ? 0.55 : 0, headPitch: nod, mouth: surprised ? "o" : her ?? "smile", armL: { yaw: 0.1, lift: 0.25, elbow: 0.5 }, armR: { yaw: 0.1, lift: surprised ? 0.9 : 0.25, elbow: surprised ? 1.8 : 0.5 }, blush: walk > 0.9 ? 0.4 : 0.1 })}
        position={[-0.7, 0, -0.25]}
        rotationY={walk > 0.6 ? 0.35 : 0}
      />
      {SUITORS.map((lk, i) => {
        const [x, y, z, yaw] = suitorPos[i];
        const dir = x < -0.7 ? -1 : 1;
        const gone = leave * 3.4;
        const bob = Math.sin(ts * 6 + i) * 0.06;
        return (
          <FeltPuppet
            key={i}
            look={lk}
            pose={P({ seated: false, headYaw: bob, mouth: Math.floor(ts * 2 + i) % 3 === 0 ? "o" : "smile", armL: { yaw: 0.2, lift: i === 1 ? 0.9 + bob : 0.3, elbow: i === 1 ? 1.2 : 0.5 }, armR: { yaw: 0.2, lift: i === 0 ? 1.1 : 0.3, elbow: i === 0 ? 1.4 : 0.5 }, walk: leave > 0 && leave < 1 ? ts * 9 + i : undefined })}
            position={[x + dir * gone, y, z - leave * 0.4]}
            rotationY={leave > 0 ? dir * 1.4 : yaw}
          />
        );
      })}
      <FeltPuppet
        look={MAN}
        pose={P({ seated: false, headYaw: walk === 0 ? 0.25 : 0, headPitch: walk === 0 ? 0.12 : 0, mouth: walk >= 1 ? (Math.floor(ts * 6) % 2 ? "small" : "o") : "flat", worry: 0.8, blush: walk >= 1 ? 0.8 : 0.2, walk: walking ? ts * 10 : undefined, armL: { yaw: 0.2, lift: walk === 0 ? 0.5 : 0.2, elbow: walk === 0 ? 1.3 : 0.4 }, armR: { yaw: 0.2, lift: walk >= 1 ? 0.7 : 0.2, elbow: 0.6 } })}
        position={[manX, 0, -0.2]}
        rotationY={walk > 0 ? -1.45 : -0.75}
      />
    </>
  );
};

/** The café on the first night (and its flashbacks). */
const Cafe: React.FC<{ t: number; scene: string }> = ({ t, scene }) => {
  const ts = stepT(t);
  const flash = scene.startsWith("flash");
  const hook = scene === "hook";
  const second = scene === "cafe2" || scene === "flashCafe2";
  // story state
  const waved = !flash && !hook && !second && ts >= T.s4e + 2.0 && ts < T.s5a;
  const pouring = hook || scene === "flashCafe" || (!second && !flash && ts >= T.s5c && ts < T.s5d);
  const salted = second || flash || hook || ts >= T.s5c;
  const waiterIn = !second && !flash && !hook ? win(ts, E.s4f - 0.6, E.s4f + 1.4) : 0;
  const waiterOut = !second && !flash && !hook ? win(ts, T.s5b, T.s5b + 1.6) : 0;
  const shakerOnTable = !hook && !flash && !second && ts >= E.s4f + 1.4 && !pouring;
  const lookAround = !second && !flash && !hook && ts >= T.s5a && ts < T.s5c ? 1 : 0;
  const tears = scene === "cafe2" ? smooth(win(ts, T.s7a, T.s7a + 1.5)) * (1 - smooth(win(ts, T.s7f, T.s7f + 1))) : 0;
  const warm = scene === "cafe2" && ts >= T.s7f;
  const flashWarm = scene === "flashCafe2";
  const laugh = warm || flashWarm ? Math.floor(ts * 3) % 2 : 0;
  const manTalk = flash ? null : mouthOf("pria", t);
  const herTalk = flash ? null : mouthOf("gadis", t);
  const sip = !hook && !flash && !second && ts >= T.s5c + 2.2 && ts < T.s5d;
  const pour = Math.sin(ts * 9) * 0.06;

  const manPose = P({
    headYaw: pouring ? 0.42 : 0.12,
    headPitch: pouring ? 0.26 : sip ? -0.1 : !second && ts < T.s4e ? 0.32 : 0.05,
    headRoll: pouring ? -0.08 : 0,
    armR: pouring ? { yaw: 0.5, lift: 1.5, elbow: 0.5 } : waved ? { yaw: -0.2, lift: 2.4, elbow: 0.5 + Math.sin(ts * 12) * 0.3 } : sip ? { yaw: 0.4, lift: 1.05, elbow: 1.75 } : { yaw: 0.35, lift: 0.75, elbow: 0.9 },
    armL: { yaw: 0.35, lift: 0.75, elbow: 0.9 },
    blush: second ? 0.3 : !flash && ts >= T.s5a && ts < T.s6a ? 1 : hook || flash ? 1 : 0.5,
    mouth: manTalk ?? (warm || flashWarm ? (laugh ? "smile" : "o") : second ? "small" : "flat"),
    worry: second ? (warm ? 0 : 0.6) : 1,
    lean: second ? 0.12 : 0.08,
    tears,
  });
  const womanPose = P({
    headYaw: lookAround ? -0.15 : -0.05,
    headPitch: 0.06,
    headRoll: scene === "cafe2" && ts >= T.s7b && ts < T.s7c ? 0.24 : 0.16,
    armL: scene === "cafe2" && ts >= T.s7b && ts < T.s7c ? { yaw: 0.9, lift: 0.95, elbow: 1.7 } : { yaw: 0.3, lift: 1.2, elbow: 2.25 },
    armR: { yaw: 0.35, lift: 0.7, elbow: 0.9 },
    blush: second ? 0.7 : 0.2,
    mouth: herTalk ?? (warm || flashWarm ? (laugh ? "o" : "smile") : pouring ? "small" : "smile"),
    worry: -0.3,
    lean: second ? 0.16 : 0.1,
  });

  // shaker in the man's hand during the pour
  const SC = 1.35;
  const shakerPos = MAN_CUP.clone().add(new THREE.Vector3(-0.09, 0.35, 0.07));
  const shakerRot = new THREE.Euler(0, 0.3, -2.35 + pour);
  const cap = new THREE.Vector3(0, 0.16 * SC, 0).applyEuler(shakerRot).add(shakerPos);
  const tableShaker = toWorld(MAN_POS, MAN_YAW, [0.24, TABLE_TOP, 0.38]);

  // waiter walks in from the right with the shaker on a tray, then leaves
  const wx = lerp(2.6, 0.35, smooth(waiterIn)) + waiterOut * 2.4;
  const waiterOn = waiterIn > 0 && waiterOut < 1;
  const patronTurn = lookAround ? 0.9 : 0;
  return (
    <>
      <Lights set="cafe" dim={0} />
      <CafeSet t={t} />
      {/* background patrons who turn to stare (only on the live first-night/second-half shots) */}
      {(scene === "cafe" || scene === "cafe2") && <group position={[-1.85, 0, -1.05]}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.3, 0.72, 24]} />
          <meshPhysicalMaterial color="#F5E6CF" roughness={1} sheen={1} />
        </mesh>
        <FeltPuppet look={PATRONS[0]} pose={P({ headYaw: patronTurn, mouth: lookAround ? "o" : "smile" })} position={[-0.42, 0, 0.0]} rotationY={1.3} scale={0.92} />
        <FeltPuppet look={PATRONS[1]} pose={P({ headYaw: patronTurn * 0.6, headPitch: 0.05, mouth: lookAround ? "o" : "smile" })} position={[0.42, 0, 0.05]} rotationY={-1.0 + patronTurn * 0.4} scale={0.92} />
      </group>}
      <FeltPuppet look={MAN} pose={manPose} position={MAN_POS} rotationY={MAN_YAW} handR={sip ? <FeltCup position={[0, -0.08, 0.05]} t={t} steam={0} /> : undefined} />
      <FeltPuppet look={WOMAN} pose={womanPose} position={WOMAN_POS} rotationY={WOMAN_YAW} />
      {!sip && <FeltCup position={arr(MAN_CUP)} rotY={0.4} t={t} steam={0.6} seed={1} />}
      <FeltCup position={arr(WOMAN_CUP)} rotY={2.6} t={t} steam={0.7} seed={2} />
      {pouring && (
        <>
          <SaltShaker position={arr(shakerPos)} rotation={[shakerRot.x, shakerRot.y, shakerRot.z]} scale={SC} />
          <SaltStream from={cap} to={MAN_CUP.clone().add(new THREE.Vector3(0, 0.13, 0))} t={t} amount={1} />
        </>
      )}
      {(shakerOnTable || (salted && !pouring)) && <SaltShaker position={arr(tableShaker)} scale={1.2} />}
      {waiterOn && (
        <FeltPuppet
          look={WAITER}
          pose={P({ seated: false, walk: waiterIn < 1 || waiterOut > 0 ? ts * 10 : undefined, armR: { yaw: 0.1, lift: 1.2, elbow: 0.6 }, armL: { yaw: 0, lift: 0.2, elbow: 0.3 }, mouth: "smile" })}
          position={[wx, 0, -0.75]}
          rotationY={waiterOut > 0 ? 1.4 : waiterIn < 1 ? -1.4 : -0.3}
          handR={
            waiterIn < 1 ? (
              <group position={[0, -0.03, 0.05]}>
                <mesh>
                  <cylinderGeometry args={[0.12, 0.12, 0.015, 24]} />
                  <meshPhysicalMaterial color="#C9A46E" roughness={0.5} />
                </mesh>
                <SaltShaker position={[0, 0.01, 0]} scale={1.1} />
              </group>
            ) : undefined
          }
        />
      )}
      {scene === "cafe2" && ts >= T.s7e - 0.3 && ts < T.s7f + 0.6 && <MemoryHoop position={[0.3, 1.72, -0.25]} scale={0.62 * smooth(win(ts, T.s7e - 0.3, T.s7e + 0.4))} t={t} />}
    </>
  );
};

const Sea: React.FC<{ t: number }> = ({ t }) => {
  const ts = stepT(t);
  const hop = Math.abs(Math.sin(ts * 4.2)) * 0.12;
  const taste = ts >= T.s6c - 0.2 && ts < T.s6d - 0.2;
  const wave = ts >= T.s6d - 0.2;
  return (
    <>
      <Lights set="sea" dim={0} />
      <SeaSet t={t} />
      <FeltPuppet
        look={CHILD}
        scale={0.62}
        position={[0.3, taste ? 0 : hop, -0.3]}
        rotationY={-0.2}
        pose={P({ seated: false, mouth: taste ? "o" : "smile", headPitch: taste ? -0.15 : 0, worry: taste ? 0.6 : 0, armL: taste ? { yaw: 0.6, lift: 1.4, elbow: 1.9 } : { yaw: 0, lift: 2.3, elbow: 0.3 }, armR: taste ? { yaw: 0, lift: 0.3, elbow: 0.3 } : { yaw: 0, lift: 2.3, elbow: 0.3 } })}
      />
      {/* splash: felt water droplets around the child */}
      {!taste &&
        [0, 1, 2, 3, 4].map((i) => {
          const u = ((ts * 1.6 + i / 5) % 1 + 1) % 1;
          return <mesh key={i} position={[0.3 + Math.cos(i * 1.3) * 0.25 * u, 0.15 + Math.sin(u * Math.PI) * 0.3, -0.3 + Math.sin(i * 1.3) * 0.15]} scale={0.022}><sphereGeometry args={[1, 10, 8]} /><meshPhysicalMaterial color="#BFE3F5" roughness={0.1} clearcoat={1} /></mesh>;
        })}
      <FeltPuppet look={FATHER} position={[-2.35, 0, 0.3]} rotationY={0.6} pose={P({ seated: false, mouth: "smile", armR: wave ? { yaw: -0.3, lift: 2.5, elbow: 0.4 + Math.sin(ts * 10) * 0.35 } : { yaw: 0, lift: 0.2, elbow: 0.3 } })} />
      <FeltPuppet look={MOTHER} position={[-2.0, 0, 0.4]} rotationY={0.4} pose={P({ seated: false, mouth: "smile", armL: wave ? { yaw: 0.2, lift: 2.4, elbow: 0.5 + Math.sin(ts * 10 + 1) * 0.35 } : { yaw: 0.3, lift: 0.4, elbow: 1.2 } })} />
    </>
  );
};

const Kitchen: React.FC<{ t: number; scene: string }> = ({ t, scene }) => {
  const ts = stepT(t);
  // age: young at the wedding, 40 years by the end of s8d; old after that; mid-age in the flashback
  const age = scene === "years" ? smooth(win(ts, T.s8d - 0.2, E.s8d + 0.6)) : scene === "flashKitchen" ? 0.4 : 1;
  const year = scene === "years" ? 1 + 39 * smooth(win(ts, T.s8d - 0.2, E.s8d + 0.6)) : 40;
  const husband = scene === "years" || scene === "flashKitchen";
  const dim = scene === "alone" || scene === "letter" || scene === "reading" ? 1 : 0;
  const woman = womanAt(age);
  const man = manAt(age);
  const pourSalt = scene === "years" && ts >= T.s8b && ts < T.s8d - 0.2;
  const slide = scene === "years" ? smooth(win(ts, T.s8c, T.s8c + 1.2)) : 1;
  // her cup in front of her; his cup slides from her side to his after she salts it
  const hisCup = new THREE.Vector3().lerpVectors(WOMAN_CUP.clone().add(new THREE.Vector3(-0.24, 0, 0.1)), MAN_CUP, slide);
  const sipK = scene === "flashKitchen" ? win(ts, T.s10i, T.s10i + 4) : 0;
  const sipping = sipK > 0.05 && sipK < 0.6;
  const reading = scene === "letter" || scene === "reading" || scene === "alone";
  const letterId = ["s11a", "s10k", "s10h", "s10b", "s10a"].find((id) => ts >= T[id] - 0.3) ?? "s10a";
  const phrase = LETTER[letterId] ?? "";
  const prog = win(ts, T[letterId] - 0.2, Math.min(E[letterId], T[letterId] + 3.5));
  const wet = smooth(win(ts, T.s11a, E.s11a + 0.5));
  const tears = scene === "reading" ? (ts >= T.s10j - 0.2 ? 1 : 0.4) : scene === "visitor" ? (ts >= T.s11c ? 1 : 0) : 0;
  const herTalk = mouthOf("gadis", t);
  const visitorTalk = scene === "visitor" && ts >= T.s11b && ts < E.s11b ? (Math.floor(ts * 6) % 2 ? "o" : "small") : null;
  const SC = 1.2;
  const shakerPos = hisCup.clone().add(new THREE.Vector3(0.08, 0.34, 0.06));
  const shakerRot = new THREE.Euler(0, -0.3, 2.35 + Math.sin(ts * 9) * 0.06);
  const cap = new THREE.Vector3(0, 0.16 * SC, 0).applyEuler(shakerRot).add(shakerPos);
  const restShaker = new THREE.Vector3(0.05, TABLE_TOP, -0.12);
  const letterOnTable = scene === "alone" || scene === "letter" || scene === "reading";

  return (
    <>
      <Lights set="kitchen" dim={dim} />
      <KitchenSet t={t} year={year} />
      {husband && (
        <FeltPuppet
          look={man}
          position={MAN_POS}
          rotationY={MAN_YAW}
          pose={P({
            headPitch: sipping ? -0.12 : 0.05,
            mouth: sipping ? "flat" : "smile",
            worry: sipping ? 1 : 0,
            armR: sipping ? { yaw: 0.4, lift: 1.05, elbow: 1.75 } : { yaw: 0.35, lift: 0.75, elbow: 0.9 },
            armL: { yaw: 0.35, lift: 0.75, elbow: 0.9 },
            lean: 0.1,
            blush: 0.3,
          })}
          handR={sipping ? <FeltCup position={[0, -0.08, 0.05]} t={t} steam={0} /> : undefined}
        />
      )}
      {scene === "visitor" && <FeltPuppet look={VISITOR} position={MAN_POS} rotationY={MAN_YAW} pose={P({ mouth: visitorTalk ?? "smile", headRoll: 0.1, armL: { yaw: 0.3, lift: 1.2, elbow: 2.2 } })} />}
      <FeltPuppet
        look={woman}
        position={WOMAN_POS}
        rotationY={WOMAN_YAW}
        pose={P({
          headPitch: reading ? 0.38 : 0.06,
          headYaw: reading ? 0.12 : -0.05,
          mouth: herTalk ?? (reading ? "flat" : "smile"),
          eyes: scene === "visitor" && ts >= T.s11d ? 0.45 : 1,
          armL: pourSalt ? { yaw: 0.5, lift: 1.35, elbow: 0.6 } : reading ? { yaw: 0.45, lift: 0.95, elbow: 0.8 } : { yaw: 0.35, lift: 0.75, elbow: 0.9 },
          armR: reading ? { yaw: 0.45, lift: 0.95, elbow: 0.8 } : { yaw: 0.35, lift: 0.7, elbow: 0.9 },
          blush: 0.4,
          tears,
          lean: reading ? 0.2 : 0.1,
        })}
      />
      {/* cups: his (salted every morning) and hers */}
      {(husband || scene === "hikmah" || scene === "alone" || scene === "letter" || scene === "visitor") && !sipping && <FeltCup position={arr(hisCup)} rotY={0.4} t={t} steam={husband ? 0.6 : scene === "hikmah" ? 0.5 : 0} seed={3} />}
      <FeltCup position={arr(WOMAN_CUP)} rotY={2.6} t={t} steam={0.6} seed={4} />
      {pourSalt ? (
        <>
          <SaltShaker position={arr(shakerPos)} rotation={[shakerRot.x, shakerRot.y, shakerRot.z]} scale={SC} />
          <SaltStream from={cap} to={hisCup.clone().add(new THREE.Vector3(0, 0.13, 0))} t={t} amount={1} />
        </>
      ) : (
        <SaltShaker position={arr(restShaker)} scale={1.2} />
      )}
      {letterOnTable && <LetterCloth phrase={phrase} progress={scene === "letter" ? prog : 1} wet={wet} position={[0.02, TABLE_TOP + 0.03, 0.2]} rotation={[-1.25, 0, 0]} scale={1} />}
      {/* tear beads falling onto the letter */}
      {scene === "letter" && ts >= T.s11a && ts < E.s11a + 1 &&
        [0, 1].map((i) => {
          const u = ((ts - T.s11a) * 0.8 + i * 0.5) % 1;
          return (
            <mesh key={i} position={[-0.1 + i * 0.22, TABLE_TOP + 0.45 - u * 0.4, 0.25 - i * 0.05]} scale={[0.014, 0.02, 0.014]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshPhysicalMaterial color="#BFE3F5" roughness={0.05} clearcoat={1} emissive="#7FB8D8" emissiveIntensity={0.3} />
            </mesh>
          );
        })}
    </>
  );
};

export const World: React.FC<{ t: number; shot: Shot }> = ({ t, shot }) => {
  if (shot.set === "party") return <Party t={t} />;
  if (shot.set === "sea") return <Sea t={t} />;
  if (shot.set === "kitchen") return <Kitchen t={t} scene={shot.scene} />;
  return <Cafe t={t} scene={shot.scene} />;
};
