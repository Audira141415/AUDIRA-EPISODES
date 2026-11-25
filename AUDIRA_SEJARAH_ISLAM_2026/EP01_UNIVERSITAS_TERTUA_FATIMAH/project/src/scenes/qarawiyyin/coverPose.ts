// The cover's camera framing (no timeline import, so scripts/cover-still.mjs --framing can load it
// in plain node): npm run cover -- QarawiyyinCover --framing=src/scenes/qarawiyyin/coverPose.ts:COVER
import { framingFrom, type Framing } from "../../core/camera/moves.ts";

export const COVER: Framing = framingFrom([0, 8.4, 9.6], [0, 0.4, -1.9], 46);
