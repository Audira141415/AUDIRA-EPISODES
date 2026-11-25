#!/usr/bin/env python3
"""
AUDIRA TECH — Multi-Model AI Video Prompt Generator
Formats storyboard scene specifications into optimized prompts for Kling, Runway Gen-3/4, Luma Ray 2, and Wan 2.1.
"""

import sys
import json
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

UNIVERSAL_NEGATIVE = (
    "text, typography, watermark, logo, subtitles, blurry, deformed geometry, "
    "low quality, cartoon, CGI plastic look, melted metal, extra unconnected parts, "
    "shaking camera, flickering artifacts, low resolution"
)

def format_kling_prompt(scene: dict) -> str:
    camera = scene.get("camera", "Slow cinematic orbital rotation around center")
    subject = scene.get("subject", "Mechanical component assembly")
    action = scene.get("action", "smooth mechanical motion")
    lighting = scene.get("lighting", "Studio key lighting, dark slate background, electric cyan rim highlights")
    
    prompt = (
        f"{camera}, {subject}, {action}, {lighting}, "
        f"3D photorealistic scientific documentary, 8k resolution, highly detailed engineering model, "
        f"physically based rendering --neg {UNIVERSAL_NEGATIVE}"
    )
    return prompt

def format_runway_prompt(scene: dict) -> str:
    camera = scene.get("camera", "Macro probe tracking shot moving forward")
    subject = scene.get("subject", "Detailed engineering teardown")
    action = scene.get("action", "precise mechanical operation")
    lighting = scene.get("lighting", "Clean studio lighting, dark navy background with subtle cyan rim light")
    
    prompt = (
        f"Camera: {camera}.\n"
        f"Subject: {subject}.\n"
        f"Motion: {action}.\n"
        f"Lighting & Style: {lighting}, photorealistic industrial design, Octane Render look."
    )
    return prompt

def format_luma_prompt(scene: dict) -> str:
    subject = scene.get("subject", "Precision mechanism")
    action = scene.get("action", "dynamic physical motion")
    camera = scene.get("camera", "smooth gliding camera")
    lighting = scene.get("lighting", "studio rim-lit environment with specular metallic reflections")
    
    prompt = (
        f"Cinematic engineering documentary close-up of {subject}. "
        f"{action}. {lighting}. "
        f"{camera}, physically based ray-traced materials, 8k resolution, photorealistic 3D visualization."
    )
    return prompt

def format_wan_prompt(scene: dict) -> str:
    subject = scene.get("subject", "Technical mechanical assembly")
    action = scene.get("action", "unfolding causal physical sequence")
    lighting = scene.get("lighting", "dark industrial background, sharp directional key light")
    
    prompt = (
        f"A technical exploded-view animation of {subject}. "
        f"{action}. {lighting}, engineering documentary style, high definition, sharp focus."
    )
    return prompt

def main():
    parser = argparse.ArgumentParser(description="Generate AI Video Prompts for AUDIRA TECH")
    parser.add_argument("--input", "-i", help="Path to scenes JSON file")
    parser.add_argument("--engine", "-e", choices=["kling", "runway", "luma", "wan", "all"], default="all")
    parser.add_argument("--ar", choices=["9:16", "16:9"], default="9:16")
    args = parser.parse_args()

    sample_scene = {
        "id": "Scene-01",
        "subject": "Smartphone optical image stabilization (OIS) module with central sensor and miniature electromagnets",
        "action": "Electromagnetic coils micro-vibrating with extreme precision, suspending the central lens frame in real-time",
        "camera": "Macro probe lens moving slowly forward past the metal shielding into the coil suspension",
        "lighting": "Clean studio lighting, deep dark slate gray background with subtle cyan rim lighting"
    }

    scenes = [sample_scene]
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            scenes = json.load(f)

    for idx, sc in enumerate(scenes):
        print(f"\n==========================================")
        print(f"🎬 Scene {idx+1}: {sc.get('id', 'Untitled')}")
        print(f"==========================================")
        
        if args.engine in ["kling", "all"]:
            print("\n[KLING 1.5 / 2.0]")
            print(format_kling_prompt(sc) + f" --ar {args.ar}")
            
        if args.engine in ["runway", "all"]:
            print("\n[RUNWAY GEN-3 / GEN-4]")
            print(format_runway_prompt(sc))
            
        if args.engine in ["luma", "all"]:
            print("\n[LUMA RAY 2 / DREAM MACHINE]")
            print(format_luma_prompt(sc))
            
        if args.engine in ["wan", "all"]:
            print("\n[WAN 2.1]")
            print(format_wan_prompt(sc))

if __name__ == "__main__":
    main()
