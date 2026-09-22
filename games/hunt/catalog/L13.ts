import type { HuntLevelDef } from "./types";

/** Level 13 — Broker's circuit. Edit this file only; other worlds stay untouched. */
export const L13: HuntLevelDef = {
  level: 13,
  name: "Bloom Crescent",
  layout: "fjord",
  task: {
    level: 13,
    kind: "job",
    title: "Broker's circuit",
    brief: "Take the Mask Broker's job, then walk Seed, Root, Bloom in order.",
    nodeLabels: ["Seed", "Root", "Bloom"],
    timerMs: 10000,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "seq-0", label: "Seed", island: 0, corner: "west" },
    { id: "seq-1", label: "Root", island: 0, corner: "east" },
    { id: "seq-2", label: "Bloom", island: 0, corner: "south" }
  ],
  npcs: [
    { role: "giver", preferId: "12", island: 0, corner: "north" }
  ],
  spawn: { island: 0, corner: "center" },
};
