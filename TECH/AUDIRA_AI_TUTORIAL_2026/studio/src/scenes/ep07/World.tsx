// EP07 3D world: the cover's paper warung + see-through phone, animated over the VO clock.
// The phone starts as an empty shell, is assembled on "Kirim" (36.5 s), gets bigger keys after
// "Select & ask" (61 s), prints a receipt when the owner tests it, and hosts the two warnings.
// A second set (SET_B) is the "Canvas" workshop for KONTEKS, where outputs pop on their words.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ToyPerson, poseAt, type Pose } from "../../core/polish/Person.tsx";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette.ts";
import { D, DashArrow, Decal, H, IBox, INK, KEYS, KEY_X, KEY_Y, Receipt, Shelf, W, bands, buildTextures, inkMat, toon } from "./Cover.tsx";
import { tileTexture } from "./textures.ts";
import { boardTexture, dataBoxTexture, docTexture, emptyScreenTexture, filmBubbleTexture, labelTexture, quizTexture, slideTexture, webTexture } from "./filmTextures.ts";
import { DATA_BOX_LOCAL, SET_B, SET_B_ROT, applyCam, toWorld, type V3 } from "./camera.ts";

const PHONE_ROT = 0.42;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const sm = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const outBack = (x: number, s = 1.7) => {
  const c = clamp01(x) - 1;
  return 1 + (s + 1) * c * c * c + s * c * c;
};

// ---- beats (VO seconds, timeline.json) -------------------------------------------------------
export const T_BUBBLE = 6.19; // "pakai Canvas"
export const T_BUILD = 36.55; // "Kirim"
export const T_PLACE5 = 37.95; // claw drops the last key ("dirakit")
export const T_BIG = 61.05; // "memperbarui"
export const T_PRESS = [63.55, 64.35]; // "mengetesnya lagi"
export const T_PRINT = 64.1;
export const ITEM_T = [13.54, 14.45, 15.1, 15.77, 16.81, 18.5]; // dokumen, slide, kuis, infografis, web, aplikasi
export const T_LENS = 71.7; // "Tapi ingat"
export const T_BOX = 76.65; // "Dan jangan"
export const T_NO = 77.05;

const FilmTex = () => {
  const base = buildTextures();
  return {
    base,
    empty: emptyScreenTexture(),
    board: boardTexture(),
    bubble: filmBubbleTexture(),
    doc: docTexture(),
    slide: slideTexture(),
    quiz: quizTexture(),
    web: webTexture(),
    data: dataBoxTexture(),
    labels: ["DOKUMEN", "SLIDE", "KUIS", "INFOGRAFIS", "HALAMAN WEB", "APLIKASI"].map((s, i) => labelTexture(s, i === 5 ? (P.bodyCoral as string) : (INK as string))),
    tiles: ["barang", "harga", "tombol", "total"].map((w) => tileTexture(w, "#FFFFFF")),
  };
};
type FT = ReturnType<typeof FilmTex>;

/** Part drop: 0 = hanging 2.2 above and invisible, 1 = seated. */
const drop = (t: number, at: number, dur = 0.32) => {
  const k = ramp(t, at, at + dur);
  return { k, y: (1 - outBack(k, 1.2)) * 2.2, s: k <= 0 ? 0 : 0.6 + 0.4 * sm(k * 1.4) };
};

