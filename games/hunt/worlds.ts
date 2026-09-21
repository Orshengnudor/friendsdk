/**
 * Hunt maps are original. The six Generations families only donate
 * scenery (prop types, names, palette) — never their official silhouettes.
 */
import {
  getWorldPreset,
  validateWorld,
  type WorldConfig,
  type WorldProp,
  type WorldPropType,
} from "@rarefriends/friendsdk/world";
import {
  crescentPolygon,
  mulberry32,
  pointInPolygon,
  radialPolygon,
  type Point,
} from "./placement";

export const PRESET_IDS = [
  "01-garden-oval-complete",
  "02-circuit-courtyard-complete",
  "03-crystal-mesa-complete",
  "04-rooftop-terrace-complete",
  "05-tidal-islands-complete",
  "06-orbital-hex-complete",
] as const;

const FAMILY_PROPS: readonly (readonly WorldPropType[])[] = [
  ["tree", "flower", "bench", "reeds", "planter"],
  ["terminal", "crate", "pipe", "tank", "circuit"],
  ["crystal", "rock", "crystal", "rock"],
  ["vent", "antenna", "planter", "bench", "tank"],
  ["reeds", "buoy", "rock", "bridge"],
  ["dish", "solar", "antenna", "terminal", "crate"],
];

const FAMILY_PATCH: readonly ("dither" | "dense" | "grid" | "hatch")[] = [
  "dense",
  "grid",
  "hatch",
  "dither",
  "dither",
  "grid",
];

/** One unique name per campaign level. */
const WORLD_NAMES = [
  "Dewcut Commons",
  "Trace Cloister",
  "Quartz Shelf",
  "Vent Cantilever",
  "Three Keys",
  "Hex Array",
  "Feather Isle",
  "Tank Spine",
  "Descending Cut",
  "Four Vents",
  "Tide Run Keys",
  "Live Dish Cluster",
  "Bloom Crescent",
  "Salvage Twin",
  "Vault Mesa",
  "Quiet Planters",
  "Channel Atoll",
  "Deck to Deck",
  "Pollen Ring",
  "Live Wire",
  "Crown Path",
  "Cook Line",
  "Shore Circuit",
  "Talking Masts",
  "Last Grove",
  "Pipe Hymn",
  "Shard Harvest",
  "Banner Rise",
  "Deep Atoll",
  "Vault Escort",
] as const;

export type Layout = "continent" | "twin" | "crescent" | "triple" | "atoll" | "spine" | "petal" | "fjord" | "kidney" | "hexes" | "quad";

const TRIPLE_LEVELS = new Set([5, 6, 12, 17, 23, 29]);
const TWIN_LEVELS = new Set([4, 11, 14, 18, 25, 28]);
const QUAD_LEVELS = new Set([24]);
const WIDE_LEVELS = new Set([8, 10, 16, 20, 26, 27, 30]);

function familyIndex(level: number) {
  return (level - 1) % 6;
}
function otherIndex(level: number) {
  return (level + 2) % 6;
}

function layoutFor(level: number): Layout {
  if (WIDE_LEVELS.has(level)) return "continent";
  if (QUAD_LEVELS.has(level)) return "quad";
  if (TRIPLE_LEVELS.has(level)) return level % 2 === 0 ? "hexes" : "triple";
  if (TWIN_LEVELS.has(level)) return "twin";
  const cycle: Layout[] = ["continent", "crescent", "spine", "atoll", "fjord", "kidney", "continent", "crescent"];
  return cycle[(level - 1) % cycle.length]!;
}

function scatterProps(polygons: readonly (readonly Point[])[], types: readonly WorldPropType[], rng: () => number, count: number): WorldProp[] {
  const props: WorldProp[] = [];
  let attempts = 0;
  while (props.length < count && attempts < 500) {
    attempts++;
    const poly = polygons[props.length % polygons.length]!;
    const minX = Math.min(...poly.map((p) => p[0]));
    const maxX = Math.max(...poly.map((p) => p[0]));
    const minY = Math.min(...poly.map((p) => p[1]));
    const maxY = Math.max(...poly.map((p) => p[1]));
    const x = Math.round(minX + rng() * (maxX - minX));
    const y = Math.round(minY + rng() * (maxY - minY));
    if (x < 16 || y < 16 || x > 560 || y > 368) continue;
    if (!pointInPolygon([x, y], poly)) continue;
    if (props.some((p) => Math.hypot(p.x - x, p.y - y) < 28)) continue;
    props.push({ type: types[props.length % types.length]!, x, y, scale: 0.72 + rng() * 0.45, footprint: null });
  }
  return props;
}

