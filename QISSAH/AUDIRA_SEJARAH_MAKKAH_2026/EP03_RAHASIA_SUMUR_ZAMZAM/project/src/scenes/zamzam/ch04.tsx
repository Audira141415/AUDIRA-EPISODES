// c04 "Dari timba ke ruang bawah tanah", part 1: the open well head on the tawaf plaza, era by era.
// Al-Azraqi's two basins and the pulley; al-Mansur's marble; the mosaic dome (its destruction in 930
// is shown abstractly: it turns into a plan outline and fades); Qaitbay's dome; the Ottoman roof;
// the iron cage of 1621; Zamzami jars; the 1953 pump and two tanks with twelve taps each; then the
// building is dismantled and the story moves to the basement of the hero cutaway.
// The diorama plinth carries the one in-world AUDIRA plaque.

import React, { useMemo } from "react";
import * as THREE from "three";
import { at, chapter, prog, smooth } from "./time.ts";
import { Jar, Plinth, TextPlate } from "./kit.tsx";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";

const C = "c04_timba";
export const T4 = {
  start: chapter(C).start,
  azraqi: at(C, "Al-Azraqi menggambarkan"),
  mansur: at(C, "Khalifah al-Mansur"),
  dome: at(C, "kubah bermosaik"),
  qaramithah: at(C, "dihancurkan kaum Qaramithah"),
  qaitbay: at(C, "Sultan Qaitbay"),
  ottoman: at(C, "Ottoman memberinya"),
  cage: at(C, "dipagari sangkar besi"),
  rope: at(C, "Selama berabad-abad"),
  zamzami: at(C, "disebut Zamzami"),
  pump: at(C, "Tahun seribu sembilan ratus lima puluh tiga"),
  dismantle: at(C, "bangunan sumur dibongkar"),
  lowered: at(C, "Mulut sumur diturunkan"),
  visitors: at(C, "Jemaah turun tangga"),
  room2: at(C, "ruang bawah tanah kedua"),
  seal: at(C, "tahun dua ribu tiga"),
  area: at(C, "Pelataran tawaf bertambah"),
  glass: at(C, "berdinding kaca"),
  museum: at(C, "Bibir sumur lamanya"),
  end: chapter(C).end,
};

/** Era label for the overlay chip. */
export function eraAt(t: number): string | null {
  if (t < T4.start + 0.5 || t > T4.end) return null;
  if (t < T4.mansur) return "Abad ke-9 · catatan Al-Azraqi";
  if (t < T4.dome) return "± 775–778 M · al-Mansur";
  if (t < T4.qaramithah) return "Era Abbasiyah · kubah bermosaik";
  if (t < T4.qaitbay) return "930 M · kubah dihancurkan";
  if (t < T4.ottoman) return "Abad ke-15 · Sultan Qaitbay";
  if (t < T4.cage) return "Abad ke-16 · atap Ottoman";
  if (t < T4.zamzami) return "1621 · sangkar besi";
  if (t < T4.pump) return "Berabad-abad · timba & Zamzami";
  if (t < T4.dismantle) return "1953 · pompa pertama";
  if (t < T4.room2) return "Awal 1960-an · ruang bawah tanah";
  if (t < T4.seal) return "1973 · ruang kedua";
  if (t < T4.glass) return "2003 · pintu masuk ditutup";
  return "Kini · ruang kaca tertutup";
}

function mosaicTexture() {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = prng(17);
  const cols = ["#1f5f8b", "#2a7fb0", "#d6a842", "#f1e6cf", "#1b4a6b"];
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      g.fillStyle = cols[Math.floor(r() * cols.length)];
      g.fillRect(x * 16 + 1, y * 16 + 1, 14, 14);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 3);
  return t;
}

