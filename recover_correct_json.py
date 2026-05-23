import os
import re
import json

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'
main_ts_lines = {}

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    print(f"Reading log: {conv}")
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
            except Exception:
                continue
            
            content = data.get("content", "")
            if not content:
                continue
            
            # Since JSON unescapes \n to actual newlines, we can split content by \n now!
            content_lines = content.split('\n')
            for cl in content_lines:
                match = re.match(r'^\s*(\d+):\s(.*)', cl)
                if match:
                    line_num = int(match.group(1))
                    val = match.group(2)
                    if line_num not in main_ts_lines or len(val) > len(main_ts_lines[line_num]):
                        main_ts_lines[line_num] = val

if main_ts_lines:
    max_line = max(main_ts_lines.keys())
    print(f"Successfully recovered {len(main_ts_lines)} unique lines! Max line number: {max_line}")
    with open('src/main.ts', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(main_ts_lines.get(i, '') + '\n')
    print("Successfully restored src/main.ts!")
else:
    print("No main.ts lines found in any logs.")
