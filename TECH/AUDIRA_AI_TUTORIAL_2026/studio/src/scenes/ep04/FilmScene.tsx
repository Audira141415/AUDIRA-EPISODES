// EP04 3D world: the cover's forensic desk, extended for the film. A walnut desk with case notes
// and a mug (no plain void around the folder), prints A and B, tall evidence tents, the AUDIRA
// evidence card clear of print B, a magnifier whose lens really magnifies the print under it
// (and shows the hidden lattice only inside the glass, under a refracting glass dome), a tablet
// whose screen is the generic chat interface (screen.ts), and a Content Credentials passport.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { VISUALINVESTIGATION_PALETTE as P } from "../../kits/visualinvestigation/lib/palette.ts";
import { cardTexture, drawLandscape, landscapeTexture, scaleTexture, stampTexture, tentTexture } from "./textures.ts";
import {
  LENS_SRC,
  deskTextures,
  latticeTexture,
  lensGlassTexture,
  lensSourceTexture,
  notesTexture,
  passportCoverTexture,
  passportLeftTexture,
  passportRightTexture,
  stampTex,
  tex,
  tickTexture,
} from "./filmTextures.ts";
import { SH, SW, drawScreen } from "./screen.ts";
import { CARD, PASSPORT, PRINT_A, PRINT_B, TABLET, V3, cameraAt } from "./camera.ts";
import { C, SEC, W, clamp01, easeInOut, easeOut, pop, ramp } from "./tl.ts";

const R = 0.44; // lens radius
const ZOOM = 1.9;
const PHOTO_OFF = -0.02; // photo plane sits 0.02 toward -z inside the print

// ---------- magnifier schedule ----------
type LK = { t: number; p: V3 };
const LB: V3 = [0.36, 0.5, 0.42];
const LB_SIDE: V3 = [0.6, 0.5, 0.3];
const LA: V3 = [-0.55, 0.5, -0.7];
const AWAY: V3 = [1.45, 0.95, 1.15];
const gem = W("l05", "gemini").s;
const LENS_KEYS: LK[] = [
  { t: 0, p: LB },
  { t: SEC.hook[1] + 0.3, p: [1.55, 0.6, 1.0] },
  { t: SEC.hook[1] + 1.4, p: LB },
  { t: C("l05").start + 0.1, p: LB },
  { t: C("l05").start + 0.9, p: AWAY },
  { t: gem - 0.2, p: AWAY },
  { t: gem + 0.6, p: LB },
  { t: SEC.langkah[1] + 0.3, p: LB },
  { t: SEC.langkah[1] + 1.1, p: LB_SIDE },
  { t: C("l16").start + 0.15, p: LB_SIDE },
  { t: C("l16").start + 1.15, p: LA },
];
const lensAt = (t: number): V3 => {
  let i = 0;
  while (i < LENS_KEYS.length - 1 && t >= LENS_KEYS[i + 1].t) i++;
  const a = LENS_KEYS[i], b = LENS_KEYS[Math.min(i + 1, LENS_KEYS.length - 1)];
  if (a === b || t <= a.t) return a.p;
  const k = easeInOut(clamp01((t - a.t) / (b.t - a.t)));
  const lift = Math.sin(k * Math.PI) * 0.12;
  return [a.p[0] + (b.p[0] - a.p[0]) * k, a.p[1] + (b.p[1] - a.p[1]) * k + lift, a.p[2] + (b.p[2] - a.p[2]) * k];
};
/** Watermark visibility inside the lens (only print B carries it). */
const patternAt = (t: number) => {
  if (t < SEC.hook[1] + 0.3) return 0.85;
  if (t < SEC.langkah[0]) return ramp(t, W("l04", "synthid").s - 0.2, W("l04", "synthid").s + 0.4);
  return 1;
};

// ---------- props ----------
const Print: React.FC<{ map: THREE.Texture; position: V3; rot: number }> = ({ map, position, rot }) => (
  <group position={position} rotation={[0, rot, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.006, 0]}>
      <RoundedBoxGeo args={[1.36, 0.012, 1.02]} radius={0.005} />
      <meshPhysicalMaterial {...POLISH.paper} color={P.archivalPaper} />
    </mesh>
    <mesh position={[0, 0.0125, PHOTO_OFF]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1.24, 0.893]} />
      <meshPhysicalMaterial map={map} roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.25} />
    </mesh>
  </group>
);

