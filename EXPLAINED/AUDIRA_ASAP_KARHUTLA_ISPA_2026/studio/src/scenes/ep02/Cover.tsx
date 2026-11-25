// EP02 cover — PAPUA SELATAN DIKEPUNG API (THERMALFORGE).
// Aerial thermal (ironbow) view of the Merauke lowlands: savanna and swamp, the Maro river,
// the Arafura coast, long fire fronts with burned scars behind them, thousands of hotspots,
// warm smoke plumes leaning north-west with the wind. Everything is driven by the frame.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { THERMAL_PALETTE as P } from "../../kits/thermalforge/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";

const MONO = "Consolas, 'Courier New', monospace";
const FOV = 44;
const camPose = (t: number) => ({
  pos: new THREE.Vector3(-0.6 + t * 0.15, 8.2, 12.5 - t * 0.2),
  target: new THREE.Vector3(-1.6, 0, -9),
});
const MERAUKE = new THREE.Vector3(-2.7, 0.05, -5.6);

// ---------- shared GLSL: hash/noise + ironbow LUT + heat field ----------
const GLSL_COMMON = /* glsl */ `
float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),u.x), mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int k=0;k<5;k++){ s+=a*vnoise(p); p=p*2.03+vec2(17.1,9.7); a*=0.5; } return s; }
vec3 ironbow(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 c0=vec3(0.01,0.01,0.05), c1=vec3(0.07,0.03,0.33), c2=vec3(0.30,0.05,0.55), c3=vec3(0.66,0.09,0.50),
       c4=vec3(0.90,0.25,0.15), c5=vec3(0.97,0.55,0.07), c6=vec3(0.99,0.82,0.22), c7=vec3(1.0,0.98,0.88);
  if(t<0.14) return mix(c0,c1,t/0.14);
  if(t<0.30) return mix(c1,c2,(t-0.14)/0.16);
  if(t<0.45) return mix(c2,c3,(t-0.30)/0.15);
  if(t<0.60) return mix(c3,c4,(t-0.45)/0.15);
  if(t<0.72) return mix(c4,c5,(t-0.60)/0.12);
  if(t<0.86) return mix(c5,c6,(t-0.72)/0.14);
  return mix(c6,c7,(t-0.86)/0.14);
}
// coast: sea west of this line (x < coastX)
float coastX(float z){ return -4.5 + sin(z*0.21)*0.8 + (fbm(vec2(z*0.12, 3.0))-0.5)*1.8 - z*0.06; }
// Maro river: from the east, meandering to the coast near Merauke
float riverDist(vec2 p){
  float cz = -5.9 + sin(p.x*0.42)*1.1 + sin(p.x*0.17+1.3)*1.8 + (fbm(p*0.25)-0.5)*1.0 - p.x*0.10;
  return abs(p.y - cz);
}
float river2Dist(vec2 p){
  float cx = 6.0 + sin(p.y*0.33)*1.4 + (fbm(p*0.3+5.0)-0.5)*1.4 - p.y*0.12;
  return abs(p.x - cx);
}
float hgt(vec2 p){
  float sea = 1.0 - smoothstep(coastX(p.y)-0.5, coastX(p.y)+0.3, p.x);
  float h = 0.35*fbm(p*0.18) + 0.08*fbm(p*0.9);
  h -= 0.22*(1.0 - smoothstep(0.1, 0.6, riverDist(p)));
  return mix(h, -0.12, sea);
}
`;

