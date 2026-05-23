import re

with open(r'C:\Users\周洪全\.gemini\antigravity\brain\0dce3c38-c054-4196-be06-1ca59fc025dd\.system_generated\logs\overview.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Find all view_file outputs for src/main.ts
# It looks like:
# File Path: ile:///e:/Work/Code/Web/Gold/src/main.ts
# ...
# Showing lines X to Y
# ... <line_number>: <original_line>

lines = text.split('\n')
capturing = False
main_ts_lines = {}
for line in lines:
    if line.startswith('File Path: ile:///e:/Work/Code/Web/Gold/src/main.ts'):
        pass # we are near
    match = re.match(r'^(\d+): (.*)', line)
    if match:
        line_num = int(match.group(1))
        content = match.group(2)
        main_ts_lines[line_num] = content

with open('src/main_recovered.ts', 'w', encoding='utf-8') as f:
    max_line = max(main_ts_lines.keys()) if main_ts_lines else 0
    for i in range(1, max_line + 1):
        f.write(main_ts_lines.get(i, '// MISSING LINE') + '\n')
print(f"Recovered {len(main_ts_lines)} lines.")