const Tent: React.FC<{ map: THREE.Texture; position: V3; rot: number; s?: number }> = ({ map, position, rot, s = 1 }) => {
  const lean = 0.42;
  const h = 0.24;
  return (
    <group position={position} rotation={[0, rot, 0]} scale={s}>
      <group position={[0, h * Math.cos(lean), 0]}>
        {[1, -1].map((sg) => (
          <group key={sg} rotation={[sg * lean, 0, 0]}>
            <mesh castShadow receiveShadow position={[0, -h / 2, 0]}>
              <RoundedBoxGeo args={[0.3, h, 0.006]} radius={0.002} />
              <meshPhysicalMaterial {...POLISH.paper} color="#F2B33D" />
            </mesh>
            {sg === -1 && (
              <mesh position={[0, -h / 2, 0.0035]}>
                <planeGeometry args={[0.3, h]} />
                <meshStandardMaterial map={map} roughness={0.8} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

const Pin: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <mesh castShadow position={[0, 0.045, 0]}>
      <sphereGeometry args={[0.034, 24, 16]} />
      <meshPhysicalMaterial {...POLISH.brickABS} color="#D7261C" />
    </mesh>
    <mesh position={[0, 0.015, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
      <meshStandardMaterial color="#c9ccd2" metalness={1} roughness={0.25} />
    </mesh>
  </group>
);

const Thread: React.FC<{ pts: V3[] }> = ({ pts }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.2);
    return new THREE.TubeGeometry(curve, 120, 0.0065, 8, false);
  }, [pts]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#E0301E" roughness={0.6} emissive="#5a0a04" emissiveIntensity={0.4} />
    </mesh>
  );
};

const Flat: React.FC<{ map: THREE.Texture; size: [number, number]; position: V3; rot?: number; opacity?: number; scale?: number }> = ({
  map,
  size,
  position,
  rot = 0,
  opacity = 1,
  scale = 1,
}) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, rot]} scale={scale} visible={opacity > 0.001}>
    <planeGeometry args={size} />
    <meshStandardMaterial map={map} transparent opacity={opacity} roughness={0.75} depthWrite={false} />
  </mesh>
);

// Lens disc: samples the print source + hidden lattice with a barrel (bulge) distortion, so the
// glass reads as a real refracting lens; slight chromatic split at the rim.
const lensMaterial = (src: THREE.Texture, lat: THREE.Texture) =>
  new THREE.ShaderMaterial({
    uniforms: { src: { value: src }, lat: { value: lat }, box: { value: new THREE.Vector4() }, pat: { value: 0 }, scan: { value: -1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform sampler2D src; uniform sampler2D lat; uniform vec4 box; uniform float pat; uniform float scan;
      varying vec2 vUv;
      vec2 toSrc(vec2 q){ return box.xy + (q * 0.5 + 0.5) * box.zw; }
      void main(){
        vec2 q = vUv * 2.0 - 1.0;
        float r2 = dot(q,q);
        if (r2 > 1.0) discard;
        float k = 0.78 + 0.22 * r2;           // centre magnified more than the rim
        vec2 qr = q * k;
        vec3 col;
        col.r = texture2D(src, toSrc(qr * 1.012)).r;
        col.g = texture2D(src, toSrc(qr)).g;
        col.b = texture2D(src, toSrc(qr * 0.988)).b;
        vec4 L = texture2D(lat, toSrc(qr));
        col += L.rgb * L.a * pat * 1.6;
        float sl = 1.0 - smoothstep(0.0, 0.035, abs(-q.y - scan));
        col += vec3(0.6, 1.0, 0.92) * sl * step(-1.5, scan) * 1.4;
        col *= 1.0 - 0.45 * smoothstep(0.55, 1.0, r2);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });

const Magnifier: React.FC<{ t: number; src: THREE.Texture; lat: THREE.Texture; glass: THREE.Texture }> = ({ t, src, lat, glass }) => {
  const [gx, gy, gz] = lensAt(t);
  // which print is under the lens
  const onB = Math.hypot(gx - PRINT_B[0], gz - PRINT_B[2]) < Math.hypot(gx - PRINT_A[0], gz - PRINT_A[2]);
  const pc = onB ? PRINT_B : PRINT_A;
  const sx = 1.24 / 1000, sz = 0.893 / 720;
  const px = LENS_SRC.ox + 500 + (gx - pc[0]) / sx;
  const py = LENS_SRC.oy + 360 + (gz - (pc[2] + PHOTO_OFF)) / sz;
  const d = (2 * R) / ZOOM / sx;
  const rx = d / LENS_SRC.w, ry = d / LENS_SRC.h;
  const mat = useMemo(() => lensMaterial(src, lat), [src, lat]);
  const pat = onB ? patternAt(t) : 0;
  const pulse = 0.85 + Math.sin(t * 2.6) * 0.15;
  // scan sweep when Gemini "reads" it
  const scan = ramp(t, gem + 0.5, gem + 1.6);
  mat.uniforms.box.value.set(px / LENS_SRC.w - rx / 2, 1 - py / LENS_SRC.h - ry / 2, rx, ry);
  mat.uniforms.pat.value = pat * pulse;
  mat.uniforms.scan.value = scan > 0 && scan < 1 ? 1 - 2 * scan : -2;
  return (
    <group position={[gx, gy, gz]} rotation={[0.16, 0, -0.06]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat}>
        <circleGeometry args={[R, 96]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <circleGeometry args={[R, 96]} />
        <meshBasicMaterial map={glass} transparent depthWrite={false} />
      </mesh>
      {/* glass dome over the bulging disc: fresnel sheen and soft studio highlights */}
      <mesh position={[0, -R * 1.6 * Math.cos(Math.asin(1 / 1.6)) + 0.008, 0]}>
        <sphereGeometry args={[R * 1.6, 72, 24, 0, Math.PI * 2, 0, Math.asin(1 / 1.6)]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.12} clearcoat={1} clearcoatRoughness={0.1} color="#f4fbff" envMapIntensity={0.5} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[R + 0.025, 0.04, 24, 128]} />
        <meshPhysicalMaterial color="#121315" roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <torusGeometry args={[R - 0.004, 0.012, 16, 128]} />
        <meshStandardMaterial color="#d9dce2" metalness={1} roughness={0.15} />
      </mesh>
      <group rotation={[0, -0.72, 0]}>
        <mesh position={[R + 0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.16, 32]} />
          <meshStandardMaterial color="#b8893f" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[R + 0.56, -0.02, 0]} rotation={[0, 0, Math.PI / 2 + 0.05]} castShadow>
          <cylinderGeometry args={[0.058, 0.05, 0.74, 32]} />
          <meshPhysicalMaterial color="#2a1a12" roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} />
        </mesh>
      </group>
      <pointLight position={[0, -0.2, 0]} color="#6effd6" intensity={0.5 * (0.3 + pat)} distance={1.4} decay={2} />
    </group>
  );
};

const Tablet: React.FC<{ screen: THREE.Texture }> = ({ screen }) => (
  <group position={TABLET}>
    <mesh castShadow receiveShadow position={[0, 0.025, 0]}>
      <RoundedBoxGeo args={[1.78, 0.05, 1.5]} radius={0.02} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#17191d" roughness={0.3} clearcoat={0.9} />
    </mesh>
    <mesh position={[0, 0.0505, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.6, 1.3]} />
      <meshBasicMaterial map={screen} toneMapped={false} />
    </mesh>
    {/* glass sheen */}
    <mesh position={[0, 0.0512, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.62, 1.32]} />
      <meshPhysicalMaterial transparent opacity={0.08} roughness={0.05} clearcoat={1} color="#ffffff" depthWrite={false} />
    </mesh>
  </group>
);

const Passport: React.FC<{ t: number; tx: Record<string, THREE.Texture> }> = ({ t, tx }) => {
  const open = easeInOut(ramp(t, W("l11", "kedua").s + 1.0, W("l11", "kedua").s + 1.9));
  const [x0, , z0] = PASSPORT;
  const PW = 0.75, PD = 1.0;
  const zOf = (cy: number) => z0 - PD / 2 + (cy / 1000) * PD;
  const xL = (cx: number) => x0 - PW + (cx / 760) * PW;
  const xR = (cx: number) => x0 + (cx / 760) * PW;
  const hiA = ramp(t, W("l11", "asal-usul").s - 0.1, W("l11", "asal-usul").s + 0.25);
  const hiR = ramp(t, W("l11", "riwayat").s - 0.1, W("l11", "riwayat").s + 0.25);
  const ticks = [W("l14", "ringkasan").s, W("l14", "riwayat").s, W("l14", "alat").s];
  const hiOff = t > C("l11").end + 0.3 ? 0 : 1;
  return (
    <group>
      {/* right page (base) */}
      <mesh position={[x0 + PW / 2, 0.012, z0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PW, 0.024, PD]} radius={0.004} />
        <meshPhysicalMaterial {...POLISH.paper} color="#e9e4d6" />
      </mesh>
      <mesh position={[x0 + PW / 2, 0.0245, z0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PW, PD]} />
        <meshStandardMaterial map={tx.right} roughness={0.9} />
      </mesh>
      {/* cover + left page, hinged at the spine */}
      <group position={[x0, 0.026, z0]} rotation={[0, 0, open * Math.PI * 0.985]}>
        <mesh position={[PW / 2, 0.006, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[PW + 0.02, 0.012, PD + 0.02]} radius={0.004} />
          <meshPhysicalMaterial color="#16243a" roughness={0.55} clearcoat={0.3} />
        </mesh>
        <mesh position={[PW / 2, 0.0125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PW, PD]} />
          <meshPhysicalMaterial map={tx.cover} roughness={0.5} metalness={0.1} clearcoat={0.4} />
        </mesh>
        <mesh position={[PW / 2, -0.0005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PW, PD]} />
          <meshStandardMaterial map={tx.left} roughness={0.9} />
        </mesh>
      </group>
      {/* highlights: ASAL-USUL, RIWAYAT EDIT */}
      {open > 0.98 && (
        <>
          <mesh position={[xL(380), 0.06, zOf(285)]} rotation={[-Math.PI / 2, 0, 0]} visible={hiA * hiOff > 0}>
            <planeGeometry args={[PW * 0.94, 0.26]} />
            <meshBasicMaterial color="#FFBE55" transparent opacity={0.32 * hiA} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[xL(380), 0.06, zOf(700)]} rotation={[-Math.PI / 2, 0, 0]} visible={hiR * hiOff > 0}>
            <planeGeometry args={[PW * 0.94, 0.52]} />
            <meshBasicMaterial color="#FFBE55" transparent opacity={0.32 * hiR} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}
      {ticks.map((at, i) => {
        const k = ramp(t, at, at + 0.3);
        if (k <= 0) return null;
        return <Flat key={i} map={tx.tick} size={[0.13, 0.13]} position={[xR(88), 0.03, zOf(268 + i * 230)]} scale={1.5 - 0.5 * pop(k)} opacity={clamp01(k * 3)} />;
      })}
    </group>
  );
};

export const FilmScene: React.FC<{ t: number }> = ({ t }) => {
  const camera = useThree((s) => s.camera);
  const tx = useMemo(() => {
    const [desk, deskR] = deskTextures();
    const [found, foundAR] = stampTex("SYNTHID DITEMUKAN", 1100, "rgba(214,40,28,0.95)", 110);
    const sc = document.createElement("canvas");
    sc.width = SW;
    sc.height = SH;
    const screen = tex(sc);
    return {
      photo: landscapeTexture(),
      src: lensSourceTexture(drawLandscape),
      lat: latticeTexture(),
      glass: lensGlassTexture(),
      tentA: tentTexture("A"),
      tentB: tentTexture("B"),
      card: cardTexture(),
      stamp: stampTexture(),
      scale: scaleTexture(),
      found,
      foundAR,
      desk,
      deskR,
      notes1: notesTexture(41, "KASUS #04"),
      notes2: notesTexture(42, "SUMBER?"),
      cover: passportCoverTexture(),
      left: passportLeftTexture(),
      right: passportRightTexture(),
      tick: tickTexture(),
      screen,
      screenCtx: sc.getContext("2d")!,
    };
  }, []);
  for (const m of [tx.left]) {
    m.center.set(0.5, 0.5);
    m.rotation = Math.PI;
  }
  drawScreen(tx.screenCtx, t);
  tx.screen.needsUpdate = true;

  const cam = cameraAt(t);
  camera.position.set(...cam.p);
  camera.lookAt(...cam.l);
  camera.updateMatrixWorld();

  const foundAt = W("l12", "ditemukan").s;
  const fk = ramp(t, foundAt - 0.05, foundAt + 0.2);

  return (
    <>
      <ambientLight intensity={0.16} color="#b9c6d8" />
      <spotLight
        position={[-1.7, 5.6, -0.6]}
        angle={0.7}
        penumbra={0.85}
        intensity={70}
        decay={2}
        color="#FFE8C4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        target-position={[0.1, 0, 0.3]}
      />
      <spotLight position={[-3.2, 4.2, 1.2]} angle={0.5} penumbra={0.9} intensity={22} decay={2} color="#FFE2B8" target-position={[-2.4, 0, 0.05]} />
      <directionalLight position={[3.5, 2.2, -3]} intensity={0.45} color="#86b4ff" />

      {/* walnut desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial map={tx.desk} roughnessMap={tx.deskR} roughness={0.75} clearcoat={0.25} clearcoatRoughness={0.5} color="#a08a7a" />
      </mesh>
      {/* case folder */}
      <mesh position={[-0.05, 0.003, -0.05]} rotation={[0, 0.06, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[2.5, 0.006, 2.7]} radius={0.003} />
        <meshPhysicalMaterial {...POLISH.paper} color="#3a3127" />
      </mesh>
      {/* case notes beside the folder */}
      <Flat map={tx.notes1} size={[0.6, 0.8]} position={[1.55, 0.004, -1.05]} rot={-0.22} />
      <Flat map={tx.notes2} size={[0.6, 0.8]} position={[-1.7, 0.004, -1.15]} rot={0.18} />
      {/* mug */}
      <group position={[1.35, 0, 1.55]}>
        <mesh castShadow receiveShadow position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.16, 0.145, 0.34, 48, 1, true]} />
          <meshPhysicalMaterial color="#d8d2c4" roughness={0.25} clearcoat={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 48]} />
          <meshStandardMaterial color="#2a160c" roughness={0.15} />
        </mesh>
        <mesh position={[0.18, 0.18, 0]} castShadow>
          <torusGeometry args={[0.075, 0.018, 12, 32]} />
          <meshPhysicalMaterial color="#d8d2c4" roughness={0.25} clearcoat={0.8} />
        </mesh>
      </group>

      <Print map={tx.photo} position={[PRINT_A[0], 0.006, PRINT_A[2]]} rot={0.09} />
      <Print map={tx.photo} position={[PRINT_B[0], 0.006, PRINT_B[2]]} rot={-0.07} />

      <mesh position={[-0.08, 0.0215, -0.3]} rotation={[-Math.PI / 2, 0, 0.22]}>
        <planeGeometry args={[0.66, 0.227]} />
        <meshStandardMaterial map={tx.stamp} transparent roughness={0.7} depthWrite={false} />
      </mesh>
      {/* SYNTHID DITEMUKAN stamp slams onto print B */}
      {fk > 0 && (
        <mesh position={[0.24, 0.0225, 0.86]} rotation={[-Math.PI / 2, 0, 0.06]} scale={1.6 - 0.6 * easeOut(fk)}>
          <planeGeometry args={[0.15 * tx.foundAR, 0.15]} />
          <meshStandardMaterial map={tx.found} transparent opacity={clamp01(fk * 2)} roughness={0.7} depthWrite={false} />
        </mesh>
      )}

      <Tent map={tx.tentA} position={[0.78, 0.006, -1.08]} rot={-0.25} s={1.55} />
      <Tent map={tx.tentB} position={[-0.92, 0.006, 0.22]} rot={0.18} s={1.55} />

      {/* AUDIRA evidence card: clear of print B, so "EP04" reads */}
      <group position={[CARD[0], 0.012, CARD[2]]} rotation={[0, 0.12, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[0.8, 0.008, 0.507]} radius={0.003} />
          <meshPhysicalMaterial {...POLISH.paper} color={P.archivalPaper} />
        </mesh>
        <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 0.507]} />
          <meshStandardMaterial map={tx.card} roughness={0.9} />
        </mesh>
      </group>

      <mesh position={[0.5, 0.008, 1.14]} rotation={[-Math.PI / 2, 0, 0.05]} receiveShadow>
        <planeGeometry args={[1.05, 0.13]} />
        <meshStandardMaterial map={tx.scale} roughness={0.85} />
      </mesh>

      <Pin p={[0.14, 0.02, -1.0]} />
      <Pin p={[-0.62, 0.02, 0.72]} />
      <Pin p={[0.98, 0.02, 0.12]} />
      <Thread pts={[[0.14, 0.06, -1.0], [0.62, 0.05, -0.5], [0.98, 0.06, 0.12]]} />
      <Thread pts={[[0.14, 0.06, -1.0], [-0.3, 0.05, 0.05], [-0.62, 0.06, 0.72]]} />

      <group position={[-1.22, 0.025, -0.2]} rotation={[0, 1.45, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.8, 6]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2d2f33" />
        </mesh>
        <mesh position={[0.44, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.022, 0.08, 6]} />
          <meshStandardMaterial color="#d8b98a" roughness={0.8} />
        </mesh>
      </group>

      <Tablet screen={tx.screen} />
      <Passport t={t} tx={tx as unknown as Record<string, THREE.Texture>} />
      <Magnifier t={t} src={tx.src} lat={tx.lat} glass={tx.glass} />
    </>
  );
};
