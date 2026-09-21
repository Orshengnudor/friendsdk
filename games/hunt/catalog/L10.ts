import type { HuntLevelDef } from "./types";

/** Level 10 — Save the shelf. Edit this file only; other worlds stay untouched. */
export const L10: HuntLevelDef = {
  level: 10,
  name: "Four Vents",
  layout: "continent",
  task: {
    level: 10,
    kind: "fight",
    title: "Save the shelf",
    brief: "The Colossus runs. Chase it and ram until its life is gone.",
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
