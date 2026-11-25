// AE-071 film — THERMALFORGE. The cover's cutaway office block seen through a thermal camera, now as one
// continuous camera flight driven by timeline.json (Audio Master Clock):
// HOOK fire held in one compartment → KONTEKS the block splits into compartments, "60 MENIT" (example rating)
// → MEKANISME pipe/cable penetration sealed by firestop; sprinkler bulb breaks, only the head over the fire sprays
// → REVEAL fire door self-closes (fire-wall line joins), then wedged open (heat leaks through the gap)
// → PAYOFF stairwell pressurised in buildings > 24 m, air pushes smoke back → OUTRO remove the wedge, AUDIRA plate.
// Claims follow SCRIPT.md / RESEARCH_REPORT.md (ratings in minutes, never "forever"; no pressure figure).
// Ironbow is the false-colour scale of one temperature field computed in the shader. Building is fictional.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";

const C = { black: "#0A0A10", violet: "#310E68", magenta: "#9B1D8C", amber: "#EA5E28", yellow: "#F7D038", white: "#FFFFFF", cyan: "#00E5FF", red: "#FF4D3D" };
const BG = "#05030C";

// ---------- timeline helpers (every beat comes from the VO word times) ----------
type Word = { w: string; s: number; e: number };
const WORDS: Word[] = (TL.clips as { words: Word[] }[]).flatMap((c) => c.words);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
const at = (word: string, n = 0): number => {
  const m = WORDS.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`timeline: word "${word}" #${n} not found`);
  return m[n].s;
};
const S = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
const OUTRO_START = S.OUTRO[1] + 0.2;

