// EP09 cover (COMICFORGE): "Dua gol, empat menit" — Argentina 2–1 Inggris, 22 Juni 1986.
// A printed comic page with two slanted panels, each its own 3D halftone scene:
//   panel 1 (51'): a #10 in a plain navy/blue away shirt leaps and fists the ball over a taller grey-kit keeper — "TANGAN?!"
//   panel 2 (55'): the same #10 dribbles at speed past a trailing line of white-shirt defenders toward goal — "GOL ABAD INI".
// Facts: HIGH rows of research/RESEARCH_REPORT.md only (2–1, 1986, 51', 55', "Gol Abad Ini"). No seconds/touches/metres.
// Figures are generic comic players (no real faces, no crests). Flat comic finish (no <Finish>), per kit + style memory.
import React, { useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { COMIC_PALETTE as P } from "../../kits/comicforge/lib/palette.ts";
import { rng } from "../../kits/comicforge/core/motion.ts";
import { Inked } from "../../kits/comicforge/scene/Ink.tsx";
import { CameraRig, FigurePose, Footballer, INK, Kit, V3, inkBasic, tone } from "./comic.tsx";
import { adBoardTexture, ballTexture, crowdTexture, pitchTexture } from "./coverTextures.ts";

export const GREEN = "#2BD46A";

// ---------- page layout (px @1080×1920) ----------
export const PAGE_X = 40;
export const PANEL_W = 1000;
export const P1 = { top: 604, h: 612 }; // bottom edge slants 1216 (left) → 1156 (right)
export const P2 = { top: 1176, h: 704 }; // top edge slants 1236 (left) → 1176 (right)

// ---------- materials ----------
export const useKits = (dotPx: number) =>
  useMemo(() => {
    const skin = tone(dotPx, "#F4C9A0", "#C98A5E");
    const hairDark = tone(dotPx, "#2A1E18", "#121014");
    const hairBrown = tone(dotPx, "#6E4426", "#3A2214");
    const boot = tone(dotPx, "#1C1A20", "#0A090C", { spec: 1 });
    const arg: Kit = {
      shirt: tone(dotPx, "#2346B0", "#0F2160"), // 1986 v England: plain navy/blue away shirt
      sleeve: tone(dotPx, "#2346B0", "#0F2160"),
      shorts: tone(dotPx, "#17171C", "#08080A"),
      socks: tone(dotPx, "#FFFFFF", "#9DB0C8"),
      skin,
      hair: hairDark,
      boot,
      curls: true,
      number: "10",
      numberColor: "#FFFFFF",
    };
    const keeper: Kit = {
      shirt: tone(dotPx, "#C4CAD4", "#5E6575"),
      sleeve: tone(dotPx, "#C4CAD4", "#5E6575"),
      shorts: tone(dotPx, "#2A2E3A", "#121420"),
      socks: tone(dotPx, "#C4CAD4", "#5E6575"),
      skin,
      hair: hairBrown,
      boot,
      glove: tone(dotPx, "#FFE100", "#E39A00", { spec: 1 }),
      longSleeves: true,
      face: true,
    };
    const eng: Kit = {
      shirt: tone(dotPx, "#FFFFFF", "#8E9BB4"),
      sleeve: tone(dotPx, "#FFFFFF", "#8E9BB4"),
      shorts: tone(dotPx, "#1E2A6E", "#0C1238"),
      socks: tone(dotPx, "#FFFFFF", "#8E9BB4"),
      skin,
      hair: hairBrown,
      boot,
      face: true,
    };
    return {
      arg,
      keeper,
      eng,
      ball: tone(dotPx, "#FFFFFF", "#9DB0C8", { map: ballTexture(), spec: 1 }),
      post: tone(dotPx, "#FFFFFF", "#9DB0C8", { spec: 1 }),
      pitch: tone(dotPx, "#2FB35A", "#1E7A3E", { map: pitchTexture() }),
    };
  }, [dotPx]);

export type Mats = ReturnType<typeof useKits>;

export const BALL_R = 0.15;
export const Ball: React.FC<{ m: Mats; pos: V3; rot?: V3 }> = ({ m, pos, rot = [0.4, 0.8, 0.2] }) => {
  const g = useMemo(() => new THREE.SphereGeometry(BALL_R, 40, 28), []);
  return <Inked geometry={g} material={m.ball} outline={INK.mid} position={pos} rotation={rot} />;
};

export const Goal: React.FC<{ m: Mats; position: V3; rotY: number }> = ({ m, position, rotY }) => {
  const g = useMemo(
    () => ({ post: new THREE.CapsuleGeometry(0.06, 2.44, 4, 12), bar: new THREE.CapsuleGeometry(0.06, 7.32, 4, 12), net: new THREE.CapsuleGeometry(0.012, 1, 2, 4) }),
    [],
  );
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Inked geometry={g.post} material={m.post} outline={INK.thin} position={[-3.66, 1.22, 0]} />
      <Inked geometry={g.post} material={m.post} outline={INK.thin} position={[3.66, 1.22, 0]} />
      <Inked geometry={g.bar} material={m.post} outline={INK.thin} position={[0, 2.44, 0]} rotation={[0, 0, Math.PI / 2]} />
      {/* net: ink strings sloping back */}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh key={`v${i}`} geometry={g.net} material={inkBasic} position={[-3.5 + i * 0.5, 1.22, -0.6]} rotation={[0.45, 0, 0]} scale={[1, 2.6, 1]} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`h${i}`} geometry={g.net} material={inkBasic} position={[0, 0.25 + i * 0.42, -1.1 + i * 0.2]} rotation={[0, 0, Math.PI / 2]} scale={[1, 7.2, 1]} />
      ))}
    </group>
  );
};

