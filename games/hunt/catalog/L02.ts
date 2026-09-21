import type { HuntLevelDef } from "./types";

/** Level 2 — Trace the circuit. Edit this file only; other worlds stay untouched. */
export const L02: HuntLevelDef = {
  level: 2,
  name: "Trace Cloister",
  layout: "crescent",
  task: {
    level: 2,
    kind: "sequence",
    title: "Trace the circuit",
    brief: "Hit Scent, Print, Den in that order before the window closes.",
    nodeLabels: ["Scent", "Print", "Den"],
    timerMs: 50000,
    failOnWrong: true,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "seq-0", label: "Scent", island: 0, corner: "west" },
    { id: "seq-1", label: "Print", island: 0, corner: "center" },
    { id: "seq-2", label: "Den", island: 0, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
