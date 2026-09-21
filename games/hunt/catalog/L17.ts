import type { HuntLevelDef } from "./types";

/** Level 17 — Channel the tide. Edit this file only; other worlds stay untouched. */
export const L17: HuntLevelDef = {
  level: 17,
  name: "Channel Atoll",
  layout: "triple",
  task: {
    level: 17,
    kind: "sequence",
    title: "Channel the tide",
    brief: "Open Inlet, Basin, Outlet — one station per island, strict order.",
    nodeLabels: ["Inlet", "Basin", "Outlet"],
    timerMs: null,
    failOnWrong: true,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "seq-0", label: "Inlet", island: 0, corner: "center" },
    { id: "seq-1", label: "Basin", island: 1, corner: "center" },
    { id: "seq-2", label: "Outlet", island: 2, corner: "center" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