export const Billboard: React.FC<{ tex: THREE.Texture; size: [number, number]; position: V3; face: V3 }> = ({ tex, size, position, face }) => {
  const ref = React.useRef<THREE.Mesh>(null);
  useLayoutEffect(() => {
    ref.current!.lookAt(face[0], position[1], face[2]);
  });
  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
};

// ---------- panel 1: the hand (51') ----------
export const P1_CAM: V3 = [1.95, 0.7, 2.25];
export const P1_TARGET: V3 = [0.05, 1.32, -0.5];
export const MARADONA_JUMP: FigurePose = {
  lean: 0.14,
  head: -0.5,
  armL: { x: -2.86, z: 0.22, bend: -0.22 },
  armR: { x: 0.45, z: 1.0, bend: -1.0 },
  legL: { x: -1.15, bend: 1.75 },
  legR: { x: 0.4, bend: 1.25 },
};
export const KEEPER_REACH: FigurePose = {
  lean: 0.12,
  head: -0.35,
  armL: { x: -0.45, z: 0.4, bend: -0.6 },
  armR: { x: -2.45, z: 0.2, bend: -0.2 },
  legL: { x: -0.5, bend: 0.9 },
  legR: { x: 0.15, bend: 0.4 },
};

export const Panel1Scene: React.FC<{ m: Mats; cam?: V3; target?: V3; fov?: number }> = ({ m, cam = P1_CAM, target = P1_TARGET, fov = 46 }) => (
  <>
    <CameraRig pos={cam} target={target} fov={fov} />
    <Billboard tex={crowdTexture(51, "day")} size={[46, 9]} position={[-11, -1.2, -17]} face={P1_CAM} />
    <Goal m={m} position={[0.6, 0, -2.9]} rotY={0} />
    <Footballer kit={m.keeper} pose={KEEPER_REACH} position={[0.12, 0.1, -1.0]} rotY={0.18} scale={1.16} />
    <Footballer kit={m.arg} pose={MARADONA_JUMP} position={[0, 0.3, 0]} rotY={Math.PI - 0.12} />
    <Ball m={m} pos={[0.42, 2.36, -0.44]} />
  </>
);

