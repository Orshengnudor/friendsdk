import type { HuntLevelDef } from "./types";

/** Level 7 — Keeper's errand. Edit this file only; other worlds stay untouched. */
export const L07: HuntLevelDef = {
  level: 7,
  name: "Feather Isle",
  layout: "continent",
  task: {
    level: 7,
    kind: "job",
    title: "Keeper's errand",
    brief: "Talk to the Kin Keeper. Then collect every trail sign they name.",
    nodeLabels: ["Feather", "Print", "Tuft"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "gather-0", label: "Feather", island: 0, corner: "west" },
    { id: "gather-1", label: "Print", island: 0, corner: "south" },
    { id: "gather-2", label: "Tuft", island: 0, corner: "east" }
  ],
  npcs: [
    { role: "giver", preferId: "3", island: 0, corner: "nw" }
  ],
  spawn: { island: 0, corner: "center" },
};
