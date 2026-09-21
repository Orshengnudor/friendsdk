import { getWorldPreset, validateWorld, type WorldConfig, type WorldPropType } from "@rarefriends/friendsdk/world";
import type { GameWorldInteraction } from "@rarefriends/friendsdk/world-view";
import { nearestWalkableAnchor, placeAnywhere, placeOnIsland, type Point } from "../placement";
import { mechanicForLevel, type Mechanic } from "../levels";
import type { GeneratedLevel } from "../types";

export const PRESET_BY_SHAPE = [
  "01-garden-oval-complete",
  "02-circuit-courtyard-complete",
  "03-crystal-mesa-complete",
  "04-rooftop-terrace-complete",
  "05-tidal-islands-complete",
  "06-orbital-hex-complete",
] as const;

export function playablePolygon(world: WorldConfig): Point[] {
  let best = world.geometry.polygons[0] as Point[];
  let bestArea = 0;
  for (const poly of world.geometry.polygons) {
    let area = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    if (Math.abs(area) > bestArea) {
      bestArea = Math.abs(area);
      best = poly as Point[];
    }
  }
  return best;
}

export function cloneFamilyWorld(presetId: string, level: number, name: string, summary: string, extraProps: WorldConfig["props"] = []): WorldConfig {
  const base = getWorldPreset(presetId);
  return validateWorld({
    ...base,
    id: `hunt-l${level}-${base.family}`,
    name,
    summary,
    actors: [],
    props: [...base.props, ...extraProps],
  });
}

export function stationsOnIsland(world: WorldConfig, count: number, rng: () => number): Point[] {
  return placeOnIsland(world, playablePolygon(world), count, rng);
}

export function nearProp(world: WorldConfig, type: WorldPropType, fallback: Point): Point {
  const matches = world.props.filter(prop => prop.type === type);
  for (const prop of matches) {
    const anchor = nearestWalkableAnchor(world, [prop.x, prop.y]);
    if (anchor) return anchor;
  }
  return fallback;
}

export function nearPatch(world: WorldConfig, pattern: "water" | "dither" | "dense" | "grid" | "hatch", fallback: Point): Point {
  for (const patch of world.patches) {
    if (patch.pattern !== pattern) continue;
    const anchor = nearestWalkableAnchor(world, [patch.x + patch.w / 2, patch.y + patch.h / 2]);
    if (anchor) return anchor;
  }
  return fallback;
}

export function decorate(world: WorldConfig, types: readonly WorldPropType[], rng: () => number, count = 2): WorldConfig {
  const island = playablePolygon(world);
  const extras = [];
  const spots = placeOnIsland(world, island, count, rng);
  for (let i = 0; i < spots.length; i++) {
    extras.push({ type: types[i % types.length], x: spots[i][0], y: spots[i][1], scale: 0.7 + rng() * 0.35 });
  }
  try {
    return validateWorld({ ...world, props: [...world.props, ...extras], actors: [] });
  } catch {
    return world;
  }
}

export function emptyTaskFields() {
  return {
    prepInteraction: null as GameWorldInteraction | null,
    actionInteraction: null as GameWorldInteraction | null,
    sequenceNodes: [] as GameWorldInteraction[],
    veinNodes: [] as GameWorldInteraction[],
    trueVeinIndex: 0,
  };
}

export function assemble(
  level: number,
  era: number,
  mechanic: Mechanic,
  world: WorldConfig,
  spawn: Point,
  interactions: readonly GameWorldInteraction[],
  extra: Partial<GeneratedLevel> = {},
): GeneratedLevel {
  return {
    level,
    era,
    mechanic,
    world,
    spawn,
    ...emptyTaskFields(),
    interactions,
    ...extra,
  };
}

export function spawnOnWorld(world: WorldConfig, rng: () => number): Point {
  const [point] = stationsOnIsland(world, 1, rng);
  if (point && point[0] + point[1] > 0) return point;
  return placeAnywhere(world, 1, rng)[0];
}

export function shapedMechanic(level: number): Mechanic {
  return mechanicForLevel(level);
}
