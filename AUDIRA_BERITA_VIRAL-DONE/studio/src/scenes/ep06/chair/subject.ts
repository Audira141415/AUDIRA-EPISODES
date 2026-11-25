import type { Subject } from "../../../kits/timeforge/film/subject.ts";
import { ERA_LABEL, ERA_ORDER } from "./eras.ts";
import { SWEEP } from "./evolution.ts";
import { ChairModel } from "./Model.tsx";
import { Backdrop } from "./Backdrop.tsx";
import type { Chair, ChairFx } from "./params.ts";

export const CHAIR: Subject<Chair, ChairFx> = {
  title: "KURSI WAKIL PRESIDEN",
  order: ERA_ORDER,
  labels: ERA_LABEL,
  rail: ["1945", "1956", "1973", "1998", "2001", "2026"],
  sweep: SWEEP,
  halfHeight: (p) => p.seat.hh + p.legs.h,
  footprint: (p) => ({ w: p.seat.hw + p.arm.w, d: p.seat.d / 2 + 0.6 }),
  hover: 0.02,
  Model: ChairModel,
  Extras: Backdrop,
};
