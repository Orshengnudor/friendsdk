import type { HuntLevelDef } from "./types";

/** Level 20 — Drop the warden. Edit this file only; other worlds stay untouched. */
export const L20: HuntLevelDef = {
  level: 20,
  name: "Live Wire",
  layout: "continent",
  task: {
    level: 20,
    kind: "fight",
    title: "Drop the warden",
    brief: "The Bone Warden runs. Chase and ram until the stack falls. A trophy waits.",
    nodeLabels: ["Warden"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: true,
  },
  stations: [
    
  ],
  npcs: [
    { role: "boss", preferId: "1", island: 0, corner: "east" }
  ],
  spawn: { island: 0, corner: "west" },
};
