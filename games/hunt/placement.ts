import { isWorldWalkable, validateWorld, type WorldConfig, type WorldProp } from "@rarefriends/friendsdk/world";

export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Point = readonly [number, number];

export function clampPoint(point: Point): Point {
  return [Math.max(8, Math.min(568, Math.round(point[0]))), Math.max(8, Math.min(376, Math.round(point[1])))];
}

/** Radial land cut. Optional radiusMod sculpts crescents, petals, fjords. */
export function radialPolygon(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  rng: () => number,
  jitter = 0.14,
  radiusMod?: (angle: number) => number,
): Point[] {
  const polygon: Point[] = [];
  const n = Math.max(6, Math.min(16, count));
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    let w = 1 - jitter / 2 + rng() * jitter;
    if (radiusMod) w *= radiusMod(angle);
    polygon.push(clampPoint([cx + Math.cos(angle) * rx * w, cy + Math.sin(angle) * ry * w]));
  }
  return polygon;
}

export function generateIslandPolygon(rng: () => number, large = false): Point[] {
  const cx = 288 + (rng() - 0.5) * 50;
  const cy = 192 + (rng() - 0.5) * 32;
  return radialPolygon(cx, cy, large ? 250 : 210, large ? 160 : 130, 10 + Math.floor(rng() * 4), rng, 0.16);
}

/** Open C-shape — a single simple polygon, not a hole. */
export function crescentPolygon(cx: number, cy: number, rx: number, ry: number, rng: () => number): Point[] {
  const steps = 12;
  const start = 0.42 * Math.PI;
  const span = 1.55 * Math.PI;
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = start + (i / steps) * span;
    const w = 0.94 + rng() * 0.08;
    pts.push(clampPoint([cx + Math.cos(angle) * rx * w, cy + Math.sin(angle) * ry * w]));
  }
  for (let i = steps; i >= 0; i--) {
    const angle = start + (i / steps) * span;
    const w = 0.52 + rng() * 0.05;
    pts.push(clampPoint([cx + Math.cos(angle) * rx * w, cy + Math.sin(angle) * ry * w]));
  }
  return pts;
}

export function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function polygonArea(polygon: readonly Point[]): number {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]!;
    const b = polygon[(i + 1) % polygon.length]!;
    area += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(area) / 2;
}

export function centroid(polygon: readonly Point[]): Point {
  let x = 0;
  let y = 0;
  for (const p of polygon) {
    x += p[0];
    y += p[1];
  }
  const n = Math.max(1, polygon.length);
  return [x / n, y / n];
}

export function landmasses(world: WorldConfig, minArea = 600): Point[][] {
  return world.geometry.polygons.filter((poly) => polygonArea(poly as Point[]) >= minArea).map((poly) => poly as Point[]);
}

function bridgeQuad(a: Point, b: Point, width: number): Point[] | null {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 28) return null;
  const nx = (-dy / len) * (width / 2);
  const ny = (dx / len) * (width / 2);
  const quad = [
    clampPoint([a[0] + nx, a[1] + ny]),
    clampPoint([a[0] - nx, a[1] - ny]),
    clampPoint([b[0] - nx, b[1] - ny]),
    clampPoint([b[0] + nx, b[1] + ny]),
  ];
  if (polygonArea(quad) < 80) return null;
  return quad;
}

