import { defFor } from "./catalog";
import { eraForLevel } from "./levels";
import {
  CAST,
  bossHpFor,
  chaseSpeedFor,
  hideVisionFor,
  lineFor,
  type HuntNpc,
  type NpcRole,
} from "./npcs";
import { cornerOnIsland, connectLandmasses, findWalkable, landmasses, type Point } from "./placement";
import type { GeneratedLevel, WorldInteraction } from "./types";
import { composeWorld, worldRng } from "./worlds";

const BUILD = "catalog-v9";
const levelCache = new Map<string, GeneratedLevel>();

function makeNpc(
  level: number,
  playerId: string,
  index: number,
  role: NpcRole,
  spawn: Point,
  preferId?: string,
): HuntNpc {
  const pid = (() => { try { return BigInt(playerId).toString(); } catch { return playerId; } })();
  const preferred = preferId && preferId !== pid ? CAST.find((row) => row.friendId === preferId) : undefined;
  const pool = CAST.filter((row) => row.friendId !== pid);
  const member = preferred ?? (pool.length ? pool : CAST)[(level + index) % (pool.length || CAST.length)]!;
  const speed = role === "boss" ? 64 + level * 0.45 : role === "patrol" ? 38 + level * 0.9 : chaseSpeedFor(level);
  return {
    id: `npc-${index}`,
    friendId: member.friendId,
    name: member.name,
    role,
    line: lineFor(role, level),
    spawn,
    speed,
    vision: hideVisionFor(level),
    hp: role === "boss" ? bossHpFor(level) : 1,
  };
}

export function generateLevel(level: number, playerId = "0"): GeneratedLevel {
  const key = `${BUILD}:${level}:${playerId}`;
  const cached = levelCache.get(key);
  if (cached) return cached;
  const def = defFor(level);
  const rng = worldRng(level);
  const composed = composeWorld(level, rng, def.layout);
  const originalIslands = landmasses(composed);
  const world = connectLandmasses(composed);
  const islandCount = Math.max(1, originalIslands.length);
  const polyAt = (index: number) => originalIslands[Math.max(0, Math.min(originalIslands.length - 1, index))] ?? originalIslands[0]!;
  const place = (island: number, corner: typeof def.spawn.corner): Point =>
    findWalkable(world, cornerOnIsland(world, polyAt(island), corner), 12);
  const spawn = place(def.spawn.island, def.spawn.corner);
  const stations: WorldInteraction[] = def.stations.map((station) => ({
    id: station.id,
    label: station.label,
    position: place(station.island, station.corner),
    reach: 120,
    labelOffset: 16,
    island: station.island,
  }));
  const npcs = def.npcs.map((npc, index) =>
    makeNpc(level, playerId, index, npc.role, place(npc.island ?? 0, npc.corner ?? "east"), npc.preferId),
  );
  const empty = {
    prepInteraction: null as WorldInteraction | null,
    actionInteraction: null as WorldInteraction | null,
    sequenceNodes: [] as WorldInteraction[],
    veinNodes: [] as WorldInteraction[],
    trueVeinIndex: 0,
  };
  const era = eraForLevel(level);
  const task = def.task;
  let generated: GeneratedLevel;
  if (task.kind === "vendor") {
    const prep = stations.find((item) => item.id === "prep") ?? stations[0]!;
    const action = stations.find((item) => item.id === "action") ?? stations[1] ?? prep;
    generated = { level, era, mechanic: "none", task, world, spawn, islandCount, npcs, ...empty, prepInteraction: prep, actionInteraction: action, interactions: [prep, action] };
  } else if (task.kind === "job") {
    const talk: WorldInteraction = { id: "npc-0", label: `Talk · ${npcs[0]?.name ?? "NPC"}`, position: npcs[0]?.spawn ?? spawn, reach: 110, labelOffset: 16, island: 0 };
    const sequenceNodes = stations;
    generated = { level, era, mechanic: "job", task, world, spawn, islandCount, npcs, ...empty, sequenceNodes, interactions: [talk] };
  } else if (task.kind === "hide") {
    generated = { level, era, mechanic: "hide", task, world, spawn, islandCount, npcs, ...empty, interactions: [] };
  } else if (task.kind === "chase") {
    generated = { level, era, mechanic: "chase", task, world, spawn, islandCount, npcs, ...empty, interactions: [] };
  } else if (task.kind === "fight") {
    generated = { level, era, mechanic: "fight", task, world, spawn, islandCount, npcs, ...empty, interactions: [] };
  } else if (task.kind === "sequence" || task.kind === "gather") {
    const sequenceNodes = stations;
    generated = {
      level, era,
      mechanic: task.kind === "gather" ? "gather" : task.failOnWrong ? "sequence" : "escort",
      task, world, spawn, islandCount, npcs, ...empty, sequenceNodes, interactions: sequenceNodes,
    };
  } else if (task.kind === "pick") {
    const veinNodes = stations;
    generated = {
      level, era, mechanic: task.hint === "nobite" ? "cast" : "vein",
      task, world, spawn, islandCount, npcs, ...empty, veinNodes,
      trueVeinIndex: Math.floor(worldRng(level + 99)() * Math.max(1, veinNodes.length)),
      interactions: veinNodes,
    };
  } else if (task.kind === "dash") {
    const sequenceNodes = stations;
    generated = { level, era, mechanic: "dash", task, world, spawn, islandCount, npcs, ...empty, sequenceNodes, interactions: sequenceNodes };
  } else {
    const sequenceNodes = stations;
    generated = { level, era, mechanic: "arm", task, world, spawn, islandCount, npcs, ...empty, sequenceNodes, interactions: sequenceNodes };
  }
  levelCache.set(key, generated);
  return generated;
}

export function peekWorldName(level: number): string {
  return defFor(level).name;
}