const T = {
  ruang: at("ruang"), setidaknya: at("setidaknya"),
  caranya: at("caranya"), kotak: at("kotak-kotak"), kompartemen: at("kompartemen"), dinding: at("dinding"), enam: at("enam"),
  setiap: at("setiap"), pipa: at("pipa"), disumbat: at("disumbat"), plafon: at("plafon"), kepala: at("kepala"), bulb: at("bulb"),
  pecah: at("pecah"), hanya: at("hanya"),
  bagian: at("bagian"), pintu1: at("pintu", 0), menutup: at("menutup"), pintu2: at("pintu", 1), diganjal: at("diganjal"), melubangi: at("melubangi"),
  gedungP: at("gedung", 1), dua: at("dua"), tangga: at("tangga"), tekanan: at("tekanan"), asap: at("asap"), semua: at("semua"), evakuasi: at("evakuasi"),
  jadi: at("jadi"), mengganjal: at("mengganjal"), ini: at("ini", 1),
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ss = (a: number, b: number, x: number) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const win = (t: number, a: number, b: number, f = 0.3) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

// ---------- building ----------
const BAY = 4.4, FL = 3.6, SLAB = 0.35, DEPTH = 5.0;
const BAYS = [-2, -1, 0, 1, 2];
const FLOORS = [-5, -4, -3, -2, -1, 0, 1, 2];
const Y_BOT = -5 * FL - SLAB, Y_TOP = 3 * FL;
const ROOM_H = FL - SLAB;
const HOT = { min: new THREE.Vector3(-2.0, 0, -DEPTH), max: new THREE.Vector3(2.0, ROOM_H, 0) };
const FIRE = new THREE.Vector3(0.3, 0.35, -2.9);
const SPRINK = new THREE.Vector3(FIRE.x, ROOM_H - 0.32, FIRE.z);
const FIRE_DOOR = { x: 2.2, z0: -3.3, w: 1.0, h: 2.15 }; // in the hot room / corridor partition, floor 0
const STAIR_DOOR = { x: 6.6, z0: -3.3, w: 1.0, h: 2.15 }; // corridor / stair shaft partition, floor 0
const DOOR_MID = new THREE.Vector3(2.2, 1.1, FIRE_DOOR.z0 + 0.5);
const PIPE = { y: 2.72, z: -1.15, r: 0.075 };
const TRAY = { y: 2.98, z: -0.62 };
const HOLE = new THREE.Vector3(2.42, PIPE.y, PIPE.z);
const STAIR_X = 2 * BAY; // bay 2 = stair shaft
const CORR_X = BAY; // bay 1, floor 0 = corridor

// ---------- door / leak states ----------
const DOOR_OPEN = 1.25; // rad
// fire door: opened at REVEAL, the closer pulls it shut on "menutup"; reopened and wedged on "diganjal"
const doorAngle = (t: number) => {
  if (t < T.pintu2) {
    const open1 = ss(S.REVEAL[0] + 0.2, S.REVEAL[0] + 1.2, t);
    const a = T.menutup - 0.35, b = T.menutup + 0.75;
    const u = clamp01((t - a) / (b - a));
    const shut = 1 - Math.pow(1 - u, 3); // closer: fast start, soft latch
    return DOOR_OPEN * open1 * (1 - shut);
  }
  return DOOR_OPEN * ss(T.pintu2, T.pintu2 + 0.7, t) * (1 - ss(T.mengganjal + 0.75, T.mengganjal + 1.55, t));
};
const wedgeIn = (t: number) => ss(T.diganjal, T.diganjal + 0.45, t) * (1 - ss(T.mengganjal + 0.3, T.mengganjal + 0.75, t));
const wedgeKick = (t: number) => ss(T.mengganjal + 0.3, T.mengganjal + 0.9, t);
const leakDoor = (t: number) => clamp01(doorAngle(t - 0.5) / DOOR_OPEN) * 0.6 + clamp01(doorAngle(t - 1.2) / DOOR_OPEN) * 0.4;
const leakHole = (t: number) => 1 - ss(T.disumbat, T.disumbat + 1.1, t);
const collar = (t: number) => ss(T.disumbat - 0.4, T.disumbat + 0.5, t);
const sprayOn = (t: number) => ss(T.pecah + 0.45, T.pecah + 0.9, t);
const fireK = (t: number) => 1 - 0.3 * ss(T.hanya, T.hanya + 2.5, t);
const stairDoor = (t: number) => 1.15 * ss(T.tangga, T.tangga + 0.7, t) * (1 - ss(S.PAYOFF[1], S.PAYOFF[1] + 0.6, t));
const pushK = (t: number) => ss(T.asap - 0.4, T.asap + 0.8, t);

// ---------- camera: Catmull-Rom flight through keys (times from the VO) ----------
type Key = { t: number; p: [number, number, number]; q: [number, number, number]; f: number };
const KEYS: Key[] = [
  { t: 0, p: [2.0, 2.3, 6.2], q: [0.3, 1.25, -2.8], f: 40 },
  { t: 2.6, p: [2.9, 2.8, 10], q: [0.4, 1.2, -2.7], f: 38 },
  { t: T.ruang + 0.4, p: [4.8, 3.9, 18.5], q: [0.6, 0.7, -2.6], f: 35 },
  { t: S.HOOK[1], p: [6.2, 4.6, 24.5], q: [0.8, 0.3, -2.5], f: 34 },
  { t: T.kotak - 0.2, p: [12, 7.5, 46], q: [0.8, -3.2, -2.5], f: 34 },
  { t: T.dinding - 0.3, p: [13.5, 7.5, 53], q: [0.6, -3.6, -2.5], f: 34 },
  { t: T.dinding + 2.0, p: [-6.5, 4.2, 22], q: [0.3, 0.9, -2.5], f: 34 },
  { t: S.KONTEKS[1], p: [-7.6, 4.8, 19.5], q: [0.3, 0.9, -2.5], f: 34 },
  { t: T.setiap + 0.5, p: [5.7, 2.5, 2.6], q: [2.2, 2.55, -1.3], f: 40 },
  { t: T.pipa + 0.4, p: [5.2, 2.6, 1.6], q: [2.2, 2.7, -1.15], f: 40 },
  { t: T.plafon - 0.3, p: [4.7, 2.7, 1.0], q: [2.2, 2.75, -1.1], f: 40 },
  { t: T.plafon + 0.8, p: [0.9, 1.9, 0.6], q: [0.3, 2.85, -2.9], f: 40 },
  { t: T.bulb - 0.2, p: [0.62, 2.62, -1.9], q: [0.3, 2.95, -2.9], f: 38 },
  { t: T.bulb + 0.5, p: [0.47, 2.92, -2.48], q: [0.3, 2.95, -2.9], f: 38 },
  { t: T.pecah - 0.05, p: [0.45, 2.92, -2.5], q: [0.3, 2.95, -2.9], f: 38 },
  { t: T.pecah + 0.3, p: [0.47, 2.9, -2.42], q: [0.3, 2.93, -2.9], f: 38 },
  { t: T.pecah + 1.0, p: [0.7, 2.3, 1.4], q: [0.3, 2.3, -2.9], f: 38 },
  { t: T.hanya + 0.6, p: [1.2, 3.6, 22], q: [0.6, 1.5, -2.5], f: 34 },
  { t: S.MEKANISME[1], p: [1.6, 3.8, 24], q: [0.7, 1.4, -2.5], f: 34 },
  { t: S.REVEAL[0] + 0.8, p: [5.0, 3.3, 13], q: [2.6, 1.3, -2.8], f: 36 },
  { t: T.menutup + 0.8, p: [5.6, 3.0, 11], q: [2.8, 1.2, -2.8], f: 36 },
  { t: T.diganjal + 0.6, p: [5.6, 2.2, 7.4], q: [2.9, 1.0, -2.7], f: 40 },
  { t: T.melubangi, p: [5.3, 2.1, 6.6], q: [2.8, 1.0, -2.7], f: 40 },
  { t: S.REVEAL[1], p: [5.2, 2.2, 6.4], q: [2.8, 1.0, -2.7], f: 40 },
  { t: T.dua, p: [24, 4, 54], q: [3.8, -4.4, -2.5], f: 34 },
  { t: T.tangga + 0.2, p: [14.5, 14.5, 15], q: [8.8, 8.0, -2.5], f: 38 },
  { t: T.tekanan + 0.1, p: [13.5, 9.0, 13.5], q: [8.4, 4.8, -2.5], f: 38 },
  { t: T.asap, p: [9.6, 2.6, 11.5], q: [5.4, 1.2, -2.6], f: 38 },
  { t: T.semua - 0.1, p: [9.0, 2.7, 10.6], q: [5.0, 1.2, -2.6], f: 38 },
  { t: T.evakuasi, p: [-8, 6, 46], q: [2.0, -3.4, -2.5], f: 34 },
  { t: S.PAYOFF[1] + 0.3, p: [-9, 6.5, 50], q: [2.0, -3.4, -2.5], f: 34 },
  { t: T.jadi + 0.7, p: [5.8, 1.9, 5.0], q: [2.8, 0.55, -2.5], f: 40 },
  { t: T.mengganjal + 1.4, p: [5.4, 2.0, 4.4], q: [3.0, 0.8, -2.8], f: 40 },
  { t: T.mengganjal + 2.1, p: [4.4, 2.15, 3.6], q: [4.4, 2.1, -5], f: 38 },
  { t: OUTRO_START, p: [4.4, 2.15, 3.0], q: [4.4, 2.1, -5], f: 38 },
  { t: TL.total + 1, p: [4.4, 2.15, 2.8], q: [4.4, 2.1, -5], f: 38 },
];
const cr = (a: number, b: number, c: number, d: number, u: number) =>
  0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
export const pose = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const k0 = KEYS[Math.max(i - 1, 0)], k1 = KEYS[i], k2 = KEYS[i + 1], k3 = KEYS[Math.min(i + 2, KEYS.length - 1)];
  const u = clamp01((t - k1.t) / (k2.t - k1.t));
  const ue = u * u * (3 - 2 * u) * 0.35 + u * 0.65; // mostly linear, slight ease: keeps the flight moving
  const v = (sel: "p" | "q") => new THREE.Vector3(...([0, 1, 2].map((j) => cr(k0[sel][j], k1[sel][j], k2[sel][j], k3[sel][j], ue)) as [number, number, number]));
  const pos = v("p"), tgt = v("q");
  tgt.y += 0.05 * pos.distanceTo(tgt); // subject lands in y ~450-1400, not the top half
  return { pos, tgt, fov: k1.f + (k2.f - k1.f) * ue };
};
const makeCam = (t: number) => {
  const p = pose(t);
  const cam = new THREE.PerspectiveCamera(p.fov, 1080 / 1920, 0.1, 500);
  cam.position.copy(p.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(p.tgt);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};

// ---------- the single temperature field, Ironbow false colour ----------
const IRONBOW = /* glsl */ `vec3 ironbow(float x){ x = clamp(x,0.,1.);
  vec3 c0=vec3(.012,.008,.045), c1=vec3(.17,.03,.40), c2=vec3(.58,.09,.53), c3=vec3(.92,.36,.15), c4=vec3(.97,.80,.22), c5=vec3(1.,.98,.9);
  if(x<.2) return mix(c0,c1,x/.2);
  if(x<.42) return mix(c1,c2,(x-.2)/.22);
  if(x<.62) return mix(c2,c3,(x-.42)/.2);
  if(x<.84) return mix(c3,c4,(x-.62)/.22);
  return mix(c4,c5,(x-.84)/.16); }`;

const FIELD = /* glsl */ `
  uniform vec3 hotMin, hotMax, fire, doorP, holeP;
  uniform float fireK, leakDoor, leakHole;
  float hsh(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x), mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),f.x), f.y); }
  float sdBox(vec3 p, vec3 lo, vec3 hi){ vec3 c=(lo+hi)*.5, h=(hi-lo)*.5; vec3 q=abs(p-c)-h; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
  float roomT(vec3 q){
    float dh = sdBox(q, hotMin, hotMax);
    if (dh < 0.) {
      float hy = (q.y - hotMin.y) / (hotMax.y - hotMin.y);
      vec3 df = q - fire;
      float v = 0.5 + 0.34*smoothstep(0.15, 0.95, hy) + 0.3*exp(-dot(df,df)/2.4) + 0.05*vn(q.xz*1.3 + q.y);
      return mix(0.2, v, fireK);
    }
    bool inside = q.z < 0.02 && q.z > -${DEPTH.toFixed(1)} && abs(q.x) < 11. && q.y < ${Y_TOP.toFixed(2)} && q.y > ${Y_BOT.toFixed(2)};
    if (!inside) return 0.035 + 0.02*smoothstep(-12., 8., q.y);
    vec2 cell = floor(vec2((q.x + ${(BAY / 2).toFixed(2)}) / ${BAY.toFixed(2)}, q.y / ${FL.toFixed(2)}));
    float hy = fract(q.y / ${FL.toFixed(2)});
    float t = 0.17 + 0.09*hsh(cell) + 0.035*hy + 0.03*vn(q.xz*.8);
    // corridor (bay 1, floor 0): heat arrives through the open door and the unsealed penetration
    if (q.x > 2.4 && q.x < 6.4 && q.y > 0. && q.y < ${ROOM_H.toFixed(2)}) {
      vec3 dd = q - doorP; vec3 dhp = q - holeP;
      t += leakDoor * 0.34 * exp(-length(dd)/1.2) * (0.4 + 0.6*hy);
      t += leakHole * 0.55 * exp(-dot(dhp,dhp)/0.45);
    }
    return t;
  }
  float surfT(vec3 p, vec3 n){
    float t = roomT(p + n*0.16);
    float dw = max(sdBox(p, hotMin, hotMax), 0.);
    return max(t, 0.6*fireK*exp(-dw/0.26));
  }`;

type MatOpts = { emis?: number; add?: number; fixed?: number; map?: THREE.Texture | null; mapGain?: number; grain?: number };
const makeMat = ({ emis = 1, add = 0, fixed = -1, map = null, mapGain = 0, grain = 0.05 }: MatOpts) =>
  new THREE.ShaderMaterial({
    uniforms: {
      emis: { value: emis }, add: { value: add }, fixT: { value: fixed }, map: { value: map }, useMap: { value: map ? 1 : 0 }, mapGain: { value: mapGain },
      hotMin: { value: HOT.min }, hotMax: { value: HOT.max }, fire: { value: FIRE }, doorP: { value: DOOR_MID }, holeP: { value: HOLE },
      fireK: { value: 1 }, leakDoor: { value: 0 }, leakHole: { value: 1 }, t: { value: 0 }, grain: { value: grain },
    },
    vertexShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec2 vUv;
      void main(){ vec4 m = modelMatrix*vec4(position,1.); vP = m.xyz; vUv = uv;
        vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*m; }`,
    fragmentShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec2 vUv;
      uniform float emis, add, fixT, useMap, mapGain, t, grain; uniform sampler2D map;
      ${IRONBOW}
      ${FIELD}
      void main(){
        vec3 N = normalize(vN);
        float x = fixT >= 0. ? fixT : surfT(vP, N) * emis + add;
        if (useMap > .5) x += mapGain * texture2D(map, vUv).r;
        // emissivity micro-variation (formwork marks, scuffs): surface reads as a material, not flat paint
        vec2 gp = vec2(vP.x + vP.z*0.7, vP.y + vP.z*0.3);
        x *= 1. + grain*((vn(gp*3.3) - .5)*1.4 + (vn(gp*17.) - .5)*0.8 + 0.6*(step(.93, fract(gp.y*0.83)) - .07));
        float ndl = dot(N, normalize(vec3(-0.45, 0.75, 0.55)));
        x *= 0.84 + 0.16*ndl;
        x += (hsh(gl_FragCoord.xy*0.37 + t) - .5) * .018;
        gl_FragColor = vec4(pow(ironbow(x), vec3(2.2)), 1.);
      }`,
  });

const makeFlameMat = (seed: number, hot: number, gain: number) =>
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { t: { value: 0 }, seed: { value: seed }, hot: { value: hot }, gain: { value: gain }, k: { value: 1 } },
    vertexShader: /* glsl */ `varying float vH; varying vec3 vN; varying vec3 vV; uniform float t, seed;
      void main(){ float h = clamp(position.y, 0., 1.); vH = h;
        float ang = uv.x*6.2831853; vec2 dir = vec2(sin(ang), cos(ang));
        float R = pow(1.-h, 0.85) * (0.45 + 0.75*sin(min(h*2.4, 1.)*1.5708));
        R *= 1. + 0.14*sin(ang*3. + h*7. - t*0.31 + seed*2.) + 0.08*sin(ang*5. - h*11. + t*0.23 + seed);
        vec3 p = vec3(dir.x*R, h, dir.y*R);
        float sway = sin(t*0.09 + seed*1.7);
        p.x += h*h*(0.55*sway) + sin(h*6.5 - t*0.27 + seed*3.)*0.09*h;
        p.z += h*h*0.3*cos(t*0.07 + seed);
        vN = normalize(normalMatrix*vec3(dir.x, 0.35, dir.y));
        vec4 mv = modelViewMatrix*vec4(p,1.); vV = -mv.xyz;
        gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `varying float vH; varying vec3 vN; varying vec3 vV; uniform float hot, gain, k; ${IRONBOW}
      void main(){ float fres = abs(dot(normalize(vN), normalize(vV)));
        float a = pow(fres, 1.3) * smoothstep(1., 0.62, vH) * smoothstep(0., 0.06, vH) * gain * k;
        float x = hot - 0.34*pow(vH, 1.3);
        gl_FragColor = vec4(pow(ironbow(x), vec3(2.2)) * a * 1.6, 1.); }`,
  });

// additive radial sprite (glow, hole leak, smoke); colour = ironbow(level)
const makeSpriteMat = (level: number, strength: number, fall = 14) =>
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { s: { value: strength }, lv: { value: level }, fall: { value: fall } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; uniform float s, lv, fall; ${IRONBOW}
      void main(){ vec2 d = vUv - .5; float r = length(d*vec2(1.,1.2)); float a = exp(-r*r*fall) * s;
        gl_FragColor = vec4(pow(ironbow(lv), vec3(2.2)) * a, 1.); }`,
  });

