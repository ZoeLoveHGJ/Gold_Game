import json
import re

log_path = r'C:\Users\周洪全\.gemini\antigravity\brain\0dce3c38-c054-4196-be06-1ca59fc025dd\.system_generated\logs\overview.txt'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

best_content = ""
blocks = text.split('\n')
for block in blocks:
    if not block.strip(): continue
    if not block.startswith('{'): continue
    try:
        data = json.loads(block)
        if 'content' in data:
            content = data['content']
            if 'main.ts' in content.lower() and 'The following code has been modified' in content:
                # We found a view_file output!
                if len(content) > len(best_content):
                    best_content = content
    except:
        pass

if best_content:
    lines = best_content.split('\n')
    recovered = []
    for line in lines:
        match = re.match(r'^(\d+): (.*)', line)
        if match:
            recovered.append((int(match.group(1)), match.group(2)))
    
    if recovered:
        recovered.sort(key=lambda x: x[0])
        with open('src/main_recovered.ts', 'w', encoding='utf-8') as f:
            for n, l in recovered:
                f.write(l + '\n')
        print(f"Recovered {len(recovered)} lines!")
    else:
        print("Failed to parse lines from content.")
else:
    print("Could not find content in JSON.")
