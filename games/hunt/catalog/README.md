# Hunt catalog — one file per world

Each `L01.ts` … `L30.ts` is a complete world: land layout, task, station corners, NPCs.

Change L11 cards? Edit `L11.ts` only. `generate.ts` just reads these files.

`corner` is where the card sits on that island: west / east / north / south / center / nw / ne / sw / se.
`island` is 0-based (0 = first shore).
