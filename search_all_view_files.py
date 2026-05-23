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
            
            content = data.get("content", "")
            if not content:
                continue
            
            if 'Total Lines:' in content and 'main.ts' in content:
                print(f"Log: {conv}, line {idx} - Found Total Lines and main.ts in content!")
                # Extract the line containing Total Lines
                for cl in content.split('\n'):
                    if 'Total Lines:' in cl:
                        print("  Line:", repr(cl))
