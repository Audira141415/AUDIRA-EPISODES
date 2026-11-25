// EP07 props: venetian-blind light (a spot light through invisible slats, so real shadow bars fall
// on Jack and on the note), Bobby's note with handwriting that inks in word by word with his voice,
// the ticket book, and the folded paper slipped through the window.
import React, { useMemo } from "react";
import * as THREE from "three";
import { CLIPS, type V3 } from "./layout";
import { NOTE_H, NOTE_W, noteTex, signTex } from "./tex";

export const BlindsLight: React.FC<{ from: V3; to: V3; color: string; intensity: number; slant?: number }> = ({ from, to, color, intensity, slant = 0 }) => {
  const q = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...from);
    o.lookAt(new THREE.Vector3(...to));
    return o.quaternion.clone();
  }, [from, to]);
  const dist = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const target = useMemo(() => new THREE.Object3D(), []);
  const slatsAt = Math.min(1.6, dist * 0.45);
  return (
    <group position={from} quaternion={q}>
      <primitive object={target} position={[0, 0, dist]} />
      <spotLight
        target={target}
        color={color}
        intensity={intensity}
        distance={dist + 4}
        angle={0.32}
        penumbra={0.25}
        decay={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0006}
        shadow-camera-near={0.2}
      />
      <group position={[0, 0, slatsAt]} rotation={[0, 0, slant]}>
        {Array.from({ length: 15 }, (_, i) => (
          <mesh key={i} position={[0, (i - 7) * 0.075, 0]} castShadow>
            <boxGeometry args={[1.6, 0.034, 0.01]} />
            <meshBasicMaterial colorWrite={false} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Visible note text at time t: one paragraph per line of Bobby's letter (clips s6a..s6j). */
const noteText = (t: number) => {
  const paras: string[] = [];
  let ink = 1;
  for (const c of CLIPS) {
    if (!c.id.startsWith("s6") || t < c.words[0].s) continue;
    const words: string[] = [];
    for (const w of c.words) {
      if (t < w.s) break;
      words.push(w.w);
      ink = Math.min(1, (t - w.s) / Math.max(0.08, w.e - w.s));
    }
    paras.push(words.join(" "));
  }
  return { paras, ink };
};

export const Note: React.FC<{ pos: V3; normal: V3; show: number; t: number; font: string }> = ({ pos, normal, show, t, font }) => {
  const q = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...pos);
    o.lookAt(new THREE.Vector3(pos[0] + normal[0], pos[1] + normal[1], pos[2] + normal[2]));
    return o.quaternion.clone();
  }, [pos, normal]);
  const { paras, ink } = noteText(t);
  const ready = typeof document !== "undefined" && document.fonts ? document.fonts.check(`46px ${font}`) : false;
  const tex = noteTex(paras, ink, font, ready);
  const w = 0.24, h = (0.24 * NOTE_H) / NOTE_W;
  const card = signTex("SURAT IZIN MENGEMUDI", { bg: "#d9d4c4", fg: "#2a2c33", font: "700 78px Georgia, serif", w: 1024, h: 640 });
  return (
    <group position={pos} quaternion={q}>
      <group scale={[1, Math.max(0.02, show), 1]}>
        <mesh receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={0.92} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* the licence, returned with the note */}
      <mesh position={[w * 0.32, -h * 0.47, 0.003]} rotation={[0, 0, 0.12]} receiveShadow>
        <planeGeometry args={[0.086, 0.054]} />
        <meshStandardMaterial map={card} roughness={0.5} />
      </mesh>
    </group>
  );
};

export const TicketBook: React.FC<{ pos: V3; heading: number }> = ({ pos, heading }) => (
  <group position={pos} rotation={[0, heading, 0]}>
    <group rotation={[-0.9, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.13, 0.19, 0.02]} />
        <meshStandardMaterial color="#1a1b1f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.0105]}>
        <planeGeometry args={[0.115, 0.17]} />
        <meshStandardMaterial color="#e7e1d2" roughness={0.9} />
      </mesh>
    </group>
  </group>
);

export const PaperSlip: React.FC<{ from: V3; to: V3; k: number }> = ({ from, to, k }) => {
  if (k <= 0 || k >= 0.999) return null;
  const p: V3 = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k];
  return (
    <mesh position={p} rotation={[0, Math.atan2(to[0] - from[0], to[2] - from[2]), 0.1]}>
      <boxGeometry args={[0.11, 0.16, 0.004]} />
      <meshStandardMaterial color="#ece6d6" roughness={0.9} emissive="#ffe2b0" emissiveIntensity={0.08} />
    </mesh>
  );
};
