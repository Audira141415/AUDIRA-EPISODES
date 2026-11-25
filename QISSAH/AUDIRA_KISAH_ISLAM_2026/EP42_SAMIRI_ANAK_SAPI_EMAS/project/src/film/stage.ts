// Stager: turns planned groups into actors with a pose / position / facing for every moment, using the set's anchors.
// Also the camera grammar: one shot per beat (wide, group, medium, close, low), framed on the lead or the pack.

import { POSES, gait, idle, type Pose } from "../kits/chronicle/Figure.tsx";
import type { Anchors, V3 } from "./sets.tsx";
import type { Group, Shot } from "../director/types.ts";
import type { CamKey } from "../kits/chronicle/cam.ts";

export type ActorState = { pos: V3; rotY: number; pose: Pose };
export type Actor = { id: number; group: number; lead: boolean; color: string | null; gain?: number; costume: Group["costume"]; seated: boolean; moving: boolean; at: (t: number) => ActorState };

const hsh = (n: number) => {
  const x = Math.sin(n * 91.3458 + 47.123) * 43758.5453;
  return x - Math.floor(x);
};
const face = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);
const armed = (g: Group) => g.costume.itemR === "musket" || g.costume.itemR === "spear" || g.costume.itemL === "musket";

const staticPose = (g: Group, t: number, seed: number, seatKind?: "chair" | "floor"): Pose => {
  switch (g.action) {
    case "akimbo": return idle(POSES.akimbo(), t, seed);
    case "point": return idle(POSES.point("R", 0.1), t, seed, 0.6);
    case "telescope": return idle(POSES.telescope(), t, seed, 0.4);
    case "pray": return idle(POSES.pray(), t, seed, 0.5);
    case "kneel": return idle(POSES.kneel(0), t, seed, 0.5);
    case "bow": return idle(POSES.kneel(0.85), t, seed, 0.3);
    case "sit": return idle(seatKind === "chair" ? POSES.sitChair() : POSES.sitCross(), t, seed, 0.6);
    case "write": return idle(POSES.write(t + seed), t, seed, 0.3);
    case "guard": case "march": return idle(armed(g) ? POSES.shoulderArms() : POSES.stand(), t, seed, 0.5);
    case "raise": return idle(POSES.raiseFist(), t, seed, 0.8);
    case "talk": return idle(POSES.talk(t + seed), t, seed);
    case "look": return idle({ ...POSES.stand(), head: [0.3, 0] }, t, seed);
    case "carry": return idle(POSES.carryHead(), t, seed);
    default: return idle(POSES.stand(), t, seed);
  }
};