// ---- the phone (cover structure, animated) ---------------------------------------------------
const FilmPhone: React.FC<{ t: number; f: number; tx: FT }> = ({ t, f, tx }) => {
  const tex = tx.base;
  const built = t >= T_BUILD;
  const spin = f * 0.05;
  const belt = built ? ((t - T_BUILD) * 0.24) % 0.42 : 0;
  const big = 1 + 0.18 * sm(ramp(t, T_BIG, T_BIG + 0.7));
  const press = T_PRESS.reduce((m, p) => Math.max(m, 1 - Math.abs(t - p - 0.08) / 0.16), 0);
  const disp = drop(t, T_BUILD + 0.05);
  const beltIn = drop(t, T_BUILD + 0.2);
  const printer = drop(t, T_BUILD + 0.5);
  // claw: hangs high, descends with key 5 to its slot, releases, rises
  const clawDown = sm(ramp(t, T_PLACE5 - 0.55, T_PLACE5));
  const clawUp = sm(ramp(t, T_PLACE5 + 0.1, T_PLACE5 + 0.6));
  const clawY = 3.25 - clawDown * 0.65 + clawUp * 0.9;
  const placed = t >= T_PLACE5;
  let keyIdx = 0;
  return (
    <group>
      {/* shell: back, tray, traces, rails, chin with AUDIRA plate */}
      <IBox args={[W, H, 0.12]} color={P.bodyCoral} position={[0, H / 2, -D / 2 + 0.06]} radius={0.22} />
      <mesh position={[0, H / 2, -D / 2 + 0.125]}>
        <planeGeometry args={[W - 0.36, H - 0.5]} />
        <meshBasicMaterial color="#EFE8D8" toneMapped={false} />
      </mesh>
      {[0.6, 0.95, 2.95, 3.2].map((y, i) => (
        <mesh key={i} position={[i % 2 ? 0.25 : -0.2, y, -D / 2 + 0.13]}>
          <planeGeometry args={[1.5, 0.025]} />
          <meshBasicMaterial color={P.shadowBlue} toneMapped={false} />
        </mesh>
      ))}
      {/* empty slots before assembly: dashed blue outlines on the tray */}
      {!built &&
        KEYS.map((row, r) =>
          row.map((k, c) => (
            <mesh key={k} position={[KEY_X[c], KEY_Y[r], -D / 2 + 0.135]}>
              <planeGeometry args={[0.46, 0.3]} />
              <meshBasicMaterial color={P.shadowBlue} transparent opacity={0.45} toneMapped={false} />
            </mesh>
          )),
        )}
      <IBox args={[0.18, H, D]} color={P.bodyCoral} position={[-W / 2 + 0.09, H / 2, 0]} radius={0.08} />
      <IBox args={[0.18, H, D]} color={P.bodyCoral} position={[W / 2 - 0.09, H / 2, 0]} radius={0.08} />
      <IBox args={[W, 0.2, D]} color={P.bodyCoral} position={[0, H - 0.1, 0]} radius={0.08} />
      <IBox args={[W, 0.36, D]} color={P.bodyCoral} position={[0, 0.18, 0]} radius={0.1}>
        <IBox args={[0.9, 0.2, 0.04]} color={INK} position={[-0.5, 0.0, D / 2 + 0.01]} radius={0.03} out={0.012} />
        <Decal map={tex.audira} w={0.84} h={0.16} z={D / 2 + 0.035} position={[-0.5, 0]} />
        <IBox args={[0.62, 0.07, 0.04]} color={INK} position={[0.45, 0.02, D / 2 + 0.005]} radius={0.02} out={0.01} />
      </IBox>
      <IBox args={[0.06, 0.5, 0.14]} color={P.metalSteel} position={[W / 2 + 0.03, 3.4, 0]} radius={0.025} out={0.014} />

      {/* display: empty frame until the app drops in */}
      {!built || disp.k <= 0 ? (
        <mesh position={[0, 3.78, -D / 2 + 0.14]}>
          <planeGeometry args={[1.8, 0.86]} />
          <meshBasicMaterial map={tx.empty} toneMapped={false} />
        </mesh>
      ) : (
        <group position={[0, 3.78 + disp.y, -0.04]} scale={disp.s}>
          <IBox args={[1.9, 0.98, 0.14]} color={P.accentYellow} radius={0.06}>
            <Decal map={tex.screen} w={1.72} h={0.82} z={0.075} />
          </IBox>
        </group>
      )}

      {/* belt + blocks */}
      {beltIn.k > 0 && (
        <group position={[0, beltIn.y, 0]}>
          <IBox args={[1.5, 0.08, 0.26]} color={INK} position={[-0.15, 2.82, -0.02]} radius={0.03} out={0.01} />
          {[0, 1, 2, 3].map((i) => {
            const x = -0.82 + i * 0.42 + belt;
            const col = [P.bodyMint, "#FFFFFF", P.accentYellow, P.bodyCoral][i];
            return x < 0.5 ? <IBox key={i} args={[0.2, 0.2, 0.2]} color={col} position={[x, 2.97, -0.02]} radius={0.04} out={0.016} /> : null;
          })}
        </group>
      )}
      {/* gears (always turning: the machine is alive even when empty) */}
      {[[-0.95, 2.82, 0.16, 1], [0.68, 2.82, 0.13, -1.3]].map(([x, y, r, s], i) => (
        <group key={i} position={[x, y, 0.05]} rotation={[Math.PI / 2, spin * s, 0]}>
          <mesh material={toon(P.metalSteel)}>
            <cylinderGeometry args={[r, r, 0.08, 10]} />
          </mesh>
          <mesh material={inkMat}>
            <cylinderGeometry args={[r + 0.02, r + 0.02, 0.1, 10]} />
          </mesh>
        </group>
      ))}

      {/* keypad: keys drop in one by one; "5" comes from the claw */}
      {KEYS.map((row, r) =>
        row.map((k, c) => {
          if (k === "5") {
            return placed ? (
              <IBox key={k} args={[0.5 * big, 0.34 * big, 0.16]} color="#FFFFFF" position={[KEY_X[c] * big, 1.7 + (KEY_Y[r] - 1.7) * big, 0]} radius={0.06} out={0.018}>
                <Decal map={tex.keys[k]} w={0.42 * big} h={0.28 * big} z={0.082} />
              </IBox>
            ) : null;
          }
          const d = drop(t, T_BUILD + 0.3 + keyIdx++ * 0.07, 0.28);
          if (d.k <= 0) return null;
          const pressed = k === "=" ? press : 0;
          const bg = k === "=" ? P.accentYellow : k === "C" ? P.bodyCoral : r === 3 ? P.bodyMint : "#FFFFFF";
          // bigger keys spread from the keypad centre (y 1.7) so they never overlap
          const y = 1.7 + (KEY_Y[r] - 1.7) * big;
          return (
            <group key={k} position={[KEY_X[c] * big, y + d.y, -pressed * 0.07]} scale={d.s}>
              <IBox args={[0.5 * big, 0.34 * big, 0.16]} color={bg} radius={0.06} out={0.018}>
                <Decal map={tex.keys[k]} w={0.42 * big} h={0.28 * big} z={0.082} />
              </IBox>
            </group>
          );
        }),
      )}
      {/* claw with key 5 */}
      {t < T_PLACE5 + 0.7 && t > T_BUILD && (
        <group position={[0.0, clawY, 0.06]}>
          <IBox args={[0.06, 0.6, 0.06]} color={P.metalSteel} position={[0, 0.3, 0]} radius={0.02} out={0.012} />
          <IBox args={[0.42, 0.06, 0.08]} color={P.metalSteel} position={[0, 0.0, 0]} radius={0.02} out={0.012} />
          <IBox args={[0.05, 0.16, 0.08]} color={P.metalSteel} position={[-0.21 - clawUp * 0.06, -0.08, 0]} radius={0.02} out={0.012} />
          <IBox args={[0.05, 0.16, 0.08]} color={P.metalSteel} position={[0.21 + clawUp * 0.06, -0.08, 0]} radius={0.02} out={0.012} />
          {!placed && (
            <IBox args={[0.38, 0.28, 0.16]} color="#FFFFFF" position={[0, -0.2, 0.04]} radius={0.05} out={0.018} rotation={[0, 0, 0.12 * (1 - clawDown)]}>
              <Decal map={tex.keys["5"]} w={0.32} h={0.24} z={0.082} />
            </IBox>
          )}
        </group>
      )}
      {/* printer */}
      {printer.k > 0 && (
        <group position={[0.2, 0.6 + printer.y, -0.04]} scale={printer.s}>
          <IBox args={[1.5, 0.34, 0.2]} color={P.metalSteel} radius={0.06}>
            <IBox args={[0.7, 0.06, 0.04]} color={INK} position={[0.25, 0.04, 0.1]} radius={0.02} out={0.01} />
          </IBox>
        </group>
      )}

      {/* glass front */}
      <mesh position={[0, H / 2 + 0.08, D / 2]}>
        <planeGeometry args={[W - 0.36, H - 0.56]} />
        <meshBasicMaterial color="#D8ECF7" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
      </mesh>
      {[[-0.55, 3.55, 0.12], [-0.3, 1.5, 0.06]].map(([x, y, w], i) => (
        <mesh key={i} position={[x, y, D / 2 + 0.005]} rotation={[0, 0, 0.62]}>
          <planeGeometry args={[w, 1.1]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {/* hopper */}
      <group position={[0.55, H + 0.18, 0]}>
        <mesh material={toon(P.metalSteel)}>
          <cylinderGeometry args={[0.36, 0.16, 0.36, 20, 1, true]} />
        </mesh>
        <mesh material={inkMat}>
          <cylinderGeometry args={[0.39, 0.18, 0.39, 20, 1, true]} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.33, 0.39, 32]} />
          <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

// ---- prompt bubble (film text) ---------------------------------------------------------------
const FilmBubble: React.FC<{ t: number; tx: FT }> = ({ t, tx }) => {
  const s = outBack(ramp(t, T_BUBBLE, T_BUBBLE + 0.45));
  if (s <= 0.001 || t > 81.3) return null;
  const bob = Math.sin(t * 1.5) * 0.04;
  return (
    <group position={[-1.54, 5.42 + bob, 1.39]} rotation={[0, 0.785, 0]} scale={s}>
      <IBox args={[3.1, 1.12, 0.22]} color="#FFFFFF" radius={0.2}>
        <Decal map={tx.bubble} w={2.86} h={1.0} z={0.112} />
      </IBox>
      <group position={[1.1, -0.66, 0]} rotation={[0, 0, 0.6]}>
        <mesh material={toon("#FFFFFF")}>
          <coneGeometry args={[0.17, 0.42, 3]} />
        </mesh>
        <mesh material={inkMat} scale={1.15}>
          <coneGeometry args={[0.17, 0.42, 3]} />
        </mesh>
      </group>
    </group>
  );
};

// ---- word tiles flying from the bubble into the hopper on "Kirim" -------------------------------
const FROM: V3 = [-0.6, 5.3, 0.9];
const HOPPER: V3 = toWorld([0.55, H + 0.3, 0]);
const Tiles: React.FC<{ t: number; tx: FT }> = ({ t, tx }) => (
  <>
    {tx.tiles.map((map, i) => {
      const a = T_BUILD - 0.25 + i * 0.16;
      const k = ramp(t, a, a + 0.7);
      if (k <= 0 || k >= 1) return null;
      const e = sm(k);
      const x = FROM[0] + (HOPPER[0] - FROM[0]) * e + (i - 1.5) * 0.25 * (1 - e);
      const z = FROM[2] + (HOPPER[2] - FROM[2]) * e;
      const y = FROM[1] + (HOPPER[1] - FROM[1]) * e + Math.sin(e * Math.PI) * 0.9;
      const block = sm(ramp(k, 0.45, 0.8)); // tile folds into a block before it drops in
      return (
        <group key={i} position={[x, y, z]} rotation={[0.2 * i, 0.785 + e * 2, 0.3 - e * 0.6]}>
          {block < 1 && (
            <IBox args={[0.62 * (1 - block * 0.5), 0.27, 0.05 + block * 0.2]} color="#FFFFFF" radius={0.04} out={0.016}>
              {block < 0.5 && <Decal map={map} w={0.58} h={0.24} z={0.028} />}
            </IBox>
          )}
          {block >= 1 && <IBox args={[0.3, 0.26, 0.24]} color={[P.bodyMint, P.accentYellow, P.bodyCoral, "#FFFFFF"][i]} radius={0.05} out={0.016} />}
        </group>
      );
    })}
  </>
);

// ---- KONTEKS workshop -------------------------------------------------------------------------
const ItemPop: React.FC<{ t: number; at: number; x: number; label: THREE.Texture; children: React.ReactNode }> = ({ t, at, x, label, children }) => {
  const k = ramp(t, at - 0.05, at + 0.4);
  if (k <= 0) return null;
  const s = outBack(k, 2.2);
  const spin = (1 - sm(k)) * 1.6;
  return (
    <group position={[x, 0, 0.95]} scale={0.85}>
      <group scale={s} rotation={[0, spin, 0]} position={[0, (1 - sm(k)) * 0.8, 0]}>
        {children}
      </group>
      <group position={[0, 0.12, 0.62]} rotation={[-0.5, 0, 0]} scale={sm(k)}>
        <IBox args={[0.92, 0.23, 0.05]} color={INK} radius={0.03} out={0.012}>
          <Decal map={label} w={0.88} h={0.21} z={0.028} />
        </IBox>
      </group>
    </group>
  );
};

const Workshop: React.FC<{ t: number; tx: FT }> = ({ t, tx }) => {
  const x = [-2.1, -1.27, -0.42, 0.42, 1.27, 2.1];
  return (
    <group position={SET_B} rotation={[0, SET_B_ROT, 0]}>
      <IBox args={[7.0, 0.2, 2.9]} color="#E9DFC8" position={[0, -0.1, 0.45]} radius={0.06} />
      {/* easel board */}
      <IBox args={[3.8, 2.38, 0.14]} color="#FFFDF6" position={[0, 2.05, -0.9]} radius={0.08}>
        <Decal map={tx.board} w={3.6} h={2.25} z={0.075} />
      </IBox>
      <IBox args={[0.12, 1.0, 0.12]} color="#A8713F" position={[-1.4, 0.45, -0.9]} radius={0.03} />
      <IBox args={[0.12, 1.0, 0.12]} color="#A8713F" position={[1.4, 0.45, -0.9]} radius={0.03} />
      {/* outputs */}
      <ItemPop t={t} at={ITEM_T[0]} x={x[0]} label={tx.labels[0]}>
        <IBox args={[0.7, 0.92, 0.06]} color="#FFFFFF" position={[0, 0.66, 0]} rotation={[0, 0, 0.05]} radius={0.03} out={0.016}>
          <Decal map={tx.doc} w={0.64} h={0.86} z={0.032} />
        </IBox>
      </ItemPop>
      <ItemPop t={t} at={ITEM_T[1]} x={x[1]} label={tx.labels[1]}>
        <IBox args={[0.9, 0.58, 0.06]} color="#FFFFFF" position={[0, 0.82, 0]} radius={0.03} out={0.016}>
          <Decal map={tx.slide} w={0.84} h={0.53} z={0.032} />
        </IBox>
        <IBox args={[0.06, 0.55, 0.06]} color={P.metalSteel} position={[0, 0.3, -0.05]} radius={0.02} out={0.012} />
        <IBox args={[0.5, 0.05, 0.3]} color={P.metalSteel} position={[0, 0.03, -0.05]} radius={0.02} out={0.012} />
      </ItemPop>
      <ItemPop t={t} at={ITEM_T[2]} x={x[2]} label={tx.labels[2]}>
        <IBox args={[0.66, 0.76, 0.06]} color={P.bodyMint} position={[0, 0.58, 0]} rotation={[0, 0, -0.06]} radius={0.04} out={0.016}>
          <Decal map={tx.quiz} w={0.58} h={0.66} z={0.032} />
        </IBox>
      </ItemPop>
      <ItemPop t={t} at={ITEM_T[3]} x={x[3]} label={tx.labels[3]}>
        {[[-0.24, 0.42, P.bodyMint], [0, 0.72, P.accentYellow], [0.24, 1.0, P.bodyCoral]].map(([bx, h, col], i) => {
          const g = sm(ramp(t, ITEM_T[3] + 0.15 + i * 0.12, ITEM_T[3] + 0.5 + i * 0.12));
          return <IBox key={i} args={[0.2, (h as number) * Math.max(0.05, g), 0.2]} color={col as string} position={[bx as number, ((h as number) * Math.max(0.05, g)) / 2 + 0.06, 0]} radius={0.03} out={0.016} />;
        })}
        <IBox args={[0.8, 0.06, 0.34]} color={P.metalSteel} position={[0, 0.03, 0]} radius={0.02} out={0.012} />
      </ItemPop>
      <ItemPop t={t} at={ITEM_T[4]} x={x[4]} label={tx.labels[4]}>
        <IBox args={[0.9, 0.66, 0.06]} color="#FFFFFF" position={[0, 0.6, 0]} radius={0.03} out={0.016}>
          <Decal map={tx.web} w={0.84} h={0.61} z={0.032} />
        </IBox>
      </ItemPop>
      <ItemPop t={t} at={ITEM_T[5]} x={x[5]} label={tx.labels[5]}>
        <IBox args={[0.58, 1.06, 0.12]} color={P.bodyCoral} position={[0, 0.6, 0]} radius={0.08}>
          <Decal map={tx.base.screen} w={0.46} h={0.3} z={0.062} position={[0, 0.28]} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <mesh key={`${r}${c}`} position={[-0.14 + c * 0.14, 0.0 - r * 0.12, 0.062]}>
                <planeGeometry args={[0.11, 0.09]} />
                <meshBasicMaterial color={r === 2 && c === 2 ? P.accentYellow : "#FFFFFF"} toneMapped={false} />
              </mesh>
            )),
          )}
        </IBox>
      </ItemPop>
    </group>
  );
};