const makeShimmerMat = () =>
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, k: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; uniform float t, k;
      void main(){ float y = vUv.y;
        float w = sin(vUv.x*23. + sin(y*9. - t*0.2)*2.2 + t*0.05) * sin(vUv.x*9. - y*5. + t*0.11);
        float a = smoothstep(0.15, 1., y) * (0.35 + 0.65*(0.5+0.5*w)) * smoothstep(0., 0.12, vUv.x) * smoothstep(1., 0.88, vUv.x) * 0.3 * k;
        gl_FragColor = vec4(vec3(1.0, .78, .38) * a, 1.); }`,
  });

const makePlateTexture = (lines: string[], w = 1024, h = 300) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#fff"; g.lineWidth = 12; g.strokeRect(18, 18, w - 36, h - 36);
  g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `600 ${Math.round(h * 0.46)}px '${FONT}'`;
  g.fillText(lines[0], w / 2, h * 0.42);
  g.font = `500 ${Math.round(h * 0.14)}px '${FONT}'`;
  g.fillText(lines[1], w / 2, h * 0.78);
  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 8;
  return tex;
};

const fx = (m: THREE.Object3D | null) => m && m.layers.set(FX_LAYER);
const FLAMES: [number, number, number, number][] = [[0, 0, 0.55, 2.1], [-0.55, 0.12, 0.42, 1.55], [0.6, -0.08, 0.45, 1.75], [0.18, 0.3, 0.34, 1.3], [-0.25, -0.28, 0.4, 1.85], [0.9, 0.18, 0.3, 1.1], [-0.85, -0.05, 0.32, 1.2], [0.35, -0.3, 0.36, 1.45], [-0.5, 0.35, 0.28, 0.95]];
const CITY = (() => { const r = rng(4071); return Array.from({ length: 34 }, (_, i) => ({ x: -80 + i * 4.9 + (r() - 0.5) * 3, z: -80 - r() * 30, w: 5 + r() * 8, top: 18 + r() * 20, m: Math.floor(r() * 3) })); })();
const SPRAY = (() => { const r = rng(71); return Array.from({ length: 56 }, () => {
  const az = r() * Math.PI * 2, pol = 0.15 + r() * 0.95;
  return { dir: new THREE.Vector3(Math.sin(pol) * Math.cos(az), -Math.cos(pol), Math.sin(pol) * Math.sin(az)).normalize(), phase: r(), len: 0.18 + r() * 0.3, speed: 0.36 + r() * 0.3 };
}); })();
const SHARDS = (() => { const r = rng(909); return Array.from({ length: 9 }, () => ({ v: new THREE.Vector3((r() - 0.5) * 1.6, -0.3 - r() * 0.8, (r() - 0.5) * 1.6), spin: r() * 9 })); })();
const SMOKE = (() => { const r = rng(5150); return Array.from({ length: 22 }, () => ({ phase: r(), y: 1.6 + r() * 1.4, spread: (r() - 0.5) * 1.6, size: 0.9 + r() * 0.9, speed: 0.18 + r() * 0.12 })); })();

// room furniture by type (0 office, 1 meeting, 2 pantry, 3 archive, 4 lounge)
type GSet = Record<"box" | "rbox" | "rboxSoft" | "cyl" | "cone" | "plane" | "sphere" | "wedge" | "torus", THREE.BufferGeometry>;
type MSet = Record<string, THREE.ShaderMaterial>;
const Room: React.FC<{ cx: number; y0: number; type: number; seed: number; G: GSet; M: MSet }> = ({ cx, y0, type, seed, G, M }) => {
  const r = rng(seed);
  const dx = (r() - 0.5) * 0.6;
  const rb = (key: string, m: THREE.Material, p: [number, number, number], s: [number, number, number], soft = false) =>
    <mesh key={key} geometry={soft ? G.rboxSoft : G.rbox} material={m} position={[cx + p[0], y0 + p[1], p[2]]} scale={s} />;
  const items: React.ReactNode[] = [];
  if (type === 0) {
    items.push(rb("d", M.furn, [-0.5 + dx, 0.74, -2.6], [1.6, 0.06, 0.8]), rb("m", M.monitor, [-0.4 + dx, 1.04, -2.82], [0.62, 0.38, 0.05]),
      rb("c", M.furn, [-0.4 + dx, 0.5, -1.9], [0.5, 0.08, 0.5]), rb("cb", M.furn, [-0.4 + dx, 0.82, -1.65], [0.5, 0.6, 0.07]),
      rb("s", M.furn, [1.45, 0.95, -4.55], [0.75, 1.9, 0.42]));
  } else if (type === 1) {
    items.push(rb("t", M.furn, [0.1, 0.74, -2.6], [2.6, 0.07, 1.1]));
    [-0.8, 0, 0.8].forEach((x, i) => items.push(rb(`a${i}`, M.furn, [x + 0.1, 0.5, -1.75], [0.45, 0.08, 0.45]), rb(`b${i}`, M.furn, [x + 0.1, 0.5, -3.45], [0.45, 0.08, 0.45])));
    items.push(rb("scr", M.monitor, [0.1, 1.7, -4.9], [1.8, 1.0, 0.06]));
  } else if (type === 2) {
    items.push(rb("ct", M.furn, [0.2, 0.46, -4.6], [3.0, 0.92, 0.6]), rb("fr", M.fridge, [-1.5, 1.0, -4.5], [0.75, 2.0, 0.7]),
      rb("cm", M.hotsmall, [0.6, 1.07, -4.65], [0.3, 0.32, 0.3]), rb("mw", M.monitor, [1.2, 1.06, -4.6], [0.5, 0.3, 0.38]),
      rb("tb", M.furn, [0.1 + dx, 0.74, -2.0], [1.0, 0.06, 1.0]));
  } else if (type === 3) {
    [-1.2, 0, 1.2].forEach((x, i) => items.push(rb(`sh${i}`, M.furn, [x + dx * 0.3, 1.05, -3.0], [0.5, 2.1, 2.6])));
  } else {
    items.push(rb("so", M.soft, [-0.4, 0.3, -4.2], [2.0, 0.55, 0.8], true), rb("sb", M.soft, [-0.4, 0.7, -4.55], [2.0, 0.6, 0.24], true),
      rb("lt", M.furn, [-0.4 + dx, 0.3, -2.9], [1.0, 0.06, 0.6]), rb("tv", M.monitor, [-0.4, 1.4, -4.9], [1.4, 0.8, 0.06]));
    items.push(<mesh key="lamp" geometry={G.sphere} material={M.hotsmall} position={[cx + 1.4, y0 + 1.6, -4.3]} scale={0.18} />,
      <mesh key="lp" geometry={G.cyl} material={M.metal} position={[cx + 1.4, y0 + 0.8, -4.3]} scale={[0.025, 1.6, 0.025]} />,
      <mesh key="pl" geometry={G.sphere} material={M.plant} position={[cx + 1.5, y0 + 0.7, -1.4]} scale={[0.35, 0.5, 0.35]} />,
      rb("pot", M.furn, [1.5, 0.2, -1.4], [0.35, 0.4, 0.35]));
  }
  // back-wall door with overhead closer (every office has its own rated door)
  items.push(
    <group key="door" position={[cx - 1.15, y0, -DEPTH + 0.06]}>
      <mesh geometry={G.box} material={M.metal} position={[0, 1.1, -0.02]} scale={[1.18, 2.3, 0.1]} />
      <mesh geometry={G.rbox} material={M.door} position={[0, 1.06, 0.04]} scale={[0.98, 2.1, 0.08]} />
      <mesh geometry={G.rbox} material={M.metal} position={[-0.12, 2.0, 0.14]} scale={[0.46, 0.12, 0.12]} />
    </group>,
  );
  return <>{items}</>;
};

// a rated door leaf hinged at z0 in the partition plane x, swinging toward +x
const DoorLeaf: React.FC<{ x: number; z0: number; angle: number; G: GSet; M: MSet; closer?: boolean; leafMat?: THREE.Material }> = ({ x, z0, angle, G, M, closer, leafMat }) => {
  const hingeArm = new THREE.Vector3(0.1, 2.02, 0.12).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).add(new THREE.Vector3(x, 0, z0));
  const frameP = new THREE.Vector3(x + 0.13, 2.24, z0 + 0.5);
  const mid = hingeArm.clone().add(frameP).multiplyScalar(0.5);
  const len = hingeArm.distanceTo(frameP);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), frameP.clone().sub(hingeArm).normalize());
  return (
    <>
      <group position={[x, 0, z0]} rotation={[0, angle, 0]}>
        <mesh geometry={G.rbox} material={leafMat ?? M.door} position={[0.0, 1.06, 0.5]} scale={[0.07, 2.1, 0.98]} />
        <mesh geometry={G.rbox} material={M.metal} position={[0.07, 1.05, 0.86]} scale={[0.07, 0.05, 0.2]} />
        <mesh geometry={G.box} material={M.metal} position={[0.04, 1.55, 0.5]} scale={[0.01, 0.36, 0.22]} />
        {/* low-emissivity steel edge trim: reads as a dark outline on the thermal image */}
        <mesh geometry={G.box} material={M.trim} position={[0, 2.1, 0.5]} scale={[0.09, 0.05, 1.0]} />
        <mesh geometry={G.box} material={M.trim} position={[0, 0.03, 0.5]} scale={[0.09, 0.05, 1.0]} />
        <mesh geometry={G.box} material={M.trim} position={[0, 1.06, 0.99]} scale={[0.09, 2.12, 0.04]} />
        <mesh geometry={G.box} material={M.trim} position={[0, 1.06, 0.01]} scale={[0.09, 2.12, 0.04]} />
        {closer ? <mesh geometry={G.rbox} material={M.closer} position={[0.1, 2.0, 0.3]} scale={[0.13, 0.15, 0.46]} /> : null}
      </group>
      {closer ? <mesh geometry={G.box} material={M.closer} position={mid} quaternion={q} scale={[len, 0.05, 0.06]} /> : null}
      {/* steel frame on the corridor face */}
      <mesh geometry={G.box} material={M.metal} position={[x + 0.21, 2.2, z0 + 0.5]} scale={[0.04, 0.1, 1.16]} />
      <mesh geometry={G.box} material={M.metal} position={[x + 0.21, 1.08, z0 - 0.05]} scale={[0.04, 2.16, 0.08]} />
      <mesh geometry={G.box} material={M.metal} position={[x + 0.21, 1.08, z0 + 1.05]} scale={[0.04, 2.16, 0.08]} />
    </>
  );
};

// partition at x (full height); on floor 0 it may have a door opening
const Partition: React.FC<{ x: number; door: boolean; G: GSet; M: MSet }> = ({ x, door, G, M }) => {
  const zc = -DEPTH / 2 - 0.15, zl = DEPTH + 0.3;
  if (!door) return <mesh geometry={G.box} material={M.concrete} position={[x, (Y_TOP + Y_BOT) / 2, zc]} scale={[0.4, Y_TOP - Y_BOT, zl]} />;
  const z0 = FIRE_DOOR.z0, z1 = z0 + 1.0, h = FIRE_DOOR.h;
  const back = -DEPTH - 0.3;
  return (
    <>
      <mesh geometry={G.box} material={M.concrete} position={[x, (0 + Y_BOT) / 2, zc]} scale={[0.4, -Y_BOT, zl]} />
      <mesh geometry={G.box} material={M.concrete} position={[x, (ROOM_H + Y_TOP) / 2, zc]} scale={[0.4, Y_TOP - ROOM_H, zl]} />
      <mesh geometry={G.box} material={M.concrete} position={[x, ROOM_H / 2, (back + z0) / 2]} scale={[0.4, ROOM_H, z0 - back]} />
      <mesh geometry={G.box} material={M.concrete} position={[x, ROOM_H / 2, z1 / 2]} scale={[0.4, ROOM_H, -z1]} />
      <mesh geometry={G.box} material={M.concrete} position={[x, (h + ROOM_H) / 2, (z0 + z1) / 2]} scale={[0.4, ROOM_H - h, 1.0]} />
    </>
  );
};

const Stairs: React.FC<{ G: GSet; M: MSet }> = ({ G, M }) => {
  const out: React.ReactNode[] = [];
  FLOORS.forEach((f) => {
    const y0 = f * FL;
    for (let i = 0; i < 9; i++) {
      const a = i / 9;
      out.push(<mesh key={`a${f}_${i}`} geometry={G.box} material={M.steps} position={[STAIR_X - 1.0, y0 + a * 1.8 + 0.1, -0.9 - a * 3.2]} scale={[1.2, 0.2, 0.36]} />);
      out.push(<mesh key={`b${f}_${i}`} geometry={G.box} material={M.steps} position={[STAIR_X + 0.9, y0 + 1.8 + a * 1.8 + 0.1, -4.1 + a * 3.2]} scale={[1.2, 0.2, 0.36]} />);
    }
    out.push(<mesh key={`l${f}`} geometry={G.box} material={M.concrete} position={[STAIR_X, y0 + 1.7, -4.55]} scale={[3.6, 0.2, 0.9]} />);
    out.push(<mesh key={`r${f}`} geometry={G.cyl} material={M.metal} position={[STAIR_X - 0.05, y0 + 2.0, -2.5]} rotation={[Math.atan2(1.8, 3.2) + Math.PI / 2, 0, 0]} scale={[0.03, 3.7, 0.03]} />);
  });
  return <>{out}</>;
};

const Arrow: React.FC<{ from: THREE.Vector3; dir: THREE.Vector3; len: number; mat: THREE.Material; G: GSet }> = ({ from, dir, len, mat, G }) => {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const shaftC = from.clone().addScaledVector(dir, len * 0.4);
  const headC = from.clone().addScaledVector(dir, len * 0.85);
  return (
    <>
      <mesh geometry={G.cyl} material={mat} position={shaftC} quaternion={q} scale={[0.13, len * 0.7, 0.13]} />
      <mesh geometry={G.cone} material={mat} position={headC} quaternion={q} scale={[0.32, len * 0.3, 0.32]} />
    </>
  );
};

// air path: down the shaft, through the stair door, along the corridor, out of the cut face
const AIR_PATH = [new THREE.Vector3(STAIR_X, 9.5, -2.5), new THREE.Vector3(STAIR_X, 1.3, -2.6), new THREE.Vector3(6.6, 1.15, -2.8), new THREE.Vector3(4.4, 1.3, -2.3), new THREE.Vector3(3.6, 1.5, 0.6)];
const alongPath = (u: number) => {
  const segs = AIR_PATH.length - 1;
  const lens = AIR_PATH.slice(1).map((p, i) => p.distanceTo(AIR_PATH[i]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = u * total;
  for (let i = 0; i < segs; i++) {
    if (d <= lens[i] || i === segs - 1) {
      const k = clamp01(d / lens[i]);
      return { p: AIR_PATH[i].clone().lerp(AIR_PATH[i + 1], k), dir: AIR_PATH[i + 1].clone().sub(AIR_PATH[i]).normalize() };
    }
    d -= lens[i];
  }
  return { p: AIR_PATH[segs].clone(), dir: new THREE.Vector3(0, 0, 1) };
};

const Scene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const { camera } = useThree();
  const plate = useMemo(() => makePlateTexture(["AUDIRA", "LANTAI 05 · KORIDOR"]), []);
  const M = useMemo(() => {
    const m = {
      concrete: makeMat({ grain: 0.16 }), slabEdge: makeMat({ emis: 1.02, grain: 0.14 }), door: makeMat({ emis: 0.93 }), leaf: makeMat({ fixed: 0.2, grain: 0.06 }), closer: makeMat({ fixed: 0.5 }), steps: makeMat({ add: 0.15, grain: 0.1 }), metal: makeMat({ emis: 0.5 }),
      furn: makeMat({ emis: 1.03 }), soft: makeMat({ emis: 1.06 }), monitor: makeMat({ add: 0.17 }), lamp: makeMat({ add: 0.2 }),
      fridge: makeMat({ add: 0.1 }), hotsmall: makeMat({ add: 0.34 }), plant: makeMat({ emis: 0.85 }),
      plate: makeMat({ emis: 0.98, map: plate, mapGain: 0.5 }), spray: makeMat({ fixed: 0.36 }),
      column: makeMat({ add: 0.2, grain: 0.18 }), skyBg: makeMat({ fixed: 0.105 }), ground: makeMat({ add: 0.06 }),
      city0: makeMat({ fixed: 0.16 }), city1: makeMat({ fixed: 0.2 }), city2: makeMat({ fixed: 0.24 }),
      ring: makeMat({ fixed: 0.9 }), collar: makeMat({ add: 0.16 }), bulb: makeMat({ fixed: 0.24 }), fan: makeMat({ add: 0.3 }),
      fg: makeMat({ fixed: 0.3 }), trim: makeMat({ fixed: 0.06 }), wedge: makeMat({ fixed: 0.72 }), fgMetal: makeMat({ fixed: 0.22 }),
    };
    return m as Record<string, THREE.ShaderMaterial>;
  }, [plate]);
  const FX = useMemo(() => ({
    flames: FLAMES.flatMap((_, i) => [makeFlameMat(i * 1.37, 0.82, 0.32), makeFlameMat(i * 1.37 + 0.3, 0.93, 0.36), makeFlameMat(i * 1.37 + 0.6, 1.02, 0.5)]),
    shimmer: makeShimmerMat(),
    glowBig: makeSpriteMat(0.7, 0.5), glowCore: makeSpriteMat(0.82, 0.85),
    holeGlow: makeSpriteMat(0.85, 0.9), smoke: makeSpriteMat(0.62, 0.9, 5), doorGlow: makeSpriteMat(0.95, 1.0, 7),
    air: new THREE.MeshBasicMaterial({ color: C.cyan, toneMapped: false, transparent: true, opacity: 0.9 }),
    // macro exception: the bulb is shown in visible light so its red liquid reads (research: red bulb)
    liquid: new THREE.MeshBasicMaterial({ color: "#D0101C", toneMapped: false }),
    glass: new THREE.MeshBasicMaterial({ color: "#E8F6FF", toneMapped: false, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.BackSide }),
  }), []);
  const G = useMemo<GSet>(() => {
    const wedgeShape = new THREE.Shape();
    wedgeShape.moveTo(0, 0); wedgeShape.lineTo(0.34, 0); wedgeShape.lineTo(0, 0.1); wedgeShape.closePath();
    const wedge = new THREE.ExtrudeGeometry(wedgeShape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 });
    return {
      box: new THREE.BoxGeometry(1, 1, 1),
      rbox: new RoundedBoxGeometry(1, 1, 1, 3, 0.12),
      rboxSoft: new RoundedBoxGeometry(1, 1, 1, 4, 0.3),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 18),
      cone: (() => { const g = new THREE.ConeGeometry(1, 1, 20, 12, true); g.translate(0, 0.5, 0); return g; })(),
      plane: new THREE.PlaneGeometry(1, 1),
      sphere: new THREE.SphereGeometry(1, 16, 12),
      wedge,
      torus: new THREE.TorusGeometry(1, 0.28, 10, 28),
    };
  }, []);

  const p = pose(t);
  const camQ = useMemo(() => new THREE.Quaternion(), []);
  camQ.setFromRotationMatrix(new THREE.Matrix4().lookAt(p.pos, p.tgt, new THREE.Vector3(0, 1, 0)));
  const fk = fireK(t), lD = leakDoor(t), lH = leakHole(t);
  const ang = doorAngle(t);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(p.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(p.tgt);
    cam.fov = p.fov; cam.near = 0.1; cam.far = 500;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(FX_LAYER);
    const tt = frame % 97;
    Object.values(M).forEach((m) => { m.uniforms.t.value = tt; m.uniforms.fireK.value = fk; m.uniforms.leakDoor.value = lD; m.uniforms.leakHole.value = lH; });
    M.ring.uniforms.fixT.value = 0.22 + 0.68 * lH;
    FX.flames.forEach((m) => { m.uniforms.t.value = t * 30 + 40; m.uniforms.k.value = 0.55 + 0.45 * fk; });
    FX.shimmer.uniforms.t.value = t * 30 + 40;
    FX.shimmer.uniforms.k.value = fk;
    FX.holeGlow.uniforms.s.value = 0.9 * lH;
    FX.smoke.uniforms.s.value = 0.55 * lD;
    FX.doorGlow.uniforms.s.value = 1.1 * clamp01(ang / 0.3);
    FX.air.opacity = 0.9 * win(t, T.tangga + 0.4, S.PAYOFF[1] + 0.2, 0.5);
  });

  const hinge = new THREE.Vector3(FIRE_DOOR.x, 0, FIRE_DOOR.z0);
  const freeEdge = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)).multiplyScalar(0.98).add(hinge);
  const wIn = wedgeIn(t), wKick = wedgeKick(t);
  const wedgePos = freeEdge.clone().add(new THREE.Vector3(0.25 + (1 - wIn) * 1.2 + wKick * 1.6, 0, 0.15 + wKick * 0.9));
  const broke = t >= T.pecah;
  const sinceBreak = t - T.pecah;
  const sprayK = sprayOn(t);
  const fanSpin = t * 9;

  const rooms: React.ReactNode[] = [];
  FLOORS.forEach((f) => BAYS.forEach((b) => {
    const cx = b * BAY, y0 = f * FL;
    const hot = f === 0 && b === 0, corridor = f === 0 && b === 1, stair = b === 2;
    const k = `${f}_${b}`;
    if (!stair && !hot) {
      rooms.push(
        <group key={`s${k}`} position={[cx - 0.4, y0 + ROOM_H, -2.6]}>
          <mesh geometry={G.cyl} material={M.metal} position={[0, -0.14, 0]} scale={[0.03, 0.28, 0.03]} />
          <mesh geometry={G.cyl} material={M.metal} position={[0, -0.3, 0]} scale={[0.04, 0.07, 0.04]} />
          <mesh geometry={G.cyl} material={M.metal} position={[0, -0.36, 0]} scale={[0.11, 0.015, 0.11]} />
        </group>,
      );
      if (!stair) rooms.push(<mesh key={`l${k}`} geometry={G.rbox} material={M.lamp} position={[cx - 0.9, y0 + ROOM_H - 0.04, -2.0]} scale={[1.2, 0.06, 0.5]} />);
    }
    if (hot || corridor || stair) return;
    rooms.push(<Room key={`r${k}`} cx={cx} y0={y0} type={Math.floor(rng(300 + f * 31 + b * 7)() * 5)} seed={1000 + f * 17 + b * 5} G={G} M={M} />);
  }));

  return (
    <>
      <color attach="background" args={[BG]} />
      <mesh geometry={G.plane} material={M.skyBg} position={[0, 30, -150]} scale={[460, 180, 1]} />
      {CITY.map((c, i) => (
        <mesh key={`city${i}`} geometry={G.box} material={[M.city0, M.city1, M.city2][c.m]} position={[c.x, (c.top + Y_BOT - 4) / 2, c.z]} scale={[c.w, c.top - Y_BOT + 4, 8]} />
      ))}
      <mesh geometry={G.plane} material={M.ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_BOT, -20]} scale={[300, 300, 1]} />

      {/* slabs, roof, parapet, back wall */}
      {[...FLOORS, 3].map((f) => (
        <mesh key={`slab${f}`} geometry={G.box} material={M.slabEdge} position={[0, f * FL - SLAB / 2, -DEPTH / 2 - 0.15]} scale={[22.4, SLAB, DEPTH + 0.3]} />
      ))}
      <mesh geometry={G.box} material={M.concrete} position={[0, Y_TOP + 0.45, -0.15]} scale={[22.4, 0.9, 0.3]} />
      <mesh geometry={G.box} material={M.concrete} position={[0, (Y_TOP + Y_BOT) / 2, -DEPTH - 0.15]} scale={[22.4, Y_TOP - Y_BOT, 0.3]} />
      {[-11, -6.6, -2.2, 2.2, 6.6, 11].map((x) => <Partition key={`w${x}`} x={x} door={x === 2.2 || x === 6.6} G={G} M={M} />)}
      {/* front structural columns (foreground plane when the camera is close) */}
      {[-11, -6.6, -2.2, 2.2, 6.6, 11].map((x) => (
        <mesh key={`col${x}`} geometry={G.rbox} material={M.column} position={[x, (Y_TOP + Y_BOT) / 2, 0.42]} scale={[0.55, Y_TOP - Y_BOT, 0.55]} />
      ))}
      {FLOORS.map((f) => <mesh key={`beam${f}`} geometry={G.rbox} material={M.column} position={[0, f * FL - 0.2, 0.42]} scale={[22.4, 0.42, 0.4]} />)}

      {/* AUDIRA plate on the corridor back wall */}
      <mesh geometry={G.plane} material={M.plate} position={[CORR_X + 0.1, 2.1, -DEPTH + 0.02]} scale={[2.4, 0.72, 1]} />

      {rooms}
      <Stairs G={G} M={M} />
      {/* roof pressurisation fan over the stair shaft */}
      <group position={[STAIR_X, Y_TOP + 0.9, -2.5]}>
        <mesh geometry={G.cyl} material={M.fan} scale={[1.0, 0.9, 1.0]} />
        <group position={[0, 0.5, 0]} rotation={[0, fanSpin, 0]}>
          {[0, 1, 2, 3, 4].map((i) => <mesh key={i} geometry={G.rbox} material={M.metal} rotation={[0, (i * Math.PI * 2) / 5, 0.25]} position={[Math.cos((i * Math.PI * 2) / 5) * 0.45, 0, -Math.sin((i * Math.PI * 2) / 5) * 0.45]} scale={[0.8, 0.04, 0.22]} />)}
        </group>
      </group>

      {/* fire door (hot room → corridor) with closer, and the stair door */}
      <DoorLeaf x={FIRE_DOOR.x} z0={FIRE_DOOR.z0} angle={ang} G={G} M={M} closer leafMat={M.leaf} />
      {/* hot gap in the open doorway: white-yellow against the cold leaf */}
      <mesh ref={fx} geometry={G.plane} material={FX.doorGlow} position={[FIRE_DOOR.x + 0.05, FIRE_DOOR.h / 2, FIRE_DOOR.z0 + 0.5]} rotation={[0, Math.PI / 2, 0]} scale={[1.5, 2.9, 1]} />
      <DoorLeaf x={STAIR_DOOR.x} z0={STAIR_DOOR.z0} angle={stairDoor(t)} G={G} M={M} leafMat={M.leaf} />
      <mesh geometry={G.wedge} material={M.wedge} position={wedgePos} rotation={[0, Math.PI / 2 + wKick * 3, 0]} scale={1.7} visible={wIn > 0.01 || (wKick > 0 && wKick < 1)} />

      {/* hot compartment furniture */}
      <group position={[FIRE.x, 0, FIRE.z]}>
        <mesh geometry={G.rboxSoft} material={M.soft} position={[0, 0.28, 0]} scale={[1.9, 0.5, 0.85]} />
        <mesh geometry={G.rboxSoft} material={M.soft} position={[0, 0.66, -0.36]} scale={[1.9, 0.62, 0.26]} />
        <mesh geometry={G.rboxSoft} material={M.soft} position={[-0.92, 0.48, 0]} scale={[0.24, 0.5, 0.85]} />
        <mesh geometry={G.rboxSoft} material={M.soft} position={[0.92, 0.48, 0]} scale={[0.24, 0.5, 0.85]} />
        <mesh geometry={G.rbox} material={M.furn} position={[0.3, 0.22, 1.25]} scale={[1.0, 0.08, 0.6]} />
      </group>
      <mesh geometry={G.rbox} material={M.furn} position={[-1.5, 1.0, -4.5]} scale={[0.8, 2.0, 0.45]} />

      {/* pipe + cable tray through the partition, gap ring, firestop collar + sealant */}
      <mesh geometry={G.cyl} material={M.metal} position={[2.6, PIPE.y, PIPE.z]} rotation={[0, 0, Math.PI / 2]} scale={[PIPE.r, 5.2, PIPE.r]} />
      <mesh geometry={G.box} material={M.metal} position={[2.6, TRAY.y, TRAY.z]} scale={[5.2, 0.04, 0.42]} />
      {[-0.12, 0, 0.12].map((dz) => <mesh key={dz} geometry={G.cyl} material={M.furn} position={[2.6, TRAY.y + 0.04, TRAY.z + dz]} rotation={[0, 0, Math.PI / 2]} scale={[0.025, 5.2, 0.025]} />)}
      <mesh geometry={G.torus} material={M.ring} position={[2.41, PIPE.y, PIPE.z]} rotation={[0, Math.PI / 2, 0]} scale={0.13} />
      <mesh geometry={G.box} material={M.ring} position={[2.41, TRAY.y + 0.02, TRAY.z]} scale={[0.02, 0.16, 0.52]} />
      <mesh geometry={G.torus} material={M.collar} position={[2.46 + (1 - collar(t)) * 0.9, PIPE.y, PIPE.z]} rotation={[0, Math.PI / 2, 0]} scale={[0.15, 0.15, 0.15 + 0.25 * collar(t)]} />
      <mesh geometry={G.rbox} material={M.collar} position={[2.46, TRAY.y + 0.02, TRAY.z]} scale={[0.08 * collar(t) + 0.001, 0.22, 0.6]} />
      <mesh ref={fx} geometry={G.plane} material={FX.holeGlow} position={[2.48, PIPE.y + 0.12, PIPE.z]} rotation={[0, Math.PI / 2, 0]} scale={[1.0, 1.0, 1]} />

      {/* sprinkler head over the fire: frame arms, toothed deflector, glass bulb */}
      <group position={[SPRINK.x, ROOM_H, SPRINK.z]}>
        <mesh geometry={G.cyl} material={M.metal} position={[0, -0.12, 0]} scale={[0.04, 0.24, 0.04]} />
        {[-1, 1].map((s) => <mesh key={s} geometry={G.box} material={M.metal} position={[s * 0.042, -0.29, -0.004]} scale={[0.007, 0.12, 0.01]} />)}
        <mesh geometry={G.cyl} material={M.metal} position={[0, -0.36, 0]} scale={[0.1, 0.012, 0.1]} />
        {Array.from({ length: 10 }, (_, i) => <mesh key={i} geometry={G.box} material={M.metal} position={[Math.cos(i * 0.628) * 0.105, -0.36, Math.sin(i * 0.628) * 0.105]} rotation={[0, -i * 0.628, 0]} scale={[0.03, 0.01, 0.012]} />)}
        {!broke ? (
          <group position={[0, -0.29, 0]}>
            <mesh geometry={G.sphere} material={FX.glass} scale={[0.023, 0.052, 0.023]} />
            <mesh geometry={G.sphere} material={FX.liquid} scale={[0.016, 0.042, 0.016]} />
            <mesh geometry={G.sphere} material={FX.glass} position={[0.004, 0.025, 0.006]} scale={0.0045} />
          </group>
        ) : null}
        {broke && sinceBreak < 1.4 ? SHARDS.map((s, i) => (
          <mesh key={`sh${i}`} geometry={G.box} material={i % 2 ? FX.liquid : FX.glass} position={[s.v.x * sinceBreak, -0.29 + s.v.y * sinceBreak - 2.2 * sinceBreak * sinceBreak, s.v.z * sinceBreak]} rotation={[s.spin * sinceBreak, s.spin * 0.7 * sinceBreak, 0]} scale={0.012} />
        )) : null}
      </group>

      {/* fire */}
      <group position={[FIRE.x, 0.5, FIRE.z]}>
        {FLAMES.map(([x, z, rad, h], i) => [1, 0.68, 0.4].map((k, j) => (
          <mesh key={`fl${i}_${j}`} ref={fx} geometry={G.cone} material={FX.flames[i * 3 + j]} position={[x, 0, z]} scale={[rad * k * 1.1, h * (0.55 + 0.45 * k) * (0.8 + 0.2 * fk), rad * k * 1.1]} />
        )))}
      </group>
      <mesh ref={fx} geometry={G.plane} material={FX.shimmer} position={[0, 2.2, -1.9]} scale={[3.9, 1.9, 1]} />
      <mesh ref={fx} geometry={G.plane} material={FX.glowBig} position={[0, 1.7, -1.6]} scale={[6.0, 4.4, 1]} />
      <mesh ref={fx} geometry={G.plane} material={FX.glowCore} position={[FIRE.x, 1.0, FIRE.z + 0.8]} scale={[2.6, 2.4, 1]} />

      {/* spray umbrella from the one open head */}
      {sprayK > 0.01 ? SPRAY.map((s, i) => {
        const d = 0.25 + ((s.phase + t * s.speed) % 1) * 2.1 * sprayK;
        const pp = SPRINK.clone().addScaledVector(s.dir, d);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.dir);
        return <mesh key={`sp${i}`} geometry={G.cyl} material={M.spray} position={pp} quaternion={q} scale={[0.012, s.len * sprayK, 0.012]} />;
      }) : null}

      {/* warm smoke through the open fire door; pushed back out of the cut face once the stair is pressurised */}
      {lD > 0.02 ? SMOKE.filter((_, i) => t < S.PAYOFF[0] || i % 3 === 0).map((s, i) => {
        const u = (s.phase + t * s.speed) % 1;
        const push = pushK(t);
        const toStair = new THREE.Vector3(2.4 + u * 3.6, s.y + u * 0.5, -2.8 + s.spread * u);
        const outFront = new THREE.Vector3(2.5 + u * 1.6 + s.spread * 0.3, s.y + u * 0.4, -2.8 + u * 3.8);
        const pp = toStair.lerp(outFront, push);
        return <mesh key={`sm${i}`} ref={fx} geometry={G.plane} material={FX.smoke} position={pp} quaternion={camQ} scale={s.size * (0.6 + u)} />;
      }) : null}

      {/* pressurisation air: arrows down the shaft, through the stair door, out along the corridor */}
      {FX.air.opacity > 0.01 ? Array.from({ length: 7 }, (_, i) => {
        const u = ((i / 7 + t * 0.1) % 1);
        const a = alongPath(u);
        return <Arrow key={`air${i}`} from={a.p} dir={a.dir} len={1.2} mat={FX.air} G={G} />;
      }) : null}

      <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao />
    </>
  );
};

// ---------- 2D HUD ----------
const MONO: React.CSSProperties = { fontFamily: `'${FONT}'`, fontVariantNumeric: "tabular-nums", letterSpacing: "0.12em" };

const Tag: React.FC<{ cam: THREE.PerspectiveCamera; p: THREE.Vector3; dx: number; dy: number; text: string; o: number; color?: string }> = ({ cam, p, dx, dy, text, o, color = C.cyan }) => {
  if (o <= 0.01) return null;
  const v = p.clone().project(cam);
  if (v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05) return null;
  const x = (v.x * 0.5 + 0.5) * 1080, y = (-v.y * 0.5 + 0.5) * 1920;
  const tx = Math.min(Math.max(x + dx, 70), 1010), ty = Math.min(Math.max(y + dy, 300), 1500);
  const right = tx > 620 || (dx < 0 && tx > 300);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={`${x},${y} ${tx},${ty}`} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray="8 6" />
        <circle cx={x} cy={y} r={8} fill={color} />
      </svg>
      <div style={{ position: "absolute", left: right ? undefined : tx, right: right ? 1080 - tx : undefined, top: ty - 20, fontSize: 24, fontWeight: 600, color, whiteSpace: "nowrap", background: "#05020Fd6", padding: "6px 12px", border: `1.5px solid ${color}aa`, ...MONO }}>{text}</div>
    </div>
  );
};

const proj = (cam: THREE.PerspectiveCamera, p: THREE.Vector3) => { const v = p.clone().project(cam); return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, ok: v.z < 1 }; };

const SECTION_LABEL: [number, string][] = [
  [0, "KAMERA TERMAL"], [S.KONTEKS[0], "KOMPARTEMEN"], [S.MEKANISME[0], "PENYETOP API"], [T.plafon - 0.3, "SPRINKLER"],
  [S.REVEAL[0], "PINTU TAHAN API"], [S.PAYOFF[0], "TANGGA BERTEKANAN"], [S.OUTRO[0], "JANGAN DIGANJAL"],
];

const Overlay: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const cam = makeCam(t);
  const label = [...SECTION_LABEL].reverse().find(([s]) => t >= s)![1];
  const blink = 0.55 + 0.45 * Math.cos(frame * 0.4);
  const hudO = 1 - ss(OUTRO_START - 0.3, OUTRO_START, t);

  // compartment grid (KONTEKS)
  const gridO = win(t, T.kotak - 0.1, T.dinding + 0.6, 0.35);
  const rects: React.ReactNode[] = [];
  if (gridO > 0.01) {
    FLOORS.forEach((f, fi) => BAYS.forEach((b, bi) => {
      const a = proj(cam, new THREE.Vector3(b * BAY - 2.0, f * FL, 0)), c = proj(cam, new THREE.Vector3(b * BAY + 2.0, f * FL + ROOM_H, 0));
      const d = ss(T.kotak + (fi + bi) * 0.06, T.kotak + (fi + bi) * 0.06 + 0.3, t);
      const hot = f === 0 && b === 0;
      rects.push(<rect key={`${f}_${b}`} x={a.x} y={c.y} width={(c.x - a.x) * d} height={(a.y - c.y)} fill={hot ? "#EA5E2822" : "none"} stroke={hot ? C.yellow : C.cyan} strokeWidth={hot ? 4 : 2} opacity={d} />);
    }));
  }
  // wall + slab highlight around the hot compartment (front-face rectangle, thick)
  const hotRect = (() => { const a = proj(cam, new THREE.Vector3(-2.2, -SLAB, 0)), c = proj(cam, new THREE.Vector3(2.2, FL, 0)); return { x: a.x, y: c.y, w: c.x - a.x, h: a.y - c.y }; })();
  const wallO = win(t, T.dinding, S.KONTEKS[1] + 0.3, 0.3);
  // fire-wall line in REVEAL: the corridor partition, gap = door opening
  const fwO = win(t, S.REVEAL[0] + 0.3, S.REVEAL[1] + 0.2, 0.4) + win(t, S.OUTRO[0] + 0.3, T.mengganjal + 2.0, 0.3);
  const open = clamp01(doorAngle(t) / 0.25);
  const wallTop = proj(cam, new THREE.Vector3(2.2, ROOM_H, FIRE_DOOR.z0 + 0.5)), wallBot = proj(cam, new THREE.Vector3(2.2, 0, FIRE_DOOR.z0 + 0.5));
  const doorTop = proj(cam, new THREE.Vector3(2.2, FIRE_DOOR.h, FIRE_DOOR.z0 + 0.5));
  const leftTop = proj(cam, new THREE.Vector3(-2.2, ROOM_H, FIRE_DOOR.z0 + 0.5)), leftBot = proj(cam, new THREE.Vector3(-2.2, 0, FIRE_DOOR.z0 + 0.5));
  const fwColor = open > 0.5 ? C.red : C.cyan;
  // ruler (PAYOFF)
  const rulerO = win(t, T.gedungP - 0.2, T.tekanan + 0.2, 0.4);
  const rx = 11.6, rG = proj(cam, new THREE.Vector3(rx, Y_BOT, 0.4)), r24 = proj(cam, new THREE.Vector3(rx, Y_BOT + 24, 0.4)), rT = proj(cam, new THREE.Vector3(rx, Y_TOP, 0.4));
  // timers
  const timerO = win(t, T.setidaknya, S.HOOK[1] + 0.4, 0.3) + win(t, T.semua, S.PAYOFF[1] + 0.3, 0.3);
  const clock = Math.floor(Math.max(0, t - T.setidaknya) * 20);
  const mm = String(Math.floor(clock / 60) % 60).padStart(2, "0"), sec = String(clock % 60).padStart(2, "0");
  const chipO = win(t, T.enam - 0.1, S.KONTEKS[1] + 0.5, 0.25);
  const chipPop = 0.85 + 0.15 * ss(T.enam - 0.1, T.enam + 0.25, t);
  const pFire = proj(cam, new THREE.Vector3(FIRE.x, 1.3, FIRE.z));
  const xO = win(t, S.OUTRO[0], T.mengganjal + 0.5, 0.25);
  const wedgeP = proj(cam, new THREE.Vector3(FIRE_DOOR.x + 0.9, 0.15, FIRE_DOOR.z0 + 0.6));

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: `'${FONT}'`, color: "#F1EEF4" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 4px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 40%, transparent 58%, #05020Fbb 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 340, background: "linear-gradient(#05020Fa0 30%, #05020F00)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "linear-gradient(#05020F00, #05020Fcc)" }} />

      <div style={{ opacity: hudO }}>
        {/* top-left kicker */}
        <div style={{ position: "absolute", left: 66, top: 272, ...MONO }}>
          <div style={{ fontSize: 24, color: C.cyan, fontWeight: 600 }}><span style={{ color: C.red, opacity: blink }}>●</span> AUDIRA IR-CAM · {label}</div>
          <div style={{ fontSize: 20, opacity: 0.6, marginTop: 8 }}>ilustrasi · gedung fiktif</div>
        </div>
        {/* ironbow scale */}
        <div style={{ position: "absolute", right: 66, top: 420, height: 300, width: 16, background: "linear-gradient(0deg,#04020D,#30076A 20%,#9C1A88 42%,#EB5E28 62%,#F7CF3A 84%,#FFFBE6)", border: "2px solid #ffffffaa" }} />
        <div style={{ position: "absolute", right: 94, top: 414, fontSize: 18, ...MONO, opacity: 0.85 }}>PANAS</div>
        <div style={{ position: "absolute", right: 94, top: 698, fontSize: 18, ...MONO, opacity: 0.85 }}>DINGIN</div>

        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {/* hook crosshair on the fire */}
          {t < S.HOOK[1] + 0.5 && pFire.ok ? (
            <g stroke={C.cyan} strokeWidth={3} fill="none" opacity={1 - ss(S.HOOK[1], S.HOOK[1] + 0.5, t)}>
              <circle cx={pFire.x} cy={pFire.y} r={34} />
              <line x1={pFire.x - 70} y1={pFire.y} x2={pFire.x - 40} y2={pFire.y} /><line x1={pFire.x + 40} y1={pFire.y} x2={pFire.x + 70} y2={pFire.y} />
              <line x1={pFire.x} y1={pFire.y - 70} x2={pFire.x} y2={pFire.y - 40} /><line x1={pFire.x} y1={pFire.y + 40} x2={pFire.x} y2={pFire.y + 70} />
            </g>
          ) : null}
          <g opacity={gridO}>{rects}</g>
          {wallO > 0.01 ? <rect x={hotRect.x} y={hotRect.y} width={hotRect.w} height={hotRect.h} fill="none" stroke={C.cyan} strokeWidth={7} opacity={wallO * (0.75 + 0.25 * Math.sin(t * 8))} /> : null}
          {fwO > 0.01 ? (
            <g opacity={Math.min(1, fwO)} strokeWidth={6} fill="none">
              <polyline points={`${leftBot.x},${leftBot.y} ${leftTop.x},${leftTop.y} ${wallTop.x},${wallTop.y} ${doorTop.x},${doorTop.y}`} stroke={C.cyan} />
              <line x1={doorTop.x} y1={doorTop.y} x2={wallBot.x} y2={wallBot.y} stroke={fwColor} strokeDasharray={open > 0.5 ? "14 12" : undefined} opacity={open > 0.5 ? 0.9 : 1} />
              <line x1={leftBot.x} y1={leftBot.y} x2={wallBot.x} y2={wallBot.y} stroke={C.cyan} />
            </g>
          ) : null}
          {rulerO > 0.01 && rG.ok ? (
            <g opacity={rulerO} stroke={C.cyan} strokeWidth={3}>
              <line x1={rG.x + 30} y1={rG.y} x2={rT.x + 30} y2={rT.y} />
              {Array.from({ length: 9 }, (_, i) => { const pp = proj(cam, new THREE.Vector3(rx, Y_BOT + i * 3.6, 0.4)); return <line key={i} x1={pp.x + 20} y1={pp.y} x2={pp.x + 40} y2={pp.y} />; })}
              <line x1={r24.x - 400} y1={r24.y} x2={r24.x + 50} y2={r24.y} stroke={C.yellow} strokeWidth={4} strokeDasharray="12 8" opacity={ss(T.dua, T.dua + 0.5, t)} />
            </g>
          ) : null}
          {xO > 0.01 && wedgeP.ok ? (
            <g opacity={xO} stroke={C.red} strokeWidth={9} strokeLinecap="round">
              <line x1={wedgeP.x - 46} y1={wedgeP.y - 46} x2={wedgeP.x + 46} y2={wedgeP.y + 46} />
              <line x1={wedgeP.x + 46} y1={wedgeP.y - 46} x2={wedgeP.x - 46} y2={wedgeP.y + 46} />
            </g>
          ) : null}
        </svg>

        {rulerO > 0.01 && rG.ok ? (
          <div style={{ position: "absolute", right: 1080 - (r24.x + 40), top: r24.y - 62, opacity: rulerO * ss(T.dua, T.dua + 0.5, t), fontSize: 44, fontWeight: 600, color: C.yellow, background: "#05020Fd6", padding: "4px 14px", border: `2px solid ${C.yellow}`, ...MONO, letterSpacing: "0.04em" }}>&gt; 24 m</div>
        ) : null}

        {/* chips */}
        {chipO > 0.01 ? (
          <div style={{ position: "absolute", left: 66, top: 1130, opacity: chipO, transform: `scale(${chipPop})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 18, background: "#05020Fe0", border: `2px solid ${C.yellow}`, padding: "12px 20px", boxShadow: `0 0 30px ${C.amber}55` }}>
            <div style={{ fontSize: 64, fontWeight: 600, color: C.yellow, lineHeight: 1, ...MONO, letterSpacing: "0.02em" }}>60 MENIT</div>
            <div style={{ fontSize: 19, lineHeight: 1.3, ...MONO }}>KETAHANAN API<br /><span style={{ opacity: 0.6 }}>contoh rating</span></div>
          </div>
        ) : null}
        {timerO > 0.01 ? (
          <div style={{ position: "absolute", left: 66, top: 1130, opacity: Math.min(1, timerO), display: "flex", alignItems: "center", gap: 16, background: "#05020Fe0", border: `2px solid ${C.cyan}`, padding: "10px 18px" }}>
            <svg width={56} height={56}><circle cx={28} cy={28} r={22} stroke="#ffffff33" strokeWidth={6} fill="none" /><circle cx={28} cy={28} r={22} stroke={C.cyan} strokeWidth={6} fill="none" strokeDasharray={`${(clock % 60) / 60 * 138} 138`} transform="rotate(-90 28 28)" /></svg>
            <div style={{ fontSize: 46, fontWeight: 600, color: C.cyan, ...MONO, letterSpacing: "0.04em" }}>{mm}:{sec}</div>
            <div style={{ fontSize: 19, ...MONO, lineHeight: 1.3 }}>{t > S.PAYOFF[0] ? <>WAKTU<br />EVAKUASI</> : <>API<br />TERTAHAN</>}</div>
          </div>
        ) : null}

        {/* callouts (object first, label second) */}
        <Tag cam={cam} p={new THREE.Vector3(4.4, 1.4, -1.5)} dx={-40} dy={-300} text="RUANG SEBELAH DINGIN" o={win(t, T.ruang - 0.1, S.HOOK[1] + 0.3)} />
        <Tag cam={cam} p={new THREE.Vector3(0, ROOM_H, 0)} dx={-60} dy={-200} text="KOMPARTEMEN" o={win(t, T.kompartemen - 0.1, T.dinding + 0.4)} color={C.yellow} />
        <Tag cam={cam} p={new THREE.Vector3(2.2, -0.2, 0)} dx={120} dy={180} text="DINDING + LANTAI TAHAN API" o={win(t, T.dinding + 0.6, T.enam - 0.2)} />
        <Tag cam={cam} p={HOLE} dx={-40} dy={-240} text="CELAH = JALUR PANAS" o={win(t, T.setiap + 0.3, T.pipa)} color={C.red} />
        <Tag cam={cam} p={new THREE.Vector3(3.4, PIPE.y, PIPE.z)} dx={40} dy={220} text="PIPA" o={win(t, T.pipa, T.disumbat)} />
        <Tag cam={cam} p={new THREE.Vector3(3.6, TRAY.y, TRAY.z)} dx={60} dy={-220} text="KABEL" o={win(t, T.pipa + 0.6, T.disumbat)} />
        <Tag cam={cam} p={new THREE.Vector3(2.46, PIPE.y, PIPE.z)} dx={60} dy={-200} text="FIRESTOP · TERSUMBAT" o={win(t, T.disumbat + 0.3, T.plafon)} />
        <Tag cam={cam} p={new THREE.Vector3(SPRINK.x, ROOM_H - 0.2, SPRINK.z)} dx={-60} dy={-260} text="KEPALA SPRINKLER" o={win(t, T.kepala - 0.1, T.bulb)} />
        <Tag cam={cam} p={new THREE.Vector3(SPRINK.x, ROOM_H - 0.29, SPRINK.z)} dx={-60} dy={-260} text="BULB KACA · CAIRAN MERAH" o={win(t, T.bulb, T.pecah)} color={C.yellow} />
        <Tag cam={cam} p={new THREE.Vector3(SPRINK.x, ROOM_H - 0.29, SPRINK.z)} dx={-60} dy={-260} text="PECAH KARENA PANAS" o={win(t, T.pecah, T.hanya)} color={C.red} />
        <Tag cam={cam} p={new THREE.Vector3(SPRINK.x, ROOM_H - 0.36, SPRINK.z)} dx={60} dy={-240} text="MENYEMPROT" o={win(t, T.hanya, S.MEKANISME[1] + 0.3)} color={C.yellow} />
        <Tag cam={cam} p={new THREE.Vector3(-4.8, ROOM_H - 0.36, -2.6)} dx={-20} dy={-180} text="KERING" o={win(t, T.hanya + 0.3, S.MEKANISME[1] + 0.3)} />
        <Tag cam={cam} p={new THREE.Vector3(4.0, ROOM_H - 0.36, -2.6)} dx={20} dy={-120} text="KERING" o={win(t, T.hanya + 0.5, S.MEKANISME[1] + 0.3)} />
        <Tag cam={cam} p={new THREE.Vector3(2.45, 2.2, FIRE_DOOR.z0 + 0.3)} dx={80} dy={-300} text="DOOR CLOSER" o={win(t, T.pintu1, T.menutup + 0.9)} />
        <Tag cam={cam} p={new THREE.Vector3(2.3, 1.0, FIRE_DOOR.z0 + 0.5)} dx={140} dy={-380} text="DINDING API TERSAMBUNG" o={win(t, T.menutup + 0.75, T.pintu2)} />
        <Tag cam={cam} p={new THREE.Vector3(FIRE_DOOR.x + 1.0, 0.1, FIRE_DOOR.z0 + 0.6)} dx={90} dy={220} text="DIGANJAL" o={win(t, T.diganjal + 0.3, S.REVEAL[1] + 0.2)} color={C.yellow} />
        <Tag cam={cam} p={new THREE.Vector3(2.3, 1.1, FIRE_DOOR.z0 + 0.5)} dx={140} dy={-380} text="CELAH = DINDING BOLONG" o={win(t, T.melubangi, S.REVEAL[1] + 0.2)} color={C.red} />
        <Tag cam={cam} p={new THREE.Vector3(STAIR_X, 6, -2.0)} dx={-80} dy={-160} text="TANGGA DARURAT" o={win(t, T.tangga, T.semua - 0.2)} />
        <Tag cam={cam} p={new THREE.Vector3(STAIR_X, 1.3, -2.6)} dx={-60} dy={-300} text="TEKANAN UDARA" o={win(t, T.tekanan, T.semua - 0.2)} />
        <Tag cam={cam} p={new THREE.Vector3(3.6, 1.8, -0.6)} dx={40} dy={-330} text="ASAP TERDORONG KELUAR" o={win(t, T.asap, T.semua - 0.2)} color={C.yellow} />
        <Tag cam={cam} p={new THREE.Vector3(FIRE_DOOR.x + 0.9, 0.15, FIRE_DOOR.z0 + 0.6)} dx={60} dy={-300} text="JANGAN DIGANJAL" o={xO} color={C.red} />
      </div>
    </div>
  );
};