// ---------- panel 2: the run (55') ----------
export const P2_CAM: V3 = [-0.4, 1.05, 6.6];
export const P2_TARGET: V3 = [0.8, 0.95, 0.4];
export const RUN: FigurePose = {
  lean: 0.32,
  head: 0.05,
  armL: { x: 0.75, z: 0.35, bend: -1.1 },
  armR: { x: -0.85, z: 0.25, bend: -1.3 },
  legL: { x: -0.95, bend: 0.55 },
  legR: { x: 0.75, bend: 1.55 },
};
export const LUNGE: FigurePose = {
  lean: -0.25,
  side: 0.15,
  head: 0.1,
  armL: { x: -0.4, z: 0.9, bend: -0.5 },
  armR: { x: 0.3, z: 0.7, bend: -0.6 },
  legL: { x: -1.35, z: 0.15, bend: 0.1 },
  legR: { x: 0.2, bend: 1.4 },
};
export const CHASE: FigurePose = {
  lean: 0.2,
  head: 0,
  armL: { x: -0.7, z: 0.2, bend: -1.2 },
  armR: { x: 0.6, z: 0.2, bend: -1.0 },
  legL: { x: 0.6, bend: 1.3 },
  legR: { x: -0.8, bend: 0.6 },
};
export const KEEPER_SET: FigurePose = {
  lean: 0.25,
  head: -0.1,
  armL: { x: -0.6, z: 0.7, bend: -0.6 },
  armR: { x: -0.6, z: 0.7, bend: -0.6 },
  legL: { x: -0.5, z: 0.25, bend: 1.0 },
  legR: { x: -0.5, z: 0.25, bend: 1.0 },
};

export const SpeedLines: React.FC = () => {
  const lines = useMemo(() => {
    const r = rng(955);
    return Array.from({ length: 6 }, () => ({ y: 0.6 + r() * 0.9, z: 0.15 + r() * 0.2, len: 0.3 + r() * 0.35, x0: -0.25 - r() * 0.15, yellow: r() > 0.6 }));
  }, []);
  const yellow = useMemo(() => new THREE.MeshBasicMaterial({ color: P.yellow }), []);
  return (
    <>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x0 - l.len / 2, l.y, l.z]} material={l.yellow ? yellow : inkBasic}>
          <boxGeometry args={[l.len, 0.028, 0.028]} />
        </mesh>
      ))}
    </>
  );
};

