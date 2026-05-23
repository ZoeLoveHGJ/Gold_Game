import re

log_path = r'C:\Users\周洪全\.gemini\antigravity\brain\bcabca1c-45c3-4494-af9c-5951af4d39f0\.system_generated\logs\overview.txt'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

lines = text.split('\n')
best_main_ts = {}
current_file_lines = {}
is_main_ts = False

for line in lines:
    if 'File Path: ile:///e:/Work/Code/Web/Gold/src/main.ts' in line.lower():
        is_main_ts = True
        current_file_lines = {}
    
    if is_main_ts:
        match = re.match(r'^(\d+): (.*)', line)
        if match:
            line_num = int(match.group(1))
            content = match.group(2)
            current_file_lines[line_num] = content
        elif line.startswith('The above content'):
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