// ---------- karaoke captions ----------
type Chunk = { words: Word[]; start: number; end: number };
const NUM = new Set(["satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "puluh", "ratus", "menit", "menit.", "menit,", "meter", "meter,", "meter."]);
const CONJ = new Set(["dan", "di", "ke", "dari", "untuk", "jadi", "supaya", "dengan", "atau"]);
const isNum = (w: string) => NUM.has(w.toLowerCase());
const isConj = (w: string) => CONJ.has(norm(w));
// a cut before word i is legal unless it splits a spelled number ("enam puluh menit") or leaves a connector at a line end
const cutOk = (ws: Word[], i: number) => i > 0 && i < ws.length && !(isNum(ws[i].w) && isNum(ws[i - 1].w) && !/[.,]$/.test(ws[i - 1].w)) && !isConj(ws[i].w);
const cutCost = (ws: Word[], i: number) => (cutOk(ws, i) ? 0 : 100) + (isConj(ws[i - 1]?.w ?? "") ? 30 : 0);
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  (TL.clips as { words: Word[] }[]).forEach((c) => {
    let ws = c.words;
    while (ws.length) {
      let take = ws.length;
      if (ws.length > 6) {
        const target = Math.ceil(ws.length / Math.ceil(ws.length / 5));
        let best = -1, bestCost = 1e9;
        for (let k = 3; k <= Math.min(6, ws.length - 2); k++) {
          const cost = cutCost(ws, k) + Math.abs(k - target) * 2;
          if (cost < bestCost) { bestCost = cost; best = k; }
        }
        take = best;
      }
      const part = ws.slice(0, take);
      out.push({ words: part, start: part[0].s - 0.12, end: part[part.length - 1].e + 0.25 });
      ws = ws.slice(take);
    }
  });
  for (let i = 0; i < out.length - 1; i++) out[i].end = Math.min(out[i].end, out[i + 1].start);
  return out;
})();
const splitLines = (ws: Word[]): Word[][] => {
  const chars = ws.reduce((a, w) => a + w.w.length + 1, 0);
  if (ws.length <= 4 && chars <= 25) return [ws];
  let best = Math.ceil(ws.length / 2), bestCost = 1e9;
  for (let k = 1; k < ws.length; k++) {
    const l1 = ws.slice(0, k).reduce((a, w) => a + w.w.length + 1, 0);
    const cost = Math.abs(chars - 2 * l1) + (cutOk(ws, k) ? 0 : 200) + (isConj(ws[k - 1].w) ? 40 : 0) + (k === ws.length - 1 || k === 1 ? 60 : 0);
    if (cost < bestCost) { bestCost = cost; best = k; }
  }
  return [ws.slice(0, best), ws.slice(best)];
};

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ch = CHUNKS.find((c) => t >= c.start && t < c.end);
  if (!ch || t > OUTRO_START) return null;
  const ws = ch.words;
  const lines = splitLines(ws);
  const appear = ss(ch.start, ch.start + 0.15, t);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1300, fontFamily: `'${FONT}'`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: appear, transform: `translateY(${(1 - appear) * 14}px)` }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 24, alignItems: "baseline", padding: "8px 22px", background: "#05020Fc8", borderLeft: `4px solid ${C.cyan}` }}>
          {ln.map((w, i) => {
            const active = t >= w.s && t < w.e + 0.08;
            const done = t >= w.e + 0.08;
            const b = active ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
            return (
              <span key={i} style={{ display: "inline-block", whiteSpace: "nowrap", fontSize: 58, fontWeight: 600, letterSpacing: "-0.01em", color: active ? C.yellow : done ? "#F1EEF4" : "#F1EEF4bb", transform: `scale(${b})`, textShadow: active ? `0 0 18px ${C.amber}aa` : "none" }}>{w.w}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill>
      <Stage3D background={BG} overlay={() => <><Overlay t={t} frame={frame} /><Captions t={t} /></>}>
        <Scene t={t} frame={frame} />
      </Stage3D>
      <Outro start={OUTRO_START} />
    </AbsoluteFill>
  );
};
