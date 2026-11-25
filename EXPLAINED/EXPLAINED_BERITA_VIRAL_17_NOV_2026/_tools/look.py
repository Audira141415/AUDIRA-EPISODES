"""look.py — Generates draft/look.json for world3d episodes (rule 12 quality gate).

Run from <EP>/project/:
    python ../../_tools/look.py

Requires: timeline.json (from audira_episode_status get), hf/ built (node build-video.mjs done).
Outputs:  ../draft/look.json

Measures motion, diversity, highlight clipping and shadow crushing from
evenly-spaced HyperFrames snapshots. Thresholds (rule 12):
  motion.meanMotion >= 8.0
  motion.stillPct   <= 5%
  diversity         >= 30
  frames[*].clipHi  == 0
  frames[*].crushLo <= 2%
"""

import json, os, re, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
from PIL import Image

# --- config ---
NUM_FRAMES = 36          # evenly spaced across the film (enough for motion stats)
STILL_THRESHOLD = 2.0    # motion below this = "still"
CLIP_HI_THRESHOLD = 250  # R/G/B > this = clipped highlight
CRUSH_LO_THRESHOLD = 5   # R/G/B < this = crushed shadow


def main():
    project = Path(".").resolve()
    episode = project.parent
    hf_dir = project / "hf"
    tl_path = project / "timeline.json"
    draft_dir = episode / "draft"
    draft_dir.mkdir(exist_ok=True)

    if not tl_path.exists():
        sys.exit("timeline.json not found. Run audira_episode_status get first.")
    if not (hf_dir / "hyperframes.json").exists():
        sys.exit("hf/hyperframes.json not found. Run node build-video.mjs first.")

    tl = json.loads(tl_path.read_text(encoding="utf-8"))
    duration = tl.get("duration") or tl.get("speech_end", 80)
    # don't snap the very first or last 0.3 s (black/fade)
    times = [round(0.5 + i * (duration - 1.0) / (NUM_FRAMES - 1), 2) for i in range(NUM_FRAMES)]
    times_str = ",".join(f"{t:.2f}" for t in times)

    # capture snapshots via hyperframes
    snap_dir = Path(tempfile.mkdtemp(prefix="look_", dir="F:\\hf-render-tmp"))
    env = {**os.environ, "TEMP": "F:\\hf-render-tmp", "TMP": "F:\\hf-render-tmp"}
    print(f"Snapping {NUM_FRAMES} frames at: {times_str[:80]}...")

    result = subprocess.run(
        ["npx", "hyperframes", "snapshot", "--no-end", "--at", times_str, "--out", str(snap_dir)],
        capture_output=True, text=True, encoding="utf-8", errors="ignore",
        cwd=str(hf_dir), env=env
    )

    # find the frame files (hyperframes writes frame-NNNN.png or similar)
    frame_files = sorted(snap_dir.glob("*.png"))
    if not frame_files:
        # fallback: look for jpg
        frame_files = sorted(snap_dir.glob("*.jpg"))
    if not frame_files:
        # try the contact-sheet directory pattern
        for d in snap_dir.iterdir():
            if d.is_dir():
                frame_files = sorted(d.glob("*.png")) or sorted(d.glob("*.jpg"))
                if frame_files:
                    break

    if len(frame_files) < 2:
        print(f"hyperframes stdout: {result.stdout[:500]}")
        print(f"hyperframes stderr: {result.stderr[:500]}")
        sys.exit(f"Only {len(frame_files)} frames captured in {snap_dir}. Need at least 2.")

    print(f"Analyzing {len(frame_files)} frames...")

    # load frames as numpy arrays
    frames_data = []
    for fp in frame_files:
        img = Image.open(fp).convert("RGB")
        arr = np.array(img, dtype=np.float32)
        frames_data.append(arr)

    # --- per-frame metrics ---
    frame_metrics = []
    for i, arr in enumerate(frames_data):
        total_pixels = arr.shape[0] * arr.shape[1]
        # highlight clipping: any channel > threshold
        clip_hi = float(np.any(arr > CLIP_HI_THRESHOLD, axis=2).sum() / total_pixels * 100)
        # shadow crushing: all channels < threshold
        crush_lo = float(np.all(arr < CRUSH_LO_THRESHOLD, axis=2).sum() / total_pixels * 100)

        t = times[i] if i < len(times) else times[-1]
        frame_metrics.append({
            "time": round(t, 2),
            "clipHi": round(clip_hi, 2),
            "crushLo": round(crush_lo, 2),
        })

    # --- motion between consecutive frames ---
    motions = []
    for i in range(1, len(frames_data)):
        diff = np.abs(frames_data[i] - frames_data[i - 1])
        # mean absolute difference across all pixels and channels, scaled to 0-100
        motion = float(diff.mean() / 255.0 * 100)
        motions.append(motion)

    mean_motion = round(float(np.mean(motions)), 2) if motions else 0
    still_count = sum(1 for m in motions if m < STILL_THRESHOLD)
    still_pct = round(still_count / len(motions) * 100, 1) if motions else 100

    # --- diversity: colour histogram spread ---
    # sample pixels from all frames, compute hue histogram
    all_pixels = np.concatenate([f.reshape(-1, 3) for f in frames_data[::3]], axis=0)  # every 3rd frame
    # convert to HSV-like hue buckets (simplified: use R-G, G-B, R-B ratios)
    sample = all_pixels[np.random.choice(len(all_pixels), min(50000, len(all_pixels)), replace=False)]
    # 72 hue bins (5-degree resolution)
    from colorsys import rgb_to_hsv
    hues = np.zeros(72, dtype=np.int32)
    for px in sample:
        r, g, b = px / 255.0
        h, s, v = rgb_to_hsv(float(r), float(g), float(b))
        if s > 0.08 and v > 0.08:  # skip near-grey/black
            hues[int(h * 71.99)] += 1
    # diversity = number of bins with > 0.5% of chromatic pixels
    chroma_total = hues.sum()
    if chroma_total > 0:
        diversity = int((hues > chroma_total * 0.005).sum())
    else:
        diversity = 0

    # --- build look.json ---
    look = {
        "engine": "world3d",
        "frames_analyzed": len(frames_data),
        "duration": round(duration, 2),
        "motion": {
            "meanMotion": mean_motion,
            "stillPct": still_pct,
            "perPair": [round(m, 2) for m in motions],
        },
        "diversity": diversity,
        "frames": frame_metrics,
    }

    # --- check thresholds ---
    issues = []
    if mean_motion < 8.0:
        issues.append(f"meanMotion {mean_motion} < 8.0: tambah gerakan kamera atau animasi objek")
    if still_pct > 5.0:
        issues.append(f"stillPct {still_pct}% > 5%: {still_count} dari {len(motions)} pasangan frame hampir diam")
    if diversity < 30:
        issues.append(f"diversity {diversity} < 30: variasi warna rendah, periksa palet dan pencahayaan")
    clip_frames = [f for f in frame_metrics if f["clipHi"] > 0]
    if clip_frames:
        issues.append(f"clipHi > 0 di {len(clip_frames)} frame: highlight terpotong, kurangi exposure/bloom")
    crush_frames = [f for f in frame_metrics if f["crushLo"] > 2.0]
    if crush_frames:
        issues.append(f"crushLo > 2% di {len(crush_frames)} frame: shadow terlalu gelap, tambah fill light")

    look["pass"] = len(issues) == 0
    look["issues"] = issues

    out_path = draft_dir / "look.json"
    out_path.write_text(json.dumps(look, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{'PASS' if look['pass'] else 'FAIL'}: {out_path}")
    print(f"  motion: mean={mean_motion}, still={still_pct}%")
    print(f"  diversity: {diversity}")
    if issues:
        for iss in issues:
            print(f"  ! {iss}")

    return 0 if look["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
