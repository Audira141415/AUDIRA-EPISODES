// EP15 film "Juventus, La Vecchia Signora" (FILM16).
// 16mm documentary: warm kitchen set with striped jersey form on table, scudetto discs,
// radio playing AUDIRA. FilmGate adds grain/weave/flicker/dust. Documentary overlays:
// typewriter font, warm palette, serif headers.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { FilmGate } from "../../kits/film16/camera/FilmGate.tsx";
import { FILM16_GRADE, FILM16_PALETTE as P } from "../../kits/film16/lib/palette.ts";
import { filmTime } from "../../kits/film16/core/film.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { Outro } from "../_shared/Outro.tsx";
import { CLIPS, OUTRO_AT, SEC, T, TOTAL, camAt, seg, win, type Cam, type Word } from "./timing.ts";

const { fontFamily: GROTESK } = loadGrotesk("normal", { weights: ["600", "700"] });

const DW = 1080;
const DH = 1920;
const BLACK = "#0A0A0C";
const WHITE = "#F0EDE4";
const GOLD = "#C8A227";
const COURIER = "'Courier New',monospace";
const GEORGIA = "'Georgia','Times New Roman',serif";

// ---------------------------------------------------------------- 3D: jersey + scudetto (from Cover)
const makeStripeTex = () => {
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 512;
  const g = cv.getContext("2d")!;
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? WHITE : BLACK; g.fillRect(i * 32, 0, 32, 512); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 1);
  return t;
};

const makeBrandTex = () => {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = "rgba(240,237,228,0.3)";
  g.font = "bold 86px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("AUDIRA", 256, 64);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const JerseyForm: React.FC<{ tex: THREE.Texture }> = ({ tex }) => (
  <group position={[0, 0.1, 0]} rotation={[0.1, 0.2, 0]}>
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={[0.9, 1.3, 0.28]} radius={0.05} segments={3} />
      <meshPhysicalMaterial {...POLISH.brickABS} map={tex} />
    </mesh>
    <mesh position={[-0.58, 0.28, 0]} rotation={[0, 0, 0.5]} castShadow>
      <RoundedBoxGeo args={[0.38, 0.24, 0.24]} radius={0.04} segments={2} />
      <meshPhysicalMaterial {...POLISH.brickABS} map={tex} />
    </mesh>
    <mesh position={[0.58, 0.28, 0]} rotation={[0, 0, -0.5]} castShadow>
      <RoundedBoxGeo args={[0.38, 0.24, 0.24]} radius={0.04} segments={2} />
      <meshPhysicalMaterial {...POLISH.brickABS} map={tex} />
    </mesh>
  </group>
);

const Scudetto: React.FC<{ pos: [number, number, number] }> = ({ pos }) => (
  <group position={pos}>
    <mesh castShadow>
      <cylinderGeometry args={[0.21, 0.21, 0.04, 32]} />
      <meshPhysicalMaterial roughness={0.18} metalness={0.9} color={GOLD} envMapIntensity={1.2} />
    </mesh>
    <mesh position={[0, 0.025, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.01, 32]} />
      <meshPhysicalMaterial roughness={0.5} color={BLACK} />
    </mesh>
  </group>
);

// ---------------------------------------------------------------- CameraRig
const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.pos);
    c.lookAt(cam.tgt);
    c.fov = cam.fov;
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

