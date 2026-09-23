"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import { GameMenu } from "@rarefriends/friendsdk/frame";
import { formatGameAmount } from "@rarefriends/friendsdk/ui";
import { maximumPrize, type GameSnapshot, type GamePlay } from "@rarefriends/friendsdk/game";
import { createFriendSoundKit, type FriendSoundKit, type FriendSoundCue } from "@rarefriends/friendsdk/sounds";
import "@rarefriends/friendsdk/frame.css";
import "@rarefriends/friendsdk/world-view.css";
import "./style.css";
import { LEVEL_COUNT, ERA_NAMES, eraForLevel, levelForGrowth, growthForLevel, GROWTH_BY_OUTCOME, type LookMode } from "./levels";
import { generateLevel } from "./generate";
import { HuntWorld, type NpcEvent } from "./HuntWorld";
import { relicFor } from "./npcs";
import {
  MAX_TIER,
  SKIP_RF_PER_WORLD,
  TIMER_FAIL_GROWTH,
  UPGRADE_DISCOUNT,
  XRF_PER_HUNT,
  canCoupon,
  formatRfAmount,
  genLabel,
  promoteListPrice,
  skipCost,
  upgradeListPrice,
  upgradePayRf,
  xrfForHunt,
  xrfNeeded,
} from "./economy";

type Menu = "prep" | "action" | "inventory" | "settings" | "reward" | "talk" | "ladder" | "jump" | null;
const rf = (value: bigint) => `${formatGameAmount(value, 18)} RF`;
const LOOKS: LookMode[] = ["color", "ink", "night"];
const LOOK_LABEL: Record<LookMode, string> = { color: "Color", ink: "Ink", night: "Night" };