export const Eras: React.FC<{ t: number }> = ({ t }) => {
  const mosaic = useMemo(() => mosaicTexture(), []);
  const m = useMemo(
    () => ({
      marble: new THREE.MeshPhysicalMaterial({ color: "#f7f4ee", roughness: 0.15, clearcoat: 0.8 }),
      stone: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#e3d6bf" }),
      dark: new THREE.MeshPhysicalMaterial({ color: "#2b2622", roughness: 0.6, metalness: 0.4 }),
      iron: new THREE.MeshPhysicalMaterial({ color: "#3a3d40", roughness: 0.45, metalness: 0.9 }),
      water: new THREE.MeshPhysicalMaterial({ color: "#47b9de", roughness: 0.05, clearcoat: 1, emissive: "#0f6c90", emissiveIntensity: 0.3 }),
      mosaic: new THREE.MeshPhysicalMaterial({ map: mosaic, roughness: 0.35, clearcoat: 0.5, side: THREE.DoubleSide }),
      outline: new THREE.MeshBasicMaterial({ color: "#c98b3a", wireframe: true, transparent: true, opacity: 1 }),
      qaitbay: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#efe2c9" }),
      roof: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#d8cbb1" }),
      zinc: new THREE.MeshPhysicalMaterial({ color: "#c2cbcf", metalness: 0.85, roughness: 0.35 }),
      brass: new THREE.MeshPhysicalMaterial({ color: "#c9a04a", metalness: 1, roughness: 0.3 }),
      wood: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#7b5534" }),
      pump: new THREE.MeshPhysicalMaterial({ color: "#ef7a43", roughness: 0.4, clearcoat: 0.5 }),
    }),
    [mosaic],
  );
  const gone = smooth(prog(t, T4.dismantle, T4.dismantle + 3)); // everything above ground dismantled
  const keep = 1 - gone;
  const marble = smooth(prog(t, T4.mansur, T4.mansur + 2));
  const dome1 = smooth(prog(t, T4.dome, T4.dome + 2));
  const destroy = smooth(prog(t, T4.qaramithah + 0.3, T4.qaramithah + 2.5));
  const dome2 = smooth(prog(t, T4.qaitbay, T4.qaitbay + 2)) * (1 - smooth(prog(t, T4.ottoman, T4.ottoman + 1.5)));
  const roof = smooth(prog(t, T4.ottoman + 0.6, T4.ottoman + 2.6)) * keep;
  const cage = smooth(prog(t, T4.cage + 0.3, T4.cage + 2)) * keep;
  const jars = prog(t, T4.zamzami - 0.5, T4.zamzami + 2.5) * keep;
  const pump = smooth(prog(t, T4.pump + 0.5, T4.pump + 2.5)) * keep;
  const bucket = Math.sin(t * 1.3) * 0.5 + 0.5;
  const cols = 6;
  m.outline.opacity = 1 - destroy;

  return (
    <group>
      <Plinth w={100} d={70} h={6} top="#e7dcc8" side="#9f8c70" seed={33} front={14} />
      {/* AUDIRA maker's plaque on the diorama's front face */}
      <TextPlate text="AUDIRA" sub="Diorama Sumur Zamzam" p={[36, -2.6, 14.06]} w={6.4} h={1.8} bg="#0b3d2e" fg="#f2efe6" font={190} />

      {/* well curb and water */}
      <mesh position={[0, 0.45, -1]} rotation={[Math.PI / 2, 0, 0]} material={m.stone} castShadow>
        <torusGeometry args={[1.45, 0.4, 14, 40]} />
      </mesh>
      <mesh position={[0, 0.3, -1]} rotation={[-Math.PI / 2, 0, 0]} material={m.water}>
        <circleGeometry args={[1.1, 32]} />
      </mesh>

      {/* Al-Azraqi's two basins (drinking, ablution) */}
      {[-5.5, 5.5].map((x) => (
        <group key={x} position={[x, 0, -1.5]} scale={[1, Math.max(0.01, keep), 1]}>
          <mesh position={[0, 0.35, 0]} material={m.stone} castShadow receiveShadow>
            <RoundedBoxGeo args={[3.4, 0.7, 2.2]} radius={0.12} />
          </mesh>
          <mesh position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.water}>
            <planeGeometry args={[2.8, 1.6]} />
          </mesh>
        </group>
      ))}

      {/* marble paving of al-Mansur */}
      <mesh position={[0, 0.04, -1]} rotation={[-Math.PI / 2, 0, 0]} material={m.marble} scale={Math.max(0.01, marble)} receiveShadow>
        <circleGeometry args={[11, 48]} />
      </mesh>

      {/* pulley frame, rope and bucket */}
      <group scale={[1, Math.max(0.01, keep), 1]}>
        {[-1.9, 1.9].map((x) => (
          <mesh key={x} position={[x, 2.0, -1]} material={m.wood} castShadow>
            <boxGeometry args={[0.18, 4.0, 0.18]} />
          </mesh>
        ))}
        <mesh position={[0, 3.9, -1]} rotation={[0, 0, Math.PI / 2]} material={m.wood}>
          <cylinderGeometry args={[0.08, 0.08, 4.0, 8]} />
        </mesh>
        <mesh position={[0, 3.9, -1]} rotation={[0, Math.PI / 2, 0]} material={m.brass}>
          <torusGeometry args={[0.36, 0.07, 10, 24]} />
        </mesh>
        <mesh position={[0.36, 3.9 - (1.2 + bucket * 2) / 2, -1]} material={m.dark}>
          <cylinderGeometry args={[0.02, 0.02, 1.2 + bucket * 2, 6]} />
        </mesh>
        <mesh position={[0.36, 3.9 - 1.2 - bucket * 2 - 0.2, -1]} material={m.brass} castShadow>
          <cylinderGeometry args={[0.28, 0.2, 0.45, 16]} />
        </mesh>
      </group>

      {/* columns shared by the domes and the Ottoman roof */}
      {dome1 + dome2 + roof > 0.01
        ? Array.from({ length: cols }, (_, i) => {
            const a = (i / cols) * Math.PI * 2;
            const s = Math.max(dome1 * (1 - destroy), dome2, roof);
            return (
              <mesh key={i} position={[Math.cos(a) * 4.2, 2.6 * s, -1 + Math.sin(a) * 4.2]} scale={[1, Math.max(0.01, s), 1]} material={m.qaitbay} castShadow>
                <cylinderGeometry args={[0.26, 0.3, 5.2, 14]} />
              </mesh>
            );
          })
        : null}
      {/* mosaic dome; in 930 it turns into a plan outline and fades (no destruction on screen) */}
      {dome1 > 0.01 && destroy < 0.99 ? (
        <mesh position={[0, 5.2, -1]} scale={dome1} material={destroy > 0.05 ? m.outline : m.mosaic}>
          <sphereGeometry args={[4.6, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ) : null}
      {/* Qaitbay's dome */}
      {dome2 > 0.01 ? (
        <mesh position={[0, 5.2, -1]} scale={dome2} material={m.qaitbay} castShadow>
          <sphereGeometry args={[4.6, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ) : null}
      {/* Ottoman roof */}
      {roof > 0.01 ? (
        <group position={[0, 5.2, -1]} scale={roof}>
          <mesh position={[0, 0.2, 0]} material={m.roof} castShadow>
            <cylinderGeometry args={[5.2, 5.2, 0.5, 6]} />
          </mesh>
          <mesh position={[0, 1.6, 0]} material={m.roof} castShadow>
            <coneGeometry args={[5.0, 2.6, 6]} />
          </mesh>
          <mesh position={[0, 3.1, 0]} material={m.brass}>
            <cylinderGeometry args={[0.06, 0.12, 0.9, 8]} />
          </mesh>
        </group>
      ) : null}

      {/* iron cage of 1621 */}
      {cage > 0.01 ? (
        <group position={[0, 0, -1]} scale={[1, Math.max(0.01, cage), 1]}>
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 2.1, 1.3, Math.sin(a) * 2.1]} material={m.iron}>
                <cylinderGeometry args={[0.035, 0.035, 2.6, 6]} />
              </mesh>
            );
          })}
          <mesh position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.iron}>
            <torusGeometry args={[2.1, 0.06, 8, 40]} />
          </mesh>
        </group>
      ) : null}

      {/* Zamzami water jars on low shelves */}
      {jars > 0.01
        ? Array.from({ length: 12 }, (_, i) => {
            const s = smooth(prog(jars, i / 16, i / 16 + 0.3));
            return s > 0.01 ? <Jar key={i} p={[-14 + (i % 6) * 1.3, i < 6 ? 0 : 0, -6 - Math.floor(i / 6) * 1.6]} s={s} /> : null;
          })
        : null}

      {/* 1953: pump and two zinc tanks with twelve taps each */}
      {pump > 0.01 ? (
        <group scale={[1, Math.max(0.01, pump), 1]}>
          <mesh position={[0, 0.6, -4.2]} material={m.pump} castShadow>
            <RoundedBoxGeo args={[1.6, 1.2, 1.2]} radius={0.15} />
          </mesh>
          {[-7.5, 7.5].map((x) => (
            <group key={x} position={[x, 0, -5]}>
              <mesh position={[0, 1.8, 0]} material={m.zinc} castShadow receiveShadow>
                <RoundedBoxGeo args={[5.2, 2.4, 2.2]} radius={0.1} />
              </mesh>
              {Array.from({ length: 12 }, (_, i) => (
                <mesh key={i} position={[-2.2 + i * 0.4, 0.75, 1.15]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
                  <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
                </mesh>
              ))}
              {[-2.2, 2.2].map((lx) => (
                <mesh key={lx} position={[lx, 0.3, 0]} material={m.iron}>
                  <boxGeometry args={[0.15, 0.6, 2.0]} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[-3.7, 1.0, -4.6]} rotation={[0, 0, Math.PI / 2]} material={m.zinc}>
            <cylinderGeometry args={[0.1, 0.1, 6.0, 10]} />
          </mesh>
          <mesh position={[3.7, 1.0, -4.6]} rotation={[0, 0, Math.PI / 2]} material={m.zinc}>
            <cylinderGeometry args={[0.1, 0.1, 6.0, 10]} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
