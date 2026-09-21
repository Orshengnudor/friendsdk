import type { HuntLevelDef } from "./types";

/** Level 30 — Vault escort. Edit this file only; other worlds stay untouched. */
export const L30: HuntLevelDef = {
  level: 30,
  name: "Vault Escort",
  layout: "continent",
  task: {
    level: 30,
    kind: "fight",
    title: "Vault escort",
    brief: "The Colossus guards the last vault and runs when you close. Ram it down, then the RF settles.",
    nodeLabels: ["Colossus"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: true,
  },
  stations: [
    
  ],
  npcs: [
    { role: "boss", preferId: "7", island: 0, corner: "east" }
  ],
  spawn: { island: 0, corner: "west" },
};
