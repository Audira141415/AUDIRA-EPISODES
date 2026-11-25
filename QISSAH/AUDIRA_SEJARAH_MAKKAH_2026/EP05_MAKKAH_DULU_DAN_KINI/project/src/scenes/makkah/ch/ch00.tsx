// Hook: 1941 water around the Ka'bah -> today's tower and fast rail -> the bare valley -> the sea.
import React from "react";
import { CH, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef } from "../types.ts";
import { H, K, Rail, TawafRipples } from "./common.tsx";
import { WaterPlane, FlowLine } from "../parts.tsx";
import { SX, routeAt } from "../sets.tsx";

const C = "c00_hook";
const WATER_Y = 0.06; // chest height of an adult at the Ka'bah's scale

const hub = (t: number) => {
  const now = ramp(t, W(C, "Kota"), W(C, "meter") + 0.4);
  const back = ramp(t, W(C, "Tapi"), W(C, "sungai") + 0.3);
  const era = 1 + now - 2 * back;
  return H(Math.max(0, era), 1 - back, now, 1 - now * 0.85 + back * 0.85, now * (1 - back));
};

const World: React.FC<{ t: number }> = ({ t }) => {
  const drain = ramp(t, W(C, "Kota") - 0.5, W(C, "Kota") + 2.5);
  const east: [number, number, number][] = [[-16, 1.4, -1.3], [-11, 0.9, -1.5], [-7, 0.5, -1.2], [-3.5, 0.3, -0.6], [-1.3, 0.1, -0.1]];
  return (
    <>
      {drain < 1 ? <WaterPlane y={WATER_Y - drain * 0.08} size={[9, 9]} t={t} /> : null}
      <TawafRipples t={t} y={WATER_Y} o={1 - ramp(t, W(C, "Kota") - 0.8, W(C, "Kota") + 0.4)} />
      <Rail t={t} reveal={ramp(t, W(C, "kereta"), W(C, "kereta") + 1.5)} train={ramp(t, W(C, "kereta") + 0.2, W(C, "jam", 1) + 1.2)} o={1 - ramp(t, W(C, "Tapi"), W(C, "Tapi") + 1)} />
      <FlowLine pts={east} r={0.04} t={t} reveal={ramp(t, W(C, "Air", 1), W(C, "permaisuri"))} o={window01(t, W(C, "Air", 1), W(C, "kakek") + 1, 0.3, 0.8)} color="#9fd6cc" />
    </>
  );
};

const ship = routeAt(0.435).p;

export const ch00: ChapterDef = {
  id: C,
  card: { num: "", title: "", tag: "" },
  keys: () => [
    K(0, [0.55, 0.48, 1.85], [0, 0.22, 0], 40),
    K(W(C, "anak"), [-0.45, 0.52, 1.85], [0, 0.22, 0], 40),
    K(W(C, "Fotonya"), [-1.8, 0.58, 0.1], [0, 0.22, 0], 40),
    K(W(C, "Kota") + 0.3, [-0.6, 1.6, 5.2], [0.2, 1.4, -1.5], 38),
    K(W(C, "meter"), [0.9, 3.4, 10.5], [0.35, 3.1, -3.1], 38),
    K(W(C, "kereta") + 0.8, [5.5, 3.4, 9], [10, 0.8, -1], 38),
    K(W(C, "Tapi") + 0.5, [1.2, 5.2, 12], [0.3, 0.8, -1.5], 38),
    K(W(C, "Air", 1) + 0.3, [-2.5, 3.4, 8.5], [-4.5, 0.4, -1], 38),
    K(W(C, "kakek") + 0.2, [-1, 9, 14], [-3, 0, -1], 40),
    K(W(C, "laut") - 0.2, [ship[0] + 2.5, 3.6, ship[2] + 6], [ship[0], 0, ship[2]], 38),
    K(CH(C).end + 0.4, [ship[0] - 0.5, 2.4, ship[2] + 3.5], [ship[0] - 1.5, 0, ship[2]], 38),
  ],
  hub,
  World,
  sea: (t) => ({ route: 0.55, ship: 0.42 + 0.03 * ramp(t, W(C, "kakek"), CH(C).end + 2), steam: 0, jawi: 0, khatib: 0, plane: 0, fleet: 0, t }),
};
export const HOOK_SHIP = { at: ship, sx: SX };
