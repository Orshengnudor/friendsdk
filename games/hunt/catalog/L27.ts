import type { HuntLevelDef } from "./types";

/** Level 27 — Spark out. Edit this file only; other worlds stay untouched. */
export const L27: HuntLevelDef = {
  level: 27,
  name: "Shard Harvest",
  layout: "continent",
  task: {
    level: 27,
    kind: "fight",
    title: "Spark out",
    brief: "The Spark Scout runs. Chase and ram until the charge dies. Keep the trophy or cash it.",
    nodeLabels: ["Scout"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: true,
  },
  stations: [
    
  ],
  npcs: [
    { role: "boss", preferId: "8", island: 0, corner: "east" }
  ],
  spawn: { island: 0, corner: "west" },
};
