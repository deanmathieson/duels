"""
generate-art.py — batch-render Hollowmoor card art locally with SDXL.

Reads scripts/art-prompts.json (from `npm run gen-art-prompts`) and renders
every id that doesn't already have an image, in priority order:
heroes -> enemies -> treasures -> cards.

Output: public/assets/{cards,heroes,treasures}/<id>.jpg — the layout
`npm run build-art-manifest` scans. Fully resumable: re-running skips
existing files; delete a jpg to re-roll it (use --seed-offset N for a
different roll).

Usage (from the repo root, venv python):
  python scripts/generate-art.py                 # full run
  python scripts/generate-art.py --limit 3       # test batch
  python scripts/generate-art.py --only hero_rogue,boss_barrow_king
  python scripts/generate-art.py --seed-offset 1 # alternate rolls

Tuned for an 8GB GPU (RTX 3070): DreamShaper XL v2 Turbo, 8 steps,
model CPU offload + VAE tiling. ~6-10s per image.
"""

import argparse
import gc
import hashlib
import json
import os
import time
from pathlib import Path

# Reduce CUDA allocator fragmentation — lets the model coexist with a busy
# desktop (Chrome/Discord/games) that already holds a slice of an 8GB card.
# Must be set before torch initializes CUDA.
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

import torch
from diffusers import AutoPipelineForText2Image, DPMSolverSinglestepScheduler

ROOT = Path(__file__).resolve().parent.parent
PROMPTS = ROOT / "scripts" / "art-prompts.json"
ASSETS = ROOT / "public" / "assets"

MODEL = "Lykon/dreamshaper-xl-v2-turbo"

# Folder + canvas per asset kind. Kept at/under ~0.85MP so each render fits an
# 8GB card with headroom — at full 1MP the late images spilled into shared
# system RAM and crawled. Cards land in a landscape window; heroes are portraits.
KIND_LAYOUT = {
    "card": ("cards", 1024, 768),
    "hero": ("heroes", 832, 1088),
    "enemy": ("heroes", 832, 1088),
    "treasure": ("treasures", 960, 960),
    "heroPower": ("treasures", 960, 960),
}

PRIORITY = {"hero": 0, "enemy": 1, "treasure": 2, "heroPower": 3, "card": 4}

# Storybook-simple style: bans the photo register AND the old oil-paint
# register (busy brushwork pulled renders back toward cluttered scenes).
# Deliberately does NOT ban cartoon/flat colors — that's the look now.
NEGATIVE = (
    "pin-up, cheesecake, sexualized, suggestive pose, cleavage, lingerie, "
    "bikini, nude, naked, bare midriff, seductive, glamour model, "
    "photograph, photo, photorealistic, hyperrealistic, realistic, dslr, "
    "3d render, cgi, plastic, oil painting, impasto, busy brushwork, "
    "cluttered background, busy composition, "
    "text, watermark, signature, frame, border, logo, username, "
    "gore, deformed hands, extra limbs, lowres, blurry"
)


def stable_seed(item_id: str, offset: int) -> int:
    digest = hashlib.sha256(item_id.encode()).digest()
    return (int.from_bytes(digest[:4], "big") + offset) & 0x7FFFFFFF


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="stop after N renders")
    ap.add_argument("--only", default="", help="comma-separated ids to render")
    ap.add_argument("--seed-offset", type=int, default=0)
    ap.add_argument("--steps", type=int, default=8)
    ap.add_argument(
        "--offload",
        choices=["model", "sequential"],
        default="sequential",
        help="model = faster, needs ~6GB free VRAM; "
        "sequential = streams layers, ~2GB VRAM, slower but coexists with a busy desktop",
    )
    args = ap.parse_args()

    data = json.loads(PROMPTS.read_text(encoding="utf-8"))
    items = data["prompts"]
    only = {s.strip() for s in args.only.split(",") if s.strip()}

    queue = []
    for it in items:
        if only and it["id"] not in only:
            continue
        folder, w, h = KIND_LAYOUT[it["kind"]]
        out = ASSETS / folder / f"{it['id']}.jpg"
        if out.exists() and not only:
            continue
        queue.append((PRIORITY[it["kind"]], it, out, w, h))
    queue.sort(key=lambda q: (q[0], q[1]["id"]))
    if args.limit:
        queue = queue[: args.limit]

    print(f"{len(queue)} images to render (model: {MODEL})")
    if not queue:
        return

    pipe = AutoPipelineForText2Image.from_pretrained(
        MODEL, torch_dtype=torch.float16, variant="fp16"
    )
    # Turbo checkpoint: DPM++ SDE, low steps, low guidance.
    pipe.scheduler = DPMSolverSinglestepScheduler.from_config(
        pipe.scheduler.config, use_karras_sigmas=True
    )
    # Offload strategy (see --offload). Sequential streams individual layers so
    # the GPU footprint stays ~2GB — survives a desktop already holding VRAM;
    # model-offload is faster but needs the card mostly free.
    if args.offload == "sequential":
        pipe.enable_sequential_cpu_offload()
    else:
        pipe.enable_model_cpu_offload()
    pipe.vae.enable_tiling()

    done = 0
    started = time.time()
    for _, it, out, w, h in queue:
        out.parent.mkdir(parents=True, exist_ok=True)
        seed = stable_seed(it["id"], args.seed_offset)
        gen = torch.Generator("cuda").manual_seed(seed)
        t0 = time.time()
        image = pipe(
            prompt=it["prompt"],
            negative_prompt=NEGATIVE,
            width=w,
            height=h,
            num_inference_steps=args.steps,
            guidance_scale=2.0,
            generator=gen,
        ).images[0]
        image.convert("RGB").save(out, "JPEG", quality=88)
        done += 1
        rate = (time.time() - started) / done
        eta_min = rate * (len(queue) - done) / 60
        print(
            f"[{done}/{len(queue)}] {it['id']} ({it['kind']}) "
            f"{time.time() - t0:.1f}s  eta {eta_min:.0f}m",
            flush=True,
        )
        # Reclaim VRAM each iteration — without this it creeps full over a long
        # run and late renders spill into shared system RAM (10-50x slower).
        del image
        gc.collect()
        torch.cuda.empty_cache()

    print(f"Done: {done} images in {(time.time() - started) / 60:.1f} minutes.")


if __name__ == "__main__":
    main()