const TERRAIN_FRAG_HEAT = /* glsl */ `
// returns temperature 0..1 and writes a 'hot' flag for bloom boost
float heat(vec2 p, float time, out float hot){
  hot = 0.0;
  float cx = coastX(p.y);
  float sea = 1.0 - smoothstep(cx-0.35, cx+0.25, p.x);
  float n = fbm(p*0.22);
  float n2 = fbm(p*1.1+3.1);
  // savanna / grassland, slightly mottled
  float T = 0.22 + 0.10*n + 0.05*(n2-0.5);
  // swamps (rawa): cold dark patches
  float sw = smoothstep(0.56, 0.68, fbm(p*0.16+vec2(11.0,4.0)));
  T = mix(T, 0.12 + 0.03*n2, sw);
  // rivers (cold)
  float rd = riverDist(p);
  float rv = 1.0 - smoothstep(0.16, 0.30, rd);
  float bank = (1.0 - smoothstep(0.30, 0.55, rd)) - rv;
  float rd2 = river2Dist(p);
  float rv2 = 1.0 - smoothstep(0.08, 0.17, rd2);
  // swamp channels: thin cold creeks meandering through the rawa
  float chN = abs(fbm(p*0.55+vec2(7.0,2.0)) - 0.5);
  float chan = (1.0 - smoothstep(0.006, 0.022, chN)) * (0.35 + 0.65*sw);
  float water = max(max(rv, rv2*0.95), chan*0.9);
  T += 0.05*bank;                     // banks stay warmer than the water
  T = mix(T, 0.05 + 0.02*n2, water);
  // Merauke town: warm street grid near the river mouth
  vec2 tp = p - vec2(-2.7, -5.6);
  float town = 1.0 - smoothstep(0.9, 1.6, length(tp*vec2(1.0,1.3)));
  vec2 g = abs(fract(tp*3.2)-0.5);
  float streets = 1.0 - smoothstep(0.03, 0.09, min(g.x, g.y));
  T = mix(T, 0.40 + 0.18*streets + 0.08*hash21(floor(tp*3.2)), town*0.85);

  // fire fronts: long lines, scar behind (s<0), front band at s≈0
  float scar = 0.0, front = 0.0, charTex = 0.5;
  for(int i=0;i<6;i++){
    float fi = float(i);
    vec2 o = vec2(1.0 + mod(fi*3.7, 9.0), -1.5 - fi*3.6);
    float ang = 0.45 + fi*0.27;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec2 nrm = vec2(-dir.y, dir.x);
    vec2 q = p - o;
    float along = dot(q, dir);
    float len = 6.5 + fi*1.6;
    float alongMask = 1.0 - smoothstep(len*0.7, len, abs(along));
    float s = dot(q, nrm) + (fbm(vec2(along*0.35, fi*7.0))-0.5)*2.2 + sin(along*0.9+fi)*0.35;
    float width = 0.10 + 0.07*vnoise(vec2(along*2.0+time*1.5, fi));
    float band = (1.0 - smoothstep(width*0.4, width, abs(s))) * alongMask;
    float behind = (1.0 - smoothstep(-0.3, 0.0, s)) * (1.0 - smoothstep(0.6, 2.4 + fi*0.5, -s)) * alongMask;
    front = max(front, band);
    float sc0 = behind * (0.6 + 0.4*fbm(p*1.7+fi));
    if(sc0 > scar){ charTex = fbm(vec2(along*0.45, s*3.2) + fi*3.0); }
    scar = max(scar, sc0);
  }
  scar *= 1.0 - water; front *= 1.0 - water;
  // burn scar: streaky char parallel to the front, darker ash ridges, warm embers between
  float ash = smoothstep(0.42, 0.62, charTex);
  float scarT = 0.30 + 0.24*ash + 0.06*(n2-0.5);
  T = mix(T, scarT, scar*0.9);
  // smoldering pockets in the scar
  float pocket = smoothstep(0.70, 0.86, fbm(p*2.6+vec2(time*0.05,0.0))) * scar;
  T = max(T, mix(T, 0.80, pocket));
  float flick = 0.85 + 0.15*vnoise(p*6.0 + vec2(time*4.0, 0.0));
  T = max(T, mix(T, 0.97*flick + 0.03, front));
  hot = max(hot, front);

  // hotspots: thousands of small points at two scales, denser near fronts/scars
  for(int k=0;k<2;k++){
    float sc = k==0 ? 2.2 : 4.6;
    vec2 cp = p*sc;
    vec2 cell = floor(cp);
    float r = hash21(cell + float(k)*31.0);
    vec2 c = vec2(hash21(cell+7.3), hash21(cell+1.9))*0.7+0.15;
    float density = (k==0 ? 0.86 : 0.91) - 0.18*scar - 0.10*smoothstep(0.55,0.75,n);
    float on = step(density, r) * (1.0 - water);
    float d = length(fract(cp)-c);
    float rad = (k==0 ? 0.11 : 0.15) * (0.6 + 0.6*hash21(cell+3.3));
    float core = (1.0 - smoothstep(rad*0.35, rad, d)) * on;
    float halo = (1.0 - smoothstep(rad, rad*2.6, d)) * on;
    float tw = 0.85 + 0.15*sin(time*6.0 + r*40.0);
    T = max(T, mix(T, 0.62, halo*0.55));
    T = max(T, mix(T, 0.97*tw + 0.03, core));
    hot = max(hot, core);
  }
  // sea: cold, flat, faint swell texture
  float seaT = 0.06 + 0.025*fbm(p*vec2(0.4,1.6) + vec2(time*0.03,0.0));
  T = mix(T, seaT, sea);
  hot *= (1.0 - sea);
  return T;
}
`;

