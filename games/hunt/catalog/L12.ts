import type { HuntLevelDef } from "./types";

/** Level 12 — Live dish. Edit this file only; other worlds stay untouched. */
export const L12: HuntLevelDef = {
  level: 12,
  name: "Live Dish Cluster",
  layout: "hexes",
  task: {
    level: 12,
    kind: "pick",
    title: "Live dish",
    brief: "Four dishes across the hexes. One is receiving. Warmth marks the beam.",
    nodeLabels: ["Port dish", "Solar dish", "Spare dish", "Aft dish"],
    timerMs: null,
    failOnWrong: false,
    hint: "hotcold",
    relic: false,
  },
  stations: [
    { id: "vein-0", label: "Port dish", island: 0, corner: "west" },
    { id: "vein-1", label: "Solar dish", island: 1, corner: "east" },
    { id: "vein-2", label: "Spare dish", island: 2, corner: "south" },
    { id: "vein-3", label: "Aft dish", island: 0, corner: "north" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "center" },
};