export const Panel2Scene: React.FC<{ m: Mats; cam?: V3; target?: V3; fov?: number }> = ({ m, cam = P2_CAM, target = P2_TARGET, fov = 45 }) => {
  const adTex = useMemo(() => {
    const t = adBoardTexture().clone();
    t.repeat.set(3, 1);
    t.needsUpdate = true;
    return t;
  }, []);
  const pitchMat = useMemo(() => {
    const t = pitchTexture().clone();
    t.repeat.set(5, 5);
    t.needsUpdate = true;
    return tone(m.pitch.uniforms.uDot.value as number, "#2FB35A", "#1E7A3E", { map: t });
  }, [m]);
  return (
    <>
      <CameraRig pos={cam} target={target} fov={fov} />
      {/* BG: stand + advertising boards (AUDIRA in-world brand) */}
      <mesh position={[2, 4.2, -13]} rotation={[-0.25, 0, 0]}>
        <planeGeometry args={[64, 12]} />
        <meshBasicMaterial map={crowdTexture(55, "dusk")} transparent toneMapped={false} />
      </mesh>
      <mesh position={[2, 0.55, -9]}>
        <planeGeometry args={[60, 1.1]} />
        <meshBasicMaterial map={adTex} toneMapped={false} />
      </mesh>
      <mesh position={[2, 0.55, -9.02]}>
        <planeGeometry args={[60.2, 1.3]} />
        <meshBasicMaterial color="#121014" />
      </mesh>
      {/* pitch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0, -2]} material={pitchMat}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      {/* MG: goal + keeper ahead, defenders trailing behind */}
      <Goal m={m} position={[6.4, 0, -4.2]} rotY={-Math.PI / 2 + 0.35} />
      <Footballer kit={m.keeper} pose={KEEPER_SET} position={[5.6, 0, -3.7]} rotY={-Math.PI / 2 - 0.1} scale={1.1} />
      <Footballer kit={m.eng} pose={CHASE} position={[-3.4, 0, -5.2]} rotY={Math.PI / 2 + 0.1} />
      <Footballer kit={m.eng} pose={CHASE} position={[-2.2, 0, -2.2]} rotY={Math.PI / 2 - 0.2} />
      <Footballer kit={m.eng} pose={LUNGE} position={[-1.7, 0, -0.4]} rotY={Math.PI / 2 + 0.55} />
      {/* hero */}
      <group position={[0, 0, 2]}>
        <SpeedLines />
      </group>
      <Footballer kit={m.arg} pose={RUN} position={[0, 0.04, 2]} rotY={Math.PI / 2 - 0.15} />
      <Ball m={m} pos={[0.48, BALL_R, 2.06]} />
      {/* contact shadows (flat ink ellipses) */}
      {([[0.15, 2, 0.55], [0.48, 2.06, 0.22], [-1.7, -0.4, 0.6], [-2.2, -2.2, 0.5], [-3.4, -5.2, 0.5], [5.6, -3.7, 0.5]] as const).map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.006, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[r * 1.4, r * 0.7, 1]}>
          <circleGeometry args={[1, 28]} />
          <meshBasicMaterial color="#0E3B1E" transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ))}
      {/* FG: chalk touch line + ball trail dashes */}
      <mesh position={[1, 0.008, 3.7]} rotation={[-Math.PI / 2, 0, 0.05]}>
        <planeGeometry args={[30, 0.14]} />
        <meshBasicMaterial color="#F2F6EE" />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`d${i}`} position={[-0.2 - i * 0.55, 0.01, 2.08 + i * 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85 - i * 0.12} />
        </mesh>
      ))}
    </>
  );
};

