import type { HuntLevelDef } from "./types";

/** Level 9 — Descending cut. Edit this file only; other worlds stay untouched. */
export const L09: HuntLevelDef = {
  level: 9,
  name: "Descending Cut",
  layout: "continent",
  task: {
    level: 9,
    kind: "sequence",
    title: "Descending cut",
    brief: "Walk High cut, Mid cut, Low cut. A wrong ledge resets the descent.",
    nodeLabels: ["High cut", "Mid cut", "Low cut"],
    timerMs: 45000,
    failOnWrong: true,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "seq-0", label: "High cut", island: 0, corner: "north" },
    { id: "seq-1", label: "Mid cut", island: 0, corner: "center" },
    { id: "seq-2", label: "Low cut", island: 0, corner: "south" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "west" },
};
