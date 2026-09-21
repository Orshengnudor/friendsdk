import type { HuntLevelDef } from "./types";

/** Level 1 — Charm the grove. Edit this file only; other worlds stay untouched. */
export const L01: HuntLevelDef = {
  level: 1,
  name: "Dewcut Commons",
  layout: "continent",
  task: {
    level: 1,
    kind: "vendor",
    title: "Charm the grove",
    brief: "Buy charms — type how many RF — then hunt from the grove.",
    nodeLabels: ["Charm bench", "Hunting grove"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "prep", label: "Charm bench", island: 0, corner: "west" },
    { id: "action", label: "Hunting grove", island: 0, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
