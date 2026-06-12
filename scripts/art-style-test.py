"""
art-style-test.py — one-off style comparison for the hero-art simplification.

Renders Farmer Greg in three candidate styles (2 seeds each) to
scripts/art-style-test/ so the directions can be compared side by side
before committing to a full regen. Does NOT touch public/assets.

Run with the hollowmoor-art venv python from the repo root:
  python scripts/art-style-test.py
"""

import gc
import os
import time
from pathlib import Path

os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

import torch
from diffusers import AutoPipelineForText2Image, DPMSolverSinglestepScheduler

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "scripts" / "art-style-test"

MODEL = "Lykon/dreamshaper-xl-v2-turbo"
W, H = 832, 1088  # hero portrait canvas

GREG = (
    'a stout middle-aged farmer named Farmer Greg, flat cap, wellington boots, '
    'mud-stained smock, holding a pitchfork, friendly weathered grin'
)
MOOD = "farmstead greens, twilight, faint eerie glow from the field behind him"

# Shared photo/text bans; style bans differ per variant.
NEG_BASE = (
    "photograph, photo, photorealistic, hyperrealistic, dslr, 3d render, cgi, "
    "text, watermark, signature, frame, border, logo, "
    "gore, deformed hands, extra limbs, lowres, blurry, "
    "pin-up, sexualized, nude, cluttered background, busy composition"
)

VARIANTS = [
    # Control: today's formula, new character swapped in.
    (
        "frazetta-control",
        f"oil painting in the style of Frank Frazetta, pulp fantasy art, dramatic "
        f"chiaroscuro, rich warm shadows, painterly brushwork, dark gothic "
        f"folk-horror. waist-up portrait of {GREG}. {MOOD}",
        NEG_BASE + ", anime, cartoon, flat colors",
    ),
    # Candidate A: storybook-simple — Postman Pat with something wrong.
    (
        "storybook-simple",
        f"charming storybook character illustration with a dark folk-horror twist, "
        f"bold simple shapes, clean strong silhouette, single character filling the "
        f"frame, plain muted background, soft candlelit palette. {GREG}. {MOOD}",
        NEG_BASE + ", oil painting texture, busy brushwork",
    ),
    # Candidate B: keep the oil-paint look, force simple composition.
    (
        "painterly-simple",
        f"simple painterly character portrait, dark folk-horror, one single figure "
        f"with a bold readable silhouette filling the frame, plain dark background, "
        f"warm candlelight rim light, muted palette, minimal detail. {GREG}. {MOOD}",
        NEG_BASE + ", anime, cartoon",
    ),
]

SEEDS = [101, 202]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    pipe = AutoPipelineForText2Image.from_pretrained(
        MODEL, torch_dtype=torch.float16, variant="fp16"
    )
    pipe.scheduler = DPMSolverSinglestepScheduler.from_config(
        pipe.scheduler.config, use_karras_sigmas=True
    )
    pipe.enable_model_cpu_offload()
    pipe.vae.enable_tiling()

    total = len(VARIANTS) * len(SEEDS)
    done = 0
    for name, prompt, neg in VARIANTS:
        for seed in SEEDS:
            gen = torch.Generator("cuda").manual_seed(seed)
            t0 = time.time()
            image = pipe(
                prompt=prompt,
                negative_prompt=neg,
                width=W,
                height=H,
                num_inference_steps=8,
                guidance_scale=2.0,
                generator=gen,
            ).images[0]
            out = OUT / f"greg-{name}-s{seed}.jpg"
            image.convert("RGB").save(out, "JPEG", quality=88)
            done += 1
            print(f"[{done}/{total}] {out.name} {time.time() - t0:.1f}s", flush=True)
            del image
            gc.collect()
            torch.cuda.empty_cache()


if __name__ == "__main__":
    main()
