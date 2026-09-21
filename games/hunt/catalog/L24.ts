import type { HuntLevelDef } from "./types";

/** Level 24 — Three shadows. Edit this file only; other worlds stay untouched. */
export const L24: HuntLevelDef = {
  level: 24,
  name: "Talking Masts",
  layout: "quad",
  task: {
    level: 24,
    kind: "chase",
    title: "Three shadows",
    brief: "Three NPCs. 30 seconds. Use the whole shelf. Touch range drains growth.",
    nodeLabels: ["Run"],
    timerMs: 30000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    
  ],
  npcs: [
    { role: "chaser", preferId: "8", island: 1, corner: "center" },
    { role: "chaser", preferId: "1", island: 2, corner: "center" },
    { role: "chaser", preferId: "16", island: 3, corner: "center" }
  ],
  spawn: { island: 0, corner: "center" },
};
