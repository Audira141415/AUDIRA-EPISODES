// INFLATABLE geometry: puffy shapes from 2D outlines (an extrude whose bevel is most of the body, so
// the edge rounds like a seamed vinyl toy), and balloon letters as fat tubes with round end caps.

import * as THREE from "three";

/** Extrude an outline into a pillow: thin core, deep round bevel. Centred, z from -t to t. */
export function puffy(shape: THREE.Shape, size: number, puff = 0.32): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: size * 0.04,
    bevelEnabled: true,
    bevelThickness: size * puff,
    bevelSize: size * puff * 0.55,
    bevelSegments: 12,
    curveSegments: 48,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

/**
 * A truly inflated star: a sphere pushed out into five round lobes and flattened, so the points are
 * pillowy and the faces curve like a filled foil balloon (an extruded star bevels into flat facets).
 */
export function puffyStar(R: number, thickness = 0.42, points = 5): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, 160, 80);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const az = Math.atan2(y, x) - Math.PI / 2;
    const lobe = Math.pow(0.5 + 0.5 * Math.cos(points * az), 1.7);
    const rad = R * (0.56 + 0.44 * lobe);
    p.setXYZ(i, x * rad, y * rad, z * R * thickness * (0.75 + 0.25 * (1 - lobe)));
  }
  g.computeVertexNormals();
  return g;
}

export function starShape(r: number, inner = 0.52, points = 5): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i <= points * 2; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / points;
    const rr = i % 2 ? r * inner : r;
    // round the tips a little: points pulled in
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return s;
}

export function heartShape(r: number): THREE.Shape {
  const s = new THREE.Shape();
  const k = r / 1.0;
  s.moveTo(0, -0.95 * k);
  s.bezierCurveTo(-0.3 * k, -0.6 * k, -1.05 * k, -0.2 * k, -1.0 * k, 0.32 * k);
  s.bezierCurveTo(-0.95 * k, 0.85 * k, -0.25 * k, 1.0 * k, 0, 0.55 * k);
  s.bezierCurveTo(0.25 * k, 1.0 * k, 0.95 * k, 0.85 * k, 1.0 * k, 0.32 * k);
  s.bezierCurveTo(1.05 * k, -0.2 * k, 0.3 * k, -0.6 * k, 0, -0.95 * k);
  return s;
}

export function cloudShape(r: number): THREE.Shape {
  const s = new THREE.Shape();
  const n = 160;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const lobes = 1 + 0.16 * Math.pow(Math.abs(Math.sin(2.5 * a + 0.3)), 0.6);
    const x = Math.cos(a) * r * 1.35 * lobes, y = Math.sin(a) * r * 0.8 * lobes * (Math.sin(a) < 0 ? 0.7 : 1);
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return s;
}

type Path = [number, number][];
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 16): Path =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number];
  });

/** Letter strokes in a 1.4-tall box (baseline y = 0). Width is the advance without the tube. */
export const GLYPHS: Record<string, { w: number; strokes: Path[] }> = {
  A: { w: 0.9, strokes: [[[0, 0], [0.45, 1.4], [0.9, 0]], [[0.2, 0.55], [0.7, 0.55]]] },
  U: { w: 0.9, strokes: [[[0, 1.4], [0, 0.45], ...arc(0.45, 0.45, 0.45, Math.PI, 2 * Math.PI).slice(1), [0.9, 1.4]]] },
  D: { w: 0.95, strokes: [[[0, 0], [0, 1.4], [0.25, 1.4], ...arc(0.25, 0.7, 0.7, Math.PI / 2, -Math.PI / 2, 20).slice(1), [0, 0]]] },
  I: { w: 0, strokes: [[[0, 0], [0, 1.4]]] },
  R: { w: 0.8, strokes: [[[0, 0], [0, 1.4], [0.35, 1.4], ...arc(0.35, 1.05, 0.35, Math.PI / 2, -Math.PI / 2).slice(1), [0, 0.7]], [[0.28, 0.7], [0.8, 0]]] },
};

/** One merged geometry per letter: a tube per stroke plus spheres at the stroke ends and corners. */
export function balloonLetter(ch: string, scale: number, radius: number): { geo: THREE.BufferGeometry[]; w: number } {
  const gl = GLYPHS[ch];
  const geo: THREE.BufferGeometry[] = [];
  for (const st of gl.strokes) {
    const pts = st.map(([x, y]) => new THREE.Vector3((x - gl.w / 2) * scale, y * scale, 0));
    // corners stay round: a polyline curve with a sphere at every vertex
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < pts.length; i++) path.add(new THREE.LineCurve3(pts[i - 1], pts[i]));
    geo.push(new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, Math.max(8, pts.length * 6), radius, 28, false));
    // caps at both ends and at every sharp corner (turn > 30°), so no tube end is ever open
    const sharp = pts.filter((p, i) => {
      if (i === 0 || i === pts.length - 1) return true;
      const a = p.clone().sub(pts[i - 1]).normalize(), b = pts[i + 1].clone().sub(p).normalize();
      return a.dot(b) < Math.cos(Math.PI / 6);
    });
    const caps = sharp;
    for (const p of caps) {
      const sph = new THREE.SphereGeometry(radius, 28, 20);
      sph.translate(p.x, p.y, p.z);
      geo.push(sph);
    }
  }
  return { geo, w: gl.w * scale + radius * 2 };
}
