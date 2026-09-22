import type { HuntLevelDef } from "./types";

/** Level 8 — Off the sockets. Edit this file only; other worlds stay untouched. */
export const L08: HuntLevelDef = {
  level: 8,
  name: "Tank Spine",
  layout: "continent",
  task: {
    level: 8,
    kind: "hide",
    title: "Off the sockets",
    brief: "Stay off the Warden's ring for 60 seconds. Inside it, growth drains 0.2/s — empty it and you fall a world.",
    nodeLabels: ["Hide"],
    timerMs: 60000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    
  ],
  npcs: [
    { role: "patrol", preferId: "1", island: 0, corner: "east" },
    { role: "patrol", preferId: "8", island: 0, corner: "north" }
  ],
  spawn: { island: 0, corner: "west" },
};
