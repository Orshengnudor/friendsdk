"use client";

import { useEffect, useRef, useState } from "react";
import { loadWorldAssets } from "@rarefriends/friendsdk/assets";
import { createWorldMovement } from "@rarefriends/friendsdk/movement";
import { createFriendReader, spriteFrame, type GenerationSprites, type SpriteFacing } from "@rarefriends/friendsdk/sprites";
import { CANVAS, isWorldWalkable, project, unproject, type WorldConfig } from "@rarefriends/friendsdk/world";
import { ROLE_COLOR, type HuntNpc } from "./npcs";
import type { LookMode } from "./levels";
import { randomWalkable } from "./placement";
import type { WorldInteraction } from "./types";
import { officialSafe } from "./worlds";

const WORLD_W = CANVAS.width;
const WORLD_H = CANVAS.height;
const BASE_VIEW = { x: 70, y: 380, w: 1460, h: 640 };
const PRESS_RANGE = 30;
const spriteCache = new Map<string, GenerationSprites>();
let reader: ReturnType<typeof createFriendReader> | null = null;

function getReader() {
  if (!reader) reader = createFriendReader();
  return reader;
}

async function readFriend(id: bigint, signal?: AbortSignal): Promise<GenerationSprites | null> {
  const key = id.toString();
  const hit = spriteCache.get(key);
  if (hit) return hit;
  if (signal?.aborted) return null;
  try {
    const sprites = await getReader().read(id);
    spriteCache.set(key, sprites);
    return sprites;
  } catch {
    return spriteCache.get(key) ?? null;
  }
}

export type NpcEvent =
  | { type: "talk"; npcId: string }
  | { type: "spotted"; npcId: string }
  | { type: "clear"; npcId: string }
  | { type: "caught"; npcId: string }
  | { type: "pressure"; npcId: string; active: boolean }
  | { type: "hit"; npcId: string; hp: number; max: number }
  | { type: "down"; npcId: string; hp: number; max: number };

type LiveNpc = {
  spec: HuntNpc;
  x: number;
  y: number;
  facing: SpriteFacing;
  walking: boolean;
  hp: number;
  lastHit: number;
  alert: boolean;
  lastSpot: number;
  goal: [number, number] | null;
  side: "left" | "right";
};

type Props = {
  friendId: bigint;
  world: WorldConfig;
  spawn: readonly [number, number];
  interactions: readonly WorldInteraction[];
  npcs?: readonly HuntNpc[];
  lookMode?: LookMode;
  paused?: boolean;
  reducedMotion?: boolean;
  chaseSlow?: number;
  zoom?: number;
  resetToken?: number;
  control?: "stick" | "pad";
  onZoom?: (zoom: number) => void;
  onInteract: (id: string) => void;
  onNpcEvent?: (event: NpcEvent) => void;
};

function viewFor(zoom: number) {
  const z = Math.min(1.9, Math.max(0.7, zoom));
  const w = Math.min(WORLD_W, BASE_VIEW.w / z);
  const h = Math.min(WORLD_H, BASE_VIEW.h / z);
  const cx = BASE_VIEW.x + BASE_VIEW.w / 2;
  const cy = BASE_VIEW.y + BASE_VIEW.h / 2;
  return {
    x: Math.max(0, Math.min(WORLD_W - w, cx - w / 2)),
    y: Math.max(0, Math.min(WORLD_H - h, cy - h / 2)),
    w,
    h,
  };
}

function facingOf(dx: number, dy: number): SpriteFacing {
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}

function stepToward(
  world: WorldConfig,
  from: readonly [number, number],
  to: readonly [number, number],
  speed: number,
  dt: number,
): { pos: [number, number]; walking: boolean; facing: SpriteFacing } {
  const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
  if (dist < 1.2) return { pos: [from[0], from[1]], walking: false, facing: "down" };
  const step = Math.min(dist, speed * dt);
  const nx = from[0] + ((to[0] - from[0]) / dist) * step;
  const ny = from[1] + ((to[1] - from[1]) / dist) * step;
  const facing = facingOf(to[0] - from[0], to[1] - from[1]);
  if (isWorldWalkable(world, [nx, ny], 7)) return { pos: [nx, ny], walking: true, facing };
  if (isWorldWalkable(world, [nx, from[1]], 7)) return { pos: [nx, from[1]], walking: true, facing };
  if (isWorldWalkable(world, [from[0], ny], 7)) return { pos: [from[0], ny], walking: true, facing };
  return { pos: [from[0], from[1]], walking: false, facing };
}

