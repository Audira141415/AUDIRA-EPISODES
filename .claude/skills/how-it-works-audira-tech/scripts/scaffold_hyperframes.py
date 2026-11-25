#!/usr/bin/env python3
"""
AUDIRA TECH — HyperFrames Project Scaffolder
Creates an executable, deterministic HyperFrames project folder structure for a HOW IT WORKS episode.
"""

import os
import sys
import json
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DEFAULT_PROJECT_JSON = {
    "name": "how-it-works-episode",
    "version": "1.0.0",
    "aspectRatio": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 60,
    "durationSeconds": 75,
    "masterAudio": "assets/audio/voiceover_master.wav",
    "bgm": "assets/audio/bgm_tech_minimal.mp3",
    "scenes": []
}

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0">
  <title>AUDIRA TECH: How It Works</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      background-color: #0A0D14;
      font-family: 'JetBrains Mono', monospace;
      color: #FFFFFF;
      overflow: hidden;
      position: relative;
    }
    #viewport {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .hud-header {
      position: absolute;
      top: 160px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 242, 254, 0.3);
      padding-bottom: 12px;
      z-index: 10;
    }
    .hud-title {
      font-size: 20px;
      color: #00F2FE;
      letter-spacing: 2px;
      font-weight: 700;
    }
    .hud-rec {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #FF3366;
    }
    .rec-dot {
      width: 8px;
      height: 8px;
      background: #FF3366;
      border-radius: 50%;
      box-shadow: 0 0 8px #FF3366;
    }
  </style>
</head>
<body>
  <div id="viewport">
    <div class="hud-header">
      <div class="hud-title">AUDIRA TECH // HOW IT WORKS</div>
      <div class="hud-rec"><span class="rec-dot"></span> REC LIVE TELEMETRY</div>
    </div>
    <div id="scenes-container"></div>
  </div>
</body>
</html>
"""

def scaffold_project(target_dir: str, title: str, aspect_ratio: str = "9:16"):
    os.makedirs(target_dir, exist_ok=True)
    os.makedirs(os.path.join(target_dir, "assets", "video"), exist_ok=True)
    os.makedirs(os.path.join(target_dir, "assets", "audio"), exist_ok=True)
    os.makedirs(os.path.join(target_dir, "assets", "hud"), exist_ok=True)
    os.makedirs(os.path.join(target_dir, "scenes"), exist_ok=True)

    proj_config = DEFAULT_PROJECT_JSON.copy()
    proj_config["name"] = title.lower().replace(" ", "-")
    if aspect_ratio == "16:9":
        proj_config["aspectRatio"] = "16:9"
        proj_config["width"] = 1920
        proj_config["height"] = 1080

    with open(os.path.join(target_dir, "project.json"), "w", encoding="utf-8") as f:
        json.dump(proj_config, f, indent=2)

    with open(os.path.join(target_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(HTML_TEMPLATE)

    print(f"✅ Successfully scaffolded HyperFrames project in: {target_dir}")
    print(f"   - project.json ({aspect_ratio})")
    print(f"   - index.html")
    print(f"   - assets/ (video, audio, hud)")
    print(f"   - scenes/")

def main():
    parser = argparse.ArgumentParser(description="Scaffold HyperFrames project for AUDIRA TECH")
    parser.add_argument("--output", "-o", default="./how-it-works-project", help="Destination folder")
    parser.add_argument("--title", "-t", default="How It Works Episode", help="Episode title")
    parser.add_argument("--ar", choices=["9:16", "16:9"], default="9:16", help="Aspect Ratio")
    args = parser.parse_args()

    scaffold_project(args.output, args.title, args.ar)

if __name__ == "__main__":
    main()
