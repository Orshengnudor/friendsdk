import type { HuntLevelDef } from "./types";

/** Level 11 — Tide run. Edit this file only; other worlds stay untouched. */
export const L11: HuntLevelDef = {
  level: 11,
  name: "Tide Run Keys",
  layout: "twin",
  task: {
    level: 11,
    kind: "dash",
    title: "Tide run",
    brief: "Leave the west buoy and reach the far reed across the bridges.",
    nodeLabels: ["Start buoy", "Far reed"],
    timerMs: 24000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "dash-start", label: "Start buoy", island: 0, corner: "west" },
    { id: "dash-finish", label: "Far reed", island: 1, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