export function connectLandmasses(world: WorldConfig): WorldConfig {
  const islands = landmasses(world);
  if (islands.length < 2) return world;
  const cents = islands.map(centroid);
  const edges: Array<[number, number, number]> = [];
  for (let i = 0; i < cents.length; i++) {
    for (let j = i + 1; j < cents.length; j++) {
      edges.push([i, j, Math.hypot(cents[i]![0] - cents[j]![0], cents[i]![1] - cents[j]![1])]);
    }
  }
  edges.sort((a, b) => a[2] - b[2]);
  const parent = cents.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x]!)));
  const extraPolys: Point[][] = [];
  const extraProps: WorldProp[] = [];
  const extraPaths: WorldConfig["paths"][number][] = [];
  for (const [i, j] of edges) {
    const a = find(i);
    const b = find(j);
    if (a === b) continue;
    parent[a] = b;
    const quad = bridgeQuad(cents[i]!, cents[j]!, 44);
    if (!quad) continue;
    extraPolys.push(quad);
    extraPaths.push({ points: [cents[i]!, cents[j]!], width: 18 });
    const mid: Point = [Math.round((cents[i]![0] + cents[j]![0]) / 2), Math.round((cents[i]![1] + cents[j]![1]) / 2)];
    if (pointInPolygon(mid, quad)) extraProps.push({ type: "bridge", x: mid[0], y: mid[1], scale: 0.8, footprint: null });
  }
  if (!extraPolys.length) return world;
  try {
    return validateWorld({
      ...world,
      geometry: { ...world.geometry, polygons: [...world.geometry.polygons, ...extraPolys] },
      paths: [...world.paths, ...extraPaths],
      props: [...world.props, ...extraProps],
    });
  } catch {
    try {
      return validateWorld({
        ...world,
        geometry: { ...world.geometry, polygons: [...world.geometry.polygons, ...extraPolys] },
        paths: [...world.paths, ...extraPaths],
      });
    } catch {
      return world;
    }
  }
}

function placeInBounds(
  world: WorldConfig,
  bounds: readonly Point[],
  count: number,
  rng: () => number,
  minSeparation: number,
  maxAttempts: number,
  constrainToPolygon?: readonly Point[],
): Point[] | null {
  const minX = Math.min(...bounds.map((p) => p[0]));
  const maxX = Math.max(...bounds.map((p) => p[0]));
  const minY = Math.min(...bounds.map((p) => p[1]));
  const maxY = Math.max(...bounds.map((p) => p[1]));
  const placed: Point[] = [];
  let attempts = 0;
  while (placed.length < count && attempts < maxAttempts) {
    attempts++;
    const x = minX + rng() * (maxX - minX);
    const y = minY + rng() * (maxY - minY);
    const point: Point = [x, y];
    if (constrainToPolygon && !pointInPolygon(point, constrainToPolygon)) continue;
    if (!isWorldWalkable(world, [x, y], constrainToPolygon ? 16 : 18)) continue;
    if (constrainToPolygon) {
      const c = centroid(constrainToPolygon);
      const inlandX = x * 0.62 + c[0] * 0.38;
      const inlandY = y * 0.62 + c[1] * 0.38;
      if (!isWorldWalkable(world, [inlandX, inlandY], 12) || !pointInPolygon([inlandX, inlandY], constrainToPolygon)) continue;
      const point: Point = [Math.round(inlandX), Math.round(inlandY)];
      if (placed.some((p) => Math.hypot(p[0] - point[0], p[1] - point[1]) < minSeparation)) continue;
      placed.push(point);
      continue;
    }
    if (placed.some((p) => Math.hypot(p[0] - x, p[1] - y) < minSeparation)) continue;
    placed.push([Math.round(x), Math.round(y)]);
  }
  return placed.length === count ? placed : null;
}

export function placeAnywhere(world: WorldConfig, count: number, rng: () => number): Point[] {
  const allPoints = world.geometry.polygons.flat() as Point[];
  for (const sep of [70, 55, 40, 28, 20]) {
    const points = placeInBounds(world, allPoints, count, rng, sep, 600);
    if (points) return points;
  }
  return [[288, 192]];
}

export function placeOnIsland(world: WorldConfig, polygon: readonly Point[], count: number, rng: () => number): Point[] {
  for (const sep of [220, 180, 140, 100, 70, 50, 30, 15]) {
    const points = placeInBounds(world, polygon, count, rng, sep, 1000, polygon);
    if (points) return points;
  }
  return count > 1 ? placeOnIsland(world, polygon, count - 1, rng) : [[polygon[0]![0], polygon[0]![1]]];
}