// ---- warnings: magnifier over the receipt, customer-data box with a "no" sign -------------------
const Lens: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, T_LENS, T_LENS + 0.45);
  if (k <= 0 || t > 81.3) return null;
  const s = outBack(k);
  const sweep = Math.sin((t - T_LENS) * 0.9) * 0.12;
  return (
    <group position={[0.45 + sweep, 0.62, 1.2]} rotation={[-1.05, 0, 0.3]} scale={s}>
      <mesh material={toon(INK)}>
        <torusGeometry args={[0.34, 0.05, 10, 40]} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.32, 40]} />
        <meshBasicMaterial color="#CFEAF7" transparent opacity={0.28} depthWrite={false} toneMapped={false} />
      </mesh>
      <IBox args={[0.1, 0.5, 0.1]} color="#A8713F" position={[0, -0.6, 0]} radius={0.03} out={0.016} />
    </group>
  );
};

const DataBox: React.FC<{ t: number; tx: FT }> = ({ t, tx }) => {
  const k = ramp(t, T_BOX, T_BOX + 0.4);
  if (k <= 0 || t > 81.3) return null;
  const s = outBack(k);
  const no = outBack(ramp(t, T_NO, T_NO + 0.35), 2.2);
  return (
    <group position={DATA_BOX_LOCAL} rotation={[0, -0.2, 0]}>
      <group scale={s}>
        <IBox args={[1.0, 0.72, 0.66]} color="#C98F5A" position={[0, 0.36, 0]} radius={0.05}>
          <Decal map={tx.data} w={0.86} h={0.5} z={0.335} />
        </IBox>
        <IBox args={[1.06, 0.1, 0.72]} color="#A8713F" position={[0, 0.76, 0]} radius={0.03} />
      </group>
      {no > 0.001 && (
        <group position={[0, 0.5, 0.55]} scale={no}>
          <mesh material={toon(P.bodyCoral)}>
            <torusGeometry args={[0.58, 0.07, 10, 48]} />
          </mesh>
          <mesh material={inkMat} scale={[1, 1, 1.3]}>
            <torusGeometry args={[0.58, 0.095, 10, 48]} />
          </mesh>
          <IBox args={[1.12, 0.13, 0.1]} color={P.bodyCoral} rotation={[0, 0, -0.78]} radius={0.04} out={0.02} />
        </group>
      )}
    </group>
  );
};

