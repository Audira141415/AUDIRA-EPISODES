# Synchronize STATUS.json for EP11-EP20 to uniform stage
import pathlib, json
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
now_iso = datetime.now().isoformat() + "Z"

for i in range(11, 21):
    ep_prefix = f"EP{i:02d}"
    matches = list(ROOT.glob(f"{ep_prefix}*"))
    if not matches:
        continue
    ep_dir = matches[0]
    p = ep_dir / "STATUS.json"
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data["currentStage"] = "voice"
        data["updatedAt"] = now_iso
        
        stages = data.get("stages", [])
        for st in stages:
            if st["id"] in ["context", "research", "style", "script", "setup", "delivery"]:
                st["status"] = "done"
                if "approved" in st:
                    st["approved"] = True
            elif st["id"] in ["voice", "animation", "draft", "final", "review"]:
                st["status"] = "pending"
                
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Synced STATUS.json for {ep_dir.name}")

