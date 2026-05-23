import re
import os

log_path = r'C:\Users\周洪全\.gemini\antigravity\brain\0dce3c38-c054-4196-be06-1ca59fc025dd\.system_generated\logs\overview.txt'

print("Size:", os.path.getsize(log_path))

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

lines = text.split('\n')
best_main_ts = {}
current_file_lines = {}
is_main_ts = False

for line in lines:
    if 'src/main.ts' in line:
        print("Found line mentioning main.ts:", line[:100])
    if 'File Path:' in line and 'main.ts' in line:
        is_main_ts = True
        current_file_lines = {}
        print("Started capturing main.ts block")
        continue
    
    if is_main_ts:
        match = re.match(r'^(\d+): (.*)', line)
        if match:
            line_num = int(match.group(1))
            content = match.group(2)
            current_file_lines[line_num] = content
        elif line.startswith('The above content'):
            is_main_ts = False
            print("Ended capturing, found", len(current_file_lines), "lines")
            if len(current_file_lines) > len(best_main_ts):
                best_main_ts.update(current_file_lines)

if best_main_ts:
    with open('src/main_recovered.ts', 'w', encoding='utf-8') as f:
        max_line = max(best_main_ts.keys())
        for i in range(1, max_line + 1):
            f.write(best_main_ts.get(i, '') + '\n')
    print(f"Recovered {max_line} lines of main.ts")
else:
    print("Could not find main.ts in logs.")