// ---- camera driver ---------------------------------------------------------------------------
const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  applyCam(camera as THREE.PerspectiveCamera, t);
  return null;
};

// ---- owner pose ------------------------------------------------------------------------------
const ownerPose = (t: number, f: number): Pose => {
  const base = poseAt("stand", f, 4);
  if (t >= 60.6 && t < 65.6) {
    // pressing "=" through the glass on the test taps
    const p = T_PRESS.reduce((m, x) => Math.max(m, 1 - Math.abs(t - x) / 0.3), 0);
    return { ...base, rs: [-1.5 - p * 0.15, 0.15, -0.05], re: -0.25 + p * 0.1, ls: [0.1, 0, 0.18], le: -0.5, head: [-0.05, -0.55, 0], spine: [0.05, -0.2, 0] };
  }
  if (t < 8.1) {
    // hook: looks up at the empty phone, hand at the chin
    return { ...base, head: [-0.32, -0.45, 0.08], rs: [-0.9, 0.3, -0.35], re: -2.0, spine: [-0.05, -0.15, 0] };
  }
  if (t >= 76.5) return { ...base, head: [0.05, -0.2, 0], ls: [-0.4, 0, 0.6], le: -0.6, rs: [-0.4, 0, -0.6], re: -0.6 };
  return { ...base, head: [-0.1, -0.5, 0], spine: [0.0, -0.15, 0] };
};