function drawPixels(
  context: CanvasRenderingContext2D,
  rows: readonly string[],
  left: number,
  top: number,
  size: number,
  flash: boolean,
  fill: string,
) {
  const scale = size / 16;
  context.save();
  context.beginPath();
  context.rect(left, top, size, size);
  context.clip();
  context.fillStyle = "#fff";
  for (let py = 0; py < 16; py++) {
    const row = rows[py] ?? "";
    for (let px = 0; px < 16; px++) {
      if (row[px] === "#") context.fillRect(left + px * scale - 1, top + py * scale - 1, scale + 2, scale + 2);
    }
  }
  context.fillStyle = flash ? "#fff" : fill;
  for (let py = 0; py < 16; py++) {
    const row = rows[py] ?? "";
    for (let px = 0; px < 16; px++) {
      if (row[px] === "#") context.fillRect(left + px * scale, top + py * scale, scale, scale);
    }
  }
  context.restore();
}

function blobRows(seed: number): string[] {
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = "";
    for (let x = 0; x < 16; x++) {
      const dx = x - 7.5, dy = y - 8;
      const body = dx * dx * 0.7 + dy * dy * 0.9 < 28 + (seed % 5);
      const head = y < 6 && dx * dx + (dy + 5) * (dy + 5) < 10;
      row += body || head ? "#" : ".";
    }
    rows.push(row);
  }
  return rows;
}

