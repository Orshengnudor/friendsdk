# Rare Friends Hunt

Walk as your Friend. Spend RF on jobs. Earn **xRF** coupons that cut **40%** off the next **tier upgrade** on the official Generations ladder. Promote is always full RF. Skipping a world burns 1,000 RF per world.

Protocol numbers: [Generations docs](https://rarefriends.com/docs/generations). Every real upgrade/promote still splits **50% burn / 50% rewards**. Hunt spend is the same split. xRF never becomes RF.

---

## Why you play

You already pay RF to climb Gen 6 T0 → Gen 1 T4. Hunt is that climb, with a session in between:

1. Complete a world job → spend **1 RF** → bank **5 xRF**.
2. When xRF ≥ the next **upgrade** list price P, you may upgrade.
3. Upgrade costs **0.60 P RF**. The P xRF is consumed and gone.
4. Want to **promote** (Gen 6→5 etc.)? Pay the official RF in full. xRF does nothing. Remaining xRF stays for the next gen’s upgrades.
5. Want the next island without finishing this job? Burn **1,000 RF × worlds jumped**. Or stay, complete, and Growth carries you for free.

Pocket math at 5 xRF per hunt and 40% off:

- Filling a coupon costs **P / 5** RF in hunts.
- Then you pay **0.60 P**.
- Total out **0.80 P**. You keep **20%** versus clicking upgrade on rarefriends.com with no Hunt.

At 30% the save was 10%. At 20% the save was 0%. **40% is the rate that makes opening Hunt worth it.**

---

## Rules (locked)

| Rule | Value |
|---|---|
| Hunt cost | 1 RF per completed job |
| xRF earned | **5 xRF** per hunt (expected, flat) |
| xRF redeem for RF | **Never** |
| Coupon applies to | **Tier upgrades only** (0→1, 1→2, 2→3, 3→4) |
| Coupon | **Flat 40%** when `xRF ≥ P` |
| xRF spent on upgrade | **P** (1:1 with list price), then gone |
| RF paid on upgrade | **0.60 P** |
| Promote (gen → gen−1) | Official RF, **no coupon**, tier resets to 0 |
| xRF after promote | Kept, used on the new gen’s upgrades |
| Skip world forward | **1,000 RF burned** per world |
| Skip backward | Free |
| Growth advance | Free (finish jobs until Growth crosses the line) |

“Enough xRF” = bank ≥ list price P. Partial banks do **not** take a partial discount. It is flat 40% or nothing.

---

## Official ladder (what Hunt discounts)

Hardwire (make a temp Friend permanent):

| Generation | Hardwire RF |
|---|---|
| 6 | 1 |
| 5 | 10 |
| 4 | 100 |
| 3 | 1,000 |
| 2 | 10,000 |
| 1 | 100,000 |

| Gen | 0→1 | 1→2 | 2→3 | 3→4 | All 4 |
|---|---|---|---|---|---|
| 6 | 0.5 | 0.75 | 1.125 | 1.6875 | 4.0625 |
| 5 | 5 | 7.5 | 11.25 | 16.875 | 40.625 |
| 4 | 50 | 75 | 112.5 | 168.75 | 406.25 |
| 3 | 500 | 750 | 1,125 | 1,687.5 | 4,062.5 |
| 2 | 5,000 | 7,500 | 11,250 | 16,875 | 40,625 |
| 1 | 50,000 | 75,000 | 112,500 | 168,750 | 406,250 |

| Jump | Pay RF | xRF coupon? |
|---|---|---|
| 6 → 5 | 9 | No — full RF |
| 5 → 4 | 90 | No — full RF |
| 4 → 3 | 900 | No — full RF |
| 3 → 2 | 9,000 | No — full RF |
| 2 → 1 | 90,000 | No — full RF |

Promote 6→1 with **no** upgrades: **100,000 RF**.

Max path (hardwire Gen 6, every tier, every promote, through Gen 1 T4): **551,388.4375 RF**.

Hunt never changes those list prices. It only changes what you pay on **upgrade** txs.

---

## Upgrade coupons (40%)

xRF needed = list P. Hunts to fill = ceil(P / 5). Pay after = 0.60 P. Total out = hunts + pay. Saved = P − total.

| Gen | Step | List P (RF) | xRF needed | Hunts to fill | Hunt RF | Pay after 40% | Total out | Saved vs P |
|---|---|---|---|---|---|---|---|---|
| 6 | 0→1 | 0.5 | 0.5 | 1 | 1 | 0.3 | 1.3 | -0.8 |
| 6 | 1→2 | 0.75 | 0.75 | 1 | 1 | 0.45 | 1.45 | -0.7 |
| 6 | 2→3 | 1.125 | 1.125 | 1 | 1 | 0.675 | 1.675 | -0.55 |
| 6 | 3→4 | 1.6875 | 1.6875 | 1 | 1 | 1.0125 | 2.0125 | -0.325 |
| 5 | 0→1 | 5 | 5 | 1 | 1 | 3 | 4 | 1 |
| 5 | 1→2 | 7.5 | 7.5 | 2 | 2 | 4.5 | 6.5 | 1 |
| 5 | 2→3 | 11.25 | 11.25 | 3 | 3 | 6.75 | 9.75 | 1.5 |
| 5 | 3→4 | 16.875 | 16.875 | 4 | 4 | 10.125 | 14.125 | 2.75 |
| 4 | 0→1 | 50 | 50 | 10 | 10 | 30 | 40 | 10 |
| 4 | 1→2 | 75 | 75 | 15 | 15 | 45 | 60 | 15 |
| 4 | 2→3 | 112.5 | 112.5 | 23 | 23 | 67.5 | 90.5 | 22 |
| 4 | 3→4 | 168.75 | 168.75 | 34 | 34 | 101.25 | 135.25 | 33.5 |
| 3 | 0→1 | 500 | 500 | 100 | 100 | 300 | 400 | 100 |
| 3 | 1→2 | 750 | 750 | 150 | 150 | 450 | 600 | 150 |
| 3 | 2→3 | 1,125 | 1,125 | 225 | 225 | 675 | 900 | 225 |
| 3 | 3→4 | 1,687.5 | 1,687.5 | 338 | 338 | 1,012.5 | 1,350.5 | 337 |
| 2 | 0→1 | 5,000 | 5,000 | 1000 | 1000 | 3,000 | 4,000 | 1,000 |
| 2 | 1→2 | 7,500 | 7,500 | 1500 | 1500 | 4,500 | 6,000 | 1,500 |
| 2 | 2→3 | 11,250 | 11,250 | 2250 | 2250 | 6,750 | 9,000 | 2,250 |
| 2 | 3→4 | 16,875 | 16,875 | 3375 | 3375 | 10,125 | 13,500 | 3,375 |
| 1 | 0→1 | 50,000 | 50,000 | 10000 | 10000 | 30,000 | 40,000 | 10,000 |
| 1 | 1→2 | 75,000 | 75,000 | 15000 | 15000 | 45,000 | 60,000 | 15,000 |
| 1 | 2→3 | 112,500 | 112,500 | 22500 | 22500 | 67,500 | 90,000 | 22,500 |
| 1 | 3→4 | 168,750 | 168,750 | 33750 | 33750 | 101,250 | 135,000 | 33,750 |

Read the curve:

- **Gen 6–5:** upgrades are smaller than a hunt. Pay RF. Hunt is for the catalog, not the coupon.
- **Gen 4:** 10–34 hunts per step. This is the on-ramp — a session, then click upgrade at 40% off.
- **Gen 3:** ~100–338 hunts per step. This is why you keep opening Hunt.
- **Gen 2–1:** seasonal / whale farm. Still 40%. You are not skipping 168k RF with a weekend.

Worked Gen 4 T0→T1:

- List **50 RF**.
- Play **10** Hunts (10 RF) → **50 xRF**.
- Upgrade pays **30 RF**, consumes 50 xRF.
- Pocket **40 RF** instead of 50. **Saved 10 RF (20%).**
- Those 10 hunt RF already went 50/50 burn/rewards. The 30 upgrade RF does too.

Worked promote after that:

- You are Gen 4 T1. Promote 4→3 costs **900 RF**, no coupon, even if you have xRF.
- Pay 900. You become Gen 3 T0. xRF bank unchanged.
- Next upgrade is 500 RF list. Fill 500 xRF, pay 300 RF.

---

## World skip

Stay and complete the job → Growth may move you for **0 RF**.

Press Next world / pick a later island without earning it:

cost = (target − current) × **1,000 RF**, all **burned**.

| From → to | Worlds jumped | Burn RF |
|---|---|---|
| 1 → 2 | 1 | 1,000 |
| 1 → 8 | 7 | 7,000 |
| 1 → 14 | 13 | 13,000 |
| 1 → 30 | 29 | 29,000 |
| 11 → 14 | 3 | 3,000 |
| 20 → 30 | 10 | 10,000 |

A Gen 6 cannot skip the tutorial. A Gen 1 whale can teleport. That is the bias.

Prev world is free (walk back).

---

## Growth (still the earned gate)

Completing jobs adds Growth from the catch. Cross the next threshold → next world, free.

Approx thresholds: L2 at 6, L3 at 10, L10 at 36, L21 (Ruler) at 89, L30 at 144.

Hide/chase drain **0.2 Growth/s**. Empty the floor → drop one world.

Skip does not add Growth; it only moves the camera. Drain can still knock you back.

---

## Protocol alignment

| Flow | Player | Supply | Rewards |
|---|---|---|---|
| Hunt 1 RF | −1 RF, +5 xRF | 50% burned | 50% to active Friends |
| Upgrade with coupon | −0.60 P RF, −P xRF | 50% of 0.60 P burned | 50% of 0.60 P |
| Promote | −full official RF | 50% burned | 50% rewards |
| Skip world | −1,000 × Δ RF | **100% burned** | none |

xRF is off-chain (or Friend-bound) and dies on use. It cannot be sold. That is why Hunt is not SLP.

---

## Why 40%, not 30%

Need **discount > 1 / 5** or the hunt cost eats the coupon.

| Discount | Hunt RF to fill P=100 | Pay | Total | Saved |
|---|---|---|---|---|
| 20% | 20 | 80 | 100 | **0** |
| 30% | 20 | 70 | 90 | 10% |
| **40%** | 20 | 60 | 80 | **20%** |

40% is the number that makes “I’ll hunt before I upgrade” the default at Gen 4+.

---

## One file per world

`catalog/L01.ts` … `L30.ts` — land, stations, NPCs. Edit one world without touching the others.

---

## Preview vs live

This drop simulates xRF, gen/tier, coupons, and skip burns locally. Live wiring spends real RF on Hunt + discounted upgrade txs against the Generations contracts. Until then, every RF figure in the HUD is a session simulation.
