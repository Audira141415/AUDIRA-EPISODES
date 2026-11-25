// Station 0 (x = 0): the cover set. Hook (c00), intro (c01), the payoff "layers of history" (c09)
// and the quiet end-screen shot all happen here, on black kiswah silk with the gold hizam band.
import React, { useMemo } from "react";
import * as THREE from "three";
import { CARDS, ThreadCard } from "./KiswahCover.tsx";
import { Band } from "./band.tsx";
import { brocadeTex, Camel, feltTex, palmTex, PAL, silkMat, Tag, weaveTex } from "./kit.tsx";
import { CH, clamp, ease, lerp, pop, W } from "./tl.ts";

const H = "c00_hook";
const P = "c09_payoff";

/** Stitch progress of the hook band (local x), anchored to the hook and intro words. */
export const bandX0 = (t: number) => {
  const a = CH(H).start;
  const b = CH("c01_intro").end;
  const base = lerp(-0.35, 1.9, clamp((t - a) / (b - a)));
  // payoff: the band races on ("kerja ... pengrajin") and keeps going through the end screen
  const race = ease(t, W(P, "kerja"), 6) * 1.2 + clamp((t - W(P, "kerja") - 6) / 60) * 0.6;
  return base + race;
};

const Layer: React.FC<{ y: number; k: number; mat: THREE.Material; w?: number; d?: number; rot?: number }> = ({ y, k, mat, w = 0.52, d = 0.36, rot = 0 }) => {
  if (k <= 0.001) return null;
  return (
    <mesh position={[0, y + (1 - k) * 0.5, 0]} rotation={[0, rot, 0]} scale={[1, 1, 1]} castShadow receiveShadow>
      <boxGeometry args={[w, 0.022, d]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};

export const Station0: React.FC<{ t: number }> = ({ t }) => {
  const hookStack = useMemo(
    () => ["#6B4A2E", "#A88B5E", "#7A2A1E", "#E5D6B4", "#3B4A6E", "#8A6A3E", "#5A3A28", "#C9B28A"].map((c, i) => silkMat(c, weaveTex(c, 40 + i, [2, 2], 6))),
    [],
  );
  // payoff layers, in the order the narration names them
  const payoff = useMemo(() => {
    const palm = palmTex();
    return [
      { word: "anyaman", mat: new THREE.MeshStandardMaterial({ map: palm.map, bumpMap: palm.bump, bumpScale: 1, roughness: 0.9 }) },
      { word: "linen", mat: silkMat(PAL.white, weaveTex(PAL.white, 51, [3, 3], 6)) },
      { word: "brokat", mat: silkMat(PAL.red, brocadeTex(PAL.red, "rgba(255,200,170,0.35)")) },
      { word: "hijau", mat: silkMat(PAL.green, weaveTex(PAL.green, 53, [3, 3], 6)) },
      { word: "hitam#1", mat: silkMat("#141214", brocadeTex("#141214", "rgba(90,80,90,0.6)")) },
      { word: "darurat", mat: new THREE.MeshStandardMaterial({ ...(() => { const f = feltTex(PAL.wool, 57); return { map: f.map, bumpMap: f.bump }; })(), roughness: 1 }) },
    ];
  }, []);

  const tHook = CH(H).start;
  const tPay = CH(P).start;
  // hook stack: drops at "ditumpuk", lifts away at the end of the intro
  const tStack = W(H, "ditumpuk");
  const stackGone = ease(t, CH("c01_intro").end - 1, 1.2);
  // camel caravan along the carrier thread, then the delivery that does not come
  const tCamel = W(H, "unta");
  const camelX = lerp(-1.9, -0.5, ease(t, W(H, "diarak") - 0.6, 4.5));
  const camelGone = 1 - ease(t, W(H, "tidak", 1), 1.0);
  const cardLift = (word: string) => (word ? pop(t, W(H, word), 0.5) * (1 - ease(t, W(H, "pernah", 3), 0.8) * 0.6) : 0);
  const cardWords = ["putih", "merah", "hijau", ""];

  return (
    <group>
      <Band pos={[0, 0, 0]} X={bandX0(t)} />
      {CARDS.map((c, i) => (
        <group key={c.name} position={[0, 0.06 * cardLift(cardWords[i]), 0]}>
          <ThreadCard x={0.25 + (i - 1.5) * 0.42} z={0.9} color={c.color} seed={i + 1} />
        </group>
      ))}
      {/* hook: cloth piled layer on layer */}
      <group position={[1.75, 0.012, 0.95]} rotation={[0, -0.25, 0]} scale={1 - stackGone}>
        {hookStack.map((m, i) => (
          <Layer key={i} y={0.012 + i * 0.024} k={ease(t, tStack + i * 0.22, 0.45)} mat={m} rot={Math.sin(i * 2.1) * 0.06} />
        ))}
      </group>
      {/* the caravan that carried the kiswah, walking along the gold carrier thread */}
      {t > tCamel - 0.5 && camelGone > 0.01 && (
        <group scale={camelGone}>
          <Camel pos={[camelX, 0, 1.62]} t={t} walk={1 - ease(t, W(H, "kirimannya"), 0.6)} scale={0.55} mahmal />
          <Camel pos={[camelX - 0.55, 0, 1.62]} t={t + 0.3} walk={1 - ease(t, W(H, "kirimannya"), 0.6)} scale={0.5} />
        </group>
      )}
      {/* hook callouts (script text only) */}
      <Tag pos={[-1.05, 0.05, -0.85]} lines={["lebih dari 1 ton"]} t={t} at={W(H, "ton")} until={W(H, "dulu")} w={0.95} />
      <Tag pos={[0.95, 0.05, -0.85]} lines={["bukan emas?", "perak, disepuh emas"]} t={t} at={W(H, "bukan")} until={W(H, "dulu")} w={1.05} accent />
      <Tag pos={[-0.2, 0.05, 1.75]} lines={["Mesir", "kain diarak dengan unta"]} t={t} at={W(H, "mesir")} until={W(H, "suatu")} w={1.1} />
      <Tag pos={[-1.2, 0.05, 1.7]} lines={["kiriman tidak datang"]} t={t} at={W(H, "datang")} until={CH("c01_intro").start + 2} w={1.1} accent />
      {/* intro title on the cloth */}
      <Tag pos={[1.05, 0.05, -0.55]} lines={["KISWAH", "kain penutup Ka'bah"]} t={t} at={W("c01_intro", "kiswah")} until={CH("c01_intro").end} w={1.5} accent />
      {/* payoff: layers of history land one by one */}
      <group position={[-1.75, 0.012, 0.95]} rotation={[0, 0.2, 0]}>
        {payoff.map((p, i) => (
          <Layer key={p.word} y={0.012 + i * 0.026} k={t > tPay ? ease(t, W(P, p.word.split("#")[0], Number(p.word.split("#")[1] ?? 0)), 0.5) : 0} mat={p.mat} w={0.58} d={0.42} rot={Math.sin(i * 1.7) * 0.08} />
        ))}
      </group>
      <Tag pos={[-1.75, 0.05, 0.25]} lines={["lapisan sejarah"]} t={t} at={W(P, "lapisan")} until={W(P, "menurutmu")} w={0.9} accent />
      <Tag pos={[-0.2, 0.05, 1.72]} lines={["desa-desa delta Nil"]} t={t} at={W(P, "desadesa")} until={W(P, "kiswah")} w={1.0} />
      <Tag pos={[1.1, 0.05, 1.72]} lines={["± 150 pengrajin", "hampir setahun"]} t={t} at={W(P, "pengrajin")} until={W(P, "menurutmu")} w={1.0} />
      {void tHook}
    </group>
  );
};
