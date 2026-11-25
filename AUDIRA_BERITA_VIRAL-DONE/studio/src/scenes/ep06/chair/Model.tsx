// The Vice President's chair: two engine Slabs (seat, back) with sweep materials, plain frame
// parts (arms, four legs or a 5-star pedestal), a brass name plate, a small AUDIRA maker's tag and
// the "KOSONG" tape that rolls across vacant eras.

import React, { useLayoutEffect, useMemo } from "react";
import { BoxGeometry, CanvasTexture, CylinderGeometry, MeshStandardMaterial, PlaneGeometry, SphereGeometry, SRGBColorSpace } from "three";
import { Slab } from "../../../core/geometry/slab.ts";
import { applyMat, plainMaterial, sweepMaterial, type Sweep } from "../../../core/materials/sweep.ts";
import type { EraState } from "../../../kits/timeforge/morph/eraTimeline.ts";
import type { Chair, ChairFx } from "./params.ts";

const D = Math.PI / 180;

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const plateTex = (font: string) =>
  canvasTex(1024, 256, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "#d8b56a");
    grd.addColorStop(0.5, "#b58a3c");
    grd.addColorStop(1, "#8e6a2c");
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 256);
    g.strokeStyle = "#5e4418";
    g.lineWidth = 10;
    g.strokeRect(14, 14, 996, 228);
    g.fillStyle = "#3a2a0e";
    g.font = `700 92px ${font}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("WAKIL PRESIDEN", 512, 134);
  });

const tagTex = (font: string) =>
  canvasTex(512, 128, (g) => {
    g.fillStyle = "#c9a85c";
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = "#4a3511";
    g.font = `800 64px ${font}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 256, 68);
  });

const letterTex = (font: string) =>
  canvasTex(768, 512, (g) => {
    g.fillStyle = "#f3ecdc";
    g.fillRect(0, 0, 768, 512);
    g.strokeStyle = "#b9ab8f";
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(384, 300);
    g.lineTo(768, 0);
    g.stroke();
    g.fillStyle = "#9b1c1c";
    g.beginPath();
    g.arc(384, 300, 62, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2b2a28";
    g.font = `800 58px ${font}`;
    g.textAlign = "center";
    g.fillText("SURAT RESMI?", 384, 460);
  });

const tapeTex = (font: string) =>
  canvasTex(2048, 128, (g) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 2048, 128);
    g.fillStyle = "#111111";
    for (let x = -80; x < 2048; x += 120) {
      g.beginPath();
      g.moveTo(x, 128);
      g.lineTo(x + 40, 128);
      g.lineTo(x + 100, 0);
      g.lineTo(x + 60, 0);
      g.fill();
    }
    g.fillStyle = "#ffffff";
    g.fillRect(0, 22, 2048, 84);
    g.fillStyle = "#111111";
    g.font = `800 66px ${font}`;
    g.textBaseline = "middle";
    for (let x = 30; x < 2048; x += 400) g.fillText("KOSONG", x, 66);
  });

