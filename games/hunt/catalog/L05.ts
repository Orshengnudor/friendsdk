import type { HuntLevelDef } from "./types";

/** Level 5 — One biting hole. Edit this file only; other worlds stay untouched. */
export const L05: HuntLevelDef = {
  level: 5,
  name: "Three Keys",
  layout: "triple",
  task: {
    level: 5,
    kind: "pick",
    title: "One biting hole",
    brief: "Three tide holes — one on each island. Only one takes the cast.",
    nodeLabels: ["West hole", "East hole", "South hole"],
    timerMs: null,
    failOnWrong: false,
    hint: "nobite",
    relic: false,
  },
  stations: [
    { id: "cast-0", label: "West hole", island: 0, corner: "center" },
    { id: "cast-1", label: "East hole", island: 1, corner: "center" },
    { id: "cast-2", label: "South hole", island: 2, corner: "center" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
