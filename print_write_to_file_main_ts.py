import os
import json

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
            except Exception:
                continue
            
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name", "")
                if name == 'write_to_file':
                    args = tc.get("args", {})
                    target = args.get("TargetFile", "")
                    if 'main.ts' in target.lower():
                        print(f"FOUND write_to_file in log {conv} line {idx}!")
                        print("  Length of CodeContent:", len(args.get("CodeContent", "")))
                        print("  Snippet of CodeContent:", repr(args.get("CodeContent", "")[:300]))
