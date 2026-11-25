/**
 * drei (pmndrs, MIT) components that are safe in Remotion, with AUDIRA presets.
 *
 * Remotion renders frames out of order and in several browser tabs, so a component may only depend
 * on the frame being drawn. Each wrapper here has been checked for that (same frame twice, any order):
 *   GroundShadow  ContactShadows: soft contact shadow under the subject; fixes "subject melts into the floor"
 *   Glass         MeshTransmissionMaterial: real refraction, thickness, chromatic aberration (temporal distortion off)
 *   SceneText     Text (troika SDF): crisp text inside the 3D world (brand in scene), held with delayRender until laid out
 *   InkOutline    Outlines: inverted-hull ink line for toon / comic / felt looks
 *   WetFloor      MeshReflectorMaterial: blurred floor reflection for night, rain and studio floors
 *
 * Not wrapped on purpose: drei parts animated by the R3F clock (Float, Sparkles, Clouds, Stars,
 * Wobble/Distort materials with speed, temporalDistortion > 0) and AccumulativeShadows (accumulates over
 * frames). They look right in the studio and differ per tab in the render. Drive motion from
 * useCurrentFrame instead, or bake it.
 *
 * Use inside <ThreeCanvas>, together with <Finish> (Finish provides the environment Glass refracts).
 */

import React, { useLayoutEffect, useRef } from "react";
import { ContactShadows, MeshReflectorMaterial, MeshTransmissionMaterial, Outlines, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";

/** Soft contact shadow on a ground plane at y. Scale = footprint size in world units. */
export const GroundShadow: React.FC<{
  y?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  far?: number;
  color?: string;
  resolution?: number;
  x?: number;
  z?: number;
}> = ({ y = 0.002, scale = 6, opacity = 0.6, blur = 2.4, far = 2.5, color = "#000000", resolution = 1024, x = 0, z = 0 }) => (
  <ContactShadows position={[x, y, z]} scale={scale} opacity={opacity} blur={blur} far={far} color={color} resolution={resolution} />
);

export const GLASS = {
  /** clear lab glass: crisp refraction, a hint of dispersion */
  clear: { thickness: 0.6, roughness: 0.02, ior: 1.45, chromaticAberration: 0.05, anisotropy: 0.1, distortion: 0, color: "#ffffff" },
  /** frosted: soft, milky blur behind (GLASSCRAFT panels) */
  frosted: { thickness: 1.2, roughness: 0.35, ior: 1.4, chromaticAberration: 0.02, anisotropy: 0.2, distortion: 0, color: "#f4f7ff" },
  /** thick tinted crystal (KINTSUGI, TERRARIUM domes, gems) */
  crystal: { thickness: 2.2, roughness: 0.05, ior: 1.7, chromaticAberration: 0.12, anisotropy: 0.3, distortion: 0.05, color: "#dff3ff" },
} as const;

/**
 * Transmission glass as a material: put it inside a <mesh> in place of meshPhysicalMaterial.
 * temporalDistortion is forced to 0 (it is driven by the clock). `samples` 6–10 is enough at 1080p.
 */
export const Glass: React.FC<{
  preset?: keyof typeof GLASS;
  color?: string;
  samples?: number;
  resolution?: number;
  backside?: boolean;
  thickness?: number;
  roughness?: number;
}> = ({ preset = "clear", samples = 8, resolution = 1024, backside = false, ...over }) => {
  const p = { ...GLASS[preset], ...Object.fromEntries(Object.entries(over).filter(([, v]) => v !== undefined)) };
  return <MeshTransmissionMaterial {...p} samples={samples} resolution={resolution} backside={backside} temporalDistortion={0} transmission={1} />;
};

/** Bundled TTF faces (troika cannot read woff2). Licences in public/fonts/licenses. */
export const SCENE_FONTS = {
  display: "fonts/Anton-Regular.ttf",
  serif: "fonts/InstrumentSerif-Regular.ttf",
  serifItalic: "fonts/InstrumentSerif-Italic.ttf",
  sans: "fonts/SpaceGrotesk-Variable.ttf",
  pixel: "fonts/Silkscreen-Regular.ttf",
  pixelBold: "fonts/Silkscreen-Bold.ttf",
} as const;

/**
 * Text inside the 3D world (troika SDF via drei <Text>). Layout happens in a worker, so the frame is held
 * with delayRender until the text has synced; a changing string (a counter) takes a new hold each time.
 * Any other drei <Text> prop passes through (anchorX, maxWidth, letterSpacing, outlineWidth, ...).
 */
export const SceneText: React.FC<
  Omit<React.ComponentProps<typeof Text>, "font" | "children"> & { children: string; font?: keyof typeof SCENE_FONTS | string }
> = ({ children, font = "display", ...props }) => {
  // troika fetches the font inside a blob: worker, where a root-relative path resolves to nothing and
  // the text never syncs: pass an absolute URL
  const rel = font in SCENE_FONTS ? staticFile(SCENE_FONTS[font as keyof typeof SCENE_FONTS]) : String(font);
  const url = typeof window === "undefined" ? rel : new URL(rel, window.location.href).href;
  const key = `${url}|${children}`;
  // The hold is taken in a layout effect, not during render: drei's <Text> suspends while the font
  // loads, and a render that suspends is thrown away, so a handle taken there would never be released.
  // drei calls sync in its own layout effect (it runs first, the glyphs arrive later from the worker).
  const synced = useRef<string | null>(null);
  const pending = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (synced.current === key) return;
    const h = delayRender(`SceneText "${children}"`, { timeoutInMilliseconds: 60000 });
    pending.current = h;
    return () => {
      if (pending.current === h) {
        pending.current = null;
        continueRender(h);
      }
    };
  }, [key, children]);
  // Remotion's ThreeCanvas draws once per frame (frameloop "never"). Glyphs that arrive after that draw
  // would stay invisible in this frame's screenshot, so draw again, then release the frame.
  const advance = useThree((s) => s.advance);
  const onSync = () => {
    synced.current = key;
    advance(performance.now()); // det-ok: redraw timestamp only
    if (pending.current !== null) {
      const h = pending.current;
      pending.current = null;
      requestAnimationFrame(() => continueRender(h));
    }
  };
  return (
    <Text font={url} sdfGlyphSize={128} {...props} onSync={onSync}>
      {children}
    </Text>
  );
};

/** Ink outline for toon looks: a child of the <mesh> it outlines. */
export const InkOutline: React.FC<{ thickness?: number; color?: string; opacity?: number }> = ({ thickness = 0.03, color = "#141018", opacity = 1 }) => (
  <Outlines thickness={thickness} color={color} opacity={opacity} transparent={opacity < 1} />
);

/** Reflective floor (a <mesh> with a plane, rotated flat). mirror 0 = matte, 1 = mirror. */
export const WetFloor: React.FC<{
  size?: number;
  y?: number;
  color?: string;
  mirror?: number;
  blur?: number;
  roughness?: number;
  resolution?: number;
}> = ({ size = 30, y = 0, color = "#101014", mirror = 0.6, blur = 280, roughness = 0.75, resolution = 1024 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <MeshReflectorMaterial
      color={color}
      mirror={mirror}
      blur={[blur, blur / 3]}
      resolution={resolution}
      mixBlur={1}
      mixStrength={1.4}
      roughness={roughness}
      metalness={0.4}
      depthScale={1}
      minDepthThreshold={0.4}
      maxDepthThreshold={1.4}
    />
  </mesh>
);
