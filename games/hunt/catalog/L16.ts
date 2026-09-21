import type { HuntLevelDef } from "./types";

/** Level 16 — Quiet minute. Edit this file only; other worlds stay untouched. */
export const L16: HuntLevelDef = {
  level: 16,
  name: "Quiet Planters",
  layout: "continent",
  task: {
    level: 16,
    kind: "hide",
    title: "Quiet minute",
    brief: "The Scout walks the whole shelf. Stay unseen for 60 seconds. The ring drains growth.",
    nodeLabels: ["Hide"],
    timerMs: 60000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    
  ],
  npcs: [
    { role: "patrol", preferId: "8", island: 0, corner: "east" }
  ],
  spawn: { island: 0, corner: "west" },
};
