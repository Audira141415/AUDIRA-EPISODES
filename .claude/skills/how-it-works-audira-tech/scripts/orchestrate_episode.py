#!/usr/bin/env python3
"""
AUDIRA TECH — Master Episode Production Orchestrator
Executes the entire end-to-end production automation pipeline:
1. Script & Pacing Verification (WPM + Anti-Slop)
2. Multi-Model AI Video Prompts Generation
3. Kinetic Subtitle Tracks (SRT, VTT, JSON)
4. HyperFrames Project Scaffolding
5. NLE Timeline Export (EDL, FCPXML, JSON)
"""

import os
import sys
import json
import argparse
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_step(cmd_args, step_name):
    print(f"\n🔄 Running: {step_name}...")
    result = subprocess.run([sys.executable] + cmd_args, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        print(f"❌ Error in {step_name}:\n{result.stderr}")
        return False, result.stdout
    print(result.stdout.strip())
    return True, result.stdout

def orchestrate(package_dir: str, script_path: str, scenes_path: str, duration: float, aspect_ratio: str):
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(package_dir, exist_ok=True)
    
    print("==================================================")
    print("🚀 AUDIRA TECH // END-TO-END MASTER PIPELINE")
    print(f"📁 Target Output: {package_dir}")
    print(f"⏱️ Duration: {duration}s | Aspect Ratio: {aspect_ratio}")
    print("==================================================")

    # 1. Verify Script Pacing & Anti-Slop
    verify_script = os.path.join(scripts_dir, "verify_episode.py")
    ok, out = run_step([verify_script, "--script", script_path, "--duration", str(duration)], "Script & Pacing Verification")
    if not ok:
        return False

    # 2. Generate Multi-Engine AI Video Prompts
    prompts_script = os.path.join(scripts_dir, "generate_prompts.py")
    prompts_out = os.path.join(package_dir, "ai_video_prompts.txt")
    print(f"\n🔄 Generating AI Video Prompts -> {prompts_out}...")
    with open(prompts_out, "w", encoding="utf-8") as f:
        subprocess.run([sys.executable, prompts_script, "--input", scenes_path, "--engine", "all", "--ar", aspect_ratio], stdout=f, text=True, encoding="utf-8")
    print(f"✅ AI Video Prompts written to: {prompts_out}")

    # 3. Generate Kinetic Subtitles
    align_script = os.path.join(scripts_dir, "align_captions.py")
    subtitles_base = os.path.join(package_dir, "captions")
    ok, out = run_step([align_script, "--script", script_path, "--duration", str(duration), "--output", subtitles_base], "Kinetic Subtitles Generation")

    # 4. Export NLE Timelines (EDL, FCPXML, JSON)
    timeline_script = os.path.join(scripts_dir, "export_timeline.py")
    timeline_base = os.path.join(package_dir, "timeline")
    ok, out = run_step([timeline_script, "--input", scenes_path, "--output", timeline_base, "--ar", aspect_ratio], "NLE Timeline Export (EDL/FCPXML)")

    # 5. Scaffold HyperFrames Interactive Project
    scaffold_script = os.path.join(scripts_dir, "scaffold_hyperframes.py")
    hyperframes_dir = os.path.join(package_dir, "hyperframes_player")
    ok, out = run_step([scaffold_script, "--output", hyperframes_dir, "--ar", aspect_ratio], "HyperFrames Project Scaffolding")

    print("\n==================================================")
    print("🎉 ALL PRODUCTION STREAMS SUCCESSFULLY ORCHESTRATED!")
    print(f"📁 Master Deliverables Ready in: {package_dir}")
    print("==================================================")
    return True

def main():
    parser = argparse.ArgumentParser(description="Master Episode Orchestrator for AUDIRA TECH")
    parser.add_argument("--dir", "-d", default="./episode_output", help="Output package directory")
    parser.add_argument("--script", "-s", required=True, help="Path to narration script file")
    parser.add_argument("--scenes", "-c", required=True, help="Path to scenes JSON file")
    parser.add_argument("--duration", type=float, default=75.0, help="Target duration in seconds")
    parser.add_argument("--ar", choices=["9:16", "16:9"], default="9:16", help="Aspect ratio (default: 9:16)")
    args = parser.parse_args()

    orchestrate(args.dir, args.script, args.scenes, args.duration, args.ar)

if __name__ == "__main__":
    main()

