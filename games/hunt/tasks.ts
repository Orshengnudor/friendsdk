/** One unique task per campaign level. Completing any of them spends 1 RF. */

export type TaskKind =
  | "vendor"
  | "sequence"
  | "gather"
  | "pick"
  | "dash"
  | "arm"
  | "job"
  | "hide"
  | "chase"
  | "fight";
export type TaskHint = "none" | "hotcold" | "nobite";

export interface HuntTask {
  level: number;
  kind: TaskKind;
  title: string;
  brief: string;
  nodeLabels: readonly string[];
  timerMs: number | null;
  failOnWrong: boolean;
  hint: TaskHint;
  /** Fight / late jobs always drop a named relic into the pack. */
  relic: boolean;
}

export const TASKS: readonly HuntTask[] = [
  { level: 1, kind: "vendor", title: "Charm the grove", brief: "Buy charms — type how many RF — then hunt from the grove.", nodeLabels: ["Charm bench", "Hunting grove"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 2, kind: "sequence", title: "Trace the circuit", brief: "Hit Scent, Print, Den in that order before the window closes.", nodeLabels: ["Scent", "Print", "Den"], timerMs: 50_000, failOnWrong: true, hint: "none", relic: false },
  { level: 3, kind: "pick", title: "True seam", brief: "Eight seams. One is live. Heat tells you how close.", nodeLabels: ["Ash", "Bone", "Clay", "Flint", "Moss", "Quartz", "Shale", "Soot"], timerMs: null, failOnWrong: false, hint: "hotcold", relic: false },
  { level: 4, kind: "dash", title: "Roof sprint", brief: "Tag the start vent, then reach the antenna before the clock dies.", nodeLabels: ["Start vent", "Finish antenna"], timerMs: 26_000, failOnWrong: false, hint: "none", relic: false },
  { level: 5, kind: "pick", title: "One biting hole", brief: "Three tide holes — one on each island. Only one takes the cast.", nodeLabels: ["West hole", "East hole", "South hole"], timerMs: null, failOnWrong: false, hint: "nobite", relic: false },
  { level: 6, kind: "sequence", title: "Walk the line", brief: "Escort the pack across three hexes. Each stop is a different island.", nodeLabels: ["Pack", "Relay", "Drop"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 7, kind: "job", title: "Keeper's errand", brief: "Talk to the Kin Keeper. Then collect every trail sign they name.", nodeLabels: ["Feather", "Print", "Tuft"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 8, kind: "hide", title: "Off the sockets", brief: "Stay off the Warden's ring for 60 seconds. Inside it, growth drains 0.2/s — empty it and you fall a world.", nodeLabels: ["Hide"], timerMs: 60_000, failOnWrong: false, hint: "none", relic: false },
  { level: 9, kind: "sequence", title: "Descending cut", brief: "Walk High cut, Mid cut, Low cut. A wrong ledge resets the descent.", nodeLabels: ["High cut", "Mid cut", "Low cut"], timerMs: 30_000, failOnWrong: true, hint: "none", relic: false },
  { level: 10, kind: "fight", title: "Save the shelf", brief: "Ram the Colossus until its life is gone. Collide, peel off, collide again.", nodeLabels: ["Colossus"], timerMs: null, failOnWrong: false, hint: "none", relic: true },
  { level: 11, kind: "dash", title: "Tide run", brief: "Leave the west buoy and reach the far reed across the bridges.", nodeLabels: ["Start buoy", "Far reed"], timerMs: 15_000, failOnWrong: false, hint: "none", relic: false },
  { level: 12, kind: "pick", title: "Live dish", brief: "Four dishes across the hexes. One is receiving. Warmth marks the beam. 15 seconds.", nodeLabels: ["Port dish", "Solar dish", "Spare dish", "Aft dish"], timerMs: 15_000, failOnWrong: false, hint: "hotcold", relic: false },
  { level: 13, kind: "job", title: "Broker's circuit", brief: "Take the Mask Broker's job, then walk Seed, Root, Bloom in order. Clock starts when you accept.", nodeLabels: ["Seed", "Root", "Bloom"], timerMs: 10_000, failOnWrong: false, hint: "none", relic: false },
  { level: 14, kind: "chase", title: "Two on your heels", brief: "Two NPCs hunt you for 30 seconds. Their reach drains 0.2 growth/s. Empty it and you fall a world.", nodeLabels: ["Run"], timerMs: 30_000, failOnWrong: false, hint: "none", relic: false },
  { level: 15, kind: "arm", title: "Crack the vault", brief: "Turn the key crystal, then open the vault rock.", nodeLabels: ["Key crystal", "Vault rock"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 16, kind: "hide", title: "Quiet minute", brief: "The Scout walks the whole shelf. Stay unseen for 60 seconds. The ring drains growth.", nodeLabels: ["Hide"], timerMs: 60_000, failOnWrong: false, hint: "none", relic: false },
  { level: 17, kind: "sequence", title: "Channel the tide", brief: "Open Inlet, Basin, Outlet — one station per island, strict order.", nodeLabels: ["Inlet", "Basin", "Outlet"], timerMs: null, failOnWrong: true, hint: "none", relic: false },
  { level: 18, kind: "chase", title: "Deck flight", brief: "Two pursuers, 30 seconds. Their reach drains growth. Held trophies slow them.", nodeLabels: ["Run"], timerMs: 30_000, failOnWrong: false, hint: "none", relic: false },
  { level: 19, kind: "gather", title: "Pollen circuit", brief: "Touch every flower marker around the oval.", nodeLabels: ["Dawn flower", "Noon flower", "Dusk flower", "Night flower"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 20, kind: "fight", title: "Drop the warden", brief: "Body-check the Bone Warden until the stack falls. A trophy waits.", nodeLabels: ["Warden"], timerMs: null, failOnWrong: false, hint: "none", relic: true },
  { level: 21, kind: "sequence", title: "Crown path", brief: "Seal, Banner, Throne. Miss and the court resets.", nodeLabels: ["Seal", "Banner", "Throne"], timerMs: 50_000, failOnWrong: true, hint: "none", relic: false },
  { level: 22, kind: "job", title: "Hollow delivery", brief: "The Hollow Stalker assigns a four-post island circuit. Talk first.", nodeLabels: ["West post", "East post", "South post", "North post"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 23, kind: "gather", title: "Island circuit", brief: "Visit every marked shore post — one on each island.", nodeLabels: ["West post", "East post", "South post"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 24, kind: "chase", title: "Three shadows", brief: "Three NPCs. 30 seconds. Use the whole shelf. Touch range drains growth.", nodeLabels: ["Run"], timerMs: 30_000, failOnWrong: false, hint: "none", relic: false },
  { level: 25, kind: "dash", title: "Last grove run", brief: "Leave the old bench and reach the far tree in one burst.", nodeLabels: ["Old bench", "Far tree"], timerMs: 20_000, failOnWrong: false, hint: "none", relic: false },
  { level: 26, kind: "hide", title: "Ruler's blind", brief: "Wide gaze, 60 seconds unseen. Stand in the ring and growth bleeds until you drop a world.", nodeLabels: ["Hide"], timerMs: 60_000, failOnWrong: false, hint: "none", relic: false },
  { level: 27, kind: "fight", title: "Spark out", brief: "Ram the Spark Scout until the charge dies. Keep the trophy or cash it.", nodeLabels: ["Scout"], timerMs: null, failOnWrong: false, hint: "none", relic: true },
  { level: 28, kind: "arm", title: "Raise the banner", brief: "Unlock the crate, then hoist the antenna.", nodeLabels: ["Unlock crate", "Hoist antenna"], timerMs: null, failOnWrong: false, hint: "none", relic: false },
  { level: 29, kind: "pick", title: "Deep hole", brief: "Four holes across the atoll. The deep one bites. Cold means you are far.", nodeLabels: ["Shoal", "Channel", "Drop", "Trench"], timerMs: null, failOnWrong: false, hint: "hotcold", relic: false },
  { level: 30, kind: "fight", title: "Vault escort", brief: "The Colossus guards the last vault. Ram it down, then the RF settles.", nodeLabels: ["Colossus"], timerMs: null, failOnWrong: false, hint: "none", relic: true },
];

export function taskForLevel(level: number): HuntTask {
  return TASKS[Math.max(0, Math.min(TASKS.length, level) - 1)]!;
}