export function HuntWorld({
  friendId,
  world,
  spawn,
  interactions,
  npcs = [],
  lookMode = "color",
  paused = false,
  reducedMotion = false,
  chaseSlow = 0,
  zoom = 1,
  resetToken = 0,
  control = "stick",
  onZoom,
  onInteract,
  onNpcEvent,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const mover = useRef<ReturnType<typeof createWorldMovement> | null>(null);
  const live = useRef({ paused, reducedMotion, interactions, onInteract, onNpcEvent, npcs, chaseSlow, world, zoom, onZoom, resetToken });
  live.current = { paused, reducedMotion, interactions, onInteract, onNpcEvent, npcs, chaseSlow, world, zoom, onZoom, resetToken };
  const [near, setNear] = useState<string | null>(null);
  const [status, setStatus] = useState("Loading world…");
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const view = viewFor(zoom);
  const stickRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const aimStick = (clientX: number, clientY: number) => {
    const node = stickRef.current;
    if (!node || !mover.current) return;
    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const max = rect.width * 0.32;
    const dist = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(dist, max);
    dx = (dx / dist) * clamped;
    dy = (dy / dist) * clamped;
    setKnob({ x: dx, y: dy });
    const dead = 12;
    mover.current.setKey("w", dy < -dead);
    mover.current.setKey("s", dy > dead);
    mover.current.setKey("a", dx < -dead);
    mover.current.setKey("d", dx > dead);
  };
  const releaseStick = () => {
    setKnob({ x: 0, y: 0 });
    mover.current?.setKey("w", false);
    mover.current?.setKey("a", false);
    mover.current?.setKey("s", false);
    mover.current?.setKey("d", false);
  };
  useEffect(() => {
    setKnob({ x: 0, y: 0 });
    mover.current?.setKey("w", false);
    mover.current?.setKey("a", false);
    mover.current?.setKey("s", false);
    mover.current?.setKey("d", false);
  }, [control]);

  const nearest = (point: readonly [number, number]) =>
    live.current.interactions
      .filter((item) => Math.hypot(point[0] - item.position[0], point[1] - item.position[1]) <= (item.reach ?? 110))
      .sort((a, b) => Math.hypot(point[0] - a.position[0], point[1] - a.position[1]) - Math.hypot(point[0] - b.position[0], point[1] - b.position[1]))[0]?.id ?? null;

  useEffect(() => { if (paused) mover.current?.stop(); }, [paused]);

  useEffect(() => {
    if (paused || status) return;
    const grab = () => canvas.current?.focus({ preventScroll: true });
    grab();
    const id = requestAnimationFrame(grab);
    return () => cancelAnimationFrame(id);
  }, [paused, status]);

  useEffect(() => {
    const typing = (event: Event) => {
      const node = event.target as HTMLElement | null;
      return Boolean(node && (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT" || node.isContentEditable));
    };
    const onDown = (event: KeyboardEvent) => {
      if (live.current.paused || typing(event)) return;
      const mapped = ({ KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "w", ArrowLeft: "a", ArrowDown: "s", ArrowRight: "d" } as Record<string, string>)[event.code]
        ?? (event.key.length === 1 ? event.key.toLowerCase() : "");
      if ((event.code === "KeyE" || event.key.toLowerCase() === "e") && !event.repeat && mover.current) {
        const target = nearest(mover.current.state.position);
        if (target) { event.preventDefault(); live.current.onInteract(target); }
      }
      if (mapped && mover.current?.setKey(mapped, true)) event.preventDefault();
    };
    const onUp = (event: KeyboardEvent) => {
      const mapped = ({ KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "w", ArrowLeft: "a", ArrowDown: "s", ArrowRight: "d" } as Record<string, string>)[event.code]
        ?? (event.key.length === 1 ? event.key.toLowerCase() : "");
      if (mapped) mover.current?.setKey(mapped, false);
    };
    window.addEventListener("keydown", onDown, true);
    window.addEventListener("keyup", onUp, true);
    return () => {
      window.removeEventListener("keydown", onDown, true);
      window.removeEventListener("keyup", onUp, true);
    };
  }, []);

  useEffect(() => {
    const node = canvas.current;
    const context = node?.getContext("2d");
    if (!node || !context) { setFailed(true); setStatus("This browser cannot render the world."); return; }
    const abort = new AbortController();
    let movement: ReturnType<typeof createWorldMovement>;
    try {
      movement = createWorldMovement(world, spawn);
    } catch {
      setFailed(true);
      setStatus("Spawn is not walkable on this map.");
      return;
    }
    mover.current = movement;
    setNear(null); setFailed(false); setStatus("Loading world…");

    const seedNpcs = (list: LiveNpc[]) => {
      list.length = 0;
      for (const spec of live.current.npcs) {
        list.push({
          spec, x: spec.spawn[0], y: spec.spawn[1], facing: "down", walking: false,
          hp: spec.hp, lastHit: 0, alert: false, lastSpot: 0, goal: null, side: "right",
        });
      }
    };
    const liveNpcs: LiveNpc[] = [];
    seedNpcs(liveNpcs);
    let seenReset = live.current.resetToken ?? 0;

    let frame = 0, previous = 0, lastNear: string | null = null, shake = 0, lastPressure = false;
    let playerSide: "left" | "right" = "right";
    const stopUser = () => movement.stop();
    window.addEventListener("blur", stopUser);
    document.addEventListener("visibilitychange", stopUser);

    const color = lookMode !== "ink";
    const npcIds = [...new Set(live.current.npcs.map((n) => BigInt(n.friendId)))];

    void (async () => {
      const loadWorld = async (config: WorldConfig) => loadWorldAssets(config, { signals: false, color }, abort.signal);
      let assets: Awaited<ReturnType<typeof loadWorldAssets>>;
      try {
        assets = await loadWorld(world);
      } catch {
        const level = Number((world.id.match(/hunt-l(\d+)/) ?? [])[1] || 1);
        assets = await loadWorld(officialSafe(level));
      }
      const player = await readFriend(friendId, abort.signal);
      const npcSprites = new Map<string, GenerationSprites>();
      await Promise.all(npcIds.map(async (id) => {
        const sprites = await readFriend(id, abort.signal);
        if (sprites) npcSprites.set(id.toString(), sprites);
      }));
      if (abort.signal.aborted) return;
      if (!player && !spriteCache.size) throw new Error("friend");
      setStatus("");
      const render = (now: number) => {
        const dt = !live.current.paused && !document.hidden && previous ? now - previous : 0;
        const capped = Math.min(dt, 40);
        const state = movement.update(dt);
        previous = now;
        if (state.facing === "left" || state.facing === "right") playerSide = state.facing;
        shake = Math.max(0, shake - capped * 0.08);
        const jx = shake ? (Math.random() - 0.5) * shake : 0;
        const jy = shake ? (Math.random() - 0.5) * shake : 0;

        const seconds = capped / 1000;
        const slow = 1 - live.current.chaseSlow;
        if ((live.current.resetToken ?? 0) !== seenReset) {
          seenReset = live.current.resetToken ?? 0;
          seedNpcs(liveNpcs);
        }
        for (const npc of liveNpcs) {
          if (npc.hp <= 0) continue;
          let target: readonly [number, number] = [npc.x, npc.y];
          if (npc.spec.role === "chaser") {
              target = state.position;
            } else if (npc.spec.role === "boss") {
            const dx = npc.x - state.position[0];
            const dy = npc.y - state.position[1];
            const dist = Math.hypot(dx, dy) || 1;
            const flee: [number, number] = [npc.x + (dx / dist) * 110, npc.y + (dy / dist) * 110];
            if (isWorldWalkable(live.current.world, flee, 7)) target = flee;
            else {
              const px = -dy / dist, py = dx / dist;
              const left: [number, number] = [npc.x + px * 90, npc.y + py * 90];
              const right: [number, number] = [npc.x - px * 90, npc.y - py * 90];
              target = isWorldWalkable(live.current.world, left, 7) ? left
                : isWorldWalkable(live.current.world, right, 7) ? right
                : randomWalkable(live.current.world);
            }
          } else if (npc.spec.role === "patrol") {
            if (!npc.goal || Math.hypot(npc.x - npc.goal[0], npc.y - npc.goal[1]) < 14) {
              let next = randomWalkable(live.current.world);
              let hops = 0;
              while (hops < 16 && Math.hypot(next[0] - npc.x, next[1] - npc.y) < 160) {
                next = randomWalkable(live.current.world);
                hops++;
              }
              npc.goal = [next[0], next[1]];
            }
            target = npc.goal;
          } else if (npc.spec.role === "giver") {
            if (!npc.goal || Math.hypot(npc.x - npc.goal[0], npc.y - npc.goal[1]) < 12) {
              const next = randomWalkable(live.current.world);
              npc.goal = [next[0], next[1]];
            }
            const home = Math.hypot(npc.x - npc.spec.spawn[0], npc.y - npc.spec.spawn[1]);
            target = home > 70 ? npc.spec.spawn : npc.goal ?? npc.spec.spawn;
          }
          const chaseSpeed = npc.spec.speed * (npc.spec.role === "chaser" ? Math.max(0.55, slow) : 1);
          let moved = stepToward(live.current.world, [npc.x, npc.y], target, chaseSpeed, seconds);
          if (!moved.walking && (npc.spec.role === "chaser" || npc.spec.role === "patrol" || npc.spec.role === "boss")) {
            const hop = randomWalkable(live.current.world);
            moved = stepToward(live.current.world, [npc.x, npc.y], hop, chaseSpeed, seconds);
          }
          npc.x = moved.pos[0]; npc.y = moved.pos[1]; npc.walking = moved.walking; npc.facing = moved.facing;
          if (npc.facing === "left" || npc.facing === "right") npc.side = npc.facing;
          const dist = Math.hypot(npc.x - state.position[0], npc.y - state.position[1]);
          if (npc.spec.role === "patrol") {
            if (dist < npc.spec.vision) {
              if (!npc.alert || now - npc.lastSpot > 700) {
                npc.alert = true; npc.lastSpot = now;
                live.current.onNpcEvent?.({ type: "spotted", npcId: npc.spec.id });
              }
            } else if (npc.alert) {
              npc.alert = false;
              live.current.onNpcEvent?.({ type: "clear", npcId: npc.spec.id });
            }
          }
          if (npc.spec.role === "chaser" && dist < PRESS_RANGE && now - npc.lastHit > 900) {
            npc.lastHit = now;
            live.current.onNpcEvent?.({ type: "caught", npcId: npc.spec.id });
          }
          if (npc.spec.role === "boss" && dist < 26 && now - npc.lastHit > 380) {
            npc.lastHit = now;
            npc.hp = Math.max(0, npc.hp - 1);
            shake = npc.hp <= 0 ? 10 : 6;
            const bosses = liveNpcs.filter((row) => row.spec.role === "boss");
            const alive = bosses.filter((row) => row.hp > 0).length;
            const maxHp = bosses.reduce((sum, row) => sum + row.spec.hp, 0);
            const hp = bosses.reduce((sum, row) => sum + row.hp, 0);
            live.current.onNpcEvent?.({
              type: alive === 0 ? "down" : "hit",
              npcId: npc.spec.id,
              hp,
              max: maxHp,
            });
          }
        }

        let pressNpc: LiveNpc | null = null;
        for (const npc of liveNpcs) {
          if (npc.hp <= 0) continue;
          const dist = Math.hypot(npc.x - state.position[0], npc.y - state.position[1]);
          if (npc.spec.role === "patrol" && dist < npc.spec.vision) pressNpc = npc;
          if (npc.spec.role === "chaser" && dist < PRESS_RANGE) pressNpc = npc;
        }
        const pressing = Boolean(pressNpc);
        if (pressing !== lastPressure) {
          lastPressure = pressing;
          live.current.onNpcEvent?.({ type: "pressure", npcId: pressNpc?.spec.id ?? "npc-0", active: pressing });
        }

        context.clearRect(0, 0, WORLD_W, WORLD_H);
        context.save();
        context.translate(jx, jy);
        context.imageSmoothingEnabled = false;
        context.drawImage(assets.terrain, 0, 0);
        const layers = assets.objects.map((object) => ({ depth: object.depth, draw: () => context.drawImage(object.image, 0, 0) }));
        const paint = (
          sprites: GenerationSprites | null | undefined,
          pos: readonly [number, number],
          facing: SpriteFacing,
          walking: boolean,
          side: "left" | "right",
          size: number,
          flash: boolean,
          fill: string,
          seed: number,
          bias = 0,
        ) => {
          const [sx, sy] = project(...pos);
          layers.push({
            depth: pos[0] + pos[1] + bias,
            draw: () => {
              const frameIndex = live.current.reducedMotion ? 0 : Math.floor(now / 110) % 8;
              let rows: readonly string[] = blobRows(seed);
              if (sprites) {
                try { rows = spriteFrame(sprites, facing, walking && !live.current.reducedMotion, frameIndex, side).frame.rows; }
                catch { /* keep blob */ }
              }
              drawPixels(context, rows, Math.round(sx) - size / 2, Math.round(sy) - size + 5, size, flash, fill);
            },
          });
        };
        for (const npc of liveNpcs) {
          if (npc.hp <= 0) continue;
          if (npc.spec.role === "patrol") {
            layers.push({
              depth: npc.x + npc.y - 50,
              draw: () => {
                const [sx, sy] = project(npc.x, npc.y);
                const [ex, ey] = project(npc.x + npc.spec.vision, npc.y);
                const rx = Math.max(28, Math.hypot(ex - sx, ey - sy));
                context.beginPath();
                context.ellipse(sx, sy, rx, rx * 0.42, 0, 0, Math.PI * 2);
                context.fillStyle = npc.alert ? "rgba(248,113,113,0.2)" : "rgba(242,206,104,0.14)";
                context.fill();
                context.strokeStyle = npc.alert ? "#F87171" : "#F2CE68";
                context.lineWidth = 2;
                context.stroke();
              },
            });
          }
          paint(
            npcSprites.get(npc.spec.friendId),
            [npc.x, npc.y], npc.facing, npc.walking, npc.side,
            npc.spec.role === "boss" ? 96 : 80,
            now - npc.lastHit < 160,
            ROLE_COLOR[npc.spec.role],
            Number(npc.spec.friendId) || 1,
          );
        }
        paint(player ?? spriteCache.get(friendId.toString()) ?? null, state.position, state.facing, state.walking, playerSide, 80, false, "#000", Number(friendId % 97n), 0.01);
        layers.sort((a, b) => a.depth - b.depth).forEach((layer) => layer.draw());
        context.restore();

        context.save();
        context.imageSmoothingEnabled = true;
        for (const npc of liveNpcs) {
          if (npc.hp <= 0) continue;
          const [sx, sy] = project(npc.x, npc.y);
          const color = ROLE_COLOR[npc.spec.role];
          const tag = npc.spec.role === "boss" ? "BOSS" : npc.spec.role === "chaser" ? "HUNT" : npc.spec.role === "patrol" ? "WATCH" : "JOB";
          context.font = "600 12px ui-monospace, monospace";
          const w = Math.max(88, context.measureText(npc.spec.name).width + 16);
          const x = Math.round(sx + jx) - w / 2;
          const y = Math.round(sy + jy) - (npc.spec.role === "boss" ? 102 : 88);
          context.fillStyle = "rgba(10,10,11,0.9)";
          context.fillRect(x, y, w, 18);
          context.fillStyle = color;
          context.fillRect(x, y, 4, 18);
          context.fillStyle = "#f4f4f5";
          context.fillText(npc.spec.name, x + 10, y + 13);
          context.font = "600 9px ui-monospace, monospace";
          context.fillStyle = color;
          context.fillText(tag, x + 10, y - 3);
          if (npc.spec.role === "boss") {
            context.fillStyle = "#2a2a2e";
            context.fillRect(x, y + 16, w, 5);
            context.fillStyle = color;
            context.fillRect(x, y + 16, w * (npc.hp / Math.max(1, npc.spec.hp)), 5);
          }
        }
        context.restore();

        const target = nearest(state.position);
        if (target !== lastNear) {
          lastNear = target;
          setNear(target);
        }
        node.dataset.x = state.position[0].toFixed(2);
        node.dataset.y = state.position[1].toFixed(2);
        frame = requestAnimationFrame(render);
      };
      frame = requestAnimationFrame(render);
    })().catch(() => {
      if (!abort.signal.aborted) { setFailed(true); setStatus("World or Friend artwork could not load. Check your connection and retry."); }
    });

    return () => {
      abort.abort();
      cancelAnimationFrame(frame);
      movement.stop();
      mover.current = null;
      window.removeEventListener("blur", stopUser);
      document.removeEventListener("visibilitychange", stopUser);
    };
  }, [friendId, world, spawn, revision, lookMode]);

  return (
    <div ref={root} className={`rf-world-view hunt-world${lookMode === "night" ? " hunt-world-night" : ""}`} data-control={control}>
      <div
        className="rf-world-surface hunt-land-frame"
        onPointerDown={(event) => {
          if (paused || status) return;
          canvas.current?.focus({ preventScroll: true });
          const rect = event.currentTarget.getBoundingClientRect();
          const now = viewFor(live.current.zoom);
          mover.current?.moveTo(unproject(
            now.x + ((event.clientX - rect.left) / rect.width) * now.w,
            now.y + ((event.clientY - rect.top) / rect.height) * now.h,
          ));
        }}
        onWheel={(event) => {
          event.preventDefault();
          const next = Math.min(1.9, Math.max(0.7, live.current.zoom + (event.deltaY < 0 ? 0.12 : -0.12)));
          live.current.onZoom?.(Number(next.toFixed(2)));
        }}
      >
        <canvas
          ref={canvas}
          width={WORLD_W}
          height={WORLD_H}
          tabIndex={paused || status ? -1 : 0}
          aria-label="Playable world. WASD or arrows to walk. Tap a destination. Press E near a station or NPC."
          style={{
            width: `${(WORLD_W / view.w) * 100}%`,
            height: `${(WORLD_H / view.h) * 100}%`,
            left: `${(-view.x / view.w) * 100}%`,
            top: `${(-view.y / view.h) * 100}%`,
          }}
        />
        {!status && interactions.map((item) => {
          const [x, y] = project(...item.position);
          const active = near === item.id;
          return (
            <button
              type="button"
              className={active ? "rf-world-prompt rf-world-prompt-near" : "rf-world-prompt"}
              key={item.id}
              style={{
                left: `${((x - view.x) / view.w) * 100}%`,
                top: `${((y + (item.labelOffset ?? 16) - view.y) / view.h) * 100}%`,
              }}
              disabled={paused}
              onPointerDown={(event) => {
                event.stopPropagation();
                canvas.current?.focus({ preventScroll: true });
              }}
              onClick={() => {
                canvas.current?.focus({ preventScroll: true });
                onInteract(item.id);
              }}
            >
              {item.label}
              <small>{active ? "E / tap" : "Tap or walk closer, then E"}</small>
            </button>
          );
        })}
      </div>
      <div
        className="hunt-stick"
        ref={stickRef}
        aria-label="Move stick. Hold and drag."
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          aimStick(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          aimStick(event.clientX, event.clientY);
        }}
        onPointerUp={releaseStick}
        onPointerCancel={releaseStick}
        onLostPointerCapture={releaseStick}
      >
        <span className="hunt-stick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <button
        type="button"
        className="hunt-pad-key hunt-pad-use"
        aria-label="Use"
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => {
          const target = mover.current ? nearest(mover.current.state.position) : null;
          if (target) live.current.onInteract(target);
        }}
      >E</button>
      {status && (
        <div className="rf-world-loading" role={failed ? "alert" : "status"}>
          <p>{status}</p>
          {failed && <button type="button" onClick={() => setRevision((value) => value + 1)}>Retry artwork</button>}
        </div>
      )}
    </div>
  );
}
