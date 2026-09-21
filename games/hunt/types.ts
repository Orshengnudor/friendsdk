import type { WorldConfig } from "@rarefriends/friendsdk/world";
import type { Mechanic } from "./levels";
import type { HuntNpc } from "./npcs";
import type { Point } from "./placement";
import type { HuntTask } from "./tasks";

export interface WorldInteraction {
  id: string;
  label: string;
  position: Point;
  reach?: number;
  labelOffset?: number;
  island?: number;
}

export interface GeneratedLevel {
  level: number;
  era: number;
  mechanic: Mechanic;
  task: HuntTask;
  world: WorldConfig;
  spawn: Point;
  islandCount: number;
  npcs: readonly HuntNpc[];
  prepInteraction: WorldInteraction | null;
  actionInteraction: WorldInteraction | null;
  sequenceNodes: readonly WorldInteraction[];
  veinNodes: readonly WorldInteraction[];
  trueVeinIndex: number;
  interactions: readonly WorldInteraction[];
}
