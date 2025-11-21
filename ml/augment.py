"""
augment_dataset.py

Usage:
  1) Put your dataset as:
       dataset/
         saikat/
           saikat_01.jpg
           ...
         galib/
         samiul/

  2) Install dependencies if needed:
       pip install albumentations opencv-python

  3) Run:
       python augment_dataset.py --src ./dataset --dst ./augmented_dataset --target 120

The script will copy originals and create augmented images until each person has `target` images.
Augmented images are resized to 200x200 (recommended for LBPH).
"""

import os
import argparse
import random
from pathlib import Path
import cv2
import numpy as np

try:
    import albumentations as A
except Exception as e:
    raise ImportError("Please install albumentations: pip install albumentations")


def build_augmentation_pipeline():
    return A.Compose([
        A.RandomBrightnessContrast(brightness_limit=0.25, contrast_limit=0.25, p=0.6),
        A.MotionBlur(blur_limit=5, p=0.2),
        A.GaussNoise(var_limit=(10.0, 60.0), p=0.3),
        A.Blur(blur_limit=3, p=0.2),
        A.ShiftScaleRotate(shift_limit=0.06, scale_limit=0.12, rotate_limit=25, border_mode=cv2.BORDER_CONSTANT, p=0.7),
        A.CLAHE(clip_limit=2.0, p=0.3),
        A.HueSaturationValue(hue_shift_limit=15, sat_shift_limit=25, val_shift_limit=15, p=0.3),
        A.CoarseDropout(max_holes=1, max_height=40, max_width=40, fill_value=0, p=0.25),
    ], p=1.0)


def ensure_dir(p: Path):
    if not p.exists():
        p.mkdir(parents=True, exist_ok=True)


def gather_images(folder: Path):
    exts = ("*.jpg", "*.jpeg", "*.png", "*.JPG", "*.PNG")
    files = []
    for e in exts:
        files += list(folder.glob(e))
    return files


def augment_person(src_dir: Path, dst_dir: Path, target_count: int, pipeline, resize=(200,200)):
    ensure_dir(dst_dir)
    src_images = gather_images(src_dir)

    if len(src_images) == 0:
        print(f"[WARN] No images found for {src_dir.name}, skipping")
        return 0

    # copy originals first (with prefix orig_)
    existing = gather_images(dst_dir)
    if len(existing) == 0:
        for img_path in src_images:
            dst_path = dst_dir / f"orig_{img_path.name}"
            img = cv2.imread(str(img_path))
            if img is None:
                continue
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, resize)
            cv2.imwrite(str(dst_path), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

    # recompute current count
    current = len(gather_images(dst_dir))
    attempt = 0
    max_attempts = target_count * 20

    while current < target_count and attempt < max_attempts:
        attempt += 1
        src_img_path = random.choice(src_images)
        img = cv2.imread(str(src_img_path))
        if img is None:
            continue
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # apply augmentation
        try:
            aug = pipeline(image=img)['image']
        except Exception:
            # fallback: small random flip/resize
            aug = img
        # resize to standard LBPH size
        aug_resized = cv2.resize(aug, resize)

        out_name = f"aug_{current+1:04d}_{src_img_path.stem}.jpg"
        out_path = dst_dir / out_name
        cv2.imwrite(str(out_path), cv2.cvtColor(aug_resized, cv2.COLOR_RGB2BGR))
        current += 1

    if attempt >= max_attempts:
        print(f"[WARN] reached max attempts for {src_dir.name} (got {current}, target {target_count})")

    return current


def main(args):
    src_root = Path(args.src)
    dst_root = Path(args.dst)
    ensure_dir(dst_root)

    pipeline = build_augmentation_pipeline()

    people = [p for p in src_root.iterdir() if p.is_dir()]
    if len(people) == 0:
        print("No person folders found in", src_root)
        return

    print(f"Found {len(people)} people. Starting augmentation to {args.target} images/person...")

    summary = {}
    for person in people:
        dst_person = dst_root / person.name
        print(f"\nProcessing: {person.name}")
        count = augment_person(person, dst_person, args.target, pipeline, resize=(args.width, args.height))
        summary[person.name] = count
        print(f" -> {person.name}: {count} images saved")

    print("\n=== Summary ===")
    for k,v in summary.items():
        print(k, v)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Augment face dataset to target count per person')
    parser.add_argument('--src', type=str, default='./dataset', help='source dataset root')
    parser.add_argument('--dst', type=str, default='./augmented_dataset', help='destination augmented root')
    parser.add_argument('--target', type=int, default=120, help='target images per person')
    parser.add_argument('--width', type=int, default=200, help='output image width')
    parser.add_argument('--height', type=int, default=200, help='output image height')

    args = parser.parse_args()
    main(args)
