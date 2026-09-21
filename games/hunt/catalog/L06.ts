import type { HuntLevelDef } from "./types";

/** Level 6 — Walk the line. Edit this file only; other worlds stay untouched. */
export const L06: HuntLevelDef = {
  level: 6,
  name: "Hex Array",
  layout: "hexes",
  task: {
    level: 6,
    kind: "sequence",
    title: "Walk the line",
    brief: "Escort the pack across three hexes. Each stop is a different island.",
    nodeLabels: ["Pack", "Relay", "Drop"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "seq-0", label: "Pack", island: 0, corner: "center" },
    { id: "seq-1", label: "Relay", island: 1, corner: "center" },
    { id: "seq-2", label: "Drop", island: 2, corner: "center" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
