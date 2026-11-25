// Station 1 (x = 12): Yemen and the first cloth (c02). A felt desert, the plain stone maquette,
// and three cloths wrapping it in turn: khasaf (palm plait), ma'afir (Yemeni cloth), the striped
// mula' and wasa'il. No king is shown: only place, cloth, camels without riders and light.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Camel, feltTex, Kaaba, PAL, palmTex, silkMat, Spool, stripeTex, Tag, weaveTex } from "./kit.tsx";
import { CH, ease, SX, W } from "./tl.ts";

const C = "c02_tubba";

const Dunes: React.FC = () => {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.PlaneGeometry(12.02, 16, 120, 120);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const r = Math.hypot(x / 1.6, y / 1.2);
      const flat = Math.min(1, Math.max(0, (r - 1.4) / 2));
      const h = flat * (0.25 * Math.sin(x * 0.55 + 0.8) * Math.cos(y * 0.4) + 0.18 * Math.sin(x * 1.1 - y * 0.7) + 0.2);
      p.setZ(i, h * (y > 0 ? 1 : 0.35) * Math.min(1, (6 - Math.abs(x)) / 1.5) + 0.004);
    }
    g.computeVertexNormals();
    const f = feltTex(PAL.sand, 61, [5, 7]);
    return { geo: g, mat: new THREE.MeshStandardMaterial({ map: f.map, bumpMap: f.bump, bumpScale: 1.2, roughness: 1 }) };
  }, []);
  return <mesh geometry={geo} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow />;
};

const Palm: React.FC<{ pos: [number, number, number]; s?: number }> = ({ pos, s = 1 }) => {
  const trunk = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6B4A2E", roughness: 1 }), []);
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3F6B3A", roughness: 0.9, side: THREE.DoubleSide }), []);
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.9, 8]} />
        <primitive object={trunk} attach="material" />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0.03, 0.9, 0]} rotation={[0.9, (i / 7) * Math.PI * 2, 0]} castShadow>
          <coneGeometry args={[0.05, 0.42, 4, 1, true]} />
          <primitive object={leaf} attach="material" />
        </mesh>
      ))}
    </group>
  );
};

export const Station1: React.FC<{ t: number }> = ({ t }) => {
  const O = SX(1);
  const mats = useMemo(() => {
    const palm = palmTex();
    return {
      khasaf: new THREE.MeshStandardMaterial({ map: palm.map, bumpMap: palm.bump, bumpScale: 1.4, roughness: 0.95, transparent: true }),
      maafir: silkMat("#8A4A2E", weaveTex("#8A4A2E", 71, [4, 4], 6)),
      stripe: silkMat("#ffffff", stripeTex()),
    };
  }, []);
  const tK = W(C, "khasaf");
  const tM = W(C, "maafir");
  const tS = W(C, "bergaris");
  const lift = (a: number) => ease(t, a, 1.1);
  return (
    <group position={[O, 0, 0]}>
      <Dunes />
      <Kaaba
        pos={[0, 0, 0]}
        rotY={-0.35}
        shells={[
          { mat: mats.khasaf, cover: ease(t, tK - 0.3, 1.4), lift: lift(tM - 0.2) },
          { mat: mats.maafir, cover: ease(t, tM - 0.2, 1.3), lift: lift(tS - 0.2), inflate: 0.02 },
          { mat: mats.stripe, cover: ease(t, tS - 0.2, 1.3), inflate: 0.028 },
        ]}
        door={ease(t, W(C, "pintu"), 0.6)}
      />
      {/* key: a small brass key on the sand beside the door */}
      {t > W(C, "kunci") && (
        <group position={[0.45, 0.02, 0.7]} rotation={[0, 0.6, 0]} scale={ease(t, W(C, "kunci"), 0.5)}>
          <mesh castShadow>
            <torusGeometry args={[0.04, 0.012, 10, 20]} />
            <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
            <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.25} />
          </mesh>
        </group>
      )}
      {/* caravan on the far dunes, no riders */}
      {[0, 1, 2].map((i) => (
        <Camel key={i} pos={[-2.6 + i * 0.7 + (t - CH(C).start) * 0.02, 0.2, -2.6 - i * 0.15]} t={t + i * 0.4} walk={1} scale={0.6} color={PAL.sandDeep} />
      ))}
      <Palm pos={[-2.2, 0.0, -1.2]} s={1.1} />
      <Palm pos={[-2.7, 0.0, -1.6]} s={0.9} />
      <Palm pos={[2.4, 0.0, -1.5]} s={1.0} />
      <Spool pos={[2.2, 0, 1.2]} color="#8A4A2E" />
      <Spool pos={[-2.3, 0, 1.0]} color="#C99A4A" rotY={0.5} />
      {/* callouts */}
      <Tag pos={[-1.15, 0.05, 0.95]} lines={["menurut Ibnu Ishaq", "dikutip Ibnu Hisyam"]} t={t} at={W(C, "ishaq")} until={W(C, "ia")} w={1.15} />
      <Tag pos={[1.15, 0.05, 0.95]} lines={["Tubba', raja Himyar", "± abad ke-5 M"]} t={t} at={W(C, "tubba")} until={W(C, "menariknya")} w={1.15} accent />
      <Tag pos={[-1.15, 0.05, 0.95]} lines={["± 6 hari di Makkah"]} t={t} at={W(C, "enam")} until={W(C, "menariknya")} w={1.0} />
      <Tag pos={[-1.15, 0.05, 0.95]} lines={["1 · khasaf", "anyaman pelepah"]} t={t} at={tK} until={tM} w={1.05} />
      <Tag pos={[-1.15, 0.05, 0.95]} lines={["2 · ma'afir", "kain Yaman"]} t={t} at={tM} until={tS} w={1.05} />
      <Tag pos={[-1.15, 0.05, 0.95]} lines={["3 · mula' & wasa'il", "kain Yaman bergaris"]} t={t} at={tS} until={W(C, "tubba", 1)} w={1.15} />
      <Tag pos={[1.15, 0.05, 0.95]} lines={["pintu & kunci"]} t={t} at={W(C, "pintu")} until={W(C, "perhatikan")} w={0.9} />
      <Tag pos={[0, 0.05, 1.05]} lines={["“menurut yang", "mereka katakan”"]} t={t} at={W(C, "menurut", 1)} until={W(C, "ada")} w={1.2} accent />
      <Tag pos={[0, 0.05, 1.05]} lines={["pendapat lain:", "Nabi Ismail"]} t={t} at={W(C, "ismail")} until={CH(C).end + 3} w={1.1} />
    </group>
  );
};
