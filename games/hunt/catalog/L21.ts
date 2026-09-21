import type { HuntLevelDef } from "./types";

/** Level 21 — Crown path. Edit this file only; other worlds stay untouched. */
export const L21: HuntLevelDef = {
  level: 21,
  name: "Crown Path",
  layout: "continent",
  task: {
    level: 21,
    kind: "sequence",
    title: "Crown path",
    brief: "Seal, Banner, Throne. Miss and the court resets.",
    nodeLabels: ["Seal", "Banner", "Throne"],
    timerMs: 50000,
    failOnWrong: true,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "seq-0", label: "Seal", island: 0, corner: "west" },
    { id: "seq-1", label: "Banner", island: 0, corner: "north" },
    { id: "seq-2", label: "Throne", island: 0, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
