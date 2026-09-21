import type { HuntLevelDef } from "./types";

/** Level 28 — Raise the banner. Edit this file only; other worlds stay untouched. */
export const L28: HuntLevelDef = {
  level: 28,
  name: "Banner Rise",
  layout: "twin",
  task: {
    level: 28,
    kind: "arm",
    title: "Raise the banner",
    brief: "Unlock the crate, then hoist the antenna.",
    nodeLabels: ["Unlock crate", "Hoist antenna"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "arm-0", label: "Unlock crate", island: 0, corner: "west" },
    { id: "arm-1", label: "Hoist antenna", island: 1, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
