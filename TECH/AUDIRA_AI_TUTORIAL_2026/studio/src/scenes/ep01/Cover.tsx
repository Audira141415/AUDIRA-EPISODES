// EP01 cover — "PDF JADI PPT OTOMATIS" in PAPERWORLD.
// A thick stack of document sheets (lower left) lifts its pages one by one; each page folds like
// origami on its way across and lands as a coloured slide card in a fanned deck (right).
// Warm low side light, soft shadows, shallow depth of field. Deterministic: everything from the frame.

import React, { useMemo } from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CanvasTexture, PCFShadowMap, SRGBColorSpace } from "three";
import { loadFont } from "@remotion/google-fonts/Fraunces";
import { Stage, type Light, type Shot } from "../../kits/paperworld/render/Stage.tsx";
import { hash01, mix } from "../../kits/paperworld/motion/easing.ts";
import { Ground, PaperCloud, PaperHill } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { Cut, Hinge, Print, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { PALETTE } from "../../kits/paperworld/tokens.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";

const { fontFamily: SERIF } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });

const LIGHT: Light = {
  dir: [-0.85, 0.5, 0.38],
  key: "#ffe6c4",
  keyI: 2.8,
  fill: "#e6ecf5",
  fillI: 0.45,
  sky: "#fdf3e3",
  ground: "#c9a883",
  hemiI: 1.1,
  bg: "#efe2cc",
  exposure: 1.0,
  shadowSize: 30,
  shadowSoft: 5,
};

// ── Printed labels (canvas texture, drawn once per module) ───────────────────

