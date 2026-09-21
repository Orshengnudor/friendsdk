import type { HuntLevelDef } from "./types";

/** Level 25 — Last grove run. Edit this file only; other worlds stay untouched. */
export const L25: HuntLevelDef = {
  level: 25,
  name: "Last Grove",
  layout: "twin",
  task: {
    level: 25,
    kind: "dash",
    title: "Last grove run",
    brief: "Leave the old bench and reach the far tree in one burst.",
    nodeLabels: ["Old bench", "Far tree"],
    timerMs: 20000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "dash-start", label: "Old bench", island: 0, corner: "west" },
    { id: "dash-finish", label: "Far tree", island: 1, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