export const ChairModel: React.FC<{ era: EraState<Chair>; sweep: Sweep; font: string; fx: ChairFx }> = ({ era, sweep, font, fx }) => {
  const { params: p, a: A, b: B } = era;
  const seat = useMemo(() => new Slab(), []);
  const back = useMemo(() => new Slab(), []);
  const seatM = useMemo(() => [sweepMaterial(), sweepMaterial(), sweepMaterial()], []);
  const backM = useMemo(() => [sweepMaterial(), sweepMaterial(), sweepMaterial()], []);
  const frame = useMemo(() => plainMaterial(), []);
  const tapeM = useMemo(() => plainMaterial(), []);
  const box = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const cyl = useMemo(() => new CylinderGeometry(1, 0.82, 1, 32), []);
  const ball = useMemo(() => new SphereGeometry(1, 20, 14), []);
  const plane = useMemo(() => new PlaneGeometry(1, 1), []);
  const plateM = useMemo(() => new MeshStandardMaterial({ map: plateTex(font), metalness: 0.75, roughness: 0.32 }), [font]);
  const tagM = useMemo(() => new MeshStandardMaterial({ map: tagTex(font), metalness: 0.7, roughness: 0.35 }), [font]);
  const letterM = useMemo(() => new MeshStandardMaterial({ map: letterTex(font), roughness: 0.85 }), [font]);
  const tapeLabel = useMemo(() => {
    const t = tapeTex(font);
    return new MeshStandardMaterial({ map: t, transparent: true, roughness: 0.6 });
  }, [font]);

  useLayoutEffect(() => {
    seat.update({ ...p.seat });
    back.update({ hw: p.back.hw, hh: p.back.hh, d: p.back.d, rc: p.back.rc, reF: p.back.reF, reB: p.back.reB });
    const top = p.seat.hh + p.back.hh * 2;
    const bottom = -(p.seat.hh + p.legs.h);
    const sw = { ...sweep, top, bottom };
    for (const m of seatM) applyMat(m, A.mats.cushion, B.mats.cushion, sw);
    for (const m of backM) applyMat(m, A.mats.cushion, B.mats.cushion, sw);
    applyMat(frame, A.mats.frame, B.mats.frame, sw);
    applyMat(tapeM, A.mats.tape, B.mats.tape, sw);
  });

  const { seat: S, back: Bk, arm, legs, tape } = p;
  const legY = -S.hh - legs.h / 2;
  const lx = S.hw - 0.7;
  const lz = S.d / 2 - 0.7;
  const fourS = Math.max(0.0001, legs.four);
  const pedS = Math.max(0.0001, legs.ped);
  const backZ = -S.d / 2 + Bk.d / 2;
  const tapeLen = 12.5 * tape.k;

  return (
    <>
      {/* seat */}
      <mesh geometry={seat.geometry} material={seatM} castShadow receiveShadow />
      {/* backrest, hinged at the rear of the seat */}
      <group position={[0, S.hh * 0.6, backZ]} rotation={[-Bk.tilt * D, 0, 0]}>
        <group position={[0, Bk.hh, 0]}>
          <mesh geometry={back.geometry} material={backM} castShadow receiveShadow />
          <mesh geometry={plane} material={plateM} position={[0, Bk.hh * 0.55, Bk.d / 2 + 0.03]} scale={[Bk.hw * 1.15, Bk.hw * 0.29, 1]} />
          {/* KOSONG tape: rolls out diagonally across the backrest face */}
          {tape.k > 0.01 ? (
            <group position={[-Bk.hw * 0.95, Bk.hh * 0.45, Bk.d / 2 + 0.12]} rotation={[0, 0, -32 * D]}>
              <mesh geometry={box} material={tapeM} position={[tapeLen / 2, 0, 0]} scale={[tapeLen, 1.05, 0.06]} castShadow />
              <mesh geometry={plane} material={tapeLabel} position={[tapeLen / 2, 0, 0.04]} scale={[tapeLen, 0.95, 1]} />
            </group>
          ) : null}
        </group>
      </group>
      {/* armrests */}
      {arm.h > 0.05
        ? [-1, 1].map((s) => (
            <group key={s}>
              <mesh geometry={box} material={frame} position={[s * (S.hw + arm.w / 2 - 0.15), S.hh + arm.h - 0.25, 0.2]} scale={[arm.w + 0.25, 0.5, arm.len]} castShadow />
              {[arm.len / 2 - 0.5, -arm.len / 2 + 0.9].map((z) => (
                <mesh key={z} geometry={box} material={frame} position={[s * (S.hw + arm.w / 2 - 0.15), (arm.h - 0.5 + S.hh) / 2, z + 0.2]} scale={[arm.w * 0.7, arm.h - 0.5 + 2 * S.hh, 0.7]} castShadow />
              ))}
            </group>
          ))
        : null}
      {/* four legs */}
      {legs.four > 0.01
        ? [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sz]) => (
            <mesh key={`${sx}${sz}`} geometry={cyl} material={frame} position={[sx * lx, -S.hh - (legs.h * fourS) / 2, sz * lz]} scale={[legs.r * fourS, legs.h * fourS, legs.r * fourS]} castShadow />
          ))
        : null}
      {/* 5-star pedestal */}
      {legs.ped > 0.01 ? (
        <group position={[0, legY, 0]} scale={[pedS, 1, pedS]}>
          <mesh geometry={cyl} material={frame} scale={[0.5, legs.h * pedS, 0.5]} castShadow />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 + 0.3;
            return (
              <group key={i} rotation={[0, a, 0]}>
                <mesh geometry={box} material={frame} position={[2.2, -legs.h / 2 + 0.75, 0]} scale={[4.4, 0.45, 0.7]} castShadow />
                <mesh geometry={ball} material={frame} position={[4.2, -legs.h / 2 + 0.35, 0]} scale={[0.38, 0.38, 0.38]} castShadow />
              </group>
            );
          })}
        </group>
      ) : null}
      {/* the letter that has not arrived yet: drops onto the seat while the status is "niat" */}
      {fx.env > 0.01 ? (
        <group position={[0, S.hh + 2.2 + (1 - fx.env) * 7, -S.d / 2 + 2.0]} rotation={[-0.32, 0, 0.12 - (1 - fx.env) * 0.8]} scale={[fx.env, fx.env, fx.env]}>
          <mesh geometry={box} material={letterM} scale={[5.6, 3.8, 0.12]} castShadow />
          <mesh geometry={plane} material={letterM} position={[0, 0, 0.07]} scale={[5.6, 3.8, 1]} />
        </group>
      ) : null}
      {/* maker's tag on the seat front */}
      <mesh geometry={plane} material={tagM} position={[0, -S.hh * 0.15, S.d / 2 + 0.06]} scale={[2.4, 0.6, 1]} />
    </>
  );
};
