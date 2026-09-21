import type { HuntLevelDef } from "./types";

/** Level 18 — Deck flight. Edit this file only; other worlds stay untouched. */
export const L18: HuntLevelDef = {
  level: 18,
  name: "Deck to Deck",
  layout: "twin",
  task: {
    level: 18,
    kind: "chase",
    title: "Deck flight",
    brief: "Two pursuers, 30 seconds. Their reach drains growth. Held trophies slow them.",
    nodeLabels: ["Run"],
    timerMs: 30000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    
  ],
  npcs: [
    { role: "chaser", preferId: "16", island: 1, corner: "east" },
    { role: "chaser", preferId: "8", island: 1, corner: "south" }
  ],
  spawn: { island: 0, corner: "west" },
};