export function placeAcrossIslands(
  world: WorldConfig,
  islands: readonly (readonly Point[])[],
  count: number,
  rng: () => number,
  spreadEnds = false,
): Point[] {
  const masses = islands.length ? islands : landmasses(world);
  const n = Math.max(1, masses.length);
  if (n === 1) return placeOnIsland(world, masses[0]!, count, rng);
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    let islandIndex = i % n;
    if (spreadEnds && count === 2 && n >= 2) islandIndex = i === 0 ? 0 : n - 1;
    const poly = masses[islandIndex]!;
    let found: Point | null = null;
    for (let tries = 0; tries < 10 && !found; tries++) {
      const [candidate] = placeOnIsland(world, poly, 1, rng);
      if (!candidate) continue;
      if (points.some((p) => Math.hypot(p[0] - candidate[0], p[1] - candidate[1]) < 18)) continue;
      found = candidate;
    }
    points.push(found ?? placeOnIsland(world, poly, 1, rng)[0]!);
  }
  return points;
}

export function findWalkable(world: WorldConfig, near: Point, radius = 7): Point {
  if (isWorldWalkable(world, near, radius)) return [Math.round(near[0]), Math.round(near[1])];
  for (let r = 8; r <= 140; r += 8) {
    for (let angle = 0; angle < 360; angle += 15) {
      const rad = (angle * Math.PI) / 180;
      const point: Point = [near[0] + Math.cos(rad) * r, near[1] + Math.sin(rad) * r];
      if (isWorldWalkable(world, point, radius)) return [Math.round(point[0]), Math.round(point[1])];
    }
  }
  const fallback = placeAnywhere(world, 1, mulberry32(1))[0]!;
  return isWorldWalkable(world, fallback, radius) ? fallback : [288, 192];
}

/** Pull a point toward the island centre so stations sit on land, not the waterline. */
export function inlandPoint(world: WorldConfig, polygon: readonly Point[], seed: Point): Point {
  const c = centroid(polygon);
  const mixed: Point = [seed[0] * 0.84 + c[0] * 0.16, seed[1] * 0.84 + c[1] * 0.16];
  const point = findWalkable(world, mixed, 12);
  if (isWorldWalkable(world, point, 12) && pointInPolygon(point, polygon)) return point;
  return findWalkable(world, c, 12);
}

export type Corner = "west" | "east" | "north" | "south" | "center" | "nw" | "ne" | "sw" | "se";

const CORNER_SCORE: Record<Corner, (p: Point, c: Point) => number> = {
  west: (p) => -p[0],
  east: (p) => p[0],
  north: (p) => -p[1],
  south: (p) => p[1],
  nw: (p) => -p[0] - p[1],
  ne: (p) => p[0] - p[1],
  sw: (p) => -p[0] + p[1],
  se: (p) => p[0] + p[1],
  center: (p, c) => -Math.hypot(p[0] - c[0], p[1] - c[1]),
};

/** Walkable point on this island toward a named corner — cards sit on land, spread apart. */
export function cornerOnIsland(world: WorldConfig, polygon: readonly Point[], corner: Corner): Point {
  const c = centroid(polygon);
  const score = CORNER_SCORE[corner];
  const minX = Math.min(...polygon.map((p) => p[0]));
  const maxX = Math.max(...polygon.map((p) => p[0]));
  const minY = Math.min(...polygon.map((p) => p[1]));
  const maxY = Math.max(...polygon.map((p) => p[1]));
  let best: Point = c;
  let bestScore = -Infinity;
  for (let gx = 0; gx < 18; gx++) {
    for (let gy = 0; gy < 14; gy++) {
      const point: Point = [
        minX + ((gx + 0.5) / 18) * (maxX - minX),
        minY + ((gy + 0.5) / 14) * (maxY - minY),
      ];
      if (!pointInPolygon(point, polygon)) continue;
      if (!isWorldWalkable(world, point, 12)) continue;
      const value = score(point, c);
      if (value > bestScore) {
        bestScore = value;
        best = point;
      }
    }
  }
  return inlandPoint(world, polygon, best);
}

export function randomWalkable(world: WorldConfig, rng: () => number = Math.random): Point {
  for (let i = 0; i < 80; i++) {
    const x = 40 + rng() * 496;
    const y = 36 + rng() * 312;
    if (isWorldWalkable(world, [x, y], 10)) return [Math.round(x), Math.round(y)];
  }
  return findWalkable(world, [288, 192], 10);
}
