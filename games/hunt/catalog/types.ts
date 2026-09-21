import type { HuntTask } from "../tasks";
import type { NpcRole } from "../npcs";
import type { Layout } from "../worlds";

export type Corner = "west" | "east" | "north" | "south" | "center" | "nw" | "ne" | "sw" | "se";

export interface StationDef {
  id: string;
  label: string;
  island: number;
  corner: Corner;
}

export interface NpcDef {
  role: NpcRole;
  preferId?: string;
  island?: number;
  corner?: Corner;
}

export interface HuntLevelDef {
  level: number;
  name: string;
  layout: Layout;
  task: HuntTask;
  stations: readonly StationDef[];
  npcs: readonly NpcDef[];
  spawn: { island: number; corner: Corner };
}
