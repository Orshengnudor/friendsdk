export type NpcRole = "giver" | "chaser" | "boss" | "patrol";

export interface HuntNpc {
  id: string;
  friendId: string;
  name: string;
  role: NpcRole;
  line: string;
  spawn: readonly [number, number];
  speed: number;
  vision: number;
  hp: number;
}

/** Creator-kit Friends reused as named NPCs. Never the player's own id. */
export const CAST = [
  { friendId: "3", name: "Kin Keeper" },
  { friendId: "1", name: "Bone Warden" },
  { friendId: "8", name: "Spark Scout" },
  { friendId: "12", name: "Mask Broker" },
  { friendId: "7", name: "Stone Colossus" },
  { friendId: "16", name: "Hollow Stalker" },
] as const;

export const ROLE_COLOR: Record<NpcRole, string> = {
  giver: "#CCFF00",
  chaser: "#ED927E",
  boss: "#F87171",
  patrol: "#F2CE68",
};

const LINES = {
  giver: [
    "Walk the marks I named. The grove pays when you finish.",
    "A job for your Friend. Hit every station, then come back richer.",
    "Do this circuit. Charm is already in the air.",
  ],
  chase: [
    "Do not let us touch you.",
    "Keep moving. The land is bigger than you think.",
    "Two of us. Thirty seconds. Run.",
  ],
  boss: [
    "Ram me until this shelf is quiet. No blades — just mass.",
    "Save the city. Body-check until I drop.",
    "Collide. Again. The boss only falls to footsteps.",
  ],
  hide: [
    "If I see you, growth bleeds. Get out of the ring.",
    "Walk the long way. The ring eats 0.2 growth a second.",
    "Stay off my path. Drain to nothing and you fall a world.",
  ],
} as const;

export function castMember(level: number, playerId: string, index: number) {
  const pid = (() => { try { return BigInt(playerId).toString(); } catch { return playerId; } })();
  const ordered = CAST.filter((row) => row.friendId !== pid);
  const pool = ordered.length ? ordered : CAST;
  return pool[(level + index) % pool.length]!;
}

export function lineFor(role: NpcRole, level: number) {
  const key = role === "patrol" ? "hide" : role === "giver" ? "giver" : role === "boss" ? "boss" : "chase";
  const list = LINES[key];
  return list[level % list.length]!;
}

export function chaseCountFor(level: number) {
  if (level >= 24) return 3;
  if (level >= 14) return 2;
  return 1;
}

export function bossHpFor(level: number) {
  return 6 + Math.round(level * 0.55);
}

export function chaseSpeedFor(level: number) {
  return 70 + level * 2.4;
}

export function hideVisionFor(level: number) {
  return 44 + level * 0.9;
}

export function relicFor(level: number, npcName: string) {
  const value = level >= 27 ? 3 : level >= 20 ? 2 : 1.5;
  return { name: `${npcName} relic`, value };
}
