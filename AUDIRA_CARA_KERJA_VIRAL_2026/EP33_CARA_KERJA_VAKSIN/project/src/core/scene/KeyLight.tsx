// KeyLight — three-point light rig with a PCF shadow-casting key, sized for one scene scale.
//
//   <KeyLight extent={4} />                                  desk-scale scene (~4 units across)
//   <KeyLight extent={4} keyPos={[3, 6, 4]} keyColor="#ffe9cf" fill={0.5} rim="#7be0ff" />
//
// FilmScene enables PCF shadows on the canvas; this rig casts them. `extent` is the half-size of the
// shadow camera box: keep it just larger than the subject so shadow texels stay sharp.

import React from "react";

export const KeyLight: React.FC<{
  /** Half-size of the shadow frustum in world units. Default 4. */
  extent?: number;
  /** Key light position (it aims at the origin). */
  keyPos?: [number, number, number];
  keyColor?: string;
  keyIntensity?: number;
  /** Ambient fill intensity. Default 0.35. */
  fill?: number;
  fillColor?: string;
  /** Rim/back light colour; null disables it. */
  rim?: string | null;
  rimIntensity?: number;
  /** Shadow map resolution. Default 2048. */
  mapSize?: number;
}> = ({
  extent = 4,
  keyPos = [3, 6, 4],
  keyColor = "#fff4e6",
  keyIntensity = 2.2,
  fill = 0.35,
  fillColor = "#ffffff",
  rim = "#9ec9ff",
  rimIntensity = 0.9,
  mapSize = 2048,
}) => {
  const far = Math.hypot(...keyPos) + extent * 2;
  return (
    <>
      <ambientLight intensity={fill} color={fillColor} />
      <hemisphereLight args={[fillColor, "#20242a", fill * 0.6]} />
      <directionalLight
        position={keyPos}
        intensity={keyIntensity}
        color={keyColor}
        castShadow
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-near={0.1}
        shadow-camera-far={far}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {rim ? <directionalLight position={[-keyPos[0] * 0.8, keyPos[1] * 0.6, -Math.abs(keyPos[2]) - 2]} intensity={rimIntensity} color={rim} /> : null}
    </>
  );
};
