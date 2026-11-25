// EP06 cabinet: the kit's CrtCabinet3D with an episode raster (draw) and our own marquee text.
// Geometry, CRT shader, halos and control deck are the kit's (kits/arcadecrt/scene/CrtCabinet3D.tsx).
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ARCADE_PALETTE as P } from "../../../kits/arcadecrt/lib/palette";
import { canvasTex, makeCrtMaterial, makeGlowTexture, makeSideArt } from "../../../kits/arcadecrt/lib/materials";
import { RASTER, SCREEN, screenNormal } from "../../../kits/arcadecrt/scene/CrtCabinet3D";
import type { V3 } from "../../../kits/arcadecrt/core/motion";

export type Draw = (ctx: CanvasRenderingContext2D, t: number) => void;

const profile = () => {
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    [-0.5, 0], [0.45, 0], [0.45, 0.92], [0.68, 1.02], [0.68, 1.1], [0.3, 1.2], [0.18, 1.95], [0.48, 2.04], [0.48, 2.36], [-0.5, 2.36],
  ];
  pts.forEach(([z, y], i) => (i ? s.lineTo(z, y) : s.moveTo(z, y)));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false });
  g.rotateY(-Math.PI / 2);
  g.translate(0.6, 0, 0);
  return g;
};

const marqueeTex = (title: string, sub: string, col: string) =>
  canvasTex(1024, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#2A0F5C");
    g.addColorStop(1, "#0D0626");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 256);
    ctx.font = `italic 900 ${title.length > 11 ? 104 : 124}px 'Arial Black', Impact, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 16;
    ctx.strokeStyle = P.magenta;
    ctx.strokeText(title, 512, 126);
    ctx.fillStyle = col;
    ctx.fillText(title, 512, 126);
    ctx.fillStyle = P.cyan;
    ctx.font = "700 30px 'Courier New', monospace";
    ctx.fillText(sub, 512, 225);
  });

export const Cab: React.FC<{
  t: number;
  draw: Draw;
  power?: number;
  title?: string;
  sub?: string;
  titleColor?: string;
  position?: V3;
  rotY?: number;
  glow?: string;
}> = ({ t, draw, power = 1, title = "KASTIL PIKSEL", sub = "1 PLAYER  •  25¢", titleColor = P.yellow, position = [0, 0, 0], rotY = 0, glow = P.cyan }) => {
  const res = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = RASTER.w;
    canvas.height = RASTER.h;
    const gameTex = new THREE.CanvasTexture(canvas);
    gameTex.colorSpace = THREE.SRGBColorSpace;
    gameTex.magFilter = THREE.NearestFilter;
    gameTex.minFilter = THREE.LinearFilter;
    gameTex.generateMipmaps = false;
    const crt = makeCrtMaterial(gameTex);
    const side = makeSideArt();
    side.repeat.set(1 / 1.2, 1 / 2.4);
    side.offset.set(0.5 / 1.2 + 0.08, 0);
    const screenGeo = new THREE.PlaneGeometry(SCREEN.w, SCREEN.h, 24, 24);
    const pos = screenGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / (SCREEN.w / 2);
      const y = pos.getY(i) / (SCREEN.h / 2);
      pos.setZ(i, 0.035 * (1 - x * x) * (1 - y * y));
    }
    screenGeo.computeVertexNormals();
    return {
      canvas,
      gameTex,
      crt,
      body: profile(),
      sideMat: new THREE.MeshStandardMaterial({ map: side, roughness: 0.35, metalness: 0.1 }),
      bodyMat: new THREE.MeshStandardMaterial({ color: P.cabinet, roughness: 0.4, metalness: 0.15 }),
      screenGeo,
      glow: makeGlowTexture(),
      coinText: canvasTex(256, 64, (ctx) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = P.orange;
        ctx.font = "bold 34px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("INSERT COIN", 128, 44);
      }),
    };
  }, []);
  const marquee = useMemo(() => marqueeTex(title, sub, titleColor), [title, sub, titleColor]);

  useLayoutEffect(() => {
    const ctx = res.canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    draw(ctx, t);
    res.gameTex.needsUpdate = true;
    res.crt.uniforms.uPower.value = power;
    res.crt.uniforms.uTime.value = t;
  });

  const n = screenNormal();
  const panelTilt = Math.atan2(0.1, 0.38);
  const stick = Math.sin(t * 5.2) * 0.5;
  const press = Math.max(0, Math.sin(t * 6.5)) > 0.85 ? 1 : 0;
  const blink = Math.floor(t * 2.4) % 2;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh geometry={res.body} material={[res.sideMat, res.bodyMat]} castShadow receiveShadow />
      <group position={SCREEN.center} rotation={[SCREEN.tilt, 0, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.98, 0.9]} />
          <meshStandardMaterial color={P.bezel} roughness={0.25} metalness={0.4} />
        </mesh>
        <mesh geometry={res.screenGeo} material={res.crt} />
        <mesh position={[-0.12, 0.2, 0.05]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.05, 0.5]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.06} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1.7, 1.9]} />
          <meshBasicMaterial map={res.glow} color={glow} transparent opacity={0.22 * power} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[SCREEN.center[0] + n[0] * 0.6, SCREEN.center[1] + n[1] * 0.6, SCREEN.center[2] + n[2] * 0.6]} color="#9EC9FF" intensity={1.6 * power} distance={4} decay={2} />
      <mesh position={[0, 2.2, 0.485]}>
        <planeGeometry args={[1.12, 0.28]} />
        <meshBasicMaterial map={marquee} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.2, 0.55]}>
        <planeGeometry args={[2.2, 0.9]} />
        <meshBasicMaterial map={res.glow} color={P.magenta} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.3, 1.0]} color={P.magenta} intensity={1.2} distance={4} decay={2} />
      <group position={[0, 1.155, 0.49]} rotation={[panelTilt, 0, 0]}>
        <mesh position={[0, 0.006, 0]}>
          <boxGeometry args={[1.18, 0.012, 0.36]} />
          <meshStandardMaterial color="#1B1F48" roughness={0.3} metalness={0.2} />
        </mesh>
        <group position={[-0.3, 0.012, 0.02]} rotation={[0.25 * Math.cos(t * 3.1), 0, -0.35 * stick]}>
          <mesh position={[0, 0.07, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.14, 10]} />
            <meshStandardMaterial color="#C8C8D0" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.045, 20, 16]} />
            <meshStandardMaterial color={P.magenta} roughness={0.2} />
          </mesh>
        </group>
        {[P.cyan, P.yellow, P.orange].map((c, i) => (
          <mesh key={c} position={[0.05 + i * 0.13, 0.02 - (i === 0 ? press * 0.012 : 0), 0.03 - i * 0.02]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 20]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={i === 0 && press ? 0.9 : 0.25} roughness={0.25} />
          </mesh>
        ))}
      </group>
      <group position={[0, 0.58, 0.455]}>
        <mesh>
          <boxGeometry args={[0.46, 0.36, 0.02]} />
          <meshStandardMaterial color="#0B0D20" roughness={0.3} metalness={0.6} />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, 0.06, 0.015]}>
            <planeGeometry args={[0.06, 0.09]} />
            <meshBasicMaterial color={blink ? P.orange : "#5A2A08"} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, -0.09, 0.015]}>
          <planeGeometry args={[0.36, 0.09]} />
          <meshBasicMaterial map={res.coinText} transparent opacity={blink ? 1 : 0.35} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/** World position of a cabinet's screen centre (for camera targets). */
export const screenAt = (pos: V3 = [0, 0, 0], rotY = 0): V3 => {
  const [x, y, z] = SCREEN.center;
  const c = Math.cos(rotY);
  const s = Math.sin(rotY);
  return [pos[0] + x * c + z * s, pos[1] + y, pos[2] - x * s + z * c];
};
