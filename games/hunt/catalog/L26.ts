import type { HuntLevelDef } from "./types";

/** Level 26 — Ruler's blind. Edit this file only; other worlds stay untouched. */
export const L26: HuntLevelDef = {
  level: 26,
  name: "Pipe Hymn",
  layout: "continent",
  task: {
    level: 26,
    kind: "hide",
    title: "Ruler's blind",
    brief: "Wide gaze, 60 seconds unseen. Stand in the ring and growth bleeds until you drop a world.",
    nodeLabels: ["Hide"],
    timerMs: 60000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    
  ],
  npcs: [
    { role: "patrol", preferId: "16", island: 0, corner: "east" }
  ],
  spawn: { island: 0, corner: "west" },
};
