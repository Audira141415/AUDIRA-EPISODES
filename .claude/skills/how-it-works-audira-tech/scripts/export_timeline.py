#!/usr/bin/env python3
"""
AUDIRA TECH — Multi-Format Timeline Exporter
Exports storyboard scene timings into:
1. DaVinci Resolve EDL (.edl)
2. Final Cut Pro XML (.fcpxml)
3. Universal JSON Timeline (.json)
"""

import sys
import json
import argparse
import xml.etree.ElementTree as ET

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def frames_to_timecode(frame_count: int, fps: int = 30) -> str:
    total_seconds = frame_count // fps
    frames = frame_count % fps
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}:{frames:02d}"

def generate_edl(scenes: list, title: str = "AUDIRA_TECH_EPISODE", fps: int = 30) -> str:
    lines = [
        f"TITLE: {title}",
        "FCM: NON-DROP FRAME",
        ""
    ]
    current_record_frame = 0
    for idx, sc in enumerate(scenes):
        duration_sec = sc.get("duration", 5.0)
        scene_frames = int(duration_sec * fps)
        
        src_in = 0
        src_out = scene_frames
        rec_in = current_record_frame
        rec_out = current_record_frame + scene_frames
        
        tc_src_in = frames_to_timecode(src_in, fps)
        tc_src_out = frames_to_timecode(src_out, fps)
        tc_rec_in = frames_to_timecode(rec_in, fps)
        tc_rec_out = frames_to_timecode(rec_out, fps)
        
        event_num = f"{idx + 1:03d}"
        reel_name = f"AX_{idx + 1:02d}"
        
        lines.append(f"{event_num}  {reel_name} V     C        {tc_src_in} {tc_src_out} {tc_rec_in} {tc_rec_out}")
        lines.append(f"* FROM CLIP NAME: scene_{idx + 1:02d}_{sc.get('id', 'clip')}.mp4")
        lines.append(f"* COMMENT: {sc.get('visualMode', 'Exploded View')} - {sc.get('action', '')[:40]}")
        lines.append("")
        current_record_frame = rec_out
    return "\n".join(lines)

def generate_fcpxml(scenes: list, title: str = "AUDIRA_TECH_EPISODE", fps: int = 30, ar: str = "9:16") -> str:
    width = 1080 if ar == "9:16" else 1920
    height = 1920 if ar == "9:16" else 1080
    
    total_duration_sec = sum(sc.get("duration", 5.0) for sc in scenes)
    total_frames = int(total_duration_sec * fps)
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!DOCTYPE fcpxml>',
        '<fcpxml version="1.9">',
        '  <resources>',
        f'    <format id="r1" name="AUDIRA_Custom_{width}x{height}" frameDuration="1/{fps}s" width="{width}" height="{height}"/>',
        '  </resources>',
        '  <library>',
        f'    <event name="{title}">',
        f'      <project name="{title}">',
        f'        <sequence format="r1" duration="{total_frames}/{fps}s">',
        '          <spine>'
    ]
    
    current_offset_sec = 0.0
    for idx, sc in enumerate(scenes):
        dur = sc.get("duration", 5.0)
        dur_frames = int(dur * fps)
        offset_frames = int(current_offset_sec * fps)
        clip_name = f"Scene_{idx+1:02d}_{sc.get('id', 'clip')}"
        
        xml_lines.append(f'            <clip name="{clip_name}" offset="{offset_frames}/{fps}s" duration="{dur_frames}/{fps}s" start="0s">')
        xml_lines.append(f'              <video offset="0s" ref="r1" duration="{dur_frames}/{fps}s"/>')
        xml_lines.append('            </clip>')
        current_offset_sec += dur
        
    xml_lines.extend([
        '          </spine>',
        '        </sequence>',
        '      </project>',
        '    </event>',
        '  </library>',
        '</fcpxml>'
    ])
    return "\n".join(xml_lines)

def main():
    parser = argparse.ArgumentParser(description="Export AUDIRA TECH storyboard to EDL / FCPXML / JSON")
    parser.add_argument("--input", "-i", required=True, help="Path to scenes JSON")
    parser.add_argument("--format", "-f", choices=["edl", "fcpxml", "json", "all"], default="all")
    parser.add_argument("--output", "-o", help="Output file base path (without extension if format=all)")
    parser.add_argument("--fps", type=int, default=30, help="Timeline FPS (default: 30)")
    parser.add_argument("--ar", choices=["9:16", "16:9"], default="9:16", help="Aspect Ratio")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        scenes = json.load(f)

    base_name = args.output or "timeline_export"
    if base_name.endswith((".edl", ".fcpxml", ".json")):
        base_name = base_name.rsplit(".", 1)[0]

    if args.format in ["edl", "all"]:
        edl_out = f"{base_name}.edl"
        with open(edl_out, "w", encoding="utf-8") as f:
            f.write(generate_edl(scenes, fps=args.fps))
        print(f"✅ DaVinci Resolve EDL written: {edl_out}")

    if args.format in ["fcpxml", "all"]:
        fcpxml_out = f"{base_name}.fcpxml"
        with open(fcpxml_out, "w", encoding="utf-8") as f:
            f.write(generate_fcpxml(scenes, fps=args.fps, ar=args.ar))
        print(f"✅ Final Cut Pro / DaVinci FCPXML written: {fcpxml_out}")

    if args.format in ["json", "all"]:
        json_out = f"{base_name}.json"
        with open(json_out, "w", encoding="utf-8") as f:
            json.dump({
                "fps": args.fps,
                "aspectRatio": args.ar,
                "scenes": scenes
            }, f, indent=2)
        print(f"✅ Timeline JSON written: {json_out}")

if __name__ == "__main__":
    main()
