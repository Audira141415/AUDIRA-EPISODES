// Instanced tesserae for the EP01 panel: glazed ceramic + gold smalti (kit materials).
// The panel re-lays itself picture by picture (SCHEDULE): a flip wave runs out from a focal point,
// each tessera hops, turns over and lands showing its colour in the next picture. Special beats:
//   - MAP route tiles light up from Kairouan to Fez (routeProgress)
//   - DOOR leaves slide apart into the jambs in the payoff (doorOpen)
// Both meshes hold every tile; a tile is hidden in the mesh that does not match its material.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { layTiles, PANEL, DOOR_PARTS, ARCH, type PicName, type Tile } from "./picture.ts";
import { makeCeramicMaterial, makeGoldMaterial } from "../../kits/mosaicforge/lib/materials.ts";
import { clamp01, ramp } from "./tl.ts";

const tmp = new THREE.Object3D();
export const TILE_H = 0.036;
const FLIP = 1.0; // seconds per tessera turn-over

export type Switch = { at: number; to: PicName; focus: [number, number]; speed?: number };

const hideMatrix = (() => {
  const o = new THREE.Object3D();
  o.position.set(0, -50, 0);
  o.scale.setScalar(0.0001);
  o.updateMatrix();
  return o.matrix.clone();
})();

export const Tesserae: React.FC<{
  t: number;
  schedule: Switch[];
  routeProgress?: (t: number) => number;
  doorOpen?: (t: number) => number;
}> = ({ t, schedule, routeProgress, doorOpen }) => {
  const tiles = useMemo(() => layTiles(), []);
  const meshes = useMemo(() => {
    const geo = new RoundedBoxGeometry(PANEL.pitch, TILE_H, PANEL.pitch, 1, 0.008);
    const ceramic = new THREE.InstancedMesh(geo, makeCeramicMaterial(), tiles.length);
    const gold = new THREE.InstancedMesh(geo, makeGoldMaterial(), tiles.length);
    ceramic.frustumCulled = false;
    gold.frustumCulled = false;
    const white = new THREE.Color(1, 1, 1);
    tiles.forEach((_, i) => {
      ceramic.setColorAt(i, white);
      gold.setColorAt(i, white);
    });
    return { ceramic, gold };
  }, [tiles]);

  useLayoutEffect(() => {
    const col = new THREE.Color();
    const route = routeProgress ? routeProgress(t) : 1;
    const open = doorOpen ? doorOpen(t) : 0;
    const sched = [...schedule].sort((a, b) => a.at - b.at);
    tiles.forEach((tile: Tile, i) => {
      // which picture is the tile showing, and is it mid-flip?
      let prev: PicName = sched[0].to;
      let next: PicName = sched[0].to;
      let k = 1;
      for (let s = 1; s < sched.length; s++) {
        const sw = sched[s];
        const dist = Math.hypot(tile.x - sw.focus[0], -tile.z - sw.focus[1]);
        const delay = sw.at + dist / ((sw.speed ?? 4.2) * 0.72) + tile.seed * 0.35;
        if (t < delay) break;
        prev = next;
        next = sw.to;
        k = clamp01((t - delay) / FLIP);
        k = k * k * (3 - 2 * k); // eased turn-over: no snap at take-off or landing
      }
      const shown: PicName = k < 0.5 ? prev : next;
      const look = tile.looks[shown];
      const hop = Math.sin(Math.PI * k) * (0.16 + tile.seed * 0.12);
      const turn = k < 1 ? Math.PI * k : 0;

      let x = tile.x;
      let y = TILE_H / 2 + 0.002 + hop;
      let scale = 1;
      let lift = 0;
      // MAP route: a route tile is plain land until the gold line reaches it, then pops up and lands
      let color = look.color;
      let gold = look.gold;
      if (shown === "map" && look.part === "route") {
        const kk = clamp01((route - look.s) / 0.06);
        if (kk <= 0) {
          color = col.set("#B88A55");
          gold = false;
        }
        lift = Math.sin(Math.PI * clamp01((route - look.s) / 0.12)) * 0.12;
      }
      // DOOR leaves slide apart and disappear into the jambs
      if (shown === "door" && open > 0 && DOOR_PARTS.has(look.part)) {
        const side = tile.x < 0 ? -1 : 1;
        x = tile.x + side * open * (ARCH.jamb + 0.2);
        y += open * 0.05;
        if (Math.abs(x) > ARCH.jamb - 0.05) scale = 0;
      }
      if (scale === 0) {
        meshes.ceramic.setMatrixAt(i, hideMatrix);
        meshes.gold.setMatrixAt(i, hideMatrix);
        return;
      }
      tmp.position.set(x, y + lift, tile.z);
      tmp.rotation.set(tile.tilt[0] + turn, look.rot + turn * 0.3, tile.tilt[1]);
      tmp.scale.set(tile.size * scale, 1, tile.size * scale * (0.94 + tile.seed * 0.08));
      tmp.updateMatrix();
      const on = gold ? meshes.gold : meshes.ceramic;
      const off = gold ? meshes.ceramic : meshes.gold;
      on.setMatrixAt(i, tmp.matrix);
      on.setColorAt(i, color);
      off.setMatrixAt(i, hideMatrix);
    });
    for (const m of [meshes.ceramic, meshes.gold]) {
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <primitive object={meshes.ceramic} />
      <primitive object={meshes.gold} />
    </group>
  );
};

/** Door-open curve helper (kept here so the film and the glow share it). */
export const doorCurve = (t: number, a: number, b: number, close?: number) => ramp(t, a, b) * (close === undefined ? 1 : 1 - ramp(t, close, close + 0.8));
