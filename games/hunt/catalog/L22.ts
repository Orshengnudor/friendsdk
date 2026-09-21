import type { HuntLevelDef } from "./types";

/** Level 22 — Hollow delivery. Edit this file only; other worlds stay untouched. */
export const L22: HuntLevelDef = {
  level: 22,
  name: "Cook Line",
  layout: "continent",
  task: {
    level: 22,
    kind: "job",
    title: "Hollow delivery",
    brief: "The Hollow Stalker assigns a four-post island circuit. Talk first.",
    nodeLabels: ["West post", "East post", "South post", "North post"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "gather-0", label: "West post", island: 0, corner: "west" },
    { id: "gather-1", label: "East post", island: 0, corner: "east" },
    { id: "gather-2", label: "South post", island: 0, corner: "south" },
    { id: "gather-3", label: "North post", island: 0, corner: "north" }
  ],
  npcs: [
    { role: "giver", preferId: "16", island: 0, corner: "center" }
  ],
  spawn: { island: 0, corner: "sw" },
};
