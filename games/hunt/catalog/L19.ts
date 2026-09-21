import type { HuntLevelDef } from "./types";

/** Level 19 — Pollen circuit. Edit this file only; other worlds stay untouched. */
export const L19: HuntLevelDef = {
  level: 19,
  name: "Pollen Ring",
  layout: "crescent",
  task: {
    level: 19,
    kind: "gather",
    title: "Pollen circuit",
    brief: "Touch every flower marker around the oval.",
    nodeLabels: ["Dawn flower", "Noon flower", "Dusk flower", "Night flower"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "gather-0", label: "Dawn flower", island: 0, corner: "west" },
    { id: "gather-1", label: "Noon flower", island: 0, corner: "north" },
    { id: "gather-2", label: "Dusk flower", island: 0, corner: "east" },
    { id: "gather-3", label: "Night flower", island: 0, corner: "south" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "center" },
};
