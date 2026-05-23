import os
import re

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'
best_main_ts = {}

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    print(f"Checking {log_path}...")
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    lines = text.split('\n')
    current_file_lines = {}
    is_main_ts = False
    
    for line in lines:
        if 'src/main.ts' in line.lower() and ('showing lines' in line.lower() or 'file path:' in line.lower()):
            is_main_ts = True
            continue
        
        if is_main_ts:
            match = re.match(r'^(\d+): (.*)', line)
            if match:
                line_num = int(match.group(1))
                content = match.group(2)
                current_file_lines[line_num] = content
            elif 'the above content' in line.lower() or 'showing lines' in line.lower() or 'file path:' in line.lower():
                is_main_ts = False
                if len(current_file_lines) > len(best_main_ts):
                    best_main_ts = current_file_lines.copy()

if best_main_ts:
    max_line = max(best_main_ts.keys())
    print(f"Found best main.ts with {len(best_main_ts)} lines, max line {max_line}")
    with open('src/main_recovered.ts', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            f.write(best_main_ts.get(i, '') + '\n')
    print("Recovered main.ts to src/main_recovered.ts successfully!")
else:
    print("Could not find any main.ts lines in logs.")