export default function Hunt({ friendId, client, paused }: GameComponentProps) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null), [menu, setMenu] = useState<Menu>(null);
  const [result, setResult] = useState<GamePlay | null>(null), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true), [reducedMotion, setReducedMotion] = useState(false);
  const [look, setLook] = useState<LookMode>("color");
  const [lifetimeBurned, setLifetimeBurned] = useState(0n);
  const [growth, setGrowth] = useState(0);
  const [playLevel, setPlayLevel] = useState(1);
  const [resetToken, setResetToken] = useState(0);
  const [extraReturned, setExtraReturned] = useState(0);
  const [buyQty, setBuyQty] = useState(1);
  const [hudOpen, setHudOpen] = useState(false);
  const [jobAccepted, setJobAccepted] = useState(false);
  const [relics, setRelics] = useState<string[]>([]);
  const [sequence, setSequence] = useState<string[] | null>(null);
  const [sequenceStep, setSequenceStep] = useState(0);
  const [sequenceDeadline, setSequenceDeadline] = useState<number | null>(null);
  const [veinHint, setVeinHint] = useState("");
  const [dashArmed, setDashArmed] = useState(false);
  const dashArmedRef = useRef(false);
  const [gathered, setGathered] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [bossHp, setBossHp] = useState<{ hp: number; max: number } | null>(null);
  const [draining, setDraining] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [xrf, setXrf] = useState(0);
  const [gen, setGen] = useState(6);
  const [tier, setTier] = useState(0);
  const [extraSpent, setExtraSpent] = useState(0);
  const sound = useRef<FriendSoundKit | null>(null), locked = useRef(false), epoch = useRef(0);
  const completeRef = useRef<() => void>(() => {});
  const exposedRef = useRef(false);
  const pressureRef = useRef(false);
  const live = useRef({ paused, busy, menu });
  live.current = { paused, busy, menu };
  const definition = client.definition;

  useEffect(() => {
    const version = ++epoch.current;
    sound.current = createFriendSoundKit({ muted: true });
    setSnapshot(null); setMenu(null); setResult(null); setError(""); setMessage(""); setBusy(false); setMuted(true);
    setLifetimeBurned(0n); setGrowth(0); setPlayLevel(1); setResetToken(0); setExtraReturned(0); locked.current = false;
    setXrf(0); setGen(6); setTier(0); setExtraSpent(0);
    void client.read().then(value => { if (version === epoch.current) setSnapshot(value); }).catch(cause => {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "Could not load the preview.");
    });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches); update(); preference.addEventListener("change", update);
    return () => { epoch.current++; sound.current?.dispose(); sound.current = null; preference.removeEventListener("change", update); };
  }, [client, friendId]);

  const level = playLevel;
  const current = generateLevel(level, friendId.toString());
  const eraName = ERA_NAMES[current.era];

  function resetPuzzleForRetry() {
    setVeinHint("");
    dashArmedRef.current = false;
    setDashArmed(false);
    setGathered([]);
    setJobAccepted(false);
    exposedRef.current = false;
    pressureRef.current = false;
    setDraining(false);
    const bosses = current.npcs.filter(n => n.role === "boss");
    const maxHp = bosses.reduce((sum, n) => sum + n.hp, 0);
    setBossHp(bosses.length ? { hp: maxHp, max: maxHp } : null);
    const timer = current.task.timerMs;
    setResetToken(value => value + 1);
    if (current.mechanic === "sequence" || (current.mechanic === "job" && current.task.failOnWrong)) {
      const order = current.sequenceNodes.map(node => node.id);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      setSequence(order); setSequenceStep(0); setSequenceDeadline(current.mechanic === "job" ? null : (timer ? Date.now() + timer : null));
    } else if (current.mechanic === "escort" || current.mechanic === "arm" || current.mechanic === "gather" || current.mechanic === "job") {
      setSequence(current.sequenceNodes.map(node => node.id)); setSequenceStep(0);
      setSequenceDeadline(current.mechanic === "job" ? null : (timer ? Date.now() + timer : null));
    } else if (current.mechanic === "hide" || current.mechanic === "chase" || current.mechanic === "dash" || current.mechanic === "vein" || current.mechanic === "cast") {
      setSequence(null); setSequenceStep(0); setSequenceDeadline(timer ? Date.now() + timer : null);
    } else { setSequence(null); setSequenceStep(0); setSequenceDeadline(null); }
  }
  useEffect(resetPuzzleForRetry, [playLevel, current.mechanic]);
  useEffect(() => {
    const id = setInterval(() => {
      const time = Date.now();
      setNow(time);
      setSequenceDeadline(deadline => {
        if (deadline === null) return deadline;
        if (time <= deadline) return deadline;
        if (current.mechanic === "hide" || current.mechanic === "chase") {
          window.setTimeout(() => completeRef.current(), 0);
          return null;
        }
        dashArmedRef.current = false;
        setDashArmed(false);
        setGrowth(value => Math.max(0, Math.round((value - TIMER_FAIL_GROWTH) * 1000) / 1000));
        setError(`Time up. Growth −${TIMER_FAIL_GROWTH}. Try this world again.`);
        window.setTimeout(() => resetPuzzleForRetry(), 0);
        return null;
      });
    }, 200);
    return () => clearInterval(id);
  }, [current.mechanic, current.task.timerMs, level]);

  useEffect(() => {
    if (current.mechanic !== "hide" && current.mechanic !== "chase") return;
    const id = window.setInterval(() => {
      if (!pressureRef.current || menu) return;
      setGrowth(value => {
        const next = Math.max(0, Math.round((value - 0.05) * 1000) / 1000);
        const after = levelForGrowth(next);
        if (after < playLevel) {
          pressureRef.current = false;
          exposedRef.current = false;
          setDraining(false);
          setPlayLevel(Math.max(1, after));
          setError(`Caught in range too long. Dropped to world ${Math.max(1, after)}. Growth stays ${next.toFixed(1)}.`);
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [current.mechanic, menu, playLevel]);

  async function act(work: () => Promise<void>, cue?: FriendSoundCue, after?: () => void, onError?: () => void) {
    if (locked.current || paused) return;
    const version = epoch.current; locked.current = true; setBusy(true); setError(""); setMessage(""); void sound.current?.unlock();
    try { await work(); const value = await client.read(); if (version === epoch.current) { setSnapshot(value); if (cue) sound.current?.play(cue); after?.(); } }
    catch (cause) { if (version === epoch.current) { setError(cause instanceof Error ? cause.message : "The preview action failed."); onError?.(); } }
    finally { if (version === epoch.current) { locked.current = false; setBusy(false); } }
  }
  function afterHunt(settled: GamePlay) {
    if (!settled.outcomeId) return;
    const caught = definition.outcomes[settled.outcomeId - 1];
    if (!caught) return;
    const gained = xrfForHunt(level);
    const before = playLevel;
    const earnedBefore = levelForGrowth(growth);
    const nextGrowth = growth + (GROWTH_BY_OUTCOME[caught.name] ?? 0);
    const earnedAfter = levelForGrowth(nextGrowth);
    setLifetimeBurned(total => total + (definition.price - caught.reward));
    setXrf(value => Math.round((value + gained) * 1000) / 1000);
    setGrowth(nextGrowth);
    if (earnedAfter > earnedBefore && playLevel === earnedBefore) setPlayLevel(earnedAfter);
    setResult(settled); setMenu("reward");
    if (current.task.relic) {
      const boss = current.npcs.find(n => n.role === "boss");
      const relic = relicFor(level, boss?.name ?? "Hunt");
      setRelics(list => [`${relic.name} · L${level}`, ...list].slice(0, 24));
    }
    setMessage(earnedAfter !== earnedBefore && playLevel === before
      ? (eraForLevel(earnedAfter) !== eraForLevel(earnedBefore) ? `You have entered the ${ERA_NAMES[eraForLevel(earnedAfter)]} era. World ${earnedAfter}.` : `World ${earnedAfter}.`)
      : `+${gained} xRF. Growth ${nextGrowth.toFixed(1)}.`);
    window.setTimeout(() => resetPuzzleForRetry(), 0);
  }
  function pickOutcomeId() {
    let ticket = Math.floor(Math.random() * 10_000);
    let index = 0;
    for (const item of definition.outcomes) {
      index += 1;
      if (ticket < item.chanceBps) return index;
      ticket -= item.chanceBps;
    }
    return 1;
  }
  function completeTask() {
    if (locked.current || paused) return;
    const local = { id: `sim-${Date.now()}`, outcomeId: pickOutcomeId() } as GamePlay;
    void act(async () => {
      const version = epoch.current;
      try {
        await client.buy(1n);
        const [play] = await client.play(1n);
        const settled = await client.settle(play.id);
        if (version === epoch.current && settled.outcomeId) {
          spendLocal(1);
          afterHunt(settled);
          return;
        }
      } catch { /* preview backing often runs dry on later worlds — still pay the player */ }
      if (version === epoch.current) {
        spendLocal(1);
        afterHunt(local);
      }
    }, "reveal-common");
  }
  completeRef.current = completeTask;

  function tryAdvanceSequence(id: string) {
    if (!sequence) return;
    const labelOf = (nodeId: string) => current.sequenceNodes.find(node => node.id === nodeId)?.label ?? nodeId;
    if (id === sequence[sequenceStep]) {
      const next = sequenceStep + 1;
      setSequenceStep(next);
      setError("");
      if (next >= sequence.length) { setSequenceDeadline(null); completeTask(); }
      else setMessage(`${labelOf(id)} done. Next is ${labelOf(sequence[next])}.`);
    } else if (current.task.failOnWrong) {
      const order = current.sequenceNodes.map(node => node.id);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      setSequence(order); setSequenceStep(0);
      setSequenceDeadline(current.task.timerMs ? Date.now() + current.task.timerMs : null);
      setError("Wrong mark. The order reset.");
    } else {
      setError(`Not yet. Next is ${labelOf(sequence[sequenceStep])}.`);
    }
  }
  function tryVein(id: string) {
    const guess = Number(id.split("-")[1]);
    if (guess === current.trueVeinIndex) { completeTask(); return; }
    if (current.task.hint === "none") { setVeinHint("Not this one."); return; }
    const guessPos = current.veinNodes.find(node => node.id === id)?.position;
    const truePos = current.veinNodes.find(node => node.id === `vein-${current.trueVeinIndex}` || node.id === `cast-${current.trueVeinIndex}`)?.position;
    if (!guessPos || !truePos) return;
    const distance = Math.hypot(guessPos[0] - truePos[0], guessPos[1] - truePos[1]);
    setVeinHint(distance < 90 ? "Scalding hot, very close." : distance < 180 ? "Warm." : "Ice cold.");
  }
  function tryCast(id: string) {
    const guess = Number(id.split("-")[1]);
    if (guess === current.trueVeinIndex) { completeTask(); return; }
    setVeinHint("No bite. Try another hole.");
  }
  function tryDash(id: string) {
    if (id === "dash-start") {
      dashArmedRef.current = true;
      setDashArmed(true);
      setSequenceDeadline(Date.now() + (current.task.timerMs ?? 24_000));
      setMessage(`Dash armed. Reach ${current.task.nodeLabels[1] ?? "the finish"}.`);
      return;
    }
    if (id === "dash-finish") {
      if (!dashArmedRef.current) { setError("Tag the start first, then the finish."); return; }
      if (sequenceDeadline !== null && Date.now() > sequenceDeadline) {
        dashArmedRef.current = false;
        setDashArmed(false);
        setError("Too slow. Tag start and run it again.");
        return;
      }
      dashArmedRef.current = false;
      setDashArmed(false);
      setSequenceDeadline(null);
      completeTask();
    }
  }
  function tryEscort(id: string) {
    if (!sequence) return;
    if (id === sequence[sequenceStep]) {
      const next = sequenceStep + 1;
      setSequenceStep(next);
      if (next >= sequence.length) completeTask();
    }
  }
  function tryGather(id: string) {
    if (gathered.includes(id)) return;
    const next = [...gathered, id];
    setGathered(next);
    if (next.length >= current.sequenceNodes.length) completeTask();
  }
  function tryArm(id: string) {
    if (id === "arm-0") { dashArmedRef.current = true; setDashArmed(true); setMessage("Armed. Finish the second station."); return; }
    if (id === "arm-1") {
      if (!dashArmedRef.current) { setError("Arm the first station first."); return; }
      dashArmedRef.current = false;
      setDashArmed(false); completeTask();
    }
  }
  function onInteract(id: string) {
    if (id === "npc-0") { setMenu("talk"); return; }
    if (id.startsWith("seq-")) return tryAdvanceSequence(id);
    if (id.startsWith("vein-")) return tryVein(id);
    if (id.startsWith("cast-")) return tryCast(id);
    if (id.startsWith("dash-")) return tryDash(id);
    if (id.startsWith("escort-")) return tryEscort(id);
    if (id.startsWith("gather-")) return tryGather(id);
    if (id.startsWith("arm-")) return tryArm(id);
    if (id === "prep") setMenu("prep");
    if (id === "action") setMenu("action");
  }
  function onNpcEvent(event: NpcEvent) {
    if (menu) return;
    if (event.type === "pressure") {
      pressureRef.current = event.active;
      setDraining(event.active);
      if (event.active) setMessage("In range — growth draining 0.2/s. Move.");
      else setMessage("Clear. Keep walking.");
      return;
    }
    if (event.type === "spotted" && current.mechanic === "hide") exposedRef.current = true;
    if (event.type === "clear" && current.mechanic === "hide") exposedRef.current = false;
    if (event.type === "caught" && current.mechanic === "chase") setError("In their reach. Growth is draining.");
    if (event.type === "hit") setBossHp({ hp: event.hp, max: event.max });
    if (event.type === "down") { setBossHp({ hp: 0, max: event.max }); completeTask(); }
  }
  function stepWorld(delta: number) {
    const next = Math.min(LEVEL_COUNT, Math.max(1, playLevel + delta));
    if (next <= playLevel) {
      setPlayLevel(next);
      setMessage(`World ${next}. Growth stays ${growth.toFixed(1)}.`);
      return;
    }
    setMenu("jump");
  }
  const wei = (n: number) => BigInt(Math.round(n * 10_000)) * (10n ** 14n);
  const PREVIEW_WALLET = 100_000;
  const shownRf = (() => {
    const base = wei(PREVIEW_WALLET);
    const spent = wei(extraSpent);
    const back = wei(extraReturned);
    const n = base + back;
    return n > spent ? n - spent : 0n;
  })();
  function spendLocal(amount: number) {
    setExtraSpent(value => value + amount);
    setLifetimeBurned(total => total + wei(amount));
  }
  function tryUpgrade() {
    const list = upgradeListPrice(gen, tier);
    if (list == null) { setError(gen === 1 && tier >= MAX_TIER ? "This Friend is maxed." : "Max this generation, then promote."); return; }
    if (!canCoupon(xrf, list)) { setError(`Need ${formatRfAmount(xrfNeeded(list))} xRF for the 40% coupon.`); return; }
    const pay = upgradePayRf(list);
    if (shownRf < wei(pay)) { setError("Not enough simulated RF for the discounted upgrade."); return; }
    setXrf(value => Math.round((value - xrfNeeded(list)) * 10000) / 10000);
    spendLocal(pay);
    setTier(value => value + 1);
    setMessage(`Upgraded to T${tier + 1}. Paid ${formatRfAmount(pay)} RF (40% off).`);
    setError("");
  }
  function tryPromote() {
    const list = promoteListPrice(gen);
    if (list == null) { setError("Generation 1 does not promote."); return; }
    if (shownRf < wei(list)) { setError(`Promote costs ${formatRfAmount(list)} RF. No coupon.`); return; }
    spendLocal(list);
    setGen(value => value - 1);
    setTier(0);
    setMessage(`Promoted to Gen ${gen - 1} T0. xRF kept.`);
    setError("");
  }
  function jumpTo(target: number) {
    const cost = skipCost(level, target);
    if (cost > 0 && shownRf < wei(cost)) { setError(`Need ${cost.toLocaleString()} RF burned to jump.`); return; }
    if (cost > 0) spendLocal(cost);
    setPlayLevel(target);
    setMenu(null);
    setMessage(cost > 0 ? `Jumped to world ${target}. ${cost.toLocaleString()} RF burned. Growth stays ${growth.toFixed(1)}.` : `World ${target}. Growth stays ${growth.toFixed(1)}.`);
  }
  function buyCharms() {
    const n = Math.max(1, Math.min(50, Math.floor(buyQty) || 1));
    if (shownRf < wei(n) || busy || paused) return;
    void act(async () => {
      try { await client.buy(BigInt(n)); } catch { /* session wallet still debit */ }
    }, "purchase", () => {
      spendLocal(n);
      setMessage(`${n} charm${n === 1 ? "" : "s"} bought · −${n} RF`);
    });
  }
  function redeemCatch() {
    const play = result;
    const row = play?.outcomeId ? definition.outcomes[play.outcomeId - 1] : null;
    if (!play?.outcomeId || !row) return;
    void act(async () => {
      try { await client.redeem(play.outcomeId!, 1n); } catch { /* still credit the wallet */ }
      setExtraReturned(value => value + Number(row.reward) / 1e18);
    }, "reward", () => setMenu("inventory"));
  }
  function redeemItem(index: number, reward: bigint) {
    void act(async () => {
      try { await client.redeem(index + 1, 1n); } catch { /* still credit */ }
      setExtraReturned(value => value + Number(reward) / 1e18);
    }, "reward");
  }
  const navigate = (next: Menu) => { if (!busy && !paused) { setMenu(next); setError(""); } };
  const feedback = <p role={error ? "alert" : "status"}>{error || message || (busy ? "Waiting for preview confirmation…" : "Simulated RF and outcomes.")}</p>;
  if (!snapshot) return <div className="starter-loading" role={error ? "alert" : "status"}>{error || "Loading game…"}</div>;
  if (snapshot.friendId !== friendId) return <p role="alert">This game session does not match the selected Friend.</p>;
  const maxPrize = maximumPrize(definition);
  const qty = Math.max(1, Math.min(50, Math.floor(buyQty) || 1));
  const qtyCost = definition.price * BigInt(qty);
  const canBuy = shownRf >= qtyCost;
  const pending = snapshot.plays.find(play => play.outcomeId === null);
  const outcome = result?.outcomeId ? definition.outcomes[result.outcomeId - 1] : null;
  const count = snapshot.inventory.reduce((total, amount) => total + amount, 0n);
  const worldInteractions = current.mechanic === "job" && jobAccepted ? current.sequenceNodes : current.interactions;
  const lead = current.npcs[0];
  const menuTitle = menu === "prep" ? current.prepInteraction?.label ?? "Charm bench"
    : menu === "action" ? current.actionInteraction?.label ?? "Hunt"
    : menu === "reward" ? "Your catch" : menu === "inventory" ? "Trophies" : menu === "talk" ? lead?.name ?? "Talk"
    : menu === "ladder" ? "Upgrade ladder" : menu === "jump" ? "Jump world" : "Settings";
  const seconds = sequenceDeadline ? Math.max(0, Math.ceil((sequenceDeadline - now) / 1000)) : null;
  const trophySlow = Math.min(0.35, Number(count) * 0.04);

  return <section className={`starter-game${draining ? " hunt-danger" : ""}`} data-theme={look} aria-label={definition.name} aria-busy={busy}>
    <div className="starter-world" inert={Boolean(menu) || paused || undefined} data-era={current.era} data-level={level}>
      <div className="hunt-canvas">
        <HuntWorld
          key={`${playLevel}`}
          resetToken={resetToken}
          friendId={friendId}
          world={current.world}
          spawn={current.spawn}
          interactions={worldInteractions}
          npcs={current.npcs}
          lookMode={look}
          paused={Boolean(menu) || paused}
          reducedMotion={reducedMotion}
          chaseSlow={trophySlow}
          zoom={zoom}
          onZoom={setZoom}
          onInteract={onInteract}
          onNpcEvent={onNpcEvent}
        />
      </div>
      <div className="starter-hud" data-open={hudOpen || undefined}>
        <button type="button" className="hunt-menu-btn" aria-label="More stats" aria-expanded={hudOpen} onClick={() => setHudOpen(value => !value)}>☰</button>
        <span className="hunt-mobile-only">{level}/{LEVEL_COUNT}</span>
        <span className="hunt-desktop-summary">{current.world.name} · {eraName} {level}/{LEVEL_COUNT} · {rf(shownRf)}</span>
        <span className="hunt-burned hunt-hud-fold" title="Simulated, local statistic">Lifetime burned · {rf(lifetimeBurned)}</span>
        <span className="hunt-growth" data-drain={draining || undefined}>Growth · {growth.toFixed(1)}</span>
        <button type="button" className="hunt-hud-fold" onClick={() => navigate("ladder")}>{genLabel(gen, tier)}</button>
        <button type="button" onClick={() => navigate("ladder")}>{formatRfAmount(xrf)} xRF</button>
        <button type="button" className="hunt-hud-fold" onClick={() => navigate("inventory")}>Inventory · {count.toString()}</button>
        <button type="button" className="hunt-mobile-only hunt-hud-fold" disabled={level <= 1} onClick={() => stepWorld(-1)}>Prev world</button>
        <button type="button" className="hunt-mobile-only hunt-hud-fold" disabled={level >= LEVEL_COUNT} onClick={() => stepWorld(1)}>Next world · {SKIP_RF_PER_WORLD.toLocaleString()} RF</button>
      </div>
      <div className="hunt-task-banner" role="status">
        <p><strong>{current.task.title}</strong> · {current.task.brief} · spends {rf(definition.price)}</p>
        {lead && <p>{lead.name} · {lead.role === "giver" ? "Job giver — talk first" : lead.role === "boss" ? `Boss · ram to hit${bossHp ? ` · ${bossHp.hp}/${bossHp.max}` : ""}` : lead.role === "patrol" ? "Watching" : "Chasing"}</p>}
        {current.islandCount > 1 && <p>{current.islandCount} islands · stations sit on separate shores. Use the land bridges.</p>}
        {seconds !== null && <p className="hunt-timer">{seconds}s left</p>}
        {current.mechanic === "hide" && <p>{current.npcs.length} watching. Stay out of the yellow rings. Inside one, growth drains 0.2/s.</p>}
        {current.mechanic === "chase" && <p>{current.npcs.length} chasing — they hunt you even if you stand still. Survive the clock. {seconds !== null ? `${seconds}s` : "Clock live"}.</p>}
        {current.mechanic === "fight" && <p>{current.npcs.filter(n => n.role === "boss").length} boss{current.npcs.filter(n => n.role === "boss").length === 1 ? "" : "es"} · ram each until the bar is empty{bossHp ? ` · ${bossHp.hp}/${bossHp.max}` : ""}</p>}
        {current.mechanic === "job" && !jobAccepted && <p>Talk to {lead?.name ?? "the NPC"} to start the job.</p>}
        {(current.mechanic === "sequence" || current.mechanic === "escort" || (current.mechanic === "job" && jobAccepted && current.sequenceNodes.some(node => node.id.startsWith("seq-")))) && sequence && <ol>{sequence.map((id, index) => <li key={id} data-done={index < sequenceStep || undefined}>{current.sequenceNodes.find(node => node.id === id)?.label ?? id}</li>)}</ol>}
        {(current.mechanic === "gather" || (current.mechanic === "job" && jobAccepted && !current.sequenceNodes.some(node => node.id.startsWith("seq-")))) && <ol>{current.sequenceNodes.map(node => <li key={node.id} data-done={gathered.includes(node.id) || undefined}>{node.label}</li>)}</ol>}
        {current.mechanic === "dash" && <p>{dashArmed ? "Run to the finish." : "Tag the start first."}</p>}
        {current.mechanic === "arm" && <p>{dashArmed ? "Second station is live." : "Arm the first station."}</p>}
        {veinHint && <p>{veinHint}</p>}
      </div>
      <div className="hunt-help-dock">
        <div className="hunt-zoom" role="group" aria-label="Zoom">
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setZoom(value => Math.max(0.7, Number((value - 0.15).toFixed(2))))}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setZoom(value => Math.min(1.9, Number((value + 0.15).toFixed(2))))}>+</button>
        </div>
        <button type="button" onClick={() => navigate("settings")}>Settings</button>
        <p className="starter-hint"><span className="starter-desktop-hint">WASD / arrows to walk · Tap a destination · E near a station or NPC · scroll to zoom</span><span className="starter-mobile-hint">Tap to walk · E / tap near a station</span></p>
      </div>
      <div className="hunt-preview-dock">
        <button type="button" disabled={level <= 1} onMouseDown={event => event.preventDefault()} onClick={() => stepWorld(-1)}>Prev world</button>
        <button type="button" disabled={level >= LEVEL_COUNT} onMouseDown={event => event.preventDefault()} onClick={() => stepWorld(1)}>Next world · {SKIP_RF_PER_WORLD.toLocaleString()} RF</button>
      </div>
    </div>
    {menu && <GameMenu title={menuTitle ?? ""} onClose={busy ? undefined : () => navigate(null)}>
      {menu === "talk" && lead ? <>
        <p>{lead.line}</p>
        <button type="button" className="rf-frame-primary" onClick={() => {
          setJobAccepted(true);
          setMenu(null);
          if (current.task.timerMs) setSequenceDeadline(Date.now() + current.task.timerMs);
          setMessage(`Job accepted. Walk the marks${current.task.timerMs ? ` — ${Math.round(current.task.timerMs / 1000)}s` : ""}. E or tap each card.`);
        }}>Accept job</button>
      </> : menu === "prep" ? <>
        <p>Charms cost {rf(definition.price)} each. Type how many RF-worth to buy, then hunt.</p>
        <label>Amount <input type="number" min={1} max={50} value={qty} onChange={event => setBuyQty(Number(event.target.value))} /></label>
        <p>{qty} charm{qty === 1 ? "" : "s"} · {rf(qtyCost)}</p>
        <table><thead><tr><th>Catch</th><th>Chance</th><th>Value</th></tr></thead><tbody>{definition.outcomes.map(item => <tr key={item.name}><td>{item.name}</td><td>{item.chanceBps / 100}%</td><td>{rf(item.reward)}</td></tr>)}</tbody></table>
        <button type="button" className="rf-frame-primary" disabled={!canBuy || busy || paused} onClick={buyCharms}>Buy {qty} · {rf(qtyCost)}</button>
        {!canBuy && <p>Not enough RF on the session wallet.</p>}
      </> : menu === "action" ? <>
        <p>{snapshot.consumables.toString()} ready. One attempt consumes one charm.</p>
        <p>Level {level} of {LEVEL_COUNT}, {eraName} era. Next level at {growthForLevel(level + 1) ?? "max"} growth.</p>
        <button type="button" className="rf-frame-primary" disabled={busy || paused || !pending && snapshot.consumables === 0n}
          onClick={() => void act(async () => { const [play] = pending ? [pending] : await client.play(1n); const settled = await client.settle(play.id); afterHunt(settled); }, "reveal-common")}>
          {pending ? "Finish pending attempt" : "Go"}
        </button>
        {snapshot.consumables === 0n && !pending && <p>Buy charms first, or finish the level task.</p>}
      </> : menu === "reward" && outcome ? <div className="starter-reward">
        <span aria-hidden="true">◇</span><h3>{outcome.name}</h3><p>{rf(outcome.reward)} · {outcome.chanceBps / 100}% chance</p>
        {current.task.relic && <p>Boss relic added to your local trophies.</p>}
        <p>+{xrfForHunt(level)} xRF banked this hunt (5 × world {level}). Coupons cut 40% off the next tier upgrade.</p>
        <p>This simulated trophy is already in your Friend's inventory.</p>
        <button type="button" disabled={busy || paused} onClick={() => navigate(null)}>Keep trophy</button>
        {outcome.reward > 0n && <button type="button" disabled={busy || paused} onClick={redeemCatch}>Redeem · {rf(outcome.reward)}</button>}
      </div> : menu === "inventory" ? <>
        <p>Kept trophies retain their fixed value with no expiry. Relics from boss fights sit with them.</p>
        {relics.length > 0 && <ul>{relics.map(item => <li key={item}>{item}</li>)}</ul>}
        {definition.outcomes.map((item, index) => <div className="starter-item" key={item.name}><span><strong>{item.name}</strong><small>{snapshot.inventory[index].toString()} owned · {rf(item.reward)}</small></span>
          <button type="button" disabled={busy || paused || snapshot.inventory[index] === 0n || item.reward === 0n} onClick={() => redeemItem(index, item.reward)}>Redeem one</button></div>)}
      </> : menu === "settings" ? <>
        <button type="button" aria-pressed={!muted} onClick={() => { const next = !muted; setMuted(next); sound.current?.setMuted(next); if (!next) void sound.current?.unlock(); }}>{muted ? "Sound off" : "Sound on"}</button>
        <p className="hunt-kicker">Look</p>
        <div className="hunt-look-row">
          {LOOKS.map(mode => (
            <button key={mode} type="button" aria-pressed={look === mode} onClick={() => setLook(mode)}>{LOOK_LABEL[mode]}</button>
          ))}
        </div>
        <p>Color paints the land with the GAME_PALETTE. Ink is the official black/white cut. Night tints the same world.</p>
        <label><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} /> Reduce motion</label>
        <h3>Why you play</h3>
        <p>A clear spends 1 RF and banks 5 × the world number in xRF. World 1 pays 5. World 30 pays 150. When your xRF covers the next tier’s list price, that upgrade is 40% off and the xRF is destroyed. Promotion is always full price. xRF never turns back into RF. Finish the job and Growth moves you for free. Skipping a world burns 1,000 RF for each world you jump.</p>
        <h3>How to play</h3>
        <ol className="hunt-how">
          <li>On a phone, hold the stick on the right and drag it any direction. E is the black button on the left.</li>\n          <li>On a computer, WASD or the arrows walk. The world stays still.</li>
          <li>Walk onto a station until it turns green, then press E (or tap the card).</li>
          <li>Zoom with − / + or the mouse wheel until the land feels right.</li>
          <li>Each finished hunt spends 1 RF and banks {XRF_PER_HUNT} xRF.</li>
          <li>xRF is a flat 40% coupon on tier upgrades only. Promote is full RF. xRF is never cash.</li>
          <li>Next world without finishing the job burns {SKIP_RF_PER_WORLD.toLocaleString()} RF per world skipped.</li>
          <li>From L7, NPCs give jobs, hide, chase, or fight. Talk first on job worlds.</li>
          <li>Boss worlds: the boss runs. Chase and ram it until the bar is empty.</li>
          <li>Stand in a watch ring or a chaser's reach and growth drains 0.2 every second. Empty it and you drop a world.</li>
          <li>Color / Ink / Night lives here.</li>
        </ol>
        <p>All economy actions, Lifetime burned, Growth and level are simulated and local to this session. Reloading resets this preview.</p>
      </> : menu === "ladder" ? <>
        <p>{genLabel(gen, tier)} · {formatRfAmount(xrf)} xRF. Flat {(UPGRADE_DISCOUNT * 100).toFixed(0)}% off <strong>tier upgrades only</strong>. Promote is full RF.</p>
        {(() => {
          const list = upgradeListPrice(gen, tier);
          if (list == null) return <p>This generation is at T{MAX_TIER}. Promote to keep climbing.</p>;
          const pay = upgradePayRf(list);
          const ready = canCoupon(xrf, list);
          return <div className="starter-item"><span><strong>Upgrade T{tier} → T{tier + 1}</strong><small>List {formatRfAmount(list)} RF · need {formatRfAmount(xrfNeeded(list))} xRF · pay {formatRfAmount(pay)} RF</small></span>
            <button type="button" className="rf-frame-primary" disabled={!ready || shownRf < wei(pay)} onClick={tryUpgrade}>{ready ? `Upgrade · ${formatRfAmount(pay)} RF` : `Need ${formatRfAmount(list)} xRF`}</button></div>;
        })()}
        {(() => {
          const list = promoteListPrice(gen);
          if (list == null) return null;
          return <div className="starter-item"><span><strong>Promote Gen {gen} → {gen - 1}</strong><small>Full {formatRfAmount(list)} RF · no xRF · tier resets to 0</small></span>
            <button type="button" disabled={shownRf < wei(list)} onClick={tryPromote}>Promote · {formatRfAmount(list)} RF</button></div>;
        })()}
      </> : menu === "jump" ? <>
        <p>Stay and finish the job to move with Growth for free. Jumping ahead burns {SKIP_RF_PER_WORLD.toLocaleString()} RF per world.</p>
        <div className="hunt-jump-list">
        {Array.from({ length: LEVEL_COUNT - level }, (_, i) => {
          const n = level + i + 1;
          const cost = skipCost(level, n);
          return <button key={n} type="button" disabled={shownRf < wei(cost)} onClick={() => jumpTo(n)}>World {n} · burn {cost.toLocaleString()} RF</button>;
        })}
        </div>
      </> : null}{feedback}
    </GameMenu>}
  </section>;
}
