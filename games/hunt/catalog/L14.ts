import type { HuntLevelDef } from "./types";

/** Level 14 — Two on your heels. Edit this file only; other worlds stay untouched. */
export const L14: HuntLevelDef = {
  level: 14,
  name: "Salvage Twin",
  layout: "twin",
  task: {
    level: 14,
    kind: "chase",
    title: "Two on your heels",
    brief: "Two NPCs hunt you for 30 seconds. Their reach drains 0.2 growth/s. Empty it and you fall a world.",
    nodeLabels: ["Run"],
    timerMs: 30000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    
  ],
  npcs: [
    { role: "chaser", preferId: "8", island: 1, corner: "east" },
    { role: "chaser", preferId: "1", island: 1, corner: "north" }
  ],
  spawn: { island: 0, corner: "west" },
};