// ---- scene -----------------------------------------------------------------------------------
export const World: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tx = useMemo(FilmTex, []);
  useMemo(() => {
    tx.base.floor.wrapS = tx.base.floor.wrapT = THREE.RepeatWrapping;
    tx.base.floor.repeat.set(12, 12);
  }, [tx]);
  const receiptLen = t < T_BUILD + 1.0 ? 0 : t < T_PRINT ? 0.32 : 0.32 + 0.68 * sm(ramp(t, T_PRINT, T_PRINT + 1.2));
  const bands_ = bands(); // keep the cover's shared toon ramp alive
  void bands_;
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[-4, 10, 6]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[6, 3, 4]} intensity={0.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial map={tx.base.floor} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial color={P.shadowBlue} opacity={0.75} />
      </mesh>

      <group rotation={[0, PHONE_ROT, 0]}>
        <IBox args={[5.4, 0.2, 4.0]} color="#E9DFC8" position={[0, -0.1, 0.55]} radius={0.06} />
      </group>
      <group rotation={[0, PHONE_ROT, 0]}>
        <FilmPhone t={t} f={f} tx={tx} />
        {receiptLen > 0 && (
          <group scale={[1, 1, receiptLen]} position={[0, 0, 0.18 * (1 - receiptLen)]}>
            <Receipt map={tx.base.receipt} />
          </group>
        )}
        <ToyPerson f={f} seed={4} poseOverride={ownerPose(t, f)} outfit="casual" position={[-1.6, 0, 0.8]} heading={2.2} scale={1.6} look={{ top: "#2f6fde", bottom: "#262b33", hairStyle: 0 }} />
        <IBox args={[0.3, 0.3, 0.3]} color={P.bodyMint} position={[1.55, 0.15, 1.1]} rotation={[0, 0.5, 0]} radius={0.05} />
        <IBox args={[0.26, 0.26, 0.26]} color={P.accentYellow} position={[1.85, 0.13, 0.6]} rotation={[0, 0.2, 0]} radius={0.05} />
        {[0, 1, 2].map((i) => (
          <group key={i} position={[-0.6, 0.04 + i * 0.075, 1.6]}>
            <mesh material={toon(P.accentYellow)}>
              <cylinderGeometry args={[0.17, 0.17, 0.06, 24]} />
            </mesh>
            <mesh material={inkMat}>
              <cylinderGeometry args={[0.19, 0.19, 0.075, 24]} />
            </mesh>
          </group>
        ))}
        <Lens t={t} />
        <DataBox t={t} tx={tx} />
      </group>
      <group position={[-3.6, -0.2, -1.1]} rotation={[0, PHONE_ROT, 0]}>
        <Shelf />
      </group>
      <FilmBubble t={t} tx={tx} />
      {t >= T_BUBBLE + 0.3 && t <= 81.3 && <DashArrow pts={[[-0.22, 5.12, 0.32], [0.15, 5.4, 0.05], [0.5, 5.12, -0.22]]} />}
      <Tiles t={t} tx={tx} />
      <Workshop t={t} tx={tx} />
    </>
  );
};