function landPath(poly: readonly Point[], rng: () => number): WorldConfig["paths"] {
  const minX = Math.min(...poly.map((p) => p[0]));
  const maxX = Math.max(...poly.map((p) => p[0]));
  const minY = Math.min(...poly.map((p) => p[1]));
  const maxY = Math.max(...poly.map((p) => p[1]));
  const a: Point = [(minX * 2 + maxX) / 3, (minY + maxY) / 2 + (rng() - 0.5) * 20];
  const b: Point = [(minX + maxX * 2) / 3, (minY + maxY) / 2 + (rng() - 0.5) * 20];
  if (!pointInPolygon(a, poly) || !pointInPolygon(b, poly)) return [];
  return [{ points: [a, b], width: 14 + Math.round(rng() * 8) }];
}

function landPatches(poly: readonly Point[], pattern: "dither" | "dense" | "grid" | "hatch", rng: () => number, count: number) {
  const patches: WorldConfig["patches"][number][] = [];
  const minX = Math.min(...poly.map((p) => p[0]));
  const maxX = Math.max(...poly.map((p) => p[0]));
  const minY = Math.min(...poly.map((p) => p[1]));
  const maxY = Math.max(...poly.map((p) => p[1]));
  let attempts = 0;
  while (patches.length < count && attempts < 80) {
    attempts++;
    const w = 28 + Math.round(rng() * 36);
    const h = 20 + Math.round(rng() * 24);
    const x = Math.round(minX + rng() * Math.max(8, maxX - minX - w));
    const y = Math.round(minY + rng() * Math.max(8, maxY - minY - h));
    if (x < 0 || y < 0 || x + w > 576 || y + h > 384) continue;
    if (!pointInPolygon([x + w / 2, y + h / 2], poly)) continue;
    patches.push({ x, y, w, h, pattern });
  }
  return patches;
}

function isle(cx: number, cy: number, rx: number, ry: number, rng: () => number, n = 8): Point[] {
  return radialPolygon(cx, cy, rx, ry, n, rng, 0.08);
}

function fillSlab(rng: () => number): Point[] {
  const j = () => (rng() - 0.5) * 8;
  return [
    [86 + j(), 16 + j()],
    [490 + j(), 16 + j()],
    [560 + j(), 64 + j()],
    [560 + j(), 320 + j()],
    [490 + j(), 368 + j()],
    [86 + j(), 368 + j()],
    [16 + j(), 320 + j()],
    [16 + j(), 64 + j()],
  ].map(([x, y]) => [Math.max(10, Math.min(566, Math.round(x!))), Math.max(10, Math.min(374, Math.round(y!)))] as Point);
}

function halfSlab(side: "left" | "right", rng: () => number): Point[] {
  const j = () => (rng() - 0.5) * 6;
  if (side === "left") {
    return [
      [18, 36 + j()], [250 + j(), 22 + j()], [268, 70 + j()], [268, 314 + j()],
      [250 + j(), 360 + j()], [18, 348 + j()], [12, 300 + j()], [12, 84 + j()],
    ].map(([x, y]) => [Math.round(x), Math.round(y)] as Point);
  }
  return [
    [308, 22 + j()], [548 + j(), 36 + j()], [564, 84 + j()], [564, 300 + j()],
    [548 + j(), 348 + j()], [308, 360 + j()], [296, 314 + j()], [296, 70 + j()],
  ].map(([x, y]) => [Math.round(x), Math.round(y)] as Point);
}

