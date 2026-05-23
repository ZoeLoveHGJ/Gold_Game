import os
import re

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'
best_main_ts = {}
best_mtime = 0

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path): continue
    
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    # Extract file contents
    lines = text.split('\n')
    current_file_lines = {}
    is_main_ts = False
    
    for line in lines:
        if 'File Path: ile:///e:/Work/Code/Web/Gold/src/main.ts' in line or 'File Path: ile:///E:/Work/Code/Web/Gold/src/main.ts' in line:
            is_main_ts = True
        
        if is_main_ts:
            match = re.match(r'^(\d+): (.*)', line)
            if match:
                line_num = int(match.group(1))
                content = match.group(2)
                current_file_lines[line_num] = content
            elif line.startswith('The above content'):
                # End of block
                is_main_ts = False
                if len(current_file_lines) > len(best_main_ts):
                    best_main_ts.update(current_file_lines)

if best_main_ts:
    with open('src/main.ts', 'w', encoding='utf-8') as f:
        max_line = max(best_main_ts.keys())
        for i in range(1, max_line + 1):
            f.write(best_main_ts.get(i, '') + '\n')
    print(f"Recovered {max_line} lines of main.ts")
else:
    print("Could not find main.ts in logs.")
