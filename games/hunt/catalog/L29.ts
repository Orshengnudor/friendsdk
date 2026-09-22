import type { HuntLevelDef } from "./types";

/** Level 29 — Deep hole. Edit this file only; other worlds stay untouched. */
export const L29: HuntLevelDef = {
  level: 29,
  name: "Deep Atoll",
  layout: "atoll",
  task: {
    level: 29,
    kind: "pick",
    title: "Deep hole",
    brief: "Four holes across the atoll. The deep one bites. Cold means you are far.",
    nodeLabels: ["Shoal", "Channel", "Drop", "Trench"],
    timerMs: null,
    failOnWrong: false,
    hint: "hotcold",
    relic: false,
  },
  stations: [
    { id: "vein-0", label: "Shoal", island: 0, corner: "west" },
    { id: "vein-1", label: "Channel", island: 0, corner: "east" },
    { id: "vein-2", label: "Drop", island: 0, corner: "south" },
    { id: "vein-3", label: "Trench", island: 0, corner: "north" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "center" },
};
