export const LEVEL_COUNT = 30;

export type Mechanic =
  | "none"
  | "sequence"
  | "vein"
  | "dash"
  | "cast"
  | "escort"
  | "gather"
  | "arm"
  | "job"
  | "hide"
  | "chase"
  | "fight";

export const ERA_NAMES = ["Hunter", "Cultivator", "Ruler"] as const;
export type EraName = (typeof ERA_NAMES)[number];

export function eraForLevel(level: number): number {
  return Math.min(2, Math.floor((level - 1) / 10));
}

export function growthForLevel(level: number): number {
  return level <= 1 ? 0 : Math.round(3 * level + 0.06 * level * level);
}

export function levelForGrowth(growth: number): number {
  let level = 1;
  while (level < LEVEL_COUNT && growth >= growthForLevel(level + 1)) level++;
  return level;
}

export const ERA_COPY: readonly { name: EraName; line: string }[] = [
  { name: "Hunter", line: "Charm, walk, talk. NPCs arrive by L7. Every completed job still spends 1 RF." },
  { name: "Cultivator", line: "Hide, chase, ram. The land gets wider. Hold trophies to slow pursuers." },
  { name: "Ruler", line: "Three chasers, fatter bosses, original shelves. Redeem or keep the pack." },
];

export type LookMode = "ink" | "night" | "color";

export const GROWTH_BY_OUTCOME: Record<string, number> = {
  Nothing: 0,
  "Field Mouse": 1,
  "Wild Hare": 2,
  "Timber Wolf": 3,
  "River Pike": 3,
  "Stone Boar": 4,
  "Ancient Wyrm": 8,
};

/** Top of a level so scouting has cover before a drain can drop you. */
export function growthAtLevelTop(level: number): number {
  const n = Math.max(1, Math.min(LEVEL_COUNT, level));
  const lo = growthForLevel(n);
  if (n >= LEVEL_COUNT) return lo + 8;
  return Math.max(lo, growthForLevel(n + 1) - 0.05);
}
