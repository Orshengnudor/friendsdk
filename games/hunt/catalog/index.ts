import { L01 } from "./L01";
import { L02 } from "./L02";
import { L03 } from "./L03";
import { L04 } from "./L04";
import { L05 } from "./L05";
import { L06 } from "./L06";
import { L07 } from "./L07";
import { L08 } from "./L08";
import { L09 } from "./L09";
import { L10 } from "./L10";
import { L11 } from "./L11";
import { L12 } from "./L12";
import { L13 } from "./L13";
import { L14 } from "./L14";
import { L15 } from "./L15";
import { L16 } from "./L16";
import { L17 } from "./L17";
import { L18 } from "./L18";
import { L19 } from "./L19";
import { L20 } from "./L20";
import { L21 } from "./L21";
import { L22 } from "./L22";
import { L23 } from "./L23";
import { L24 } from "./L24";
import { L25 } from "./L25";
import { L26 } from "./L26";
import { L27 } from "./L27";
import { L28 } from "./L28";
import { L29 } from "./L29";
import { L30 } from "./L30";
import type { HuntLevelDef } from "./types";

export const CATALOG: readonly HuntLevelDef[] = [
  L01, L02, L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20, L21, L22, L23, L24, L25, L26, L27, L28, L29, L30,
];

export function defFor(level: number): HuntLevelDef {
  return CATALOG[Math.max(0, Math.min(CATALOG.length, level) - 1)]!;
}

export type { HuntLevelDef, StationDef, NpcDef, Corner } from "./types";
