"""
art-style-test2.py — does the storybook-simple style generalize?

Renders Firework Fred + Bess the Blacksmith (hero portraits) and one spell
scene (Corpse-Candle, card landscape) in the winning storybook style.
Outputs to scripts/art-style-test/. Run with the hollowmoor-art venv python.
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

STYLE = (
    "charming storybook character illustration with a dark folk-horror twist, "
    "bold simple shapes, clean strong silhouette, single character filling the "
    "frame, plain muted background, soft candlelit palette"
)
SCENE_STYLE = (
    "charming storybook illustration with a dark folk-horror twist, bold simple "
    "shapes, one clear focal subject, plain muted background, soft candlelit "
    "palette, no people"
)

JOBS = [
    (
        "fred-storybook-s202",
        832,
        1088,
        f"{STYLE}. a wiry firework maker named Firework Fred, singed hair, no "
        f"eyebrows, soot-stained apron, holding one large rocket, manic grin, "
        f"night sky with sparks",
    ),
    (
        "bess-storybook-s202",
        832,
        1088,
        f"{STYLE}. a brawny blacksmith woman named Bess, leather apron, big "
        f"hammer resting on her shoulder, kind face, forge glow behind her",
    ),
    (
        "corpse-candle-storybook-s202",
        1024,
        768,
        f"{SCENE_STYLE}. a single ghostly pale flame hovering over a dark "
        f"misty bog at night, reeds, faint reflection",
    ),
]

NEG = (
    "photograph, photo, photorealistic, hyperrealistic, dslr, 3d render, cgi, "
    "text, watermark, signature, frame, border, logo, oil painting texture, "
    "busy brushwork, gore, deformed hands, extra limbs, lowres, blurry, "
    "pin-up, sexualized, nude, cluttered background, busy composition"
)


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

    for i, (name, w, h, prompt) in enumerate(JOBS, 1):
        gen = torch.Generator("cuda").manual_seed(202)
        t0 = time.time()
        image = pipe(
            prompt=prompt,
            negative_prompt=NEG,
            width=w,
            height=h,
            num_inference_steps=8,
            guidance_scale=2.0,
            generator=gen,
        ).images[0]
        out = OUT / f"{name}.jpg"
        image.convert("RGB").save(out, "JPEG", quality=88)
        print(f"[{i}/{len(JOBS)}] {out.name} {time.time() - t0:.1f}s", flush=True)
        del image
        gc.collect()
        torch.cuda.empty_cache()


if __name__ == "__main__":
    main()