const labelCache = new Map<string, CanvasTexture>();
const label = (text: string, bg: string, fg: string, w = 512, h = 192, size = 120) => {
  const key = `${text}|${bg}|${fg}|${w}|${h}|${size}`;
  let t = labelCache.get(key);
  if (!t) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.font = `900 ${size}px "Arial Black", "Segoe UI", sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + size * 0.04);
    t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    labelCache.set(key, t);
  }
  return t;
};

const Label: React.FC<{ text: string; bg: string; fg: string; w: number; h: number; position?: V3; rotation?: V3; px?: [number, number, number] }> = ({
  text,
  bg,
  fg,
  w,
  h,
  position,
  rotation,
  px = [512, 192, 120],
}) => {
  const map = useMemo(() => label(text, bg, fg, px[0], px[1], px[2]), [text, bg, fg, px]);
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={map} roughness={0.92} metalness={0} />
    </mesh>
  );
};

// ── Document sheet (local XY, face +z) ───────────────────────────────────────

const SW = 5, SH = 7;
const lineW = [3.6, 3.9, 3.2, 3.8, 3.5, 2.6, 3.9, 3.4, 3.7, 2.2];

const PrintedLines: React.FC<{ w: number; h: number; z: number; ink?: string; head?: string }> = ({ w, h, z, ink = "ivoryShade", head = "brownLight" }) => (
  <group position={[0, 0, z]}>
    <Print shape={S.rectC(w * 0.55, 0.32, 0.08)} color={head} position={[-w * 0.18, h * 0.36, 0]} />
    {lineW.map((lw, i) => (
      <Print key={i} shape={S.rectC(lw * (w / SW), 0.13, 0.05)} color={ink} position={[-(w * 0.78 - lw * (w / SW)) / 2, h * 0.22 - i * (h * 0.075), 0]} />
    ))}
  </group>
);

const Sheet: React.FC<{ color?: string; printed?: boolean; position?: V3; rotation?: V3 }> = ({ color = "ivoryLight", printed = true, position, rotation }) => (
  <group position={position} rotation={rotation}>
    <Cut shape={S.rectC(SW, SH, 0.06)} color={color} depth={0.035} />
    {printed && <PrintedLines w={SW} h={SH} z={0.02} />}
  </group>
);

/** A sheet folded in half along its vertical centre line (book fold). */
const HalfFold: React.FC<{ angle: number; color?: string; back?: string; position?: V3; rotation?: V3 }> = ({ angle, color = "ivoryLight", back, position, rotation }) => (
  <group position={position} rotation={rotation}>
    <Cut shape={S.rectC(SW / 2, SH, 0.04)} color={color} depth={0.035} position={[-SW / 4, 0, 0]} />
    <group position={[-SW / 4, 0, 0.02]}>
      <PrintedLines w={SW / 2} h={SH} z={0} />
    </group>
    <Hinge at={[0, 0, 0]} axis="y" angle={angle}>
      <Cut shape={S.rectC(SW / 2, SH, 0.04)} color={back ?? color} depth={0.035} position={[SW / 4, 0, 0]} />
      <group position={[SW / 4, 0, 0.02]}>
        <PrintedLines w={SW / 2} h={SH} z={0} ink={back ? "coralLight" : "ivoryShade"} head={back ? "ivoryLight" : "brownLight"} />
      </group>
    </Hinge>
  </group>
);

/** Square sheet as a diamond, folded along its vertical diagonal — two triangles (origami step). */
const r = 3.0;
const TRI_L = S.poly("ep01-tri-l", [[0, -r], [0, r], [-r, 0]]);
const TRI_R = S.poly("ep01-tri-r", [[0, -r], [r, 0], [0, r]]);
const Origami: React.FC<{ angle: number; a: string; b: string; position?: V3; rotation?: V3 }> = ({ angle, a, b, position, rotation }) => (
  <group position={position} rotation={rotation}>
    <Cut shape={TRI_L} color={a} depth={0.035} />
    <Hinge at={[0, 0, 0]} axis="y" angle={angle}>
      <Cut shape={TRI_R} color={b} depth={0.035} />
    </Hinge>
  </group>
);

// ── Slide cards (16:9, local XY, base on y=0, face +z) ───────────────────────

const CW = 5.6, CH = 3.15;
type Kind = "title" | "chart" | "points" | "plain";

const SlideCard: React.FC<{ kind: Kind; color: string; accent: string; position?: V3; rotation?: V3 }> = ({ kind, color, accent, position, rotation }) => {
  const zf = 0.08;
  return (
    <group position={position} rotation={rotation}>
      {/* board back (kraft) + dyed face */}
      <Cut shape={S.rect(CW + 0.16, CH + 0.16, 0.14)} color="brownLight" depth={0.12} position={[0, -0.08, -0.08]} />
      <Cut shape={S.rect(CW, CH, 0.12)} color={color} depth={0.08} />
      {kind === "title" && (
        <group position={[0, 0, zf]}>
          <Cut shape={S.rectC(3.6, 0.62, 0.1)} color="ivoryLight" depth={0.06} position={[-0.6, 2.05, 0.02]} />
          <Cut shape={S.rectC(2.4, 0.22, 0.06)} color={accent} depth={0.04} position={[-1.2, 1.45, 0.02]} />
          <Cut shape={S.rectC(1.7, 0.22, 0.06)} color={accent} depth={0.04} position={[-1.55, 1.1, 0.02]} />
          <Cut shape={S.circle(0.62)} color="goldLight" depth={0.1} position={[1.9, 0.85, 0.04]} />
          <Cut shape={S.star(0.42)} color="goldDeep" depth={0.06} position={[1.9, 0.85, 0.12]} />
          <Label text="AUDIRA" bg={PALETTE.ink} fg={PALETTE.ivoryLight} w={1.5} h={0.42} position={[-1.55, 0.5, 0.07]} px={[512, 144, 100]} />
        </group>
      )}
      {kind === "chart" && (
        <group position={[0, 0, zf]}>
          <Cut shape={S.rectC(2.6, 0.24, 0.08)} color="ivoryLight" depth={0.04} position={[-1.2, 2.75, 0.02]} />
          <Cut shape={S.rectC(4.6, 0.06, 0.02)} color="ivoryLight" depth={0.04} position={[0, 0.4, 0.02]} />
          {[0.9, 1.4, 1.15, 1.9, 2.15].map((h, i) => (
            <Cut key={i} shape={S.rect(0.62, h, 0.06)} color={["gold", "coralLight", "mintLight", "gold", "coral"][i]} depth={0.32}
              position={[-1.8 + i * 0.9, 0.43, 0.18]} />
          ))}
        </group>
      )}
      {kind === "points" && (
        <group position={[0, 0, zf]}>
          <Cut shape={S.rectC(2.8, 0.3, 0.08)} color="ivoryLight" depth={0.05} position={[-1.1, 2.65, 0.02]} />
          {[0, 1, 2].map((i) => (
            <group key={i} position={[0, 1.95 - i * 0.62, 0.02]}>
              <Cut shape={S.circle(0.17)} color={accent} depth={0.12} position={[-2.15, 0, 0.04]} />
              <Cut shape={S.rectC(3.4 - i * 0.6, 0.2, 0.06)} color="ivoryLight" depth={0.04} position={[-1.75 + (3.4 - i * 0.6) / 2, 0, 0]} />
            </group>
          ))}
        </group>
      )}
    </group>
  );
};

// ── Small props ──────────────────────────────────────────────────────────────

const clipMat = { ...POLISH.toyPlastic, color: "#2c2622" } as const;
const BinderClip: React.FC<{ position?: V3; rotation?: V3 }> = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow receiveShadow position={[0, 0, 0]}>
      <RoundedBoxGeo args={[1.5, 0.75, 0.55]} radius={0.12} />
      <meshPhysicalMaterial {...clipMat} />
    </mesh>
    {/* wire handles */}
    {[-0.45, 0.45].map((x) => (
      <mesh key={x} castShadow position={[x, 0.55, -0.35]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 8]} />
        <meshPhysicalMaterial color="#bfb6aa" roughness={0.35} metalness={0.8} />
      </mesh>
    ))}
    <mesh castShadow position={[0, 0.98, -0.58]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.045, 0.045, 0.95, 8]} />
      <meshPhysicalMaterial color="#bfb6aa" roughness={0.35} metalness={0.8} />
    </mesh>
  </group>
);

const confetti: { p: V3; c: string; s: number; ry: number; rz: number }[] = Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  return {
    p: [mix(-3.2, 4.2, t) + (hash01(i * 7.1) - 0.5) * 1.6, 5.0 + Math.sin(t * Math.PI) * 4.6 + (hash01(i * 3.3) - 0.5) * 1.4, mix(4, -1, t) + (hash01(i * 5.7) - 0.5) * 2],
    c: ["coral", "mint", "gold", "cobaltLight", "coralLight"][i % 5],
    s: 0.22 + hash01(i * 1.9) * 0.2,
    ry: hash01(i * 2.3) * 6.28,
    rz: hash01(i * 4.1) * 6.28,
  };
});
const TRI_SMALL = S.poly("ep01-confetti", [[-0.5, -0.4], [0.5, -0.4], [0, 0.5]]);

// ── Scene ────────────────────────────────────────────────────────────────────

const STACK_AT: V3 = [-2.9, 0, 1.8];
const N_SHEETS = 46;
const STEP = 0.075;

export const Ep01Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = frame / fps;
  const bob = (k: number) => Math.sin(s * 1.6 + k) * 0.08;

  const shot: Shot = {
    pos: [-1.0 + s * 0.06, 13.5, 40],
    target: [0.9, 5.4, 0],
    fov: 38,
    focus: 40,
    aperture: 0.0007,
    maxBlur: 0.0035,
  };
  const stackTop = N_SHEETS * STEP;

  return (
    <AbsoluteFill style={{ backgroundColor: LIGHT.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: 38, position: [0, 10, 33] }}>
        <Stage shot={shot} light={LIGHT} frame={frame} center={[0, 2, 0]}>
          <Ground color="ivory" />
          {/* background: paper backdrop wall with cut-out hills, sun and clouds */}
          <Cut shape={S.rect(80, 40)} color="ivoryShade" depth={0.3} position={[0, 0, -16]} cast={false} />
          <Cut shape={S.circle(5.2)} color="goldLight" depth={0.12} position={[7.5, 15.5, -15.6]} />
          <Cut shape={S.circle(3.8)} color="gold" depth={0.12} position={[7.5, 15.5, -15.4]} />
          <PaperHill w={40} h={6} color="mintLight" position={[-8, 0, -14]} skew={2} />
          <PaperHill w={34} h={4.2} color="mint" position={[10, 0, -12.5]} skew={-2} />
          <PaperCloud w={5} color="ivoryLight" position={[-7.5, 14.5, -13]} threadTo={30} />
          <PaperCloud w={3.6} color="ivoryLight" position={[3.5, 17.5, -12]} threadTo={30} />

          {/* PDF stack: many sheets, slightly misaligned */}
          <group position={STACK_AT} rotation={[0, 0.28, 0]}>
            {Array.from({ length: N_SHEETS }, (_, i) => (
              <Cut key={i} shape={S.rectC(SW, SH, 0.06)} color={i % 9 === 4 ? "ivoryShade" : "ivoryLight"} depth={0.05}
                position={[(hash01(i * 1.7) - 0.5) * 0.22, i * STEP + 0.03, (hash01(i * 2.9) - 0.5) * 0.22]}
                rotation={[-Math.PI / 2, 0, (hash01(i * 4.3) - 0.5) * 0.05]} />
            ))}
            <group position={[0, stackTop + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0.02]}>
              <PrintedLines w={SW} h={SH} z={0} />
            </group>
            <group position={[-1.0, stackTop + 0.07, 2.2]} rotation={[-Math.PI / 2, 0, 0.04]}>
              <Cut shape={S.rectC(1.9, 0.82, 0.12)} color="coral" depth={0.04} />
              <Label text="PDF" bg={PALETTE.coral} fg={PALETTE.ivoryLight} w={1.6} h={0.6} position={[0, 0, 0.03]} px={[384, 144, 110]} />
            </group>
            {/* coral PDF tab sticking out of the side */}
            <group position={[SW / 2 + 0.35, stackTop * 0.55, -1.4]} rotation={[0, Math.PI / 2, 0]}>
              <Cut shape={S.rectC(1.3, 0.62, 0.12)} color="coral" depth={0.04} />
              <Label text="PDF" bg={PALETTE.coral} fg={PALETTE.ivoryLight} w={1.1} h={0.42} position={[0, 0, 0.03]} px={[384, 144, 110]} />
            </group>
            {/* binder clip on the front edge with an AUDIRA tag */}
            <BinderClip position={[1.0, stackTop * 0.5 + 0.05, SH / 2 - 0.05]} />
            <group position={[1.0, stackTop * 0.5 - 1.05, SH / 2 + 0.34]} rotation={[0.05, 0, 0.06]}>
              <Cut shape={S.rectC(2.0, 0.78, 0.12)} color="ivoryLight" depth={0.04} />
              <Label text="AUDIRA" bg={PALETTE.ivoryLight} fg={PALETTE.ink} w={1.8} h={0.6} position={[0, 0, 0.03]} px={[512, 170, 118]} />
            </group>
          </group>

          {/* flight path: lift → fold → origami → card */}
          <group scale={0.7}><Sheet position={[-3.8, (stackTop + 1.4) / 0.7 + bob(0), 2.6]} rotation={[-1.15, 0.35, 0.18]} /></group>
          <group scale={0.62}><HalfFold angle={-1.0} position={[-1.6, 9.2 + bob(1), 1.6]} rotation={[-0.35, 0.55, 0.22]} /></group>
          <group scale={0.62}><Origami angle={-1.25} a="ivoryLight" b="coralLight" position={[3.4, 10.6 + bob(2), 0.2]} rotation={[-0.25, 0.7, -0.4]} /></group>
          <group position={[5.0, 10.9 + bob(3), -3.2]} rotation={[-0.45, -0.35, -0.22]} scale={0.66}>
            <SlideCard kind="points" color="cobalt" accent="gold" position={[0, -CH / 2, 0]} />
          </group>
          {confetti.map((c, i) => (
            <Cut key={i} shape={TRI_SMALL} color={c.c} depth={0.03} scale={c.s} position={[c.p[0], c.p[1] + bob(i), c.p[2]]} rotation={[0.4, c.ry, c.rz]} />
          ))}

          {/* the deck: fanned slide cards on stepped kraft blocks */}
          {[
            { kind: "plain" as Kind, color: "goldLight", accent: "goldDeep", x: 5.2, y: 2.9, z: -6.0 },
            { kind: "points" as Kind, color: "mint", accent: "coral", x: 4.6, y: 1.9, z: -4.0 },
            { kind: "chart" as Kind, color: "cobalt", accent: "gold", x: 3.9, y: 0.95, z: -2.0 },
            { kind: "title" as Kind, color: "coral", accent: "ivoryLight", x: 3.2, y: 0.0, z: 0.0 },
          ].map((c, i) => (
            <group key={i} position={[c.x, 0, c.z]} rotation={[0, -0.32, 0]}>
              {c.y > 0 && (
                <mesh castShadow receiveShadow position={[0, c.y / 2, -0.6]} material={paperFace("brownLight")}>
                  <RoundedBoxGeo args={[CW * 0.9, c.y, 1.6]} radius={0.08} />
                </mesh>
              )}
              <SlideCard kind={c.kind} color={c.color} accent={c.accent} position={[0, c.y, 0]} rotation={[-0.12, 0, 0]} />
            </group>
          ))}

          {/* foreground: out-of-focus loose sheet and pencil */}
          <Sheet position={[-5.5, 0.4, 13]} rotation={[-Math.PI / 2 + 0.08, 0, 0.5]} />
          <group position={[5.5, 0.35, 12.5]} rotation={[0, 0.9, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.35, 0.35, 7, 6]} />
              <meshPhysicalMaterial {...POLISH.paper} color={PALETTE.gold} />
            </mesh>
            <mesh castShadow position={[0, 4.0, 0]}>
              <coneGeometry args={[0.35, 1.0, 6]} />
              <meshPhysicalMaterial {...POLISH.paper} color="#e8c9a2" />
            </mesh>
          </group>
        </Stage>
        <Finish frame={frame} background={LIGHT.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
      </ThreeCanvas>

      {/* typography */}
      <AbsoluteFill style={{ padding: "262px 70px 0 70px", pointerEvents: "none" }}>
        <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 14, background: PALETTE.ink, color: PALETTE.ivoryLight,
          padding: "12px 22px", borderRadius: 6, fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: 6,
          boxShadow: "0 6px 0 rgba(59,42,34,0.18)", transform: "rotate(-1.5deg)" }}>
          AUDIRA AI TUTORIAL
        </div>
        <div style={{ marginTop: 26, fontFamily: SERIF, fontWeight: 900, fontSize: 138, lineHeight: 0.98, color: PALETTE.ink, letterSpacing: -2,
          textShadow: "0 5px 0 rgba(255,249,238,0.9), 0 12px 18px rgba(59,42,34,0.18)" }}>
          <div>PDF JADI</div>
          <div><span style={{ background: PALETTE.coral, color: PALETTE.ivoryLight, padding: "0 22px", borderRadius: 8, textShadow: "none",
            boxShadow: "0 8px 0 rgba(196,97,79,0.55)", display: "inline-block", transform: "rotate(-2deg)" }}>PPT</span></div>
          <div>OTOMATIS</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Manrope is bundled locally (public/fonts); register it for the kicker line.
if (typeof document !== "undefined" && !document.getElementById("ep01-manrope")) {
  const st = document.createElement("style");
  st.id = "ep01-manrope";
  st.textContent = `@font-face{font-family:Manrope;font-weight:600;src:url(${staticFile("fonts/manrope-latin-600-normal.woff2")}) format("woff2");}`;
  document.head.appendChild(st);
}