// ---------------------------------------------------------------- 3D scene
const Scene: React.FC<{ t: number; frame: number; cam: Cam }> = ({ t, frame, cam }) => {
  const stripeTex = useMemo(makeStripeTex, []);
  const brandTex = useMemo(makeBrandTex, []);
  const grain = useSurfaceGrain(5, 0.4, 5);
  const tf = filmTime(t);
  return (
    <>
      <CameraRig cam={cam} />
      <color attach="background" args={[P.bg]} />
      <ambientLight intensity={0.15} color="#C0A07A" />
      <directionalLight position={[-2, 4, 3]} intensity={2.9} color={P.sun} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-bias={-0.0003} />
      <pointLight position={[1.2, 1.2, 1.5]} intensity={0.55} color="#FFE0A0" distance={4} />
      {/* back wall */}
      <mesh receiveShadow position={[0, 2, -1.2]}>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial color={P.wall} roughness={0.95} roughnessMap={grain} bumpMap={grain} bumpScale={0.4} />
      </mesh>
      {/* side wall */}
      <mesh position={[-2.2, 2, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={P.wallShade} roughness={1} />
      </mesh>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#5B4636" roughness={0.9} />
      </mesh>
      {/* wood table */}
      <mesh receiveShadow position={[0, -0.65, 0]}>
        <boxGeometry args={[7, 0.08, 7]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#6B4B2C" />
      </mesh>
      <JerseyForm tex={stripeTex} />
      <Scudetto pos={[0.52, -0.58, 0.55]} />
      <Scudetto pos={[-0.42, -0.58, 0.62]} />
      {/* AUDIRA brand stencil on table */}
      <mesh position={[0.08, -0.6, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.45]} />
        <meshBasicMaterial map={brandTex} transparent depthWrite={false} />
      </mesh>
      <Finish
        frame={Math.round(tf * 60)}
        background={P.bg}
        profile={FILM16_GRADE}
        exposure={1.0}
        hdri="warmStudio"
        envIntensity={0.3}
        focus={2.5}
        aperture={0.0035}
        maxBlur={0.008}
      />
    </>
  );
};

// ---------------------------------------------------------------- overlay helpers
const fade = (o: number): React.CSSProperties => ({ opacity: o, transform: `translateY(${(1 - o) * 14}px)` });

const DocTag: React.FC<{ o: number; children: React.ReactNode; top: number; accent?: boolean }> = ({ o, children, top, accent }) =>
  o <= 0.01 ? null : (
    <div style={{
      position: "absolute", left: "50%", top,
      transform: `translateX(-50%) translateY(${(1 - o) * 14}px)`,
      opacity: o, fontFamily: COURIER, fontWeight: 700, fontSize: 28, letterSpacing: 2,
      color: accent ? BLACK : P.hud,
      background: accent ? GOLD : P.chip,
      borderRadius: 8, padding: "7px 18px", whiteSpace: "nowrap",
      boxShadow: "0 8px 22px rgba(0,0,0,0.45)",
    }}>
      {children}
    </div>
  );

const StatCard: React.FC<{ o: number; top: number; num: string; label: string; sub?: string }> = ({ o, top, num, label, sub }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: "50%", top, transform: "translateX(-50%)", ...fade(o), display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 100, lineHeight: 1, color: GOLD, textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>{num}</div>
      <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: P.hud }}>{label}</div>
      {sub && <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: P.accent }}>{sub}</div>}
    </div>
  );

// ---------------------------------------------------------------- section layers
const HookLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t > 7.5) return null;
  const head = (1 - seg(t, 5.5, 6.2)) * seg(t, 0.0, 0.3);
  const kick = 1 - seg(t, 5.6, 6.2);
  return (
    <>
      <div style={{ position: "absolute", left: 56, right: 56, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: kick }}>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", fontFamily: COURIER, fontWeight: 700, fontSize: 25, letterSpacing: 2 }}>
          <div style={{ background: BLACK, color: WHITE, padding: "7px 14px" }}>SEJARAH SEPAK BOLA</div>
          <div style={{ background: GOLD, color: BLACK, padding: "7px 14px" }}>#15</div>
        </div>
        <div style={{ fontFamily: COURIER, fontSize: 23, letterSpacing: 2, color: WHITE, border: `2px solid ${GOLD}`, borderRadius: 6, padding: "5px 10px" }}>
          JUVENTUS · AUDIRA
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, top: 268, opacity: head }}>
        <div style={{ fontFamily: GEORGIA, fontSize: 118, color: WHITE, lineHeight: 0.88, fontStyle: "italic", textShadow: "0 6px 24px rgba(0,0,0,.72)" }}>LA</div>
        <div style={{ fontFamily: GEORGIA, fontSize: 95, color: WHITE, lineHeight: 0.88, fontStyle: "italic", textShadow: "0 6px 24px rgba(0,0,0,.72)" }}>VECCHIA</div>
        <div style={{ fontFamily: GEORGIA, fontSize: 118, color: GOLD, lineHeight: 0.88, fontStyle: "italic", textShadow: "0 6px 24px rgba(0,0,0,.72)" }}>SIGNORA</div>
        <div style={{ marginTop: 24, display: "inline-block", fontFamily: COURIER, fontSize: 34, color: BLACK, background: WHITE, padding: "2px 16px 4px", transform: "rotate(-1.2deg)" }}>
          36 Scudetto · Torino 1897
        </div>
      </div>
    </>
  );
};

const KonteksLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.KONTEKS[0] - 0.3 || t > SEC.PENGEMBANGAN[0] + 0.4) return null;
  const lahir = win(t, T.juventus - 0.1, T.pelajar - 0.2, 0.3, 0.3);
  const latin = win(t, T.namaLatin - 0.1, T.seragam - 0.3, 0.3, 0.3);
  const strip = win(t, T.seragam - 0.1, T.nottsCounty - 0.2, 0.3, 0.3);
  const notts = win(t, T.nottsCounty - 0.1, SEC.PENGEMBANGAN[0] + 0.1, 0.3, 0.4);
  return (
    <>
      {lahir > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 286, ...fade(lahir) }}>
          <div style={{ display: "flex", alignItems: "stretch", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            <div style={{ width: 10, background: GOLD, borderRadius: "8px 0 0 8px" }} />
            <div style={{ background: P.chip, padding: "12px 22px 14px", borderRadius: "0 8px 8px 0" }}>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: P.accent }}>AKHIR 1897 · TURIN</div>
              <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 64, lineHeight: 1.04, color: WHITE }}>Juventus</div>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: P.hud }}>SEKELOMPOK PELAJAR</div>
            </div>
          </div>
        </div>
      )}
      <DocTag o={latin} top={290}>LATIN: "MASA MUDA"</DocTag>
      {strip > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: "translateX(-50%)", ...fade(strip), display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 16, fontFamily: COURIER, fontWeight: 700, fontSize: 26 }}>
            <div style={{ background: "rgba(255,192,203,0.85)", color: BLACK, padding: "6px 16px", borderRadius: 8 }}>MERAH MUDA</div>
            <div style={{ fontSize: 38, color: P.hud }}>→</div>
            <div style={{ background: BLACK, color: WHITE, padding: "6px 16px", borderRadius: 8, border: `2px solid ${WHITE}` }}>HITAM PUTIH</div>
          </div>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: P.accent }}>1903</div>
        </div>
      )}
      <DocTag o={notts} top={290}>KIRIMAN NOTTS COUNTY · INGGRIS</DocTag>
    </>
  );
};

const PengembanganLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.PENGEMBANGAN[0] - 0.3 || t > SEC.PENJELASAN[0] + 0.3) return null;
  const agn = win(t, T.agnelli - 0.1, T.fiat - 0.2, 0.3, 0.3);
  const lap = win(t, T.lapangan - 0.1, T.tigaPuluhEnam - 0.3, 0.3, 0.3);
  const tiga6 = win(t, T.tigaPuluhEnam - 0.1, T.sembilan - 0.2, 0.3, 0.3);
  const scud9 = win(t, T.sembilan - 0.1, T.rekor - 0.2, 0.3, 0.3);
  const rekor = win(t, T.rekor - 0.1, SEC.PENJELASAN[0] + 0.1, 0.3, 0.3);
  return (
    <>
      {agn > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 280, ...fade(agn) }}>
          <div style={{ display: "flex", alignItems: "stretch", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            <div style={{ width: 10, background: GOLD, borderRadius: "8px 0 0 8px" }} />
            <div style={{ background: P.chip, padding: "12px 22px 14px", borderRadius: "0 8px 8px 0" }}>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: P.accent }}>SEJAK 1920-AN</div>
              <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 60, lineHeight: 1.04, color: WHITE }}>Keluarga Agnelli</div>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: P.hud }}>BOS FIAT</div>
            </div>
          </div>
        </div>
      )}
      <DocTag o={lap} top={286}>KOLEKSI GELAR SERIE A TERBANYAK</DocTag>
      <StatCard o={tiga6} top={276} num="36" label="GELAR SERIE A RESMI" sub="TERBANYAK DI ITALIA" />
      {scud9 > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 276, transform: "translateX(-50%)", ...fade(scud9), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 100, lineHeight: 1, color: GOLD, textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>9</div>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: P.hud }}>SCUDETTO BERUNTUN</div>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: P.accent }}>2012 — 2020</div>
        </div>
      )}
      <DocTag o={rekor} top={286} accent>REKOR TERPANJANG LIGA ITALIA</DocTag>
    </>
  );
};

const PenjelasanLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.PENJELASAN[0] - 0.3 || t > SEC.PAYOFF[0] + 0.3) return null;
  const triple = win(t, T.y1985 - 0.1, T.lukaEropa - 0.3, 0.3, 0.3);
  const luka = win(t, T.lukaEropa - 0.1, T.duaJuara - 0.2, 0.3, 0.3);
  const dua = win(t, T.duaJuara - 0.1, T.tujuhFinal - 0.2, 0.3, 0.3);
  const tujuh = win(t, T.tujuhFinal - 0.1, T.beruntun - 0.2, 0.3, 0.3);
  const lima = win(t, T.beruntun - 0.1, SEC.PAYOFF[0] + 0.1, 0.3, 0.4);
  return (
    <>
      {triple > 0.01 && (
        <div style={{ position: "absolute", left: 56, top: 280, ...fade(triple), fontFamily: GEORGIA, fontStyle: "italic", lineHeight: 0.98, textShadow: "0 4px 16px rgba(0,0,0,0.6)" }}>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: P.accent }}>1985</div>
          <div style={{ fontSize: 70, color: WHITE }}>TRIPLE</div>
          <div style={{ fontSize: 70, color: GOLD }}>EROPA</div>
          <div style={{ marginTop: 10, fontFamily: COURIER, fontWeight: 700, fontSize: 28, color: P.hud }}>KLUB PERTAMA DI DUNIA</div>
        </div>
      )}
      <DocTag o={luka} top={286}>EROPA = LUKA TERDALAM</DocTag>
      {dua > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: "translateX(-50%)", ...fade(dua), display: "flex", gap: 28, fontFamily: GEORGIA, fontStyle: "italic" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 90, lineHeight: 1, color: GOLD }}>2</div>
            <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 26, color: P.hud }}>JUARA UCL</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 90, lineHeight: 1, color: "#B0281E" }}>7</div>
            <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 26, color: P.hud }}>KALAH FINAL</div>
          </div>
        </div>
      )}
      <StatCard o={tujuh} top={276} num="7" label="FINAL KALAH" sub="PALING BANYAK DI EROPA" />
      <DocTag o={lima} top={286}>5 DI ANTARANYA BERUNTUN</DocTag>
    </>
  );
};

const PayoffLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.PAYOFF[0] - 0.3 || t > SEC.OUTRO[0] + 0.3) return null;
  const y2006 = win(t, T.lukaTerbesar - 0.1, T.calciopoli - 0.2, 0.3, 0.3);
  const calci = win(t, T.calciopoli - 0.1, T.dicabut - 0.2, 0.3, 0.3);
  const cab = win(t, T.dicabut - 0.1, T.akhir - 0.2, 0.3, 0.3);
  const akh = win(t, T.akhir - 0.1, T.tapiHanya - 0.2, 0.3, 0.3);
  const tapi = win(t, T.tapiHanya - 0.1, T.juaraB - 0.2, 0.3, 0.3);
  const jb = win(t, T.juaraB - 0.1, T.empatKali - 0.2, 0.3, 0.3);
  const emp = win(t, T.empatKali - 0.1, T.kembali - 0.2, 0.3, 0.3);
  const kem = win(t, T.kembali - 0.1, SEC.OUTRO[0] + 0.1, 0.3, 0.3);
  return (
    <>
      {y2006 > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: "translateX(-50%)", ...fade(y2006), textAlign: "center" }}>
          <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 110, lineHeight: 1, color: "#B0281E", textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>2006</div>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: P.hud }}>LUKA TERBESAR</div>
        </div>
      )}
      {calci > 0.01 && (
        <div style={{ position: "absolute", left: 56, top: 280, ...fade(calci) }}>
          <div style={{ display: "flex", alignItems: "stretch", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
            <div style={{ width: 10, background: "#B0281E", borderRadius: "8px 0 0 8px" }} />
            <div style={{ background: P.chip, padding: "12px 22px 14px", borderRadius: "0 8px 8px 0" }}>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "#B0281E" }}>SKANDAL</div>
              <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 62, lineHeight: 1.04, color: WHITE }}>Calciopoli</div>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: P.hud }}>DEGRADASI KE SERIE B</div>
            </div>
          </div>
        </div>
      )}
      <DocTag o={cab} top={286}>2 GELAR JUARA DICABUT</DocTag>
      {akh > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 300, transform: "translateX(-50%)", ...fade(akh), fontFamily: COURIER, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: "rgba(251,239,217,0.55)" }}>
          BANYAK YANG MENGIRA ITU AKHIR
        </div>
      )}
      {tapi > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: "translateX(-50%)", ...fade(tapi), textAlign: "center" }}>
          <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 90, lineHeight: 1, color: GOLD, textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>SEMUSIM</div>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: P.hud }}>KEMUDIAN</div>
        </div>
      )}
      <DocTag o={jb} top={286} accent>JUARA SERIE B</DocTag>
      {emp > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 276, transform: "translateX(-50%)", ...fade(emp), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 20, fontFamily: GEORGIA, fontStyle: "italic" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 80, lineHeight: 1, color: GOLD }}>4</div>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, color: P.hud }}>KALAH</div>
            </div>
            <div style={{ fontSize: 50, color: P.hudDim, alignSelf: "center" }}>/</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 80, lineHeight: 1, color: GOLD }}>42</div>
              <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, color: P.hud }}>LAGA</div>
            </div>
          </div>
        </div>
      )}
      <DocTag o={kem} top={286} accent>LANGSUNG KEMBALI KE SERIE A</DocTag>
    </>
  );
};

const OutroLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.OUTRO[0] - 0.2) return null;
  const ask = win(t, T.berikut - 0.1, OUTRO_AT + 0.3, 0.3, 0.3);
  return (
    <>
      {ask > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 340, ...fade(ask), background: P.chip, borderLeft: `10px solid ${GOLD}`, borderRadius: 10, padding: "16px 26px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: P.accent }}>EPISODE BERIKUTNYA</div>
          <div style={{ fontFamily: GEORGIA, fontStyle: "italic", fontSize: 68, lineHeight: 1.04, color: WHITE }}>Bayern Munich</div>
          <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 28, color: GOLD, marginTop: 6 }}>hegemoni dari Bavaria · AUDIRA</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- karaoke captions
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const splitSentence = (ws: Word[]): Word[][] => {
    if (ws.length <= 6) return [ws];
    const k = Math.ceil(ws.length / 6);
    const parts: Word[][] = [];
    let i = 0;
    for (let j = 1; j < k; j++) {
      const ideal = Math.round((ws.length * j) / k);
      let cut = ideal;
      for (const d of [0, -1, 1, -2, 2]) {
        const c = ideal + d;
        if (c - i >= 2 && ws.length - c >= 2 && c - i <= 6 && /,$/.test(ws[c - 1].w)) { cut = c; break; }
      }
      parts.push(ws.slice(i, cut));
      i = cut;
    }
    parts.push(ws.slice(i));
    return parts;
  };
  CLIPS.forEach((c, ci) => {
    const sentences: Word[][] = [];
    let cur: Word[] = [];
    c.words.forEach((w) => { cur.push(w); if (/[.?!]$/.test(w.w)) { sentences.push(cur); cur = []; } });
    if (cur.length) sentences.push(cur);
    const merged: Word[][] = [];
    sentences.forEach((sn) => { if (sn.length === 1 && merged.length) merged[merged.length - 1] = merged[merged.length - 1].concat(sn); else merged.push(sn); });
    const parts = merged.flatMap(splitSentence);
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s : Math.min(nextStart, p[p.length - 1].e + 0.5);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  const totalChars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
  if (n > 4 || (n === 4 && totalChars > 26)) {
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const diff = Math.abs(a - (totalChars - a));
      if (diff < best) { best = diff; cut = i; }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: P.chip, borderRadius: 12, padding: "10px 24px 12px", borderLeft: `6px solid ${GOLD}`, opacity: appear, transform: `translateY(${(1 - appear) * 14}px)`, textAlign: "center", maxWidth: 960, boxShadow: "0 8px 22px rgba(0,0,0,0.4)" }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.2 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const active = t >= wd.s && t < (ch.words[idx + 1]?.s ?? ch.b);
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span key={idx} style={{ display: "inline-block", margin: "0 10px", fontFamily: GROTESK, fontSize: 50, fontWeight: 700, color: active ? GOLD : done ? P.hud : P.hudDim, transform: `scale(${bump})`, textShadow: active ? `0 0 10px ${GOLD}` : "none" }}>
                  {wd.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const k = width / DW;
  const tf = filmTime(t);
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <FilmGate t={t} roll="JUVE · ROL 15" caption="">
        <ThreeCanvas
          width={width} height={height}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          camera={{ position: cam.pos.toArray() as [number, number, number], fov: cam.fov, near: 0.05, far: 30 }}
        >
          <Scene t={t} frame={Math.round(tf * 60)} cam={cam} />
        </ThreeCanvas>
      </FilmGate>
      <div style={{ position: "absolute", left: 0, top: 0, width: DW, height: DH, transform: `scale(${k})`, transformOrigin: "0 0", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(8,6,4,.88) 0%,rgba(8,6,4,.65) 20%,rgba(8,6,4,0) 44%,rgba(8,6,4,0) 78%,rgba(8,6,4,.58) 100%)" }} />
        <HookLayer t={t} />
        <KonteksLayer t={t} />
        <PengembanganLayer t={t} />
        <PenjelasanLayer t={t} />
        <PayoffLayer t={t} />
        <OutroLayer t={t} />
        <Captions t={t} />
      </div>
      {t >= OUTRO_AT && <Outro start={OUTRO_AT} />}
    </AbsoluteFill>
  );
};
