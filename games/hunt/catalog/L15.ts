import type { HuntLevelDef } from "./types";

/** Level 15 — Crack the vault. Edit this file only; other worlds stay untouched. */
export const L15: HuntLevelDef = {
  level: 15,
  name: "Vault Mesa",
  layout: "continent",
  task: {
    level: 15,
    kind: "arm",
    title: "Crack the vault",
    brief: "Turn the key crystal, then open the vault rock.",
    nodeLabels: ["Key crystal", "Vault rock"],
    timerMs: null,
    failOnWrong: false,
    hint: "none",
    relic: false,
  },
  stations: [
    { id: "arm-0", label: "Key crystal", island: 0, corner: "west" },
    { id: "arm-1", label: "Vault rock", island: 0, corner: "east" }
  ],
  npcs: [
    
  ],
  spawn: { island: 0, corner: "south" },
};
