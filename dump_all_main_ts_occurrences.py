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
                content = data.get("content", "")
                if 'main.ts' in content:
                    print(f"Log: {conv}, Line {idx} contains 'main.ts'!")
                    # Split and show the lines containing 'main.ts'
                    for cl in content.split('\n'):
                        if 'main.ts' in cl:
                            print("  Match:", repr(cl))
            except:
                pass
