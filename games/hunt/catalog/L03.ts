import type { HuntLevelDef } from "./types";

/** Level 3 — True seam. Edit this file only; other worlds stay untouched. */
export const L03: HuntLevelDef = {
  level: 3,
  name: "Quartz Shelf",
  layout: "spine",
  task: {
    level: 3,
    kind: "pick",
    title: "True seam",
    brief: "Eight seams. One is live. Heat tells you how close.",
    nodeLabels: ["Ash", "Bone", "Clay", "Flint", "Moss", "Quartz", "Shale", "Soot"],
    timerMs: null,
    failOnWrong: false,
    hint: "hotcold",
    relic: false,
  },
  stations: [
    { id: "vein-0", label: "Ash", island: 0, corner: "west" },
    { id: "vein-1", label: "Bone", island: 0, corner: "nw" },
    { id: "vein-2", label: "Clay", island: 0, corner: "north" },
    { id: "vein-3", label: "Flint", island: 0, corner: "ne" },
    { id: "vein-4", label: "Moss", island: 0, corner: "east" },
    { id: "vein-5", label: "Quartz", island: 0, corner: "se" },
    { id: "vein-6", label: "Shale", island: 0, corner: "south" },
    { id: "vein-7", label: "Soot", island: 0, corner: "sw" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "center" },
};
