import type { HuntLevelDef } from "./types";

/** Level 23 — Island circuit. Edit this file only; other worlds stay untouched. */
export const L23: HuntLevelDef = {
  level: 23,
  name: "Shore Circuit",
  layout: "triple",
  task: {
    level: 23,
    kind: "gather",
    title: "Island circuit",
    brief: "Visit every marked shore post — one on each island.",
    nodeLabels: ["West post", "East post", "South post"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "gather-0", label: "West post", island: 0, corner: "center" },
    { id: "gather-1", label: "East post", island: 1, corner: "center" },
    { id: "gather-2", label: "South post", island: 2, corner: "center" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