// ---------- fonts for the HTML layer ----------
export const useFonts = () => {
  const [handle] = useState(() => delayRender("EP09 cover fonts"));
  useLayoutEffect(() => {
    const faces = [
      new FontFace("EP09Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace("EP09Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }),
    ];
    Promise.all(faces.map((ff) => ff.load()))
      .then((loaded) => loaded.forEach((ff) => (document.fonts as unknown as Set<FontFace>).add(ff)))
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

export const ANTON = "EP09Anton, Impact, sans-serif";
export const GROT = "EP09Grotesk, 'Segoe UI', sans-serif";

// ---------- 2D comic pieces ----------
export const burstPoints = (cx: number, cy: number, spikes: number, rOut: number, rIn: number, seed: number) => {
  const r = rng(seed);
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? rOut * (0.78 + r() * 0.3) : rIn * (0.88 + r() * 0.18);
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad * 0.72).toFixed(1)}`);
  }
  return pts.join(" ");
};

export const DotPattern: React.FC<{ id: string; color: string; cell: number; r: number }> = ({ id, color, cell, r }) => (
  <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <circle cx={cell / 2} cy={cell / 2} r={r} fill={color} />
  </pattern>
);

export const Panel1Bg: React.FC = () => {
  // radial action rays from the ball's screen point
  const cx = 600;
  const cy = 120;
  const rays = useMemo(() => {
    const r = rng(511);
    return Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2 + r() * 0.05;
      const w = 0.035 + r() * 0.03;
      const L = 1600;
      return { d: `M${cx},${cy} L${cx + Math.cos(a - w) * L},${cy + Math.sin(a - w) * L} L${cx + Math.cos(a + w) * L},${cy + Math.sin(a + w) * L} Z`, c: i % 3 === 0 ? P.yellow : "#FFFFFF" };
    });
  }, []);
  return (
    <svg width={PANEL_W} height={P1.h} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <DotPattern id="p1dots" color="#4FA9E3" cell={22} r={6} />
        <radialGradient id="p1glow" cx={cx} cy={cy} r={700} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6E0" />
          <stop offset="0.35" stopColor="#B9E4FA" />
          <stop offset="1" stopColor="#5DB8EC" />
        </radialGradient>
      </defs>
      <rect width={PANEL_W} height={P1.h} fill="url(#p1glow)" />
      <rect width={PANEL_W} height={P1.h} fill="url(#p1dots)" opacity={0.55} />
      {rays.map((ray, i) => (
        <path key={i} d={ray.d} fill={ray.c} opacity={0.75} />
      ))}
    </svg>
  );
};

export const Panel2Bg: React.FC = () => (
  <svg width={PANEL_W} height={P2.h} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <DotPattern id="p2dots" color="#E5007D" cell={22} r={5.5} />
      <linearGradient id="p2sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE100" />
        <stop offset="0.6" stopColor="#FFB0D0" />
      </linearGradient>
    </defs>
    <rect width={PANEL_W} height={P2.h} fill="url(#p2sky)" />
    <rect width={PANEL_W} height={P2.h} fill="url(#p2dots)" opacity={0.35} />
  </svg>
);

export const Box: React.FC<{ children: React.ReactNode; style: React.CSSProperties; bg?: string }> = ({ children, style, bg = P.yellow }) => (
  <div
    style={{
      position: "absolute",
      background: bg,
      border: `5px solid ${P.ink}`,
      boxShadow: `7px 7px 0 ${P.ink}`,
      padding: "6px 18px 4px",
      fontFamily: ANTON,
      color: P.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const NameTag: React.FC<{ name: string; role: string; style: React.CSSProperties }> = ({ name, role, style }) => (
  <div
    style={{
      position: "absolute",
      background: "#FFF6E0",
      border: `4px solid ${P.ink}`,
      boxShadow: `5px 5px 0 ${P.ink}`,
      padding: "4px 14px 4px",
      fontFamily: GROT,
      color: P.ink,
      lineHeight: 1.05,
      ...style,
    }}
  >
    <div style={{ fontFamily: ANTON, fontSize: 36, letterSpacing: 1 }}>{name}</div>
    <div style={{ fontSize: 30, fontWeight: 600 }}>{role}</div>
  </div>
);

export const Cover: React.FC = () => {
  useFonts();
  const { height } = useVideoConfig();
  const dotPx = Math.max(4, Math.round((11 * height) / 1920));
  const m = useKits(dotPx);
  const clip1 = `polygon(0 0, ${PANEL_W}px 0, ${PANEL_W}px ${P1.h - 60}px, 0 ${P1.h}px)`;
  const clip2 = `polygon(0 60px, ${PANEL_W}px 0, ${PANEL_W}px ${P2.h}px, 0 ${P2.h}px)`;
  return (
    <AbsoluteFill style={{ background: P.skyTop }}>
      {/* page: night-purple newsprint with magenta Ben-Day dots */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <DotPattern id="pagedots" color="#5A2E9C" cell={26} r={7} />
        </defs>
        <rect width={1080} height={1920} fill="url(#pagedots)" />
      </svg>

      {/* panel 1 */}
      <div style={{ position: "absolute", left: PAGE_X, top: P1.top, width: PANEL_W, height: P1.h, clipPath: clip1 }}>
        <Panel1Bg />
        <ThreeCanvas width={PANEL_W} height={P1.h} gl={{ antialias: true, alpha: true }} camera={{ position: P1_CAM, fov: 40 }} style={{ position: "absolute", inset: 0 }}>
          <Panel1Scene m={m} />
        </ThreeCanvas>
      </div>
      {/* panel 2 */}
      <div style={{ position: "absolute", left: PAGE_X, top: P2.top, width: PANEL_W, height: P2.h, clipPath: clip2 }}>
        <Panel2Bg />
        <ThreeCanvas width={PANEL_W} height={P2.h} gl={{ antialias: true, alpha: true }} camera={{ position: P2_CAM, fov: 40 }} style={{ position: "absolute", inset: 0 }}>
          <Panel2Scene m={m} />
        </ThreeCanvas>
      </div>
      {/* panel ink borders */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`${PAGE_X},${P1.top} ${PAGE_X + PANEL_W},${P1.top} ${PAGE_X + PANEL_W},${P1.top + P1.h - 60} ${PAGE_X},${P1.top + P1.h}`} fill="none" stroke={P.ink} strokeWidth={9} strokeLinejoin="miter" />
        <polygon points={`${PAGE_X},${P2.top + 60} ${PAGE_X + PANEL_W},${P2.top} ${PAGE_X + PANEL_W},${P2.top + P2.h} ${PAGE_X},${P2.top + P2.h}`} fill="none" stroke={P.ink} strokeWidth={9} strokeLinejoin="miter" />
      </svg>

      {/* ---------- lettering ---------- */}
      <div style={{ position: "absolute", left: 56, top: 190, background: P.ink, padding: "6px 16px 4px", fontFamily: GROT, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: GREEN }}>
        SEJARAH SEPAK BOLA #09
      </div>
      <div style={{ position: "absolute", right: 56, top: 190, background: P.yellow, border: `4px solid ${P.ink}`, boxShadow: `5px 5px 0 ${P.ink}`, padding: "4px 14px 2px", fontFamily: ANTON, fontSize: 32, letterSpacing: 2, color: P.ink, transform: "rotate(2deg)" }}>
        AUDIRA
      </div>
      <div style={{ position: "absolute", left: 50, top: 252, fontFamily: ANTON, lineHeight: 0.98, transform: "rotate(-3deg) skewX(-6deg)", transformOrigin: "left top" }}>
        <div style={{ fontSize: 132, color: "#FFFFFF", WebkitTextStroke: `5px ${P.ink}`, paintOrder: "stroke fill", textShadow: `8px 8px 0 ${P.ink}` }}>DUA GOL,</div>
        <div style={{ fontSize: 132, color: P.yellow, WebkitTextStroke: `5px ${P.ink}`, paintOrder: "stroke fill", textShadow: `8px 8px 0 ${P.ink}` }}>EMPAT MENIT</div>
      </div>
      <Box style={{ left: 60, top: 522, fontSize: 40, background: "#FFF6E0", fontFamily: GROT, fontWeight: 700, letterSpacing: 0.5, padding: "4px 18px 4px" }}>
        Argentina 2–1 Inggris · 1986
      </Box>

      {/* panel 1 lettering */}
      <Box style={{ left: 66, top: 628, fontSize: 40, letterSpacing: 1 }}>MENIT 51</Box>
      <div style={{ position: "absolute", left: 690, top: P1.top + 34, transform: "scale(0.82)", transformOrigin: "left top" }}>
        <svg width={440} height={260} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <polygon points={burstPoints(215, 125, 15, 225, 150, 909)} fill={P.ink} transform="translate(9,9)" />
          <polygon points={burstPoints(215, 125, 15, 225, 150, 909)} fill={P.red} stroke={P.ink} strokeWidth={7} />
          <polygon points={burstPoints(215, 125, 13, 168, 128, 911)} fill={P.yellow} />
        </svg>
        <div style={{ position: "absolute", left: 0, top: 58, width: 430, textAlign: "center", fontFamily: ANTON, fontSize: 112, lineHeight: 1, color: P.red, WebkitTextStroke: `6px ${P.ink}`, paintOrder: "stroke fill", transform: "rotate(-6deg)", textShadow: `6px 6px 0 ${P.ink}` }}>
          TANGAN?!
        </div>
      </div>
      <NameTag name="MARADONA" role="Argentina #10" style={{ left: 70, top: 1040 }} />
      <NameTag name="SHILTON" role="kiper Inggris" style={{ left: 712, top: 1012, transform: "rotate(-2deg)" }} />

      {/* panel 2 lettering (kept above the caption band y 1290–1540) */}
      <Box style={{ right: 66, top: 1200, fontSize: 54, letterSpacing: 1, transform: "rotate(-2deg)" }}>
        MENIT 55 · GOL ABAD INI
      </Box>
    </AbsoluteFill>
  );
};
