# Sound effects — license & provenance

All audio files in this folder are **original works, generated procedurally**
from pure DSP (oscillators + filtered noise) by `scripts/generate-sfx.mjs`.

Nothing here is sampled, recorded, or downloaded from a third party. The sounds
are dedicated to the **public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)** —
no attribution is required, which keeps this public fan project fully
license-clean.

Regenerate at any time with:

```bash
npm run gen-sfx
```

## Files

| File                | Used for                                  |
| ------------------- | ----------------------------------------- |
| `button_click.wav`  | UI button clicks (`BaseButton`)           |
| `card_draw.wav`     | Drawing a card                            |
| `card_play.wav`     | Playing a card / casting a spell          |
| `minion_attack.wav` | A minion attacking                        |
| `minion_death.wav`  | A minion dying                            |
| `hero_hit.wav`      | A hero taking damage                      |
| `victory_sting.wav` | Winning a match                           |
| `defeat_sting.wav`  | Losing a match                            |
| `ambient_menu.wav`  | Looping menu jingle (menus / draft)       |
| `ambient_board.wav` | Looping ambient track (combat board)      |

## Swapping in a CC0 audio pack

The loader (`composables/useAudio.ts`) addresses sounds by these filenames, so
you can drop in higher-fidelity CC0 assets — e.g. from
[kenney.nl](https://kenney.nl/assets?q=audio) or
[freesound.org](https://freesound.org/) (CC0 filter) — by overwriting the files
above with the same names (`.wav`, `.mp3`, or `.ogg` — update the extension in
the loader's `SOUNDS` map if you change format).