const terrainVert = /* glsl */ `
${GLSL_COMMON}
uniform float uTime;
varying vec2 vP; varying float vDepth; varying vec3 vN;
void main(){
  vec3 pos = position;
  vec2 p = pos.xz;
  pos.y = hgt(p);
  float e = 0.08;
  vec3 dx = vec3(e, hgt(p+vec2(e,0.0))-pos.y, 0.0);
  vec3 dz = vec3(0.0, hgt(p+vec2(0.0,e))-pos.y, e);
  vN = normalize(cross(dz, dx));
  vP = p;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const terrainFrag = /* glsl */ `
${GLSL_COMMON}
${TERRAIN_FRAG_HEAT}
uniform float uTime;
varying vec2 vP; varying float vDepth; varying vec3 vN;
void main(){
  float hot;
  float T = heat(vP, uTime, hot);
  // per-pixel relief: macro height + fine grass/tussock grain, exaggerated for read
  float e = 0.03;
  float h0 = hgt(vP) + 0.035*fbm(vP*5.0);
  float hx = hgt(vP+vec2(e,0.0)) + 0.035*fbm((vP+vec2(e,0.0))*5.0);
  float hz = hgt(vP+vec2(0.0,e)) + 0.035*fbm((vP+vec2(0.0,e))*5.0);
  vec3 N = normalize(vec3(-(hx-h0)/e*2.5, 1.0, -(hz-h0)/e*2.5));
  float lam = clamp(dot(N, normalize(vec3(-0.6,0.55,-0.35))), 0.0, 1.0);
  float shade = 0.55 + 0.75*lam;
  vec3 col = ironbow(T) * mix(shade, 1.0, hot);
  col *= 1.0 + hot*1.8;              // white-hot cores go above 1 for bloom
  // atmospheric smoke haze with distance (warm violet)
  float haze = smoothstep(14.0, 42.0, vDepth);
  col = mix(col, vec3(0.20,0.05,0.32), haze*0.6);
  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
}`;

const plumeVert = /* glsl */ `
varying vec2 vUv; varying float vWY;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vWY = w.y; gl_Position = projectionMatrix * viewMatrix * w; }`;
const plumeFrag = /* glsl */ `
${GLSL_COMMON}
uniform float uTime; uniform float uSeed; uniform float uWarm; uniform float uAlpha;
varying vec2 vUv; varying float vWY;
void main(){
  vec2 c = vUv - 0.5;
  float r = length(c)*2.0;
  float n = fbm(c*3.2 + uSeed + vec2(-uTime*0.12, uTime*0.18));
  float n2 = fbm(c*7.0 + uSeed*1.7 + vec2(uTime*0.2, 0.0));
  float d = r + (n-0.5)*0.75 + (n2-0.5)*0.25;
  float a = 1.0 - smoothstep(0.25, 0.95, d);
  a *= 1.0 - smoothstep(0.80, 1.0, r);            // always zero at the quad edge
  a *= smoothstep(0.0, 0.7, vWY);                 // soft fade where smoke meets ground
  a *= 0.55 + 0.6*n;
  float core = 1.0 - smoothstep(0.0, 0.7, d);
  float T = uWarm + 0.10*core + 0.08*(n2-0.5);
  vec3 col = ironbow(T);
  gl_FragColor = vec4(pow(col, vec3(2.2)), clamp(a*uAlpha, 0.0, 1.0));
}`;

const Terrain: React.FC<{ time: number }> = ({ time }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 70, 360, 420);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -20);
    return g;
  }, []);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: terrainVert, fragmentShader: terrainFrag, uniforms: { uTime: { value: 0 } } }),
    [],
  );
  mat.uniforms.uTime.value = time;
  return <mesh geometry={geo} material={mat} />;
};

// Plume anchors on the fire fronts (same origin/direction formula as the shader).
const ANCHORS: { x: number; z: number; h: number; seed: number }[] = [];
for (let i = 0; i < 6; i++) {
  const ox = 1.0 + ((i * 3.7) % 9.0), oz = -1.5 - i * 3.6, ang = 0.45 + i * 0.27;
  for (const [k, along] of [-2.6, 1.8].entries()) {
    ANCHORS.push({ x: ox + Math.cos(ang) * along, z: oz + Math.sin(ang) * along, h: 3.2 + ((i * 7 + k * 3) % 5) * 0.7, seed: i * 3.1 + k * 1.7 });
  }
}
const PUFFS_PER = 7;

// Layered soft smoke: each plume is a column of camera-facing puffs that grow, cool and drift
// north-west (screen left) as they rise. Sorted back-to-front, FX layer, no depth write.
const Plumes: React.FC<{ time: number; camPos: THREE.Vector3; camQuat: THREE.Quaternion }> = ({ time, camPos, camQuat }) => {
  const puffs = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    const list: { pos: THREE.Vector3; size: number; mat: THREE.ShaderMaterial }[] = [];
    ANCHORS.forEach((a) => {
      for (let j = 0; j < PUFFS_PER; j++) {
        const t = j / (PUFFS_PER - 1);
        const y = 0.25 + t * a.h;
        const pos = new THREE.Vector3(a.x - t * t * a.h * 0.6, y, a.z - t * a.h * 0.15);
        const size = 0.55 + t * 2.3 + (a.h - 3.2) * 0.15;
        const mat = new THREE.ShaderMaterial({
          vertexShader: plumeVert,
          fragmentShader: plumeFrag,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
            uSeed: { value: a.seed + j * 0.73 },
            uWarm: { value: 0.70 - t * 0.30 },
            uAlpha: { value: 0.55 - t * 0.30 },
          },
        });
        list.push({ pos, size, mat });
      }
    });
    return { geo, list };
  }, []);
  const ordered = [...puffs.list].sort((a, b) => b.pos.distanceTo(camPos) - a.pos.distanceTo(camPos));
  return (
    <group>
      {ordered.map((pf, i) => {
        pf.mat.uniforms.uTime.value = time;
        return (
          <mesh
            key={i}
            geometry={puffs.geo}
            material={pf.mat}
            position={pf.pos.toArray()}
            quaternion={camQuat}
            scale={[pf.size, pf.size * 1.15, 1]}
            renderOrder={10 + i}
            onUpdate={(m) => m.layers.set(FX_LAYER)}
          />
        );
      })}
    </group>
  );
};

// Reticle ring on the ground over Merauke town (HUD cyan)
const TownMarker: React.FC<{ f: number }> = ({ f }) => {
  const pulse = 1 + 0.06 * Math.sin(f * 0.12);
  return (
    <group position={MERAUKE.toArray()} rotation={[-Math.PI / 2, 0, 0]} scale={pulse}>
      <mesh onUpdate={(m) => m.layers.set(FX_LAYER)} renderOrder={30}>
        <ringGeometry args={[1.25, 1.33, 96]} />
        <meshBasicMaterial color={P.hudCyan} transparent opacity={0.9} depthTest={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const CamSetup: React.FC<{ pos: THREE.Vector3; target: THREE.Vector3 }> = ({ pos, target }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(pos);
    cam.lookAt(target);
    cam.fov = FOV;
    cam.near = 0.1;
    cam.far = 300;
    cam.updateProjectionMatrix();
    cam.layers.enable(FX_LAYER);
    scene.environmentIntensity = 0.55;
  }, [camera, scene, pos, target]);
  return null;
};

const project = (v: THREE.Vector3, pos: THREE.Vector3, target: THREE.Vector3, w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 300);
  c.position.copy(pos);
  c.lookAt(target);
  c.updateMatrixWorld();
  const p = v.clone().project(c);
  return { x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h };
};

const Corner: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 54, height: 54, borderTop: `4px solid ${P.hudCyan}`, borderLeft: `4px solid ${P.hudCyan}`, transform: `rotate(${rot}deg)`, opacity: 0.85 }} />
);

const Overlay: React.FC<{ f: number; town: { x: number; y: number }; sea: { x: number; y: number } }> = ({ f, town, sea }) => {
  const blink = Math.floor(f / 20) % 2 === 0 ? 1 : 0.35;
  const textShadow = "0 2px 18px rgba(5,2,14,0.9), 0 0 4px rgba(5,2,14,0.9)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* top shade so the headline reads over the haze */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,3,18,0.78) 0%, rgba(8,3,18,0.35) 30%, rgba(8,3,18,0) 44%, rgba(8,3,18,0) 70%, rgba(8,3,18,0.55) 100%)" }} />
      {/* viewfinder corners */}
      <Corner x={56} y={196} rot={0} />
      <Corner x={970} y={196} rot={90} />
      <Corner x={56} y={1482} rot={-90} />
      <Corner x={970} y={1482} rot={180} />

      {/* sensor strip */}
      <div style={{ position: "absolute", top: 196, left: 128, right: 128, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, color: P.hudCyan, letterSpacing: 2, textShadow }}>
        <span><span style={{ color: "#ff3b3b", opacity: blink }}>●</span> REC · IR LWIR · IRONBOW</span>
        <span style={{ color: P.flirYellow }}>AUDIRA THERMAL</span>
      </div>

      {/* headline */}
      <div style={{ position: "absolute", top: 268, left: 72, right: 72, fontFamily: FONT, color: "#fff", textShadow }}>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: P.hudCyan, marginBottom: 14 }}>AUDIRA · ASAP & ISPA</div>
        <div style={{ fontSize: 112, fontWeight: 600, lineHeight: 0.95, letterSpacing: -2 }}>
          PAPUA SELATAN
          <br />
          DIKEPUNG <span style={{ color: P.flirYellow }}>API</span>
        </div>
      </div>

      {/* Merauke label anchored to the projected town position */}
      <div style={{ position: "absolute", left: town.x - 2, top: town.y - 2, width: 4, height: 118, transform: "translateY(-118px)", background: P.hudCyan, opacity: 0.9 }} />
      <div style={{ position: "absolute", left: town.x - 12, top: town.y - 228, fontFamily: MONO, color: P.hudCyan, textShadow }}>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 4, color: "#fff", background: "rgba(8,3,18,0.62)", border: `2px solid ${P.hudCyan}`, padding: "6px 16px" }}>MERAUKE</div>
        <div style={{ fontSize: 20, marginTop: 6, letterSpacing: 2 }}>PAPUA SELATAN · TRK AUDIRA-02</div>
      </div>

      {/* sea label */}
      <div style={{ position: "absolute", left: Math.max(80, sea.x), top: Math.min(1330, sea.y), fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: "rgba(140,170,255,0.75)", textShadow }}>LAUT ARAFURA</div>

      {/* temperature scale (ironbow) */}
      <div style={{ position: "absolute", right: 74, top: 760, width: 22, height: 520, borderRadius: 4, border: "1px solid rgba(255,255,255,0.5)", background: "linear-gradient(0deg, #03030d 0%, #120854 14%, #4d0d8c 30%, #a8177f 45%, #e6401f 60%, #f78c12 72%, #fcd238 86%, #fffbe0 100%)" }} />
      <div style={{ position: "absolute", right: 106, top: 750, fontFamily: MONO, fontSize: 18, color: "#fff", textAlign: "right", textShadow }}>PANAS</div>
      <div style={{ position: "absolute", right: 106, top: 1262, fontFamily: MONO, fontSize: 18, color: "#b9b4ff", textAlign: "right", textShadow }}>DINGIN</div>
      <div style={{ position: "absolute", right: 64, top: 712, fontFamily: MONO, fontSize: 18, color: P.hudCyan, textShadow, writingMode: "vertical-rl" as const, transform: "rotate(180deg) translateY(-10px)", display: "none" }}>SUHU</div>
      <div style={{ position: "absolute", right: 60, top: 1296, fontFamily: MONO, fontSize: 17, color: P.hudCyan, textShadow, letterSpacing: 1 }}>SUHU PERMUKAAN</div>

      {/* fact chip, above the bottom safe zone (ends before y=1540) */}
      <div style={{ position: "absolute", left: 72, right: 72, top: 1376, fontFamily: MONO, textShadow }}>
        <div style={{ display: "inline-block", background: "rgba(8,3,18,0.78)", borderLeft: `8px solid ${P.flirYellow}`, padding: "16px 24px 14px" }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 54, color: P.flirYellow, letterSpacing: 0, lineHeight: 1 }}>
            6.702 TITIK PANAS
          </div>
          <div style={{ fontSize: 26, color: "#fff", marginTop: 10, letterSpacing: 2 }}>DALAM SATU HARI · 11 OKT 2026</div>
          <div style={{ fontSize: 18, color: "#c9c4e8", marginTop: 6, letterSpacing: 1 }}>Hitungan harian BMKG · titik panas ≠ jumlah kebakaran</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep02Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const time = f / 60;
  const { pos, target } = camPose(time);
  const camQuat = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.copy(pos);
    o.lookAt(target);
    // Object3D.lookAt points +z at the target; cameras look down -z, so flip to face the camera
    o.rotateY(Math.PI);
    return o.quaternion.clone();
  }, [pos.x, pos.y, pos.z, target.x, target.y, target.z]);
  const town = useMemo(() => project(MERAUKE, pos, target, width, height), [pos.x, pos.y, pos.z, width, height]);
  const sea = useMemo(() => project(new THREE.Vector3(-6.2, 0, -1.0), pos, target, width, height), [pos.x, pos.y, pos.z, width, height]);
  return (
    <AbsoluteFill style={{ backgroundColor: P.coldBlack }}>
      <ThreeCanvas width={width} height={height} dpr={1} camera={{ fov: FOV, position: pos.toArray() }}>
        <CamSetup pos={pos} target={target} />
        <color attach="background" args={["#170630"]} />
        <fog attach="fog" args={["#170630", 30, 80]} />
        <Terrain time={time} />
        <Plumes time={time} camPos={pos} camQuat={camQuat} />
        <TownMarker f={f} />
        <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
      </ThreeCanvas>
      <Overlay f={f} town={town} sea={sea} />
    </AbsoluteFill>
  );
};
