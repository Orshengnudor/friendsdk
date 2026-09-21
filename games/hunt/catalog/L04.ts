import type { HuntLevelDef } from "./types";

/** Level 4 — Roof sprint. Edit this file only; other worlds stay untouched. */
export const L04: HuntLevelDef = {
  level: 4,
  name: "Vent Cantilever",
  layout: "twin",
  task: {
    level: 4,
    kind: "dash",
    title: "Roof sprint",
    brief: "Tag the start vent, then reach the antenna before the clock dies.",
    nodeLabels: ["Start vent", "Finish antenna"],
    timerMs: 26000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "dash-start", label: "Start vent", island: 0, corner: "west" },
    { id: "dash-finish", label: "Finish antenna", island: 1, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