function polygonsFor(layout: Layout, rng: () => number): { polygons: Point[][]; holes: Point[][]; shape: string } {
  if (layout === "twin") {
    return { polygons: [halfSlab("left", rng), halfSlab("right", rng)], holes: [], shape: "Twin shores" };
  }
  if (layout === "triple") {
    return {
      polygons: [
        isle(150, 118, 148, 112, rng, 9),
        isle(430, 118, 148, 112, rng, 8),
        isle(290, 292, 168, 100, rng, 8),
      ],
      holes: [],
      shape: "Three keys",
    };
  }
  if (layout === "hexes") {
    return {
      polygons: [
        radialPolygon(150, 118, 138, 108, 6, rng, 0.05),
        radialPolygon(430, 118, 138, 108, 6, rng, 0.05),
        radialPolygon(290, 292, 150, 100, 6, rng, 0.05),
      ],
      holes: [],
      shape: "Hex cluster",
    };
  }
  if (layout === "quad") {
    return {
      polygons: [
        isle(140, 110, 128, 96, rng, 8),
        isle(436, 110, 128, 96, rng, 8),
        isle(140, 286, 128, 96, rng, 8),
        isle(436, 286, 128, 96, rng, 8),
      ],
      holes: [],
      shape: "Four shelves",
    };
  }
  if (layout === "crescent") {
    return { polygons: [crescentPolygon(300, 196, 270, 168, rng)], holes: [], shape: "Crescent" };
  }
  if (layout === "spine") {
    return { polygons: [radialPolygon(288, 192, 270, 128, 12, rng, 0.08)], holes: [], shape: "Long spine" };
  }
  if (layout === "fjord") {
    return {
      polygons: [radialPolygon(300, 196, 268, 168, 14, rng, 0.06, (angle) => (Math.cos(angle) < 0 ? 0.78 + 0.16 * Math.sin(angle * 5) : 1))],
      holes: [],
      shape: "Fjord cut",
    };
  }
  if (layout === "kidney") {
    return {
      polygons: [radialPolygon(288, 192, 268, 168, 12, rng, 0.07, (angle) => 0.82 + 0.22 * Math.cos(angle))],
      holes: [],
      shape: "Kidney shelf",
    };
  }
  if (layout === "petal") {
    return {
      polygons: [radialPolygon(288, 192, 260, 168, 16, rng, 0.05, (angle) => 0.7 + 0.32 * Math.abs(Math.cos(2 * angle)))],
      holes: [],
      shape: "Four petals",
    };
  }
  if (layout === "atoll") {
    return { polygons: [fillSlab(rng)], holes: [radialPolygon(288, 192, 70, 44, 8, rng, 0.04)], shape: "Atoll" };
  }
  return { polygons: [fillSlab(rng)], holes: [], shape: "Open continent" };
}

function build(level: number, rng: () => number, layout: Layout): WorldConfig {
  const a = familyIndex(level);
  const b = otherIndex(level);
  const base = getWorldPreset(PRESET_IDS[a]!);
  const donor = getWorldPreset(PRESET_IDS[b]!);
  const { polygons, holes, shape } = polygonsFor(layout, rng);
  const types = [...FAMILY_PROPS[a]!, ...FAMILY_PROPS[b]!];
  const propCount = layout === "continent" ? 8 + (level % 4) : 7 + (level % 4);
  const props = scatterProps(polygons, types, rng, propCount);
  const paths = polygons.flatMap((poly) => landPath(poly, rng));
  const patches = polygons.flatMap((poly) => landPatches(poly, FAMILY_PATCH[a]!, rng, 2));
  return validateWorld({
    id: `hunt-l${level}-${base.family}-${layout}`,
    name: WORLD_NAMES[level - 1] ?? `${base.family} ${level}`,
    family: base.family,
    setting: `${base.setting} · original cut`,
    shape,
    summary: `Original Hunt map. ${base.family} land dressed with ${donor.family} scenery. ${shape}.`,
    variant: "complete",
    geometry: { polygons, holes, depth: 14 + (level % 12) },
    props,
    actors: [],
    paths,
    patches,
    signals: [],
    missingChunks: [],
  });
}

function fallbackContinent(level: number, rng: () => number): WorldConfig {
  const a = familyIndex(level);
  const base = getWorldPreset(PRESET_IDS[a]!);
  const polygon = fillSlab(rng);
  return validateWorld({
    id: `hunt-l${level}-${base.family}-safe`,
    name: WORLD_NAMES[level - 1] ?? base.name,
    family: base.family,
    setting: base.setting,
    shape: "Open continent",
    summary: `Original Hunt map in the ${base.family} family.`,
    variant: "complete",
    geometry: { polygons: [polygon], holes: [], depth: 16 },
    props: scatterProps([polygon], FAMILY_PROPS[a]!, rng, 6),
    actors: [],
    paths: [],
    patches: [],
    signals: [],
    missingChunks: [],
  });
}

export function composeWorld(level: number, rng: () => number, layout = layoutFor(level)): WorldConfig {
  try {
    return build(level, rng, layout);
  } catch {
    try {
      return fallbackContinent(level, rng);
    } catch {
      return officialSafe(level);
    }
  }
}

export function officialSafe(level: number): WorldConfig {
  const base = getWorldPreset(PRESET_IDS[familyIndex(level)]!);
  return validateWorld({
    ...base,
    id: `hunt-l${level}-${base.family}-official`,
    name: WORLD_NAMES[level - 1] ?? base.name,
    actors: [],
    props: base.props.map((prop) => ({ ...prop, footprint: null })),
  });
}

export function worldRng(level: number) {
  return mulberry32(level * 7919 + 13);
}

export function worldNameFor(level: number): string {
  return WORLD_NAMES[Math.max(0, Math.min(29, level - 1))]!;
}
