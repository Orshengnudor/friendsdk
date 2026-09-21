# How to submit Rare Friends Hunt

FriendSDK is **how the game runs**. It is **not** how you submit.

The vibeathon wants a **GitHub pull request**, not a Vercel-only deploy and not “upload the friendsdk folder.”

Official rules: [spokesz/rarefriends-vibeathon](https://github.com/spokesz/rarefriends-vibeathon#how-to-submit)  
Example (SDK game + hosted demo): [Steal An Egg #24](https://github.com/spokesz/rarefriends-vibeathon/pull/24)  
Example (SDK, run locally): [Fishing #1](https://github.com/spokesz/rarefriends-vibeathon/pull/1)

Cutoff: **30 September 2026**.

---

## Two pieces you need

| Piece | What it is | Where it lives |
|---|---|---|
| **1. Source repo** | Your Hunt code | Your GitHub (`you/rarefriends-hunt` or a `friendsdk` fork with `games/hunt`) |
| **2. Submission PR** | One README the judges read | PR on `spokesz/rarefriends-vibeathon` adding `submissions/rarefriends-hunt/README.md` |

Vercel (or GitHub Pages) is only the **playable preview link** inside that README. You can use Vercel. You cannot skip the GitHub PR.

---

## Path A — FriendSDK game (recommended for this Hunt)

This is the path we built for: wallet, Friend picker, 1 RF Hunt txs, original Friend art.

1. Put `games/hunt/` (everything in this drop) into a **FriendSDK** repo.
   - Either fork [spokesz/friendsdk](https://github.com/spokesz/friendsdk) and copy `games/hunt` in, **or**
   - Keep your own repo and clone friendsdk, then `games/hunt` as the game (see Friends-Arena #2).
2. Push that repo to **your** GitHub. Public.
3. Host a playable build:
   - **GitHub Pages:** `npx friendsdk build` (Steal An Egg did this), or
   - **Vercel:** root = the friendsdk project, build = the SDK web build, env as the SDK docs say.
4. Open a PR on [rarefriends-vibeathon](https://github.com/spokesz/rarefriends-vibeathon):
   - File: `submissions/rarefriends-hunt/README.md`
   - Fields: name, your contact, category, one sentence, source URL, **public play URL**, how it uses Rare Friends / RF.

You still use FriendSDK. Judges play the hosted link. They do not need your laptop’s `~/friendsdk`.

---

## Path B — This Grok preview app on Vercel

Allowed. FriendSDK is **optional** for the vibeathon. Tools and custom stacks are fine if you still use a Rare Friend (art / identity / RF).

1. Push `/workspace` (this app) to GitHub.
2. Deploy to Vercel. That URL is the playable preview.
3. Same PR: `submissions/rarefriends-hunt/README.md` pointing at **your** source repo + Vercel URL.

Downside: no live wallet / real Friend ownership check unless you add it. Path A is stronger for “you play as your Friend.”

---

## What you do this week (A, in order)

```text
1. Create GitHub repo  you/rarefriends-hunt  (or fork friendsdk)
2. Copy games/hunt/* into that repo
3. Push
4. Deploy playable preview (Vercel or GH Pages)
5. Fork spokesz/rarefriends-vibeathon
6. Add submissions/rarefriends-hunt/README.md
7. Open the PR before 30 Sep
```

Suggested README one-liner:

> Walk your Rare Friend across 30 original worlds. Hunt spends 1 RF, banks xRF, and xRF is a 40% coupon on the next Generations **tier upgrade** (promote stays full price).

Category: **Economy Potential** or **Character Spotlight**.

Need a wallet with a **hardwired Generations NFT** on Robinhood (chain 4663) to play an SDK demo the way judges will.

Telegram if stuck: https://t.me/RFVibeathon
