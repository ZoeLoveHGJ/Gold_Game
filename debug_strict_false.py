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
                if name == 'multi_replace_file_content':
                    args = tc.get("args", {})
                    chunks = args.get("ReplacementChunks", "")
                    if isinstance(chunks, str) and chunks:
                        try:
                            # Let's use strict=False!
                            parsed = json.loads(chunks, strict=False)
                            print(f"Log: {conv}, line {idx} - SUCCESS with strict=False!")
                        except Exception as e:
                            print(f"Log: {conv}, line {idx} - FAILED with strict=False: {e}")
