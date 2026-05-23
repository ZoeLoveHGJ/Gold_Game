import os
import json
import re

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'
main_ts_lines = {}

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    print(f"Scanning log: {conv}")
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                content = data.get("content", "")
                if not content:
                    continue
                
                # Check if this content contains view_file output for main.ts
                if 'main.ts' in content and ('Showing lines' in content or 'Total Lines:' in content or 'modified to include a line number' in content):
                    print(f"  Match found in log {conv} at line {idx}!")
                    clines = content.split('\n')
                    for cl in clines:
                        match = re.match(r'^\s*(\d+):\s(.*)', cl)
                        if match:
                            line_num = int(match.group(1))
                            val = match.group(2)
                            if line_num not in main_ts_lines or len(val) > len(main_ts_lines[line_num]):
                                main_ts_lines[line_num] = val
            except Exception as e:
                pass

if main_ts_lines:
    max_line = max(main_ts_lines.keys())
    print(f"Reconstructed {len(main_ts_lines)} unique lines out of {max_line} total lines.")
    with open('src/main.ts', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(main_ts_lines.get(i, f"// Line {i} missing") + '\n')
    print("Successfully restored src/main.ts!")
else:
    print("No main.ts views found in any conversation log.")
