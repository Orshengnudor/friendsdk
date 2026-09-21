#!/usr/bin/env python3
"""Make the SDK host fill the viewport and keep WASD after wallet popups."""
from pathlib import Path

root = Path(__file__).resolve().parents[2]
css = root / "node_modules/@rarefriends/friendsdk/dist/frame.css"
js_globs = list((root / "node_modules/@rarefriends/friendsdk").rglob("frame*.js"))
patched = 0
if css.exists():
    text = css.read_text()
    extra = "\n.rf-game-frame,.rf-game-frame iframe{width:100%!important;height:100%!important;max-width:none!important;aspect-ratio:auto!important}\n"
    if extra.strip() not in text:
        css.write_text(text + extra)
        patched += 1
print(f"patched {patched} host files (ok if 0 — already applied)")