export const stageCast = (groups: Group[], A: Anchors, dur: number, seed: number, dark: boolean): Actor[] => {
  const actors: Actor[] = [];
  let id = 1;
  const leadG = groups.find((g) => g.lead);
  const leadMoving = leadG && (leadG.action === "run" || leadG.action === "walk");
  const second = groups.find((g) => !g.lead && g.count === 1);
  const seatFor = (g: Group) => (g.action === "sit" || g.action === "write") && A.seat ? A.seat : undefined;
  const leadPos: V3 = leadG && seatFor(leadG) ? A.seat!.pos : A.lead;
  const pathDir = [A.path[1][0] - A.path[0][0], A.path[1][2] - A.path[0][2]];
  const pathLen = Math.hypot(pathDir[0], pathDir[1]);
  const ux = pathDir[0] / pathLen, uz = pathDir[1] / pathLen;
  const pathYaw = Math.atan2(ux, uz);
  let guardSlot = 0;
  let moverSlot = 0;
  const totalMovers = groups.filter((g) => g.action === "run" || g.action === "walk").reduce((s, g) => s + g.count, 0);

  groups.forEach((g, gi) => {
    const dim = !g.color && dark ? { color: "#b4a58c", gain: 0.55 } : null;
    const color = g.color ?? dim?.color ?? null;
    const gain = g.color ? 1.5 : dim?.gain;
    for (let k = 0; k < g.count; k++) {
      const sd = seed * 31 + gi * 7 + k;
      const mover = g.action === "run" || g.action === "walk";
      if (mover) {
        // stream along the path so the pack fills the shot for the whole scene; the lead runs mid-pack
        const slot = g.lead ? Math.floor(totalMovers / 2) : moverSlot++ + (leadMoving && moverSlot > totalMovers / 2 ? 1 : 0);
        const run = g.action === "run" ? 0.75 + 0.25 * hsh(sd) : 0.05;
        const speed = Math.min(g.action === "run" ? 3.0 + hsh(sd + 1) * 0.6 : 1.3 + hsh(sd + 1) * 0.3, (pathLen * 0.75) / Math.max(1, dur));
        // everyone crosses the middle of the path during the scene; stagger by slot
        const mid = pathLen * 0.5;
        const t0 = dur * 0.5 - mid / speed + (slot - totalMovers / 2) * (1.1 / speed) + (hsh(sd + 2) - 0.5) * 0.25;
        const off = g.lead ? 0 : ((slot % 3) - 1) * 0.9 + (hsh(sd + 3) - 0.5) * 0.4;
        const sc = g.costume.scale ?? 1;
        actors.push({
          id: id++, group: gi, lead: g.lead, color, gain, costume: g.costume, seated: false, moving: true,
          at: (t) => {
            const d = (t - t0) * speed;
            const x = A.path[0][0] + ux * d - uz * off, z = A.path[0][2] + uz * d + ux * off;
            const stride = (g.action === "run" ? 1.1 : 0.72) * sc;
            let pose = gait((d / stride) * Math.PI, run);
            if (g.costume.load === "head") pose = { ...pose, armL: { fwd: 0.35, out: 1.25, elbow: 2.1, twist: -0.4 } };
            return { pos: [x, 0, z], rotY: pathYaw, pose };
          },
        });
        continue;
      }
      let pos: V3;
      let seated = false;
      const seat = seatFor(g);
      if (g.lead) { pos = leadPos; seated = !!seat; }
      else if (g === second) pos = A.second;
      else if (g.action === "pray" || g.action === "kneel" || g.action === "bow") {
        // a loose arc in front of the target
        const n = g.count, a = (k - (n - 1) / 2) * 0.5;
        const r = 2.2 + (k % 2) * 0.9;
        pos = [A.target[0] + Math.sin(a) * r, 0, A.target[2] + Math.cos(a) * r];
      } else if (g.count > 6 || g.action === "march") {
        const [x0, x1, z0, z1] = A.rows;
        const cols = Math.max(1, Math.min(g.count, Math.round((x1 - x0) / 1.0)));
        const row = Math.floor(k / cols), col = k % cols;
        const rowsN = Math.ceil(g.count / cols);
        pos = [x0 + ((col + 0.5) / cols) * (x1 - x0) + (row % 2) * 0.4 + (hsh(sd) - 0.5) * 0.25, 0, z1 - (row / Math.max(1, rowsN - 1 || 1)) * (z1 - z0) * (rowsN > 1 ? 1 : 0) - (hsh(sd + 1) - 0.5) * 0.3];
      } else {
        const gp = A.guards[guardSlot++ % A.guards.length];
        const extra = Math.floor((guardSlot - 1) / A.guards.length);
        pos = [gp[0] + extra * 0.7, 0, gp[2] - extra * 0.6];
      }
      // who looks where
      let rotY: number;
      if (seat && g.lead) rotY = seat.rotY;
      else if (g.lead) rotY = second ? face(pos, A.second) : g.action === "point" || g.action === "akimbo" ? face(pos, A.target) + 0.5 : face(pos, A.target);
      else if (g === second) rotY = face(pos, leadPos);
      else if (g.count > 6 || g.action === "march") rotY = leadG ? face(pos, leadPos) : Math.PI;
      else rotY = leadG ? face(pos, leadPos) : face(pos, A.target);
      const p = pos;
      const ry = rotY;
      actors.push({
        id: id++, group: gi, lead: g.lead, color, gain, costume: g.costume, seated: seated || g.action === "sit" || g.action === "kneel" || g.action === "pray" || g.action === "bow", moving: false,
        at: (t) => ({ pos: p, rotY: ry, pose: staticPose(g, t, sd, seat?.kind) }),
      });
    }
  });
  return actors;
};

// ------------------------------------------------------------------ camera grammar
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const shotKeys = (shot0: Shot, a: number, b: number, focusAt0: (t: number) => V3, groupAt: (t: number) => V3, A: Anchors, seated: boolean, side: number, moving = false): CamKey[] => {
  const lowY = seated ? -0.5 : 0;
  // a running lead leaves any tight frame: stay wide on the pack
  const shot: Shot = moving && shot0 !== "wide" ? "group" : shot0;
  const focusAt = moving ? groupAt : focusAt0;
  const mk = (t: number, push: number): CamKey => {
    const F = focusAt(t);
    const C = groupAt(t);
    let pos: V3, target: V3, fov: number;
    const sx = side;
    switch (shot) {
      // lateral offsets stay small: a 9:16 frame is only ~22° wide
      case "wide": pos = add(F, [0.9 * sx, 1.7, 10.5 - push * 1.2]); target = add(F, [-0.25 * sx, 1.9, -22]); fov = 46; break;
      case "group": pos = add(C, [-0.9 * sx, 1.7, 9.0 - push]); target = add(C, [0.2 * sx, 1.3, -14]); fov = 46; break;
      // motion memory faceShot (d≈7, fov 42, aim y 0.89 at the figure): feet land at y≈1264, above the karaoke band at 1300
      case "medium": pos = add(F, [0.5 * sx, 1.35 + lowY, 7.0 - push * 0.6]); target = add(F, [-0.12 * sx, 0.23 + lowY, -10]); fov = 42; break;
      case "close": pos = add(F, [0.3 * sx, 1.45 + lowY, 2.5 - push * 0.3]); target = add(F, [-0.05 * sx, 1.4 + lowY * 1.2, -8]); fov = 38; break;
      default: pos = add(F, [0.45 * sx, 0.35, 3.0 - push * 0.3]); target = add(F, [-0.1 * sx, 2.5 + lowY, -8]); fov = 44; break;
    }
    if (A.camMaxZ !== undefined && pos[2] > A.camMaxZ) {
      // inside a room: stay inside, widen instead
      const over = pos[2] - A.camMaxZ;
      pos = [pos[0] * 0.8, pos[1], A.camMaxZ];
      fov = Math.min(58, fov + over * 2.2);
    }
    pos[1] = Math.max(pos[1], 0.3);
    return { t, pos, target, fov };
  };
  return [mk(a, 0), mk(b, 1)];
};
