import os
import re
import json

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'
best_main_ts = {}

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    print(f"Reading log: {conv}")
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
    for line in lines:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
        except Exception:
            continue
            
        content = data.get("content", "")
        if not content:
            continue
            
        if 'src/main.ts' in content or 'main.ts' in content:
            if 'Total Lines:' in content or 'Showing lines' in content or 'modified to include a line number' in content:
                content_lines = content.split('\n')
                current_lines = {}
                is_inside = False
                for cl in content_lines:
                    if 'src/main.ts' in cl or 'main.ts' in cl:
                        if 'Total Lines:' in cl or 'Showing lines' in cl or 'modified to include a line number' in cl:
                            is_inside = True
                            continue
                    if is_inside:
                        match = re.match(r'^(\d+): (.*)', cl)
                        if match:
                            ln = int(match.group(1))
                            val = match.group(2)
                            current_lines[ln] = val
                        elif 'the above content' in cl.lower() or 'completed at:' in cl.lower():
                            is_inside = False
                            
                if current_lines:
                    print(f"  Found {len(current_lines)} lines of main.ts in this step!")
                    for ln, val in current_lines.items():
                        best_main_ts[ln] = val

if best_main_ts:
    max_line = max(best_main_ts.keys())
    print(f"Found best main.ts with {len(best_main_ts)} unique lines, max line number: {max_line}")
    with open('src/main.ts', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(best_main_ts.get(i, "") + '\n')
    print("Successfully recovered main.ts!")
else:
    print("Could not find any main.ts lines in logs.")
